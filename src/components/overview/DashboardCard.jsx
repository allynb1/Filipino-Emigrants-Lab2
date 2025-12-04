const cardStyle = {
  background: "#fff",
  border: "1px solid #e5e7eb",
  borderRadius: "16px",
  padding: "24px",
  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
  display: "flex",
  flexDirection: "column",
  transition: "transform 0.2s ease-in-out",
};

const titleStyle = {
  fontSize: "1.125rem",
  fontWeight: "600",
  color: "#111827",
  marginBottom: "16px",
  borderBottom: "1px solid #f3f4f6",
  paddingBottom: "12px",
};

export default function DashboardCard({ title, children, style = {} }) {
  return (
    <div style={{ ...cardStyle, ...style }}>
      <h3 style={titleStyle}>{title}</h3>
      <div style={{ flex: 1, minHeight: 0 }}>
        {children}
      </div>
    </div>
  );
}