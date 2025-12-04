import { useEffect, useState, useMemo } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid, ResponsiveContainer,
} from "recharts";
import {
  addEmigrantEdu, 
  getEmigrantEdus, 
  getEmigrantEduByYear,
  updateEmigrantEdu, 
  deleteEmigrantEdu, 
  deleteAllEmigrantEdu,
  CSV_EDUCATION_MAP,
} from "../../services/emigrantsEduService";
import { parseTransposedCSV } from "../../utils/csvParser";

const card = { background:"#fff", border:"1px solid #e5e7eb", borderRadius:12, padding:20, boxShadow:"0 1px 2px rgba(0,0,0,.05)" };
const input = { margin:5, padding:8, borderRadius:8, border:"1px solid #e2e8f0" };
const pill  = { border:"1px solid #e2e8f0", borderRadius:999, padding:"8px 14px", background:"#fff", cursor:"pointer" };

const emptyForm = {
  year: "",
  not_of_schooling_age: "",
  no_formal_education: "",
  elementary_level: "",
  elementary_graduate: "",
  high_school_level: "",
  high_school_graduate: "",
  vocational_level: "",
  vocational_graduate: "",
  college_level: "",
  college_graduate: "",
  post_graduate_level: "",
  post_graduate: "",
  non_formal_education: "",
  not_reported_no_response: "",
};

export default function Edu() {
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [yearInput, setYearInput] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [csvFile, setCsvFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState("");

  const onChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const fetchRows = async () => {
    const data = await getEmigrantEdus();
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
    
    const existing = await getEmigrantEduByYear(year);
    if (existing) {
      // Year exists - load data for editing
      setForm({
        year: existing.year.toString(),
        not_of_schooling_age: existing.not_of_schooling_age?.toString() || "",
        no_formal_education: existing.no_formal_education?.toString() || "",
        elementary_level: existing.elementary_level?.toString() || "",
        elementary_graduate: existing.elementary_graduate?.toString() || "",
        high_school_level: existing.high_school_level?.toString() || "",
        high_school_graduate: existing.high_school_graduate?.toString() || "",
        vocational_level: existing.vocational_level?.toString() || "",
        vocational_graduate: existing.vocational_graduate?.toString() || "",
        college_level: existing.college_level?.toString() || "",
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
      not_of_schooling_age: toNum(form.not_of_schooling_age),
      no_formal_education: toNum(form.no_formal_education),
      elementary_level: toNum(form.elementary_level),
      elementary_graduate: toNum(form.elementary_graduate),
      high_school_level: toNum(form.high_school_level),
      high_school_graduate: toNum(form.high_school_graduate),
      vocational_level: toNum(form.vocational_level),
      vocational_graduate: toNum(form.vocational_graduate),
      college_level: toNum(form.college_level),
      college_graduate: toNum(form.college_graduate),
      post_graduate_level: toNum(form.post_graduate_level),
      post_graduate: toNum(form.post_graduate),
      non_formal_education: toNum(form.non_formal_education),
      not_reported_no_response: toNum(form.not_reported_no_response),
    };

    if (isEditing && editingId) {
      await updateEmigrantEdu(editingId, data);
    } else {
      await addEmigrantEdu(data);
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
      not_of_schooling_age: record.not_of_schooling_age?.toString() || "",
      no_formal_education: record.no_formal_education?.toString() || "",
      elementary_level: record.elementary_level?.toString() || "",
      elementary_graduate: record.elementary_graduate?.toString() || "",
      high_school_level: record.high_school_level?.toString() || "",
      high_school_graduate: record.high_school_graduate?.toString() || "",
      vocational_level: record.vocational_level?.toString() || "",
      vocational_graduate: record.vocational_graduate?.toString() || "",
      college_level: record.college_level?.toString() || "",
      college_graduate: record.college_graduate?.toString() || "",
      post_graduate_level: record.post_graduate_level?.toString() || "",
      post_graduate: record.post_graduate?.toString() || "",
      non_formal_education: record.non_formal_education?.toString() || "",
      not_reported_no_response: record.not_reported_no_response?.toString() || "",
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
        await deleteEmigrantEdu(id);
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
      await deleteAllEmigrantEdu();
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
      const yearData = parseTransposedCSV(text, CSV_EDUCATION_MAP);

      if (yearData.length === 0) {
        setUploadStatus("CSV file is empty");
        return;
      }

      // Get existing records to check for duplicates
      const existingRecords = await getEmigrantEdus();
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
            await updateEmigrantEdu(existing.id, data);
            updated++;
          }
        } else {
          // Add new record
          await addEmigrantEdu(data);
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
    not_of_schooling_age: 0,
    no_formal_education: 0,
    elementary_level: 0,
    elementary_graduate: 0,
    high_school_level: 0,
    high_school_graduate: 0,
    vocational_level: 0,
    vocational_graduate: 0,
    college_level: 0,
    college_graduate: 0,
    post_graduate_level: 0,
    post_graduate: 0,
    non_formal_education: 0,
    not_reported_no_response: 0,
  }), [rows]);

  const chartData = [
    { category:"Not of Schooling Age", count: totals.not_of_schooling_age },
    { category:"No Formal Education", count: totals.no_formal_education },
    { category:"Elementary Level", count: totals.elementary_level },
    { category:"Elementary Graduate", count: totals.elementary_graduate },
    { category:"High School Level", count: totals.high_school_level },
    { category:"High School Graduate", count: totals.high_school_graduate },
    { category:"Vocational Level", count: totals.vocational_level },
    { category:"Vocational Graduate", count: totals.vocational_graduate },
    { category:"College Level", count: totals.college_level },
    { category:"College Graduate", count: totals.college_graduate },
    { category:"Post Grad Level", count: totals.post_graduate_level },
    { category:"Post Graduate", count: totals.post_graduate },
    { category:"Non-Formal Education", count: totals.non_formal_education },
    { category:"Not Reported / No Response", count: totals.not_reported_no_response },
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
        <h2>Education Level — {isEditing ? "Edit" : "Add"} Record</h2>
        
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
                {["Year","Not of Schooling Age","No Formal Education","Elementary Level","Elementary Graduate","High School Level","High School Graduate","Vocational Level","Vocational Graduate","College Level","College Graduate","Post Grad Level","Post Graduate","Non-Formal Education","Not Reported / No Response","Actions"]
                  .map(h => <th key={h} style={{ textAlign:"left", borderBottom:"1px solid #e2e8f0", padding:8 }}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {rows.map(r => (
                <tr key={r.id}>
                  <td>{r.year || 0}</td>
                  <td>{r.not_of_schooling_age || 0}</td>
                  <td>{r.no_formal_education || 0}</td>
                  <td>{r.elementary_level || 0}</td>
                  <td>{r.elementary_graduate || 0}</td>
                  <td>{r.high_school_level || 0}</td>
                  <td>{r.high_school_graduate || 0}</td>
                  <td>{r.vocational_level || 0}</td>
                  <td>{r.vocational_graduate || 0}</td>
                  <td>{r.college_level || 0}</td>
                  <td>{r.college_graduate || 0}</td>
                  <td>{r.post_graduate_level || 0}</td>
                  <td>{r.post_graduate || 0}</td>
                  <td>{r.non_formal_education || 0}</td>
                  <td>{r.not_reported_no_response || 0}</td>
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
        <h2>Total Emigrants by Education Level</h2>
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
