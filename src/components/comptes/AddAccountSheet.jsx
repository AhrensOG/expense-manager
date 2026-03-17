"use client";

import { useState } from "react";
import {
  Wallet,
  Building,
  CreditCard,
  PiggyBank,
  Folder,
  ChevronDown,
} from "lucide-react";
import { accountTypes } from "@/data/mockData";
import { toast } from "sonner";
import api from "@/lib/api";

const iconMap = {
  wallet: Wallet,
  building: Building,
  "credit-card": CreditCard,
  "piggy-bank": PiggyBank,
  folder: Folder,
};

export const AddAccountSheet = ({
  isOpen,
  onClose,
  onAdd,
  isMobile = false,
}) => {
  const [name, setName] = useState("");
  const [type, setType] = useState("bancaire");
  const [balance, setBalance] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isDropDownOpen, setIsDropDownOpen] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!name.trim()) return;

    setIsLoading(true);
    try {
      const apiType =
        accountTypes.find((t) => t.id === type)?.apiType || "bank";

      const account = await api.createAccount({
        name: name.trim(),
        type: apiType,
        balance: parseFloat(balance) || 0,
        currencyId: 1,
      });

      toast("Compte créé avec succès", { duration: 2000 });

      if (onAdd) {
        onAdd(account);
      }

      setName("");
      setType("bancaire");
      setBalance("");
      onClose();
    } catch (err) {
      toast(err.message || "Erreur lors de la création du compte", {
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: isMobile ? "flex-end" : "center",
        justifyContent: "center",
        zIndex: 50,
      }}>
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: isMobile ? "100%" : "420px",
          maxHeight: isMobile ? "90vh" : "auto",
          backgroundColor: "var(--card-bg)",
          borderRadius: isMobile ? "24px 24px 0 0" : "24px",
          padding: "28px 24px",
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: "24px",
        }}>
        {/* Drag handle - mobile only */}
        {isMobile && (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              marginTop: "-8px",
            }}>
            <div
              style={{
                width: "36px",
                height: "4px",
                backgroundColor: "var(--border)",
                borderRadius: "2px",
              }}
            />
          </div>
        )}
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}>
          <h2
            style={{
              fontSize: "20px",
              fontWeight: "700",
              color: "var(--text-primary)",
            }}>
            Nouveau compte
          </h2>
          <button
            onClick={onClose}
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "50%",
              backgroundColor: "var(--bg)",
              color: "var(--text-secondary)",
              fontSize: "16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}>
            ✕
          </button>
        </div>
        {/* Account name */}
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <label
            style={{
              fontSize: "13px",
              fontWeight: "600",
              color: "var(--text-secondary)",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}>
            Nom du compte
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: Compte courant, Épargne..."
            autoFocus
            style={{
              width: "100%",
              padding: "14px 16px",
              fontSize: "15px",
              backgroundColor: "var(--bg)",
              borderRadius: "12px",
              color: "var(--text-primary)",
              border: "1px solid var(--border)",
              outline: "none",
              transition: "border-color 0.2s",
            }}
            onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
            onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
          />
        </div>

        {/* Account type */}
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <label
            style={{
              fontSize: "13px",
              fontWeight: "600",
              color: "var(--text-secondary)",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}>
            Type de compte
          </label>

          <div style={{ position: "relative" }}>
            {/* Trigger */}
            <button
              onClick={() => setIsDropDownOpen(!isDropDownOpen)}
              style={{
                width: "100%",
                padding: "14px 48px 14px 48px",
                fontSize: "15px",
                backgroundColor: "var(--bg)",
                borderRadius: isOpen ? "12px 12px 0 0" : "12px",
                color: "var(--text-primary)",
                border: "1px solid",
                borderColor: isDropDownOpen ? "var(--accent)" : "var(--border)",
                display: "flex",
                alignItems: "center",
                cursor: "pointer",
                transition: "all 0.2s",
                textAlign: "left",
              }}>
              {/* Icono seleccionado */}
              <div style={{ position: "absolute", left: "14px" }}>
                {(() => {
                  const selected = accountTypes.find((t) => t.id === type);
                  const IconComponent = iconMap[selected?.icon] || Wallet;
                  return <IconComponent size={20} color="var(--accent)" />;
                })()}
              </div>

              {/* Label seleccionado */}
              <span>{accountTypes.find((t) => t.id === type)?.label}</span>

              {/* Flecha */}
              <div
                style={{
                  position: "absolute",
                  right: "14px",
                  transition: "transform 0.2s",
                  transform: isDropDownOpen ? "rotate(180deg)" : "rotate(0deg)",
                }}>
                <ChevronDown size={18} color="var(--text-secondary)" />
              </div>
            </button>

            {/* Dropdown */}
            {isDropDownOpen && (
              <div
                style={{
                  position: "absolute",
                  top: "100%",
                  left: 0,
                  right: 0,
                  backgroundColor: "var(--bg)",
                  border: "1px solid var(--accent)",
                  borderTop: "none",
                  borderRadius: "0 0 12px 12px",
                  overflow: "hidden",
                  zIndex: 10,
                  maxHeight: "120px",
                  overflowY: "auto",
                }}>
                {accountTypes.map((t, index) => {
                  const IconComponent = iconMap[t.icon] || Wallet;
                  const isSelected = type === t.id;
                  const isLast = index === accountTypes.length - 1;
                  return (
                    <button
                      key={t.id}
                      onClick={() => {
                        setType(t.id);
                        setIsDropDownOpen(false);
                      }}
                      style={{
                        width: "100%",
                        padding: "14px 16px",
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        backgroundColor: isSelected
                          ? "var(--accent)10"
                          : "transparent",
                        color: isSelected
                          ? "var(--accent)"
                          : "var(--text-primary)",
                        fontSize: "15px",
                        fontWeight: isSelected ? "600" : "400",
                        borderBottom: isLast
                          ? "none"
                          : "1px solid var(--border)",
                        cursor: "pointer",
                        transition: "background-color 0.15s",
                        textAlign: "left",
                        minHeight: "52px",
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected)
                          e.currentTarget.style.backgroundColor =
                            "var(--border)";
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected)
                          e.currentTarget.style.backgroundColor = "transparent";
                      }}>
                      <IconComponent
                        size={20}
                        color={
                          isSelected ? "var(--accent)" : "var(--text-secondary)"
                        }
                      />
                      {t.label}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
        {/* Initial balance */}
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <label
            style={{
              fontSize: "13px",
              fontWeight: "600",
              color: "var(--text-secondary)",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}>
            Solde initial
          </label>
          <div style={{ position: "relative" }}>
            <input
              type="number"
              value={balance}
              onChange={(e) => setBalance(e.target.value)}
              placeholder="0,00"
              style={{
                width: "100%",
                padding: "14px 52px 14px 16px",
                fontSize: "15px",
                backgroundColor: "var(--bg)",
                borderRadius: "12px",
                color: "var(--text-primary)",
                border: "1px solid var(--border)",
                outline: "none",
                transition: "border-color 0.2s",
              }}
              onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
              onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
            />
            <span
              style={{
                position: "absolute",
                right: "16px",
                top: "50%",
                transform: "translateY(-50%)",
                fontSize: "14px",
                fontWeight: "600",
                color: "var(--text-secondary)",
              }}>
              CHF
            </span>
          </div>
        </div>
        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={!name.trim() || isLoading}
          style={{
            width: "100%",
            padding: "16px",
            backgroundColor: "var(--accent)",
            color: "#FFF",
            borderRadius: "14px",
            fontSize: "15px",
            fontWeight: "600",
            minHeight: "52px",
            opacity: !name.trim() || isLoading ? 0.5 : 1,
            cursor: !name.trim() || isLoading ? "not-allowed" : "pointer",
            transition: "opacity 0.2s",
          }}>
          {isLoading ? "Création..." : "Ajouter le compte"}
        </button>
      </div>
    </div>
  );
};
