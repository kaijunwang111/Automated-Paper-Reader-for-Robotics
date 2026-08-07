import sys
from datetime import date
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "scripts"))

from rank_papers import score_candidate_rules


PROFILE = {
    "positive_keywords": [
        "representation learning",
        "self-supervised learning",
        "state space model",
        "sequence modeling",
        "test-time adaptation",
        "uncertainty estimation",
        "calibration",
        "reranking",
        "language model",
    ],
    "negative_keywords": ["protein folding", "recommender system"],
    "arxiv_categories": ["cs.LG", "cs.CV", "cs.CL", "stat.ML"],
}


def test_method_routing_records_concepts_without_keyword_count_quality_scoring():
    method_paper = {
        "id": "1",
        "source": "arxiv",
        "title": "State Space Model for Sequence Modeling with Test-Time Adaptation",
        "abstract": "A self-supervised representation learning method for long-context temporal modeling under distribution shift.",
        "categories": ["cs.LG", "stat.ML"],
        "published_at": "2026-05-14T00:00:00Z",
    }
    domain_only_paper = {
        "id": "2",
        "source": "arxiv",
        "title": "A Narrow Domain Dataset Report",
        "abstract": "A descriptive dataset note with no new modeling method.",
        "categories": ["cs.DB"],
        "published_at": "2026-05-14T00:00:00Z",
    }

    method_score = score_candidate_rules(method_paper, PROFILE, date(2026, 5, 14))
    domain_score = score_candidate_rules(domain_only_paper, PROFILE, date(2026, 5, 14))

    assert method_score["recall_tier"] == "P2"
    assert domain_score["recall_tier"] == "P2"
    assert method_score["keyword_score"] == 1.0
    assert "state space model" in [item.lower() for item in method_score["matched_keywords"]]


def test_host_style_paper_is_protected_by_one_decisive_concept():
    paper = {
        "id": "2607.20033v1",
        "source": "arxiv",
        "title": "Robots Acquire Manipulation Skills in Seconds from a Single Human Video",
        "abstract": (
            "A robot acquires a new manipulation skill at inference time from one "
            "human video and executes it on a physical bimanual platform."
        ),
        "categories": ["cs.RO"],
        "published_at": "2026-07-22T11:20:05Z",
    }

    routed = score_candidate_rules(paper, PROFILE, date(2026, 7, 22))

    assert routed["recall_tier"] == "P0"
    assert "manipulation" in routed["matched_concepts"]
    assert "human_robot_transfer" in routed["matched_concepts"]


def test_repeating_many_keywords_does_not_accumulate_retrieval_score():
    once = {
        "id": "4",
        "source": "arxiv",
        "title": "Language Model Calibration",
        "abstract": "A language model calibration method.",
        "categories": ["cs.CL"],
        "published_at": "2026-05-14T00:00:00Z",
    }
    repeated = dict(
        once,
        id="5",
        abstract="language model calibration reranking uncertainty estimation " * 20,
    )

    routed_once = score_candidate_rules(once, PROFILE, date(2026, 5, 14))
    routed_repeated = score_candidate_rules(repeated, PROFILE, date(2026, 5, 14))

    assert routed_once["keyword_score"] == routed_repeated["keyword_score"] == 1.0
    assert routed_once["coarse_retrieval_score"] == routed_repeated["coarse_retrieval_score"]


def test_freshness_score_decreases_for_older_paper():
    fresh = {
        "id": "1",
        "source": "arxiv",
        "title": "sequence modeling with uncertainty estimation",
        "abstract": "",
        "categories": [],
        "published_at": "2026-05-14T00:00:00Z",
    }
    older = dict(fresh, id="2", published_at="2026-05-12T00:00:00Z")

    fresh_score = score_candidate_rules(fresh, PROFILE, date(2026, 5, 14))
    older_score = score_candidate_rules(older, PROFILE, date(2026, 5, 14))

    assert fresh_score["freshness_score"] > older_score["freshness_score"]


def test_acronym_matching_does_not_match_inside_words():
    paper = {
        "id": "3",
        "source": "arxiv",
        "title": "Few-shot action recognition with language models",
        "abstract": "A computer vision benchmark for recognition.",
        "categories": ["cs.CV"],
        "published_at": "2026-05-14T00:00:00Z",
    }

    scored = score_candidate_rules(paper, PROFILE, date(2026, 5, 14))

    assert "ECoG" not in scored["matched_keywords"]
    assert scored["retrieval_penalty"] == 0
