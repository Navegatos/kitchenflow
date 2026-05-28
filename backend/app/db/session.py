from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.config import get_settings

database_url = get_settings().database_url

engine = create_engine(database_url)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)