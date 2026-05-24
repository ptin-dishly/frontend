import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "../components/ProtectedRoute";
import LogInPage from "../pages/LogInPage";
import DashboardPage from "../pages/DashboardPage";
import MenuPage from "../pages/MenuPage";
import PublicMenuPage from "../pages/PublicMenuPage";
import DishPage from "../pages/DishPage";
import DishDetailPage from "../pages/DishDetailPage";
import IngredientsPage from "../pages/IngredientsPage";
import NewIngredientPage from "../pages/NewIngredientPage";
import OrderPage from "../pages/OrderPage";
import TablesPage from "../pages/TablePage";
import BookingsPage from "../pages/BookingPage";
import RecipeCreatePage from "../pages/DishCreatePage";
import AllComponents from "../pages/AllComponents";
import MenuCreatePage from "../pages/MenuCreatePage";
import ClientMenuPage from "../pages/ClientMenuPage";


export const ESTABLISHMENTS: Record<string, { id: string; name: string }> = {
  "ca-la-maria": { id: "22222222-0002-0002-0002-000000000001", name: "Ca la Maria" },
  "el-raco":     { id: "22222222-0002-0002-0002-000000000002", name: "El Racó" },
};

export function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LogInPage />} />
        <Route path="/client/menu" element={<ClientMenuPage />} />
        <Route path="/client/menu/:menuId" element={<ClientMenuPage />} />
        
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
          path="/orders"
          element={
            <ProtectedRoute>
              <OrderPage />
            </ProtectedRoute>
          }
        />

        <Route 
            path="/restaurant/:restaurantSlug" 
            element={
            <PublicMenuPage/>
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
          path="/menus/new"
          element={
            <ProtectedRoute>
              <MenuCreatePage />
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

        <Route
          path="/test-components"
          element={
            <ProtectedRoute>
              <AllComponents />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}