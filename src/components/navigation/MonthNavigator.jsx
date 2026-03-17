"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { formatDate } from "@/utils/dateUtils";

export const MonthNavigator = ({
  year,
  month,
  onPrevious,
  onNext,
  variant = "full",
  isMobile = false,
}) => {
  const displayText =
    variant === "year"
      ? `${year}`
      : variant === "month"
        ? formatDate(`${year}-${String(month).padStart(2, "0")}-01`, "month")
        : formatDate(`${year}-${String(month).padStart(2, "0")}-01`, "month");

  const fontSize = isMobile
    ? variant === "year"
      ? "20px"
      : "18px"
    : variant === "year"
      ? "24px"
      : "22px";

  return (
    <div
      style={{
        position: "sticky",
        backgroundColor: "var(--card-bg)",
        zIndex: 40,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "16px",
        paddingTop: "16px",
      }}>
      <button
        onClick={onPrevious}
        style={{
          minWidth: "48px",
          minHeight: "48px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "var(--radius-sm)",
        }}>
        <ChevronLeft size={variant === "year" ? 24 : 28} />
      </button>

      <span
        style={{
          fontSize,
          fontWeight: "700",
          color: "var(--text-primary)",
          minWidth: "140px",
          textAlign: "center",
        }}>
        {displayText}
      </span>

      <button
        onClick={onNext}
        style={{
          minWidth: "48px",
          minHeight: "48px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "var(--radius-sm)",
        }}>
        <ChevronRight size={variant === "year" ? 24 : 28} />
      </button>
    </div>
  );
};
