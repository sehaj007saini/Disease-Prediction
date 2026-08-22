# Render Deployment Guide: Multi-Disease Prediction Platform

This guide outlines step-by-step instructions to deploy the **Java Spring Boot Backend** (and full stack) on [Render](https://render.com).

---

## Method 1: Deploying Backend as a Standalone Docker Web Service (Recommended)

### Step 1: Create a PostgreSQL Database on Render
1. Go to your [Render Dashboard](https://dashboard.render.com).
2. Click **New +** -> **PostgreSQL**.
3. Set Name to `disease-prediction-db` and Database to `disease_prediction_db`.
4. Click **Create Database**.
5. Once created, copy the **Internal Database URL** (for internal Render traffic) or **External Database URL** (for external access).
   - Format: `postgres://user:password@dpg-xxx-a/disease_prediction_db`

### Step 2: Create the Backend Web Service
1. On the Render Dashboard, click **New +** -> **Web Service**.
2. Connect your GitHub / GitLab repository.
3. Configure the service parameters:
   - **Name**: `disease-backend`
   - **Language / Environment**: `Docker`
   - **Root Directory**: `Disease_Prediction_Backend`
   - **Dockerfile Path**: `Dockerfile`
   - **Instance Type**: `Free` or `Starter`

4. Add the following **Environment Variables**:
   - `PORT`: `8080` (or leave default, Render maps `$PORT` automatically)
   - `SPRING_DATASOURCE_URL`: Paste your Render PostgreSQL Database URL (e.g., `postgres://user:password@dpg-xxx-a/disease_prediction_db`)
   - `ML_SERVICE_URL`: URL of your deployed Python ML FastAPI service (e.g., `https://disease-ml-service.onrender.com/predict`)
   - `CORS_ALLOWED_ORIGINS`: `*` (or your frontend URL, e.g., `https://disease-frontend.onrender.com`)

5. Click **Create Web Service**.

---

## Method 2: Deploying Backend as a Native Java Web Service (No Docker)

If you prefer deploying without Docker:
1. On Render Dashboard, click **New +** -> **Web Service**.
2. Select your repository.
3. Configure settings:
   - **Name**: `disease-backend`
   - **Environment**: `Java` (Java 17)
   - **Root Directory**: `Disease_Prediction_Backend`
   - **Build Command**: `mvn clean package -DskipTests`
   - **Start Command**: `java -XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0 -Djava.security.egd=file:/dev/./urandom -jar target/app.jar`
4. Set the same Environment Variables as Method 1 (`SPRING_DATASOURCE_URL`, `ML_SERVICE_URL`, `CORS_ALLOWED_ORIGINS`).

---

## Method 3: 1-Click Multi-Service Deployment using `render.yaml` Blueprint

The project root includes a `render.yaml` blueprint.
1. Push your repository to GitHub.
2. In Render Dashboard, click **New +** -> **Blueprint**.
3. Connect your repository.
4. Render will automatically detect `render.yaml` and provision:
   - PostgreSQL Database (`disease-prediction-db`)
   - ML FastAPI Microservice (`disease-ml-service`)
   - Spring Boot Backend (`disease-backend`)
   - React Frontend Static Site (`disease-frontend`)
5. Click **Apply**.

---

## Troubleshooting Common Render Issues

### 1. Database Connection Failures
- Render internal database URLs format: `postgres://username:password@dpg-xxxx-a/dbname`.
- Spring Boot automatically transforms `postgres://` or `postgresql://` into `jdbc:postgresql://` via `DatabaseConfig.java`.
- `DatabaseConfig.java` has `initializationFailTimeout=0` configured so that if the database is waking up, Spring Boot retries connections without crashing during startup.

### 2. Out-Of-Memory (OOM / Exit Code 137)
- Free tier containers have 512MB RAM.
- The `Dockerfile` includes JVM container memory optimization flags: `-XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0 -XX:InitialRAMPercentage=50.0 -Xss256k`.
