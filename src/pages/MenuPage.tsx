import React, { useState, useEffect } from "react";
import { menuService, recipeService, ingredientService, type Menu, type MenuItem } from "../services/api";
import { getCurrentUser } from "../utils/storage";
import MenuBar from "../components/MenuBar";
import SearchBar from "../components/SearchBar";
import OrderSidebar from "../components/OrderSidebar";
import AlergenFilter from "../components/AlergenFilter";
import sampleImage from "../assets/imagen.png";

type OrderItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
};

type EnrichedMenuItem = MenuItem & {
  ingredients?: Array<{
    id: string;
    name: string;
    quantity: number;
    unit: string;
    allergens?: Array<{
      id: string;
      allergenId: string;
      nameEs: string;
    }>;
  }>;
};

export default function MenuPage() {
  const user = getCurrentUser();
  const userRole = (user?.role || "waiter") as "admin" | "kitchen" | "waiter" | "sales";

  const [search, setSearch] = useState("");
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [selectedMenuId, setSelectedMenuId] = useState<string>("carta");
  const [menus, setMenus] = useState<Menu[]>([]);
  const [allMenuItems, setAllMenuItems] = useState<EnrichedMenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter states
  const [selectedCategory, setSelectedCategory] = useState("");
  const [excludedAllergenIds, setExcludedAllergenIds] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100]);
  const [maxPrice, setMaxPrice] = useState(100);

  // Fetch menus on mount
  useEffect(() => {
    const fetchMenus = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await menuService.getAll();
        if (res.success && res.data) {
          setMenus(res.data);
          if (res.data.length > 0) {
            setSelectedMenuId(res.data[0].id);
          }
        }
      } catch (err) {
        console.error("Error fetching menus:", err);
        setError("Failed to load menus");
      } finally {
        setLoading(false);
      }
    };

    fetchMenus();
  }, []);

  // Fetch all menu items and enrich with recipe ingredients and allergens
  useEffect(() => {
    const fetchMenuItems = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await menuService.getItems();
        if (res.success && res.data) {
          console.log("Menu items from API:", res.data);

          // Enrich each menu item with its recipe ingredients and allergens
          const enrichedItems = await Promise.all(
            res.data.map(async (item) => {
              try {
                // Fetch recipe to confirm it exists
                const recipeRes = await recipeService.getById(item.recipeId);
                if (recipeRes.success && recipeRes.data) {
                  // Fetch ingredients for this recipe
                  const ingredientsRes = await recipeService.getIngredients(item.recipeId);
                  if (ingredientsRes.success && ingredientsRes.data) {
                    console.log(`Ingredients for ${item.recipeName}:`, ingredientsRes.data);

                    // Enrich ingredients with allergen data
                    const enrichedIngredients = await Promise.all(
                      ingredientsRes.data.map(async (ingredient) => {
                        try {
                          // Fetch allergens for this ingredient
                          const allergenRes = await ingredientService.getAllergens(
                            ingredient.ingredientId
                          );
                          if (allergenRes.success && allergenRes.data) {
                            console.log(`Allergens for ${ingredient.name}:`, allergenRes.data);
                            return {
                              ...ingredient,
                              allergens: allergenRes.data.map((a) => ({
                                id: a.id,
                                allergenId: a.allergenId,
                                nameEs: a.nameEs || "",
                              })),
                            };
                          }
                        } catch (err) {
                          console.error(
                            `Error fetching allergens for ingredient ${ingredient.ingredientId}:`,
                            err
                          );
                        }
                        return ingredient;
                      })
                    );

                    console.log(
                      `Enriched ingredients for ${item.recipeName}:`,
                      enrichedIngredients
                    );
                    return {
                      ...item,
                      ingredients: enrichedIngredients,
                    };
                  }
                }
              } catch (err) {
                console.error(`Error fetching recipe details for ${item.recipeId}:`, err);
              }
              return item;
            })
          );

          setAllMenuItems(enrichedItems);

          if (enrichedItems.length > 0) {
            const maxPriceValue = Math.max(...enrichedItems.map((item) => item.price || 0));
            setMaxPrice(Math.ceil(maxPriceValue));
            setPriceRange([0, Math.ceil(maxPriceValue)]);
          }
        }
      } catch (err) {
        console.error("Error fetching menu items:", err);
        setError("Failed to load menu items");
      } finally {
        setLoading(false);
      }
    };

    fetchMenuItems();
  }, []);

  // Filter items by selected menu or show all for "Carta" (with deduplication)
  const currentMenuItems = selectedMenuId === "carta"
    ? Array.from(
        new Map(
          allMenuItems.map((item) => [item.recipeId, item])
        ).values()
      )
    : allMenuItems.filter((item) => item.menuCardId === selectedMenuId);

  // Get unique categories
  const categories = [
    { label: "Todos", value: "" },
    ...Array.from(new Set(currentMenuItems.map((item) => item.category))).map(
      (cat) => ({
        label: cat,
        value: cat,
      })
    ),
  ];

  // Check if item contains excluded allergens
  const itemContainsExcludedAllergens = (item: EnrichedMenuItem): boolean => {
    if (excludedAllergenIds.length === 0) {
      return false;
    }

    if (!item.ingredients || item.ingredients.length === 0) {
      return false;
    }

    const hasExcludedAllergen = item.ingredients.some((ingredient) => {
      return ingredient.allergens?.some((allergen) =>
        excludedAllergenIds.includes(allergen.allergenId || allergen.id)
      );
    });

    return !!hasExcludedAllergen;
  };

  // Apply all filters
  const filteredItems = currentMenuItems.filter((item) => {
    const matchesSearch =
      item.recipeName.toLowerCase().includes(search.toLowerCase()) ||
      item.recipeDescription?.toLowerCase().includes(search.toLowerCase());

    const matchesCategory =
      selectedCategory === "" || item.category === selectedCategory;

    const matchesPrice =
      item.price >= priceRange[0] && item.price <= priceRange[1];

    const matchesAllergens = !itemContainsExcludedAllergens(item);

    const isAvailable = item.isAvailable;

    return (
      matchesSearch &&
      matchesCategory &&
      matchesPrice &&
      matchesAllergens &&
      isAvailable
    );
  });

  const addItemToOrder = (item: EnrichedMenuItem) => {
    setOrderItems((current) => {
      const existing = current.find((i) => i.id === item.id);

      if (existing) {
        return current.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }

      return [
        ...current,
        {
          id: item.id,
          name: item.recipeName,
          price: item.price || 0,
          quantity: 1,
        },
      ];
    });
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity === 0) {
      setOrderItems((items) => items.filter((i) => i.id !== id));
      return;
    }

    setOrderItems((items) =>
      items.map((i) => (i.id === id ? { ...i, quantity } : i))
    );
  };

  const deleteItem = (id: string) => {
    setOrderItems((items) => items.filter((i) => i.id !== id));
  };

  if (loading && menus.length === 0) {
    return (
      <div style={{ display: "flex", minHeight: "100vh" }}>
        <MenuBar role={userRole} />
        <main
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <p style={{ fontSize: "16px", color: "#6B7280" }}>Loading menus...</p>
        </main>
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        backgroundColor: "#F9FAFB",
      }}
    >
      <MenuBar role={userRole} />

      <main style={{ flex: 1, padding: "48px 56px", maxWidth: 1400, margin: "0 auto" }}>
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

        {/* Menu Selector */}
        <div style={{ marginBottom: 30 }}>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button
              onClick={() => {
                setSelectedMenuId("carta");
                setSelectedCategory("");
                setSearch("");
              }}
              style={{
                padding: "10px 16px",
                borderRadius: 8,
                border: "1px solid #E5E7EB",
                background:
                  selectedMenuId === "carta"
                    ? "var(--color-purple)"
                    : "#FFFFFF",
                color:
                  selectedMenuId === "carta" ? "#FFFFFF" : "#0F172A",
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
            >
              Carta
            </button>
            {menus.map((menu) => (
              <button
                key={menu.id}
                onClick={() => {
                  setSelectedMenuId(menu.id);
                  setSelectedCategory("");
                  setSearch("");
                }}
                style={{
                  padding: "10px 16px",
                  borderRadius: 8,
                  border: "1px solid #E5E7EB",
                  background:
                    selectedMenuId === menu.id
                      ? "var(--color-purple)"
                      : "#FFFFFF",
                  color:
                    selectedMenuId === menu.id ? "#FFFFFF" : "#0F172A",
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
              >
                {menu.name}
              </button>
            ))}
          </div>
        </div>

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
              value={search}
              onChange={setSearch}
              placeholder="Cerca un plat..."
            />
          </div>

          {!isCreatingOrder ? (
            <button
              onClick={() => setIsCreatingOrder(true)}
              style={{
                backgroundColor: "var(--color-green)",
                color: "white",
                border: "none",
                padding: "16px 32px",
                borderRadius: 20,
                fontWeight: 700,
                fontSize: 16,
                cursor: "pointer",
                boxShadow: "0 4px 10px rgba(0,0,0,0.15)",
              }}
            >
              + Create New Order
            </button>
          ) : (
            <button
              onClick={() => setIsSidebarOpen(true)}
              style={{
                backgroundColor: "var(--color-purple)",
                color: "white",
                border: "none",
                padding: "14px 28px",
                borderRadius: 12,
                fontWeight: 700,
                fontSize: 15,
                cursor: "pointer",
                boxShadow: "0 4px 10px rgba(0,0,0,0.15)",
              }}
            >
              Ver Pedido ({orderItems.length})
            </button>
          )}
        </div>

        {isCreatingOrder && (
          <div style={{ marginBottom: 30 }}>
            <h1 style={{ marginBottom: 10 }}>
              New order #{Math.floor(Math.random() * 100000)}
            </h1>
            <button
              onClick={() => {
                setIsCreatingOrder(false);
                setIsSidebarOpen(false);
                setOrderItems([]);
              }}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                fontWeight: 700,
                color: "var(--color-dark-blue)",
              }}
            >
              ← Tornar al menú
            </button>
          </div>
        )}

        {/* Filters Section */}
        <div
          style={{
            marginBottom: 34,
            padding: "20px",
            backgroundColor: "#FFFFFF",
            borderRadius: "12px",
            border: "1px solid #E5E7EB",
          }}
        >
          <h3
            style={{
              margin: "0 0 16px",
              color: "#0F172A",
              fontWeight: 600,
            }}
          >
            Filters
          </h3>

          <div
            style={{
              display: "flex",
              gap: 20,
              flexWrap: "wrap",
              alignItems: "flex-start",
            }}
          >
            {categories.length > 1 && (
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
                  Category
                </label>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {categories.map((cat) => (
                    <button
                      key={cat.value}
                      onClick={() => setSelectedCategory(cat.value)}
                      style={{
                        padding: "8px 14px",
                        borderRadius: 6,
                        border: "1px solid #E5E7EB",
                        backgroundColor:
                          cat.value === selectedCategory
                            ? "var(--color-purple)"
                            : "#FFFFFF",
                        color:
                          cat.value === selectedCategory
                            ? "#FFFFFF"
                            : "#0F172A",
                        fontWeight: 600,
                        fontSize: 12,
                        cursor: "pointer",
                        transition: "all 0.2s",
                      }}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

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
                Price: €{priceRange[0].toFixed(2)} - €
                {priceRange[1].toFixed(2)}
              </label>
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <input
                  type="range"
                  min={0}
                  max={maxPrice}
                  value={priceRange[0]}
                  onChange={(e) =>
                    setPriceRange([Number(e.target.value), priceRange[1]])
                  }
                  style={{ width: 120 }}
                />
                <span style={{ fontSize: 12, color: "#6B7280" }}>to</span>
                <input
                  type="range"
                  min={0}
                  max={maxPrice}
                  value={priceRange[1]}
                  onChange={(e) =>
                    setPriceRange([priceRange[0], Number(e.target.value)])
                  }
                  style={{ width: 120 }}
                />
              </div>
            </div>

            <AlergenFilter onAllergenChange={setExcludedAllergenIds} />
          </div>

          {(selectedCategory ||
            excludedAllergenIds.length > 0 ||
            priceRange[0] > 0 ||
            priceRange[1] < maxPrice) && (
            <div
              style={{
                marginTop: 16,
                paddingTop: 16,
                borderTop: "1px solid #E5E7EB",
              }}
            >
              <button
                onClick={() => {
                  setSelectedCategory("");
                  setExcludedAllergenIds([]);
                  setPriceRange([0, maxPrice]);
                }}
                style={{
                  padding: "8px 12px",
                  backgroundColor: "#EF4444",
                  color: "#FFFFFF",
                  border: "none",
                  borderRadius: 6,
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Clear All Filters
              </button>
            </div>
          )}
        </div>

        <div style={{ marginBottom: 20, fontSize: 14, color: "#6B7280" }}>
          Showing {filteredItems.length} of {currentMenuItems.length} dishes
        </div>

        {loading ? (
          <div
            style={{
              textAlign: "center",
              padding: "60px 20px",
              color: "#6B7280",
            }}
          >
            <p>Loading menu items...</p>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fill, minmax(330px, 1fr))",
              gap: 28,
            }}
          >
            {filteredItems.length === 0 ? (
              <p
                style={{
                  gridColumn: "1 / -1",
                  textAlign: "center",
                  color: "#6B7280",
                }}
              >
                No menu items found matching your filters
              </p>
            ) : (
              filteredItems.map((item) => (
                <div
                  key={item.id}
                  style={{
                    backgroundColor: "white",
                    borderRadius: 20,
                    padding: 22,
                    minHeight: 155,
                    position: "relative",
                    border: "1px solid #F2F4F7",
                    boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      top: 20,
                      right: 22,
                      fontSize: 20,
                      fontWeight: 700,
                      color: "var(--color-dark-blue)",
                    }}
                  >
                    €{(item.price || 0).toFixed(2)}
                  </div>

                  <div>
                    <h3
                      style={{
                        margin: "0 0 8px",
                        fontSize: 18,
                        color: "var(--color-dark-blue)",
                        fontWeight: 600,
                        paddingRight: 60,
                      }}
                    >
                      {item.recipeName}
                    </h3>
                    <p
                      style={{
                        margin: 0,
                        color: "#667085",
                        fontSize: 12,
                        lineHeight: 1.4,
                        paddingRight: 60,
                      }}
                    >
                      {item.recipeDescription}
                    </p>
                    <p
                      style={{
                        margin: "8px 0 0",
                        color: "#9CA3AF",
                        fontSize: 11,
                      }}
                    >
                      ⏱️ {item.preparationTime} min
                    </p>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      marginTop: 16,
                    }}
                  >
                    <span
                      style={{
                        marginLeft: "auto",
                        fontSize: 12,
                        color: "#7F56D9",
                        fontWeight: 700,
                        backgroundColor: "#F9F5FF",
                        padding: "6px 14px",
                        borderRadius: 8,
                      }}
                    >
                      {item.category}
                    </span>
                  </div>

                  {isCreatingOrder && item.isAvailable && (
                    <button
                      onClick={() => addItemToOrder(item)}
                      onMouseDown={(e) => {
                        e.currentTarget.style.transform = "scale(0.95)";
                      }}
                      onMouseUp={(e) => {
                        e.currentTarget.style.transform = "scale(1)";
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = "#16A34A";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor =
                          "var(--color-green)";
                        e.currentTarget.style.transform = "scale(1)";
                      }}
                      style={{
                        alignSelf: "flex-end",
                        marginTop: 16,
                        backgroundColor: "var(--color-green)",
                        color: "white",
                        border: "none",
                        padding: "10px 18px",
                        borderRadius: 999,
                        fontWeight: 700,
                        cursor: "pointer",
                        transition: "all 0.15s ease",
                      }}
                    >
                      Add menu
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </main>

      {isSidebarOpen && (
        <OrderSidebar
          orderId={`${Math.floor(Math.random() * 100000)}`}
          items={orderItems}
          onClose={() => setIsSidebarOpen(false)}
          onQuantityChange={updateQuantity}
          onDelete={deleteItem}
        />
      )}
    </div>
  );
}