import { BrowserRouter, Routes, Route } from "react-router-dom";
import TestPage from "../pages/TestPage";
import DishCard from "../components/DishCard";
import LogInPage from "../pages/LogInPage";
import MainPage from "../pages/MainPage";
import MenuPage from "../pages/MenuPage";

export function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Pàgina d'inici mínima */}
        <Route path="/" element={<LogInPage />} />
  
        {/* Ruta per TestPage */}
        <Route path="/test" element={<TestPage />} />
        
        {/* Ruta per MainPage */}
        <Route path="/main" element={<MainPage />} />
	
	{/* Ruta per MenuPage */}
	<Route path="/menu" element={<MenuPage />} />
      </Routes>
    </BrowserRouter>
  );
}
