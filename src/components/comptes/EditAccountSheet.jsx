"use client";

import { useState } from "react";
import {
  Wallet,
  Building,
  CreditCard,
  PiggyBank,
  Folder,
  ChevronDown,
  Trash2,
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

export const EditAccountSheet = ({
  isOpen,
  onClose,
  onEdit,
  onDelete,
  account,
  isMobile = false,
}) => {
  const [name, setName] = useState(account?.name || "");
  const [type, setType] = useState(
    accountTypes.find((t) => t.apiType === account?.type)?.id || "bank"
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isDropDownOpen, setIsDropDownOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (!isOpen || !account) return null;

  const handleSave = async () => {
    if (!name.trim()) return;

    setIsLoading(true);
    try {
      const apiType =
        accountTypes.find((t) => t.id === type)?.apiType || "bank";

      const updatedAccount = await api.updateAccount(account.id, {
        name: name.trim(),
        type: apiType,
      });

      toast("Compte modifié avec succès", { duration: 2000 });

      if (onEdit) {
        onEdit(updatedAccount);
      }

      onClose();
    } catch (err) {
      toast(err.message || "Erreur lors de la modification du compte", {
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      await api.deleteAccount(account.id);

      toast("Compte supprimé avec succès", { duration: 2000 });

      if (onDelete) {
        onDelete(account.id);
      }

      onClose();
    } catch (err) {
      toast(err.message || "Erreur lors de la suppression du compte", {
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
      }}
    >
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
        }}
      >
        {/* Drag handle - mobile only */}
        {isMobile && (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              marginTop: "-8px",
            }}
          >
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
          }}
        >
          <h2
            style={{
              fontSize: "20px",
              fontWeight: "700",
              color: "var(--text-primary)",
            }}
          >
            Modifier le compte
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
            }}
          >
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
            }}
          >
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
            }}
          >
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
                borderRadius: isDropDownOpen ? "12px 12px 0 0" : "12px",
                color: "var(--text-primary)",
                border: "1px solid",
                borderColor: isDropDownOpen ? "var(--accent)" : "var(--border)",
                display: "flex",
                alignItems: "center",
                cursor: "pointer",
                transition: "all 0.2s",
                textAlign: "left",
              }}
            >
              {/* Icono seleccionado */}
              <div style={{ position: "absolute", left: "14px" }}>
                {(() => {
                  const selected = accountTypes.find((t) => t.id === type);
                  const IconComponent = iconMap[selected?.icon] || Wallet;
                  return <IconComponent size={20} color="var(--accent)" />;
                })()}
              </div>

              {/* Label seleccionado */}
              <span>
                {accountTypes.find((t) => t.id === type)?.label}
              </span>

              {/* Flecha */}
              <div
                style={{
                  position: "absolute",
                  right: "14px",
                  transition: "transform 0.2s",
                  transform: isDropDownOpen
                    ? "rotate(180deg)"
                    : "rotate(0deg)",
                }}
              >
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
                }}
              >
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
                          e.currentTarget.style.backgroundColor =
                            "transparent";
                      }}
                    >
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

        {/* Balance (readonly) */}
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <label
            style={{
              fontSize: "13px",
              fontWeight: "600",
              color: "var(--text-secondary)",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}
          >
            Solde actuel
          </label>
          <div
            style={{
              padding: "14px 16px",
              fontSize: "15px",
              backgroundColor: "var(--bg)",
              borderRadius: "12px",
              color: "var(--text-primary)",
              border: "1px solid var(--border)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span>
              {account.balance
                ? parseFloat(account.balance).toLocaleString("de-DE", {
                    minimumFractionDigits: 2,
                  })
                : "0,00"}
            </span>
            <span
              style={{
                fontSize: "14px",
                fontWeight: "600",
                color: "var(--text-secondary)",
              }}
            >
              CHF
            </span>
          </div>
        </div>

        {/* Delete confirmation */}
        {showDeleteConfirm ? (
          <div
            style={{
              padding: "16px",
              backgroundColor: "rgba(255, 90, 60, 0.1)",
              borderRadius: "12px",
              border: "1px solid #FF5A3C",
            }}
          >
            <p
              style={{
                fontSize: "14px",
                color: "var(--text-primary)",
                marginBottom: "12px",
                textAlign: "center",
              }}
            >
              Supprimer ce compte? Cette action est irréversible.
            </p>
            <div style={{ display: "flex", gap: "12px" }}>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                style={{
                  flex: 1,
                  padding: "12px",
                  backgroundColor: "var(--bg)",
                  color: "var(--text-primary)",
                  borderRadius: "10px",
                  fontSize: "14px",
                  fontWeight: "600",
                  cursor: "pointer",
                  border: "1px solid var(--border)",
                }}
              >
                Annuler
              </button>
              <button
                onClick={handleDelete}
                disabled={isLoading}
                style={{
                  flex: 1,
                  padding: "12px",
                  backgroundColor: "#FF5A3C",
                  color: "#FFF",
                  borderRadius: "10px",
                  fontSize: "14px",
                  fontWeight: "600",
                  cursor: isLoading ? "not-allowed" : "pointer",
                  opacity: isLoading ? 0.6 : 1,
                }}
              >
                Supprimer
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Submit */}
            <button
              onClick={handleSave}
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
                border: "none",
              }}
            >
              {isLoading ? "Enregistrement..." : "Enregistrer"}
            </button>

            {/* Delete button */}
            <button
              onClick={() => setShowDeleteConfirm(true)}
              style={{
                width: "100%",
                padding: "16px",
                backgroundColor: "transparent",
                color: "#FF5A3C",
                borderRadius: "14px",
                fontSize: "15px",
                fontWeight: "600",
                minHeight: "52px",
                cursor: "pointer",
                border: "1px solid #FF5A3C",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
              }}
            >
              <Trash2 size={18} />
              Supprimer le compte
            </button>
          </>
        )}
      </div>
    </div>
  );
};
