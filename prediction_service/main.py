import os
import sys
import warnings
from typing import List, Optional
import pandas as pd
import numpy as np
import joblib
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

warnings.filterwarnings('ignore')

app = FastAPI(
    title="AgriSathi ML Prediction API",
    description="Microservice serving XGBoost models for commodity price and market demand forecasting.",
    version="1.0.0"
)

# Enable CORS for frontend and backend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Base directory for models and datasets
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
# Fallback to ../model if not in local directory
DATA_DIR = BASE_DIR if os.path.exists(os.path.join(BASE_DIR, "price_model.pkl")) else os.path.join(os.path.dirname(BASE_DIR), "model")

def get_path(filename: str) -> str:
    local_path = os.path.join(BASE_DIR, filename)
    if os.path.exists(local_path):
        return local_path
    fallback_path = os.path.join(DATA_DIR, filename)
    if os.path.exists(fallback_path):
        return fallback_path
    # Check alternate name for price csv
    if "crop_price_dataset" in filename:
        for alt in ["crop_price_dataset (1).csv", "crop_price_dataset__1_.csv", "crop_price_dataset.csv"]:
            alt_local = os.path.join(BASE_DIR, alt)
            if os.path.exists(alt_local):
                return alt_local
            alt_fallback = os.path.join(DATA_DIR, alt)
            if os.path.exists(alt_fallback):
                return alt_fallback
    return local_path

print(f"Loading ML models and historical datasets from {DATA_DIR}...")

# 1. Load Price Prediction Model and Encoders
price_model = joblib.load(get_path("price_model.pkl"))
le_commodity = joblib.load(get_path("le_commodity.pkl"))

# 2. Load Demand Prediction Model and Encoders
demand_model = joblib.load(get_path("demand_model.pkl"))
le_crop = joblib.load(get_path("le_crop.pkl"))
le_region = joblib.load(get_path("le_region.pkl"))

# 3. Load and Preprocess Price Dataset
price_csv_path = get_path("crop_price_dataset (1).csv")
df_price = pd.read_csv(price_csv_path)
df_price['month'] = pd.to_datetime(df_price['month'])
df_price = df_price.sort_values(by=['commodity_name', 'month']).reset_index(drop=True)

# 4. Load and Preprocess Demand Dataset
demand_csv_path = get_path("Crop-Demand-Data.csv")
df_demand = pd.read_csv(demand_csv_path)
df_demand['date'] = pd.to_datetime(df_demand[['Year', 'Month']].assign(DAY=1))
df_demand = df_demand.sort_values(by=['Crop', 'Region', 'date']).reset_index(drop=True)

print("All models and datasets loaded successfully into memory.")
print(f"Known Commodities ({len(le_commodity.classes_)}): {list(le_commodity.classes_)}")
print(f"Known Crops ({len(le_crop.classes_)}): {list(le_crop.classes_)}")
print(f"Known Regions ({len(le_region.classes_)}): {list(le_region.classes_)}")


# --- Helper normalizers ---
def match_commodity_name(query: str) -> Optional[str]:
    if not query:
        return None
    query_clean = query.strip().lower()
    
    # Exact match
    for c in le_commodity.classes_:
        if c.lower() == query_clean:
            return c
            
    # Starts with / substring match
    for c in le_commodity.classes_:
        if query_clean in c.lower() or c.lower().startswith(query_clean):
            return c
            
    # Word match (e.g. 'Wheat (Sharbati)' -> 'Wheat')
    for c in le_commodity.classes_:
        words = c.lower().replace('(', ' ').replace(')', ' ').split()
        if any(w == query_clean for w in words):
            return c
        query_words = query_clean.replace('(', ' ').replace(')', ' ').split()
        if any(qw in words for qw in query_words):
            return c
            
    return None

def match_crop_name(query: str) -> Optional[str]:
    if not query:
        return None
    query_clean = query.strip().lower()
    for c in le_crop.classes_:
        if c.lower() == query_clean:
            return c
    for c in le_crop.classes_:
        if query_clean in c.lower() or c.lower() in query_clean:
            return c
    return None

def match_region_name(query: str) -> Optional[str]:
    if not query:
        return None
    query_clean = query.strip().lower()
    for r in le_region.classes_:
        if r.lower() == query_clean:
            return r
    for r in le_region.classes_:
        if query_clean in r.lower() or r.lower() in query_clean:
            return r
    # Strip 'division' keyword
    q_no_div = query_clean.replace("division", "").strip()
    for r in le_region.classes_:
        if q_no_div and q_no_div in r.lower():
            return r
    return None


# --- Endpoints ---

@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "service": "AgriSathi ML Prediction Service",
        "models": {
            "price_model": "loaded",
            "demand_model": "loaded"
        },
        "commodities_count": len(le_commodity.classes_),
        "crops_count": len(le_crop.classes_),
        "regions_count": len(le_region.classes_)
    }

@app.get("/commodities")
def get_commodities():
    """Returns list of supported commodities for price prediction"""
    return {
        "commodities": sorted(list(le_commodity.classes_))
    }

@app.get("/crops-and-regions")
def get_crops_and_regions():
    """Returns list of supported crops and regions for demand prediction"""
    return {
        "crops": sorted(list(le_crop.classes_)),
        "regions": sorted(list(le_region.classes_))
    }

@app.get("/predict/price")
def predict_price(
    commodity_name: str = Query(..., description="Name of commodity (e.g. Wheat, Tomato, Onion, Maize)"),
    months_ahead: int = Query(1, ge=1, le=12, description="Number of months to forecast ahead")
):
    # 1. Match commodity name gracefully
    matched_commodity = match_commodity_name(commodity_name)
    if not matched_commodity:
        raise HTTPException(
            status_code=404,
            detail=f"Unknown commodity '{commodity_name}'. Available commodities: {list(le_commodity.classes_)}"
        )

    # 2. Filter historical records for this commodity
    comm_df = df_price[df_price['commodity_name'] == matched_commodity].sort_values('month').reset_index(drop=True)
    if len(comm_df) < 3:
        raise HTTPException(
            status_code=400,
            detail=f"Insufficient historical price records for commodity '{matched_commodity}' (minimum 3 months required)."
        )

    # 3. Extract last 12 historical months for chart display
    hist_slice = comm_df.tail(12)
    historical_points = [
        {
            "month": row['month'].strftime("%b %Y"),
            "date": row['month'].strftime("%Y-%m"),
            "avg_modal_price": round(float(row['avg_modal_price']), 2),
            "avg_min_price": round(float(row['avg_min_price']), 2) if 'avg_min_price' in row and pd.notnull(row['avg_min_price']) else None,
            "avg_max_price": round(float(row['avg_max_price']), 2) if 'avg_max_price' in row and pd.notnull(row['avg_max_price']) else None,
        }
        for _, row in hist_slice.iterrows()
    ]

    current_price = round(float(comm_df.iloc[-1]['avg_modal_price']), 2)
    last_date = comm_df.iloc[-1]['month']

    # 4. Extract lag values from the most recent 3 months
    price_lag_1 = float(comm_df.iloc[-1]['avg_modal_price'])
    price_lag_2 = float(comm_df.iloc[-2]['avg_modal_price'])
    price_lag_3 = float(comm_df.iloc[-3]['avg_modal_price'])
    price_rolling_mean_3 = (price_lag_1 + price_lag_2 + price_lag_3) / 3.0

    commodity_encoded = int(le_commodity.transform([matched_commodity])[0])

    forecast = []
    curr_lag_1 = price_lag_1
    curr_lag_2 = price_lag_2
    curr_lag_3 = price_lag_3
    curr_rolling = price_rolling_mean_3

    # 5. Recursive forecast loop
    for step in range(1, months_ahead + 1):
        target_date = last_date + pd.DateOffset(months=step)
        year = target_date.year
        month_num = target_date.month

        # Feature vector matching training notebook exactly:
        # ['year', 'month_num', 'commodity_encoded', 'price_lag_1', 'price_lag_2', 'price_lag_3', 'price_rolling_mean_3']
        features_df = pd.DataFrame([{
            'year': year,
            'month_num': month_num,
            'commodity_encoded': commodity_encoded,
            'price_lag_1': curr_lag_1,
            'price_lag_2': curr_lag_2,
            'price_lag_3': curr_lag_3,
            'price_rolling_mean_3': curr_rolling
        }])

        pred_val = float(price_model.predict(features_df)[0])
        pred_val = max(1.0, pred_val)  # Guarantee non-negative price

        forecast.append({
            "month": target_date.strftime("%b %Y"),
            "date": target_date.strftime("%Y-%m"),
            "predicted_price": round(pred_val, 2)
        })

        # Update recursive lag features
        curr_lag_3 = curr_lag_2
        curr_lag_2 = curr_lag_1
        curr_lag_1 = pred_val
        curr_rolling = (curr_lag_1 + curr_lag_2 + curr_lag_3) / 3.0

    return {
        "commodity_name": matched_commodity,
        "current_price": current_price,
        "predicted_price": forecast[0]["predicted_price"],
        "forecast": forecast,
        "historical": historical_points
    }

@app.get("/predict/demand")
def predict_demand(
    crop: str = Query(..., description="Name of crop (e.g. Wheat, Gram, Paddy, Maize)"),
    region: str = Query(..., description="Region / APMC division (e.g. Raipur Division, Bilaspur Division)"),
    months_ahead: int = Query(1, ge=1, le=12, description="Number of months to forecast ahead")
):
    # 1. Match crop & region gracefully
    matched_crop = match_crop_name(crop)
    if not matched_crop:
        raise HTTPException(
            status_code=404,
            detail=f"Unknown crop '{crop}'. Available crops: {list(le_crop.classes_)}"
        )

    matched_region = match_region_name(region)
    if not matched_region:
        raise HTTPException(
            status_code=404,
            detail=f"Unknown region '{region}'. Available regions: {list(le_region.classes_)}"
        )

    # 2. Filter historical records for this crop + region
    demand_df = df_demand[(df_demand['Crop'] == matched_crop) & (df_demand['Region'] == matched_region)].sort_values('date').reset_index(drop=True)
    if len(demand_df) < 3:
        raise HTTPException(
            status_code=400,
            detail=f"Insufficient historical demand records for crop '{matched_crop}' in region '{matched_region}' (minimum 3 months required)."
        )

    # 3. Extract last 12 historical records
    hist_slice = demand_df.tail(12)
    historical_points = [
        {
            "month": row['date'].strftime("%b %Y"),
            "date": row['date'].strftime("%Y-%m"),
            "demand": round(float(row['Market_Demand']), 2)
        }
        for _, row in hist_slice.iterrows()
    ]

    current_demand = round(float(demand_df.iloc[-1]['Market_Demand']), 2)
    last_date = demand_df.iloc[-1]['date']

    # 4. Extract lag values
    demand_lag_1 = float(demand_df.iloc[-1]['Market_Demand'])
    demand_lag_2 = float(demand_df.iloc[-2]['Market_Demand'])
    demand_lag_3 = float(demand_df.iloc[-3]['Market_Demand'])
    demand_rolling_mean_3 = (demand_lag_1 + demand_lag_2 + demand_lag_3) / 3.0

    region_encoded = int(le_region.transform([matched_region])[0])
    crop_encoded = int(le_crop.transform([matched_crop])[0])

    forecast = []
    curr_lag_1 = demand_lag_1
    curr_lag_2 = demand_lag_2
    curr_lag_3 = demand_lag_3
    curr_rolling = demand_rolling_mean_3

    # 5. Recursive forecast loop
    for step in range(1, months_ahead + 1):
        target_date = last_date + pd.DateOffset(months=step)
        year = target_date.year
        month_num = target_date.month

        # Feature vector matching training notebook exactly:
        # ['year', 'month_num', 'region_encoded', 'crop_encoded', 'demand_lag_1', 'demand_lag_2', 'demand_lag_3', 'demand_rolling_mean_3']
        features_df = pd.DataFrame([{
            'year': year,
            'month_num': month_num,
            'region_encoded': region_encoded,
            'crop_encoded': crop_encoded,
            'demand_lag_1': curr_lag_1,
            'demand_lag_2': curr_lag_2,
            'demand_lag_3': curr_lag_3,
            'demand_rolling_mean_3': curr_rolling
        }])

        pred_val = float(demand_model.predict(features_df)[0])
        pred_val = max(1.0, pred_val)

        forecast.append({
            "month": target_date.strftime("%b %Y"),
            "date": target_date.strftime("%Y-%m"),
            "predicted_demand": round(pred_val, 2)
        })

        # Update recursive lag features
        curr_lag_3 = curr_lag_2
        curr_lag_2 = curr_lag_1
        curr_lag_1 = pred_val
        curr_rolling = (curr_lag_1 + curr_lag_2 + curr_lag_3) / 3.0

    return {
        "crop": matched_crop,
        "region": matched_region,
        "current_demand": current_demand,
        "predicted_demand": forecast[0]["predicted_demand"],
        "forecast": forecast,
        "historical": historical_points
    }


if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    print(f"Starting AgriSathi ML Prediction API on port {port}...")
    uvicorn.run(app, host="0.0.0.0", port=port)
