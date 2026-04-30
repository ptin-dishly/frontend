import { useNavigate } from "react-router-dom";
import Logo from "./Logo";

interface MenuBarProps {
  role: "admin" | "kitchen" | "waiter" | "host";
}

export default function MenuBar({ role }: MenuBarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [hovered, setHovered] = useState<string | null>(null);

  type MenuItem = {
    label: string;
    route: string;
    icon: IconType;
  };

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

  // Ruta activa: si estem a "/", tractem-la com "/dashboard"
  const activePath = location.pathname === "/" ? "/dashboard" : location.pathname;

  return (
    <div
      style={{
        width: "clamp(200px, 26vw, 250px)",
        maxWidth: "100vw",
        backgroundColor: "#0F172A", // var(--color-dark-blue)
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
      {/* Logo */}
      <div style={{ textAlign: "center", marginBottom: 8, marginTop: 8 }}>
        <Logo />
      </div>

      {/* Menu Items */}
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
        {items.map((item) => (
          <button
            key={item.route}
            type="button"
            onClick={() => navigate(item.route)}
            style={{
              display: "flex",
              alignItems: "center",
              width: "100%",
              padding: "12px 15px",
              borderRadius: 10,
              border: "none",
              background: "transparent",
              color: "inherit",
              cursor: "pointer",
              transition: "0.2s",
              textAlign: "left",
            }}
          >
            <span style={{ fontSize: 16 }}>{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}