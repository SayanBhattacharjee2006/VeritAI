from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file='.env', extra='ignore')

    APP_ENV: str = 'development'
    SECRET_KEY: str = 'change-me-in-production'
    ALGORITHM: str = 'HS256'
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7

    OPENAI_API_KEY: str
    OPENAI_MODEL: str = 'gpt-4o'

    TAVILY_API_KEY: str

    MONGODB_URL: str = 'mongodb://localhost:27017'
    MONGODB_DB_NAME: str = 'veritai'

    ALLOWED_ORIGINS: str = 'http://localhost:3000'

    FREE_TIER_DAILY_LIMIT: int = 5
    PRO_TIER_DAILY_LIMIT: int = 50
    PREMIUM_TIER_DAILY_LIMIT: int = 999999

    @property
    def origins_list(self) -> list[str]:
        return [o.strip() for o in self.ALLOWED_ORIGINS.split(',')]


settings = Settings()
