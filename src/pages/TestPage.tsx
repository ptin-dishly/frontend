import React from "react";
import DishCard from "../components/DishCard";
import OrderCard from "../components/OrderCard";
import TicketCard from "../components/TicketCard";
import sampleImage from "../assets/imagen.png";

export default function TestPage() {
  // Dades de prova per als nous components
  const sampleOrderItems = [
    { id: "1", name: "Amanida de Formatge", quantity: 1, price: 12.50 },
    { id: "2", name: "Canelons de Rostit", quantity: 2, price: 14.00 }
  ];

  const sampleTicketItems = [
    { name: "Amanida de Formatge", quantity: 1, price: 12.50 },
    { name: "Canelons de Rostit", quantity: 2, price: 14.00 }
  ];

  return (
    <div style={{ padding: 20 }}>
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

      {/* --- NOVES SECCIONS PER ALS TEUS COMPONENTS --- */}
      
      <h2>Exemple de Order Card</h2>
      <OrderCard 
        orderId="9932" 
        tableNumber="12" 
        items={sampleOrderItems} 
        total={40.50} 
      />

      <h2>Exemple de Ticket Card (Recib)</h2>
      <TicketCard 
        ticketId="882-2026"
        orderId="ORD-9932"
        tableNumber="12"
        items={sampleTicketItems}
        total={40.50}
        paymentMethod="Targeta"
        paymentDate="15/04/2026 14:30"
      />
    </div>
  );
}