import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import type { IconType } from "react-icons";
import { RxDashboard } from "react-icons/rx";
import { FaClipboardList, FaCalendarCheck } from "react-icons/fa";
import { GiCardboardBoxClosed } from "react-icons/gi";
import { BsForkKnife } from "react-icons/bs";
import { MdMenuBook } from "react-icons/md";
import Logo from "./Logo";
import UserProfile from "./UserProfile";

interface MenuBarProps {
  role: "admin" | "kitchen" | "waiter" | "sales";
  fixed?: boolean;
}

type MenuItem = {
  label: string;
  route: string;
  icon: IconType;
};

export default function MenuBar({ role, fixed = true }: MenuBarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [hovered, setHovered] = useState<string | null>(null);

  useEffect(() => {
    if (!fixed) {
      return;
    }

    document.body.classList.add("has-fixed-menubar");
    return () => {
      document.body.classList.remove("has-fixed-menubar");
    };
  }, [fixed]);

  const menuItemsByRole: Record<string, MenuItem[]> = {
    admin: [
      { label: "Dashboard", route: "/dashboard", icon: RxDashboard },
      { label: "Tables", route: "/tables", icon: BsForkKnife },
      { label: "Kitchen", route: "/kitchen", icon: FaClipboardList },
      { label: "Bookings", route: "/bookings", icon: FaCalendarCheck },
      { label: "Menus", route: "/menus", icon: MdMenuBook },
      { label: "Ingredients", route: "/ingredients", icon: GiCardboardBoxClosed },
      { label: "Dishes", route: "/dishes", icon: BsForkKnife },
    ],
    kitchen: [
      { label: "Kitchen", route: "/kitchen", icon: FaClipboardList },
      { label: "Ingredients", route: "/ingredients", icon: GiCardboardBoxClosed },
      { label: "Dishes", route: "/dishes", icon: BsForkKnife },
    ],
    waiter: [
      { label: "Dashboard", route: "/dashboard", icon: RxDashboard },
      { label: "Tables", route: "/tables", icon: BsForkKnife },
      { label: "Menus", route: "/menus", icon: MdMenuBook },
    ],
    sales: [
      { label: "Tables", route: "/tables", icon: BsForkKnife },
      { label: "Bookings", route: "/bookings", icon: FaCalendarCheck },
    ],
  };

  const items = menuItemsByRole[role] ?? [];
  const activePath = location.pathname === "/" ? "/dashboard" : location.pathname;

  return (
    <div
      style={{
        position: fixed ? "fixed" : "relative",
        top: fixed ? 0 : undefined,
        left: fixed ? 0 : undefined,
        zIndex: fixed ? 2000 : undefined,
        width: "var(--menubar-width)",
        backgroundColor: "#0F172A",
        height: "100dvh",
        boxSizing: "border-box",
        padding: "16px",
        borderTopRightRadius: 50,
        borderBottomRightRadius: 50,
        color: "white",
        display: "flex",
        flexDirection: "column",
        gap: "14px",
        overflow: "hidden",
      }}
    >
      <div style={{ display: "flex", justifyContent: "center", marginBottom: "8px" }}>
        <Logo />
      </div>

      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          gap: "20px",
          minHeight: 0,
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
                gap: "14px",
                width: "100%",
                padding: "10px 14px",
                borderRadius: "14px",
                border: "none",
                background: isActive ? "var(--color-white)" : isHovered ? "#f5f5f7" : "transparent",
                color: isActive || isHovered ? "var(--color-purple)" : "white",
                cursor: "pointer",
                transition: "background 0.2s, color 0.2s",
                textAlign: "left",
                fontWeight: isActive ? 600 : 400,
                fontSize: "16px",
              }}
              title={item.label}
            >
              <ItemIcon size={20} color={isActive || isHovered ? "var(--color-purple)" : "white"} />
              <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>

      <div style={{ marginTop: "auto" }}>
        <UserProfile />
      </div>
    </div>
  );
}