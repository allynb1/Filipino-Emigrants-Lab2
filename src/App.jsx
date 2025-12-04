import React, { useState, Suspense, lazy } from "react";

const Overview = lazy(() => import("./components/overview/Overview.jsx"));
const CivilStatus = lazy(() => import("./components/civilstatus/CivilStatus.jsx"));
const Age = lazy(() => import("./components/age/Age.jsx"));
const Occupation = lazy(() => import("./components/occupation/Occupation.jsx"));
const Sex = lazy(() => import("./components/sex/Sex.jsx"));
const Edu = React.lazy(() => import("./components/edu/Edu.jsx"));

const Countries = lazy(() => import("./components/countries/Countries.jsx"));
const Origin = lazy(() => import("./components/origin/Origin.jsx"));

export default function App() {
  const [tab, setTab] = useState("overview");

  const TabButton = ({ id, label }) => (
    <button
      onClick={() => setTab(id)}
      style={{
        padding: "8px 14px",
        borderRadius: 999,
        border: "1px solid #e2e8f0",
        background: tab === id ? "#2563eb" : "#fff",
        color: tab === id ? "#fff" : "#111827",
        cursor: "pointer",
      }}
    >
      {label}
    </button>
  );

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: 24, fontFamily: "ui-sans-serif, system-ui" }}>
      <header style={{ display: "grid", gap: 6 }}>
        <h1 style={{ margin: 0, fontWeight: 600, fontSize: 28 }}>Filipino Emigrants — Data Platform</h1>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 4 }}>
          <TabButton id="overview" label="Overview" />
          <TabButton id="age" label="Age CRUD" />
          <TabButton id="edu" label="Edu CRUD" />
          <TabButton id="civil" label="Civil Status CRUD" />
          <TabButton id="occupation" label="Occupation CRUD" />
          <TabButton id="sex" label="Sex CRUD" />
          <TabButton id="countries" label="Countries CRUD" />
          <TabButton id="origin" label="Origin CRUD" />
        </div>
      </header>

      <div style={{ height: 12 }} />

      <Suspense fallback={<div style={{ color: "#6b7280" }}>Loading…</div>}>
        {tab === "overview" ? <Overview />
          : tab === "civil" ? <CivilStatus />
            : tab === "age" ? <Age />
              : tab === "edu" ? <Edu />
                : tab === "occupation" ? <Occupation />
                  : tab === "sex" ? <Sex />
                    : tab === "countries" ? <Countries />
                      : <Origin />}
      </Suspense>
    </div>
  );
}
