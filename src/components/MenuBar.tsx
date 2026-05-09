import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import type { IconType } from "react-icons";
import { RxDashboard } from "react-icons/rx";
import { FaClipboardList, FaCalendarCheck } from "react-icons/fa";
import { GiCardboardBoxClosed } from "react-icons/gi";
import { BsForkKnife } from "react-icons/bs";
import { MdMenuBook } from "react-icons/md";
import Logo from "./Logo";
import UserProfile from "./UserProfile";
import LanguageSelector from "./LanguageSelector";

interface MenuBarProps {
  role: "admin" | "kitchen" | "waiter" | "sales";
}

type MenuItem = {
  label: string;
  route: string;
  icon: IconType;
};

export default function MenuBar({ role }: MenuBarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const [hovered, setHovered] = useState<string | null>(null);

  const menuItemsByRole: Record<string, MenuItem[]> = {
    admin: [
      { label: t("nav.dashboard"), route: "/dashboard", icon: RxDashboard },
      { label: t("nav.tables"), route: "/tables", icon: BsForkKnife },
      { label: t("nav.kitchen"), route: "/kitchen", icon: FaClipboardList },
      { label: t("nav.bookings"), route: "/bookings", icon: FaCalendarCheck },
      { label: t("nav.menus"), route: "/menus", icon: MdMenuBook },
      { label: t("nav.ingredients"), route: "/ingredients", icon: GiCardboardBoxClosed },
      { label: t("nav.dishes"), route: "/dishes", icon: BsForkKnife },
    ],
    kitchen: [
      { label: t("nav.kitchen"), route: "/kitchen", icon: FaClipboardList },
      { label: t("nav.ingredients"), route: "/ingredients", icon: GiCardboardBoxClosed },
      { label: t("nav.dishes"), route: "/dishes", icon: BsForkKnife },
    ],
    waiter: [
      { label: t("nav.dashboard"), route: "/dashboard", icon: RxDashboard },
      { label: t("nav.tables"), route: "/tables", icon: BsForkKnife },
      { label: t("nav.menus"), route: "/menus", icon: MdMenuBook },
    ],
    sales: [
      { label: t("nav.tables"), route: "/tables", icon: BsForkKnife },
      { label: t("nav.bookings"), route: "/bookings", icon: FaCalendarCheck },
    ],
  };

  const items = menuItemsByRole[role] ?? [];
  const activePath = location.pathname === "/" ? "/dashboard" : location.pathname;

  return (
    <div
      style={{
        width: "clamp(200px, 26vw, 250px)",
        backgroundColor: "#0F172A",
        height: "calc(100dvh - 60px)",
        padding: "20px",
        borderTopRightRadius: 50,
        borderBottomRightRadius: 50,
        color: "white",
        display: "flex",
        flexDirection: "column",
        gap: "20px",
        overflowY: "hidden",
      }}
    >
      <div style={{ display: "flex", justifyContent: "center", marginBottom: "8px" }}>
        <Logo />
      </div>

      <div
        style={{
          overflowY: "auto",
          maxHeight: "calc(100dvh - 340px)",
          display: "flex",
          flexDirection: "column",
          gap: "12px",
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
                gap: "10px",
                width: "100%",
                padding: "14px 16px",
                borderRadius: "14px",
                border: "none",
                background: isActive ? "var(--color-white)" : isHovered ? "#f5f5f7" : "transparent",
                color: isActive || isHovered ? "var(--color-purple)" : "white",
                cursor: "pointer",
                transition: "background 0.2s, color 0.2s",
                textAlign: "left",
                fontWeight: isActive ? 600 : 400,
                fontSize: "14px",
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
        <LanguageSelector />
        <UserProfile />
      </div>
    </div>
  );
}
