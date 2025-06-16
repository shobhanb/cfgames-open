from pydantic import EmailStr, SecretStr
from pydantic_settings import BaseSettings, SettingsConfigDict


class CustomBaseSettings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


class EnvSettings(CustomBaseSettings):
    environment: str = "dev"


class DBSettings(CustomBaseSettings):
    db_url: str = "sqlite+aiosqlite:///test.db"


class URLSettings(CustomBaseSettings):
    backend_url: str = "http://localhost:8000"
    frontend_url: str = "http://localhost:4200"


class AuthSettings(CustomBaseSettings):
    token_lifetime_seconds: int = 3600
    admin_api_key: str = "secret"
    reset_password_token_key: str = "secret"  # noqa: S105
    verification_token_key: str = "secret"  # noqa: S105
    oauth_token_key: str = "secret"  # noqa: S105
    google_oauth_client_id: str = "secret"
    google_oauth_client_secret: str = "secret"  # noqa: S105


class EmailerSettings(CustomBaseSettings):
    email_username: str = "noreply@example.com"
    email_password: SecretStr
    email_smtp_server: str
    email_port: int
    email_from: EmailStr
    email_from_name: str


env_settings = EnvSettings()
db_settings = DBSettings()
url_settings = URLSettings()
auth_settings = AuthSettings()
emailer_settings = EmailerSettings()  # type: ignore  # noqa: PGH003
