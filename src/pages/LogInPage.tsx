import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { sessionService, userService } from "../services/api";
import { setTokens, setCurrentUser, clearAllAuth } from "../utils/storage";
import logoII from "../assets/logo_II.png";
import login_style from "./LogInPage.module.css";

export default function LogIn() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [email, setEmail] = useState("marc@calblay.cat");
  const [password, setPassword] = useState("secret123");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      console.log("🔐 Attempting login...");
      const loginRes = await sessionService.login(email, password);
      console.log("✅ Login response:", loginRes);

      if (!loginRes.success || !loginRes.data) {
        setError(loginRes.message || t("auth.loginFailed"));
        setLoading(false);
        return;
      }

      console.log("💾 Storing tokens...");
      setTokens(loginRes.data.accessToken, loginRes.data.refreshToken);

      console.log("👤 Fetching user info...");
      const userRes = await userService.getMe();
      console.log("✅ User response:", userRes);

      if (!userRes.success || !userRes.data) {
        setError(userRes.message || t("auth.fetchUserFailed"));
        clearAllAuth();
        setLoading(false);
        return;
      }

      console.log("💾 Storing user info...");
      setCurrentUser(userRes.data);

      const role = userRes.data.role;
      console.log(`🎯 Navigating based on role: ${role}`);

      if (role === "admin") {
        navigate("/dashboard");
      } else if (role === "kitchen") {
        navigate("/kitchen");
      } else if (role === "waiter") {
        navigate("/dashboard");
      } else if (role === "sales") {
        navigate("/bookings");
      } else {
        navigate("/main");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : t("auth.loginFailed");
      setError(errorMessage);
      console.error("❌ Login error:", err);
      clearAllAuth();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: "40px" }}>
      <img src={logoII} alt="Logo" style={{ width: "235px", height: "100px" }} />
      <div className={login_style.panel}>
        <form className={login_style.form_style} onSubmit={handleSubmit}>
          <h2>{t("auth.title")}</h2>

          {error && (
            <div
              style={{
                backgroundColor: "#FEE2E2",
                color: "#DC2626",
                padding: "12px",
                borderRadius: "8px",
                fontSize: "14px",
                fontWeight: 500,
                marginBottom: "16px",
              }}
            >
              ⚠️ {error}
            </div>
          )}

          <label>{t("auth.email")}</label>
          <input
            type="email"
            className={login_style.input}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            required
          />

          <label>{t("auth.password")}</label>
          <input
            type="password"
            className={login_style.input}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            required
          />

          <button
            type="submit"
            className={login_style.login_button}
            disabled={loading}
            style={{
              opacity: loading ? 0.6 : 1,
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? t("auth.loggingIn") : t("auth.submit")}
          </button>

          <a href="#" style={{ color: "#fff", textDecoration: "none", fontSize: "14px" }}>
            {t("auth.forgotPassword")}
          </a>
        </form>
      </div>
    </div>
  );
}
