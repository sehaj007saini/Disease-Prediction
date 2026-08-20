# Workspace Project Memory & Instructions: Multi-Disease Prediction Platform

## Project Overview
This repository contains a full-stack, microservice-based **Multi-Disease Prediction Platform**. It enables medical practitioners and users to perform AI-driven disease risk predictions (Diabetes, Heart Disease, Hypertension, Kidney Disease, Stroke), maintain patient records, process batch predictions, and monitor health analytics.

---

## Architecture & Technology Stack

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

### Components

1. **Python ML Engine (`Disease_Prediction/`)**
   - **Framework**: Python 3.11, FastAPI, Uvicorn
   - **ML Stack**: Scikit-Learn (RandomForest, GradientBoosting), Joblib, Pandas
   - **Supported Diseases**: Diabetes, Heart Disease, Hypertension, Kidney Disease, Stroke
   - **Port**: `5000`
   - **Key Files**:
     - `ml_api.py`: FastAPI server with `/predict` and `/health` endpoints
     - `train_models.py`: Model training pipeline saving `.pkl` model artifacts
     - `Dockerfile`: Container configuration running FastAPI

2. **Java Spring Boot Backend (`Disease_Prediction_Backend/`)**
   - **Framework**: Java 17, Spring Boot 3.2.5 (Web, JPA, Validation)
   - **Database**: PostgreSQL 16 (`disease_prediction_db`)
   - **Port**: `8080`
   - **Key Components**:
     - `PatientController` & `PatientServiceImpl`: Patient CRUD management
     - `PredictionController` & `PredictionServiceImpl`: Prediction invocation, logging, batch processing, and analytics
     - `MlInferenceServiceImpl`: RestTemplate HTTP client communicating with `http://localhost:5000/predict`
     - `WebConfig.java`: CORS configuration allowing origins (e.g., `http://localhost:3000`)
     - `Dockerfile`: Multi-stage Maven build to Temurin JRE container

3. **React Vite Frontend (`Disease_Prediction_Frontend/`)**
   - **Framework**: React 18, Vite, Lucide Icons, Modern CSS Design System
   - **Port**: `3000` (Dev server) / `80` (Nginx Docker container)
   - **Key Components**:
     - `Dashboard.jsx`: Risk metrics overview and analytics charts
     - `PredictionForm.jsx`: Interactive clinical input form for single predictions
     - `BatchPrediction.jsx`: Bulk CSV/JSON upload for multi-patient predictions
     - `PatientRegistry.jsx`: Patient management, search, and history tracking
     - `SystemHealth.jsx`: Live health status monitor for DB and ML Service
     - `services/api.js`: Axios HTTP client with proxy/fallback handling

4. **Docker & Orchestration (`docker-compose.yml`)**
   - Manages four containers: `disease-db`, `disease-ml-service`, `disease-backend`, and `disease-frontend`.
   - Uses environment defaults with healthy checks and automated dependency ordering.

---

## Directory Structure

```
DiseasePredictionProject/
├── AGENTS.md                                # Root workspace memory and developer rules
├── .agents/
│   └── AGENTS.md                            # Secondary agent context location
├── docker-compose.yml                       # Multi-service container orchestration
├── .env.example                             # Environment configuration template
│
├── Disease_Prediction/                      # ML Microservice (FastAPI + Scikit-Learn)
│   ├── ml_api.py                            # FastAPI application logic
│   ├── train_models.py                      # Script to train/export models
│   ├── requirements.txt                     # Python dependencies
│   └── Dockerfile                           # ML service docker configuration
│
├── Disease_Prediction_Backend/              # Backend Microservice (Spring Boot)
│   ├── pom.xml                              # Maven project definition
│   ├── src/main/java/com/disease/prediction/
│   │   ├── config/WebConfig.java            # CORS policies
│   │   ├── controller/                      # REST API Endpoints
│   │   ├── dto/                             # Data Transfer Objects
│   │   ├── model/                           # JPA Entities (Patient, PredictionRecord)
│   │   ├── repository/                      # Spring Data JPA Repositories
│   │   └── service/                         # Business Logic & ML Integration
│   └── Dockerfile                           # Backend docker build
│
└── Disease_Prediction_Frontend/             # Web User Interface (React + Vite)
    ├── vite.config.js                       # Vite configuration & proxy settings
    ├── nginx.conf                           # Nginx web server configuration
    ├── src/
    │   ├── services/api.js                  # Axios REST API client
    │   └── components/                      # UI Components
    └── Dockerfile                           # Frontend docker build
```

---

## Environment & Key Configurations

- **Spring Boot properties**: `Disease_Prediction_Backend/src/main/resources/application.properties`
  - `ml.service.url`: URL of Python ML service (default `http://localhost:5000/predict`)
  - `spring.datasource.url`: PostgreSQL connection string (default `jdbc:postgresql://localhost:5432/disease_prediction_db`)
- **Frontend API client**: `Disease_Prediction_Frontend/src/services/api.js`
  - Target Backend Base URL: `http://localhost:8080/api/v1`

---

## Common Development Commands

### 1. Docker Compose (Full Stack)
```bash
# Start all 4 services (PostgreSQL, ML Engine, Backend, Frontend)
docker-compose up --build -d

# Stop all services
docker-compose down
```

### 2. ML Engine (Python FastAPI)
```bash
cd Disease_Prediction
pip install -r requirements.txt
python train_models.py
uvicorn ml_api:app --reload --port 5000
```

### 3. Backend (Spring Boot Maven)
```bash
cd Disease_Prediction_Backend
mvn clean spring-boot:run
# Or run tests:
mvn clean test
```

### 4. Frontend (React Vite)
```bash
cd Disease_Prediction_Frontend
npm install
npm run dev
```

---

## Best Practices & Guidelines for Agents
- When modifying ML feature inputs in `ml_api.py`, update `PredictionRequestDto.java` and `PredictionForm.jsx` to keep all microservices synchronized.
- Ensure CORS configurations in `WebConfig.java` allow incoming requests from `http://localhost:3000`.
- Maintain standard error responses (`GlobalExceptionHandler.java`) when adding backend endpoints.
