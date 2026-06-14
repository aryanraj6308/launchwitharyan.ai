import os
import logging
import json
from typing import Optional

import httpx

logger = logging.getLogger(__name__)


class SlackNotifier:
    def __init__(self):
        self.webhook_url = os.getenv("SLACK_WEBHOOK_URL", "")
        self.token = os.getenv("SLACK_TOKEN", "")
        self.channel = os.getenv("SLACK_CHANNEL", "#leads")
        self.default_source = os.getenv("SLACK_DEFAULT_SOURCE", "Website Form")

        if not self.webhook_url and not self.token:
            raise ValueError(
                "Either SLACK_WEBHOOK_URL or SLACK_TOKEN must be configured"
            )

    def _score_color(self, score: int) -> str:
        if score >= 80:
            return "#36a64f"
        elif score >= 50:
            return "#daa038"
        else:
            return "#a0a0a0"

    def _score_label(self, score: int) -> str:
        if score >= 80:
            return "Hot"
        elif score >= 50:
            return "Warm"
        else:
            return "Cold"

    def build_lead_blocks(self, lead: dict) -> dict:
        score = lead.get("lead_score", 0)
        color = self._score_color(score)
        label = self._score_label(score)

        blocks = {
            "attachments": [
                {
                    "color": color,
                    "blocks": [
                        {
                            "type": "header",
                            "text": {
                                "type": "plain_text",
                                "text": f"New Lead: {lead.get('name', 'Unknown')}",
                            },
                        },
                        {
                            "type": "section",
                            "fields": [
                                {"type": "mrkdwn", "text": f"*Name:*\n{lead.get('name', 'N/A')}"},
                                {"type": "mrkdwn", "text": f"*Email:*\n{lead.get('email', 'N/A')}"},
                                {"type": "mrkdwn", "text": f"*Phone:*\n{lead.get('phone', 'N/A')}"},
                                {"type": "mrkdwn", "text": f"*Source:*\n{lead.get('source', self.default_source)}"},
                                {"type": "mrkdwn", "text": f"*Score:*\n{score}/100 — {label}"},
                                {"type": "mrkdwn", "text": f"*Date:*\n{lead.get('timestamp', 'N/A')[:10]}"},
                            ],
                        },
                    ],
                }
            ]
        }

        message = lead.get("message", "")
        if message:
            blocks["attachments"][0]["blocks"].append(
                {
                    "type": "section",
                    "text": {
                        "type": "mrkdwn",
                        "text": f"*Message:*\n{message}",
                    },
                }
            )

        return blocks

    def send_via_webhook(self, lead: dict) -> bool:
        if not self.webhook_url:
            logger.warning("No SLACK_WEBHOOK_URL configured")
            return False

        payload = self.build_lead_blocks(lead)

        try:
            resp = httpx.post(self.webhook_url, json=payload, timeout=10.0)
            resp.raise_for_status()
            logger.info("Lead notification sent via webhook: %s", lead.get("email"))
            return True
        except httpx.HTTPStatusError as e:
            logger.error("Slack webhook HTTP error: %s — %s", e.response.status_code, e.response.text)
            return False
        except httpx.RequestError as e:
            logger.error("Slack webhook request failed: %s", e)
            return False

    def send_via_api(self, lead: dict) -> bool:
        if not self.token:
            logger.warning("No SLACK_TOKEN configured")
            return False

        payload = self.build_lead_blocks(lead)
        payload["channel"] = self.channel
        payload["token"] = self.token

        try:
            resp = httpx.post(
                "https://slack.com/api/chat.postMessage",
                json=payload,
                headers={"Authorization": f"Bearer {self.token}"},
                timeout=10.0,
            )
            resp.raise_for_status()
            result = resp.json()
            if result.get("ok"):
                logger.info("Lead notification sent via API: %s", lead.get("email"))
                return True
            else:
                logger.error("Slack API error: %s", result.get("error"))
                return False
        except httpx.HTTPStatusError as e:
            logger.error("Slack API HTTP error: %s", e.response.status_code)
            return False
        except httpx.RequestError as e:
            logger.error("Slack API request failed: %s", e)
            return False

    def send(self, lead: dict) -> bool:
        webhook_ok = self.send_via_webhook(lead)
        api_ok = self.send_via_api(lead) if self.token else False
        return webhook_ok or api_ok


if __name__ == "__main__":
    from dotenv import load_dotenv
    load_dotenv()

    notifier = SlackNotifier()
    test_lead = {
        "name": "Alice Johnson",
        "email": "alice@example.com",
        "phone": "+15551234567",
        "source": "Landing Page",
        "message": "Looking for enterprise pricing",
        "lead_score": 92,
        "timestamp": "2025-01-15T16:45:00Z",
    }
    success = notifier.send(test_lead)
    print(f"Slack notification sent: {success}")
