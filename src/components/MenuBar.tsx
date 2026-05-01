import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import type { IconType } from "react-icons";
import { RxDashboard } from "react-icons/rx";
import { FaClipboardList, FaCalendarCheck } from "react-icons/fa";
import { GiCardboardBoxClosed } from "react-icons/gi";
import { BsForkKnife } from "react-icons/bs";
import {
  FaCalendarCheck,
  FaClipboardList,
} from "react-icons/fa6";
import { GiCardboardBoxClosed } from "react-icons/gi";
import { BsForkKnife } from "react-icons/bs";
import { RxDashboard } from "react-icons/rx";
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
        borderTopRightRadius: 50,
        borderBottomRightRadius: 50,
        color: "white",
        display: "flex",
        flexDirection: "column",
        gap: 25,
        overflowY: "hidden",
      }}
    >

      <div style={{ position: "relative", height: 220 }}>
        <div style={{ position: "absolute", top: 80, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
          <Logo />
        </div>
      </div>

      <div
        style={{
          marginTop: 40,
          overflowY: "auto",
          maxHeight: "calc(100vh - 260px)",
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        {items.map((item) => {
          const ItemIcon = item.icon;
          const isActive = activePath === item.route;
          const isHovered = hovered === item.route;

          return (
            <button
              key={item.route}
              type="button"
              onMouseEnter={() => setHovered(item.route)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => navigate(item.route)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                width: "100%",
                padding: "20px 20px",
                borderRadius: 20,
                border: "none",
                background: isActive ? "var(--color-white)" : isHovered ? "#f5f5f7" : "transparent",
                color: isActive || isHovered ? "var(--color-purple)" : "white",
                cursor: "pointer",
                transition: "background 0.2s, color 0.2s",
                textAlign: "left",
                fontWeight: isActive ? 600 : 400,
              }}
            >
              <ItemIcon size={24} color={isActive || isHovered ? "var(--color-purple)" : "white"} />
              <span style={{ fontSize: 16 }}>{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
