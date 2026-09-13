import os
import json
import pandas as pd
import numpy as np
import joblib

base_dir = os.path.dirname(os.path.abspath(__file__))
price_model = joblib.load(os.path.join(base_dir, 'price_model.pkl'))
le_commodity = joblib.load(os.path.join(base_dir, 'le_commodity.pkl'))
demand_model = joblib.load(os.path.join(base_dir, 'demand_model.pkl'))
le_crop = joblib.load(os.path.join(base_dir, 'le_crop.pkl'))
le_region = joblib.load(os.path.join(base_dir, 'le_region.pkl'))

# Load price data
price_csv = os.path.join(base_dir, 'crop_price_dataset (1).csv')
df_price = pd.read_csv(price_csv)
df_price['month'] = pd.to_datetime(df_price['month'])
df_price = df_price.sort_values(by=['commodity_name', 'month']).reset_index(drop=True)

# Load demand data
demand_csv = os.path.join(base_dir, 'Crop-Demand-Data.csv')
df_demand = pd.read_csv(demand_csv)
df_demand['date'] = pd.to_datetime(df_demand[['Year', 'Month']].assign(DAY=1))
df_demand = df_demand.sort_values(by=['Crop', 'Region', 'date']).reset_index(drop=True)

data_export = {
    'commodities': list(le_commodity.classes_),
    'crops': list(le_crop.classes_),
    'regions': list(le_region.classes_),
    'price_predictions': {},
    'demand_predictions': {}
}

# 1. Price predictions
for comm in le_commodity.classes_:
    comm_df = df_price[df_price['commodity_name'] == comm].sort_values('month').reset_index(drop=True)
    if len(comm_df) < 3:
        continue
    
    # 12 historical
    hist_slice = comm_df.tail(12)
    hist_records = [
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
    
    price_lag_1 = float(comm_df.iloc[-1]['avg_modal_price'])
    price_lag_2 = float(comm_df.iloc[-2]['avg_modal_price'])
    price_lag_3 = float(comm_df.iloc[-3]['avg_modal_price'])
    price_rolling_mean_3 = (price_lag_1 + price_lag_2 + price_lag_3) / 3.0
    
    commodity_encoded = int(le_commodity.transform([comm])[0])
    
    forecast = []
    curr_lag_1 = price_lag_1
    curr_lag_2 = price_lag_2
    curr_lag_3 = price_lag_3
    curr_rolling = price_rolling_mean_3
    
    for step in range(1, 7):
        target_date = last_date + pd.DateOffset(months=step)
        year = target_date.year
        month_num = target_date.month
        
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
        pred_val = max(1.0, pred_val)
        
        forecast.append({
            "month": target_date.strftime("%b %Y"),
            "date": target_date.strftime("%Y-%m"),
            "predicted_price": round(pred_val, 2)
        })
        
        curr_lag_3 = curr_lag_2
        curr_lag_2 = curr_lag_1
        curr_lag_1 = pred_val
        curr_rolling = (curr_lag_1 + curr_lag_2 + curr_lag_3) / 3.0
        
    data_export['price_predictions'][comm.lower()] = {
        "commodity_name": comm,
        "current_price": current_price,
        "predicted_price": forecast[0]["predicted_price"],
        "forecast": forecast,
        "historical": hist_records
    }

# 2. Demand predictions
for crop in le_crop.classes_:
    for region in le_region.classes_:
        demand_df = df_demand[(df_demand['Crop'] == crop) & (df_demand['Region'] == region)].sort_values('date').reset_index(drop=True)
        if len(demand_df) < 3:
            continue
            
        hist_slice = demand_df.tail(12)
        hist_records = [
            {
                "month": row['date'].strftime("%b %Y"),
                "date": row['date'].strftime("%Y-%m"),
                "demand": round(float(row['Market_Demand']), 2)
            }
            for _, row in hist_slice.iterrows()
        ]
        
        current_demand = round(float(demand_df.iloc[-1]['Market_Demand']), 2)
        last_date = demand_df.iloc[-1]['date']
        
        demand_lag_1 = float(demand_df.iloc[-1]['Market_Demand'])
        demand_lag_2 = float(demand_df.iloc[-2]['Market_Demand'])
        demand_lag_3 = float(demand_df.iloc[-3]['Market_Demand'])
        demand_rolling_mean_3 = (demand_lag_1 + demand_lag_2 + demand_lag_3) / 3.0
        
        region_encoded = int(le_region.transform([region])[0])
        crop_encoded = int(le_crop.transform([crop])[0])
        
        forecast = []
        curr_lag_1 = demand_lag_1
        curr_lag_2 = demand_lag_2
        curr_lag_3 = demand_lag_3
        curr_rolling = demand_rolling_mean_3
        
        for step in range(1, 7):
            target_date = last_date + pd.DateOffset(months=step)
            year = target_date.year
            month_num = target_date.month
            
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
            
            curr_lag_3 = curr_lag_2
            curr_lag_2 = curr_lag_1
            curr_lag_1 = pred_val
            curr_rolling = (curr_lag_1 + curr_lag_2 + curr_lag_3) / 3.0
            
        key = f"{crop.lower()}__{region.lower()}"
        data_export['demand_predictions'][key] = {
            "crop": crop,
            "region": region,
            "current_demand": current_demand,
            "predicted_demand": forecast[0]["predicted_demand"],
            "forecast": forecast,
            "historical": hist_records
        }

frontend_data_dir = os.path.join(os.path.dirname(base_dir), 'Frontend', 'src', 'data')
os.makedirs(frontend_data_dir, exist_ok=True)
out_path = os.path.join(frontend_data_dir, 'mlPredictionFallback.json')
with open(out_path, 'w', encoding='utf-8') as f:
    json.dump(data_export, f, indent=2)
print(f"Successfully generated {out_path} with {len(data_export['price_predictions'])} price predictions and {len(data_export['demand_predictions'])} demand predictions.")
