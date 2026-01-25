"use client";
import { Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

interface PieChartProps {
  data: any;
  options?: any;
  className?: string;
}

export function PieChart({ data, options, className }: PieChartProps) {
  return <Pie data={data} options={options} className={className} />;
}
