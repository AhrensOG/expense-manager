"use client";

import React, { useState } from "react";
import { ChevronLeft } from "lucide-react";
import { getIconComponent, availableIcons } from "@/lib/icons";
import api from "@/lib/api";

const colorOptions = [
  "#FF6B6B",
  "#4ECDC4",
  "#45B7D1",
  "#96CEB4",
  "#FFEAA7",
  "#DDA0DD",
  "#2ECC71",
  "#27AE60",
  "#16A085",
  "#E74C3C",
  "#3498DB",
  "#9B59B6",
  "#F39C12",
  "#1ABC9C",
  "#95A5A6",
];

export const CategoryCreateForm = ({
  onClose,
  onBack,
  onCreated,
  initialType = "expense",
}) => {
  const [categoryName, setCategoryName] = useState("");
  const [categoryType, setCategoryType] = useState(initialType);
  const [categoryIcon, setCategoryIcon] = useState("folder");
  const [categoryColor, setCategoryColor] = useState("#95A5A6");
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = async () => {
    if (!categoryName.trim()) return;

    setIsCreating(true);
    try {
      const created = await api.createCategory({
        name: categoryName.trim(),
        type: categoryType,
        icon: categoryIcon,
        color: categoryColor,
      });

      if (onCreated) {
        onCreated({
          id: created.id.toString(),
          name: created.name,
          type: created.type,
          iconName: created.icon || "Folder",
          label: created.name,
          userId: created.userId,
        });
      }

      onClose();
    } catch (err) {
      console.error("Error creating category:", err);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        overflow: "hidden",
      }}>
      {/* Header */}
      <div
        style={{
          padding: "16px 20px",
          borderBottom: "1px solid var(--border)",
          display: "flex",
          alignItems: "center",
          gap: "12px",
        }}>
        <button
          onClick={onBack}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            fontSize: "16px",
            color: "var(--accent)",
            minHeight: "48px",
            padding: "8px 0",
            background: "none",
            border: "none",
            cursor: "pointer",
          }}>
          <ChevronLeft size={24} />
          Retour
        </button>
        <span
          style={{
            fontSize: "18px",
            fontWeight: "600",
            color: "var(--text-primary)",
          }}>
          Nouvelle catégorie
        </span>
      </div>

      <div style={{ flex: 1, overflow: "auto", padding: "20px" }}>
        {/* Type selection */}
        <div style={{ marginBottom: "20px" }}>
          <label
            style={{
              display: "block",
              fontSize: "13px",
              color: "var(--text-secondary)",
              marginBottom: "8px",
            }}>
            Type
          </label>
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              onClick={() => setCategoryType("expense")}
              style={{
                flex: 1,
                padding: "12px",
                borderRadius: "12px",
                fontWeight: "600",
                fontSize: "14px",
                backgroundColor:
                  categoryType === "expense" ? "var(--accent)" : "var(--bg)",
                color:
                  categoryType === "expense" ? "#FFF" : "var(--text-primary)",
                minHeight: "48px",
                border: "none",
                cursor: "pointer",
              }}>
              Dépense
            </button>
            <button
              onClick={() => setCategoryType("income")}
              style={{
                flex: 1,
                padding: "12px",
                borderRadius: "12px",
                fontWeight: "600",
                fontSize: "14px",
                backgroundColor:
                  categoryType === "income" ? "var(--income)" : "var(--bg)",
                color:
                  categoryType === "income" ? "#FFF" : "var(--text-primary)",
                minHeight: "48px",
                border: "none",
                cursor: "pointer",
              }}>
              Revenu
            </button>
          </div>
        </div>

        {/* Name input */}
        <div style={{ marginBottom: "20px" }}>
          <label
            style={{
              display: "block",
              fontSize: "13px",
              color: "var(--text-secondary)",
              marginBottom: "8px",
            }}>
            Nom de la catégorie
          </label>
          <input
            type="text"
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
            placeholder="Ex: Courses, Loyer..."
            style={{
              width: "100%",
              padding: "14px 16px",
              fontSize: "15px",
              backgroundColor: "var(--bg)",
              borderRadius: "12px",
              color: "var(--text-primary)",
              border: "none",
            }}
          />
        </div>

        {/* Icon selection */}
        <div style={{ marginBottom: "20px" }}>
          <label
            style={{
              display: "block",
              fontSize: "13px",
              color: "var(--text-secondary)",
              marginBottom: "8px",
            }}>
            Icône
          </label>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(5, 1fr)",
              gap: "8px",
            }}>
            {availableIcons.slice(0, 30).map((icon) => {
              const IconComp = getIconComponent(icon.name);
              const isSelected = categoryIcon === icon.name;
              return (
                <button
                  key={icon.name}
                  onClick={() => setCategoryIcon(icon.name)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "12px",
                    borderRadius: "12px",
                    backgroundColor: isSelected ? "var(--accent)" : "var(--bg)",
                    minHeight: "48px",
                    border: "none",
                    cursor: "pointer",
                  }}>
                  <IconComp
                    size={24}
                    color={isSelected ? "#FFF" : "var(--text-primary)"}
                  />
                </button>
              );
            })}
          </div>
        </div>

        {/* Color selection */}
        <div style={{ marginBottom: "24px" }}>
          <label
            style={{
              display: "block",
              fontSize: "13px",
              color: "var(--text-secondary)",
              marginBottom: "8px",
            }}>
            Couleur
          </label>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(5, 1fr)",
              gap: "8px",
            }}>
            {colorOptions.map((color) => {
              const isSelected = categoryColor === color;
              return (
                <button
                  key={color}
                  onClick={() => setCategoryColor(color)}
                  style={{
                    width: "100%",
                    aspectRatio: "1",
                    borderRadius: "12px",
                    backgroundColor: color,
                    border: isSelected
                      ? "3px solid var(--text-primary)"
                      : "3px solid transparent",
                    minHeight: "48px",
                    cursor: "pointer",
                  }}
                />
              );
            })}
          </div>
        </div>

        {/* Preview */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            padding: "16px",
            backgroundColor: "var(--bg)",
            borderRadius: "16px",
            marginBottom: "20px",
          }}>
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "12px",
              backgroundColor: `${categoryColor}20`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}>
            {React.createElement(getIconComponent(categoryIcon), {
              size: 24,
              color: categoryColor,
            })}
          </div>
          <div>
            <div
              style={{
                fontSize: "16px",
                fontWeight: "600",
                color: "var(--text-primary)",
              }}>
              {categoryName || "Nom de la catégorie"}
            </div>
            <div style={{ fontSize: "14px", color: "var(--text-secondary)" }}>
              {categoryType === "expense" ? "Dépense" : "Revenu"}
            </div>
          </div>
        </div>

        {/* Create button */}
        <button
          onClick={handleCreate}
          disabled={!categoryName.trim() || isCreating}
          style={{
            width: "100%",
            padding: "18px",
            backgroundColor: "var(--accent)",
            color: "#FFF",
            borderRadius: "16px",
            fontSize: "16px",
            fontWeight: "600",
            minHeight: "56px",
            opacity: !categoryName.trim() || isCreating ? 0.6 : 1,
            border: "none",
            cursor: categoryName.trim() && !isCreating ? "pointer" : "default",
          }}>
          {isCreating ? "Création..." : "Créer la catégorie"}
        </button>
      </div>
    </div>
  );
};
