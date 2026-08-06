import streamlit as st
import pandas as pd
import joblib

# Load model and encoders
model = joblib.load("diabetes_model.pkl")
le_gender = joblib.load("gender_encoder.pkl")
le_smoking = joblib.load("smoking_encoder.pkl")

st.title("Diabetes Prediction")

st.write("Enter the patient's information:")

# User inputs
gender = st.selectbox(
    "Gender",
    le_gender.classes_
)

age = st.number_input(
    "Age",
    min_value=1,
    max_value=120,
    value=40
)

hypertension = st.selectbox(
    "Hypertension",
    [0, 1]
)

heart_disease = st.selectbox(
    "Heart Disease",
    [0, 1]
)

smoking_history = st.selectbox(
    "Smoking History",
    le_smoking.classes_
)

bmi = st.number_input(
    "BMI",
    min_value=0.0,
    max_value=100.0,
    value=25.0
)

hba1c = st.number_input(
    "HbA1c Level",
    min_value=0.0,
    max_value=20.0,
    value=5.5
)

glucose = st.number_input(
    "Blood Glucose Level",
    min_value=0,
    max_value=500,
    value=100
)

# Prediction
if st.button("Predict"):

    # Convert categorical values to numbers
    gender_encoded = le_gender.transform([gender])[0]
    smoking_encoded = le_smoking.transform([smoking_history])[0]

    # Create patient data
    patient = [[
        gender_encoded,
        age,
        hypertension,
        heart_disease,
        smoking_encoded,
        bmi,
        hba1c,
        glucose
    ]]

    # Make prediction
    prediction = model.predict(patient)[0]

    if prediction == 1:
        st.error("Model prediction: Diabetes")
    else:
        st.success("Model prediction: No Diabetes")