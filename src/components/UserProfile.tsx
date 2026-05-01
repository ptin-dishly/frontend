import React from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser, clearAllAuth } from "../utils/storage";

export default function UserProfile() {
  const navigate = useNavigate();
  const user = getCurrentUser();

  if (!user) {
    return null;
  }

  const handleLogout = () => {
    clearAllAuth();
    navigate("/");
  };

  const getRoleLabel = (role: string): string => {
    const roleLabels: Record<string, string> = {
      admin: "Administrador",
      kitchen: "Cuina",
      waiter: "Cambrer/a",
      manager: "Gestor",
      host: "Recepcionista",
    };
    return roleLabels[role] || role;
  };

  const getRoleColor = (role: string): string => {
    const colors: Record<string, string> = {
      admin: "#7C3AED",
      kitchen: "#2563EB",
      waiter: "#22C55E",
      manager: "#F59E0B",
      host: "#EC4899",
    };
    return colors[role] || "#6B7280";
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "12px",
        padding: "12px 16px",
        backgroundColor: "rgba(255, 255, 255, 0.1)",
        borderRadius: "12px",
        border: "1px solid rgba(255, 255, 255, 0.2)",
        color: "#FFFFFF",
      }}
    >
      {/* Avatar */}
      <div
        style={{
          width: "36px",
          height: "36px",
          minWidth: "36px",
          borderRadius: "50%",
          backgroundColor: getRoleColor(user.role),
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#FFFFFF",
          fontWeight: 700,
          fontSize: "14px",
        }}
      >
        {user.name.charAt(0).toUpperCase()}
      </div>

      {/* User Info */}
      <div
        style={{
          flex: 1,
          minWidth: 0,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            fontSize: "13px",
            fontWeight: 600,
            color: "#FFFFFF",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {user.name}
        </div>
        <div
          style={{
            fontSize: "11px",
            color: "rgba(255, 255, 255, 0.7)",
            marginTop: "2px",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {getRoleLabel(user.role)}
        </div>
      </div>

      {/* Logout Button */}
      <button
        onClick={handleLogout}
        type="button"
        style={{
          padding: "6px 10px",
          backgroundColor: "rgba(239, 68, 68, 0.8)",
          color: "#FFFFFF",
          border: "none",
          borderRadius: "6px",
          fontSize: "11px",
          fontWeight: 600,
          cursor: "pointer",
          transition: "all 0.2s ease",
          minWidth: "fit-content",
          whiteSpace: "nowrap",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#DC2626")}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "rgba(239, 68, 68, 0.8)")}
      >
        Exit
      </button>
    </div>
  );
}