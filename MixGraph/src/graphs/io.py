from __future__ import annotations

import csv
from pathlib import Path
from typing import Dict, List, Sequence


AIRPORT_REQUIRED_COLUMNS = ("iata", "cidade", "regiao")


def load_csv_rows(file_path: str, delimiter: str | None = None) -> List[Dict[str, str]]:
    path = Path(file_path)
    if not path.exists():
        raise FileNotFoundError(f"CSV nao encontrado: {file_path}")

    with path.open("r", encoding="utf-8-sig", newline="") as csv_file:
        if delimiter is None:
            sample = csv_file.read(2048)
            csv_file.seek(0)
            try:
                delimiter = csv.Sniffer().sniff(sample, delimiters=",;").delimiter
            except csv.Error:
                delimiter = ","

        reader = csv.DictReader(csv_file, delimiter=delimiter)
        if not reader.fieldnames:
            raise ValueError("CSV sem cabecalho")

        normalized_fieldnames = [field.strip().lower() for field in reader.fieldnames]
        reader.fieldnames = normalized_fieldnames

        rows = [{key: (value or "").strip() for key, value in row.items()} for row in reader]

    if not rows:
        raise ValueError("CSV sem linhas de dados")

    return rows


def validate_airports_csv(
    file_path: str, required_columns: Sequence[str] = AIRPORT_REQUIRED_COLUMNS
) -> List[Dict[str, str]]:
    rows = load_csv_rows(file_path)
    normalized_required_columns = [col.strip().lower() for col in required_columns]

    missing = [col for col in normalized_required_columns if col not in rows[0].keys()]
    if missing:
        missing_cols = ", ".join(missing)
        raise ValueError(f"CSV invalido. Colunas ausentes: {missing_cols}")

    seen_iata = set()
    for index, row in enumerate(rows, start=2):
        iata = row["iata"].upper()
        cidade = row["cidade"]
        regiao = row["regiao"]

        if not iata or not cidade or not regiao:
            raise ValueError(
                f"CSV invalido na linha {index}. Campos iata, cidade e regiao sao obrigatorios"
            )

        if iata in seen_iata:
            raise ValueError(f"CSV invalido. IATA duplicado: {iata}")

        seen_iata.add(iata)
        row["iata"] = iata

    return rows


def load_airports(file_path: str) -> List[Dict[str, str]]:
    return validate_airports_csv(file_path)
