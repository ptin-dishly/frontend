import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { sessionService, userService } from "../services/api";
import { setTokens, setCurrentUser, clearAllAuth } from "../utils/storage";
import logoII from "../assets/logo_II.png";
import login_style from "./LogInPage.module.css";

export default function LogIn() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
    <div className={login_style.page}>
      <img src={logoII} alt="Logo" className={login_style.logo} />

      <div className={login_style.panel}>
        <h2 className={login_style.title}>{t("auth.title")}</h2>

        {error && (
          <div className={login_style.error_box}>
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <label className={login_style.field_label}>Email</label>
          <div className={login_style.input_wrapper}>
            <span className={login_style.input_icon}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
              </svg>
            </span>
            <input
              type="email"
              className={login_style.input}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              required
              placeholder="your@email.com"
            />
          </div>

          <label className={login_style.field_label}>Password</label>
          <div className={login_style.input_wrapper}>
            <span className={login_style.input_icon}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </span>
            <input
              type={showPassword ? "text" : "password"}
              className={login_style.input}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              required
              placeholder="••••••••"
            />
            <button
              type="button"
              className={login_style.toggle_btn}
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                  <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          </div>

          <button
            type="submit"
            className={login_style.submit_btn}
            disabled={loading}
          >
            {loading ? t("auth.loggingIn") : t("auth.submit")}
          </button>
        </form>

        
        
      </div>
    </div>
  );
}
