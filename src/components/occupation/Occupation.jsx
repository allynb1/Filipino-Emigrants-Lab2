import React, { useEffect, useMemo, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid, ResponsiveContainer,
} from "recharts";
import {
  addEmigrantOccupation,
  getEmigrantOccupations,
  getEmigrantOccupationByYear,
  updateEmigrantOccupation,
  deleteEmigrantOccupation,
  deleteAllEmigrantOccupation,
  CSV_OCCUPATION_MAP,
} from "../../services/emigrantsOccupationService";
import { parseTransposedCSV } from "../../utils/csvParser";

const card = { background:"#fff", border:"1px solid #e5e7eb", borderRadius:12, padding:20, boxShadow:"0 1px 2px rgba(0,0,0,.05)" };
const input = { margin:5, padding:8, borderRadius:8, border:"1px solid #e2e8f0", width: 160 };
const pill  = { border:"1px solid #e2e8f0", borderRadius:999, padding:"8px 14px", background:"#fff", cursor:"pointer" };

const emptyForm = {
  year: "",
  // Employed
  professional_technical_related: "",
  managerial_executive_administrative: "",
  clerical: "",
  sales: "",
  service: "",
  agri_animal_forestry_fishery: "",
  production_transport_laborers: "",
  armed_forces: "",
  // Unemployed
  housewives: "",
  retirees: "",
  students: "",
  minors_below_7: "",
  out_of_school_youth: "",
  refugees: "",
  no_occupation_reported: "",
};

export default function Occupation() {
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [yearInput, setYearInput] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [uploadStatus, setUploadStatus] = useState("");

  const onChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  
  const fetchRows = async () => {
    const data = await getEmigrantOccupations();
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

    const existing = await getEmigrantOccupationByYear(year);
    if (existing) {
      // Year exists - load data for editing
      setForm({
        year: existing.year.toString(),
        professional_technical_related: existing.professional_technical_related?.toString() || "",
        managerial_executive_administrative: existing.managerial_executive_administrative?.toString() || "",
        clerical: existing.clerical?.toString() || "",
        sales: existing.sales?.toString() || "",
        service: existing.service?.toString() || "",
        agri_animal_forestry_fishery: existing.agri_animal_forestry_fishery?.toString() || "",
        production_transport_laborers: existing.production_transport_laborers?.toString() || "",
        armed_forces: existing.armed_forces?.toString() || "",
        housewives: existing.housewives?.toString() || "",
        retirees: existing.retirees?.toString() || "",
        students: existing.students?.toString() || "",
        minors_below_7: existing.minors_below_7?.toString() || "",
        out_of_school_youth: existing.out_of_school_youth?.toString() || "",
        refugees: existing.refugees?.toString() || "",
        no_occupation_reported: existing.no_occupation_reported?.toString() || "",
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
      professional_technical_related: toNum(form.professional_technical_related),
      managerial_executive_administrative: toNum(form.managerial_executive_administrative),
      clerical: toNum(form.clerical),
      sales: toNum(form.sales),
      service: toNum(form.service),
      agri_animal_forestry_fishery: toNum(form.agri_animal_forestry_fishery),
      production_transport_laborers: toNum(form.production_transport_laborers),
      armed_forces: toNum(form.armed_forces),
      housewives: toNum(form.housewives),
      retirees: toNum(form.retirees),
      students: toNum(form.students),
      minors_below_7: toNum(form.minors_below_7),
      out_of_school_youth: toNum(form.out_of_school_youth),
      refugees: toNum(form.refugees),
      no_occupation_reported: toNum(form.no_occupation_reported),
    };

    if (isEditing && editingId) {
      await updateEmigrantOccupation(editingId, data);
    } else {
      await addEmigrantOccupation(data);
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
      professional_technical_related: record.professional_technical_related?.toString() || "",
      managerial_executive_administrative: record.managerial_executive_administrative?.toString() || "",
      clerical: record.clerical?.toString() || "",
      sales: record.sales?.toString() || "",
      service: record.service?.toString() || "",
      agri_animal_forestry_fishery: record.agri_animal_forestry_fishery?.toString() || "",
      production_transport_laborers: record.production_transport_laborers?.toString() || "",
      armed_forces: record.armed_forces?.toString() || "",
      housewives: record.housewives?.toString() || "",
      retirees: record.retirees?.toString() || "",
      students: record.students?.toString() || "",
      minors_below_7: record.minors_below_7?.toString() || "",
      out_of_school_youth: record.out_of_school_youth?.toString() || "",
      refugees: record.refugees?.toString() || "",
      no_occupation_reported: record.no_occupation_reported?.toString() || "",
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
        await deleteEmigrantOccupation(id);
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
      await deleteAllEmigrantOccupation();
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
      const yearData = parseTransposedCSV(text, CSV_OCCUPATION_MAP);

      if (yearData.length === 0) {
        setUploadStatus("CSV file is empty");
        return;
      }

      // Get existing records to check for duplicates
      const existingRecords = await getEmigrantOccupations();
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
            await updateEmigrantOccupation(existing.id, data);
            updated++;
          }
        } else {
          // Add new record
          await addEmigrantOccupation(data);
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
    professional_technical_related: 0,
    managerial_executive_administrative: 0,
    clerical: 0,
    sales: 0,
    service: 0,
    agri_animal_forestry_fishery: 0,
    production_transport_laborers: 0,
    armed_forces: 0,
    housewives: 0,
    retirees: 0,
    students: 0,
    minors_below_7: 0,
    out_of_school_youth: 0,
    refugees: 0,
    no_occupation_reported: 0,
  }), [rows]);

  const chartData = [
    // Employed
    { category: "Prof/Tech & Related", count: totals.professional_technical_related },
    { category: "Managerial/Exec/Admin", count: totals.managerial_executive_administrative },
    { category: "Clerical", count: totals.clerical },
    { category: "Sales", count: totals.sales },
    { category: "Service", count: totals.service },
    { category: "Agri/Forestry/Fishery", count: totals.agri_animal_forestry_fishery },
    { category: "Production/Transport/Laborers", count: totals.production_transport_laborers },
    { category: "Armed Forces", count: totals.armed_forces },
    // Unemployed
    { category: "Housewives", count: totals.housewives },
    { category: "Retirees", count: totals.retirees },
    { category: "Students", count: totals.students },
    { category: "Minors (<7)", count: totals.minors_below_7 },
    { category: "Out of School Youth", count: totals.out_of_school_youth },
    { category: "Refugees", count: totals.refugees },
    { category: "No Occupation Reported", count: totals.no_occupation_reported },
  ];

  const employedKeys = [
    "professional_technical_related",
    "managerial_executive_administrative",
    "clerical","sales","service",
    "agri_animal_forestry_fishery",
    "production_transport_laborers",
    "armed_forces",
  ];
  const unemployedKeys = [
    "housewives","retirees","students","minors_below_7",
    "out_of_school_youth","refugees","no_occupation_reported",
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
        <h2>Occupation — {isEditing ? "Edit" : "Add"} Record</h2>
        
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
                {["Year","Prof/Tech & Related","Managerial/Exec/Admin","Clerical","Sales","Service","Agri/Forestry/Fishery","Production/Transport/Laborers","Armed Forces","Housewives","Retirees","Students","Minors (<7)","Out of School Youth","Refugees","No Occupation Reported","Actions"]
                  .map(h => <th key={h} style={{ textAlign:"left", borderBottom:"1px solid #e2e8f0", padding:8 }}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {rows.map(r => (
                <tr key={r.id}>
                  <td>{r.year || 0}</td>
                  <td>{r.professional_technical_related || 0}</td>
                  <td>{r.managerial_executive_administrative || 0}</td>
                  <td>{r.clerical || 0}</td>
                  <td>{r.sales || 0}</td>
                  <td>{r.service || 0}</td>
                  <td>{r.agri_animal_forestry_fishery || 0}</td>
                  <td>{r.production_transport_laborers || 0}</td>
                  <td>{r.armed_forces || 0}</td>
                  <td>{r.housewives || 0}</td>
                  <td>{r.retirees || 0}</td>
                  <td>{r.students || 0}</td>
                  <td>{r.minors_below_7 || 0}</td>
                  <td>{r.out_of_school_youth || 0}</td>
                  <td>{r.refugees || 0}</td>
                  <td>{r.no_occupation_reported || 0}</td>
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
        <h2>Total Emigrants by Occupation</h2>
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
