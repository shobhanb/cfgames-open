from pydantic import EmailStr
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
    admin_api_key: str = "secret"


class AdminUserSettings(CustomBaseSettings):
    admin_user_email: EmailStr


env_settings = EnvSettings()
db_settings = DBSettings()
url_settings = URLSettings()
auth_settings = AuthSettings()
admin_user_settings = AdminUserSettings()  # type: ignore  # noqa: PGH003
