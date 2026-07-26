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
