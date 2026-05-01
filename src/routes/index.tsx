import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "../components/ProtectedRoute";
import TestPage from "../pages/TestPage";
import LogInPage from "../pages/LogInPage";
import MainPage from "../pages/MainPage";
import DashboardPage from "../pages/DashboardPage";
import MenuPage from "../pages/MenuPage";
import DishPage from "../pages/DishPage";
import DishDetailPage from "../pages/DishDetailPage";
import IngredientsPage from "../pages/IngredientsPage";
import NewIngredientPage from "../pages/NewIngredientPage";

export function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LogInPage />} />
        <Route path="/test" element={<TestPage />} />
        
        <Route
          path="/main"
          element={
            <ProtectedRoute>
              <MainPage />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute requiredRole="admin">
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/menu"
          element={
            <ProtectedRoute>
              <MenuPage />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/dishes"
          element={
            <ProtectedRoute>
              <DishPage />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/dishes/:id"
          element={
            <ProtectedRoute>
              <DishDetailPage />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/ingredients"
          element={
            <ProtectedRoute>
              <IngredientsPage />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/ingredients/new"
          element={
            <ProtectedRoute>
              <NewIngredientPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}