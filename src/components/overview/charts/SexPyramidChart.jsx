import { ResponsiveBar } from '@nivo/bar';

export default function SexPyramidChart({ data }) {
  // Calculate max value to ensure symmetric domain (centered zero)
  // Handle empty data case to prevent crashes
  const maxVal = data.length > 0 ? Math.max(
    ...data.map(d => Math.max(Math.abs(d.male), Math.abs(d.female)))
  ) : 1000;

  // Add a buffer (e.g., 10%) to the max value so bars don't touch the edge
  const domainMax = maxVal * 1.1;

  if (!data || data.length === 0) {
    return (
      <div style={{ height: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280' }}>
        No data available for Population Pyramid
      </div>
    );
  }

  return (
    <div style={{ height: 800 }}>
      <ResponsiveBar
        data={data}
        keys={['male', 'female']}
        indexBy="year"
        margin={{ top: 20, right: 30, left: 60, bottom: 50 }}
        padding={0.3}
        layout="horizontal"
        valueScale={{ type: 'linear', min: -domainMax, max: domainMax }}
        indexScale={{ type: 'band', round: true }}
        colors={({ id }) => id === 'male' ? '#7986cb' : '#ffb74d'}
        axisTop={null}
        axisRight={null}
        axisBottom={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legend: 'Population',
          legendPosition: 'middle',
          legendOffset: 40,
          format: v => Math.abs(v) // Show positive values on both sides
        }}
        axisLeft={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legend: 'Year',
          legendPosition: 'middle',
          legendOffset: -50
        }}
        label={d => Math.abs(d.value)}
        labelSkipWidth={12}
        labelSkipHeight={12}
        labelTextColor="#fff"
        enableGridY={false}
        enableGridX={true}
        tooltip={({ id, value, color, indexValue }) => (
          <div style={{ padding: 12, color: '#111827', background: '#fff', borderRadius: 4, boxShadow: '0 2px 5px rgba(0,0,0,0.15)' }}>
            <strong style={{ color }}>{id === 'male' ? 'Male' : 'Female'}</strong>
            <br />
            Year: {indexValue}
            <br />
            Value: <strong>{Math.abs(value)}</strong>
          </div>
        )}
      />
    </div>
  );
}