"""KRT AI Terminal — Flask server (Render-ready)."""
import os
from flask import Flask, jsonify, render_template
from smart_client import build_dashboard

app = Flask(__name__)


@app.route("/")
def home():
    return render_template("index.html")


@app.route("/api/dashboard")
def dashboard():
    try:
        return jsonify(build_dashboard())
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/health")
def health():
    return {"status": "ok"}


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 10000))
    app.run(host="0.0.0.0", port=port)
