import logging
from typing import Optional

from app.config import settings

logger = logging.getLogger("aryanforge.email")


async def send_email(to: str, subject: str, html_body: str, text_body: Optional[str] = None) -> bool:
    """Send an email via SMTP. Falls back to logging in dev mode."""
    if not settings.SMTP_HOST or settings.ENVIRONMENT == "development":
        logger.info(f"[DEV EMAIL] To: {to} | Subject: {subject}")
        logger.info(f"[DEV EMAIL] Body: {html_body[:200]}...")
        return True

    try:
        import smtplib
        from email.mime.text import MIMEText
        from email.mime.multipart import MIMEMultipart

        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = f"{settings.SMTP_FROM_NAME} <{settings.SMTP_FROM}>"
        msg["To"] = to

        if text_body:
            msg.attach(MIMEText(text_body, "plain"))
        msg.attach(MIMEText(html_body, "html"))

        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
            server.starttls()
            server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            server.sendmail(settings.SMTP_FROM, [to], msg.as_string())

        logger.info(f"Email sent to {to}: {subject}")
        return True

    except Exception as e:
        logger.error(f"Failed to send email to {to}: {e}")
        return False


def build_follow_up_email(name: str, calendly_link: str, conversation_summary: str) -> tuple:
    """Build a follow-up email HTML body."""
    subject = "Continue our conversation — AryanForge"
    html = f"""<!DOCTYPE html>
<html><body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0a0a0a; color: #e0e0e0; padding: 40px 20px;">
<div style="max-width: 560px; margin: 0 auto; background: #121212; border: 1px solid #2a2a2a; border-radius: 16px; padding: 40px;">
<div style="text-align: center; margin-bottom: 32px;">
<img src="https://aryanforge.com/logo.svg" alt="AryanForge" style="height: 32px;" />
</div>
<h2 style="color: #f5b342; font-size: 22px; margin: 0 0 8px;">Hey {name}!</h2>
<p style="color: #a0a0a0; line-height: 1.6; margin: 0 0 20px;">
Thanks for reaching out to AryanForge. I reviewed our conversation and I'd love to continue it
and help you find the perfect solution for your business.
</p>
<div style="background: #1a1a1a; border-left: 3px solid #f5b342; padding: 16px; border-radius: 8px; margin-bottom: 24px; color: #c0c0c0; font-size: 13px; line-height: 1.5;">
<strong style="color: #f5b342;">Our conversation:</strong><br/>
{conversation_summary}
</div>
<p style="color: #a0a0a0; line-height: 1.6; margin: 0 0 20px;">
Let's schedule a free discovery call to discuss your goals, answer your questions,
and map out the best approach for your business.
</p>
<div style="text-align: center; margin: 32px 0;">
<a href="{calendly_link}" style="display: inline-block; background: #f5b342; color: #0a0a0a; text-decoration: none; padding: 14px 32px; border-radius: 12px; font-weight: 600; font-size: 15px;">
📅 Book a Free Call
</a>
</div>
<p style="color: #606060; font-size: 12px; line-height: 1.5; margin: 0;">
Or reply to this email directly. Either way, I'm here to help.<br/>
<strong style="color: #808080;">— Aryan, Founder @ AryanForge</strong>
</p>
</div></body></html>"""
    text_body = f"""Hey {name}!

Thanks for reaching out to AryanForge. I reviewed our conversation and I'd love to continue it.

Our conversation summary:
{conversation_summary}

Let's schedule a free discovery call: {calendly_link}

Or reply to this email directly.

— Aryan, Founder @ AryanForge"""
    return subject, html, text_body


def build_handoff_email(name: str, message: str) -> tuple:
    """Build a handoff notification email for the team."""
    subject = f"🔔 Human Handoff Requested — {name}"
    html = f"""<!DOCTYPE html>
<html><body style="font-family: monospace; background: #0a0a0a; color: #e0e0e0; padding: 40px;">
<div style="max-width: 560px; margin: 0 auto;">
<h2 style="color: #f5b342;">🚨 Human Handoff Requested</h2>
<p><strong>From:</strong> {name}</p>
<p><strong>Message:</strong> {message}</p>
<p style="color: #606060; font-size: 12px;">Respond ASAP via the admin dashboard.</p>
</div></body></html>"""
    return subject, html, None
