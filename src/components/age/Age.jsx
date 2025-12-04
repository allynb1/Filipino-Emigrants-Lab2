import React, { useEffect, useMemo, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid, ResponsiveContainer } from "recharts";
import {
  addEmigrantAge, 
  getEmigrantAges,
  getEmigrantAgeByYear,
  updateEmigrantAge,
  deleteEmigrantAge,
  deleteAllEmigrantAge,
  CSV_AGE_GROUP_MAP,
} from "../../services/emigrantsAgeService";
import { parseTransposedCSV } from "../../utils/csvParser";

const card = { background:"#fff", border:"1px solid #e5e7eb", borderRadius:12, padding:20, boxShadow:"0 1px 2px rgba(0,0,0,.05)" };
const input = { margin:5, padding:8, borderRadius:8, border:"1px solid #e2e8f0" };
const pill  = { border:"1px solid #e2e8f0", borderRadius:999, padding:"8px 14px", background:"#fff", cursor:"pointer" };

const emptyForm = {
  year: "", age_14_below:"", age_15_19:"", age_20_24:"", age_25_29:"",
  age_30_34:"", age_35_39:"", age_40_44:"", age_45_49:"", age_50_54:"",
  age_55_59:"", age_60_64:"", age_65_69:"", age_70_above:"", notReported:""
};

export default function Age() {
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [yearInput, setYearInput] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [uploadStatus, setUploadStatus] = useState("");

  const onChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  
  const fetchRows = async () => {
    const data = await getEmigrantAges();
    setRows(data.sort((a, b) => a.year - b.year));
  };
  useEffect(() => { fetchRows(); }, []);

  const toNum = (v) => Number(v) || 0;

  // Year-first workflow: Check if year exists
  const handleYearSubmit = async () => {
    const year = parseInt(yearInput);
    if (isNaN(year)) {
      alert("Please enter a valid year");
      return;
    }

    const existing = await getEmigrantAgeByYear(year);
    if (existing) {
      // Year exists - load data for editing
      setForm({
        year: existing.year.toString(),
        age_14_below: existing.age_14_below?.toString() || "",
        age_15_19: existing.age_15_19?.toString() || "",
        age_20_24: existing.age_20_24?.toString() || "",
        age_25_29: existing.age_25_29?.toString() || "",
        age_30_34: existing.age_30_34?.toString() || "",
        age_35_39: existing.age_35_39?.toString() || "",
        age_40_44: existing.age_40_44?.toString() || "",
        age_45_49: existing.age_45_49?.toString() || "",
        age_50_54: existing.age_50_54?.toString() || "",
        age_55_59: existing.age_55_59?.toString() || "",
        age_60_64: existing.age_60_64?.toString() || "",
        age_65_69: existing.age_65_69?.toString() || "",
        age_70_above: existing.age_70_above?.toString() || "",
        notReported: existing.notReported?.toString() || "",
      });
      setIsEditing(true);
      setEditingId(existing.id);
    } else {
      // Year doesn't exist - prepare for new entry
      setForm({ ...emptyForm, year: yearInput });
      setIsEditing(false);
      setEditingId(null);
    }

    setShowForm(true);
  };

  // Save or update record
  const onSave = async () => {
    const data = {
      year: toNum(form.year),
      age_14_below: toNum(form.age_14_below),
      age_15_19: toNum(form.age_15_19),
      age_20_24: toNum(form.age_20_24),
      age_25_29: toNum(form.age_25_29),
      age_30_34: toNum(form.age_30_34),
      age_35_39: toNum(form.age_35_39),
      age_40_44: toNum(form.age_40_44),
      age_45_49: toNum(form.age_45_49),
      age_50_54: toNum(form.age_50_54),
      age_55_59: toNum(form.age_55_59),
      age_60_64: toNum(form.age_60_64),
      age_65_69: toNum(form.age_65_69),
      age_70_above: toNum(form.age_70_above),
      notReported: toNum(form.notReported),
    };
    
    if (isEditing && editingId) {
      await updateEmigrantAge(editingId, data);
    } else {
      await addEmigrantAge(data);
    }

    // Reset form
    setForm(emptyForm);
    setYearInput("");
    setShowForm(false);
    setIsEditing(false);
    setEditingId(null);
    fetchRows();
  };

  // Cancel editing
  const handleCancel = () => {
    setForm(emptyForm);
    setYearInput('');
    setShowForm(false);
    setIsEditing(false);
    setEditingId(null);
  };

  // Edit: Load record into form for editing
  const handleEdit = async (record) => {
    setForm({
      year: record.year?.toString() || "",
      age_14_below: record.age_14_below?.toString() || "",
      age_15_19: record.age_15_19?.toString() || "",
      age_20_24: record.age_20_24?.toString() || "",
      age_25_29: record.age_25_29?.toString() || "",
      age_30_34: record.age_30_34?.toString() || "",
      age_35_39: record.age_35_39?.toString() || "",
      age_40_44: record.age_40_44?.toString() || "",
      age_45_49: record.age_45_49?.toString() || "",
      age_50_54: record.age_50_54?.toString() || "",
      age_55_59: record.age_55_59?.toString() || "",
      age_60_64: record.age_60_64?.toString() || "",
      age_65_69: record.age_65_69?.toString() || "",
      age_70_above: record.age_70_above?.toString() || "",
      notReported: record.notReported?.toString() || "",
    });
    setYearInput(record.year?.toString() || "");
    setIsEditing(true);
    setEditingId(record.id);
    setShowForm(true);
  };
  
  // Delete with confirmation
  const handleDelete = async (id, year) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete the record for year ${year}? This action cannot be undone.`
    );
    if (confirmed) {
      try {
        await deleteEmigrantAge(id);
        fetchRows();

        // If we're editing this record, reset the form
        if (editingId === id) {
          handleCancel();
        }
      } catch (error) {
        console.error("Delete error:", error);
        alert("Failed to delete record. Please try again.");
      }
    }
  };  

  // Delete all records with strong confirmation
  const handleDeleteAll = async () => {
    if (rows.length === 0) {
      alert("No records to delete.");
      return;
    }

    // First confirmation
    const firstConfirm = window.confirm(
      `⚠️ WARNING: This will delete ALL ${rows.length} records!\n\nThis action cannot be undone.\n\nAre you sure you want to continue?`
    );

    if (!firstConfirm) return;

    // Second confirmation - require typing "DELETE ALL"
    const secondConfirm = window.prompt(
      `⚠️ FINAL WARNING: This will permanently delete ALL ${rows.length} records!\n\nType "DELETE ALL" (in uppercase) to confirm:`
    );

    if (secondConfirm !== "DELETE ALL") {
      alert("Delete all cancelled. Records were not deleted.");
      return;
    }

    try {
      setUploadStatus("Deleting all records...");
      await deleteAllEmigrantAge();
      fetchRows();
      handleCancel(); // Reset form if editing
      setUploadStatus(`Successfully deleted all ${rows.length} records.`);
      setTimeout(() => setUploadStatus(""), 3000);
    } catch (error) {
      console.error("Delete all error:", error);
      setUploadStatus("Failed to delete all records. Please try again.");
      setTimeout(() => setUploadStatus(""), 3000);
    }
  };

  // CSV Upload handler (transposed format)
  const handleCSVUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      alert("Please upload a CSV file");
      return;
    }

    setUploadStatus("Processing CSV...");

    try {
      const text = await file.text();
      const yearData = parseTransposedCSV(text, CSV_AGE_GROUP_MAP);

      if (yearData.length === 0) {
        setUploadStatus("CSV file is empty");
        return;
      }

      // Get existing records to check for duplicates
      const existingRecords = await getEmigrantAges();
      const existingYears = new Set(existingRecords.map(r => r.year));

      let added = 0;
      let updated = 0;
      let skipped = 0;

      for (const data of yearData) {
        if (!data.year || isNaN(data.year)) {
          skipped++;
          continue;
        }

        if (existingYears.has(data.year)) {
          // Update existing record
          const existing = existingRecords.find(r => r.year === data.year);
          if (existing) {
            await updateEmigrantAge(existing.id, data);
            updated++;
          }
        } else {
          // Add new record
          await addEmigrantAge(data);
          added++;
        }
      }

      setUploadStatus(`Upload complete: ${added} added, ${updated} updated, ${skipped} skipped`);
      event.target.value = ""; // Reset file input
      fetchRows();
      
      setTimeout(() => setUploadStatus(""), 3000);
    } catch (error) {
      console.error("CSV upload error:", error);
      setUploadStatus("Failed to upload CSV. Please check the file and try again.");
      setTimeout(() => setUploadStatus(""), 3000);
    }
  }

  // Aggregates for chart
  const totals = useMemo(() => rows.reduce((acc, r) => {
    Object.keys(acc).forEach(k => acc[k] += (r[k] || 0));
    return acc;
  }, {
    age_14_below: 0, age_15_19: 0, age_20_24: 0, age_25_29: 0, age_30_34: 0, age_35_39: 0,
    age_40_44: 0, age_45_49: 0, age_50_54: 0, age_55_59: 0, age_60_64: 0, age_65_69: 0,
    age_70_above: 0, notReported: 0
  }), [rows]);

  const chartData = [
    { category:"14 & Below", count: totals.age_14_below },
    { category:"15–19",      count: totals.age_15_19 },
    { category:"20–24",      count: totals.age_20_24 },
    { category:"25–29",      count: totals.age_25_29 },
    { category:"30–34",      count: totals.age_30_34 },
    { category:"35–39",      count: totals.age_35_39 },
    { category:"40–44",      count: totals.age_40_44 },
    { category:"45–49",      count: totals.age_45_49 },
    { category:"50–54",      count: totals.age_50_54 },
    { category:"55–59",      count: totals.age_55_59 },
    { category:"60–64",      count: totals.age_60_64 },
    { category:"65–69",      count: totals.age_65_69 },
    { category:"70 & Above", count: totals.age_70_above },
    { category:"Not Reported", count: totals.notReported },
  ];

  const fieldOrder = Object.keys(emptyForm).filter(k => k !== "year");

  return (
    <section className="grid" style={{ gap: 16 }}>
      {/* CSV Upload Section */}
      <div className="card" style={card}>
        <h2>CSV Upload</h2>
        <div>
          <input
            type="file"
            accept=".csv"
            onChange={handleCSVUpload}
            style={input}
          />
        </div>
        {uploadStatus && (
          <p style={{ marginTop: 8, color: uploadStatus.includes("Error") ? "#ef4444" : "#10b981", fontSize: 13 }}>
            {uploadStatus}
          </p>
        )}
      </div>

      {/* Manual Entry Section */}
      <div className="card" style={card}>
        <h2>Age Group — {isEditing ? "Edit" : "Add"} Record</h2>
        
        {/* Year Input */}
        <div style={{ marginBottom: 12 }}>
          <input
            type="number"
            placeholder="Enter Year"
            value={yearInput}
            onChange={(e) => setYearInput(e.target.value)}
            style={input}
            disabled={showForm}
          />
          {!showForm && (
            <button style={pill} onClick={handleYearSubmit}>Load Year</button>
          )}
        </div>

        {/* Form Fields (shown after year is entered or when editing) */}
        {showForm && (
          <div>
            <div>
              <input name="year" placeholder="year" value={form.year} onChange={onChange} style={input} disabled={isEditing} />
              {fieldOrder.map(key => (
                <input
                  key={key}
                  name={key}
                  placeholder={key}
                  value={form[key]}
                  onChange={onChange}
                  style={input}
                />
              ))}
              <button style={pill} onClick={onSave}>{isEditing ? "Update" : "Save"}</button>
              <button style={{...pill, marginLeft: 8}} onClick={handleCancel}>Cancel</button>
            </div>
          </div>
        )}
      </div>

      {/* Records Table */}
      <div className="card" style={card}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <h2 style={{ margin: 0 }}>Records</h2>
          {rows.length > 0 && (
            <button
              style={{
                ...pill,
                background: "#ef4444",
                color: "#fff",
                border: "1px solid #dc2626",
              }}
              onClick={handleDeleteAll}
            >
              Delete All ({rows.length})
            </button>
          )}
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width:"100%", borderCollapse:"collapse" }}>
            <thead>
              <tr>
                {["Year","14 & Below","15–19","20–24","25–29","30–34","35–39","40–44","45–49","50–54","55–59","60–64","65–69","70 & Above","Not Reported","Actions"]
                  .map(h => <th key={h} style={{ textAlign:"left", borderBottom:"1px solid #e2e8f0", padding:8 }}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {rows.map(r => (
                <tr key={r.id}>
                  <td>{r.year || 0}</td>
                  <td>{r.age_14_below || 0}</td>
                  <td>{r.age_15_19 || 0}</td>
                  <td>{r.age_20_24 || 0}</td>
                  <td>{r.age_25_29 || 0}</td>
                  <td>{r.age_30_34 || 0}</td>
                  <td>{r.age_35_39 || 0}</td>
                  <td>{r.age_40_44 || 0}</td>
                  <td>{r.age_45_49 || 0}</td>
                  <td>{r.age_50_54 || 0}</td>
                  <td>{r.age_55_59 || 0}</td>
                  <td>{r.age_60_64 || 0}</td>
                  <td>{r.age_65_69 || 0}</td>
                  <td>{r.age_70_above || 0}</td>
                  <td>{r.notReported || 0}</td>
                  <td>
                    <button 
                      style={{...pill, marginRight:6}} 
                      onClick={() => handleEdit(r)}
                    >
                      Edit
                    </button>
                    <button 
                      style={pill} 
                      onClick={() => handleDelete(r.id, r.year)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr><td colSpan={16} style={{ padding:8, color:"#6b7280" }}>No records yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Chart */}
      <div className="card" style={card}>
        <h2>Total Emigrants by Age Group</h2>
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={chartData} margin={{ top:10, right:20, left:0, bottom:0 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="category" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="count" fill="#10B981" barSize={32} radius={[6,6,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}