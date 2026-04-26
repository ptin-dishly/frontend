import React, { useState } from "react";
import DishCard from "../components/DishCard";
import OrderCard from "../components/OrderCard";
import TicketCard from "../components/TicketCard";
import SearchBar from "../components/SearchBar";
import SelectDropdown from "../components/SelectDropdown";
import CounterInput from "../components/CounterInput";
import sampleImage from "../assets/imagen.png";

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