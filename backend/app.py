from __future__ import annotations

import sqlite3
from datetime import datetime, timezone
from pathlib import Path

from flask import Flask, jsonify, request


BASE_DIR = Path(__file__).resolve().parent
DB_PATH = BASE_DIR / "reviews.db"

app = Flask(__name__)


def get_connection() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db() -> None:
    with get_connection() as conn:
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS reviews (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
                feedback TEXT NOT NULL,
                created_at TEXT NOT NULL
            )
            """
        )
        conn.commit()


@app.after_request
def add_cors_headers(response):
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type"
    response.headers["Access-Control-Allow-Methods"] = "GET,POST,OPTIONS"
    return response


@app.route("/api/reviews", methods=["OPTIONS"])
def preflight_reviews():
    return ("", 204)


@app.post("/api/reviews")
def create_review():
    payload = request.get_json(silent=True) or {}
    rating = payload.get("rating")
    feedback = str(payload.get("feedback", "")).strip()

    if not isinstance(rating, int) or rating < 1 or rating > 5:
        return jsonify({"error": "rating must be an integer between 1 and 5"}), 400

    # Keep feedback mandatory for low ratings, optional otherwise.
    if rating <= 3 and not feedback:
        return jsonify({"error": "feedback is required for 1-3 star ratings"}), 400

    now = datetime.now(timezone.utc).isoformat()
    with get_connection() as conn:
        cursor = conn.execute(
            "INSERT INTO reviews (rating, feedback, created_at) VALUES (?, ?, ?)",
            (rating, feedback, now),
        )
        conn.commit()
        review_id = cursor.lastrowid

    return (
        jsonify(
            {
                "id": review_id,
                "rating": rating,
                "feedback": feedback,
                "created_at": now,
            }
        ),
        201,
    )


@app.get("/api/reviews")
def list_reviews():
    with get_connection() as conn:
        rows = conn.execute(
            "SELECT id, rating, feedback, created_at FROM reviews ORDER BY id DESC"
        ).fetchall()

    return jsonify([dict(row) for row in rows])


if __name__ == "__main__":
    init_db()
    app.run(host="127.0.0.1", port=5000, debug=True)
