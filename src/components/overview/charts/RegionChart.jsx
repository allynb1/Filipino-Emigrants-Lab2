import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Bar } from "recharts";
import { formatLabel } from "../../../utils/formatters";

export default function RegionChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={500}>
      <BarChart data={data} margin={{ bottom: 120 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
        <XAxis
          dataKey="name"
          angle={-45}
          textAnchor="end"
          interval={0}
          tick={{ fill: '#6b7280', fontSize: 11 }}
          tickFormatter={formatLabel}
        />
        <YAxis tick={{ fill: '#6b7280' }} />
        <Tooltip labelFormatter={formatLabel} />
        <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}