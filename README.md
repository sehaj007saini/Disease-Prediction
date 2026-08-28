# Multi-Disease Prediction Platform

A full-stack, microservice-based healthcare platform for AI-driven disease risk prediction. Clinicians and users can assess risk for multiple conditions, manage patient records, run batch screenings, and monitor system health through a modern web dashboard.

> **Disclaimer:** This project is for educational and research purposes. Predictions are not a substitute for professional medical diagnosis or treatment.

---

## Supported Diseases

| Disease | ML Model |
|---------|----------|
| Diabetes | Random Forest / Gradient Boosting |
| Heart Disease | Random Forest / Gradient Boosting |
| Hypertension | Random Forest / Gradient Boosting |
| Kidney Disease | Random Forest / Gradient Boosting |
| Stroke | Random Forest / Gradient Boosting |

---

## Features

- **Single & batch predictions** — Run individual assessments or bulk JSON/CSV screenings
- **Patient registry** — CRUD patient profiles with search, export, and diagnostic history
- **Analytics dashboard** — Risk distribution charts and priority patient views
- **Multi-disease screening** — Assess multiple conditions in one workflow
- **Explainability (XAI)** — Counterfactual simulation and model governance views
- **Smart alerts** — Risk-based notifications for high-priority patients
- **Medication tracker & family health tree** — Extended patient care tooling
- **Wearable integration** — Sync telemetry from connected devices
- **JWT authentication** — Secure user login with role-based admin console
- **System health monitor** — Live status for PostgreSQL, backend API, and ML service
- **Dark mode** — Full light/dark theme support

---

## Architecture

```
+-----------------------------------+         REST (Port 8080)        +----------------------------------+
|   React Vite Frontend (Nginx)     | ------------------------------> |    Spring Boot Backend API       |
|   (Disease_Prediction_Frontend)   |                                 |    (Disease_Prediction_Backend)  |
+-----------------------------------+                                 +----------------------------------+
                                                                                       |
                                              +----------------------------------------+
                                              | JPA / PostgreSQL (Port 5432)           | REST (Port 5000)
                                              v                                        v
                               +-----------------------------+           +-------------------------------+
                               | PostgreSQL Database         |           | FastAPI ML Microservice       |
                               | (disease_prediction_db)     |           | (Disease_Prediction)          |
                               +-----------------------------+           +-------------------------------+
```

| Service | Stack | Port |
|---------|-------|------|
| Frontend | React 18, Vite, Nginx | `3000` (dev) / `80` (Docker) |
| Backend | Java 17, Spring Boot 3.2, JPA | `8080` |
| ML Engine | Python 3.11, FastAPI, Scikit-Learn | `5000` |
| Database | PostgreSQL 16 | `5432` |

---

## Quick Start (Docker)

**Prerequisites:** [Docker](https://www.docker.com/) and Docker Compose

```bash
# Clone the repository
git clone https://github.com/sehaj007saini/Disease-Prediction.git
cd Disease-Prediction

# Optional: copy and configure environment variables
cp .env.example .env

# Start all services (PostgreSQL, ML engine, backend, frontend)
docker-compose up --build -d

# Stop all services
docker-compose down
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8080/api/v1 |
| Swagger UI | http://localhost:8080/swagger-ui.html |
| ML Service | http://localhost:5000 |
| ML Health | http://localhost:5000/health |

---

## Local Development

Run each service individually for development with hot reload.

### 1. PostgreSQL

Create the database:

```sql
CREATE DATABASE disease_prediction_db;
```

### 2. ML Engine

```bash
cd Disease_Prediction
pip install -r requirements.txt
python train_models.py
uvicorn ml_api:app --reload --port 5000
```

### 3. Backend

```bash
cd Disease_Prediction_Backend
mvn clean spring-boot:run
```

Run tests:

```bash
mvn clean test
```

### 4. Frontend

```bash
cd Disease_Prediction_Frontend
npm install
npm run dev
```

The dev server runs at http://localhost:3000 and proxies API requests to the backend at `http://localhost:8080/api/v1`.

---

## Project Structure

```
DiseasePredictionProject/
├── docker-compose.yml              # Multi-service orchestration
├── .env.example                    # Environment variable template
├── render.yaml                     # Render.com deployment config
│
├── Disease_Prediction/             # Python ML microservice (FastAPI)
│   ├── ml_api.py                   # /predict and /health endpoints
│   ├── train_models.py             # Model training pipeline
│   └── requirements.txt
│
├── Disease_Prediction_Backend/     # Spring Boot REST API
│   ├── src/main/java/.../controller/
│   ├── src/main/java/.../service/
│   └── pom.xml
│
└── Disease_Prediction_Frontend/    # React + Vite web UI
    ├── src/components/             # Dashboard, forms, registry, etc.
    └── src/services/api.js         # Axios API client
```

---

## API Overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/v1/health` | Backend health check |
| `POST` | `/api/v1/patients` | Create patient |
| `GET` | `/api/v1/patients` | List all patients |
| `GET` | `/api/v1/patients/{id}` | Get patient by ID |
| `PUT` | `/api/v1/patients/{id}` | Update patient |
| `DELETE` | `/api/v1/patients/{id}` | Delete patient |
| `POST` | `/api/v1/predictions` | Run single prediction |
| `POST` | `/api/v1/predictions/batch` | Batch predictions |
| `GET` | `/api/v1/predictions/analytics` | Dashboard analytics |
| `GET` | `/api/v1/predictions/ml-status` | ML service status |

Full interactive docs: **http://localhost:8080/swagger-ui.html**

See [Disease_Prediction_Backend/README.md](Disease_Prediction_Backend/README.md) for detailed API and ML integration docs.

---

## Environment Variables

Copy `.env.example` to `.env` before running with Docker Compose:

| Variable | Description | Default |
|----------|-------------|---------|
| `POSTGRES_DB` | Database name | `disease_prediction_db` |
| `POSTGRES_USER` | Database user | `postgres` |
| `POSTGRES_PASSWORD` | Database password | — |
| `JWT_SECRET` | JWT signing key | — |
| `CORS_ALLOWED_ORIGINS` | Allowed frontend origins | `http://localhost:3000` |
| `ML_SERVICE_URL` | ML inference endpoint | `http://ml-service:5000/predict` |

---

## Deployment

The project includes a [`render.yaml`](render.yaml) blueprint for deploying to [Render](https://render.com):

- **ML Service** — Python web service with model training on build
- **Backend** — Dockerized Spring Boot with PostgreSQL
- **Frontend** — Static site / Nginx container

Frontend can also be deployed via Vercel using [`Disease_Prediction_Frontend/vercel.json`](Disease_Prediction_Frontend/vercel.json).

---

## License

This project is open source. See the repository for license details.

---

## Author

Built by [sehaj007saini](https://github.com/sehaj007saini)
