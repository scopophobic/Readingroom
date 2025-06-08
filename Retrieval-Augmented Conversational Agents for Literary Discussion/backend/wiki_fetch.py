import wikipedia
import os
import json

def fetch_wikipedia_summary(book_title, book_id, author=None):
    try:
        query = f"{book_title} {author}" if author else book_title
        page = wikipedia.page(query)  # ⬅️ Get full Wikipedia page object
        content = page.content        # ⬅️ This gives full article (not just intro)
        url = page.url
    except wikipedia.DisambiguationError as e:
        return {
            "error": "disambiguation",
            "options": e.options[:5]
        }
    except wikipedia.PageError:
        return {
            "error": "not_found",
            "message": f"Wikipedia page for '{query}' not found."
        }

    book_dir = f"data/{book_id}"
    os.makedirs(book_dir, exist_ok=True)

    with open(f"{book_dir}/summary.json", "w") as f:
        json.dump({
            "book_title": page.title,
            "url": url,
            "content": content
        }, f)

    return {
        "title": page.title,
        "url": url,
        "preview": content[:500] + "...",  # Optional: show first 500 chars
        "stored": True
    }
