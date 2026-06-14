import os
import logging
import time
from typing import Optional

from notion_client import Client
from notion_client.errors import APIResponseError

logger = logging.getLogger(__name__)


class NotionClient:
    def __init__(self):
        self.api_key = os.getenv("NOTION_API_KEY", "")
        self.database_id = os.getenv("NOTION_DATABASE_ID", "")
        self.max_retries = int(os.getenv("NOTION_MAX_RETRIES", "5"))

        if not self.api_key:
            raise ValueError("NOTION_API_KEY environment variable is required")
        if not self.database_id:
            raise ValueError("NOTION_DATABASE_ID environment variable is required")

        self.client = Client(auth=self.api_key)

    def _build_properties(self, lead: dict) -> dict:
        properties = {
            "Name": {
                "title": [
                    {
                        "text": {"content": lead.get("name", "Unknown")}
                    }
                ]
            },
            "Email": {
                "rich_text": [
                    {
                        "text": {"content": lead.get("email", "")}
                    }
                ]
            },
            "Source": {
                "select": {
                    "name": lead.get("source", "Website Form")
                }
            },
            "Lead Score": {
                "number": lead.get("lead_score", 0)
            },
            "Timestamp": {
                "date": {
                    "start": lead.get("timestamp", time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()))
                }
            },
        }

        phone = lead.get("phone", "")
        if phone:
            properties["Phone"] = {
                "rich_text": [
                    {
                        "text": {"content": phone}
                    }
                ]
            }

        message = lead.get("message", "")
        if message:
            properties["Message"] = {
                "rich_text": [
                    {
                        "text": {"content": message}
                    }
                ]
            }

        return properties

    def create_lead_page(self, lead: dict) -> Optional[str]:
        properties = self._build_properties(lead)

        for attempt in range(1, self.max_retries + 1):
            try:
                page = self.client.pages.create(
                    parent={"database_id": self.database_id},
                    properties=properties,
                )
                page_id = page.get("id", "")
                page_url = page.get("url", "")
                logger.info(
                    "Created Notion page for %s — ID: %s URL: %s",
                    lead.get("email"), page_id, page_url,
                )
                return page_id

            except APIResponseError as e:
                logger.warning(
                    "Notion API error (attempt %d/%d): %s",
                    attempt, self.max_retries, e,
                )
                if e.code == "rate_limited":
                    wait = 2 ** attempt
                    logger.info("Rate limited. Waiting %ds...", wait)
                    time.sleep(wait)
                elif e.code == "conflict":
                    time.sleep(1)
                elif e.code == "validation_error":
                    logger.error("Notion validation error: %s", e.message)
                    return None
                else:
                    if attempt < self.max_retries:
                        time.sleep(2 ** attempt)
                    else:
                        logger.error("Max retries reached for Notion API")
                        return None

        return None

    def create_batch_pages(self, leads: list) -> list:
        results = []
        for lead in leads:
            page_id = self.create_lead_page(lead)
            results.append({
                "email": lead.get("email"),
                "page_id": page_id,
                "success": page_id is not None,
            })
            time.sleep(0.35)
        return results

    def verify_database(self) -> bool:
        try:
            db = self.client.databases.retrieve(database_id=self.database_id)
            logger.info(
                "Notion database verified: %s (title: %s)",
                self.database_id,
                db.get("title", [{}])[0].get("plain_text", "N/A"),
            )
            return True
        except APIResponseError as e:
            logger.error("Failed to verify Notion database: %s", e)
            return False


if __name__ == "__main__":
    from dotenv import load_dotenv
    load_dotenv()

    client = NotionClient()
    if client.verify_database():
        test_lead = {
            "name": "Jane Smith",
            "email": "jane@example.com",
            "phone": "+1987654321",
            "source": "Website Form",
            "message": "Interested in your premium plan",
            "lead_score": 88,
            "timestamp": "2025-01-15T14:30:00Z",
        }
        page_id = client.create_lead_page(test_lead)
        print(f"Page created: {page_id}")
