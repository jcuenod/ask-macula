# Stage 1: Build the frontend (client)
FROM node:24-alpine AS client_builder_stage

WORKDIR /client

COPY client/package.json client/package-lock.json* ./

RUN npm ci

COPY client/ ./

# Builds to /client/dist
RUN npm run build

# Stage 2: Build the backend (server) and serve the frontend
FROM python:3.13-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

COPY --from=client_builder_stage /client/dist /app/static

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

COPY app .

EXPOSE 8000

WORKDIR /

# /app/main.py + `app = FastAPI()` => "app.main:app"
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]