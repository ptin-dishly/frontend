import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "../components/ProtectedRoute";
import LogInPage from "../pages/LogInPage";
import DashboardPage from "../pages/DashboardPage";
import MenuPage from "../pages/MenuPage";
import DishPage from "../pages/DishPage";
import DishDetailPage from "../pages/DishDetailPage";
import IngredientsPage from "../pages/IngredientsPage";
import NewIngredientPage from "../pages/NewIngredientPage";
import OrderPage from "../pages/OrderPage";
import TablesPage from "../pages/TablePage";
import BookingsPage from "../pages/BookingPage";
import RecipeCreatePage from "../pages/DishCreatePage";

export function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LogInPage />} />
        
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/tables"
          element={
            <ProtectedRoute>
              <TablesPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/bookings"
          element={
            <ProtectedRoute>
              <BookingsPage />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/kitchen"
          element={
            <ProtectedRoute>
              <OrderPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/menus"
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
          path="/dishes/new"
          element={
            <ProtectedRoute>
              <RecipeCreatePage />
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