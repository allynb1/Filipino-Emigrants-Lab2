import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Bar } from "recharts";
import { formatLabel } from "../../../utils/formatters";

export default function MajorCountriesChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart data={data} layout="vertical" margin={{ left: 80, right: 20 }}>
        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e5e7eb" />
        <XAxis type="number" tick={{ fill: '#6b7280' }} />
        <YAxis
          dataKey="name"
          type="category"
          width={120}
          tick={{ fill: '#6b7280', fontSize: 12 }}
          tickFormatter={formatLabel}
        />
        <Tooltip cursor={{ fill: 'transparent' }} labelFormatter={formatLabel} />
        <Bar dataKey="value" fill="#82ca9d" radius={[0, 4, 4, 0]} barSize={20} />
      </BarChart>
    </ResponsiveContainer>
  );
}