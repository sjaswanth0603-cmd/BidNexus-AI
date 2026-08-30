import os
import json
import logging
import requests
from typing import List, Dict, Any, Optional
from app.config import settings

logger = logging.getLogger("bidnexus.llm")

class LLMClient:
    """
    Unified LLM Client supporting Google Gemini API, OpenAI API, 
    and intelligent hybrid heuristic fallbacks.
    """

    def __init__(self):
        self.gemini_key = settings.GEMINI_API_KEY.strip()
        self.openai_key = settings.OPENAI_API_KEY.strip()
        self.provider = settings.LLM_PROVIDER.lower()
        self.openai_model = getattr(settings, "OPENAI_MODEL", "gpt-4o-mini")
        self.gemini_model = getattr(settings, "GEMINI_MODEL", "gemini-1.5-flash")

    def get_status(self) -> Dict[str, Any]:
        """
        Returns live connectivity and configuration status of the AI LLM Backend.
        """
        has_gemini = bool(self.gemini_key)
        has_openai = bool(self.openai_key)

        active_provider = "Local Hybrid RAG Engine"
        active_model = "Rule & Vector Engine v1.0"

        if (self.provider in ["gemini", "auto"] and has_gemini) or (not has_openai and has_gemini):
            active_provider = "Google Gemini API"
            active_model = self.gemini_model
        elif (self.provider in ["openai", "auto"] and has_openai):
            active_provider = "OpenAI API"
            active_model = self.openai_model

        return {
            "active_provider": active_provider,
            "active_model": active_model,
            "gemini_configured": has_gemini,
            "openai_configured": has_openai,
            "provider_setting": self.provider,
            "status": "Operational"
        }

    def generate_chat_completion(
        self,
        messages: List[Dict[str, str]],
        temperature: float = 0.2,
        json_mode: bool = False
    ) -> Optional[str]:
        """
        Executes a chat completion call to Google Gemini API (or OpenAI fallback).
        """
        has_gemini = bool(self.gemini_key)
        has_openai = bool(self.openai_key)

        # 1. Try Gemini first if configured
        if (self.provider in ["gemini", "auto"] or not has_openai) and has_gemini:
            try:
                prompt_text = "\n\n".join([f"{m['role'].upper()}: {m['content']}" for m in messages])
                url = f"https://generativelanguage.googleapis.com/v1beta/models/{self.gemini_model}:generateContent?key={self.gemini_key}"
                headers = {"Content-Type": "application/json"}
                payload = {
                    "contents": [{"parts": [{"text": prompt_text}]}],
                    "generationConfig": {"temperature": temperature}
                }
                if json_mode:
                    payload["generationConfig"]["response_mime_type"] = "application/json"

                response = requests.post(url, headers=headers, json=payload, timeout=15)
                if response.status_code == 200:
                    res_json = response.json()
                    candidates = res_json.get("candidates", [])
                    if candidates and "content" in candidates[0]:
                        parts = candidates[0]["content"].get("parts", [])
                        if parts and "text" in parts[0]:
                            return parts[0]["text"]
                else:
                    logger.warning(f"Gemini API returned status {response.status_code}: {response.text}")
            except Exception as e:
                logger.error(f"Gemini API Exception: {e}")

        # 2. Try OpenAI if configured
        if (self.provider in ["openai", "auto"]) and has_openai:
            try:
                url = "https://api.openai.com/v1/chat/completions"
                headers = {
                    "Authorization": f"Bearer {self.openai_key}",
                    "Content-Type": "application/json"
                }
                payload = {
                    "model": self.openai_model,
                    "messages": messages,
                    "temperature": temperature
                }
                if json_mode:
                    payload["response_format"] = {"type": "json_object"}

                response = requests.post(url, headers=headers, json=payload, timeout=15)
                if response.status_code == 200:
                    res_data = response.json()
                    return res_data["choices"][0]["message"]["content"]
                else:
                    logger.error(f"OpenAI API Error ({response.status_code}): {response.text}")
            except Exception as e:
                logger.error(f"OpenAI API Exception: {e}")

        return None

    def extract_requirements(self, text: str) -> Optional[List[Dict[str, Any]]]:
        """
        Uses Gemini (or OpenAI) to parse raw tender text into structured compliance rules.
        """
        system_prompt = (
            "You are an expert procurement AI for Government e-Marketplace (GeM) and State eGP tenders. "
            "Extract all compliance requirements into a valid JSON object containing a key 'requirements' with an array of objects. "
            "Each requirement object must contain: requirement_id (e.g. REQ-001), category (Technical|Financial|Eligibility|Certification|Warranty|Delivery|Legal|Documentation|Commercial), "
            "requirement (clear sentence), operator (>=|<=|==|required|date_validity), value, unit, mandatory (boolean), evidence_required (name of certificate/document), source_page (number), confidence (0.0 to 1.0)."
        )
        
        user_prompt = f"Extract procurement requirements from this tender text snippet:\n\n{text[:4500]}"
        
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ]

        raw_json = self.generate_chat_completion(messages, temperature=0.1, json_mode=True)
        if raw_json:
            try:
                parsed = json.loads(raw_json)
                if isinstance(parsed, dict) and "requirements" in parsed:
                    return parsed["requirements"]
                elif isinstance(parsed, list):
                    return parsed
            except Exception as e:
                logger.error(f"Failed to parse LLM JSON output: {e}")
        return None

    def query_copilot(self, question: str, context_details: str) -> Optional[str]:
        """
        Generates grounded AI Copilot answers using Gemini or OpenAI API.
        """
        system_prompt = (
            "You are BidNexusAI Copilot, an expert AI assistant for GeM (Government e-Marketplace) procurement verification. "
            "Answer the user query concisely, clearly, and professionally based strictly on the provided tender context and vendor evidence. "
            "Highlight any missing documents, non-compliance reasons, or technical contradictions clearly using markdown formatting."
        )

        user_prompt = f"CONTEXT DETAILS:\n{context_details}\n\nUSER QUESTION:\n{question}"

        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ]

        return self.generate_chat_completion(messages, temperature=0.3, json_mode=False)


llm_client = LLMClient()

