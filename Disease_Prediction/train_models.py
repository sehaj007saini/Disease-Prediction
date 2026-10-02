import os
import json
import joblib
import pandas as pd
import numpy as np
from sklearn.model_selection import StratifiedKFold, cross_validate
from sklearn.ensemble import HistGradientBoostingClassifier, RandomForestClassifier, ExtraTreesClassifier, VotingClassifier
from sklearn.metrics import accuracy_score, roc_auc_score, precision_score, recall_score, f1_score, confusion_matrix
from lightgbm import LGBMClassifier

from feature_engineering import preprocess_dataframe, encode_gender, encode_smoking

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
CSV_PATH = os.path.join(BASE_DIR, "diabetes.csv")
METRICS_PATH = os.path.join(BASE_DIR, "metrics.json")

# Optimal clinical decision thresholds to maximize F1-score & Recall on imbalanced targets
OPTIMAL_THRESHOLDS = {
    "diabetes": 0.40,
    "heart_disease": 0.15,
    "hypertension": 0.15,
    "kidney_disease": 0.50,
    "stroke": 0.50
}

def train_and_save_models():
    print("Loading dataset...", flush=True)
    df = pd.read_csv(CSV_PATH)
    df_proc = preprocess_dataframe(df)

    # Define synthetic targets for clinical risk profiles
    df_proc["kidney_disease"] = (
        (df_proc["age"] > 55).astype(int) +
        (df_proc["hypertension"] == 1).astype(int) * 2 +
        (df_proc["blood_glucose_level"] > 140).astype(int) * 2 +
        (df_proc["HbA1c_level"] > 6.5).astype(int) * 2 +
        (df_proc["bmi"] > 30).astype(int) >= 4
    ).astype(int)

    df_proc["stroke"] = (
        (df_proc["age"] > 60).astype(int) * 2 +
        (df_proc["hypertension"] == 1).astype(int) * 2 +
        (df_proc["heart_disease"] == 1).astype(int) * 2 +
        (df_proc["blood_glucose_level"] > 150).astype(int) * 2 +
        (df_proc["bmi"] > 30).astype(int) +
        (df_proc["smoking_encoded"] > 0).astype(int) >= 5
    ).astype(int)

    disease_configs = {
        "diabetes": {
            "target": "diabetes",
            "model_file": "diabetes_model.pkl",
            "features": ['gender_encoded', 'age', 'hypertension', 'heart_disease', 'smoking_encoded', 'bmi', 'HbA1c_level', 'blood_glucose_level', 'glucose_hba1c_prod', 'glucose_hba1c_ratio', 'is_high_hba1c', 'is_prediabetic', 'is_high_glucose', 'bmi_age_inter', 'metabolic_syndrome_score'],
            "display_name": "Gradient-Boosted Ensemble (HistGBM + RF + LightGBM)"
        },
        "heart_disease": {
            "target": "heart_disease",
            "model_file": "heart_disease_model.pkl",
            "features": ['gender_encoded', 'age', 'hypertension', 'smoking_encoded', 'bmi', 'HbA1c_level', 'blood_glucose_level', 'diabetes', 'glucose_hba1c_prod', 'glucose_hba1c_ratio', 'is_high_hba1c', 'is_prediabetic', 'is_high_glucose', 'bmi_age_inter', 'metabolic_syndrome_score'],
            "display_name": "Class-Weighted Gradient Boosted Ensemble"
        },
        "hypertension": {
            "target": "hypertension",
            "model_file": "hypertension_model.pkl",
            "features": ['gender_encoded', 'age', 'heart_disease', 'smoking_encoded', 'bmi', 'HbA1c_level', 'blood_glucose_level', 'diabetes', 'glucose_hba1c_prod', 'glucose_hba1c_ratio', 'is_high_hba1c', 'is_prediabetic', 'is_high_glucose', 'bmi_age_inter', 'metabolic_syndrome_score'],
            "display_name": "Class-Weighted Gradient Boosted Ensemble"
        },
        "kidney_disease": {
            "target": "kidney_disease",
            "model_file": "kidney_disease_model.pkl",
            "features": ['gender_encoded', 'age', 'hypertension', 'heart_disease', 'smoking_encoded', 'bmi', 'HbA1c_level', 'blood_glucose_level', 'diabetes', 'glucose_hba1c_prod', 'glucose_hba1c_ratio', 'is_high_hba1c', 'is_prediabetic', 'is_high_glucose', 'bmi_age_inter', 'metabolic_syndrome_score'],
            "display_name": "Multi-Biomarker Renal Classifier"
        },
        "stroke": {
            "target": "stroke",
            "model_file": "stroke_model.pkl",
            "features": ['gender_encoded', 'age', 'hypertension', 'heart_disease', 'smoking_encoded', 'bmi', 'HbA1c_level', 'blood_glucose_level', 'diabetes', 'glucose_hba1c_prod', 'glucose_hba1c_ratio', 'is_high_hba1c', 'is_prediabetic', 'is_high_glucose', 'bmi_age_inter', 'metabolic_syndrome_score'],
            "display_name": "Cerebrovascular Risk Assessment Ensemble"
        }
    }

    metrics_registry = {}
    is_fast_build = os.environ.get("RENDER") is not None or os.environ.get("FAST_BUILD", "false").lower() == "true"

    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)

    for d_key, config in disease_configs.items():
        print(f"\n==================================================", flush=True)
        print(f"Training & Evaluating Model for: {d_key.upper()}", flush=True)
        print(f"==================================================", flush=True)

        feature_cols = config["features"]
        X = df_proc[feature_cols]
        y = df_proc[config["target"]]

        # Configure base estimators for memory-efficient lightweight ensemble
        if d_key in ["heart_disease", "hypertension"]:
            m1 = HistGradientBoostingClassifier(max_iter=100, learning_rate=0.05, max_depth=8, class_weight='balanced', random_state=42)
            m2 = RandomForestClassifier(n_estimators=50, max_depth=10, class_weight='balanced', random_state=42, n_jobs=-1)
            m3 = LGBMClassifier(n_estimators=80, max_depth=5, verbose=-1, random_state=42, is_unbalance=True)
        else:
            m1 = HistGradientBoostingClassifier(max_iter=100, learning_rate=0.05, max_depth=8, random_state=42)
            m2 = RandomForestClassifier(n_estimators=50, max_depth=10, random_state=42, n_jobs=-1)
            m3 = LGBMClassifier(n_estimators=80, max_depth=5, verbose=-1, random_state=42)

        ensemble = VotingClassifier(
            estimators=[('hgbm', m1), ('rf', m2), ('lgbm', m3)],
            voting='soft'
        )

        thresh = OPTIMAL_THRESHOLDS.get(d_key, 0.50)

        if is_fast_build:
            print("Fast build mode detected (Render / Cloud container). Performing single train/val fit...", flush=True)
            from sklearn.model_selection import train_test_split
            X_tr, X_va, y_tr, y_va = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
            ensemble.fit(X_tr, y_tr)
            val_probs = ensemble.predict_proba(X_va)[:, 1]
            oof_preds = (val_probs >= thresh).astype(int)

            acc = round(float(accuracy_score(y_va, oof_preds)), 4)
            roc = round(float(roc_auc_score(y_va, val_probs)), 4)
            prec = round(float(precision_score(y_va, oof_preds, zero_division=0)), 4)
            rec = round(float(recall_score(y_va, oof_preds)), 4)
            f1 = round(float(f1_score(y_va, oof_preds)), 4)

            tn, fp, fn, tp = confusion_matrix(y_va, oof_preds).ravel()
            spec = round(float(tn / (tn + fp)), 4) if (tn + fp) > 0 else 0.0

            print(f"Fitting final ensemble on full dataset...", flush=True)
            ensemble.fit(X, y)
        else:
            # Out-of-fold cross-validation metrics
            oof_probs = np.zeros(len(df_proc))
            for train_idx, val_idx in cv.split(X, y):
                X_tr, y_tr = X.iloc[train_idx], y.iloc[train_idx]
                X_va, y_va = X.iloc[val_idx], y.iloc[val_idx]
                ensemble.fit(X_tr, y_tr)
                oof_probs[val_idx] = ensemble.predict_proba(X_va)[:, 1]

            oof_preds = (oof_probs >= thresh).astype(int)

            acc = round(float(accuracy_score(y, oof_preds)), 4)
            roc = round(float(roc_auc_score(y, oof_probs)), 4)
            prec = round(float(precision_score(y, oof_preds, zero_division=0)), 4)
            rec = round(float(recall_score(y, oof_preds)), 4)
            f1 = round(float(f1_score(y, oof_preds)), 4)

            tn, fp, fn, tp = confusion_matrix(y, oof_preds).ravel()
            spec = round(float(tn / (tn + fp)), 4) if (tn + fp) > 0 else 0.0

            print(f"Fitting final ensemble on full dataset...", flush=True)
            ensemble.fit(X, y)

        print(f"Metrics (@ threshold={thresh}):", flush=True)
        print(f"  Accuracy:    {acc * 100:.2f}%", flush=True)
        print(f"  ROC-AUC:     {roc:.4f}", flush=True)
        print(f"  Precision:   {prec * 100:.2f}%", flush=True)
        print(f"  Recall:      {rec * 100:.2f}%", flush=True)
        print(f"  F1-Score:    {f1:.4f}", flush=True)
        print(f"  Specificity: {spec * 100:.2f}%", flush=True)


        # Feature importances (extracted from RF component)
        rf_component = ensemble.named_estimators_['rf']
        importances = rf_component.feature_importances_
        feature_importance_list = []
        for feat_name, imp in zip(feature_cols, importances):
            clean_name = feat_name.replace("_encoded", "").replace("_", " ").title()
            feature_importance_list.append({
                "feature": clean_name,
                "importance": round(float(imp), 4)
            })
        feature_importance_list.sort(key=lambda x: x["importance"], reverse=True)

        # Save model file
        model_filepath = os.path.join(BASE_DIR, config["model_file"])
        joblib.dump(ensemble, model_filepath)
        print(f"Saved model artifact: {config['model_file']}", flush=True)

        metrics_registry[d_key] = {
            "modelName": config["display_name"],
            "accuracy": acc,
            "rocAuc": roc,
            "precision": prec,
            "recall": rec,
            "f1Score": f1,
            "specificity": spec,
            "optimalThreshold": thresh,
            "features": feature_cols,
            "featureImportances": feature_importance_list[:8]
        }

    # Save governance metrics JSON
    with open(METRICS_PATH, "w") as f:
        json.dump(metrics_registry, f, indent=2)
    print(f"\nSaved dynamic model governance metrics to metrics.json!", flush=True)
    print("All models successfully trained, optimized, and serialized!", flush=True)

if __name__ == "__main__":
    train_and_save_models()
