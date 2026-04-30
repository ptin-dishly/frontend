import { BrowserRouter, Routes, Route } from "react-router-dom";
import TestPage from "../pages/TestPage";
import LogInPage from "../pages/LogInPage";
import MainPage from "../pages/MainPage";
import DashboardPage from "../pages/DashboardPage";

export function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LogInPage />} />
        <Route path="/test" element={<TestPage />} />
        <Route path="/main" element={<MainPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
      </Routes>
    </BrowserRouter>
  );
}
