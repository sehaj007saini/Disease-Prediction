import pandas as pd
import numpy as np

GENDER_MAP = {'female': 0.0, 'male': 1.0, 'other': 0.0}
SMOKING_MAP = {'never': 0.0, 'no info': 0.3, 'former': 0.7, 'not current': 0.7, 'ever': 1.0, 'current': 1.0}

def encode_gender(val):
    v = str(val).strip().lower()
    return GENDER_MAP.get(v, 0.0)

def encode_smoking(val):
    v = str(val).strip().lower()
    return SMOKING_MAP.get(v, 0.0)

def extract_features_from_dict(features_dict: dict, target_key: str = "diabetes") -> pd.DataFrame:
    raw_gender = features_dict.get("gender", features_dict.get("Gender", "Female"))
    raw_smoking = features_dict.get("smoking_history", features_dict.get("smoking", features_dict.get("Smoking History", "never")))
    age = float(features_dict.get("age", features_dict.get("Age", 40.0)))
    hypertension = int(features_dict.get("hypertension", features_dict.get("Hypertension", 0)))
    heart_disease = int(features_dict.get("heart_disease", features_dict.get("heartDisease", 0)))
    bmi = float(features_dict.get("bmi", features_dict.get("BMI", 25.0)))
    hba1c = float(features_dict.get("HbA1c_level", features_dict.get("hba1c", features_dict.get("HbA1c Level", 5.5))))
    glucose = float(features_dict.get("blood_glucose_level", features_dict.get("glucose", features_dict.get("Blood Glucose Level", 100.0))))
    diabetes = int(features_dict.get("diabetes", features_dict.get("Diabetes", 0)))

    gender_enc = encode_gender(raw_gender)
    smoking_enc = encode_smoking(raw_smoking)

    glucose_hba1c_prod = glucose * hba1c
    glucose_hba1c_ratio = glucose / (hba1c + 1e-5)
    is_high_hba1c = 1.0 if hba1c >= 6.5 else 0.0
    is_prediabetic = 1.0 if (5.7 <= hba1c < 6.5) else 0.0
    is_high_glucose = 1.0 if glucose >= 140.0 else 0.0
    bmi_age_inter = bmi * age
    metabolic_syndrome_score = (1.0 if bmi > 30 else 0.0) + (1.0 if hypertension == 1 else 0.0) + (1.0 if glucose > 140 else 0.0)

    row = {
        'gender_encoded': gender_enc,
        'age': age,
        'hypertension': float(hypertension),
        'heart_disease': float(heart_disease),
        'smoking_encoded': smoking_enc,
        'bmi': bmi,
        'HbA1c_level': hba1c,
        'blood_glucose_level': glucose,
        'diabetes': float(diabetes),
        'glucose_hba1c_prod': glucose_hba1c_prod,
        'glucose_hba1c_ratio': glucose_hba1c_ratio,
        'is_high_hba1c': is_high_hba1c,
        'is_prediabetic': is_prediabetic,
        'is_high_glucose': is_high_glucose,
        'bmi_age_inter': bmi_age_inter,
        'metabolic_syndrome_score': metabolic_syndrome_score
    }
    df = pd.DataFrame([row])
    
    # Return features tailored to specific model target
    if target_key == "heart_disease":
        cols = ['gender_encoded', 'age', 'hypertension', 'smoking_encoded', 'bmi', 'HbA1c_level', 'blood_glucose_level', 'diabetes', 'glucose_hba1c_prod', 'glucose_hba1c_ratio', 'is_high_hba1c', 'is_prediabetic', 'is_high_glucose', 'bmi_age_inter', 'metabolic_syndrome_score']
    elif target_key == "hypertension":
        cols = ['gender_encoded', 'age', 'heart_disease', 'smoking_encoded', 'bmi', 'HbA1c_level', 'blood_glucose_level', 'diabetes', 'glucose_hba1c_prod', 'glucose_hba1c_ratio', 'is_high_hba1c', 'is_prediabetic', 'is_high_glucose', 'bmi_age_inter', 'metabolic_syndrome_score']
    elif target_key in ["kidney_disease", "stroke"]:
        cols = ['gender_encoded', 'age', 'hypertension', 'heart_disease', 'smoking_encoded', 'bmi', 'HbA1c_level', 'blood_glucose_level', 'diabetes', 'glucose_hba1c_prod', 'glucose_hba1c_ratio', 'is_high_hba1c', 'is_prediabetic', 'is_high_glucose', 'bmi_age_inter', 'metabolic_syndrome_score']
    else: # diabetes
        cols = ['gender_encoded', 'age', 'hypertension', 'heart_disease', 'smoking_encoded', 'bmi', 'HbA1c_level', 'blood_glucose_level', 'glucose_hba1c_prod', 'glucose_hba1c_ratio', 'is_high_hba1c', 'is_prediabetic', 'is_high_glucose', 'bmi_age_inter', 'metabolic_syndrome_score']

    return df[cols]

def preprocess_dataframe(df: pd.DataFrame) -> pd.DataFrame:
    d = df.copy()
    d['gender_encoded'] = d['gender'].map(encode_gender).fillna(0.0)
    d['smoking_encoded'] = d['smoking_history'].map(encode_smoking).fillna(0.0)

    d['glucose_hba1c_prod'] = d['blood_glucose_level'] * d['HbA1c_level']
    d['glucose_hba1c_ratio'] = d['blood_glucose_level'] / (d['HbA1c_level'] + 1e-5)
    d['is_high_hba1c'] = (d['HbA1c_level'] >= 6.5).astype(float)
    d['is_prediabetic'] = ((d['HbA1c_level'] >= 5.7) & (d['HbA1c_level'] < 6.5)).astype(float)
    d['is_high_glucose'] = (d['blood_glucose_level'] >= 140.0).astype(float)
    d['bmi_age_inter'] = d['bmi'] * d['age']
    d['metabolic_syndrome_score'] = (d['bmi'] > 30).astype(float) + (d['hypertension'] == 1).astype(float) + (d['blood_glucose_level'] > 140).astype(float)
    return d
