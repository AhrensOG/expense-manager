"use client";

import { useState, useRef, useEffect } from "react";
import { SlidersHorizontal, Sun, Moon, ChevronDown, Plus } from "lucide-react";

const PERIOD_MODES = [
  { id: "week", label: "Semaine", abbrev: "S" },
  { id: "month", label: "Mois", abbrev: "M" },
  { id: "year", label: "Année", abbrev: "A" },
  { id: "custom", label: "Période spécifiée", abbrev: "P" },
];

const PeriodSelector = ({ mode, onModeChange }) => {
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
            minWidth: "150px",
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

/**
 * @typedef {Object} TopHeaderProps
 * @property {string} title
 * @property {boolean} isDark
 * @property {() => void} onToggleTheme
 * @property {boolean} [isMobile]
 * @property {"transactions"|"statistiques"|"comptes"} [variant]
 * @property {() => void} [onFilterClick]
 * @property {number} [activeFiltersCount]
 * @property {string} [periodMode]
 * @property {(mode: string) => void} [onPeriodModeChange]
 * @property {() => void} [onAddClick]
 */

/** @type {React.FC<TopHeaderProps>} */
export const TopHeader = ({
  title,
  isDark,
  onToggleTheme,
  isMobile = false,
  variant = "transactions",
  onFilterClick,
  activeFiltersCount = 0,
  periodMode,
  onPeriodModeChange,
  onAddClick,
}) => {
  const handleFilterClick = () => {
    if (variant === "statistiques" || variant === "comptes") return;
    if (onFilterClick) {
      onFilterClick();
    }
  };

  const renderLeftContent = () => {
    if (variant === "comptes" && onAddClick) {
      return (
        <button
          onClick={onAddClick}
          style={{
            minWidth: "48px",
            minHeight: "48px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "var(--accent)",
            borderRadius: "12px",
            border: "none",
            cursor: "pointer",
          }}
        >
          <Plus size={24} color="#FFF" />
        </button>
      );
    }

    if (variant === "statistiques" && periodMode && onPeriodModeChange) {
      return (
        <PeriodSelector
          mode={periodMode}
          onModeChange={onPeriodModeChange}
        />
      );
    }

    // Default: show filters for transactions
    return (
      <button
        onClick={handleFilterClick}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          padding: isMobile ? "10px 14px" : "12px 16px",
          borderRadius: "var(--radius-md)",
          border: "1px solid var(--border)",
          backgroundColor: activeFiltersCount > 0 ? "var(--accent)" : "var(--card-bg)",
          color: activeFiltersCount > 0 ? "#FFF" : "var(--text-primary)",
          fontSize: isMobile ? "14px" : "15px",
          fontWeight: "500",
          minHeight: "48px",
          cursor: "pointer",
          position: "relative",
        }}
      >
        <SlidersHorizontal size={isMobile ? 18 : 20} />
        {!isMobile && <span>Filtres</span>}
        {activeFiltersCount > 0 && (
          <span
            style={{
              position: "absolute",
              top: isMobile ? "4px" : "6px",
              right: isMobile ? "4px" : "6px",
              backgroundColor: isDark ? "#FFF" : "#FF5A3C",
              color: isDark ? "#FF5A3C" : "#FFF",
              borderRadius: "50%",
              width: isMobile ? "16px" : "18px",
              height: isMobile ? "16px" : "18px",
              fontSize: "11px",
              fontWeight: "700",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {activeFiltersCount}
          </span>
        )}
      </button>
    );
  };

  if (isMobile) {
    return (
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          backgroundColor: "var(--card-bg)",
          padding: "12px 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid var(--border)",
        }}
      >
        {renderLeftContent()}

        <h1
          style={{
            fontSize: "18px",
            fontWeight: "700",
            color: "var(--text-primary)",
            position: "absolute",
            left: "50%",
            transform: "translateX(-50%)",
          }}
        >
          {title}
        </h1>

        <button
          onClick={onToggleTheme}
          style={{
            minWidth: "48px",
            minHeight: "48px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "none",
            border: "none",
            cursor: "pointer",
          }}
        >
          {isDark ? (
            <Sun size={24} color="var(--text-primary)" />
          ) : (
            <Moon size={24} color="var(--text-primary)" />
          )}
        </button>
      </header>
    );
  }

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        backgroundColor: "var(--card-bg)",
        padding: "16px 32px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        borderBottom: "1px solid var(--border)",
        boxShadow: "var(--shadow-sm)",
      }}
    >
      <h1
        style={{
          fontSize: "28px",
          fontWeight: "700",
          color: "var(--text-primary)",
        }}
      >
        {title}
      </h1>

      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        {renderLeftContent()}

        <button
          onClick={onToggleTheme}
          style={{
            minWidth: "48px",
            minHeight: "48px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "none",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-md)",
            cursor: "pointer",
          }}
        >
          {isDark ? (
            <Sun size={22} color="var(--text-primary)" />
          ) : (
            <Moon size={22} color="var(--text-primary)" />
          )}
        </button>
      </div>
    </header>
  );
};
