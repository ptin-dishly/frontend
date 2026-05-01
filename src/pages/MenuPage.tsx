import React, { useState } from "react";
import MenuBar from "../components/MenuBar";
import SearchBar from "../components/SearchBar";
import OrderSidebar from "../components/OrderSidebar";
import sampleImage from "../assets/imagen.png";

type MenuItem = {
  id: string;
  name: string;
  category: string;
  price: number;
};

type OrderItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
};

export default function MenuPage() {
  const [search, setSearch] = useState("");
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);

  const menuItems: MenuItem[] = [
    { id: "1", name: "Lasanya de Rostit", category: "Primers", price: 12.5 },
    { id: "2", name: "Canelons de la padrina", category: "Primers", price: 14 },
    { id: "3", name: "Entrecot a la brasa", category: "Segons", price: 18.5 },
    { id: "4", name: "Bacallà amb samfaina", category: "Segons", price: 16 },
    { id: "5", name: "Crema Catalana", category: "Postres", price: 6 },
    { id: "6", name: "Amanida César", category: "Primers", price: 9.5 },
  ];

  const categories = [
    { label: "Best Seller", icon: "🔥" },
    { label: "Primer Plato", icon: "🍽️" },
    { label: "Segundo Plato", icon: "🥩" },
    { label: "Postres", icon: "🍰" },
    { label: "Filters", icon: "☷" },
  ];

  const filteredItems = menuItems.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  const addItemToOrder = (item: MenuItem) => {
    setOrderItems((current) => {
      const existing = current.find((i) => i.id === item.id);

      if (existing) {
        return current.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }

      return [...current, { ...item, quantity: 1 }];
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
              Ver Pedido
            </button>
          )}
        </div>

        {isCreatingOrder && (
          <div style={{ marginBottom: 30 }}>
            <h1 style={{ marginBottom: 10 }}>New order #00104</h1>
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
              key={cat.label}
              type="button"
              style={{
                backgroundColor: cat.label === "Best Seller" ? "#E5E7EB" : "white",
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
                minWidth: cat.label === "Filters" ? 110 : 150,
                justifyContent: "center",
              }}
            >
              <span>{cat.icon}</span>
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
          {filteredItems.map((item) => (
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
                {item.price.toFixed(2)}€
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
                    Descripció curta del plat deliciós...
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
                <span style={{ fontSize: 18 }}>🥦</span>
                <span style={{ fontSize: 18 }}>🥩</span>
                <span style={{ fontSize: 18 }}>🌾</span>

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
          ))}
        </div>
      </main>

      {isSidebarOpen && (
        <OrderSidebar
          orderId="00104"
          items={orderItems}
          onClose={() => setIsSidebarOpen(false)}
          onQuantityChange={updateQuantity}
          onDelete={deleteItem}
        />
      )}
    </div>
  );
}