import React, { useState } from "react";
import MenuBar from "../components/MenuBar";
import SearchBar from "../components/SearchBar";
import DishCard from "../components/DishCard";
import Notification from "../components/Notification";
import sampleImage from "../assets/imagen.png"; 

export default function MenuPage() {
  const [search, setSearch] = useState("");

  const menuItems = [
    { id: "1", name: "Lasanya de Rostit", category: "Primers", price: "12.50€" },
    { id: "2", name: "Canelons de la padrina", category: "Primers", price: "14.00€" },
    { id: "3", name: "Entrecot a la brasa", category: "Segons", price: "18.50€" },
    { id: "4", name: "Bacallà amb samfaina", category: "Segons", price: "16.00€" },
    { id: "5", name: "Crema Catalana", category: "Postres", price: "6.00€" },
    { id: "6", name: "Amanida César", category: "Primers", price: "9.50€" },
  ];

  const filteredItems = menuItems.filter(item =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#F9FAFB", fontFamily: "sans-serif" }}>
      <MenuBar role="admin" />

      <div style={{ flex: 1, padding: "40px" }}>
        
        {/* Header Superior */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "40px" }}>
          <div style={{ width: "100%", maxWidth: "400px" }}>
            <SearchBar 
              value={search} 
              onChange={setSearch} 
              placeholder="Cerca un plat..." 
            />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
             <button style={{ 
               backgroundColor: "#22C55E", 
               color: "white", 
               border: "none", 
               padding: "12px 24px", 
               borderRadius: "12px", 
               fontWeight: "bold", 
               cursor: "pointer" 
             }}>
               + Create New Order
             </button>
             <Notification />
          </div>
        </div>

        {/* Categories / Filtres (Opcional, com a la imatge 1) */}
        <div style={{ display: "flex", gap: "15px", marginBottom: "30px" }}>
           {["Best Seller", "Primer Plato", "Segundo Plato", "Postres"].map(cat => (
             <div key={cat} style={{ 
               backgroundColor: "white", 
               padding: "10px 20px", 
               borderRadius: "10px", 
               boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
               fontSize: "14px",
               fontWeight: "500",
               border: "1px solid #E4E7EC"
             }}>
               {cat}
             </div>
           ))}
        </div>

        {/* Grid de Plats corregit */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          gap: "24px"
        }}>
          {filteredItems.map((item) => (
            <div key={item.id} style={{ 
              backgroundColor: "white", 
              borderRadius: "16px", 
              padding: "20px", 
              boxShadow: "0 4px 6px rgba(0,0,0,0.05)",
              display: "flex",
              flexDirection: "column",
              position: "relative", // Per posicionar el preu a dalt a la dreta
              border: "1px solid #F2F4F7"
            }}>
              {/* Preu a la part superior dreta */}
              <div style={{ 
                position: "absolute", 
                top: "20px", 
                right: "20px", 
                fontSize: "18px", 
                fontWeight: "bold", 
                color: "#101828" 
              }}>
                {item.price}
              </div>

              {/* Imatge i Info */}
              <div style={{ display: "flex", gap: "15px", alignItems: "center" }}>
                <img 
                  src={sampleImage} 
                  alt={item.name} 
                  style={{ width: "80px", height: "80px", borderRadius: "12px", objectFit: "cover" }} 
                />
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: "0 0 5px 0", fontSize: "18px", color: "#101828" }}>{item.name}</h3>
                  <p style={{ margin: 0, fontSize: "12px", color: "#667085", lineHeight: "1.4" }}>
                    Descripció curta del plat deliciós...
                  </p>
                </div>
              </div>

              {/* Icones i Categoria a la part inferior */}
              <div style={{ display: "flex", justifyContent: "flex-start", gap: "8px", marginTop: "15px" }}>
                <span style={{ fontSize: "18px" }}>🥦</span>
                <span style={{ fontSize: "18px" }}>🥩</span>
                <span style={{ fontSize: "18px" }}>🌾</span>
                <span style={{ 
                  marginLeft: "auto", 
                  fontSize: "12px", 
                  color: "#7F56D9", 
                  fontWeight: "600",
                  backgroundColor: "#F9F5FF",
                  padding: "4px 10px",
                  borderRadius: "6px"
                }}>
                  {item.category}
                </span>
              </div>
            </div>
          ))}
        </div>

        {filteredItems.length === 0 && (
          <p style={{ textAlign: "center", color: "#667085", marginTop: "40px" }}>No hi ha plats que coincideixin.</p>
        )}
      </div>
    </div>
  );
}
