#!/usr/bin/env python3
"""players_master.csv için tasarım belgesindeki rating normalizasyonunu uygular."""
from __future__ import annotations

import csv
import sys
from pathlib import Path


def number(row: dict[str, str], key: str) -> float:
    try:
        return float(row.get(key, "0") or 0)
    except ValueError:
        return 0.0


def raw_score(row: dict[str, str]) -> float:
    return (
        number(row, "ballon_dor_wins") * 25
        + number(row, "ballon_dor_nominations") * 10
        + number(row, "world_cup_wins") * 20
        + number(row, "continental_club_wins") * 15
        + (number(row, "national_caps") / 10) * 2
        + number(row, "league_titles") * 3
        + (number(row, "wiki_language_count") / 10)
    )


def main() -> int:
    if len(sys.argv) != 3:
        print("Kullanım: python rating_from_csv.py input.csv output.csv")
        return 2

    source = Path(sys.argv[1])
    target = Path(sys.argv[2])
    with source.open("r", encoding="utf-8-sig", newline="") as handle:
        rows = list(csv.DictReader(handle))
    if not rows:
        raise SystemExit("CSV boş.")

    scores = [raw_score(row) for row in rows]
    minimum, maximum = min(scores), max(scores)
    span = maximum - minimum or 1

    for row, score in zip(rows, scores):
        row["raw_score"] = f"{score:.2f}"
        row["computed_rating"] = str(round(40 + ((score - minimum) / span) * 59))

    fieldnames = list(rows[0].keys())
    for name in ("raw_score", "computed_rating"):
        if name not in fieldnames:
            fieldnames.append(name)

    with target.open("w", encoding="utf-8-sig", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)
    print(f"{len(rows)} oyuncu yazıldı: {target}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
