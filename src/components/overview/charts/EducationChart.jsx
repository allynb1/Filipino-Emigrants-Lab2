import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Bar } from "recharts";
import { formatLabel } from "../../../utils/formatters";

export default function EducationChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data} margin={{ bottom: 40 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
        <XAxis
          dataKey="name"
          tick={{ fill: '#6b7280', fontSize: 11 }}
          interval={0}
          angle={-20}
          textAnchor="end"
          tickFormatter={formatLabel}
        />
        <YAxis tick={{ fill: '#6b7280' }} />
        <Tooltip labelFormatter={formatLabel} />
        <Bar dataKey="value" fill="#8884d8" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}