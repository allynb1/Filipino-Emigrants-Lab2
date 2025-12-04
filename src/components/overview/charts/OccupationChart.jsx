import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Bar } from "recharts";
import { formatLabel } from "../../../utils/formatters";

export default function OccupationChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart data={data} layout="vertical" margin={{ left: 100 }}>
        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e5e7eb" />
        <XAxis type="number" tick={{ fill: '#6b7280' }} />
        <YAxis
          dataKey="name"
          type="category"
          width={150}
          tick={{ fill: '#6b7280', fontSize: 11 }}
          tickFormatter={formatLabel}
        />
        <Tooltip labelFormatter={formatLabel} />
        <Bar dataKey="value" fill="#ffc658" radius={[0, 4, 4, 0]} barSize={20} />
      </BarChart>
    </ResponsiveContainer>
  );
}