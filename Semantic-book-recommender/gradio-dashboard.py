import pandas as pd
import numpy as np
from dotenv import load_dotenv

from langchain_community.document_loaders import TextLoader
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_text_splitters import CharacterTextSplitter
from langchain_chroma import Chroma

import gradio as gr

load_dotenv()

books = pd.read_csv("books_with_emotions.csv")
books["large_thumbnail"]= books["thumbnail"] + "&fife=w800"
books["large_thumbnail"]= np.where(
    books["large_thumbnail"].isna(),
    "cover-not-found.jpg",
    books["large_thumbnail"],
)

raw_documents = TextLoader("tagged_description.txt", encoding="utf-8").load()
text_splitter = CharacterTextSplitter(chunk_size=0, chunk_overlap=0, separator="\n")
documents = text_splitter.split_documents(raw_documents)
huggingface_embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")
db_books = Chroma.from_documents(
    documents,
    embedding=huggingface_embeddings
)


def retrieve_semantic_recommendations(
        query: str,
        category: str = None,
        tone: str = None,
        initial_top_k: int = 50,
        final_top_k: int = 16,
) -> pd.DataFrame:

    recs = db_books.similarity_search(query, k=initial_top_k)
    books_list = [int(rec.page_content.strip('"').split()[0]) for rec in recs]
    book_recs = books[books["isbn13"].isin(books_list)].head(initial_top_k)

    if category !="All":
        book_recs = book_recs[book_recs["simple_categories"] == category].head(final_top_k)
    else:
        book_recs = book_recs.head(final_top_k)

    if tone == "Happy":
        book_recs.sort_values(by="joy", ascending=False, inplace=True)
    elif tone == "Surprising":
        book_recs.sort_values(by="surprise", ascending=False, inplace=True)
    elif tone == "Angry":
        book_recs.sort_values(by="anger", ascending=False, inplace=True)
    elif tone == "Suspenseful":
        book_recs.sort_values(by="fear", ascending=False, inplace=True)
    elif tone == "Sad":
        book_recs.sort_values(by="sadness", ascending=False, inplace=True)

    return book_recs


def recommend_books(
        query: str,
        category: str,
        tone: str

):

    recommendations = retrieve_semantic_recommendations(query, category, tone)
    results = []

    for _, row in recommendations.iterrows():
        description = str(row["description"]) if pd.notna(row["description"]) else ""
        truncated_desc_split = description.split()
        if description:
            truncated_description = " ".join(truncated_desc_split) + "..."
        else:
            truncated_description = "No description available."

        authors_data = str(row["authors"]) if pd.notna(row["authors"]) else ""


        if authors_data:
            authors_split = authors_data.split(";")
            if len(authors_split) == 2:
                authors_str = f"{authors_split[0]} and {authors_split[1].strip()}"
            elif len(authors_split) > 2:
                stripped_authors = [s.strip() for s in authors_split]
                authors_str = f"{', '.join(stripped_authors[:-1])}, and {stripped_authors[-1]}"
            elif len(authors_split) == 1 and authors_split[0]:
                 authors_str = authors_split[0].strip()
            else:
                authors_str = "Unknown Author"
        else:
            authors_str = "Unknown Author"

        caption = f"{row['title']} by {authors_str}: {truncated_description}"
        results.append((row["large_thumbnail"], caption))
    return results


categories = ["All"] + sorted(books["simple_categories"].unique())
tones = ["All"] + ["Happy", "Surprising", "Angry", "Suspenseful", "Sad"]

theme = gr.themes.Soft(
    primary_hue="purple",
    secondary_hue="blue",
    neutral_hue="gray",
    font=['IBM Plex Sans', 'ui-sans-serif', 'system-ui', 'sans-serif'],
)
with gr.Blocks(theme) as dashboard:
    gr.Markdown("# Semantic Book Recommender")

    with gr.Row():
        user_query = gr.Textbox(label = "Please enter a description of a book:", placeholder = "e.g., A story about kindness")
        category_dropdown = gr.Dropdown(choices = categories, label = "Select a category:", value = "All")
        tone_dropdown = gr.Dropdown(choices = tones, label = "Select a tone:", value = "All")
        submit_button = gr.Button("Find recommendations")

    gr.Markdown("## Recommendations")
    output = gr.Gallery(label = "Recommended Books", columns= 8, rows = 2)

    submit_button.click(fn = recommend_books,
                          inputs = [user_query, category_dropdown, tone_dropdown],
                          outputs = output)

if __name__ == "__main__":
    dashboard.launch()
