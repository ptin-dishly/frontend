import { BrowserRouter, Routes, Route } from "react-router-dom";
import TestPage from "../pages/TestPage";
import DishCard from "../components/DishCard";
import LogInPage from "../pages/LogInPage";
import MainPage from "../pages/MainPage";
<<<<<<< menu-page
import MenuPage from "../pages/MenuPage";
=======
>>>>>>> dev
import IngredientsPage from "../pages/IngredientsPage";
import NewIngredientPage from "../pages/NewIngredientPage";

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
<<<<<<< menu-page
	
	      {/* Ruta per MenuPage */}
	      <Route path="/menu" element={<MenuPage />} />
=======
>>>>>>> dev

        {/* Ruta per ingredients*/}
        <Route path="/ingredients" element={<IngredientsPage />} />
        
        {/* Ruta per ingredient nou*/}
        <Route path="/ingredients/new" element={<NewIngredientPage />} />
      </Routes>
    </BrowserRouter>
  );
}
