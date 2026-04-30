import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import type { IconType } from "react-icons";
import { RxDashboard } from "react-icons/rx";
import { FaClipboardList, FaCalendarCheck } from "react-icons/fa";
import { GiCardboardBoxClosed } from "react-icons/gi";
import { BsForkKnife } from "react-icons/bs";
import Logo from "./Logo";

interface MenuBarProps {
  role: "admin" | "kitchen" | "waiter" | "host";
}

type MenuItem = {
  label: string;
  route: string;
  icon: IconType;
};

export default function MenuBar({ role }: MenuBarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [hovered, setHovered] = useState<string | null>(null);

  const menuItemsByRole: Record<string, MenuItem[]> = {
    admin: [
      { label: "Dashboard", route: "/dashboard", icon: RxDashboard },
      { label: "Tickets", route: "/orders", icon: FaClipboardList },
      { label: "Bookings", route: "/bookings", icon: FaCalendarCheck },
      { label: "Ingredients' Stock", route: "/stock", icon: GiCardboardBoxClosed },
      { label: "Dishes List", route: "/dishes", icon: BsForkKnife },
    ],
    kitchen: [
      { label: "Tickets", route: "/orders", icon: FaClipboardList },
      { label: "Ingredients' Stock", route: "/stock", icon: GiCardboardBoxClosed },
      { label: "Dishes List", route: "/dishes", icon: BsForkKnife },
    ],
    waiter: [
      { label: "Dashboard", route: "/dashboard", icon: RxDashboard },
      { label: "Bookings", route: "/bookings", icon: FaCalendarCheck },
    ],
    host: [
      { label: "Dashboard", route: "/dashboard", icon: RxDashboard },
      { label: "Bookings", route: "/bookings", icon: FaCalendarCheck },
      { label: "Dishes List", route: "/dishes", icon: BsForkKnife },
    ],
  };

  const items = menuItemsByRole[role] ?? [];
  const activePath = location.pathname === "/" ? "/dashboard" : location.pathname;

  return (
    <div
      style={{
        width: "clamp(200px, 26vw, 250px)",
        maxWidth: "100vw",
        backgroundColor: "#0F172A",
        height: "100dvh",
        padding: 20,
        boxSizing: "border-box",
        borderTopRightRadius: 50,
        borderBottomRightRadius: 50,
        color: "white",
        display: "flex",
        flexDirection: "column",
        gap: 16,
        overflow: "hidden",
      }}
    >
      <div style={{ textAlign: "center", marginBottom: 8, marginTop: 8 }}>
        <Logo />
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 12,
          overflowY: "auto",
          minHeight: 0,
          paddingRight: 4,
        }}
      >
        {items.map((item) => {
          const isActive = activePath === item.route;
          const isHovered = hovered === item.route;
          const Icon = item.icon;
          return (
            <button
              key={item.route}
              type="button"
              onClick={() => navigate(item.route)}
              onMouseEnter={() => setHovered(item.route)}
              onMouseLeave={() => setHovered(null)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                width: "100%",
                padding: "12px 15px",
                borderRadius: 10,
                border: "none",
                background: isActive
                  ? "var(--color-purple)"
                  : isHovered
                  ? "rgba(255,255,255,0.08)"
                  : "transparent",
                color: "inherit",
                cursor: "pointer",
                transition: "background 0.2s",
                textAlign: "left",
              }}
            >
              <Icon style={{ fontSize: 18, flexShrink: 0 }} />
              <span style={{ fontSize: 15 }}>{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
