# database.py
from  sqlalchemy import create_engine
from  sqlalchemy.orm import sessionmaker, declarative_base
import os
from dotenv import load_dotenv

load_dotenv()

# Example connection string (change your password/db name)
DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise ValueError("DATABASE_URL is not set in environment variables")


engine = create_engine(
    DATABASE_URL,
    pool_size=5,          # max persistent connections
    max_overflow=10,      # extra temporary connections
    pool_timeout=30,      # seconds to wait before error
    pool_recycle=1800,    # recycle connections every 30 mins
    pool_pre_ping=True,  # check connection before use
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

Base = declarative_base()



# Dependency for database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
