"use client";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface BarChartProps {
  data: any;
  options?: any;
  className?: string;
}

export function BarChart({ data, options, className }: BarChartProps) {
  return <Bar data={data} options={options} className={className} />;
}
