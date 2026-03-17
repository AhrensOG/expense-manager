"use client";

const formatAmount = (amount) => {
  return Math.abs(amount).toLocaleString("de-DE", {
    minimumFractionDigits: 2,
  }) + " CHF";
};

const formatDate = (dateStr) => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  return date.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

export const StatCategoryRow = ({ item, icon: IconComponent }) => {
  const percent = item.percent || 0;
  const color = item.color || "#FF5A3C";

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        padding: "14px 0",
        borderBottom: "1px solid var(--border)",
        minHeight: "56px",
      }}
    >
      {/* Percent badge */}
      <div
        style={{
          minWidth: "48px",
          height: "28px",
          borderRadius: "14px",
          backgroundColor: color,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginRight: "12px",
        }}
      >
        <span style={{ color: "#FFF", fontSize: "14px", fontWeight: "700" }}>
          {percent}%
        </span>
      </div>

      {/* Icon + Name + Date */}
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          gap: "10px",
        }}
      >
        <div
          style={{
            width: "36px",
            height: "36px",
            borderRadius: "10px",
            backgroundColor: `${color}15`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <IconComponent size={20} color={color} />
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span
            style={{
              fontSize: "16px",
              fontWeight: "500",
              color: "var(--text-primary)",
            }}
          >
            {item.categoryName || "Autre"}
          </span>
          {item.date && (
            <span
              style={{
                fontSize: "13px",
                color: "var(--text-secondary)",
              }}
            >
              {formatDate(item.date)}
            </span>
          )}
        </div>
      </div>

      {/* Amount */}
      <span
        style={{
          fontSize: "16px",
          fontWeight: "600",
          color: "var(--text-primary)",
        }}
      >
        {formatAmount(item.amount)}
      </span>
    </div>
  );
};
