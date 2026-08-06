from fastapi import FastAPI
import joblib

app = FastAPI()

# Load the trained model
model = joblib.load("diabetes_model.pkl")

# Load encoders
le_gender = joblib.load("gender_encoder.pkl")
le_smoking = joblib.load("smoking_encoder.pkl")


@app.get("/")
def home():
    return {"message": "Diabetes ML API is running"}


@app.post("/predict")
def predict(data: dict):

    # Convert categorical values
    gender = le_gender.transform([data["gender"]])[0]
    smoking = le_smoking.transform([data["smoking_history"]])[0]

    # Create input for model
    patient = [[
        gender,
        data["age"],
        data["hypertension"],
        data["heart_disease"],
        smoking,
        data["bmi"],
        data["HbA1c_level"],
        data["blood_glucose_level"]
    ]]

    # Make prediction
    prediction = model.predict(patient)[0]

    return {
        "prediction": int(prediction)
    }