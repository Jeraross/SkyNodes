from pathlib import Path

_BASE = Path(__file__).parent.parent

CSV_AEROPORTOS = str(_BASE / "data" / "aeroportos_data.csv")
CSV_ADJACENCIAS = str(_BASE / "data" / "adjacencias_aeroportos.csv")
