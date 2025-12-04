import { useEffect, useMemo, useState } from "react";
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid, ResponsiveContainer,
} from "recharts";
import {
    addOriginProvince, getOriginProvinces, updateOriginProvince, deleteOriginProvince, deleteAllOriginProvinces,
    addOriginRegion, getOriginRegions, updateOriginRegion, deleteOriginRegion, deleteAllOriginRegions
} from "../../services/emigrantsOriginService";
import { parseStandardCSV, parseTransposedCSV } from "../../utils/csvParser";

const card = { background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: 20, boxShadow: "0 1px 2px rgba(0,0,0,.05)" };
const input = { margin: 5, padding: 8, borderRadius: 8, border: "1px solid #e2e8f0" };
const pill = { border: "1px solid #e2e8f0", borderRadius: 999, padding: "8px 14px", background: "#fff", cursor: "pointer" };

// Sub-component for a single CRUD section
const OriginSection = ({ title, service, color }) => {
    const [rows, setRows] = useState([]);
    const [uploadStatus, setUploadStatus] = useState("");
    const [yearInput, setYearInput] = useState("");
    const [form, setForm] = useState({});
    const [showForm, setShowForm] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [columns, setColumns] = useState([]);

    const { add, get, update, del, delAll } = service;

    const fetchRows = async () => {
        const data = await get();
        const sorted = data.sort((a, b) => a.year - b.year);
        setRows(sorted);

        const allKeys = new Set();
        sorted.forEach(r => Object.keys(r).forEach(k => {
            if (k !== 'id' && k !== 'year') allKeys.add(k);
        }));
        setColumns(Array.from(allKeys).sort());
    };

    useEffect(() => { fetchRows(); }, []);

    const handleCSVUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;
        if (!file.name.endsWith('.csv')) { alert("Please upload a CSV file"); return; }

        setUploadStatus("Processing...");
        try {
            const text = await file.text();
            
            // Detect format
            const firstHeader = text.slice(0, 50).split(',')[0].trim().toUpperCase();
            
            let yearData;
            if (firstHeader === 'YEAR') {
                yearData = parseStandardCSV(text);
            } else {
                yearData = parseTransposedCSV(text);
            }
            
            if (yearData.length === 0) { setUploadStatus("Empty CSV"); return; }

            const existingRecords = await get();
            const existingYears = new Set(existingRecords.map(r => r.year));

            let added = 0, updated = 0;

            for (const data of yearData) {
                if (!data.year) continue;
                if (existingYears.has(data.year)) {
                    const existing = existingRecords.find(r => r.year === data.year);
                    await update(existing.id, { ...existing, ...data });
                    updated++;
                } else {
                    await add(data);
                    added++;
                }
            }
            setUploadStatus(`Done: ${added} added, ${updated} updated`);
            fetchRows();
            setTimeout(() => setUploadStatus(""), 3000);
        } catch (error) {
            console.error(error);
            setUploadStatus("Error uploading CSV");
        }
    };

    const handleYearSubmit = async () => {
        const year = parseInt(yearInput);
        if (isNaN(year)) return alert("Invalid year");

        const existing = rows.find(r => r.year === year);

        if (existing) {
            setForm({ ...existing });
            setIsEditing(true);
            setEditingId(existing.id);
        } else {
            setForm({ year });
            setIsEditing(false);
            setEditingId(null);
        }
        setShowForm(true);
    };

    const onSave = async () => {
        const data = { ...form };
        Object.keys(data).forEach(k => {
            if (k !== 'id') data[k] = Number(data[k]) || 0;
        });

        if (isEditing && editingId) {
            await update(editingId, data);
        } else {
            await add(data);
        }
        setForm({});
        setYearInput("");
        setShowForm(false);
        setIsEditing(false);
        fetchRows();
    };

    const handleDelete = async (id) => {
        if (window.confirm("Delete this record?")) {
            await del(id);
            fetchRows();
        }
    };

    const handleDeleteAll = async () => {
        if (window.confirm("Delete ALL records?")) {
            await delAll();
            fetchRows();
        }
    };

    const totals = useMemo(() => {
        const acc = {};
        rows.forEach(r => {
            Object.keys(r).forEach(k => {
                if (k !== 'id' && k !== 'year') {
                    acc[k] = (acc[k] || 0) + (r[k] || 0);
                }
            });
        });
        return Object.entries(acc)
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);
    }, [rows]);

    return (
        <div style={{ marginBottom: 40 }}>
            <h2 style={{ fontSize: 24, marginBottom: 16 }}>{title}</h2>

            <div style={{ display: "grid", gap: 16 }}>
                {/* CSV Upload */}
                <div className="card" style={card}>
                    <h3>CSV Upload</h3>
                    <input type="file" accept=".csv" onChange={handleCSVUpload} style={input} />
                    <p>{uploadStatus}</p>
                </div>

                {/* Manual Entry */}
                <div className="card" style={card}>
                    <h3>{isEditing ? "Edit" : "Add"} Record</h3>
                    <div style={{ marginBottom: 12 }}>
                        <input
                            type="number" placeholder="Year" value={yearInput}
                            onChange={e => setYearInput(e.target.value)} style={input} disabled={showForm}
                        />
                        {!showForm && <button style={pill} onClick={handleYearSubmit}>Load Year</button>}
                    </div>

                    {showForm && (
                        <div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 8 }}>
                                {columns.map(col => (
                                    <div key={col}>
                                        <label style={{ fontSize: 12, display: 'block' }}>{col}</label>
                                        <input
                                            type="number"
                                            value={form[col] || ''}
                                            onChange={e => setForm({ ...form, [col]: e.target.value })}
                                            style={{ ...input, width: '100%' }}
                                        />
                                    </div>
                                ))}
                            </div>
                            <div style={{ marginTop: 12 }}>
                                <button style={pill} onClick={onSave}>Save</button>
                                <button style={{ ...pill, marginLeft: 8 }} onClick={() => { setShowForm(false); setForm({}); setYearInput(""); }}>Cancel</button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Records */}
                <div className="card" style={card}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <h3>Records</h3>
                        {rows.length > 0 && <button style={{ ...pill, color: 'red' }} onClick={handleDeleteAll}>Delete All</button>}
                    </div>
                    <div style={{ overflowX: "auto" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse" }}>
                            <thead>
                                <tr>
                                    <th style={{ textAlign: "left", padding: 8, borderBottom: "1px solid #eee" }}>Year</th>
                                    {columns.slice(0, 10).map(c => <th key={c} style={{ textAlign: "left", padding: 8, borderBottom: "1px solid #eee" }}>{c}</th>)}
                                    {columns.length > 10 && <th style={{ textAlign: "left", padding: 8, borderBottom: "1px solid #eee" }}>...</th>}
                                    <th style={{ textAlign: "left", padding: 8, borderBottom: "1px solid #eee" }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rows.map(r => (
                                    <tr key={r.id}>
                                        <td style={{ padding: 8 }}>{r.year}</td>
                                        {columns.slice(0, 10).map(c => <td key={c} style={{ padding: 8 }}>{r[c] || 0}</td>)}
                                        {columns.length > 10 && <td style={{ padding: 8 }}>...</td>}
                                        <td style={{ padding: 8 }}>
                                            <button style={{ ...pill, padding: "4px 8px", fontSize: 12 }} onClick={() => {
                                                setYearInput(r.year);
                                                setForm({ ...r });
                                                setIsEditing(true);
                                                setEditingId(r.id);
                                                setShowForm(true);
                                            }}>Edit</button>
                                            <button style={{ ...pill, padding: "4px 8px", fontSize: 12, marginLeft: 4, color: 'red' }} onClick={() => handleDelete(r.id)}>Del</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Total Chart */}
                <div className="card" style={card}>
                    <h3>Top 10 {title} (Total)</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={totals} layout="vertical" margin={{ left: 40 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis type="number" />
                            <YAxis dataKey="name" type="category" width={100} />
                            <Tooltip />
                            <Bar dataKey="count" fill={color} radius={[0, 4, 4, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default function Origin() {
    return (
        <div>
            <OriginSection
                title="Origin (Province)"
                color="#f59e0b"
                service={{
                    add: addOriginProvince,
                    get: getOriginProvinces,
                    update: updateOriginProvince,
                    del: deleteOriginProvince,
                    delAll: deleteAllOriginProvinces
                }}
            />
            <div style={{ height: 40, borderTop: "1px dashed #ccc" }} />
            <OriginSection
                title="Origin (Region)"
                color="#10b981"
                service={{
                    add: addOriginRegion,
                    get: getOriginRegions,
                    update: updateOriginRegion,
                    del: deleteOriginRegion,
                    delAll: deleteAllOriginRegions
                }}
            />
        </div>
    );
}
