# Lab 13: Apache Solr Product Search

This repository contains the source code and project assets for the PDC Lab 13 open-ended lab on indexing, importing, and searching an e-commerce product catalog with Apache Solr and a Flask web interface.

## Project Structure

```text
lab13-solr-search/
|-- app.py
|-- requirements.txt
|-- README.md
|-- .gitignore
|-- conf/
|   |-- managed-schema.xml
|   `-- solrconfig.xml
|-- data/
|   `-- products.csv
|-- static/
|   |-- app.js
|   `-- style.css
`-- templates/
    `-- index.html
```

## Features

- Full-text product search with Apache Solr
- Faceted navigation by category and brand
- Price and stock filtering through Solr queries
- Relevance ranking with eDisMax field boosting
- Highlighting for matched terms
- Autocomplete suggestions in the Flask UI

## Requirements

- Python 3.10 or newer
- Apache Solr 9.x
- Java 17

## Setup Instructions

1. Start Apache Solr and create a core named `products_core`.
2. Copy the custom schema and Solr config changes from the `conf/` folder into the core configuration directory.
3. Place `products.csv` into the Solr import path or upload it through the Solr Admin UI.
4. Install Python dependencies:

```bash
pip install -r requirements.txt
```

5. Run the Flask app:

```bash
python app.py
```

6. Open the browser at:

```text
http://127.0.0.1:5000
```

## Solr Indexing Command

If your Solr core is running locally, you can import the dataset with:

```bash
curl "http://localhost:8983/solr/products_core/update?commit=true" \
  --data-binary @data/products.csv \
  -H "Content-type:application/csv"
```

## Screenshots

Add your output screenshots to a `screenshots/` folder before submitting the report to GitHub.

## GitHub Upload

After creating your repository, commit this folder and push it to GitHub. Add the repository link to your lab report.
