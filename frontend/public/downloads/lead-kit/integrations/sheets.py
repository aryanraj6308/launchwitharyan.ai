import os
import logging
from typing import List, Optional

from google.auth import default
from google.oauth2 import service_account
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

logger = logging.getLogger(__name__)


class GoogleSheetsClient:
    SCOPES = ["https://www.googleapis.com/auth/spreadsheets"]

    def __init__(self):
        self.sheet_id = os.getenv("GOOGLE_SHEET_ID", "")
        self.sheet_name = os.getenv("GOOGLE_SHEET_NAME", "Leads")
        self.credentials_path = os.getenv("GOOGLE_CREDENTIALS_PATH", "")

        if not self.sheet_id:
            raise ValueError("GOOGLE_SHEET_ID environment variable is required")

        self.service = self._authenticate()

    def _authenticate(self):
        if self.credentials_path and os.path.exists(self.credentials_path):
            creds = service_account.Credentials.from_service_account_file(
                self.credentials_path, scopes=self.SCOPES
            )
            logger.info("Authenticated with service account file")
        else:
            creds, project = default(scopes=self.SCOPES)
            logger.info("Authenticated with default credentials (project: %s)", project)

        return build("sheets", "v4", credentials=creds)

    def _ensure_sheet_exists(self):
        try:
            spreadsheet = self.service.spreadsheets().get(spreadsheetId=self.sheet_id).execute()
            existing = [s["properties"]["title"] for s in spreadsheet.get("sheets", [])]
            if self.sheet_name not in existing:
                request = {
                    "requests": [
                        {
                            "addSheet": {
                                "properties": {
                                    "title": self.sheet_name,
                                }
                            }
                        }
                    ]
                }
                self.service.spreadsheets().batchUpdate(
                    spreadsheetId=self.sheet_id, body=request
                ).execute()
                logger.info("Created new sheet: %s", self.sheet_name)

                header_row = [
                    ["Timestamp", "Name", "Email", "Phone", "Source", "Message", "Lead Score"]
                ]
                self.service.spreadsheets().values().update(
                    spreadsheetId=self.sheet_id,
                    range=f"{self.sheet_name}!A1:G1",
                    valueInputOption="RAW",
                    body={"values": header_row},
                ).execute()
                logger.info("Header row written to %s", self.sheet_name)
        except HttpError as e:
            logger.error("Failed to ensure sheet exists: %s", e)
            raise

    def append_lead(self, lead_data: dict) -> bool:
        self._ensure_sheet_exists()

        row = [
            lead_data.get("timestamp", ""),
            lead_data.get("name", ""),
            lead_data.get("email", ""),
            lead_data.get("phone", ""),
            lead_data.get("source", ""),
            lead_data.get("message", ""),
            str(lead_data.get("lead_score", 0)),
        ]

        try:
            result = self.service.spreadsheets().values().append(
                spreadsheetId=self.sheet_id,
                range=f"{self.sheet_name}!A:G",
                valueInputOption="RAW",
                insertDataOption="INSERT_ROWS",
                body={"values": [row]},
            ).execute()
            updated = result.get("updates", {}).get("updatedRows", 0)
            logger.info("Appended lead to sheet: %s (rows updated: %d)", lead_data.get("email"), updated)
            return updated > 0
        except HttpError as e:
            logger.error("Failed to append lead to sheet: %s", e)
            return False

    def append_batch(self, leads: List[dict]) -> bool:
        self._ensure_sheet_exists()

        rows = []
        for lead in leads:
            rows.append([
                lead.get("timestamp", ""),
                lead.get("name", ""),
                lead.get("email", ""),
                lead.get("phone", ""),
                lead.get("source", ""),
                lead.get("message", ""),
                str(lead.get("lead_score", 0)),
            ])

        try:
            result = self.service.spreadsheets().values().append(
                spreadsheetId=self.sheet_id,
                range=f"{self.sheet_name}!A:G",
                valueInputOption="RAW",
                insertDataOption="INSERT_ROWS",
                body={"values": rows},
            ).execute()
            updated = result.get("updates", {}).get("updatedRows", 0)
            logger.info("Batch appended %d leads (rows: %d)", len(leads), updated)
            return updated > 0
        except HttpError as e:
            logger.error("Batch append failed: %s", e)
            return False


if __name__ == "__main__":
    from dotenv import load_dotenv
    load_dotenv()

    client = GoogleSheetsClient()
    test_lead = {
        "timestamp": "2025-01-15T10:30:00Z",
        "name": "Test User",
        "email": "test@example.com",
        "phone": "+1234567890",
        "source": "Test Script",
        "message": "Testing sheets integration",
        "lead_score": 75,
    }
    success = client.append_lead(test_lead)
    print(f"Lead appended: {success}")
