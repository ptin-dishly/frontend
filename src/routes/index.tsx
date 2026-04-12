import { BrowserRouter, Routes, Route } from "react-router-dom";
import TestPage from "../pages/TestPage";
import DishCard from "../components/DishCard";
import LogInPage from "../pages/LogInPage";
import MainPage from "../pages/MainPage";
import AllergensTestPage from "../pages/allergensTestPage";

export function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Pàgina d'inici mínima */}
        <Route path="/" element={<LogInPage />} />
  
        {/* Ruta per TestPage */}
        <Route path="/test" element={<TestPage />} />

        {/* Ruta per AllergensTestPage */}
        <Route path="/allergens-test" element={<AllergensTestPage />} />
        
        {/* Ruta per MainPage */}
        <Route path="/main" element={<MainPage />} />
      </Routes>
    </BrowserRouter>
  );
}
