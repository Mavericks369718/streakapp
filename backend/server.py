from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime, timedelta
import uuid

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Define Models
class CompletionEntry(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    date: str  # Store as YYYY-MM-DD format
    completed_at: datetime = Field(default_factory=datetime.utcnow)

class StreakStats(BaseModel):
    current_streak: int
    best_streak: int
    total_completions: int
    today_completed: bool
    last_completion_date: Optional[str] = None

class CompletionResponse(BaseModel):
    success: bool
    message: str
    today_completed: bool

# Helper function to get today's date in YYYY-MM-DD format
def get_today_str():
    return datetime.utcnow().strftime("%Y-%m-%d")

# Helper function to parse date string
def parse_date(date_str: str):
    return datetime.strptime(date_str, "%Y-%m-%d")

# Calculate streak from completion dates
def calculate_streak(completion_dates: List[str]):
    if not completion_dates:
        return 0, 0  # current_streak, best_streak
    
    # Sort dates in descending order (most recent first)
    sorted_dates = sorted(completion_dates, reverse=True)
    
    # Calculate current streak
    current_streak = 0
    today = datetime.utcnow().date()
    
    for i, date_str in enumerate(sorted_dates):
        date = parse_date(date_str).date()
        expected_date = today - timedelta(days=i)
        
        if date == expected_date:
            current_streak += 1
        else:
            break
    
    # Calculate best streak
    best_streak = 0
    temp_streak = 1
    
    sorted_dates_asc = sorted(completion_dates)
    for i in range(1, len(sorted_dates_asc)):
        prev_date = parse_date(sorted_dates_asc[i-1]).date()
        curr_date = parse_date(sorted_dates_asc[i]).date()
        
        if (curr_date - prev_date).days == 1:
            temp_streak += 1
            best_streak = max(best_streak, temp_streak)
        else:
            temp_streak = 1
    
    best_streak = max(best_streak, temp_streak, current_streak)
    
    return current_streak, best_streak

# Routes
@api_router.get("/")
async def root():
    return {"message": "Streak Tracker API"}

@api_router.post("/complete", response_model=CompletionResponse)
async def mark_complete():
    """Mark today as complete"""
    today = get_today_str()
    
    # Check if today is already marked
    existing = await db.completions.find_one({"date": today})
    
    if existing:
        return CompletionResponse(
            success=True,
            message="Today already marked as complete",
            today_completed=True
        )
    
    # Create new completion entry
    entry = CompletionEntry(date=today)
    await db.completions.insert_one(entry.dict())
    
    return CompletionResponse(
        success=True,
        message="Today marked as complete!",
        today_completed=True
    )

@api_router.get("/streak", response_model=StreakStats)
async def get_streak():
    """Get current streak statistics"""
    # Get all completions
    completions = await db.completions.find().to_list(1000)
    
    if not completions:
        return StreakStats(
            current_streak=0,
            best_streak=0,
            total_completions=0,
            today_completed=False,
            last_completion_date=None
        )
    
    # Extract dates
    completion_dates = [c["date"] for c in completions]
    today = get_today_str()
    
    # Calculate streaks
    current_streak, best_streak = calculate_streak(completion_dates)
    
    # Check if today is completed
    today_completed = today in completion_dates
    
    # Get last completion date
    sorted_dates = sorted(completion_dates, reverse=True)
    last_completion = sorted_dates[0] if sorted_dates else None
    
    return StreakStats(
        current_streak=current_streak,
        best_streak=best_streak,
        total_completions=len(completions),
        today_completed=today_completed,
        last_completion_date=last_completion
    )

@api_router.get("/history")
async def get_history():
    """Get all completion dates"""
    completions = await db.completions.find().to_list(1000)
    completion_dates = [c["date"] for c in completions]
    return {
        "dates": sorted(completion_dates, reverse=True),
        "total": len(completion_dates)
    }

@api_router.delete("/reset")
async def reset_data():
    """Reset all data (for testing)"""
    result = await db.completions.delete_many({})
    return {
        "success": True,
        "deleted_count": result.deleted_count
    }

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
