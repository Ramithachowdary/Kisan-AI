# Environment setup and quick run

Backend (Python / FastAPI):

1. Create virtualenv and install dependencies

```bash
python -m venv .venv
.\.venv\Scripts\activate
pip install -r kisan_backend/requirements.txt
```

2. Copy example env and provide secrets

```bash
copy kisan_backend\.env.example kisan_backend\.env
# then edit kisan_backend\.env and set SECRET_KEY and other values
```

3. Run the backend

```bash
cd kisan_backend
uvicorn app.main:app --reload --port 8000
```

Frontend (Vite / React):

1. Install

```bash
cd kisan_frontend
npm install
# or bun install / pnpm install depending on your toolchain
```

2. Copy env and run dev server

```bash
copy kisan_frontend\.env.example kisan_frontend\.env
npm run dev
```

Notes:
- Firebase is not used anymore; no service account required.
- If using Postgres, set `DATABASE_URL` to a valid SQLAlchemy URI; `psycopg2` may need system libs.
- TensorFlow in `requirements.txt` may require specific system packages for GPU support.
