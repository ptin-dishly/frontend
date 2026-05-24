import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { getCurrentUser, getAccessToken } from "../utils/storage";
import { orderService } from "../services/api";
import MenuBar from "../components/MenuBar";
import SearchBar from "../components/SearchBar";
import BigButton from "../components/BigButton";
import SelectDropdown from "../components/SelectDropdown";
import OrderCard from "../components/OrderCard";
import FloorMapSection from "../components/FloorMapSection";

const API_BASE = import.meta.env.VITE_API_URL as string;

interface DashboardOrder {
  id: string;
  tableId: string | null;
  tableNumber: string | null;
  status: string;
  items: { name: string; quantity: number; price: number }[];
  total: number;
}

async function fetchOrders(): Promise<DashboardOrder[]> {
  const token = getAccessToken();
  const res = await fetch(`${API_BASE}/orders/active`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  const json = await res.json();
  if (!json.success) return [];
  return json.data as DashboardOrder[];
}

export default function DashboardPage() {
  const user = getCurrentUser();
  const userRole = (user?.role || "admin") as "admin" | "kitchen" | "waiter" | "sales";
  const { t } = useTranslation();
  const navigate = useNavigate();

  const canSeeMap = userRole === "admin" || userRole === "waiter";

  const [globalSearch, setGlobalSearch] = useState("");
  const [tableFilter, setTableFilter] = useState("");
  const [orders, setOrders] = useState<DashboardOrder[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  const refresh = () => fetchOrders().then(setOrders).catch(() => {});

  useEffect(() => {
    setLoadingOrders(true);
    fetchOrders()
      .then(setOrders)
      .catch(() => setOrders([]))
      .finally(() => setLoadingOrders(false));
  }, []);

  const tableOptions = [
    { label: t("dashboard.allTables"), value: "" },
    ...Array.from(new Set(orders.map((o) => o.tableNumber ?? "—")))
      .sort()
      .map((tbl) => ({ label: t("dashboard.table", { number: tbl }), value: tbl })),
  ];

  const filteredOrders = orders.filter((order) => {
    const tableNum = order.tableNumber ?? "";
    const matchesGlobal =
      globalSearch === "" ||
      order.id.includes(globalSearch) ||
      tableNum.includes(globalSearch);
    const matchesTable = tableFilter === "" || tableNum === tableFilter;
    return matchesGlobal && matchesTable;
  });

  const pendingCount = orders.filter((o) => o.status === "pending").length;

  return (
    <div style={{ display: "flex", backgroundColor: "var(--color-white)", minHeight: "100vh" }}>
      <MenuBar role={userRole} />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", padding: "40px 20px" }}>
        <div style={{ width: "100%", maxWidth: "1100px" }}>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 30 }}>
            <div>
              <h1 style={{ fontFamily: "Fustat", color: "var(--color-dark-blue)", fontSize: 32, margin: "0 0 8px 0" }}>
                {t("dashboard.welcome", { name: user?.name })}
              </h1>
              <p style={{ color: "#6B7280", fontSize: 14, margin: 0 }}>
                {t("dashboard.role")} <span style={{ fontWeight: 600, color: "#0F172A" }}>{user?.role?.toUpperCase()}</span>
              </p>
            </div>
          </div>

          {canSeeMap && <FloorMapSection onOrderChange={refresh} />}

          <div style={{ display: "flex", justifyContent: "center", gap: 24, marginBottom: 32, flexWrap: "wrap" }}>
            <BigButton label={t("dashboard.totalOrders")} value={filteredOrders.length.toString()} />
            <BigButton label={t("dashboard.pending")} value={pendingCount.toString()} />
          </div>

          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 16, marginBottom: 40, flexWrap: "wrap" }}>
            <SearchBar
              value={globalSearch}
              onChange={setGlobalSearch}
              placeholder={t("dashboard.searchPlaceholder")}
            />
            <SelectDropdown
              options={tableOptions}
              value={tableFilter}
              onChange={setTableFilter}
            />
          </div>

          <h2 style={{ fontFamily: "Fustat", fontSize: 22, color: "var(--color-dark-blue)", margin: "0 0 30px 0" }}>
            {t("dashboard.activeOrders")}
          </h2>

          {loadingOrders ? (
            <p style={{ textAlign: "center", color: "#6B7280" }}>{t("dashboard.loading")}</p>
          ) : filteredOrders.length === 0 ? (
            <p style={{ textAlign: "center", color: "#6B7280" }}>{t("dashboard.noOrders")}</p>
          ) : (
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
              gap: "35px",
              justifyItems: "center",
              width: "100%"
            }}>
              {filteredOrders.map((order) => (
                <div
                  key={order.id}
                  style={{ transition: "transform 0.2s" }}
                  onMouseOver={(e) => (e.currentTarget.style.transform = "translateY(-5px)")}
                  onMouseOut={(e) => (e.currentTarget.style.transform = "translateY(0)")}
                >
                  <OrderCard
                    orderId={order.id.replace(/-/g, "").slice(-8).toUpperCase()}
                    tableNumber={order.tableNumber ?? "—"}
                    items={order.items}
                    total={order.total}
                    onView={() => navigate("/orders")}
                    onPay={async () => {
                      await orderService.close(order.id);
                      refresh();
                    }}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
