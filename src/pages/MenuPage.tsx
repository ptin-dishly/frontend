import React, { useState, useEffect } from "react";
import { menuService, type Menu } from "../services/api";
import MenuBar from "../components/MenuBar";
import SearchBar from "../components/SearchBar";
import OrderSidebar from "../components/OrderSidebar";
import sampleImage from "../assets/imagen.png";

type MenuItem = {
  id: string;
  menuId: string;
  name: string;
  category: string;
  price: number;
  description: string;
};

type OrderItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
};

// Fake menu items data - organized by menuId
const FAKE_MENU_ITEMS: Record<string, MenuItem[]> = {
  // Menú Carta Principal Temporada
  "99999999-0009-0009-0009-000000000001": [
    {
      id: "item-1",
      menuId: "99999999-0009-0009-0009-000000000001",
      name: "Lasaña de carne",
      category: "Primers",
      price: 12.50,
      description: "Lasaña tradicional italiana con carne picada",
    },
    {
      id: "item-9",
      menuId: "99999999-0009-0009-0009-000000000001",
      name: "Ensalada César",
      category: "Primers",
      price: 8.50,
      description: "Ensalada fresca con pollo y parmesano",
    },
    {
      id: "item-3",
      menuId: "99999999-0009-0009-0009-000000000001",
      name: "Salmón a la plancha",
      category: "Segons",
      price: 14.90,
      description: "Salmón fresco con limón y perejil",
    },
    {
      id: "item-4",
      menuId: "99999999-0009-0009-0009-000000000001",
      name: "Pollo al ajillo",
      category: "Segons",
      price: 12.00,
      description: "Pollo tierno con ajo y vino blanco",
    },
    {
      id: "item-5",
      menuId: "99999999-0009-0009-0009-000000000001",
      name: "Crema Catalana",
      category: "Postres",
      price: 6.80,
      description: "Postre tradicional catalán",
    },
  ],
  // Menú del Día
  "99999999-0009-0009-0009-000000000002": [
    {
      id: "item-6",
      menuId: "99999999-0009-0009-0009-000000000002",
      name: "Croquetas de jamón",
      category: "Primers",
      price: 8.90,
      description: "Croquetas crujientes de jamón serrano",
    },
    {
      id: "item-7",
      menuId: "99999999-0009-0009-0009-000000000002",
      name: "Gazpacho",
      category: "Primers",
      price: 5.50,
      description: "Sopa fría de tomate andaluza",
    },
    {
      id: "item-8",
      menuId: "99999999-0009-0009-0009-000000000002",
      name: "Pulpo a la gallega",
      category: "Segons",
      price: 18.50,
      description: "Pulpo cocido con patatas y pimentón",
    },
    {
      id: "item-9",
      menuId: "99999999-0009-0009-0009-000000000002",
      name: "Entrecot a la brasa",
      category: "Segons",
      price: 22.00,
      description: "Entrecot de calidad con salsa de pimienta",
    },
    {
      id: "item-10",
      menuId: "99999999-0009-0009-0009-000000000002",
      name: "Tarta de chocolate",
      category: "Postres",
      price: 8.50,
      description: "Tarta de chocolate belga con ganache",
    },
  ],
  // Menú Carta El Racó
  "99999999-0009-0009-0009-000000000003": [
    {
      id: "item-11",
      menuId: "99999999-0009-0009-0009-000000000003",
      name: "Jamón ibérico",
      category: "Primers",
      price: 15.00,
      description: "Jamón ibérico de bellota cortado a mano",
    },
    {
      id: "item-19",
      menuId: "99999999-0009-0009-0009-000000000003",
      name: "Tabla de quesos",
      category: "Primers",
      price: 12.00,
      description: "Selección de quesos artesanales",
    },
    {
      id: "item-13",
      menuId: "99999999-0009-0009-0009-000000000003",
      name: "Paella Valenciana",
      category: "Segons",
      price: 16.00,
      description: "Paella tradicional con pollo y verduras",
    },
    {
      id: "item-14",
      menuId: "99999999-0009-0009-0009-000000000003",
      name: "Bogavante a la sal",
      category: "Segons",
      price: 28.00,
      description: "Bogavante fresco cocido en sal marina",
    },
    {
      id: "item-15",
      menuId: "99999999-0009-0009-0009-000000000003",
      name: "Panna cotta",
      category: "Postres",
      price: 9.00,
      description: "Panna cotta italiana con frutos rojos",
    },
  ],
  // Carta (all items available)
  carta: [
    {
      id: "item-1",
      menuId: "carta",
      name: "Lasaña de carne",
      category: "Primers",
      price: 12.50,
      description: "Lasaña tradicional italiana con carne picada",
    },
    {
      id: "item-9",
      menuId: "carta",
      name: "Ensalada César",
      category: "Primers",
      price: 8.50,
      description: "Ensalada fresca con pollo y parmesano",
    },
    {
      id: "item-6",
      menuId: "carta",
      name: "Croquetas de jamón",
      category: "Primers",
      price: 8.90,
      description: "Croquetas crujientes de jamón serrano",
    },
    {
      id: "item-7",
      menuId: "carta",
      name: "Gazpacho",
      category: "Primers",
      price: 5.50,
      description: "Sopa fría de tomate andaluza",
    },
    {
      id: "item-11",
      menuId: "carta",
      name: "Jamón ibérico",
      category: "Primers",
      price: 15.00,
      description: "Jamón ibérico de bellota cortado a mano",
    },
    {
      id: "item-19",
      menuId: "carta",
      name: "Tabla de quesos",
      category: "Primers",
      price: 12.00,
      description: "Selección de quesos artesanales",
    },
    {
      id: "item-3",
      menuId: "carta",
      name: "Salmón a la plancha",
      category: "Segons",
      price: 14.90,
      description: "Salmón fresco con limón y perejil",
    },
    {
      id: "item-4",
      menuId: "carta",
      name: "Pollo al ajillo",
      category: "Segons",
      price: 19.00,
      description: "Pollo tierno con ajo y vino blanco",
    },
    {
      id: "item-8",
      menuId: "carta",
      name: "Pulpo a la gallega",
      category: "Segons",
      price: 18.50,
      description: "Pulpo cocido con patatas y pimentón",
    },
    {
      id: "item-9",
      menuId: "carta",
      name: "Entrecot a la brasa",
      category: "Segons",
      price: 22.00,
      description: "Entrecot de calidad con salsa de pimienta",
    },
    {
      id: "item-13",
      menuId: "carta",
      name: "Paella Valenciana",
      category: "Segons",
      price: 16.00,
      description: "Paella tradicional con pollo y verduras",
    },
    {
      id: "item-14",
      menuId: "carta",
      name: "Bogavante a la sal",
      category: "Segons",
      price: 28.00,
      description: "Bogavante fresco cocido en sal marina",
    },
    {
      id: "item-5",
      menuId: "carta",
      name: "Crema Catalana",
      category: "Postres",
      price: 6.80,
      description: "Postre tradicional catalán",
    },
    {
      id: "item-10",
      menuId: "carta",
      name: "Tarta de chocolate",
      category: "Postres",
      price: 8.50,
      description: "Tarta de chocolate belga con ganache",
    },
    {
      id: "item-15",
      menuId: "carta",
      name: "Panna cotta",
      category: "Postres",
      price: 9.00,
      description: "Panna cotta italiana con frutos rojos",
    },
  ],
};

export default function MenuPage() {
  const [search, setSearch] = useState("");
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [selectedMenuId, setSelectedMenuId] = useState<string>("carta");
  const [menus, setMenus] = useState<Menu[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch menus on mount
  useEffect(() => {
    const fetchMenus = async () => {
      setLoading(false);
      try {
        const res = await menuService.getAll();
        if (res.success && res.data) {
          setMenus(res.data);
        }
      } catch (err) {
        console.error("Error fetching menus:", err);
      }
    };

    fetchMenus();
  }, []);

  // Get items for selected menu
  const currentMenuItems = FAKE_MENU_ITEMS[selectedMenuId] || [];

  // Get unique categories from current menu items
  const categories = [
    { label: "Todos", value: "" },
    { label: "Primers", value: "Primers" },
    { label: "Segons", value: "Segons" },
    { label: "Postres", value: "Postres" },
  ];

  const [selectedCategory, setSelectedCategory] = useState("");

  const filteredItems = currentMenuItems.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.description?.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === "" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const addItemToOrder = (item: MenuItem) => {
    setOrderItems((current) => {
      const existing = current.find((i) => i.id === item.id);

      if (existing) {
        return current.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }

      return [...current, { id: item.id, name: item.name, price: item.price, quantity: 1 }];
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

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        backgroundColor: "#F9FAFB",
      }}
    >
      <MenuBar role="admin" />

      <main
        style={{
          flex: 1,
          padding: "48px 56px",
          maxWidth: 1400,
          margin: "0 auto",
        }}
      >
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
                background: selectedMenuId === "carta" ? "var(--color-purple)" : "#FFFFFF",
                color: selectedMenuId === "carta" ? "#FFFFFF" : "#0F172A",
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
                  background: selectedMenuId === menu.id ? "var(--color-purple)" : "#FFFFFF",
                  color: selectedMenuId === menu.id ? "#FFFFFF" : "#0F172A",
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
            <h1 style={{ marginBottom: 10 }}>New order #{Math.floor(Math.random() * 100000)}</h1>
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

        <div
          style={{
            display: "flex",
            gap: 16,
            marginBottom: 34,
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setSelectedCategory(cat.value)}
              type="button"
              style={{
                backgroundColor: cat.value === selectedCategory ? "#E5E7EB" : "white",
                padding: "12px 22px",
                borderRadius: 10,
                border: "1px solid #E4E7EC",
                boxShadow: "0 3px 6px rgba(0,0,0,0.08)",
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 7,
                minWidth: 150,
                justifyContent: "center",
                transition: "all 0.2s ease",
              }}
            >
              <span>{cat.label}</span>
            </button>
          ))}
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(330px, 1fr))",
            gap: 28,
            justifyContent: "center",
          }}
        >
          {filteredItems.length === 0 ? (
            <p style={{ gridColumn: "1 / -1", textAlign: "center", color: "#6B7280" }}>
              No menu items found
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
                  €{item.price.toFixed(2)}
                </div>

                <div
                  style={{
                    display: "flex",
                    gap: 18,
                    alignItems: "flex-start",
                    paddingRight: 90,
                  }}
                >
                  <img
                    src={sampleImage}
                    alt={item.name}
                    style={{
                      width: 88,
                      height: 88,
                      borderRadius: 14,
                      objectFit: "cover",
                    }}
                  />

                  <div>
                    <h3
                      style={{
                        margin: "8px 0 6px",
                        fontSize: 18,
                        color: "var(--color-dark-blue)",
                      }}
                    >
                      {item.name}
                    </h3>
                    <p
                      style={{
                        margin: 0,
                        color: "#667085",
                        fontSize: 12,
                        lineHeight: 1.4,
                      }}
                    >
                      {item.description}
                    </p>
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    marginTop: 18,
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

                {isCreatingOrder && (
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
                      e.currentTarget.style.backgroundColor = "var(--color-green)";
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