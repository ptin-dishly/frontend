import React, { useEffect, useState } from "react";
import { allergenService, type Allergen } from "../services/api";

interface AlergenFilterProps {
  onAllergenChange: (excludedAllergenIds: string[]) => void;
}

const AlergenFilter: React.FC<AlergenFilterProps> = ({ onAllergenChange }) => {
  const [allergens, setAllergens] = useState<Allergen[]>([]);
  const [selectedAllergens, setSelectedAllergens] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const fetchAllergens = async () => {
      setLoading(true);
      try {
        const res = await allergenService.getAll();
        if (res.success && res.data) {
          setAllergens(res.data);
          // Initialize with all allergens selected (none excluded)
          setSelectedAllergens(new Set(res.data.map((a) => a.id)));
        }
      } catch (err) {
        console.error("Error fetching allergens:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllergens();
  }, []);

  const toggleAllergen = (allergenId: string) => {
    const newSelected = new Set(selectedAllergens);
    if (newSelected.has(allergenId)) {
      newSelected.delete(allergenId);
    } else {
      newSelected.add(allergenId);
    }
    setSelectedAllergens(newSelected);

    // Calculate excluded (not selected) allergens
    const excluded = allergens
      .filter((a) => !newSelected.has(a.id))
      .map((a) => a.id);
    
    onAllergenChange(excluded);
  };

  const selectAll = () => {
    const allIds = new Set(allergens.map((a) => a.id));
    setSelectedAllergens(allIds);
    onAllergenChange([]); // No allergens excluded
  };

  const clearAll = () => {
    setSelectedAllergens(new Set());
    // All allergens excluded
    onAllergenChange(allergens.map((a) => a.id));
  };

  return (
    <div style={{ position: "relative" }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          padding: "8px 14px",
          borderRadius: 6,
          border: "1px solid #E5E7EB",
          backgroundColor: "#FFFFFF",
          color: "#0F172A",
          fontWeight: 600,
          fontSize: 12,
          cursor: "pointer",
          transition: "all 0.2s",
        }}
      >
        Allergens {selectedAllergens.size > 0 ? `(${selectedAllergens.size})` : ""}
      </button>

      {open && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 8px)",
            left: 0,
            backgroundColor: "#FFFFFF",
            border: "1px solid #E5E7EB",
            borderRadius: 8,
            padding: 12,
            minWidth: 200,
            zIndex: 10,
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          }}
        >
          {loading ? (
            <p style={{ margin: 0, fontSize: 12, color: "#6B7280" }}>Loading...</p>
          ) : (
            <>
              <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                <button
                  onClick={selectAll}
                  style={{
                    flex: 1,
                    padding: "6px 8px",
                    fontSize: 11,
                    backgroundColor: "#F3F4F6",
                    border: "none",
                    borderRadius: 4,
                    cursor: "pointer",
                  }}
                >
                  All
                </button>
                <button
                  onClick={clearAll}
                  style={{
                    flex: 1,
                    padding: "6px 8px",
                    fontSize: 11,
                    backgroundColor: "#F3F4F6",
                    border: "none",
                    borderRadius: 4,
                    cursor: "pointer",
                  }}
                >
                  None
                </button>
              </div>

              <div style={{ maxHeight: 200, overflowY: "auto" }}>
                {allergens.map((allergen) => (
                  <label
                    key={allergen.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "8px 4px",
                      cursor: "pointer",
                      fontSize: 12,
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={selectedAllergens.has(allergen.id)}
                      onChange={() => toggleAllergen(allergen.id)}
                      style={{ cursor: "pointer" }}
                    />
                    {allergen.nameEs}
                  </label>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default AlergenFilter;