from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

import os
import logging
from datetime import datetime, timezone, timedelta
from typing import Annotated, Optional, Any, Dict

import bcrypt
import jwt
from bson import ObjectId
from fastapi import FastAPI, APIRouter, HTTPException, Request, Depends
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, BeforeValidator, ConfigDict, Field, EmailStr
from starlette.middleware.cors import CORSMiddleware

client = AsyncIOMotorClient(os.environ["MONGO_URL"])
db = client[os.environ["DB_NAME"]]

app = FastAPI(title="Earth Through Time API")
api = APIRouter(prefix="/api")
logger = logging.getLogger("ett")
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")

JWT_ALGORITHM = "HS256"
SCENES = ["nascita", "ossigeno", "glaciazioni", "medioevo", "industria", "scienza", "oggi", "finale"]

PyObjectId = Annotated[str, BeforeValidator(lambda v: str(v) if isinstance(v, ObjectId) else v)]


class BaseDocument(BaseModel):
    model_config = ConfigDict(populate_by_name=True)
    id: Optional[PyObjectId] = Field(default=None, alias="_id")

    @classmethod
    def from_mongo(cls, doc: dict):
        return cls.model_validate(doc)

    def to_mongo(self) -> dict:
        data = self.model_dump(by_alias=True, exclude_none=True)
        data.pop("_id", None)
        return data


class EventDoc(BaseDocument):
    type: str
    scene: Optional[str] = None
    session_id: str
    mode: Optional[str] = None
    device: Optional[str] = None
    meta: Dict[str, Any] = {}
    created_at: str


class LogDoc(BaseDocument):
    level: str
    message: str
    stack: Optional[str] = None
    url: Optional[str] = None
    user_agent: Optional[str] = None
    session_id: Optional[str] = None
    created_at: str


class EventIn(BaseModel):
    type: str = Field(min_length=1, max_length=40)
    scene: Optional[str] = Field(default=None, max_length=40)
    session_id: str = Field(min_length=4, max_length=64)
    mode: Optional[str] = Field(default=None, max_length=20)
    device: Optional[str] = Field(default=None, max_length=20)
    meta: Dict[str, Any] = {}


class LogIn(BaseModel):
    level: str = Field(default="error", max_length=10)
    message: str = Field(min_length=1, max_length=2000)
    stack: Optional[str] = Field(default=None, max_length=6000)
    url: Optional[str] = Field(default=None, max_length=500)
    user_agent: Optional[str] = Field(default=None, max_length=400)
    session_id: Optional[str] = Field(default=None, max_length=64)


class LoginIn(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1, max_length=200)


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def hash_password(p: str) -> str:
    return bcrypt.hashpw(p.encode(), bcrypt.gensalt()).decode()


def verify_password(p: str, h: str) -> bool:
    return bcrypt.checkpw(p.encode(), h.encode())


def create_token(user_id: str, email: str) -> str:
    payload = {"sub": user_id, "email": email, "type": "access",
               "exp": datetime.now(timezone.utc) + timedelta(hours=8)}
    return jwt.encode(payload, os.environ["JWT_SECRET"], algorithm=JWT_ALGORITHM)


async def current_admin(request: Request) -> dict:
    header = request.headers.get("Authorization", "")
    token = header[7:] if header.startswith("Bearer ") else None
    if not token:
        raise HTTPException(401, "Non autenticato")
    try:
        payload = jwt.decode(token, os.environ["JWT_SECRET"], algorithms=[JWT_ALGORITHM])
    except jwt.ExpiredSignatureError:
        raise HTTPException(401, "Sessione scaduta")
    except jwt.InvalidTokenError:
        raise HTTPException(401, "Token non valido")
    user = await db.users.find_one({"_id": ObjectId(payload["sub"])})
    if not user or user.get("role") != "admin":
        raise HTTPException(403, "Accesso negato")
    return {"id": str(user["_id"]), "email": user["email"], "name": user.get("name"), "role": user["role"]}


@api.get("/")
async def root():
    return {"message": "Earth Through Time API"}


@api.post("/auth/login")
async def login(body: LoginIn, request: Request):
    email = body.email.lower()
    ident = f"{request.client.host if request.client else 'x'}:{email}"
    attempt = await db.login_attempts.find_one({"identifier": ident})
    if attempt and attempt.get("count", 0) >= 5:
        locked_until = datetime.fromisoformat(attempt["locked_until"])
        if locked_until > datetime.now(timezone.utc):
            raise HTTPException(429, "Troppi tentativi. Riprova tra 15 minuti.")
        await db.login_attempts.delete_one({"identifier": ident})
    user = await db.users.find_one({"email": email})
    if not user or not verify_password(body.password, user["password_hash"]):
        await db.login_attempts.update_one(
            {"identifier": ident},
            {"$inc": {"count": 1},
             "$set": {"locked_until": (datetime.now(timezone.utc) + timedelta(minutes=15)).isoformat()}},
            upsert=True)
        raise HTTPException(401, "Email o password non corretti")
    await db.login_attempts.delete_one({"identifier": ident})
    uid = str(user["_id"])
    return {"token": create_token(uid, email),
            "user": {"id": uid, "email": email, "name": user.get("name"), "role": user["role"]}}


@api.get("/auth/me")
async def me(user: dict = Depends(current_admin)):
    return user


@api.post("/events", status_code=201)
async def add_event(body: EventIn):
    doc = EventDoc(**body.model_dump(), created_at=now_iso())
    await db.events.insert_one(doc.to_mongo())
    return {"ok": True}


@api.post("/logs", status_code=201)
async def add_log(body: LogIn):
    doc = LogDoc(**body.model_dump(), created_at=now_iso())
    await db.error_logs.insert_one(doc.to_mongo())
    logger.warning("client-%s: %s", body.level, body.message[:200])
    return {"ok": True}


async def count_by(field: str, match: dict) -> dict:
    rows = await db.events.aggregate([{"$match": match}, {"$group": {"_id": f"${field}", "n": {"$sum": 1}}}]).to_list(100)
    return {str(r["_id"]): r["n"] for r in rows if r["_id"] is not None}


@api.get("/admin/stats")
async def stats(days: int = 14, _: dict = Depends(current_admin)):
    days = max(1, min(days, 90))
    since = (datetime.now(timezone.utc) - timedelta(days=days)).isoformat()
    match = {"created_at": {"$gte": since}}
    total = await db.events.count_documents(match)
    sessions = len(await db.events.distinct("session_id", match))
    scene_counts = await count_by("scene", {**match, "type": "scene_view"})
    by_type = await count_by("type", match)
    by_mode = await count_by("mode", {**match, "type": "session_start"})
    by_device = await count_by("device", {**match, "type": "session_start"})
    models = await db.events.aggregate([
        {"$match": {**match, "type": "model_view"}},
        {"$group": {"_id": "$meta.model", "n": {"$sum": 1}}}]).to_list(50)
    daily = await db.events.aggregate([
        {"$match": match},
        {"$group": {"_id": {"$substr": ["$created_at", 0, 10]}, "events": {"$sum": 1},
                    "sessions": {"$addToSet": "$session_id"}}},
        {"$sort": {"_id": 1}}]).to_list(100)
    errors = await db.error_logs.count_documents(match)
    return {
        "range_days": days, "total_events": total, "sessions": sessions, "errors": errors,
        "scenes": [{"scene": s, "views": scene_counts.get(s, 0)} for s in SCENES],
        "by_type": by_type, "by_mode": by_mode, "by_device": by_device,
        "models": [{"model": m["_id"], "views": m["n"]} for m in models if m["_id"]],
        "daily": [{"day": d["_id"], "events": d["events"], "sessions": len(d["sessions"])} for d in daily],
    }


@api.get("/admin/logs")
async def list_logs(limit: int = 50, _: dict = Depends(current_admin)):
    docs = await db.error_logs.find().sort("created_at", -1).to_list(max(1, min(limit, 200)))
    return [LogDoc.from_mongo(d).model_dump() for d in docs]


@api.delete("/admin/logs")
async def clear_logs(_: dict = Depends(current_admin)):
    res = await db.error_logs.delete_many({})
    return {"deleted": res.deleted_count}


app.include_router(api)
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get("CORS_ORIGINS", "*").split(","),
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup():
    await db.users.create_index("email", unique=True)
    await db.login_attempts.create_index("identifier")
    await db.events.create_index("created_at")
    await db.error_logs.create_index("created_at")
    email = os.environ["ADMIN_EMAIL"].lower()
    pwd = os.environ["ADMIN_PASSWORD"]
    existing = await db.users.find_one({"email": email})
    if existing is None:
        await db.users.insert_one({"email": email, "password_hash": hash_password(pwd), "name": "Admin",
                                   "role": "admin", "created_at": now_iso()})
    elif not verify_password(pwd, existing["password_hash"]):
        await db.users.update_one({"email": email}, {"$set": {"password_hash": hash_password(pwd)}})


@app.on_event("shutdown")
async def shutdown():
    client.close()
