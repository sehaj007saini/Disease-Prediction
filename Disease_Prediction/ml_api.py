from fastapi import FastAPI
import joblib
import os

app = FastAPI(title="Disease Prediction ML API", version="1.0.0")

# Determine absolute path directory for model files
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Load trained model and encoders safely
model = joblib.load(os.path.join(BASE_DIR, "diabetes_model.pkl"))
le_gender = joblib.load(os.path.join(BASE_DIR, "gender_encoder.pkl"))
le_smoking = joblib.load(os.path.join(BASE_DIR, "smoking_encoder.pkl"))


def safe_transform(encoder, value, default_val=None):
    if default_val is None:
        default_val = encoder.classes_[0]
    val_str = str(value).strip()
    for cls in encoder.classes_:
        if str(cls).lower() == val_str.lower():
            return encoder.transform([cls])[0]
    return encoder.transform([default_val])[0]


@app.get("/")
@app.get("/health")
def health_check():
    return {
        "status": "UP",
        "service": "FastAPI Disease Prediction ML Engine",
        "healthy": True
    }


@app.post("/predict")
def predict(data: dict):
    # Support both nested Spring payload (features) and flat dictionary payload
    features = data.get("features", data)
    disease_target = data.get("diseaseTarget", "diabetes")

    # Extract feature values with flexible alias fallbacks
    raw_gender = features.get("gender", features.get("Gender", "Female"))
    raw_smoking = features.get("smoking_history", features.get("smoking", features.get("Smoking History", "never")))
    age = float(features.get("age", features.get("Age", 40)))
    hypertension = int(features.get("hypertension", features.get("Hypertension", 0)))
    heart_disease = int(features.get("heart_disease", features.get("heartDisease", 0)))
    bmi = float(features.get("bmi", features.get("BMI", 25.0)))
    hba1c = float(features.get("HbA1c_level", features.get("hba1c", features.get("HbA1c Level", 5.5))))
    glucose = float(features.get("blood_glucose_level", features.get("glucose", features.get("Blood Glucose Level", 100))))

    # Encode categorical variables
    gender_encoded = safe_transform(le_gender, raw_gender, "Female")
    smoking_encoded = safe_transform(le_smoking, raw_smoking, "never")

    # Construct feature matrix for model prediction
    patient_vector = [[
        gender_encoded,
        age,
        hypertension,
        heart_disease,
        smoking_encoded,
        bmi,
        hba1c,
        glucose
    ]]

    # Perform prediction
    prediction = int(model.predict(patient_vector)[0])

    # Calculate probability/confidence score
    if hasattr(model, "predict_proba"):
        prob_positive = float(model.predict_proba(patient_vector)[0][1])
    else:
        prob_positive = 0.88 if prediction == 1 else 0.12

    confidence = round(prob_positive if prediction == 1 else (1.0 - prob_positive), 2)
    if confidence < 0.5:
        confidence = round(1.0 - confidence, 2)

    # Determine risk level and diagnostic recommendations
    if prediction == 1:
        predicted_disease = "Diabetes Positive"
        risk_level = "High" if prob_positive >= 0.75 else "Moderate"
        recommendations = (
            "Elevated risk parameters detected (HbA1c / Blood Glucose). "
            "Recommend scheduling a formal consultation with an endocrinologist and regular blood glucose tracking."
        )
    else:
        predicted_disease = "No Diabetes"
        risk_level = "Low"
        recommendations = (
            "Diagnostic indicators are within optimal physiological parameters. "
            "Maintain current diet, active physical routine, and routine annual physical exams."
        )

    return {
        "diseaseTarget": disease_target,
        "predictedDisease": predicted_disease,
        "confidenceScore": confidence,
        "riskLevel": risk_level,
        "recommendations": recommendations,
        "prediction": prediction
    }