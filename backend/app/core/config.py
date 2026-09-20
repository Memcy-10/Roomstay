import os
from dotenv import load_dotenv
from pathlib import Path

env_path = Path(__file__).resolve().parent.parent.parent / ".env"
load_dotenv(dotenv_path=env_path)


class Settings:
    DB_HOST: str = os.getenv("DB_HOST", "localhost")
    DB_PORT: str = os.getenv("DB_PORT", "3306")
    DB_USER: str = os.getenv("DB_USER", "root")
    DB_PASSWORD: str = os.getenv("DB_PASSWORD", "")
    DB_NAME: str = os.getenv("DB_NAME", "roomstay")

    JWT_SECRET: str = os.getenv("JWT_SECRET", "secret")
    JWT_ALGORITHM: str = os.getenv("JWT_ALGORITHM", "HS256")
    JWT_EXPIRE_HOURS: int = int(os.getenv("JWT_EXPIRE_HOURS", "24"))

    CORS_ORIGINS: str = os.getenv("CORS_ORIGINS", "http://localhost:5173")
    FRONTEND_URL: str = os.getenv("FRONTEND_URL", "http://localhost:5173")

    ENV: str = os.getenv("ENV", "development")

    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    OPENAI_MODEL: str = os.getenv("OPENAI_MODEL", "gpt-4o-mini")

    COMPANY_NAME: str = os.getenv("COMPANY_NAME", "RoomStay SAS")
    COMPANY_NIT: str = os.getenv("COMPANY_NIT", "900123456-7")
    COMPANY_ADDRESS: str = os.getenv("COMPANY_ADDRESS", "Calle 123 #45-67, Bogotá, Colombia")
    COMPANY_EMAIL: str = os.getenv("COMPANY_EMAIL", "contacto@roomstay.com")
    COMPANY_PHONE: str = os.getenv("COMPANY_PHONE", "+57 601 123 4567")

    @property
    def DATABASE_URL(self) -> str:
        return (
            f"mysql+pymysql://{self.DB_USER}:{self.DB_PASSWORD}"
            f"@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}?charset=utf8mb4"
        )


settings = Settings()
