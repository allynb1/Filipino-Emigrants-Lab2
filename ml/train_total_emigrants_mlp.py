import os
import json
import numpy as np
import pandas as pd
from sklearn.neural_network import MLPRegressor
from sklearn.preprocessing import MinMaxScaler

# ---------------- CONFIG ----------------
DATA_PATH = "ml/data/Emigrant-1981-2020-AllCountries.csv"
OUTPUT_JSON = "public/data/forecast_total_emigrants.json"

os.makedirs("public/data", exist_ok=True)

# ---------------- LOAD DATA ----------------
# If your file is comma-separated, keep sep=",".
# If it is tab-separated, change to sep="\t".
df = pd.read_csv(DATA_PATH, sep=",")

# Country names in first column, years as other columns
df = df.set_index("COUNTRY")

# Sum across all countries to get total emigrants per year
total_per_year = df.sum(axis=0)  # index = year strings

years = total_per_year.index.astype(int).values
values = total_per_year.values.reshape(-1, 1)

# ---------------- SCALE & MAKE SEQUENCES ----------------
scaler = MinMaxScaler()
scaled = scaler.fit_transform(values)

def create_sequences(series, window):
    X, y = [], []
    for i in range(len(series) - window):
        X.append(series[i:i+window])
        y.append(series[i+window])
    return np.array(X), np.array(y)

# we will tune over a few window sizes and hidden layer sizes
window_sizes = [3, 5]
hidden_options = [(32,), (64,), (64, 32)]

best_model = None
best_cfg = None
best_loss = float("inf")

for window in window_sizes:
    X, y = create_sequences(scaled, window)
    X = X.reshape(X.shape[0], X.shape[1])  # 2D for MLPRegressor

    for hidden in hidden_options:
        model = MLPRegressor(
            hidden_layer_sizes=hidden,
            activation="relu",
            solver="adam",
            max_iter=5000,
            random_state=42
        )
        model.fit(X, y.ravel())
        loss = np.mean((model.predict(X) - y.ravel())**2)

        print(f"window={window}, hidden={hidden}, loss={loss:.6f}")
        if loss < best_loss:
            best_loss = loss
            best_model = model
            best_cfg = {"window": window, "hidden": hidden}

print("Best config:", best_cfg, "loss=", best_loss)

# ---------------- TRAIN FINAL MODEL ON FULL DATA ----------------
window = best_cfg["window"]
X_full, y_full = create_sequences(scaled, window)
X_full = X_full.reshape(X_full.shape[0], X_full.shape[1])

best_model.fit(X_full, y_full.ravel())

# ---------------- FORECAST NEXT 10 YEARS ----------------
last_year = int(years[-1])
future_years = [last_year + i for i in range(1, 11)]

last_window = scaled[-window:].flatten().tolist()
pred_scaled = []

for i in range(10):
    x_in = np.array(last_window[-window:]).reshape(1, window)
    pred = best_model.predict(x_in)[0]
    pred_scaled.append(pred)
    last_window.append(pred)

pred_scaled_arr = np.array(pred_scaled).reshape(-1, 1)
pred_values = scaler.inverse_transform(pred_scaled_arr).flatten()

# ---------------- BUILD JSON ----------------
historical = [
    {"year": int(y), "value": float(v), "type": "actual"}
    for y, v in zip(years, values.flatten())
]

forecast = [
    {"year": int(y), "value": float(v), "type": "forecast"}
    for y, v in zip(future_years, pred_values)
]

output = {
    "attribute": "Total Emigrants per Year (All Countries)",
    "model_used": "MLPRegressor",
    "model_config": best_cfg,
    "historical": historical,
    "forecast": forecast,
}

with open(OUTPUT_JSON, "w") as f:
    json.dump(output, f, indent=2)

print(f"Saved forecast to {OUTPUT_JSON}")
