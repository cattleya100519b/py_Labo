"""
jinjaで書いた静的HTMLを動的にする

Flaskサーバが常駐する限り、ブラウザからのリクエストの度にページ内のデータが更新される。
http://127.0.0.1:5000/ で開く
"""

from flask import Flask, render_template
import csv
from pathlib import Path

app = Flask(__name__)
BASE_DIR = Path(__file__).parent

def load_csv():
    csv_path = BASE_DIR / "data" / "sample_jinja.csv"
    data = []
    with open(csv_path, encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            row["size"] = int(row["size"])
            data.append(row)
    return data

@app.route("/")
def index():
    files = load_csv()
    return render_template("report.html", title="CSVレポート（動的）", files=files)

if __name__ == "__main__":
    app.run(debug=True)