"use client";

import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { getIconComponent, Folder } from "@/lib/icons";

const INCOME_COLORS = [
  "#4A90D9",
  "#34C759",
  "#5AC8FA",
  "#30D158",
  "#64D2FF",
  "#32D74B",
];

const EXPENSE_COLORS = [
  "#FF5A3C",
  "#FF9500",
  "#FF2D55",
  "#FF6B6B",
  "#FF8C00",
  "#E74C3C",
];

export const StatChart = ({ data, isMobile = false, type = "expense" }) => {
  const chartSize = isMobile ? 310 : 370;
  const innerRadius = isMobile ? 55 : 75;
  const outerRadius = isMobile ? 95 : 125;
  const colors = type === "income" ? INCOME_COLORS : EXPENSE_COLORS;

  if (!data || data.length === 0) {
    return (
      <div
        style={{
          height: chartSize,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--text-secondary)",
          fontSize: "15px",
        }}>
        Aucune donnée
      </div>
    );
  }

  const total = data.reduce((sum, item) => sum + Math.abs(item.amount), 0);

  const chartData = data.map((item, index) => {
    const iconKey = item.categoryIcon || item.icon || "folder";
    const IconComponent = getIconComponent(iconKey);
    return {
      name: item.categoryName || item.name || "Autre",
      icon: IconComponent,
      value: Math.abs(item.amount),
      percent:
        total > 0 ? ((Math.abs(item.amount) / total) * 100).toFixed(1) : "0",
      color: item.color || colors[index % colors.length],
    };
  });

  const renderCustomLabel = ({ cx, cy, midAngle, outerRadius, index }) => {
    const entry = chartData[index];

    // Guard: si no existe el entry, no renderizar nada
    if (!entry) return null;
    if (parseFloat(entry.percent) < 5) return null;

    const RADIAN = Math.PI / 180;
    const radius = outerRadius + 36;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    const IconComponent = entry.icon;

    return (
      <foreignObject
        x={x - 22}
        y={y - 22}
        width={44}
        height={44}
        style={{ overflow: "visible" }}>
        <div
          style={{
            width: "44px",
            height: "44px",
            borderRadius: "12px",
            backgroundColor: `${entry.color}20`,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "2px",
          }}>
          {IconComponent ? (
            <IconComponent size={18} color={entry.color} />
          ) : (
            <Folder size={18} color={entry.color} />
          )}
          <span
            style={{
              fontSize: "11px",
              fontWeight: "700",
              color: entry.color,
              lineHeight: 1,
            }}>
            {entry.percent}%
          </span>
        </div>
      </foreignObject>
    );
  };

  return (
    <div style={{ width: chartSize, height: chartSize, margin: "0 auto" }}>
      <ResponsiveContainer width={chartSize} height={chartSize}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            paddingAngle={2}
            dataKey="value"
            label={renderCustomLabel}
            labelLine={false}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};
