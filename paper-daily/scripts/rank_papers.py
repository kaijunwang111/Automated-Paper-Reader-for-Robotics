"""High-recall routing for paper candidates.

This module deliberately does not estimate paper quality.  It assigns a recall
tier from topic context, keeps decisive matches from being crowded out, and
leaves quality judgment to the title/abstract triage and full-text review.
"""

from __future__ import annotations

import re
from datetime import date
from functools import lru_cache
from typing import Any

from utils import paper_display_date, validate_paper_schema


DEFAULT_CONCEPT_GROUPS: dict[str, list[str]] = {
    "manipulation": [
        "robot manipulation",
        "robotic manipulation",
        "manipulation skill",
        "manipulation policy",
        "dexterous manipulation",
        "bimanual manipulation",
        "mobile manipulation",
        "loco manipulation",
    ],
    "vla_wam": [
        "vision language action",
        "vision-language-action",
        "vla",
        "world action model",
        "world-action model",
        "wam",
        "robot foundation model",
        "generalist robot policy",
    ],
    "world_model": [
        "world model",
        "world modeling",
        "world modelling",
        "action conditioned video model",
        "forward dynamics model",
        "predictive video model",
        "video world model",
    ],
    "robot_learning": [
        "robot learning",
        "robot policy",
        "robot skill",
        "visuomotor policy",
        "imitation learning",
        "behavior cloning",
        "diffusion policy",
        "flow matching policy",
        "reinforcement learning",
    ],
    "tactile_contact": [
        "tactile",
        "haptic",
        "force feedback",
        "force torque",
        "contact rich",
        "contact-rich",
    ],
    "human_robot_transfer": [
        "human video",
        "human demonstration",
        "egocentric video",
        "observational learning",
        "one shot visual imitation",
        "one-shot visual imitation",
        "video to robot",
        "human to robot",
        "cross embodiment",
        "cross-embodiment",
    ],
    "whole_body_humanoid": [
        "whole body control",
        "whole-body control",
        "humanoid manipulation",
        "humanoid policy",
        "loco manipulation",
        "loco-manipulation",
    ],
    "memory_reasoning": [
        "robot memory",
        "episodic memory",
        "spatial memory",
        "semantic memory",
        "embodied reasoning",
        "chain of thought",
        "subtask decomposition",
        "hierarchical policy",
    ],
    "robot_data": [
        "robot data",
        "data curation",
        "data quality",
        "data selection",
        "data augmentation",
        "synthetic robot data",
        "online correction",
        "human correction",
        "umi",
    ],
    "transferable_method": [
        "representation learning",
        "masked modeling",
        "self supervised learning",
        "self-supervised learning",
        "test time adaptation",
        "test-time adaptation",
        "continual learning",
        "domain generalization",
        "uncertainty estimation",
        "multimodal alignment",
        "spatiotemporal modeling",
    ],
}

CORE_CONCEPTS = {
    "manipulation",
    "vla_wam",
    "world_model",
    "robot_learning",
    "tactile_contact",
    "human_robot_transfer",
    "whole_body_humanoid",
}

ROBOT_CONTEXT_TERMS = [
    "robot",
    "robotic",
    "manipulation",
    "visuomotor",
    "embodied",
    "humanoid",
    "dexterous",
    "end effector",
    "gripper",
]

ACTION_CONTEXT_TERMS = [
    "action",
    "control",
    "policy",
    "skill",
    "learning",
    "trajectory",
    "planning",
]

TIER_PRIORITY = {"P0": 3, "P1": 2, "P2": 1, "reject": 0}


def build_candidate_pool(
    papers: list[dict[str, Any]],
    research_profile: dict[str, Any],
    target_date: date,
    candidate_limit: int = 200,
) -> list[dict[str, Any]]:
    """Return one day's bounded high-recall pool without keyword-count ranking."""

    routed = [
        score_candidate_rules(validate_paper_schema(paper), research_profile, target_date)
        for paper in papers
    ]
    retained = [paper for paper in routed if paper.get("recall_tier") != "reject"]
    retained.sort(key=candidate_sort_key, reverse=True)
    return [candidate_schema(paper) for paper in retained[:candidate_limit]]


def candidate_sort_key(paper: dict[str, Any]) -> tuple[int, int, str, str]:
    """Sort by recall protection and date; concept count is intentionally absent."""

    return (
        TIER_PRIORITY.get(str(paper.get("recall_tier")), 0),
        1 if paper.get("tracked_org_signal") in {"tracked-led", "tracked-collaboration"} else 0,
        str(paper.get("published_at") or paper.get("updated_at") or ""),
        str(paper.get("title") or ""),
    )


def score_candidate_rules(
    paper: dict[str, Any],
    research_profile: dict[str, Any],
    target_date: date,
) -> dict[str, Any]:
    """Annotate recall evidence; never treat keyword volume as paper quality."""

    text = scoring_text(paper)
    concept_groups = research_profile.get("concept_groups") or DEFAULT_CONCEPT_GROUPS
    matched_concepts = [
        name
        for name, expressions in concept_groups.items()
        if has_any_term(text, [str(value) for value in expressions])
    ]
    matched_keywords = unique_keyword_matches(text, research_profile.get("positive_keywords", []))
    negative_matches = unique_keyword_matches(text, research_profile.get("negative_keywords", []))
    tracked_org_signal = normalize_tracked_org_signal(paper)
    recall_tier, protected_reasons = classify_recall_tier(
        paper,
        text,
        matched_concepts,
        negative_matches,
        tracked_org_signal,
    )

    # Compatibility fields remain binary/ordinal so older consumers keep
    # working. They are not additive keyword or quality scores.
    keyword_score = 1.0 if matched_keywords else 0.0
    retrieval_relevance = float(TIER_PRIORITY[recall_tier])
    freshness_score = compute_freshness_score(paper, target_date)

    annotated = dict(paper)
    annotated.update(
        {
            "keyword_score": keyword_score,
            "coarse_retrieval_score": retrieval_relevance,
            "retrieval_relevance": retrieval_relevance,
            "freshness_score": round(freshness_score, 3),
            "category_score": 0.0,
            "topic_combo_bonus": 0.0,
            "retrieval_penalty": -1.0 if negative_matches else 0.0,
            "matched_keywords": matched_keywords,
            "matched_concepts": matched_concepts,
            "negative_matches": negative_matches,
            "recall_tier": recall_tier,
            "protected_recall_reasons": protected_reasons,
            "tracked_org_signal": tracked_org_signal,
            "retrieval_reason": build_retrieval_reason(
                paper,
                matched_concepts,
                negative_matches,
                recall_tier,
                tracked_org_signal,
            ),
        }
    )
    return annotated


def classify_recall_tier(
    paper: dict[str, Any],
    text: str,
    matched_concepts: list[str],
    negative_matches: list[str],
    tracked_org_signal: str,
) -> tuple[str, list[str]]:
    if negative_matches:
        return "reject", ["matched configured negative scenario"]

    categories = set(paper.get("categories", []))
    has_robot_context = has_any_term(text, ROBOT_CONTEXT_TERMS)
    has_action_context = has_any_term(text, ACTION_CONTEXT_TERMS)
    decisive = any(name in CORE_CONCEPTS for name in matched_concepts)
    reasons: list[str] = []

    if decisive and ("cs.RO" in categories or has_robot_context):
        reasons.append("decisive embodied-robotics concept in robot context")
        if tracked_org_signal != "none":
            reasons.append(f"verified tracked-organization prior: {tracked_org_signal}")
        return "P0", reasons

    if "cs.RO" in categories and has_robot_context and has_action_context:
        reasons.append("cs.RO paper with robot and action/skill context")
        if tracked_org_signal != "none":
            reasons.append(f"verified tracked-organization prior: {tracked_org_signal}")
        return "P0", reasons

    if matched_concepts and ("cs.RO" in categories or has_robot_context):
        reasons.append("robotics paper with a transferable concept")
        return "P1", reasons

    if "cs.RO" in categories or matched_concepts:
        reasons.append("broad robotics or adjacent-method candidate")
        return "P2", reasons

    return "P2", ["broad configured-category candidate"]


def normalize_tracked_org_signal(paper: dict[str, Any]) -> str:
    value = str(paper.get("tracked_org_signal") or "none")
    if value in {"tracked-led", "tracked-collaboration"}:
        return value
    return "none"


def candidate_schema(paper: dict[str, Any]) -> dict[str, Any]:
    fields = [
        "id",
        "source",
        "title",
        "authors",
        "abstract",
        "url",
        "pdf_url",
        "published_at",
        "updated_at",
        "venue",
        "categories",
        "recall_tier",
        "retrieval_relevance",
        "matched_concepts",
        "protected_recall_reasons",
        "tracked_org_signal",
        "retrieval_reason",
        "matched_keywords",
        "negative_matches",
        "keyword_score",
        "coarse_retrieval_score",
    ]
    list_fields = {
        "authors",
        "categories",
        "matched_concepts",
        "protected_recall_reasons",
        "matched_keywords",
        "negative_matches",
    }
    return {field: paper.get(field, [] if field in list_fields else "") for field in fields}


def build_retrieval_reason(
    paper: dict[str, Any],
    matched_concepts: list[str],
    negative_matches: list[str],
    recall_tier: str,
    tracked_org_signal: str,
) -> str:
    parts = [f"recall tier: {recall_tier}"]
    if matched_concepts:
        parts.append("matched concept groups: " + ", ".join(matched_concepts))
    else:
        parts.append("broad configured-category candidate")
    categories = paper.get("categories", [])
    if categories:
        parts.append("categories: " + ", ".join(categories[:5]))
    if negative_matches:
        parts.append("configured negative scenario: " + ", ".join(negative_matches[:4]))
    if tracked_org_signal != "none":
        parts.append(f"tracked organization prior: {tracked_org_signal}")
    parts.append("requires semantic triage; keyword volume is not a quality score")
    return "; ".join(parts)


def unique_keyword_matches(text: str, keywords: list[str]) -> list[str]:
    return [str(keyword) for keyword in keywords if contains_keyword(text, str(keyword))]


def scoring_text(paper: dict[str, Any]) -> str:
    pieces = [
        paper.get("title", ""),
        paper.get("abstract", ""),
        paper.get("venue", ""),
        " ".join(paper.get("categories", [])),
    ]
    return " ".join(str(piece).lower() for piece in pieces if piece)


@lru_cache(maxsize=4096)
def normalize_for_matching(value: str) -> str:
    text = value.lower().replace("–", "-").replace("—", "-")
    text = re.sub(r"(?<=\w)-(?=\w)", " ", text)
    text = re.sub(r"\brobot(?:s|ic|ics)?\b", "robot", text)
    text = re.sub(r"\bmodels?\b|\bmodel(?:ing|ling)\b", "model", text)
    text = re.sub(r"\bskills\b", "skill", text)
    text = re.sub(r"\bactions\b", "action", text)
    text = re.sub(r"\bpolicies\b", "policy", text)
    text = re.sub(r"[^a-z0-9]+", " ", text)
    return re.sub(r"\s+", " ", text).strip()


def contains_keyword(text: str, keyword: str) -> bool:
    normalized_text = normalize_for_matching(text)
    normalized_keyword = normalize_for_matching(keyword)
    if not normalized_keyword:
        return False
    pattern = rf"(?<![a-z0-9]){re.escape(normalized_keyword)}(?![a-z0-9])"
    return re.search(pattern, normalized_text) is not None


def has_any_term(text: str, terms: list[str]) -> bool:
    return any(contains_keyword(text, term) for term in terms)


def compute_freshness_score(paper: dict[str, Any], target_date: date) -> float:
    dt = paper_display_date(paper)
    if not dt:
        return 0.25
    delta_days = (target_date - dt.date()).days
    if delta_days <= 0:
        return 1.0
    if delta_days == 1:
        return 0.75
    if delta_days == 2:
        return 0.5
    return 0.0
