import React from "react";

interface TicketItem {
  name: string;
  quantity: number;
  price: number;
}

interface TicketCardProps {
  ticketId: string;
  orderId: string;
  tableNumber: string;
  items: TicketItem[];
  total: number;
  paymentMethod: string; // Ej: "Targeta", "Efectiu"
  paymentDate: string;   // Ej: "15/04/2026 14:30"
}

export default function TicketCard({ 
  ticketId, 
  orderId, 
  tableNumber, 
  items, 
  total, 
  paymentMethod, 
  paymentDate 
}: TicketCardProps) {
  return (
    <div
      style={{
        backgroundColor: "var(--color-white)",
        borderRadius: 12,
        padding: "24px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
        width: 320,
        color: "var(--color-dark-blue)",
        fontFamily: "'Commissioner', sans-serif",
        borderTop: "8px solid var(--color-purple)" // Detalle visual de Dishly
      }}
    >
      {/* CAPÇALERA DE TICKET */}
      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <h3 style={{ margin: "0 0 5px 0", fontFamily: "'Fustat', sans-serif" }}>TIQUET DE CAIXA</h3>
        <p style={{ margin: 0, fontSize: "12px", color: "var(--color-gray)" }}>Cal Blay - Dishly System</p>
      </div>

      {/* INFO GENERAL */}
      <div style={{ fontSize: "13px", marginBottom: 15, borderBottom: "1px dashed #CCC", paddingBottom: 10 }}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span>Tiquet: <strong>#{ticketId}</strong></span>
          <span>Taula: <strong>{tableNumber}</strong></span>
        </div>
        <div style={{ marginTop: 4 }}>Ordre: {orderId}</div>
      </div>

      {/* LLISTA DE PRODUCTES */}
      <div style={{ marginBottom: 15 }}>
        {items.map((item, index) => (
          <div key={index} style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", marginBottom: 5 }}>
            <span>{item.quantity}x {item.name}</span>
            <span>{(item.quantity * item.price).toFixed(2)}€</span>
          </div>
        ))}
      </div>

      {/* TOTAL */}
      <div style={{ borderTop: "2px solid var(--color-dark-blue)", paddingTop: 10, marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "bold", fontSize: "18px" }}>
          <span>TOTAL</span>
          <span>{total.toFixed(2)}€</span>
        </div>
      </div>

      {/* INFO DE PAGAMENT */}
      <div style={{ 
        backgroundColor: "#F1F5F9", 
        padding: "12px", 
        borderRadius: 8, 
        fontSize: "13px",
        borderLeft: "4px solid var(--color-green)" 
      }}>
        <div style={{ marginBottom: 4 }}>
          <span style={{ color: "var(--color-gray)" }}>Mètode:</span> <strong>{paymentMethod}</strong>
        </div>
        <div style={{ marginBottom: 8 }}>
          <span style={{ color: "var(--color-gray)" }}>Data:</span> <strong>{paymentDate}</strong>
        </div>
        <div style={{ 
          color: "var(--color-green)", 
          fontWeight: "bold", 
          textAlign: "center", 
          fontSize: "14px",
          letterSpacing: "1px"
        }}>
          ● PAGAT
        </div>
      </div>

      <button
        style={{
          width: "100%",
          marginTop: 20,
          padding: "10px",
          borderRadius: 8,
          border: "1px solid #E5E7EB",
          backgroundColor: "white",
          cursor: "pointer",
          fontSize: "12px",
          fontWeight: "bold",
          color: "var(--color-gray)"
        }}
      >
        Imprimir Còpia
      </button>
    </div>
  );
}