import React, { useEffect, useState, useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

const ForecastTotalEmigrants = () => {
  const [raw, setRaw] = useState(null);
  const [yearsToShow, setYearsToShow] = useState(10);

  useEffect(() => {
    const load = async () => {
      const res = await fetch("/data/forecast_total_emigrants.json");
      const json = await res.json();
      setRaw(json);
    };
    load();
  }, []);

  const chartData = useMemo(() => {
    if (!raw) return [];

    // historical and forecast from JSON
    const historical = raw.historical;
    const allForecast = raw.forecast;

    // only first N forecast years
    const forecast = allForecast.slice(0, yearsToShow);

    // merge and sort by year
    const merged = [...historical, ...forecast].sort(
      (a, b) => a.year - b.year
    );

    // map to shape Recharts likes
    return merged.map((d) => ({
      year: d.year,
      actual: d.type === "actual" ? d.value : null,
      forecast: d.type === "forecast" ? d.value : null,
    }));
  }, [raw, yearsToShow]);

  if (!raw || !chartData.length) return <div>Loading forecast…</div>;

  const totalForecastYears = raw.forecast.length;
  const firstForecastYear = raw.forecast[0].year;
  const lastForecastYear =
    raw.forecast[Math.min(yearsToShow, totalForecastYears) - 1].year;

  return (
    <div>
      <h3>Machine Learning Forecast: Total Emigrants</h3>
      <p style={{ fontSize: "0.85rem" }}>
        Model: <strong>{raw.model_used}</strong> | window:{" "}
        <strong>{raw.model_config.window}</strong> | hidden layers:{" "}
        <strong>{JSON.stringify(raw.model_config.hidden)}</strong>
      </p>

      <div
        style={{
          marginBottom: 16,
          padding: "8px 12px",
          borderRadius: 8,
          background: "#fef3c7",
          border: "1px solid #f59e0b",
          display: "flex",
          alignItems: "center",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <span>
          The model can forecast up to{" "}
          <strong>{totalForecastYears} years</strong> into the future.
        </span>
        <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
          Show next
          <input
            type="number"
            min={1}
            max={totalForecastYears}
            value={yearsToShow}
            onChange={(e) => {
              const v = Number(e.target.value);
              if (!Number.isNaN(v)) {
                const clamped = Math.max(1, Math.min(totalForecastYears, v));
                setYearsToShow(clamped);
              }
            }}
            style={{
              width: 60,
              padding: "4px 6px",
              borderRadius: 4,
              border: "1px solid #d1d5db",
            }}
          />
          years
        </label>
      </div>

      <ResponsiveContainer width="100%" height={320}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="year" />
          <YAxis />
          <Tooltip />
          <Legend />

          {/* historical */}
          <Line
            type="monotone"
            dataKey="actual"
            name="Actual"
            stroke="#4A58E8"
            strokeWidth={2}
            dot={false}
          />

          {/* forecast 2021+ only */}
          <Line
            type="monotone"
            dataKey="forecast"
            name="Forecast"
            stroke="#FF8F00"
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>

      <p style={{ marginTop: 8, fontSize: "0.85rem", color: "#4b5563" }}>
        Showing forecast for <strong>{yearsToShow}</strong> year
        {yearsToShow > 1 ? "s" : ""}: {firstForecastYear}–{lastForecastYear}.
      </p>
    </div>
  );
};

export default ForecastTotalEmigrants;
