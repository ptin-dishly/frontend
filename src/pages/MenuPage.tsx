import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser } from "../utils/storage";
import { menuService, recipeService, allergenService, type Menu, type MenuItem, type Allergen } from "../services/api";
import MenuBar from "../components/MenuBar";
import SearchBar from "../components/SearchBar";
import sampleImage from "../assets/imagen.png";

export default function MenusPage() {
  const user = getCurrentUser();
  const userRole = (user?.role || "admin") as "admin" | "kitchen" | "waiter" | "sales";
  const navigate = useNavigate();

  if (!["admin"].includes(userRole)) {
    navigate("/dashboard");
    return null;
  }

  // Main view states
  const [view, setView] = useState<"list" | "detail">("list");
  const [selectedMenu, setSelectedMenu] = useState<Menu | null>(null);

  // List view states
  const [menus, setMenus] = useState<Menu[]>([]);
  const [menuSearch, setMenuSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newMenuName, setNewMenuName] = useState("");
  const [creatingLoading, setCreatingLoading] = useState(false);
  const [menuFilterAllergen, setMenuFilterAllergen] = useState<string | null>(null);
  const [allergens, setAllergens] = useState<Allergen[]>([]);
  const [menusWithAllergen, setMenusWithAllergen] = useState<string[]>([]);

  // Detail view states
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [recipesWithAllergen, setRecipesWithAllergen] = useState<string[]>([]);
  const [detailAllergenFilter, setDetailAllergenFilter] = useState<string | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [isEditingMenu, setIsEditingMenu] = useState(false);
  const [editedMenuName, setEditedMenuName] = useState("");
  const [editingMenuPublic, setEditingMenuPublic] = useState(false);
  const [savingMenu, setSavingMenu] = useState(false);

  // Fetch allergens on mount
  useEffect(() => {
    const fetchAllergens = async () => {
      try {
        const res = await allergenService.getAll();
        if (res.success && res.data) {
          setAllergens(res.data);
        }
      } catch (err) {
        console.error("Error fetching allergens:", err);
      }
    };

    fetchAllergens();
  }, []);

  // Fetch menus for list view
  useEffect(() => {
    if (view === "list") {
      fetchMenus();
    }
  }, [view]);

  const fetchMenus = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await menuService.getAll();
      if (res.success && res.data) {
        setMenus(res.data);
      }
    } catch (err) {
      console.error("Error fetching menus:", err);
      setError("Failed to load menus");
    } finally {
      setLoading(false);
    }
  };

  // Fetch menus with allergen
  useEffect(() => {
    const fetchMenusWithAllergen = async () => {
      if (!menuFilterAllergen) {
        setMenusWithAllergen([]);
        return;
      }

      try {
        const res = await menuService.getByAllergen(menuFilterAllergen);
        if (res.success && res.data) {
          const menuIds = res.data.map((menu) => menu.id);
          setMenusWithAllergen(menuIds);
        }
      } catch (err) {
        console.error("Error fetching menus with allergen:", err);
      }
    };

    fetchMenusWithAllergen();
  }, [menuFilterAllergen]);

  // Fetch menu items for detail view
  const fetchMenuItems = async (menuId: string) => {
    setDetailLoading(true);
    try {
      const res = await menuService.getItems();
      if (res.success && res.data) {
        const filtered = res.data.filter((item) => item.menuCardId === menuId);
        setMenuItems(filtered);
      }
    } catch (err) {
      console.error("Error fetching menu items:", err);
    } finally {
      setDetailLoading(false);
    }
  };

  // Fetch recipes with allergen
  useEffect(() => {
    const fetchRecipesWithAllergen = async () => {
      if (!detailAllergenFilter) {
        setRecipesWithAllergen([]);
        return;
      }

      try {
        const res = await recipeService.getByAllergen(detailAllergenFilter);
        if (res.success && res.data) {
          const recipeIds = res.data.map((recipe) => recipe.id);
          setRecipesWithAllergen(recipeIds);
        }
      } catch (err) {
        console.error("Error fetching recipes with allergen:", err);
      }
    };

    fetchRecipesWithAllergen();
  }, [detailAllergenFilter]);

  // Handle create menu
  const handleCreateMenu = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMenuName.trim()) return;

    setCreatingLoading(true);
    try {
      const res = await menuService.create({
        name: newMenuName,
        isPublic: false,
        establishmentId: "",
        qrCodeUrl: null,
      });

      if (res.success && res.data) {
        setMenus([...menus, res.data]);
        setNewMenuName("");
        setIsCreating(false);
      } else {
        setError("Failed to create menu");
      }
    } catch (err) {
      console.error("Error creating menu:", err);
      setError("Error creating menu");
    } finally {
      setCreatingLoading(false);
    }
  };

  // Handle delete menu
  const handleDeleteMenu = async (id: string) => {
    if (!confirm("Are you sure you want to delete this menu?")) return;

    try {
      const res = await menuService.delete(id);
      if (res.success) {
        setMenus(menus.filter((m) => m.id !== id));
      } else {
        setError("Failed to delete menu");
      }
    } catch (err) {
      console.error("Error deleting menu:", err);
      setError("Error deleting menu");
    }
  };

  // Handle save menu
  const handleSaveMenu = async () => {
    if (!selectedMenu) return;

    setSavingMenu(true);
    try {
      const res = await menuService.update(selectedMenu.id, {
        name: editedMenuName,
        isPublic: editingMenuPublic,
      });

      if (res.success && res.data) {
        setSelectedMenu(res.data);
        setMenus(menus.map((m) => (m.id === selectedMenu.id ? res.data! : m)));
        setIsEditingMenu(false);
      } else {
        setError("Failed to save menu");
      }
    } catch (err) {
      console.error("Error saving menu:", err);
      setError("Error saving menu");
    } finally {
      setSavingMenu(false);
    }
  };

  // Open menu detail
  const openMenuDetail = (menu: Menu) => {
    setSelectedMenu(menu);
    setEditedMenuName(menu.name);
    setEditingMenuPublic(menu.isPublic);
    setDetailAllergenFilter(null);
    setRecipesWithAllergen([]);
    fetchMenuItems(menu.id);
    setView("detail");
  };

  // Filter menus - ONLY show menus that DO NOT contain the selected allergen
  const filteredMenus = menus.filter((menu) => {
    const matchesSearch = menu.name.toLowerCase().includes(menuSearch.toLowerCase());
    const matchesAllergen =
      !menuFilterAllergen || !menusWithAllergen.includes(menu.id);
    return matchesSearch && matchesAllergen;
  });

  // Filter menu items - ONLY show items that DO NOT contain the selected allergen
  const filteredMenuItems = menuItems.filter((item) => {
    const matchesAllergen =
      !detailAllergenFilter || !recipesWithAllergen.includes(item.recipeId);
    return matchesAllergen;
  });

  if (view === "list") {
    return (
      <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#F9FAFB" }}>
        <MenuBar role={userRole} />

        <main style={{ flex: 1, padding: "40px 48px" }}>
          <div style={{ marginBottom: 30 }}>
            <h1 style={{ fontSize: 28, color: "#0F172A", margin: 0, fontWeight: 700 }}>
              Menus
            </h1>
          </div>

          {error && (
            <div
              style={{
                backgroundColor: "#FEE2E2",
                color: "#DC2626",
                padding: "12px 16px",
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
              marginBottom: 32,
              gap: 16,
              flexWrap: "wrap",
            }}
          >
            <div style={{ maxWidth: 300, width: "100%" }}>
              <SearchBar
                value={menuSearch}
                onChange={setMenuSearch}
                placeholder="Search menus..."
              />
            </div>

            <div>
              <label
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#6B7280",
                  display: "block",
                  marginBottom: 8,
                }}
              >
                Filter by Allergen
              </label>
              <select
                value={menuFilterAllergen || ""}
                onChange={(e) => setMenuFilterAllergen(e.target.value || null)}
                style={{
                  padding: "8px 12px",
                  borderRadius: 6,
                  border: "1px solid #E5E7EB",
                  fontSize: 12,
                  cursor: "pointer",
                }}
              >
                <option value="">None</option>
                {allergens.map((allergen) => (
                  <option key={allergen.id} value={allergen.id}>
                    {allergen.nameEs}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => setIsCreating(!isCreating)}
              style={{
                backgroundColor: "var(--color-green)",
                color: "white",
                border: "none",
                padding: "10px 20px",
                borderRadius: 8,
                fontWeight: 600,
                fontSize: 14,
                cursor: "pointer",
              }}
            >
              {isCreating ? "Cancel" : "+ New Menu"}
            </button>
          </div>

          {isCreating && (
            <form
              onSubmit={handleCreateMenu}
              style={{
                backgroundColor: "white",
                padding: 20,
                borderRadius: 8,
                marginBottom: 24,
                border: "1px solid #E5E7EB",
                display: "flex",
                gap: 12,
              }}
            >
              <input
                type="text"
                value={newMenuName}
                onChange={(e) => setNewMenuName(e.target.value)}
                placeholder="Menu name"
                style={{
                  flex: 1,
                  padding: "10px 12px",
                  borderRadius: 6,
                  border: "1px solid #E5E7EB",
                  fontSize: 14,
                  fontFamily: "inherit",
                }}
              />
              <button
                type="submit"
                disabled={creatingLoading}
                style={{
                  padding: "10px 20px",
                  backgroundColor: "#22C55E",
                  color: "white",
                  border: "none",
                  borderRadius: 6,
                  fontWeight: 600,
                  cursor: creatingLoading ? "not-allowed" : "pointer",
                }}
              >
                {creatingLoading ? "Creating..." : "Create"}
              </button>
            </form>
          )}

          <div style={{ marginBottom: 20, fontSize: 14, color: "#6B7280" }}>
            Showing {filteredMenus.length} of {menus.length} menus
            {menuFilterAllergen && allergens.find(a => a.id === menuFilterAllergen) &&
              ` (excluding ${allergens.find(a => a.id === menuFilterAllergen)?.nameEs})`
            }
          </div>

          {loading ? (
            <div style={{ textAlign: "center", padding: "40px 20px", color: "#6B7280" }}>
              <p>Loading menus...</p>
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                gap: 24,
              }}
            >
              {filteredMenus.length === 0 ? (
                <p style={{ gridColumn: "1 / -1", textAlign: "center", color: "#6B7280" }}>
                  No menus found
                </p>
              ) : (
                filteredMenus.map((menu) => (
                  <div
                    key={menu.id}
                    onClick={() => openMenuDetail(menu)}
                    style={{
                      backgroundColor: "white",
                      borderRadius: 12,
                      padding: 20,
                      border: "1px solid #E5E7EB",
                      cursor: "pointer",
                      transition: "all 0.2s",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)";
                      e.currentTarget.style.transform = "translateY(-2px)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.1)";
                      e.currentTarget.style.transform = "translateY(0)";
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: 12,
                      }}
                    >
                      <h3 style={{ margin: 0, fontSize: 18, color: "#0F172A", fontWeight: 600 }}>
                        {menu.name}
                      </h3>
                      <span
                        style={{
                          backgroundColor: menu.isPublic ? "#D1FAE5" : "#FEE2E2",
                          color: menu.isPublic ? "#065F46" : "#991B1B",
                          padding: "4px 12px",
                          borderRadius: 20,
                          fontSize: 12,
                          fontWeight: 600,
                        }}
                      >
                        {menu.isPublic ? "Public" : "Private"}
                      </span>
                    </div>

                    <p style={{ margin: "8px 0", color: "#6B7280", fontSize: 14 }}>
                      Created {new Date(menu.createdAt).toLocaleDateString()}
                    </p>

                    <div
                      style={{
                        display: "flex",
                        gap: 8,
                        marginTop: 16,
                      }}
                    >
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteMenu(menu.id);
                        }}
                        style={{
                          flex: 1,
                          padding: "8px 12px",
                          backgroundColor: "#EF4444",
                          color: "white",
                          border: "none",
                          borderRadius: 6,
                          cursor: "pointer",
                          fontSize: 12,
                          fontWeight: 600,
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </main>
      </div>
    );
  }

  // Detail View
  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#F9FAFB" }}>
      <MenuBar role={userRole} />

      <main style={{ flex: 1, padding: "40px 48px" }}>
        <button
          onClick={() => setView("list")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            backgroundColor: "transparent",
            border: "none",
            cursor: "pointer",
            fontWeight: 600,
            color: "#0F172A",
            marginBottom: 20,
          }}
        >
          <span style={{ fontSize: 20 }}>←</span>
          Back to Menus
        </button>

        <div style={{ marginBottom: 32 }}>
          {isEditingMenu ? (
            <>
              <input
                type="text"
                value={editedMenuName}
                onChange={(e) => setEditedMenuName(e.target.value)}
                style={{
                  fontSize: 28,
                  fontWeight: 700,
                  color: "#0F172A",
                  margin: "0 0 16px",
                  padding: "8px 12px",
                  borderRadius: 8,
                  border: "1px solid #E5E7EB",
                  width: "100%",
                  maxWidth: 400,
                  fontFamily: "inherit",
                }}
              />
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  fontSize: 14,
                  marginBottom: 12,
                }}
              >
                <input
                  type="checkbox"
                  checked={editingMenuPublic}
                  onChange={(e) => setEditingMenuPublic(e.target.checked)}
                />
                Public
              </label>
            </>
          ) : (
            <>
              <h1 style={{ fontSize: 28, color: "#0F172A", margin: "0 0 8px", fontWeight: 700 }}>
                {selectedMenu?.name}
              </h1>
              <p style={{ margin: "0 0 16px", color: "#6B7280", fontSize: 14 }}>
                {selectedMenu?.isPublic ? "🌍 Public" : "🔒 Private"}
              </p>
            </>
          )}

          <div style={{ display: "flex", gap: 12 }}>
            {!isEditingMenu ? (
              <button
                onClick={() => setIsEditingMenu(true)}
                style={{
                  padding: "10px 20px",
                  backgroundColor: "#7C3AED",
                  color: "white",
                  border: "none",
                  borderRadius: 8,
                  fontWeight: 600,
                  cursor: "pointer",
                  fontSize: 14,
                }}
              >
                Edit Menu
              </button>
            ) : (
              <>
                <button
                  onClick={handleSaveMenu}
                  disabled={savingMenu}
                  style={{
                    padding: "10px 20px",
                    backgroundColor: "#22C55E",
                    color: "white",
                    border: "none",
                    borderRadius: 8,
                    fontWeight: 600,
                    cursor: savingMenu ? "not-allowed" : "pointer",
                    fontSize: 14,
                  }}
                >
                  {savingMenu ? "Saving..." : "Save"}
                </button>
                <button
                  onClick={() => setIsEditingMenu(false)}
                  style={{
                    padding: "10px 20px",
                    backgroundColor: "#E5E7EB",
                    border: "none",
                    borderRadius: 8,
                    fontWeight: 600,
                    cursor: "pointer",
                    fontSize: 14,
                  }}
                >
                  Cancel
                </button>
              </>
            )}
          </div>
        </div>

        {/* Menu Items Section */}
        <div style={{ marginBottom: 32 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 16,
              gap: 12,
              flexWrap: "wrap",
            }}
          >
            <h2 style={{ fontSize: 20, color: "#0F172A", margin: 0, fontWeight: 600 }}>
              Menu Items
            </h2>

            <div>
              <label
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#6B7280",
                  display: "block",
                  marginBottom: 8,
                }}
              >
                Filter by Allergen
              </label>
              <select
                value={detailAllergenFilter || ""}
                onChange={(e) => setDetailAllergenFilter(e.target.value || null)}
                style={{
                  padding: "8px 12px",
                  borderRadius: 6,
                  border: "1px solid #E5E7EB",
                  fontSize: 12,
                  cursor: "pointer",
                }}
              >
                <option value="">None</option>
                {allergens.map((allergen) => (
                  <option key={allergen.id} value={allergen.id}>
                    {allergen.nameEs}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ marginBottom: 16, fontSize: 14, color: "#6B7280" }}>
            Showing {filteredMenuItems.length} of {menuItems.length} items
            {detailAllergenFilter && allergens.find(a => a.id === detailAllergenFilter) &&
              ` (excluding ${allergens.find(a => a.id === detailAllergenFilter)?.nameEs})`
            }
          </div>

          {detailLoading ? (
            <div style={{ textAlign: "center", padding: "40px 20px", color: "#6B7280" }}>
              <p>Loading items...</p>
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                gap: 20,
              }}
            >
              {filteredMenuItems.length === 0 ? (
                <p style={{ gridColumn: "1 / -1", textAlign: "center", color: "#6B7280" }}>
                  No items found
                </p>
              ) : (
                filteredMenuItems.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      backgroundColor: "white",
                      borderRadius: 12,
                      overflow: "hidden",
                      border: "1px solid #E5E7EB",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                      transition: "all 0.2s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.1)";
                    }}
                  >
                    {/* Image */}
                    <div
                      style={{
                        width: "100%",
                        height: 140,
                        backgroundColor: "#F3F4F6",
                        overflow: "hidden",
                        position: "relative",
                      }}
                    >
                      <img
                        src={sampleImage}
                        alt={item.recipeName}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                      <div
                        style={{
                          position: "absolute",
                          top: 8,
                          right: 8,
                          backgroundColor: "rgba(0,0,0,0.6)",
                          color: "white",
                          padding: "4px 8px",
                          borderRadius: 6,
                          fontSize: 12,
                          fontWeight: 600,
                        }}
                      >
                        €{item.price.toFixed(2)}
                      </div>
                    </div>

                    {/* Content */}
                    <div style={{ padding: 16 }}>
                      <h3 style={{ margin: "0 0 8px", fontSize: 16, color: "#0F172A", fontWeight: 600 }}>
                        {item.recipeName}
                      </h3>

                      <p
                        style={{
                          margin: "0 0 12px",
                          color: "#667085",
                          fontSize: 12,
                          lineHeight: 1.4,
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                      >
                        {item.recipeDescription}
                      </p>

                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          fontSize: 11,
                          color: "#9CA3AF",
                          marginBottom: 12,
                        }}
                      >
                        <span>⏱️ {item.preparationTime} min</span>
                        <span
                          style={{
                            backgroundColor: "#F9F5FF",
                            color: "#7F56D9",
                            padding: "4px 10px",
                            borderRadius: 6,
                            fontWeight: 600,
                          }}
                        >
                          {item.category}
                        </span>
                      </div>

                      <span
                        style={{
                          display: "inline-block",
                          backgroundColor: item.isAvailable ? "#D1FAE5" : "#FEE2E2",
                          color: item.isAvailable ? "#065F46" : "#991B1B",
                          padding: "4px 12px",
                          borderRadius: 20,
                          fontSize: 12,
                          fontWeight: 500,
                        }}
                      >
                        {item.isAvailable ? "Available" : "Unavailable"}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}