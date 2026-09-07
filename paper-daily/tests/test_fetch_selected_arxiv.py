import sys
from pathlib import Path


sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "scripts"))

from fetch_selected_arxiv import extension_for, figure_candidates, image_dimensions


def test_figure_candidates_accepts_alphanumeric_figure_numbers():
    page_html = """
    <figure>
      <img src="architecture.png" />
      <figcaption>Figure 7a: Method architecture overview.</figcaption>
    </figure>
    <figure>
      <img src="result.png" />
      <figcaption>Figure 2: Quantitative result.</figcaption>
    </figure>
    """

    candidates = figure_candidates(page_html, "https://arxiv.org/html/2609.00001v1")

    assert {candidate["figure_number"] for candidate in candidates} == {"7a", "2"}


def test_svg_dimensions_and_extension_are_supported():
    svg = b'<svg viewBox="0 0 1200 640" xmlns="http://www.w3.org/2000/svg"></svg>'

    assert image_dimensions(svg) == (1200, 640)
    assert extension_for("https://arxiv.org/html/2609.00001v1/architecture.svg", "image/svg+xml") == ".svg"
