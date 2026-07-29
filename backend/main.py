from fastapi import FastAPI, HTTPException
from sqlalchemy import text
from database import engine
import models
from auth import router as auth_router
from crud import router as crud_router
from fastapi.middleware.cors import CORSMiddleware

# ==========================
# FastAPI app
# ==========================
app = FastAPI(title="MyApo School Portal")

# ==========================
# ✅ ADD CORS HERE (RIGHT PLACE)
# ==========================
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173",],  # better than "*"
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==========================
# Include routers
# ==========================
app.include_router(auth_router, prefix="/auth", tags=["Authentication"])
app.include_router(crud_router, prefix="/crud", tags=["CRUD"])

# ==========================
# Auto-create tables on startup
# ==========================
models.Base.metadata.create_all(bind=engine)

# ==========================
# Root route
# ==========================
@app.get("/")
def home():
    return {"message": "Welcome to MyApo School Portal"}

# ==========================
# Test DB connection
# ==========================
@app.get("/test-db")
def test_db_connection():
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))
            return {"status": "success", "message": "Database connection successful and tables created!"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database connection failed: {e}")