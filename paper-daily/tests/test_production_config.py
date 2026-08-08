from pathlib import Path

import yaml


def test_production_limits_and_sources():
    config_path = Path(__file__).resolve().parents[1] / "config.yaml"
    config = yaml.safe_load(config_path.read_text(encoding="utf-8"))

    assert config["sources"]["arxiv"]["enabled"] is True
    assert config["sources"]["arxiv"]["max_results"] >= 200
    assert config["sources"]["openreview"]["enabled"] is False
    assert config["sources"]["openalex"]["enabled"] is False
    assert config["retrieval"]["daily_candidate_limit"] == 200
    assert config["retrieval"]["window_candidate_limit"] is None
    assert config["retrieval"]["keyword_count_affects_priority"] is False
    assert config["reporting"]["per_day_selected_paper_limit"] is None
    assert config["reporting"]["window_selected_paper_limit_per_covered_day"] == 5
    assert config["reporting"]["daily_full_text_review_limit"] == 20
    assert config["reporting"]["monday_window_selected_paper_limit"] == 15
    assert config["reporting"]["friday_window_selected_paper_limit"] == 20
    assert config["reporting"]["allow_fewer_than_target"] is True
    assert config["semantic_triage"]["prohibit_keyword_count_scoring"] is True
    prior = config["personal_preference"]["tracked_organization_prior"]
    assert prior["may_break_fulltext_or_selection_ties"] is True
    assert prior["may_change_quality_evidence_scores"] is False
    assert prior["may_override_negative_filter"] is False


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


def test_formal_report_quality_gates_are_machine_checked():
    config_path = Path(__file__).resolve().parents[1] / "config.yaml"
    config = yaml.safe_load(config_path.read_text(encoding="utf-8"))

    gates = config["quality_monitoring"]
    artifacts = set(gates["required_artifacts"])
    assert {
        "window_candidates",
        "scored_review_record",
        "local_report",
        "public_paper_module",
        "figure_assets",
        "figure_manifest",
        "contact_sheet",
    } <= artifacts

    selection = gates["candidate_and_selection"]
    assert selection["require_selection_and_rejection_reasons"] is True
    assert selection["abstract_only_cannot_be_selected"] is True
    assert {
        "strong_transfer_value",
        "sufficient_closed_loop_or_multi_benchmark_evidence",
        "credible_baselines_and_ablations",
        "explicit_local_downgrade_note",
    } <= set(selection["no_real_robot_exception_requires"])

    content = gates["content_gates"]
    assert content["six_quick_cards_must_be_distinct"] is True
    assert {
        "setup",
        "direct_baseline",
        "key_result",
        "evidence_boundary",
    } <= set(content["experiment_card_requires"])
    assert content["exact_claims_must_be_source_traceable"] is True
    assert content["taxonomy_requires_primary_contribution_recheck"] is True

    consistency = gates["cross_artifact_consistency"]
    assert consistency["selected_ids_equal_public_paper_ids"] is True
    assert consistency["selected_ids_equal_manifest_paper_ids"] is True
    assert consistency["manifest_must_be_registered_in_website_test"] is True

    validation = gates["validation"]
    assert validation["require_python_tests"] is True
    assert validation["require_website_tests"] is True
    assert validation["require_contact_sheet_visual_review"] is True

    deployment = gates["deployment"]
    assert deployment["reuse_existing_sites_project"] is True
    assert deployment["archive_matches_pushed_commit"] is True
    assert deployment["require_succeeded_status"] is True
    assert deployment["verify_report_and_paper_routes_after_publish"] is True
    assert deployment["never_push_github_origin"] is True
