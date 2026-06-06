from pathlib import Path


QUESTION_BANK = Path(__file__).resolve().parents[1] / "banco_questoes" / "banco_questoes_grafos.csv"
DISPLAYED_COLUMNS = [2, 3, 4, 5, 6, 8]
FORBIDDEN_TERMS = ("slide", "slides", "aula", "pdf", "como foi visto")


def _rows():
    lines = QUESTION_BANK.read_text(encoding="utf-8").splitlines()
    return [line.split(";") for line in lines[1:] if line.strip()]


def test_graph_question_bank_is_parser_friendly():
    rows = _rows()

    assert len(rows) == 60
    for row in rows:
        assert len(row) >= 11
        assert row[7] in {"A", "B", "C", "D"}


def test_graph_question_bank_does_not_reference_source_material_to_learners():
    for row in _rows():
        displayed_text = " ".join(row[index] for index in DISPLAYED_COLUMNS).lower()
        for term in FORBIDDEN_TERMS:
            assert term not in displayed_text
