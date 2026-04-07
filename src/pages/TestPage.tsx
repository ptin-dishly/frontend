import React from "react";
import DishCard from "../components/DishCard";
import sampleImage from "../assets/imagen.png";

export default function TestPage() {
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
    </div>
  );
}