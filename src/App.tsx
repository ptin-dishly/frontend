import React from "react";
import "./index.css";
import DishCard from "./components/DishCard";
import sampleImage from "./assets/imagen.png";

function App() {
  return (
    <div style={{ padding: 20 }}>
      <h1>Títol Principal (Fustat Bold 24)</h1>
      <h2>Títol 1 (Commissioner 20)</h2>
      <h3>Títol 2 (Commissioner 16)</h3>
      <h4>Subtítol (Commissioner 14, 65% opacitat)</h4>
      <p>Text normal (Commissioner 12)</p>

      <h2>Paleta de Colors</h2>
      <div style={{ display: "flex", gap: 10 }}>
        <div style={{ width: 50, height: 50, backgroundColor: "var(--color-white)", border: "1px solid #ccc" }} />
        <div style={{ width: 50, height: 50, backgroundColor: "var(--color-purple)" }} />
        <div style={{ width: 50, height: 50, backgroundColor: "var(--color-dark-blue)" }} />
        <div style={{ width: 50, height: 50, backgroundColor: "var(--color-green)" }} />
        <div style={{ width: 50, height: 50, backgroundColor: "var(--color-gray)" }} />
      </div>

      <h2>Card de plat d’exemple</h2>
      <DishCard name="Lasanya" image={sampleImage} />
    </div>
  );
}

export default App;
