import { useEffect, useMemo, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid, ResponsiveContainer,
} from "recharts";
import {
  addEmigrantSex,
  getEmigrantSexes,
  getEmigrantSexByYear,
  updateEmigrantSex,
  deleteEmigrantSex,
  deleteAllEmigrantSex,
  CSV_SEX_MAP,
} from "../../services/emigrantsSexService";
import { parseStandardCSV } from "../../utils/csvParser";

// match your simple UI style
const card = { background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: 20, boxShadow: "0 1px 2px rgba(0,0,0,.05)" };
const input = { margin: 5, padding: 8, borderRadius: 8, border: "1px solid #e2e8f0" };
const pill = { border: "1px solid #e2e8f0", borderRadius: 999, padding: "8px 14px", background: "#fff", cursor: "pointer" };

const empty = { year: "", male: "", female: "", sex_ratio: "" };

export default function Sex() {
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState(empty);
  const [yearInput, setYearInput] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [csvFile, setCsvFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState("");

  const onChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  const fetchRows = async () => {
    const data = await getEmigrantSexes();
    setRows(data.sort((a, b) => a.year - b.year));
  }
  useEffect(() => { fetchRows(); }, []);

  const toNum = (v) => Number(v) || 0;
  const computeRatio = (m, f) => (f ? (m / f) * 100 : 0);

  // Year-first workflow: Check if year exists
  const handleYearSubmit = async () => {
    const year = parseInt(yearInput);
    if (isNaN(year)) {
      alert("Please enter a valid year");
      return;
    }

    const existing = await getEmigrantSexByYear(year);

    if (existing) {
      // Year exists - load data for editing
      setForm({
        year: existing.year.toString(),
        male: existing.male?.toString() || "",
        female: existing.female?.toString() || "",
        sex_ratio: existing.sex_ratio?.toString() || "",
      });
      setIsEditing(true);
      setEditingId(existing.id);
    } else {
      // Year doesn't exist - prepare for new entry
      setForm({ ...empty, year: yearInput });
      setIsEditing(false);
      setEditingId(null);
    }

    setShowForm(true);
  };

  // Save or update record
  const onSave = async () => {
    const male = toNum(form.male);
    const female = toNum(form.female);
    const ratio = form.sex_ratio !== "" ? toNum(form.sex_ratio) : computeRatio(male, female);

    const data = {
      year: toNum(form.year),
      male,
      female,
      sex_ratio: ratio,
    };

    if (isEditing && editingId) {
      await updateEmigrantSex(editingId, data);
    } else {
      await addEmigrantSex(data);
    }

    // Reset form
    setForm(empty);
    setYearInput("");
    setShowForm(false);
    setIsEditing(false);
    setEditingId(null);
    fetchRows();
  };

  // Cancel editing
  const handleCancel = () => {
    setForm(empty);
    setYearInput("");
    setShowForm(false);
    setIsEditing(false);
    setEditingId(null);
  };

  // Edit: Load record into form for editing
  const handleEdit = async (record) => {
    setForm({
      year: record.year?.toString() || "",
      male: record.male?.toString() || "",
      female: record.female?.toString() || "",
      sex_ratio: record.sex_ratio?.toString() || "",
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
        await deleteEmigrantSex(id);
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
      await deleteAllEmigrantSex();
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

  // CSV Upload handler
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
      const csvRows = parseStandardCSV(text);

      if (csvRows.length === 0) {
        setUploadStatus("CSV file is empty");
        return;
      }

      // Get existing records to check for duplicates
      const existingRecords = await getEmigrantSexes();
      const existingYears = new Set(existingRecords.map(r => r.year));

      let added = 0;
      let updated = 0;
      let skipped = 0;

      for (const row of csvRows) {
        // parseCSV transforms headers to lowercase: YEAR -> year, MALE -> male, FEMALE -> female
        const year = parseInt(row['year'] || row['YEAR']);
        if (isNaN(year)) {
          skipped++;
          continue;
        }

        const male = toNum(row['male'] || row['MALE']);
        const female = toNum(row['female'] || row['FEMALE']);
        const ratio = computeRatio(male, female);

        const data = { year, male, female, sex_ratio: ratio };

        if (existingYears.has(year)) {
          // Update existing record
          const existing = existingRecords.find(r => r.year === year);
          if (existing) {
            await updateEmigrantSex(existing.id, data);
            updated++;
          }
        } else {
          // Add new record
          await addEmigrantSex(data);
          added++;
        }
      }

      setUploadStatus(`Upload complete: ${added} added, ${updated} updated, ${skipped} skipped`);
      event.target.value = ""; // Reset file input
      fetchRows();

      setTimeout(() => setUploadStatus(""), 3000);
    } catch (error) {
      console.error("CSV upload error:", error);
      setUploadStatus("Error uploading CSV: " + error.message);
    }
  };

  // Aggregates
  const totals = useMemo(() => rows.reduce((acc, r) => {
    acc.male += r.male || 0;
    acc.female += r.female || 0;
    return acc;
  }, { male: 0, female: 0 }), [rows]);

  const overallRatio = useMemo(() => computeRatio(totals.male, totals.female), [totals]);

  const chartData = [
    { category: "Male", count: totals.male },
    { category: "Female", count: totals.female },
  ];

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
          {uploadStatus && (
            <p style={{ marginTop: 8, color: uploadStatus.includes("Error") ? "#ef4444" : "#10b981", fontSize: 13 }}>
              {uploadStatus}
            </p>
          )}
        </div>
      </div>

      {/* Manual Entry Section */}
      <div className="card" style={card}>
        <h2>Sex — {isEditing ? "Edit" : "Add"} Record</h2>

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
              <input name="male" placeholder="male" value={form.male} onChange={onChange} style={input} />
              <input name="female" placeholder="female" value={form.female} onChange={onChange} style={input} />
              <input name="sex_ratio" placeholder="sex_ratio (optional)" value={form.sex_ratio} onChange={onChange} style={input} />
              <button style={pill} onClick={onSave}>{isEditing ? "Update" : "Save"}</button>
              <button style={{ ...pill, marginLeft: 8 }} onClick={handleCancel}>Cancel</button>
            </div>
            <p style={{ marginTop: 8, color: "#6b7280", fontSize: 13 }}>
              Sex ratio = (Male / Female) × 100. If left blank, it's computed automatically.
            </p>
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
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                {["Year", "Male", "Female", "Sex Ratio", "Actions"].map(h => (
                  <th key={h} style={{ textAlign: "left", borderBottom: "1px solid #e2e8f0", padding: 8 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map(r => (
                <tr key={r.id}>
                  <td>{r.year || 0}</td>
                  <td>{r.male || 0}</td>
                  <td>{r.female || 0}</td>
                  <td>{(r.sex_ratio ?? 0).toFixed(2)}</td>
                  <td>
                    <button
                      style={{ ...pill, marginRight: 6 }}
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
                <tr><td colSpan={5} style={{ padding: 8, color: "#6b7280" }}>No records yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Chart */}
      <div className="card" style={card}>
        <h2>Total Emigrants by Sex</h2>
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="category" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="count" fill="#6366f1" barSize={40} radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
        <p style={{ marginTop: 8, color: "#374151" }}>
          Overall civil status ratio: <b>{overallRatio.toFixed(2)}</b>
        </p>
      </div>
    </section>
  );
}
