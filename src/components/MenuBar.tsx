import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import type { IconType } from "react-icons";
import { RxDashboard } from "react-icons/rx";
import { FaClipboardList, FaCalendarCheck } from "react-icons/fa";
import { GiCardboardBoxClosed } from "react-icons/gi";
import { BsForkKnife } from "react-icons/bs";
import { MdMenuBook, MdOutlineDinnerDining } from "react-icons/md";
import Logo from "./Logo";
import UserProfile from "./UserProfile";
import LanguageSelector from "./LanguageSelector";
import { HiOutlineQrCode } from "react-icons/hi2";
import QRCode from "react-qr-code"; // o la llibreria que usin

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
  const { t } = useTranslation();
  const [hovered, setHovered] = useState<string | null>(null);
  const [isQrOpen, setIsQrOpen] = useState(false);
  const qrLandingUrl = `${window.location.origin}/client/menu`;

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
      { label: t("nav.dashboard"), route: "/dashboard", icon: RxDashboard },
      { label: t("nav.tables"), route: "/tables", icon: BsForkKnife },
      { label: t("nav.orders"), route: "/orders", icon: FaClipboardList },
      { label: t("nav.bookings"), route: "/bookings", icon: FaCalendarCheck },
      { label: t("nav.menus"), route: "/menus", icon: MdMenuBook },
      { label: t("nav.ingredients"), route: "/ingredients", icon: GiCardboardBoxClosed },
      { label: t("nav.dishes"), route: "/dishes", icon: MdOutlineDinnerDining },
    ],
    kitchen: [
     
      { label: t("nav.ingredients"), route: "/ingredients", icon: GiCardboardBoxClosed },
      { label: t("nav.dishes"), route: "/dishes", icon: MdOutlineDinnerDining },
    ],
    waiter: [
      { label: t("nav.dashboard"), route: "/dashboard", icon: RxDashboard },
      { label: t("nav.tables"), route: "/tables", icon: BsForkKnife },
      { label: t("nav.orders"), route: "/orders", icon: FaClipboardList },
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
    <>
      <button
        type="button"
        onClick={() => setIsQrOpen(true)}
        title={t("menus.openClientMenu")}
        aria-label={t("menus.openClientMenu")}
        style={{
          position: "fixed",
          top: 16,
          right: 16,
          zIndex: 2200,
          width: 44,
          height: 44,
          borderRadius: 12,
          border: "1px solid #CBD5E1",
          backgroundColor: "white",
          color: "#0F172A",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          boxShadow: "0 6px 16px rgba(15,23,42,0.16)",
        }}
      >
        <HiOutlineQrCode size={22} />
      </button>

      {isQrOpen && (
        <div
          onClick={() => setIsQrOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 2300,
            backgroundColor: "rgba(15, 23, 42, 0.45)",
            display: "grid",
            placeItems: "center",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "min(92vw, 380px)",
              backgroundColor: "white",
              borderRadius: 16,
              border: "1px solid #E5E7EB",
              padding: 20,
              boxShadow: "0 14px 30px rgba(15,23,42,0.2)",
            }}
          >
            <h3 style={{ margin: "0 0 8px", color: "#0F172A" }}>{t("menus.qrTitle")}</h3>
            <p style={{ margin: "0 0 14px", color: "#64748B", fontSize: 14 }}>{t("menus.qrDescription")}</p>

            <div
              style={{
                width: 200,
                margin: "0 auto",
                border: "1px solid #E5E7EB",
                borderRadius: 12,
                padding: 12,
                backgroundColor: "white",
              }}
            >
              <QRCode value={qrLandingUrl} size={176} />
            </div>

            <p style={{ margin: "14px 0 0", color: "#334155", fontSize: 12, wordBreak: "break-all" }}>
              {qrLandingUrl}
            </p>

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 14 }}>
              <button
                type="button"
                onClick={() => setIsQrOpen(false)}
                style={{
                  padding: "8px 12px",
                  borderRadius: 8,
                  border: "1px solid #CBD5E1",
                  backgroundColor: "white",
                  color: "#0F172A",
                  cursor: "pointer",
                  fontWeight: 600,
                }}
              >
                {t("common.close")}
              </button>
            </div>
          </div>
        </div>
      )}

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
                background: isActive ? "var(--color-white)" : isHovered ? "rgba(255,255,255,0.10)" : "transparent",
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

        <div style={{ marginTop: "auto" }}>
          <LanguageSelector />
          <UserProfile />
        </div>
      </div>
    </>
  );
}
