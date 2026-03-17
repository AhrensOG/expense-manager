"use client";

import { useState, useEffect, useRef } from "react";
import { X, Check, ChevronDown } from "lucide-react";
import api from "@/lib/api";

const ACCENT_COLOR = "#FF5A3C";

const months = [
  { value: 1, label: "Janvier" },
  { value: 2, label: "Février" },
  { value: 3, label: "Mars" },
  { value: 4, label: "Avril" },
  { value: 5, label: "Mai" },
  { value: 6, label: "Juin" },
  { value: 7, label: "Juillet" },
  { value: 8, label: "Août" },
  { value: 9, label: "Septembre" },
  { value: 10, label: "Octobre" },
  { value: 11, label: "Novembre" },
  { value: 12, label: "Décembre" },
];

const typeOptions = [
  { value: null, label: "Tous" },
  { value: "income", label: "Revenus" },
  { value: "expense", label: "Dépenses" },
  { value: "transfer", label: "Transferts" },
];

function Dropdown({ value, onChange, options, placeholder, isMobile }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selected = options.find((o) => o.value === value);

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: "100%",
          padding: "10px 12px",
          borderRadius: "var(--radius-md)",
          border: `1px solid ${value ? ACCENT_COLOR : "var(--border)"}`,
          backgroundColor: "var(--card-bg)",
          color: value ? "var(--text-primary)" : "var(--text-secondary)",
          fontSize: "14px",
          minHeight: "44px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          cursor: "pointer",
        }}
      >
        <span>{selected?.label || placeholder}</span>
        <ChevronDown size={16} />
      </button>
      {open && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            backgroundColor: "var(--card-bg)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-md)",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            zIndex: 100,
            maxHeight: "200px",
            overflowY: "auto",
          }}
        >
          {options.map((opt) => (
            <button
              key={opt.value ?? "null"}
              onClick={() => {
                onChange(opt.value);
                setOpen(false);
              }}
              style={{
                width: "100%",
                padding: "10px 12px",
                border: "none",
                backgroundColor: value === opt.value ? `${ACCENT_COLOR}15` : "transparent",
                color: "var(--text-primary)",
                fontSize: "14px",
                textAlign: "left",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              {opt.label}
              {value === opt.value && <Check size={16} color={ACCENT_COLOR} />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export const FilterPanel = ({
  filters,
  setFilters,
  onClose,
  isMobile = false,
}) => {
  const [categories, setCategories] = useState([]);
  const [accounts, setAccounts] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [cats, accs] = await Promise.all([
          api.getCategories(),
          api.getAccounts(),
        ]);
        setCategories(cats);
        setAccounts(accs);
      } catch (err) {
        console.error("Error fetching filter data:", err);
      }
    };
    fetchData();
  }, []);

  const categoryOptions = [
    { value: null, label: "Toutes" },
    ...categories.map((c) => ({ value: c.id, label: c.name })),
  ];

  const accountOptions = [
    { value: null, label: "Tous" },
    ...accounts.map((a) => ({ value: a.id, label: a.name })),
  ];

  const monthOptions = [
    { value: null, label: "Tous" },
    ...months,
  ];

  const clearFilters = () => {
    setFilters({
      type: null,
      categoryId: null,
      accountId: null,
      month: null,
    });
  };

  const activeCount = Object.values(filters).filter((v) => v !== null).length;

  return (
    <div
      style={{
        backgroundColor: "var(--card-bg)",
        borderBottom: "1px solid var(--border)",
        padding: isMobile ? "12px 16px" : "16px 24px",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "4px",
        }}
      >
        <span style={{ fontSize: "15px", fontWeight: "600", color: "var(--text-primary)" }}>
          Filtres {activeCount > 0 && `(${activeCount})`}
        </span>
        <div style={{ display: "flex", gap: "8px" }}>
          {activeCount > 0 && (
            <button
              onClick={clearFilters}
              style={{
                padding: "6px 12px",
                borderRadius: "var(--radius-sm)",
                border: "none",
                backgroundColor: "var(--bg)",
                color: "var(--text-secondary)",
                fontSize: "13px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              <X size={14} />
              Effacer
            </button>
          )}
          <button
            onClick={onClose}
            style={{
              minWidth: "32px",
              minHeight: "32px",
              borderRadius: "var(--radius-sm)",
              border: "none",
              backgroundColor: "var(--bg)",
              color: "var(--text-secondary)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <X size={18} />
          </button>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        <div>
          <div style={{ fontSize: "13px", color: "var(--text-secondary)", marginBottom: "6px" }}>
            Type
          </div>
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
            {typeOptions.map((opt) => (
              <button
                key={opt.value ?? "null"}
                onClick={() => setFilters((f) => ({ ...f, type: opt.value }))}
                style={{
                  padding: "8px 14px",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid",
                  borderColor: filters.type === opt.value ? ACCENT_COLOR : "var(--border)",
                  backgroundColor: filters.type === opt.value ? `${ACCENT_COLOR}15` : "var(--bg)",
                  color: filters.type === opt.value ? ACCENT_COLOR : "var(--text-primary)",
                  fontSize: "13px",
                  fontWeight: filters.type === opt.value ? "600" : "400",
                  cursor: "pointer",
                  minHeight: "40px",
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
          <div>
            <div style={{ fontSize: "13px", color: "var(--text-secondary)", marginBottom: "6px" }}>
              Catégorie
            </div>
            <Dropdown
              value={filters.categoryId}
              onChange={(v) => setFilters((f) => ({ ...f, categoryId: v }))}
              options={categoryOptions}
              placeholder="Toutes"
              isMobile={isMobile}
            />
          </div>
          <div>
            <div style={{ fontSize: "13px", color: "var(--text-secondary)", marginBottom: "6px" }}>
              Compte
            </div>
            <Dropdown
              value={filters.accountId}
              onChange={(v) => setFilters((f) => ({ ...f, accountId: v }))}
              options={accountOptions}
              placeholder="Tous"
              isMobile={isMobile}
            />
          </div>
        </div>

        <div>
          <div style={{ fontSize: "13px", color: "var(--text-secondary)", marginBottom: "6px" }}>
            Mois
          </div>
          <Dropdown
            value={filters.month}
            onChange={(v) => setFilters((f) => ({ ...f, month: v }))}
            options={monthOptions}
            placeholder="Tous"
            isMobile={isMobile}
          />
        </div>
      </div>
    </div>
  );
};
