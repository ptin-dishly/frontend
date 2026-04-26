import React, { useState } from "react";
import MenuBar from "../components/MenuBar";
import SearchBar from "../components/SearchBar";
import BigButton from "../components/BigButton";
import SelectDropdown from "../components/SelectDropdown";
import OrderCard from "../components/OrderCard";
import Notification from "../components/Notification";

export default function DashboardPage() {
  const [globalSearch, setGlobalSearch] = useState("");
  const [orderSearch, setOrderSearch] = useState("");
  const [tableFilter, setTableFilter] = useState("");
  const [activeOrder, setActiveOrder] = useState<any>(null);

  const tableOptions = [
    { label: "Totes les taules", value: "" },
    { label: "Taula 01", value: "01" },
    { label: "Taula 05", value: "05" },
    { label: "Taula 12", value: "12" },
  ];

  const orders = [
    { id: "9932", table: "12", total: 40.50, items: [{ name: "Lasanya", quantity: 2, price: 14.00 }] },
    { id: "9933", table: "05", total: 15.20, items: [{ name: "Amanida", quantity: 1, price: 12.50 }] },
    { id: "9934", table: "08", total: 22.10, items: [{ name: "Canelons", quantity: 1, price: 12.00 }] },
    { id: "9935", table: "01", total: 10.00, items: [{ name: "Cafè", quantity: 2, price: 5.00 }] },
  ];

  return (
    <div style={{ display: "flex", backgroundColor: "var(--color-white)", minHeight: "100vh" }}>
      {/* Barra lateral persistent */}
      <MenuBar role="admin" />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", padding: "40px 20px" }}>
        
        {/* Contenidor central per a un disseny més net i estètic */}
        <div style={{ width: "100%", maxWidth: "1100px" }}>
          
          {/* Capçalera: Benvinguda i Notificació */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <h1 style={{ fontFamily: "Fustat", color: "var(--color-dark-blue)", fontSize: 28, margin: 0 }}>
              Benvingut de nou!
            </h1>
            <Notification />
          </div>

          {/* Cercador Principal centrat respecte el contingut */}
          <div style={{ marginBottom: 40 }}>
            <SearchBar 
              value={globalSearch} 
              onChange={setGlobalSearch} 
              placeholder="Cerca comandes, plats o begudes..." 
            />
          </div>

          {/* Secció d'Estadístiques Centrades */}
          <div style={{ display: "flex", justifyContent: "center", gap: 24, marginBottom: 50, flexWrap: "wrap" }}>
            <BigButton label="Total comandes" value={12} variant="navy" />
            <BigButton label="Pendents" value={4} variant="navy" />
            <BigButton label="Nova comanda" variant="green" />
          </div>

          {/* Filtres de cerca específica */}
          <div style={{ display: "flex", gap: 16, marginBottom: 30, alignItems: "center", flexWrap: "wrap" }}>
            <SearchBar 
              value={orderSearch} 
              onChange={setOrderSearch} 
              placeholder="ID d'ordre..." 
            />
            <SelectDropdown 
              options={tableOptions} 
              value={tableFilter} 
              onChange={setTableFilter} 
              placeholder="Taula" 
            />
          </div>

          {/* Graella de Comandes (Vista Ràpida) */}
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", 
            gap: 25,
            width: "100%"
          }}>
            {orders.map((order) => (
              <div 
                key={order.id} 
                onClick={() => setActiveOrder(order)} 
                style={{ cursor: "pointer", transition: "transform 0.2s" }}
              >
                <OrderCard 
                  orderId={order.id} 
                  tableNumber={order.table} 
                  items={[]} // No mostrem ítems aquí per optimitzar espai
                  total={order.total} 
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Detall de comanda (Notificació tipus overlay) */}
      {activeOrder && (
        <div style={{ position: "fixed", top: 20, right: 20, zIndex: 1000, animation: "slideIn 0.3s ease-out" }}>
          <div style={{ position: "relative", filter: "drop-shadow(0 10px 20px rgba(0,0,0,0.2))" }}>
            <button 
              onClick={() => setActiveOrder(null)}
              style={{
                position: "absolute", top: -12, left: -12, background: "var(--color-dark-blue)", 
                color: "white", border: "none", borderRadius: "50%", width: 32, height: 32, cursor: "pointer",
                fontWeight: "bold", zIndex: 1100, fontSize: 16
              }}
            >✕</button>
            <OrderCard 
              orderId={activeOrder.id} 
              tableNumber={activeOrder.table} 
              items={activeOrder.items} 
              total={activeOrder.total} 
            />
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideIn {
          from { transform: translateX(110%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}