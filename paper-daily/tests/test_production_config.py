from pathlib import Path

import yaml


def test_production_limits_and_sources():
    config_path = Path(__file__).resolve().parents[1] / "config.yaml"
    config = yaml.safe_load(config_path.read_text(encoding="utf-8"))

    assert config["sources"]["arxiv"]["enabled"] is True
    assert config["sources"]["arxiv"]["max_results"] == 300
    assert config["sources"]["openreview"]["enabled"] is False
    assert config["sources"]["openalex"]["enabled"] is False
    assert config["retrieval"]["candidate_limit"] == 300
    assert config["reporting"]["selected_paper_count"] == 15
    assert config["reporting"]["full_text_review_limit"] == 30
    assert config["reporting"]["allow_fewer_than_target"] is True


def test_quality_filters_and_taxonomy_are_production_ready():
    config_path = Path(__file__).resolve().parents[1] / "config.yaml"
    config = yaml.safe_load(config_path.read_text(encoding="utf-8"))

    negative_keywords = set(config["research_profile"]["negative_keywords"])
    assert {"surgical robotics", "mining robotics", "laboratory automation"} <= negative_keywords
    assert config["research_profile"]["negative_keyword_penalty"] <= -8

    taxonomy = config["paper_taxonomy"]
    assert taxonomy["research_direction"]["memory_details_are_not_categories"] is True
    assert taxonomy["training_and_optimization"]["single_primary"] is True
    assert "Fine-tuning" not in taxonomy["training_and_optimization"]["values"]
    assert "RGB" in taxonomy["innovation_modality"]["omit_default_modalities"]
    assert "Language" in taxonomy["innovation_modality"]["omit_default_modalities"]
    assert taxonomy["robot_platform"]["combinable"] is True
