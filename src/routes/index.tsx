import { BrowserRouter, Routes, Route } from "react-router-dom";
import TestPage from "../pages/TestPage";

export function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Pàgina d'inici mínima */}
        <Route path="/" element={<div style={{ padding: 20 }}><h1>Pàgina d'inici</h1></div>} />
        
        {/* Ruta per TestPage */}
        <Route path="/test" element={<TestPage />} />
      </Routes>
    </BrowserRouter>
  );
}
