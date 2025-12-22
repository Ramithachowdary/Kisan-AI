from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
load_dotenv()
from app.models import models
from app.models.database import engine

# Routers
from app.routes.user_routes import router as user_router
from app.routes.login_routes import router as login_router
from app.routes.market_routes import router as market_router
from app.routes.diagnosis_routes import router as diagnosis_router
from app.routes.scheme_routes import router as scheme_router
from app.routes.notification_routes import router as notification_router
from app.routes.help_routes import router as help_router
from app.routes.voice_agent_routes import router as voice_agent_router

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Kisan+ Backend", version="1.0.0")

# CORS MUST COME BEFORE ROUTERS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:8080",
        "http://127.0.0.1:8080",
        "http://192.168.232.1:8080",
        "*"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ROUTERS
app.include_router(login_router)
app.include_router(user_router)
app.include_router(market_router)
app.include_router(diagnosis_router)
app.include_router(scheme_router)
app.include_router(notification_router)
app.include_router(help_router)
app.include_router(voice_agent_router)



@app.get("/")
def root():
    return {"message": "Kisan+ Backend Running"}


