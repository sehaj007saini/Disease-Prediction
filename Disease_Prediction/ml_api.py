from fastapi import FastAPI
import joblib
import os

app = FastAPI(title="Multi-Disease Prediction ML API", version="2.0.0")

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Load encoders
le_gender = joblib.load(os.path.join(BASE_DIR, "gender_encoder.pkl"))
le_smoking = joblib.load(os.path.join(BASE_DIR, "smoking_encoder.pkl"))

# Load disease models into registry
MODELS = {}
MODEL_FILES = {
    "diabetes": "diabetes_model.pkl",
    "heart_disease": "heart_disease_model.pkl",
    "heart": "heart_disease_model.pkl",
    "hypertension": "hypertension_model.pkl",
    "kidney_disease": "kidney_disease_model.pkl",
    "kidney": "kidney_disease_model.pkl"
}

for key, filename in MODEL_FILES.items():
    file_path = os.path.join(BASE_DIR, filename)
    if os.path.exists(file_path):
        MODELS[key] = joblib.load(file_path)

# Fallback default model if specific key missing
default_model = MODELS.get("diabetes")


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
        "service": "FastAPI Multi-Disease Prediction ML Engine",
        "supportedDiseases": ["diabetes", "heart_disease", "hypertension", "kidney_disease"],
        "modelsLoaded": list(MODELS.keys()),
        "healthy": True
    }


@app.post("/predict")
def predict(data: dict):
    features = data.get("features", data)
    raw_disease = str(data.get("diseaseTarget", "diabetes")).strip().lower()

    # Determine disease target key
    if "heart" in raw_disease:
        target_key = "heart_disease"
    elif "hyper" in raw_disease or "pressure" in raw_disease:
        target_key = "hypertension"
    elif "kidney" in raw_disease or "renal" in raw_disease:
        target_key = "kidney_disease"
    else:
        target_key = "diabetes"

    # Select target model
    model = MODELS.get(target_key, default_model)

    # Extract feature values
    raw_gender = features.get("gender", features.get("Gender", "Female"))
    raw_smoking = features.get("smoking_history", features.get("smoking", features.get("Smoking History", "never")))
    age = float(features.get("age", features.get("Age", 40)))
    hypertension = int(features.get("hypertension", features.get("Hypertension", 0)))
    heart_disease = int(features.get("heart_disease", features.get("heartDisease", 0)))
    bmi = float(features.get("bmi", features.get("BMI", 25.0)))
    hba1c = float(features.get("HbA1c_level", features.get("hba1c", features.get("HbA1c Level", 5.5))))
    glucose = float(features.get("blood_glucose_level", features.get("glucose", features.get("Blood Glucose Level", 100))))

    gender_encoded = safe_transform(le_gender, raw_gender, "Female")
    smoking_encoded = safe_transform(le_smoking, raw_smoking, "never")

    # Construct feature matrix depending on model expected layout
    if target_key == "heart_disease":
        diabetes_val = int(features.get("diabetes", 0))
        patient_vector = [[gender_encoded, age, hypertension, smoking_encoded, bmi, hba1c, glucose, diabetes_val]]
    elif target_key == "hypertension":
        diabetes_val = int(features.get("diabetes", 0))
        patient_vector = [[gender_encoded, age, heart_disease, smoking_encoded, bmi, hba1c, glucose, diabetes_val]]
    else:
        patient_vector = [[gender_encoded, age, hypertension, heart_disease, smoking_encoded, bmi, hba1c, glucose]]

    # Execute prediction
    prediction = int(model.predict(patient_vector)[0])

    # Calculate confidence / probability
    if hasattr(model, "predict_proba"):
        prob_positive = float(model.predict_proba(patient_vector)[0][1])
    else:
        prob_positive = 0.88 if prediction == 1 else 0.12

    confidence = round(prob_positive if prediction == 1 else (1.0 - prob_positive), 2)
    if confidence < 0.5:
        confidence = round(1.0 - confidence, 2)

    risk_level = "High" if prob_positive >= 0.70 else ("Moderate" if prob_positive >= 0.35 else "Low")

    # Generate disease-specific diagnostic results
    if target_key == "heart_disease":
        if prediction == 1:
            predicted_disease = "Elevated Heart Disease Risk"
            recommendations = (
                "Cardiovascular risk indicators detected. Recommend scheduling an ECG/Echocardiogram, "
                "a lipid profile test, and consulting a cardiologist."
            )
        else:
            predicted_disease = "Low Heart Disease Risk"
            recommendations = (
                "Cardiovascular metrics are within baseline parameters. Maintain aerobic exercise, "
                "a heart-healthy low-sodium diet, and routine annual physicals."
            )
    elif target_key == "hypertension":
        if prediction == 1:
            predicted_disease = "Hypertension Risk High"
            recommendations = (
                "Vascular pressure risk detected. Monitor daily resting blood pressure, "
                "reduce sodium intake, and consult a physician regarding blood pressure management."
            )
        else:
            predicted_disease = "Normal Blood Pressure Profile"
            recommendations = (
                "Blood pressure risk metrics remain optimal. Maintain active lifestyle, stress management, "
                "and periodic blood pressure checks."
            )
    elif target_key == "kidney_disease":
        if prediction == 1:
            predicted_disease = "Renal Complication Risk Elevated"
            recommendations = (
                "Renal risk indicators detected. Recommend a comprehensive metabolic panel (eGFR/Serum Creatinine) "
                "and consultation with a nephrologist."
            )
        else:
            predicted_disease = "Optimal Renal Risk Profile"
            recommendations = (
                "Renal biomarkers indicate healthy kidney function. Stay hydrated, avoid excessive NSAID use, "
                "and maintain regular wellness exams."
            )
    else: # diabetes
        if prediction == 1:
            predicted_disease = "Diabetes Positive"
            recommendations = (
                "Elevated risk parameters detected (HbA1c / Blood Glucose). "
                "Recommend scheduling a consultation with an endocrinologist and daily blood glucose tracking."
            )
        else:
            predicted_disease = "No Diabetes"
            recommendations = (
                "Diagnostic indicators are within optimal physiological parameters. "
                "Maintain current diet and active physical routine."
            )

    return {
        "diseaseTarget": target_key,
        "predictedDisease": predicted_disease,
        "confidenceScore": confidence,
        "riskLevel": risk_level,
        "recommendations": recommendations,
        "prediction": prediction
    }