import xml.etree.ElementTree as ET
from flask import Flask, jsonify, render_template
import requests

app = Flask(__name__)

FEED_URL = "https://docs.cloud.google.com/feeds/bigquery-release-notes.xml"

NAMESPACES = {
    "atom": "http://www.w3.org/2005/Atom",
}


def parse_feed(xml_text: str) -> list[dict]:
    root = ET.fromstring(xml_text)
    entries = []
    for entry in root.findall("atom:entry", NAMESPACES):
        title_el = entry.find("atom:title", NAMESPACES)
        summary_el = entry.find("atom:summary", NAMESPACES)
        updated_el = entry.find("atom:updated", NAMESPACES)
        link_el = entry.find("atom:link", NAMESPACES)

        title = title_el.text if title_el is not None else "No title"
        summary = summary_el.text if summary_el is not None else ""
        updated = updated_el.text if updated_el is not None else ""
        link = link_el.get("href", "#") if link_el is not None else "#"

        entries.append(
            {
                "title": title,
                "summary": summary,
                "updated": updated,
                "link": link,
            }
        )
    return entries


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/api/release-notes")
def release_notes():
    try:
        resp = requests.get(FEED_URL, timeout=15)
        resp.raise_for_status()
        entries = parse_feed(resp.text)
        return jsonify({"ok": True, "entries": entries})
    except Exception as exc:
        return jsonify({"ok": False, "error": str(exc)}), 500


if __name__ == "__main__":
    app.run(debug=True, port=5000)
