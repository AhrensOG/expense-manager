"use client";

import { StatCategoryRow } from "./StatCategoryRow";
import { getIconComponent } from "@/lib/icons";

export const StatCategoryList = ({ data }) => {
  if (!data || data.length === 0) {
    return null;
  }

  const total = data.reduce((sum, item) => sum + Math.abs(item.amount), 0);
  const sortedData = [...data].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div style={{ padding: "0 16px" }}>
      {sortedData.map((item) => {
        const percent =
          total > 0
            ? ((Math.abs(item.amount) / total) * 100).toFixed(1)
            : 0;
        const rowItem = {
          ...item,
          percent: parseFloat(percent),
          categoryName: item.category?.name || item.categoryName || "Autre",
        };
        const iconKey = item.category?.icon || item.categoryIcon || "folder";
        const IconComponent = getIconComponent(iconKey);
        const key = item.id || item.categoryId || `cat-${iconKey}`;
        return <StatCategoryRow key={key} item={rowItem} icon={IconComponent} />;
      })}
    </div>
  );
};
