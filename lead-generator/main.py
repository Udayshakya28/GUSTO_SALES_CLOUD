import praw
import psycopg2
import os
import time
import threading
from textblob import TextBlob
from flask import Flask, jsonify, request

# --- Configuration ---
REDDIT_CLIENT_ID = os.environ.get("REDDIT_CLIENT_ID")
REDDIT_CLIENT_SECRET = os.environ.get("REDDIT_CLIENT_SECRET")
REDDIT_USER_AGENT = os.environ.get("REDDIT_USER_AGENT")
DATABASE_URL = os.environ.get("DATABASE_URL")

TARGET_SUBREDDITS = ["forhire", "jobbit", "jobs4bitcoins", "freelance_for_hire"]
SEARCH_KEYWORDS = [
    "looking for a web developer",
    "need a website built",
    "hiring a freelance developer",
    "help with a web project",
]

# --- Database, Sentiment, Scoring Functions (Same as before) ---
def get_db_connection():
    return psycopg2.connect(DATABASE_URL)

def get_sentiment(text):
    return TextBlob(text).sentiment.polarity

def is_relevant(post):
    if get_sentiment(post.title + " " + post.selftext) <= 0:
        return False
    return True

def score_lead(post):
    score = 0
    score += post.score
    score += post.num_comments * 2
    return score

# --- Lead Discovery Logic ---
def find_leads(is_manual_trigger=False):
    """
    Main function to find and process leads.
    Accepts a flag to indicate if it's a manual run.
    """
    print(f"Starting lead search... (Manual: {is_manual_trigger})")
    reddit = praw.Reddit(
        client_id=REDDIT_CLIENT_ID,
        client_secret=REDDIT_CLIENT_SECRET,
        user_agent=REDDIT_USER_AGENT,
    )
    conn = get_db_connection()
    cur = conn.cursor()

    # Create the leads table if it doesn't exist
    cur.execute("""
        CREATE TABLE IF NOT EXISTS leads (
            id SERIAL PRIMARY KEY,
            score INTEGER,
            title TEXT,
            subreddit TEXT,
            url TEXT UNIQUE,  -- Make URL unique to avoid duplicates
            author TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    """)
    conn.commit()
    
    found_leads_count = 0
    for subreddit_name in TARGET_SUBREDDITS:
        subreddit = reddit.subreddit(subreddit_name)
        for keyword in SEARCH_KEYWORDS:
            try:
                for post in subreddit.search(keyword, sort="new", time_filter="week"):
                    if is_relevant(post):
                        lead_score = score_lead(post)
                        # Use INSERT ... ON CONFLICT DO NOTHING to prevent duplicate leads
                        cur.execute(
                            "INSERT INTO leads (score, title, subreddit, url, author) VALUES (%s, %s, %s, %s, %s) ON CONFLICT (url) DO NOTHING",
                            (
                                lead_score,
                                post.title,
                                post.subreddit.display_name,
                                post.url,
                                post.author.name if post.author else "N/A",
                            ),
                        )
                        if cur.rowcount > 0: # rowcount is 1 if inserted, 0 if conflict
                            found_leads_count += 1
                conn.commit()
            except Exception as e:
                print(f"An error occurred while searching in r/{subreddit_name}: {e}")

    print(f"Finished search. Found {found_leads_count} new leads.")
    cur.close()
    conn.close()
    return {"message": "Lead discovery finished.", "newLeads": found_leads_count}


# --- Flask API ---
app = Flask(__name__)

@app.route("/trigger-scan", methods=["POST"])
def trigger_scan():
    """API endpoint to manually trigger the lead scan."""
    # Note: For a more robust system, you might run this in a separate thread
    # so the API can respond immediately. For simplicity, we run it directly.
    result = find_leads(is_manual_trigger=True)
    return jsonify(result), 200

@app.route("/health", methods=["GET"])
def health_check():
    """Health check endpoint for Render."""
    return "OK", 200

# --- Scheduler for Automated Runs ---
def run_scheduler():
    """Runs the find_leads function on a schedule."""
    while True:
        find_leads(is_manual_trigger=False)
        # Sleep for 15 minutes (900 seconds)
        time.sleep(900)

if __name__ == "__main__":
    # Run the automated scheduler in a background thread
    scheduler_thread = threading.Thread(target=run_scheduler)
    scheduler_thread.daemon = True
    scheduler_thread.start()

    # Run the Flask app in the main thread
    # The port should be 10000 for Render's internal services
    app.run(host="0.0.0.0", port=10000)