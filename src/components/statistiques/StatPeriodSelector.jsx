"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

const PERIOD_MODES = [
  { id: "week", label: "Semaine", abbrev: "S" },
  { id: "month", label: "Mois", abbrev: "M" },
  { id: "year", label: "Année", abbrev: "A" },
  { id: "custom", label: "Période spécifiée", abbrev: "P" },
];

export const StatPeriodSelector = ({ mode, onModeChange }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const currentMode = PERIOD_MODES.find((m) => m.id === mode) || PERIOD_MODES[1];

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "6px",
          padding: "10px 14px",
          borderRadius: "var(--radius-md)",
          border: "2px solid var(--accent)",
          backgroundColor: "transparent",
          color: "var(--accent)",
          fontSize: "15px",
          fontWeight: "700",
          minHeight: "48px",
          minWidth: "48px",
          cursor: "pointer",
        }}
      >
        <span>{currentMode.abbrev}</span>
        <ChevronDown size={16} />
      </button>

      {open && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            marginTop: "8px",
            backgroundColor: "var(--card-bg)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-md)",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            zIndex: 100,
            minWidth: "180px",
            overflow: "hidden",
          }}
        >
          {PERIOD_MODES.map((p) => (
            <button
              key={p.id}
              onClick={() => {
                onModeChange(p.id);
                setOpen(false);
              }}
              style={{
                width: "100%",
                padding: "12px 16px",
                border: "none",
                backgroundColor: mode === p.id ? "var(--hover)" : "transparent",
                color: "var(--text-primary)",
                fontSize: "15px",
                textAlign: "left",
                cursor: "pointer",
              }}
            >
              {p.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
