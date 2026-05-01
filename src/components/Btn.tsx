import React from "react";

interface BtnProps {
  onClick: () => void;
  loading?: boolean;
  children: React.ReactNode;
  color?: string;
}

export default function Btn({
  onClick,
  loading = false,
  children,
  color = "#2563eb",
}: BtnProps) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      style={{
        marginTop: 8,
        padding: "8px 18px",
        background: loading ? "#94a3b8" : color,
        color: "#fff",
        border: "none",
        borderRadius: 6,
        fontSize: 13,
        fontWeight: 600,
        cursor: loading ? "not-allowed" : "pointer",
        transition: "background 0.15s",
      }}
    >
      {loading ? "Loading…" : children}
    </button>
  );
}