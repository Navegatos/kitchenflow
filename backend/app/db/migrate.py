"""Aplica migraciones SQL pendientes al arrancar la API."""

import logging
import time
from pathlib import Path

from sqlalchemy import text
from sqlalchemy.exc import OperationalError

from app.db.session import engine

logger = logging.getLogger(__name__)

MIGRATIONS_DIR = Path(__file__).resolve().parent.parent.parent / "migrations"
MAX_RETRIES = 10
RETRY_DELAY_SECONDS = 2


def _ensure_migrations_table(conn) -> None:
    conn.execute(
        text(
            """
            CREATE TABLE IF NOT EXISTS schema_migrations (
                version VARCHAR(100) PRIMARY KEY,
                applied_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
            )
            """
        )
    )


def _is_applied(conn, version: str) -> bool:
    result = conn.execute(
        text("SELECT 1 FROM schema_migrations WHERE version = :version"),
        {"version": version},
    )
    return result.fetchone() is not None


def _mark_applied(conn, version: str) -> None:
    conn.execute(
        text("INSERT INTO schema_migrations (version) VALUES (:version)"),
        {"version": version},
    )


def _run_sql_file(conn, path: Path) -> None:
    sql = path.read_text(encoding="utf-8")
    conn.exec_driver_sql(sql)


def run_migrations() -> None:
    if not MIGRATIONS_DIR.is_dir():
        logger.info("No hay directorio de migraciones en %s", MIGRATIONS_DIR)
        return

    migration_files = sorted(MIGRATIONS_DIR.glob("*.sql"))
    if not migration_files:
        return

    last_error: Exception | None = None
    for attempt in range(1, MAX_RETRIES + 1):
        try:
            with engine.begin() as conn:
                _ensure_migrations_table(conn)
                for path in migration_files:
                    version = path.stem
                    if _is_applied(conn, version):
                        continue
                    logger.info("Aplicando migración %s", version)
                    _run_sql_file(conn, path)
                    _mark_applied(conn, version)
            logger.info("Migraciones al día")
            return
        except OperationalError as exc:
            last_error = exc
            if attempt < MAX_RETRIES:
                logger.warning(
                    "BD no disponible (intento %s/%s), reintentando en %ss…",
                    attempt,
                    MAX_RETRIES,
                    RETRY_DELAY_SECONDS,
                )
                time.sleep(RETRY_DELAY_SECONDS)
            else:
                raise

    if last_error:
        raise last_error
