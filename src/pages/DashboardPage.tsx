import { useState } from "react";
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

  // Llista de 12 comandes d'exemple
  const orders = [
    { id: "9932", table: "12", total: 40.50, items: [{ name: "Lasanya", quantity: 2, price: 14.00 }, { name: "Aigua", quantity: 1, price: 2.50 }] },
    { id: "9933", table: "05", total: 15.20, items: [{ name: "Amanida de Formatge", quantity: 1, price: 12.50 }] },
    { id: "9934", table: "08", total: 22.10, items: [{ name: "Canelons de Rostit", quantity: 2, price: 14.00 }] },
    { id: "9935", table: "01", total: 10.00, items: [{ name: "Cafès", quantity: 2, price: 5.00 }] },
    { id: "9936", table: "03", total: 65.40, items: [{ name: "Entrecot", quantity: 1, price: 22.00 }, { name: "Vi Negre", quantity: 1, price: 18.00 }] },
    { id: "9937", table: "07", total: 12.40, items: [{ name: "Hamburguesa", quantity: 1, price: 10.50 }] },
    { id: "9938", table: "09", total: 28.15, items: [{ name: "Risotto de Bolets", quantity: 1, price: 16.00 }] },
    { id: "9939", table: "11", total: 45.00, items: [{ name: "Paella Marisc", quantity: 2, price: 38.00 }] },
    { id: "9940", table: "04", total: 18.50, items: [{ name: "Tapes variades", quantity: 3, price: 15.00 }] },
    { id: "9941", table: "06", total: 9.20, items: [{ name: "Cervesa", quantity: 2, price: 6.00 }] },
    { id: "9942", table: "14", total: 31.00, items: [{ name: "Pizza Prosciutto", quantity: 2, price: 24.00 }] },
    { id: "9943", table: "02", total: 52.30, items: [{ name: "Pop a la gallega", quantity: 1, price: 19.50 }] },
  ];

  const tableOptions = [
    { label: "Totes les taules", value: "" },
    ...orders
      .map((o) => o.table)
      .filter((t, i, arr) => arr.indexOf(t) === i)
      .sort()
      .map((t) => ({ label: `Taula ${t}`, value: t })),
  ];

  const filteredOrders = orders.filter((order) => {
    const matchesGlobal =
      globalSearch === "" ||
      order.id.includes(globalSearch) ||
      order.table.includes(globalSearch);
    const matchesOrderSearch =
      orderSearch === "" || order.id.includes(orderSearch);
    const matchesTable = tableFilter === "" || order.table === tableFilter;
    return matchesGlobal && matchesOrderSearch && matchesTable;
  });

  return (
    <div style={{ display: "flex", backgroundColor: "var(--color-white)", minHeight: "100vh" }}>
      <MenuBar role="admin" />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", padding: "40px 20px" }}>
        
        {/* Contenidor ajustat a 1100px per forçar una vista estètica de 3 columnes */}
        <div style={{ width: "100%", maxWidth: "1100px" }}>
          
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 30 }}>
            <h1 style={{ fontFamily: "Fustat", color: "var(--color-dark-blue)", fontSize: 32, margin: 0 }}>
              Benvingut de nou!
            </h1>
            <Notification />
          </div>

          <div style={{ marginBottom: 40, display: "flex", justifyContent: "center" }}>
            <SearchBar 
              value={globalSearch} 
              onChange={setGlobalSearch} 
              placeholder="Cerca comandes o taules..." 
            />
          </div>

          <div style={{ display: "flex", justifyContent: "center", gap: 24, marginBottom: 50, flexWrap: "wrap" }}>
            <BigButton label="Total comandes" value={filteredOrders.length} variant="navy" />
            <BigButton label="Pendents" value={5} variant="navy" />
            <BigButton label="Nova comanda" variant="green" />
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 30, flexWrap: "wrap", gap: 20 }}>
            <h2 style={{ fontFamily: "Fustat", fontSize: 22, color: "var(--color-dark-blue)", margin: 0 }}>
              Comandes Actives
            </h2>
            <div style={{ display: "flex", gap: 16 }}>
              <SearchBar
                value={orderSearch}
                onChange={setOrderSearch}
                placeholder="Cerca ID..."
              />
              <SelectDropdown
                options={tableOptions}
                value={tableFilter}
                onChange={setTableFilter}
                placeholder="Taula"
              />
            </div>
          </div>

          {/* Graella amb espaiat generós (gap 35px) i 3 columnes per línia */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
            gap: "35px",
            justifyItems: "center",
            width: "100%"
          }}>
            {filteredOrders.map((order) => (
              <div
                key={order.id}
                onClick={() => setActiveOrder(order)}
                style={{ cursor: "pointer", transition: "transform 0.2s" }}
                onMouseOver={(e) => (e.currentTarget.style.transform = "translateY(-5px)")}
                onMouseOut={(e) => (e.currentTarget.style.transform = "translateY(0)")}
              >
                <OrderCard
                  orderId={order.id}
                  tableNumber={order.table}
                  items={order.items}
                  total={order.total}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {activeOrder && (
        <div style={{ position: "fixed", top: 20, right: 20, zIndex: 1000, animation: "slideIn 0.3s ease-out" }}>
          <div style={{ position: "relative", filter: "drop-shadow(0 10px 30px rgba(0,0,0,0.2))" }}>
            <button 
              onClick={() => setActiveOrder(null)}
              style={{
                position: "absolute", top: -12, left: -12, background: "var(--color-dark-blue)", 
                color: "white", border: "none", borderRadius: "50%", width: 34, height: 34, cursor: "pointer",
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
          from { transform: translateX(110%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}