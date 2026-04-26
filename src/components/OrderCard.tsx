import React from "react";

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

interface OrderCardProps {
  orderId: string; // Nou camp per al número d'ordre
  tableNumber: string;
  items: OrderItem[];
  total: number;
}

export default function OrderCard({ orderId, tableNumber, items, total }: OrderCardProps) {
  return (
    <div
      style={{
        backgroundColor: "var(--color-white)",
        borderRadius: 12,
        padding: 20,
        boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
        width: 320,
        color: "var(--color-dark-blue)",
      }}
    >
      {/* CAPÇALERA ACTUALITZADA AMB NÚMERO D'ORDRE */}
      <div style={{ borderBottom: "1px solid #E5E7EB", paddingBottom: 10, marginBottom: 15 }}>
        <h2 style={{ margin: 0, fontSize: "20px" }}>
          Taula {tableNumber}
        </h2>
        <span style={{ fontSize: "14px", color: "var(--color-purple)", fontWeight: "bold" }}>
          Ordre: #{orderId}
        </span>
      </div>
      
      <ul style={{ listStyle: "none", padding: 0, margin: "16px 0" }}>
        {items.map((item, index) => (
          <li key={index} style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <p style={{ margin: 0 }}>
              <span style={{ fontWeight: "bold", marginRight: 8 }}>{item.quantity}x</span> 
              {item.name}
            </p>
            <p style={{ margin: 0, fontWeight: "bold" }}>{item.price.toFixed(2)}€</p>
          </li>
        ))}
      </ul>

      <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid #E5E7EB", paddingTop: 12, paddingBottom: 20 }}>
        <h3 style={{ margin: 0 }}>Total</h3>
        <h3 style={{ margin: 0, color: "var(--color-purple)" }}>{total.toFixed(2)}€</h3>
      </div>

      {/* BOTONS VIEW I PAY */}
      <div style={{ display: "flex", gap: 10 }}>
        <button
          style={{
            flex: 1,
            padding: "10px",
            borderRadius: 8,
            border: "1px solid var(--color-gray)",
            backgroundColor: "transparent",
            color: "var(--color-dark-blue)",
            cursor: "pointer",
            fontWeight: "bold",
            fontFamily: "'Commissioner', sans-serif"
          }}
        >
          View
        </button>
        <button
          style={{
            flex: 1,
            padding: "10px",
            borderRadius: 8,
            border: "none",
            backgroundColor: "var(--color-green)", 
            color: "var(--color-white)",
            cursor: "pointer",
            fontWeight: "bold",
            fontFamily: "'Commissioner', sans-serif"
          }}
        >
          Pay
        </button>
      </div>
    </div>
  );
}