import os
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
import joblib

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
CSV_PATH = os.path.join(BASE_DIR, "diabetes.csv")

def train_and_save_models():
    print("Loading dataset...")
    df = pd.read_csv(CSV_PATH)

    # Encode categorical columns
    le_gender = LabelEncoder()
    df["gender_encoded"] = le_gender.fit_transform(df["gender"])

    le_smoking = LabelEncoder()
    df["smoking_encoded"] = le_smoking.fit_transform(df["smoking_history"])

    # Save encoders for reference if needed
    joblib.dump(le_gender, os.path.join(BASE_DIR, "gender_encoder.pkl"))
    joblib.dump(le_smoking, os.path.join(BASE_DIR, "smoking_encoder.pkl"))

    # Feature matrix: gender, age, hypertension, heart_disease, smoking_encoded, bmi, HbA1c_level, blood_glucose_level
    features = ["gender_encoded", "age", "hypertension", "heart_disease", "smoking_encoded", "bmi", "HbA1c_level", "blood_glucose_level"]

    # 1. Train Diabetes Model
    print("Training Diabetes model...")
    X_diab = df[features]
    y_diab = df["diabetes"]
    clf_diab = RandomForestClassifier(n_estimators=100, random_state=42, max_depth=12)
    clf_diab.fit(X_diab, y_diab)
    joblib.dump(clf_diab, os.path.join(BASE_DIR, "diabetes_model.pkl"))
    print("Saved diabetes_model.pkl")

    # 2. Train Heart Disease Classifier
    print("Training Heart Disease model...")
    X_hd = df[["gender_encoded", "age", "hypertension", "smoking_encoded", "bmi", "HbA1c_level", "blood_glucose_level", "diabetes"]]
    y_hd = df["heart_disease"]
    clf_hd = RandomForestClassifier(n_estimators=100, random_state=42, max_depth=12)
    clf_hd.fit(X_hd, y_hd)
    joblib.dump(clf_hd, os.path.join(BASE_DIR, "heart_disease_model.pkl"))
    print("Saved heart_disease_model.pkl")

    # 3. Train Hypertension Risk Model
    print("Training Hypertension model...")
    X_hyp = df[["gender_encoded", "age", "heart_disease", "smoking_encoded", "bmi", "HbA1c_level", "blood_glucose_level", "diabetes"]]
    y_hyp = df["hypertension"]
    clf_hyp = RandomForestClassifier(n_estimators=100, random_state=42, max_depth=12)
    clf_hyp.fit(X_hyp, y_hyp)
    joblib.dump(clf_hyp, os.path.join(BASE_DIR, "hypertension_model.pkl"))
    print("Saved hypertension_model.pkl")

    # 4. Train Chronic Kidney Disease Risk Model (Synthetic target based on clinical risk indicators)
    print("Training Kidney Disease model...")
    # Clinical heuristic for renal risk: high age + hypertension + high glucose/HbA1c + high BMI
    kidney_risk = (
        (df["age"] > 55).astype(int) +
        (df["hypertension"] == 1).astype(int) * 2 +
        (df["blood_glucose_level"] > 140).astype(int) * 2 +
        (df["HbA1c_level"] > 6.5).astype(int) * 2 +
        (df["bmi"] > 30).astype(int)
    )
    y_kidney = (kidney_risk >= 4).astype(int)

    X_kidney = df[features]
    clf_kidney = RandomForestClassifier(n_estimators=100, random_state=42, max_depth=12)
    clf_kidney.fit(X_kidney, y_kidney)
    joblib.dump(clf_kidney, os.path.join(BASE_DIR, "kidney_disease_model.pkl"))
    print("Saved kidney_disease_model.pkl")

    print("All models successfully trained and serialized!")

if __name__ == "__main__":
    train_and_save_models()
