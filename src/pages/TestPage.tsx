import React, { useState } from "react";
import DishCard from "../components/DishCard";
import OrderCard from "../components/OrderCard";
import TicketCard from "../components/TicketCard";
import SearchBar from "../components/SearchBar";
import SelectDropdown from "../components/SelectDropdown";
import CounterInput from "../components/CounterInput";
import sampleImage from "../assets/imagen.png";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: { code: string; message: string; details?: Record<string, unknown> };
  meta?: { timestamp: string };
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ResponseBox({ result }: { result: unknown }) {
  if (result === null) return null;
  const isError =
    typeof result === "object" &&
    result !== null &&
    "success" in result &&
    (result as ApiResponse).success === false;

  return (
    <pre
      style={{
        marginTop: 12,
        padding: "12px 16px",
        borderRadius: 8,
        background: isError ? "#fff1f0" : "#f0fdf4",
        border: `1px solid ${isError ? "#fca5a5" : "#86efac"}`,
        color: isError ? "#b91c1c" : "#166534",
        fontSize: 13,
        overflowX: "auto",
        whiteSpace: "pre-wrap",
        wordBreak: "break-all",
        maxHeight: 320,
        overflowY: "auto",
      }}
    >
      {JSON.stringify(result, null, 2)}
    </pre>
  );
}

function SectionTitle({ title, tag }: { title: string; tag: string }) {
  const tagColors: Record<string, string> = {
    GET: "#16a34a",
    POST: "#2563eb",
    DELETE: "#dc2626",
    PUT: "#d97706",
  };
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
      <span
        style={{
          background: tagColors[tag] ?? "#64748b",
          color: "#fff",
          fontWeight: 700,
          fontSize: 11,
          padding: "2px 8px",
          borderRadius: 4,
          letterSpacing: 1,
        }}
      >
        {tag}
      </span>
      <h2 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>{title}</h2>
    </div>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #e2e8f0",
        borderRadius: 12,
        padding: 20,
        marginBottom: 16,
        boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
      }}
    >
      {children}
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <label style={{ display: "block", marginBottom: 8 }}>
      <span style={{ fontSize: 12, fontWeight: 600, color: "#475569" }}>{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          display: "block",
          width: "100%",
          marginTop: 4,
          padding: "8px 10px",
          borderRadius: 6,
          border: "1px solid #cbd5e1",
          fontSize: 13,
          boxSizing: "border-box",
          outline: "none",
        }}
      />
    </label>
  );
}

function Btn({
  onClick,
  loading,
  children,
  color = "#2563eb",
}: {
  onClick: () => void;
  loading: boolean;
  children: React.ReactNode;
  color?: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      style={{
        marginTop: 8,
        padding: "8px 18px",
        background: loading ? "#94a3b8" : color,
        color: "#fff",
        border: "none",
        borderRadius: 6,
        fontSize: 13,
        fontWeight: 600,
        cursor: loading ? "not-allowed" : "pointer",
        transition: "background 0.15s",
      }}
    >
      {loading ? "Carregant…" : children}
    </button>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function TestPage() {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState("");
  const [count, setCount] = useState(1);

  const sampleOrderItems = [
    { id: "1", name: "Amanida de Formatge", quantity: 1, price: 12.5 },
    { id: "2", name: "Canelons de Rostit", quantity: 2, price: 14.0 },
  ];

  const sampleTicketItems = [
    { name: "Amanida de Formatge", quantity: 1, price: 12.5 },
    { name: "Canelons de Rostit", quantity: 2, price: 14.0 },
  ];

  return (
    <div style={{ padding: 20 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          marginBottom: 30,
        }}
      >
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Value"
        />
      </div>

      <h2>Prova Dropdown</h2>
      <SelectDropdown
        value={selected}
        onChange={setSelected}
        options={[
          { label: "Taula 1", value: "1" },
          { label: "Taula 2", value: "2" },
          { label: "Taula 3", value: "3" },
        ]}
      />
      <p>Seleccionat: {selected}</p>

      <h2>Prova Counter</h2>
      <CounterInput value={count} onChange={setCount} />
      <p>Valor: {count}</p>

      <h1>Títol Principal (Fustat Bold 24)</h1>
      <h2>Títol 1 (Commissioner 20)</h2>
      <h3>Títol 2 (Commissioner 16)</h3>
      <h4>Subtítol (Commissioner 14, 65% opacitat)</h4>
      <p>Text normal (Commissioner 12)</p>

      <h2>Paleta de Colors</h2>
      <div style={{ display: "flex", gap: 10 }}>
        <div className="color-box white" />
        <div className="color-box purple" />
        <div className="color-box dark-blue" />
        <div className="color-box green" />
        <div className="color-box gray" />
      </div>

      <h2>Card de plat d'exemple</h2>
      <DishCard name="Lasanya" image={sampleImage} />

      <h2>Exemple de Order Card</h2>
      <OrderCard
        orderId="9932"
        tableNumber="12"
        items={sampleOrderItems}
        total={40.5}
      />

      <h2>Exemple de Ticket Card (Recib)</h2>
      <TicketCard
        ticketId="882-2026"
        orderId="ORD-9932"
        tableNumber="12"
        items={sampleTicketItems}
        total={40.5}
        paymentMethod="Targeta"
        paymentDate="15/04/2026 14:30"
      />
    </div>
  );
}