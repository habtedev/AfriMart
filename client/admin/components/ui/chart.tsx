// Basic chart UI helpers for dashboard (placeholder)
"use client";
import React from "react";

export function ChartContainer({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={className}>{children}</div>;
}

export function ChartTooltip({ children }: { children: React.ReactNode }) {
  return <div className="chart-tooltip">{children}</div>;
}

export function ChartTooltipContent({ children }: { children: React.ReactNode }) {
  return <div className="chart-tooltip-content">{children}</div>;
}
