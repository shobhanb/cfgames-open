from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    environment: str = "dev"
    db_url: str = "sqlite+aiosqlite:///test.db"
    frontend_url: str = "http://localhost:4200"
    admin_api_key: str = "secret"

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


settings = Settings()
