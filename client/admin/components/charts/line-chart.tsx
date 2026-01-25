"use client";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface LineChartProps {
  data: any;
  options?: any;
  className?: string;
}

export function LineChart({ data, options, className }: LineChartProps) {
  // Defensive: if data is not in the expected format, show nothing or fallback
  if (!data || typeof data !== "object" || !data.length) {
    return <div>No data</div>;
  }
  // Convert array of objects to chart.js format
  const labels = data.map((d: any) => d.date);
  const datasets = [];
  if (Array.isArray(data) && data.length > 0) {
    const keys = Object.keys(data[0]).filter((k) => k !== "date");
    for (const key of keys) {
      datasets.push({
        label: key.charAt(0).toUpperCase() + key.slice(1),
        data: data.map((d: any) => d[key]),
        fill: true,
      });
    }
  }
  const chartData = { labels, datasets };
  return <Line data={chartData} options={options} className={className} />;
}
