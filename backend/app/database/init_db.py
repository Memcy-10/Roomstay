import os
import sys
from pathlib import Path
from sqlalchemy import create_engine, text

sys.path.insert(0, str(Path(__file__).resolve().parent.parent.parent))

from dotenv import load_dotenv
env_path = Path(__file__).resolve().parent.parent.parent / ".env"
load_dotenv(dotenv_path=env_path)

DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = os.getenv("DB_PORT", "3306")
DB_USER = os.getenv("DB_USER", "root")
DB_PASSWORD = os.getenv("DB_PASSWORD", "")
DB_NAME = os.getenv("DB_NAME", "roomstay")


def main():
    root_url = f"mysql+pymysql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/?charset=utf8mb4"
    engine_root = create_engine(root_url, pool_pre_ping=True)

    with engine_root.connect() as conn:
        conn.execute(text(f"CREATE DATABASE IF NOT EXISTS {DB_NAME} DEFAULT CHARACTER SET utf8mb4 DEFAULT COLLATE utf8mb4_unicode_ci"))
        conn.commit()
        print(f"Base de datos '{DB_NAME}' asegurada.")

    db_url = f"mysql+pymysql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}?charset=utf8mb4"
    engine = create_engine(db_url, pool_pre_ping=True)

    from app.models import Base
    Base.metadata.create_all(bind=engine)
    print("Tablas creadas/verificadas con Base.metadata.create_all.")

    init_sql_path = Path(__file__).resolve().parents[3] / "database" / "init.sql"
    with open(init_sql_path, "r", encoding="utf-8") as f:
        sql_content = f.read()

    with engine.connect() as conn:
        statements = [s.strip() for s in sql_content.split(";") if s.strip()]
        for stmt in statements:
            try:
                conn.execute(text(stmt))
                conn.commit()
            except Exception as e:
                print(f"  (skip) {str(e)[:120]}")

    print("Init OK")


if __name__ == "__main__":
    main()
