"""Comprueba imports, conexión y lectura básica de modelos."""

from sqlalchemy import text

from app.db.session import SessionLocal, engine
from app.models import Category, Order, Product, Recipe


def main() -> None:
    with engine.connect() as conn:
        conn.execute(text("SELECT 1"))
    print("[OK] Conexión a PostgreSQL")

    db = SessionLocal()
    try:
        counts = {
            "products": db.query(Product).count(),
            "categories": db.query(Category).count(),
            "orders": db.query(Order).count(),
            "recipes": db.query(Recipe).count(),
        }
        for name, n in counts.items():
            status = "OK" if n > 0 else "VACÍO (¿falta seed?)"
            print(f"[{status}] {name}: {n}")
    finally:
        db.close()

    print("[OK] Modelos funcionan correctamente")


if __name__ == "__main__":
    main()
