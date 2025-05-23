from pathlib import Path

from fastapi_mail import ConnectionConfig

from app.settings import emailer_settings

fastmail_config = ConnectionConfig(
    MAIL_USERNAME=emailer_settings.email_username,
    MAIL_PASSWORD=emailer_settings.email_password,
    MAIL_FROM=emailer_settings.email_from,
    MAIL_PORT=emailer_settings.email_port,
    MAIL_SERVER=emailer_settings.email_smtp_server,
    MAIL_FROM_NAME=emailer_settings.email_from_name,
    MAIL_STARTTLS=True,
    MAIL_SSL_TLS=False,
    USE_CREDENTIALS=True,
    VALIDATE_CERTS=True,
    TEMPLATE_FOLDER=Path("templates"),
)
