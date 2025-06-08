from embedder import chroma_client



collection = chroma_client.get_or_create_collection(name="gCtazG4ZXlQC")

results = collection.query(
    query_texts=["Who is the main character?"],
    n_results=3
)

print(results["documents"][0])