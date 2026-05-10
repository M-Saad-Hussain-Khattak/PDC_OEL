from flask import Flask, jsonify, render_template, request
from flask_cors import CORS
import requests
from requests.exceptions import RequestException


app = Flask(__name__)
CORS(app)

SOLR_URL = "http://localhost:8983/solr/products_core"
DEFAULT_ROWS = 10


def solr_select(params):
    response = requests.get(f"{SOLR_URL}/select", params=params, timeout=10)
    response.raise_for_status()
    return response.json()


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/search")
def search():
    q = request.args.get("q", "*:*" ).strip() or "*:*"
    category = request.args.get("category", "").strip()
    sort = request.args.get("sort", "score desc")
    page = max(int(request.args.get("page", 1)), 1)
    rows = DEFAULT_ROWS
    start = (page - 1) * rows

    params = {
        "q": q,
        "rows": rows,
        "start": start,
        "sort": sort,
        "hl": "true",
        "hl.fl": "product_name,description",
        "facet": "true",
        "facet.field": ["category", "brand"],
        "facet.mincount": 1,
        "wt": "json",
        "fl": "id,product_name,category,brand,price,rating,in_stock,description,score",
    }

    if category:
        params["fq"] = f'category:"{category}"'

    try:
        return jsonify(solr_select(params))
    except RequestException as exc:
        return jsonify({"error": f"Unable to reach Solr: {exc}"}), 502


@app.route("/autocomplete")
def autocomplete():
    q = request.args.get("q", "").strip()
    if len(q) < 2:
        return jsonify({"suggestions": []})

    params = {
        "q": f"product_name:{q}*",
        "fl": "product_name",
        "rows": 5,
        "wt": "json",
    }

    try:
        data = solr_select(params)
        suggestions = [doc["product_name"] for doc in data.get("response", {}).get("docs", [])]
        return jsonify({"suggestions": suggestions})
    except RequestException as exc:
        return jsonify({"suggestions": [], "error": f"Unable to reach Solr: {exc}"}), 502


if __name__ == "__main__":
    app.run(debug=True, port=5000)
