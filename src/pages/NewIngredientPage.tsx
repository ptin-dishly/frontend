import React, { useState } from "react";
import MenuBar from "../components/MenuBar";
import BackButton from "../components/BackButton";

export default function NewIngredientPage() {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [quantityKg, setQuantityKg] = useState("");
  const [expirationDays, setExpirationDays] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newIngredient = {
      name,
      category,
      quantityKg: Number(quantityKg),
      expirationDays: Number(expirationDays),
    };

    console.log("Nou ingredient:", newIngredient);
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <MenuBar role="admin" />

      <div style={{ flex: 1, padding: 30 }}>
        <BackButton label="Nou ingredient" />

        <h1 style={{ marginTop: 20 }}>Crear nou ingredient</h1>

        <form
          onSubmit={handleSubmit}
          style={{
            marginTop: 30,
            maxWidth: 400,
            display: "flex",
            flexDirection: "column",
            gap: 15,
          }}
        >
          <input
            type="text"
            placeholder="Nom"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <input
            type="text"
            placeholder="Categoria"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          />

          <input
            type="number"
            placeholder="Quantitat (Kg)"
            value={quantityKg}
            onChange={(e) => setQuantityKg(e.target.value)}
          />

          <input
            type="number"
            placeholder="Caducitat (dies)"
            value={expirationDays}
            onChange={(e) => setExpirationDays(e.target.value)}
          />

          <button
            type="submit"
            style={{
              marginTop: 10,
              padding: 12,
              borderRadius: 10,
              border: "none",
              backgroundColor: "#22C55E",
              color: "white",
              fontWeight: "bold",
              cursor: "pointer",
            }}
          >
            Guardar ingredient
          </button>
        </form>
      </div>
    </div>
  );
}