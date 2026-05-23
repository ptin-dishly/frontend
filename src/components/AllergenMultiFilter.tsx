import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import type { Allergen } from "../services/api";

interface AllergenMultiFilterProps {
  allergens: Allergen[];
  selectedAllergenIds: string[];
  onChange: (selectedIds: string[]) => void;
}

export default function AllergenMultiFilter({
  allergens,
  selectedAllergenIds,
  onChange,
}: AllergenMultiFilterProps) {
  const { t, i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const [, setLanguageKey] = useState(0); // Force re-render on language change

  // Re-render when language changes
  useEffect(() => {
    const handleLanguageChange = () => {
      setLanguageKey((prev) => prev + 1);
    };

    i18n.on("languageChanged", handleLanguageChange);

    return () => {
      i18n.off("languageChanged", handleLanguageChange);
    };
  }, [i18n]);

  const toggleAllergen = (allergenId: string) => {
    const newSelected = selectedAllergenIds.includes(allergenId)
      ? selectedAllergenIds.filter((id) => id !== allergenId)
      : [...selectedAllergenIds, allergenId];

    onChange(newSelected);
  };

  const selectAll = () => {
    onChange(allergens.map((a) => a.id));
  };

  const clearAll = () => {
    onChange([]);
  };

  const selectedCount = selectedAllergenIds.length;

  // Get allergen name based on current language
  const getAllergenName = (allergen: Allergen): string => {
    const lang = i18n.language.slice(0, 2);
    switch (lang) {
      case "ca":
        return allergen.nameCa;
      case "en":
        return allergen.nameEn;
      case "es":
      default:
        return allergen.nameEs;
    }
  };

  return (
    <div style={{ position: "relative", width: "100%" }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: "100%",
          padding: "10px 12px",
          borderRadius: 6,
          border: "1px solid #E5E7EB",
          backgroundColor: "white",
          cursor: "pointer",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontSize: 12,
          fontFamily: "inherit",
        }}
      >
        <span>
          {selectedCount === 0
            ? t("allergens.selectToExclude")
            : t("allergens.selectedCount", { count: selectedCount })}
        </span>
        <span style={{ fontSize: 10 }}>▼</span>
      </button>

      {open && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            zIndex: 10,
            backgroundColor: "white",
            border: "1px solid #E5E7EB",
            borderRadius: 6,
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            maxHeight: 300,
            overflowY: "auto",
            marginTop: 4,
          }}
        >
          {/* Select All / Clear All Buttons */}
          <div
            style={{
              display: "flex",
              gap: 8,
              padding: 8,
              borderBottom: "1px solid #E5E7EB",
            }}
          >
            <button
              onClick={selectAll}
              style={{
                flex: 1,
                padding: "6px 12px",
                backgroundColor: "#7C3AED",
                color: "white",
                border: "none",
                borderRadius: 4,
                fontSize: 11,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              {t("allergens.selectAll")}
            </button>
            <button
              onClick={clearAll}
              style={{
                flex: 1,
                padding: "6px 12px",
                backgroundColor: "#E5E7EB",
                border: "none",
                borderRadius: 4,
                fontSize: 11,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              {t("allergens.clearAll")}
            </button>
          </div>

          {/* Allergen Checkboxes */}
          <div style={{ padding: 8 }}>
            {allergens.map((allergen) => (
              <label
                key={allergen.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "8px 12px",
                  cursor: "pointer",
                  borderRadius: 4,
                  transition: "background-color 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#F3F4F6";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                }}
              >
                <input
                  type="checkbox"
                  checked={selectedAllergenIds.includes(allergen.id)}
                  onChange={() => toggleAllergen(allergen.id)}
                  style={{ cursor: "pointer" }}
                />
                <span style={{ fontSize: 12, flex: 1 }}>
                  {getAllergenName(allergen)}
                </span>
                <span
                  style={{
                    fontSize: 10,
                    color: "#9CA3AF",
                  }}
                >
                  ({allergen.code})
                </span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Display selected allergens as badges */}
      {selectedCount > 0 && (
        <div
          style={{
            marginTop: 8,
            display: "flex",
            flexWrap: "wrap",
            gap: 6,
          }}
        >
          {selectedAllergenIds.map((allergenId) => {
            const allergen = allergens.find((a) => a.id === allergenId);
            return (
              <div
                key={allergenId}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "4px 10px",
                  backgroundColor: "#FEE2E2",
                  border: "1px solid #FECACA",
                  borderRadius: 20,
                  fontSize: 11,
                  color: "#991B1B",
                  fontWeight: 500,
                }}
              >
                {allergen ? getAllergenName(allergen) : ""}
                <button
                  onClick={() => toggleAllergen(allergenId)}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "#991B1B",
                    fontSize: 14,
                    lineHeight: 1,
                    padding: 0,
                  }}
                >
                  ×
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}