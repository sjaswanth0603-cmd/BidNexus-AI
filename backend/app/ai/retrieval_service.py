import re
import math
from typing import List, Dict, Any

def compute_tf_idf_vector(text: str, vocabulary: List[str]) -> List[float]:
    words = re.findall(r'\w+', text.lower())
    total_words = len(words) or 1
    word_counts = {}
    for w in words:
        word_counts[w] = word_counts.get(w, 0) + 1
    
    vec = []
    for term in vocabulary:
        tf = word_counts.get(term, 0) / total_words
        vec.append(tf)
    return vec

def cosine_similarity(v1: List[float], v2: List[float]) -> float:
    dot = sum(a * b for a, b in zip(v1, v2))
    norm1 = math.sqrt(sum(a * a for a in v1))
    norm2 = math.sqrt(sum(b * b for b in v2))
    if norm1 == 0 or norm2 == 0:
        return 0.0
    return dot / (norm1 * norm2)

class VectorRetrievalEngine:
    def __init__(self):
        pass

    def retrieve_relevant_evidence(
        self,
        requirement_text: str,
        category: str,
        vendor_chunks: List[Dict[str, Any]],
        top_k: int = 3
    ) -> List[Dict[str, Any]]:
        """
        Retrieves the most relevant vendor document chunks for a given requirement.
        Preserves source file_name, page_number, section, and text.
        """
        if not vendor_chunks:
            return []

        # Build vocabulary from requirement and chunks
        corpus = [requirement_text] + [c["chunk_text"] for c in vendor_chunks]
        all_words = set()
        for doc in corpus:
            for w in re.findall(r'\w+', doc.lower()):
                if len(w) > 2:
                    all_words.add(w)
        
        vocab = list(all_words)
        req_vec = compute_tf_idf_vector(requirement_text, vocab)
        
        scored_chunks = []
        for chunk in vendor_chunks:
            chunk_vec = compute_tf_idf_vector(chunk["chunk_text"], vocab)
            sim = cosine_similarity(req_vec, chunk_vec)
            
            # Boost score if category keywords match chunk text or filename
            lower_chunk = chunk["chunk_text"].lower()
            lower_fname = chunk.get("file_name", "").lower()
            combined_text = f"{lower_fname} {lower_chunk}"

            if category.lower() in combined_text:
                sim += 0.35

            # Boost for explicit document types like turnover, ISO, warranty, OEM, GST, PAN, EMD, Datasheet
            keywords = ["turnover", "crore", "lakh", "iso", "warranty", "oem", "authorization", "maf", "ram", "gb", "gst", "gstin", "pan", "emd", "affidavit", "datasheet", "financial"]
            for kw in keywords:
                if kw in requirement_text.lower() and kw in combined_text:
                    sim += 0.30

            scored_chunks.append({
                "chunk": chunk,
                "score": sim
            })

        scored_chunks.sort(key=lambda x: x["score"], reverse=True)
        
        results = []
        for item in scored_chunks[:top_k]:
            c = item["chunk"]
            results.append({
                "score": round(item["score"], 4),
                "file_name": c["file_name"],
                "page_number": c["page_number"],
                "section": c.get("section", "Page " + str(c["page_number"])),
                "chunk_text": c["chunk_text"]
            })
        return results


retrieval_engine = VectorRetrievalEngine()
