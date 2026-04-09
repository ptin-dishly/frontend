import React from "react";
import { useNavigate } from "react-router-dom";

interface MenuBarProps {
  role: "admin" | "kitchen" | "waiter" ; // Afegiu els que calguin
}

export default function MenuBar({ role }: MenuBarProps) {
  const navigate = useNavigate();

  // Menú segons el rol de l’usuari
  const menuItemsByRole: Record<string, { label: string; route: string }[]> = {
    admin: [
      { label: "Dashboard", route: "/dashboard" },
      { label: "Orders & Tickets", route: "/orders" },
      { label: "Restaurant Map", route: "/map" },
      { label: "Bookings", route: "/bookings" },
      { label: "Ingredients' Stock", route: "/stock" },
      { label: "Dishes List", route: "/dishes" },
    ],

    kitchen: [
      { label: "Orders & Tickets", route: "/orders" },
      { label: "Ingredients' Stock", route: "/stock" },
      { label: "Dishes List", route: "/dishes" },
    ],

    waiter: [
      { label: "Dashboard", route: "/dashboard" },
      { label: "Restaurant Map", route: "/map" },
      { label: "Bookings", route: "/bookings" },
    ],

    manager: [
      { label: "Dashboard", route: "/dashboard" },
      { label: "Bookings", route: "/bookings" },
      { label: "Dishes List", route: "/dishes" },
    ],
  };

  const items = menuItemsByRole[role] ?? [];

  return (
    <div
      style={{
        width: 250,
        backgroundColor: "#0F172A", // var(--color-dark-blue)
        height: "100vh",
        padding: 20,
        borderTopRightRadius: 50,
        borderBottomRightRadius: 50,
        color: "white",
        display: "flex",
        flexDirection: "column",
        gap: 25,
        overflowY: "hidden",
      }}
    >
      {/* Logo */}
      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <img src="/logo.png" alt="Dishly Logo" style={{ width: 80, marginBottom: 10 }} />
        <h2 style={{ color: "#7C3AED" }}>Dishly</h2>
      </div>

      {/* Menu Items */}
      {items.map((item) => (
        <button
          key={item.route}
          type="button"
          onClick={() => navigate(item.route)}
          style={{
            display: "flex",
            alignItems: "center",
            width: "100%",
            padding: "12px 15px",
            borderRadius: 10,
            border: "none",
            background: "transparent",
            color: "inherit",
            cursor: "pointer",
            transition: "0.2s",
            textAlign: "left",
          }}
        >
          <span style={{ fontSize: 16 }}>{item.label}</span>
        </button>
      ))}
    </div>
  );
}