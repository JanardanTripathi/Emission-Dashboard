import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

function aggregateBySector(data) {
  const map = {};
  data.forEach((d) => {
    map[d.sector] = (map[d.sector] || 0) + d.emissions;
  });
  return Object.entries(map).map(([sector, emissions]) => ({
    sector,
    emissions,
  }));
}

export default function SectorBarChart({ data }) {
  const chartData = aggregateBySector(data);

  if (!chartData.length) {
    return <p>No data to display for this view.</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData}>
        <XAxis dataKey="sector" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="emissions" />
      </BarChart>
    </ResponsiveContainer>
  );
}
