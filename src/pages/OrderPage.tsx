import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getCurrentUser } from "../utils/storage";
import {
  orderService,
  tableService,
  type Order,
  type Table,
} from "../services/api";
import MenuBar from "../components/MenuBar";
import SearchBar from "../components/SearchBar";
import SelectDropdown from "../components/SelectDropdown";
import PrintButton from "../components/printbutton";
import KitchenTicket from "../components/kitchenTicket.tsx";

export default function OrderPage() {
  const user = getCurrentUser();
  
  const userRole = (user?.role || "waiter") as
    | "admin"
    | "kitchen"
    | "waiter"
    | "sales";

  const { t } = useTranslation();
  const [searchParams] = useSearchParams();

  if (!["admin", "waiter"].includes(userRole)) {
    return (
      <div style={{ display: "flex", minHeight: "100vh" }}>
        <MenuBar role={userRole} />

        <main
          style={{
            flex: 1,
            padding: "40px 48px",
            textAlign: "center",
          }}
        >
          <p style={{ fontSize: "16px", color: "#6B7280" }}>
            {t("orders.accessDenied")}
          </p>
        </main>
      </div>
    );
  }

  const [orders, setOrders] = useState<Order[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  const [filterStatus, setFilterStatus] = useState<string>("");
  const [filterTable, setFilterTable] = useState<string>("");

  const [searchTerm, setSearchTerm] = useState<string>("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

 useEffect(() => {
  const fetchOrders = async () => {
    setLoading(true);
    setError(null);

    try {
      const currentUser = getCurrentUser();
      const establishmentId = currentUser?.establishmentId;

      if (!establishmentId) {
        setError("No establishment assigned");
        return;
      }

      const res = await orderService.getAllActive();

      if (res.success && res.data) {
        setOrders(res.data);
        const tablesRes = await tableService.getAll();

      if (tablesRes.success && tablesRes.data) {
        setTables(tablesRes.data);
      }
      }

    } catch (err) {
      console.error("Error fetching orders:", err);
      setError("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  fetchOrders();
}, []);

useEffect(() => {
  const tableNumber = searchParams.get("tableNumber");

  if (!tableNumber || orders.length === 0) {
    return;
  }

  const orderForTable = orders.find(
    (order) => order.tableNumber?.toString() === tableNumber
  );

  if (orderForTable) {
    setSelectedOrderId(orderForTable.id);
  }

  // Eliminem el paràmetre de la URL perquè només serveixi per obrir la comanda una vegada
  const newParams = new URLSearchParams(searchParams);
  newParams.delete("tableNumber");

  window.history.replaceState(
    {},
    "",
    `${window.location.pathname}${newParams.toString() ? `?${newParams.toString()}` : ""}`
  );
}, [searchParams, orders]);

const filteredOrders = orders.filter((order) => {
  const matchesStatus =
    !filterStatus || order.status === filterStatus;

  const matchesSearch =
    !searchTerm || order.id.includes(searchTerm);

  const matchesTable =
  !filterTable || order.tableNumber?.toString() === filterTable;

  return (
    matchesStatus &&
    matchesSearch &&
    matchesTable
  );
});

console.log("ORDERS:", orders);
console.log("FILTERED:", filteredOrders);
  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "#F59E0B";

      case "confirmed":
        return "#22C55E";

      case "preparing":
        return "#3b38d3";

      case "completed":
        return "#6B7280";

      default:
        return "#6B7280";
    }
  };

  const selectedOrder = orders.find(
    (o) => o.id === selectedOrderId
  );

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <MenuBar role={userRole} />

      <main style={{ flex: 1, padding: "40px 48px" }}>
        <div style={{ marginBottom: 30 }}>
          <h1
            style={{
              fontSize: 32,
              color: "#0F172A",
              margin: 0,
            }}
          >
            {t("orders.title")}
          </h1>
        </div>

        {error && (
          <div
            style={{
              backgroundColor: "#FEE2E2",
              color: "#DC2626",
              padding: "16px",
              borderRadius: "8px",
              marginBottom: "24px",
              fontSize: "14px",
            }}
          >
            ⚠️ {error}
          </div>
        )}

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 44,
            gap: 24,
            flexWrap: "wrap",
          }}
        >
          <div style={{ maxWidth: 420, width: "100%" }}>
            <SearchBar
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder={t("orders.searchPlaceholder")}
            />
          </div>

          <SelectDropdown
            options={[
              { label: "Todas las mesas", value: "" },

              ...tables.map((table) => ({
                label: `Mesa ${table.number}`,
                value: table.number.toString(),
              })),
            ]}
            value={filterTable}
            onChange={setFilterTable}
            placeholder="Filtrar por mesa"
          />
          <SelectDropdown
            options={[
              { label: t("orders.allStatus"), value: "" },
              { label: t("orders.pending"), value: "pending" },
              { label: t("orders.confirmed"), value: "confirmed" },
              { label: t("orders.preparing"), value: "preparing" },
            ]}
            value={filterStatus}
            onChange={setFilterStatus}
            placeholder={t("orders.allStatus")}
          />
        </div>

        {loading ? (
          <div
            style={{
              textAlign: "center",
              padding: "60px 20px",
              color: "#6B7280",
            }}
          >
            <p>{t("orders.loading")}</p>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fill, minmax(350px, 1fr))",
              gap: 20,
            }}
          >
            {filteredOrders.length === 0 ? (
              <p
                style={{
                  gridColumn: "1 / -1",
                  textAlign: "center",
                  color: "#6B7280",
                }}
              >
                {t("orders.notFound")}
              </p>
            ) : (
              filteredOrders.map((order) => (
                <div
                  key={order.id}
                  onClick={() =>
                    setSelectedOrderId(order.id)
                  }
                  style={{
                    backgroundColor: "white",
                    borderRadius: 12,
                    padding: 20,
                    border: `2px solid ${getStatusColor(
                      order.status
                    )}`,
                    cursor: "pointer",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: 12,
                    }}
                  >
                    

                    <span
                      style={{
                        backgroundColor: getStatusColor(
                          order.status
                        ),
                        color: "white",
                        padding: "4px 12px",
                        borderRadius: 20,
                      }}
                    >
                      {order.status}
                    </span>
                  </div>

                  
                  <div>
                          <p
                            style={{
                              margin: "0 0 8px 0",
                              color: "#374151",
                              fontWeight: 600,
                            }}
                          >
                            Mesa {order.tableNumber}
                          </p>

                          <p
                            style={{
                              margin: 0,
                              fontSize: 18,
                              fontWeight: 700,
                              color: "#111827",
                            }}
                          >
                            € {order.total?.toFixed(2)}
                          </p>
                </div>
                </div>
              ))
            )}
          </div>
        )}
        {selectedOrder && (
        <div
          onClick={() => setSelectedOrderId(null)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: 16,
            boxSizing: "border-box",
            zIndex: 2100,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: "white",
              borderRadius: 16,
              width: "min(100%, 760px)",
              maxWidth: 760,
              padding: "24px clamp(20px, 4vw, 32px)",
              maxHeight: "calc(100vh - 32px)",
              overflowY: "auto",
              boxSizing: "border-box",
            }}
          >
            {/* HEADER */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "minmax(0, 1fr) auto",
                gap: 16,
                alignItems: "start",
                marginBottom: 24,
              }}
            >
              <div>
                <h2
                  style={{
                    margin: 0,
                    fontSize: 28,
                  }}
                >
                  Mesa {selectedOrder.tableNumber}
                </h2>

                <p
                  style={{
                    color: "#6B7280",
                    marginTop: 8,
                  }}
                >
                  {selectedOrder.status}
                </p>
              </div>

              <button
                onClick={() => setSelectedOrderId(null)}
                style={{
                  border: "none",
                  background: "#F3F4F6",
                  borderRadius: 8,
                  padding: "8px 12px",
                  cursor: "pointer",
                }}
              >
                ✕
              </button>
            </div>

            {/* ITEMS */}
            <div
              style={{
                display: "grid",
                gap: 16,
              }}
            >
              {selectedOrder.items?.map((item, index) => (
                <div
                  key={index}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "minmax(0, 1fr) auto",
                    gap: 12,
                    alignItems: "start",
                    paddingBottom: 12,
                    borderBottom: "1px solid #E5E7EB",
                  }}
                >
                  <div>
                    <p
                      style={{
                        margin: 0,
                        fontWeight: 600,
                        fontSize: 16,
                      }}
                    >
                      {item.name}
                    </p>

                    <p
                      style={{
                        margin: "4px 0 0 0",
                        color: "#6B7280",
                      }}
                    >
                      x{item.quantity}
                    </p>
                  </div>

                  <p
                    style={{
                      margin: 0,
                      fontWeight: 700,
                    }}
                  >
                    € {(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>

            {/* TOTAL */}
            <div
              style={{
                marginTop: 32,
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
                gap: 12,
                alignItems: "center",
              }}
            >
              <h2
                style={{
                  margin: 0,
                }}
              >
                Total
              </h2>

              <h2
                style={{
                  margin: 0,
                }}
              >
                € {selectedOrder.total?.toFixed(2)}
              </h2>
            </div>

            {/* BOTONS */}
            <div style={{ marginTop: 32 }}>
              <PrintButton onPrint={() => window.print()} label="Imprimir" />
            </div>
            <KitchenTicket order={selectedOrder} />
          </div>
        </div>
      )}
      </main>
    </div>
  );
}