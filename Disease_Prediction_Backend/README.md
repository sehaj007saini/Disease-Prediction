# Disease Prediction Spring Boot & PostgreSQL Backend

A high-performance, enterprise-ready Spring Boot backend for disease prediction systems. Integrates with PostgreSQL for persistent patient records and prediction logs, providing RESTful endpoints to connect your trained Machine Learning models.

---

## Architecture Overview

```
+------------------+         REST API        +-------------------------------+         JPA/SQL        +-------------------------+
|                  | ----------------------> |                               | ---------------------> |                         |
| Client / Frontend|                         |  Spring Boot Backend Service  |                        |  PostgreSQL Database    |
|                  | <---------------------- |                               | <--------------------- |  (disease_prediction_db)|
+------------------+                         +-------------------------------+                        +-------------------------+
                                                            |
                                                            | REST Client (RestTemplate)
                                                            v
                                             +-------------------------------+
                                             | Your ML Model API Service     |
                                             | (e.g. http://localhost:5000)  |
                                             +-------------------------------+
```

---

## Features

- **Patient Management**: Full CRUD REST APIs for managing patient records (`/api/v1/patients`).
- **Disease Prediction**: Endpoints for running real-time disease predictions using input features (`/api/v1/predictions`).
- **Batch Predictions**: Bulk prediction processing (`/api/v1/predictions/batch`).
- **Analytics & Dashboard API**: Aggregate statistics on risk distribution and disease targets (`/api/v1/predictions/analytics`).
- **ML Model Health Check**: Live monitoring of external ML service connectivity and latency (`/api/v1/predictions/ml-status`).
- **OpenAPI Swagger UI**: Interactive API documentation available at `http://localhost:8080/swagger-ui.html`.
- **PostgreSQL Integration**: Automatic schema generation, indexing, and JPA persistence.
- **Configurable ML Model Integration**: Easily point the backend to any REST-based ML service endpoint (scikit-learn, PyTorch, TensorFlow, etc.).
- **Robust Exception Handling**: Global REST exception handler with standard JSON error bodies.

---

## Prerequisites

1. **Java 17+** (or Java 21 / 25)
2. **PostgreSQL** installed and running on `localhost:5432` (or remote server)
3. **Maven** (or Maven Wrapper `mvnw`)

---

## Database Setup

1. Open PostgreSQL terminal or pgAdmin and create the database:
   ```sql
   CREATE DATABASE disease_prediction_db;
   ```

2. Configure credentials in [application.properties](file:///e:/Machine-Learning/Disease_Prediction_Backend/src/main/resources/application.properties):
   ```properties
   spring.datasource.url=jdbc:postgresql://localhost:5432/disease_prediction_db
   spring.datasource.username=postgres
   spring.datasource.password=your_postgres_password
   ```

---

## Connecting Your Machine Learning Model

The backend communicates with your ML model via HTTP REST POST requests. Set your ML service URL in [application.properties](file:///e:/Machine-Learning/Disease_Prediction_Backend/src/main/resources/application.properties):

```properties
ml.service.url=http://localhost:5000/predict
ml.service.timeout.ms=5000
```

### Expected Payload to Your ML Model (`POST /predict`):

```json
{
  "diseaseTarget": "diabetes",
  "features": {
    "age": 45,
    "glucose": 140,
    "bloodPressure": 80,
    "bmi": 28.5
  }
}
```

### Expected Response from Your ML Model:

```json
{
  "predictedDisease": "Diabetes Positive",
  "confidenceScore": 0.89,
  "riskLevel": "High",
  "recommendations": "Schedule follow-up with endocrinologist and monitor blood glucose daily."
}
```

---

## Running the Backend & Tests

From the project root directory, run:

```bash
# Run application
mvn clean spring-boot:run

# Run unit and integration tests
mvn clean test
```

The application will start on port `8080`.
Access Swagger UI at: **http://localhost:8080/swagger-ui.html**

---

## API Endpoints Reference

### 1. Health Check
- `GET /api/v1/health` - Backend status and server timestamp.

### 2. Patient APIs
- `POST /api/v1/patients` - Create patient profile.
- `GET /api/v1/patients` - Retrieve all patients.
- `GET /api/v1/patients/{id}` - Retrieve patient by ID.
- `PUT /api/v1/patients/{id}` - Update patient details.
- `DELETE /api/v1/patients/{id}` - Delete patient record.

### 3. Prediction APIs
- `POST /api/v1/predictions` - Single disease prediction & storage.
- `POST /api/v1/predictions/batch` - Batch disease predictions for multiple samples.
- `GET /api/v1/predictions/{id}` - Retrieve specific prediction record.
- `GET /api/v1/predictions/patient/{patientId}` - Retrieve prediction logs for a patient.
- `GET /api/v1/predictions/analytics` - Aggregated counts by risk level & disease target.
- `GET /api/v1/predictions/ml-status` - Monitor status & response latency of external ML model service.

