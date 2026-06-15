import re
import logging
from typing import Optional

logger = logging.getLogger("launchwitharyan.lead_qualifier")

BUDGET_KEYWORDS = {
    "high": ["50000", "50k", "100k", "100000", "unlimited", "enterprise", "enterprise-grade",
             "any budget", "no limit", "premium", "six figure", "six-figure"],
    "medium": ["10000", "10k", "15000", "15k", "20000", "20k", "25000", "25k", "5000", "5k",
               "moderate", "reasonable", "mid-range", "midrange"],
    "low": ["1000", "1k", "2000", "2k", "3000", "3k", "cheap", "affordable", "budget",
            "low-cost", "low cost", "minimal", "small", "tight"],
}

URGENCY_KEYWORDS = {
    "immediate": ["asap", "urgent", "immediately", "right now", "today", "this week",
                  "yesterday", "critical", "emergency", "need it now"],
    "soon": ["next week", "within a week", "within 2 weeks", "soon", "this month",
             "in the next few weeks", "next few weeks", "near future"],
    "planning": ["next month", "next quarter", "planning", "exploring", "considering",
                 "evaluating", "just looking", "researching", "future", "someday",
                 "not urgent", "no rush", "later"],
}

INTENT_KEYWORDS = {
    "high": ["buy", "purchase", "hire", "invest", "start", "build", "develop",
             "custom", "integrate", "deploy", "implement", "launch", "partner",
             "sign up", "get started", "quote", "proposal", "estimate"],
    "medium": ["interested", "curious", "learn more", "tell me", "how much",
               "pricing", "cost", "demo", "samples", "examples", "compare",
               "options", "recommend", "suggestion"],
    "low": ["what is", "what are", "tell me about", "explain", "information",
            "general", "question", "help", "guide", "tutorial"],
}

BUSINESS_SIZE_KEYWORDS = {
    "enterprise": ["enterprise", "corporation", "multinational", "global", "large team",
                   "500", "1000", "10000", "thousands", "chain", "franchise"],
    "mid": ["company", "agency", "firm", "growing", "scale", "50", "100", "200",
            "team of", "mid-size", "mid size", "medium business"],
    "small": ["startup", "small business", "solo", "freelancer", "just me", "new",
              "5", "10", "20", "tiny", "side project", "beginning"],
}


def score_conversation(text: str) -> dict:
    """Score a conversation text and return lead qualification metrics."""
    text_lower = text.lower()

    def match_keywords(keywords_dict: dict) -> tuple:
        best_level = "none"
        for level, words in keywords_dict.items():
            for word in words:
                if word in text_lower:
                    if level == "high" or (level == "medium" and best_level != "high") or \
                       (level == "low" and best_level not in ("high", "medium")):
                        best_level = level
        scores = {"high": 3, "medium": 2, "low": 1, "none": 0}
        return best_level, scores[best_level]

    budget_level, budget_score = match_keywords(BUDGET_KEYWORDS)
    urgency_level, urgency_score = match_keywords(URGENCY_KEYWORDS)
    intent_level, intent_score = match_keywords(INTENT_KEYWORDS)
    size_level, size_score = match_keywords(BUSINESS_SIZE_KEYWORDS)

    total = budget_score + urgency_score + intent_score + size_score
    max_score = 12
    normalized = round((total / max_score) * 100)

    if normalized >= 70:
        lead_status = "hot"
    elif normalized >= 40:
        lead_status = "warm"
    else:
        lead_status = "cold"

    return {
        "score": normalized,
        "lead_status": lead_status,
        "budget_level": budget_level,
        "budget_score": budget_score,
        "urgency_level": urgency_level,
        "urgency_score": urgency_score,
        "intent_level": intent_level,
        "intent_score": intent_score,
        "business_size_level": size_level,
        "business_size_score": size_score,
        "reasoning": (
            f"Budget: {budget_level} ({budget_score}/3), "
            f"Urgency: {urgency_level} ({urgency_score}/3), "
            f"Intent: {intent_level} ({intent_score}/3), "
            f"Business Size: {size_level} ({size_score}/3) — "
            f"Total: {normalized}/100 → {lead_status.upper()}"
        ),
    }


def extract_lead_info(text: str) -> dict:
    """Extract potential lead information from conversation text."""
    info = {}
    email_match = re.search(r'[\w.+-]+@[\w-]+\.[\w.-]+', text)
    if email_match:
        info["email_hint"] = email_match.group()

    phone_match = re.search(r'(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}', text)
    if phone_match:
        info["phone_hint"] = phone_match.group()

    name_match = re.search(r'(?:my name is|i am|i\'m|call me)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)', text)
    if name_match:
        info["name_hint"] = name_match.group(1)

    budget_match = re.search(r'(?:budget|spend|invest|cost|price|spent?)(?:\s+is|\s+of|\s*:)?\s*(?:around|about|~)?\s*(?:rs\.?|₹|\$|inr|usd)?\s*([\d,]+(?:,\d{3})*(?:\.\d+)?)\s*(?:k|lakh|crore|thousand|million)?', text, re.IGNORECASE)
    if budget_match:
        info["budget_hint"] = budget_match.group(0)

    return info
