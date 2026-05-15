# MkDocs Local Setup

This project uses [MkDocs](https://www.mkdocs.org/) with the following plugins:

- Material theme
- Static i18n (internationalization)
- Open links in new tab

---

## Prerequisites

Make sure you have:

- Python 3.x
- pip (or pip3)

---

## Install dependencies

```bash
pip install mkdocs-material "mkdocs-static-i18n[material]" mkdocs-open-in-new-tab
```

## Running the documentation locally

```bash
mkdocs serve
```

Once running, open your browser at [http://127.0.0.1:8000](http://127.0.0.1:8000)