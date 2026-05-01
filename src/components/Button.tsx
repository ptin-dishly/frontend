import React from "react";

const colors = {
  white: "#FAFAFA",
  purple: "#7C3AED",
  dark: "#0F172A",
  green: "#22C55E",
  gray: "#6B7280",
};

type ButtonProps = {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: "primary" | "secondary";
  style?: React.CSSProperties;
};

const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  disabled = false,
  variant = "primary",
  style,
}) => {
  const baseStyle: React.CSSProperties = {
    fontFamily: "Commissioner, sans-serif",
    border: "none",
    borderRadius: "8px",
    cursor: disabled ? "not-allowed" : "pointer",
    padding: "8px 16px",
    fontSize: "12px",
    transition: "all 0.2s ease",
  };

  const variants = {
    primary: {
      backgroundColor: colors.green,
      color: colors.white,
    },
    secondary: {
      backgroundColor: colors.purple,
      color: colors.white,
    },
  };

  const disabledStyle: React.CSSProperties = disabled
    ? {
        backgroundColor: colors.gray,
        color: colors.white,
        opacity: 0.7,
      }
    : {};

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        ...baseStyle,
        ...variants[variant],
        ...disabledStyle,
        ...style,
      }}
    >
      {children}
    </button>
  );
};

export default Button;