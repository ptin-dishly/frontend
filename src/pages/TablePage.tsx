import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { getCurrentUser } from "../utils/storage";
import { tableService, type Table } from "../services/api";
import MenuBar from "../components/MenuBar";
import SearchBar from "../components/SearchBar";
import SelectDropdown from "../components/SelectDropdown";

export default function TablesPage() {
  const user = getCurrentUser();
  const userRole = (user?.role || "waiter") as "admin" | "kitchen" | "waiter" | "sales";
  const { t } = useTranslation();

  if (!["admin", "waiter", "sales"].includes(userRole)) {
    return (
      <div style={{ display: "flex", minHeight: "100vh" }}>
        <MenuBar role={userRole} />
        <main style={{ flex: 1, padding: "40px 48px", textAlign: "center" }}>
          <p style={{ fontSize: "16px", color: "#6B7280" }}>
            {t("tables.accessDenied")}
          </p>
        </main>
      </div>
    );
  }

  const [tables, setTables] = useState<Table[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTables = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await tableService.getAll();
        if (res.success && res.data) {
          setTables(res.data);
        }
      } catch (err) {
        console.error("Error fetching tables:", err);
        setError("Failed to load tables");
      } finally {
        setLoading(false);
      }
    };

    fetchTables();
  }, []);

  const filteredTables = tables.filter((table) => {
    const matchesStatus = !filterStatus || table.status === filterStatus;
    const matchesSearch =
      !searchTerm ||
      table.number.toString().includes(searchTerm) ||
      table.capacity.toString().includes(searchTerm);
    return matchesStatus && matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available": return "#22C55E";
      case "occupied": return "#EF4444";
      case "reserved": return "#F59E0B";
      default: return "#6B7280";
    }
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <MenuBar role={userRole} />

      <main style={{ flex: 1, padding: "40px 48px" }}>
        <div style={{ marginBottom: 30 }}>
          <h1 style={{ fontSize: 32, color: "#0F172A", margin: 0 }}>{t("tables.title")}</h1>
        </div>

        {error && (
          <div style={{ backgroundColor: "#FEE2E2", color: "#DC2626", padding: "16px", borderRadius: "8px", marginBottom: "24px", fontSize: "14px" }}>
            ⚠️ {error}
          </div>
        )}

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 44, gap: 24, flexWrap: "wrap" }}>
          <div style={{ maxWidth: 420, width: "100%" }}>
            <SearchBar value={searchTerm} onChange={setSearchTerm} placeholder={t("tables.searchPlaceholder")} />
          </div>

          <SelectDropdown
            options={[
              { label: t("tables.allStatus"), value: "" },
              { label: t("tables.available"), value: "available" },
              { label: t("tables.occupied"), value: "occupied" },
              { label: t("tables.reserved"), value: "reserved" },
            ]}
            value={filterStatus}
            onChange={setFilterStatus}
            placeholder={t("tables.allStatus")}
          />
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "60px 20px", color: "#6B7280" }}>
            <p>{t("tables.loading")}</p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 20 }}>
            {filteredTables.length === 0 ? (
              <p style={{ gridColumn: "1 / -1", textAlign: "center", color: "#6B7280" }}>
                {t("tables.notFound")}
              </p>
            ) : (
              filteredTables.map((table) => (
                <div
                  key={table.id}
                  onClick={() => setSelectedTable(table)}
                  style={{ backgroundColor: "white", borderRadius: 12, padding: 20, border: `2px solid ${getStatusColor(table.status)}`, cursor: "pointer", transition: "all 0.2s", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}
                  onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.1)"; e.currentTarget.style.transform = "translateY(0)"; }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                    <h3 style={{ margin: 0, fontSize: 20, color: "#0F172A" }}>
                      {t("tables.tableNumber", { number: table.number })}
                    </h3>
                    <span style={{ backgroundColor: getStatusColor(table.status), color: "white", padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 600, textTransform: "capitalize" }}>
                      {table.status}
                    </span>
                  </div>

                  <p style={{ margin: "8px 0", color: "#6B7280", fontSize: 14 }}>
                    {t("tables.capacity", { count: table.capacity })}
                  </p>

                  {table.currentOrder && (
                    <p style={{ margin: "8px 0", color: "#7C3AED", fontSize: 14, fontWeight: 600 }}>
                      {table.currentOrder}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {selectedTable && (
          <div
            style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}
            onClick={() => setSelectedTable(null)}
          >
            <div
              style={{ backgroundColor: "white", borderRadius: 16, padding: 32, maxWidth: 500, width: "90%" }}
              onClick={(e) => e.stopPropagation()}
            >
              <h2 style={{ margin: "0 0 20px", color: "#0F172A" }}>
                {t("tables.tableNumber", { number: selectedTable.number })}
              </h2>

              <div style={{ marginBottom: 20 }}>
                <p style={{ color: "#6B7280", fontSize: 14 }}>
                  <strong>{t("tables.statusLabel")}</strong> {selectedTable.status}
                </p>
                <p style={{ color: "#6B7280", fontSize: 14 }}>
                  <strong>{t("tables.capacityLabel")}</strong> {selectedTable.capacity}
                </p>
                {selectedTable.currentOrder && (
                  <p style={{ color: "#6B7280", fontSize: 14 }}>
                    <strong>{t("tables.currentOrderLabel")}</strong> {selectedTable.currentOrder}
                  </p>
                )}
              </div>

              <div style={{ display: "flex", gap: 12 }}>
                <button onClick={() => setSelectedTable(null)} style={{ flex: 1, padding: "12px 16px", backgroundColor: "#E5E7EB", border: "none", borderRadius: 8, fontWeight: 600, cursor: "pointer" }}>
                  {t("common.close")}
                </button>
                <button style={{ flex: 1, padding: "12px 16px", backgroundColor: "#7C3AED", color: "white", border: "none", borderRadius: 8, fontWeight: 600, cursor: "pointer" }}>
                  {t("tables.manageOrder")}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
