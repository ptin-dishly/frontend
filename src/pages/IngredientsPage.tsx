import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser } from "../utils/storage";
import { ingredientService, type Ingredient } from "../services/api";
import MenuBar from "../components/MenuBar";
import SearchBar from "../components/SearchBar";
import SelectDropdown from "../components/SelectDropdown";
import BigButton from "../components/BigButton";
import NewIngredientCard from "../components/NewIngredientCard";
import IngredientCard from "../components/IngredientCard";
import sampleImage from "../assets/imagen.png";

export default function IngredientsPage() {
  const user = getCurrentUser();
  const userRole = (user?.role || "admin") as "admin" | "kitchen" | "waiter" | "sales";
  const navigate = useNavigate();

  // Only allow admin and kitchen to view ingredients
  if (!["admin", "kitchen"].includes(userRole)) {
    navigate("/dashboard");
    return null;
  }

  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [globalSearch, setGlobalSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchIngredients = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await ingredientService.getAll();
        if (res.success && res.data) {
          setIngredients(res.data);
        }
      } catch (err) {
        console.error("Error fetching ingredients:", err);
        setError("Failed to load ingredients");
      } finally {
        setLoading(false);
      }
    };

    fetchIngredients();
  }, []);

  const categories = Array.from(new Set(ingredients.map((i) => i.name))).map((name) => ({
    label: name,
    value: name,
  }));

  const filteredIngredients = ingredients.filter((ingredient) => {
    const matchesSearch = ingredient.name
      .toLowerCase()
      .includes(globalSearch.toLowerCase());
    const matchesCategory = !categoryFilter || ingredient.name === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#F9FAFB" }}>
      <MenuBar role={userRole} />

      <main style={{ flex: 1, padding: "48px 56px", maxWidth: 1400, margin: "0 auto" }}>
        <div style={{ marginBottom: 30 }}>
          <h1 style={{ fontSize: 32, color: "#0F172A", margin: 0 }}>Ingredients</h1>
        </div>

        {error && (
          <div
            style={{
              backgroundColor: "#FEE2E2",
              color: "#DC2626",
              padding: "16px",
              borderRadius: "8px",
              marginBottom: "24px",
              fontSize: "14px",
            }}
          >
            ⚠️ {error}
          </div>
        )}

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 44,
            gap: 24,
            flexWrap: "wrap",
          }}
        >
          <div style={{ maxWidth: 420, width: "100%" }}>
            <SearchBar
              value={globalSearch}
              onChange={setGlobalSearch}
              placeholder="Search ingredients..."
            />
          </div>

          <SelectDropdown
            options={[
              { label: "All Ingredients", value: "" },
              ...categories,
            ]}
            value={categoryFilter}
            onChange={setCategoryFilter}
            placeholder="Filter by ingredient"
          />

          <BigButton
            label="New Ingredient"
            value="+"
            onClick={() => navigate("/ingredients/new")}
          />
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "60px 20px", color: "#6B7280" }}>
            <p>Loading ingredients...</p>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
              gap: 24,
            }}
          >
            <NewIngredientCard onClick={() => navigate("/ingredients/new")} />

            {filteredIngredients.length === 0 ? (
              <p style={{ gridColumn: "1 / -1", textAlign: "center", color: "#6B7280" }}>
                No ingredients found
              </p>
            ) : (
              filteredIngredients.map((ingredient) => (
                <IngredientCard
                  key={ingredient.id}
                  category={ingredient.name}
                  name={ingredient.name}
                  image={sampleImage}
                  quantity={ingredient.description || "N/A"}
                  expiration={ingredient.isActive ? "Active" : "Inactive"}
                  onClick={() => {
                    console.log("Clicked ingredient:", ingredient.id);
                  }}
                />
              ))
            )}
          </div>
        )}
      </main>
    </div>
  );
}