# BigQuery Release Notes Viewer

A lightweight web app built with Python Flask that fetches and displays the latest BigQuery release notes, with the ability to share updates directly to X (Twitter).

## Features

- Fetches live release notes from Google's official BigQuery XML feed
- Clean dark-themed card UI with release note titles, dates, and summaries
- Refresh button with animated spinner and last-updated timestamp
- Skeleton loaders while data is being fetched
- Share any release note to X/Twitter with a pre-filled tweet (title + link + hashtags)
- Live character counter in the tweet modal (warns at 240, red at 280)
- Error banner if the feed is unreachable
- Keyboard support — press `Esc` or click outside to close the tweet modal

## Project Structure

```
bq-release-notes/
├── app.py               # Flask backend — fetches and parses the XML feed
├── requirements.txt     # Python dependencies
├── templates/
│   └── index.html       # App shell with header, cards, tweet modal
└── static/
    ├── style.css        # Dark theme, glass UI, skeleton loaders, animations
    └── app.js           # Fetch, render, refresh logic + tweet modal
```

## Prerequisites

- Python 3.8+
- pip

## Setup & Installation

**1. Clone or download the project:**
```cmd
cd C:\Users\Ayush\bq-release-notes
```

**2. Create a virtual environment:**
```cmd
python -m venv .venv
```

**3. Activate it:**
```cmd
.venv\Scripts\activate
```

**4. Install dependencies:**
```cmd
pip install -r requirements.txt
```

## Running the App

```cmd
.venv\Scripts\python.exe app.py
```

Then open your browser and go to:
```
http://127.0.0.1:5000
```

> **Note:** Keep the terminal window open while using the app. Closing it stops the server.

## Usage

| Action | How |
|--------|-----|
| View release notes | Open `http://127.0.0.1:5000` |
| Refresh feed | Click the **Refresh** button |
| Share an update | Click **Share** on any card → edit tweet → click **Post Tweet** |
| Close tweet modal | Press `Esc` or click outside the modal |

## Data Source

Release notes are fetched from Google's official feed:
```
https://docs.cloud.google.com/feeds/bigquery-release-notes.xml
```

## Built With

- [Python Flask](https://flask.palletsprojects.com/) — Backend server
- Vanilla HTML, CSS, JavaScript — Frontend (no frameworks)
- Google BigQuery XML Feed — Data source

## How It Was Built

This app was vibe-coded using **Antigravity CLI** (`agy`) as part of the Google Kaggle 5-Day AI Intensive course. The entire application — backend, frontend, styling, and dependencies — was generated from a single natural language prompt.

## Limitations

- Runs locally only (`localhost`) — not accessible from other devices or the internet
- Requires an active internet connection to fetch the XML feed
- To deploy publicly, use a service like Google Cloud Run, Railway, or Render
