import React, { useState, useEffect } from "react";
import { getCurrentUser } from "../utils/storage";
import { orderService, type Order } from "../services/api";
import MenuBar from "../components/MenuBar";
import SearchBar from "../components/SearchBar";
import SelectDropdown from "../components/SelectDropdown";

export default function OrderPage() {
  const user = getCurrentUser();
  const userRole = (user?.role || "waiter") as "admin" | "kitchen" | "waiter" | "sales";

  if (!["admin", "kitchen"].includes(userRole)) {
    return (
      <div style={{ display: "flex", minHeight: "100vh" }}>
        <MenuBar role={userRole} />
        <main style={{ flex: 1, padding: "40px 20px", textAlign: "center" }}>
          <p style={{ fontSize: "16px", color: "#6B7280" }}>
            Access denied. This page is only available for admin and kitchen roles.
          </p>
        </main>
      </div>
    );
  }

  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await orderService.getAll();
        if (res.success && res.data) {
          setOrders(res.data);
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

  const filteredOrders = orders.filter((order) => {
    const matchesStatus = !filterStatus || order.status === filterStatus;
    const matchesSearch =
      !searchTerm ||
      order.orderNumber.includes(searchTerm) ||
      order.tableNumber.includes(searchTerm);
    return matchesStatus && matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "#F59E0B";
      case "in_progress":
        return "#3B82F6";
      case "ready":
        return "#22C55E";
      case "completed":
        return "#6B7280";
      default:
        return "#6B7280";
    }
  };

  const selectedOrder = orders.find((o) => o.id === selectedOrderId);

  const updateOrderStatus = async (
    orderId: string,
    newStatus: Order["status"]
  ) => {
    try {
      const res = await orderService.updateStatus(orderId, newStatus);
      if (res.success && res.data) {
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order.id === orderId ? res.data! : order
          )
        );
        setSelectedOrderId(null);
      }
    } catch (err) {
      console.error("Error updating order status:", err);
    }
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <MenuBar role={userRole} />

      <main style={{ flex: 1, padding: "48px 56px", maxWidth: 1400, margin: "0 auto" }}>
        <div style={{ marginBottom: 30 }}>
          <h1 style={{ fontSize: 32, color: "#0F172A", margin: 0 }}>Kitchen Orders</h1>
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
              placeholder="Search orders..."
            />
          </div>

          <SelectDropdown
            options={[
              { label: "All Status", value: "" },
              { label: "Pending", value: "pending" },
              { label: "In Progress", value: "in_progress" },
              { label: "Ready", value: "ready" },
              { label: "Completed", value: "completed" },
            ]}
            value={filterStatus}
            onChange={setFilterStatus}
            placeholder="Filter by status"
          />
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "60px 20px", color: "#6B7280" }}>
            <p>Loading orders...</p>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))",
              gap: 20,
            }}
          >
            {filteredOrders.length === 0 ? (
              <p style={{ gridColumn: "1 / -1", textAlign: "center", color: "#6B7280" }}>
                No orders found
              </p>
            ) : (
              filteredOrders.map((order) => (
                <div
                  key={order.id}
                  onClick={() => setSelectedOrderId(order.id)}
                  style={{
                    backgroundColor: "white",
                    borderRadius: 12,
                    padding: 20,
                    border: `2px solid ${getStatusColor(order.status)}`,
                    cursor: "pointer",
                    transition: "all 0.2s",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)";
                    e.currentTarget.style.transform = "translateY(-2px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.1)";
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 12,
                    }}
                  >
                    <h3 style={{ margin: 0, fontSize: 18, color: "#0F172A" }}>
                      {order.orderNumber}
                    </h3>
                    <span
                      style={{
                        backgroundColor: getStatusColor(order.status),
                        color: "white",
                        padding: "4px 12px",
                        borderRadius: 20,
                        fontSize: 12,
                        fontWeight: 600,
                        textTransform: "capitalize",
                      }}
                    >
                      {order.status.replace("_", " ")}
                    </span>
                  </div>

                  <p style={{ margin: "8px 0", color: "#6B7280", fontSize: 14 }}>
                    Table: {order.tableNumber}
                  </p>

                  <div style={{ margin: "12px 0", maxHeight: 100, overflowY: "auto" }}>
                    {order.items.map((item) => (
                      <p key={item.id} style={{ margin: "4px 0", fontSize: 13, color: "#6B7280" }}>
                        {item.quantity}x {item.name}
                      </p>
                    ))}
                  </div>

                  <p style={{ margin: "12px 0 0", fontSize: 14, fontWeight: 600, color: "#0F172A" }}>
                    Total: €{order.total.toFixed(2)}
                  </p>
                </div>
              ))
            )}
          </div>
        )}

        {selectedOrder && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0,0,0,0.5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1000,
            }}
            onClick={() => setSelectedOrderId(null)}
          >
            <div
              style={{
                backgroundColor: "white",
                borderRadius: 16,
                padding: 32,
                maxWidth: 600,
                width: "90%",
                maxHeight: "80vh",
                overflowY: "auto",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <h2 style={{ margin: "0 0 20px", color: "#0F172A" }}>
                Order {selectedOrder.orderNumber}
              </h2>

              <div style={{ marginBottom: 20 }}>
                <p style={{ color: "#6B7280", fontSize: 14 }}>
                  <strong>Table:</strong> {selectedOrder.tableNumber}
                </p>
                <p style={{ color: "#6B7280", fontSize: 14 }}>
                  <strong>Status:</strong> {selectedOrder.status.replace("_", " ")}
                </p>
                <p style={{ color: "#6B7280", fontSize: 14 }}>
                  <strong>Created:</strong> {new Date(selectedOrder.createdAt).toLocaleTimeString()}
                </p>
              </div>

              <div style={{ marginBottom: 20, borderTop: "1px solid #E5E7EB", paddingTop: 20 }}>
                <h3 style={{ marginTop: 0, marginBottom: 10, color: "#0F172A" }}>Items:</h3>
                {selectedOrder.items.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: 8,
                      fontSize: 14,
                      color: "#6B7280",
                    }}
                  >
                    <span>
                      {item.quantity}x {item.name}
                    </span>
                    <span>€{(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
                <div
                  style={{
                    borderTop: "1px solid #E5E7EB",
                    marginTop: 10,
                    paddingTop: 10,
                    display: "flex",
                    justifyContent: "space-between",
                    fontWeight: 600,
                  }}
                >
                  <span>Total:</span>
                  <span>€{selectedOrder.total.toFixed(2)}</span>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {selectedOrder.status !== "pending" && (
                  <button
                    onClick={() => updateOrderStatus(selectedOrder.id, "pending")}
                    style={{
                      padding: "12px 16px",
                      backgroundColor: "#F59E0B",
                      color: "white",
                      border: "none",
                      borderRadius: 8,
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    Mark as Pending
                  </button>
                )}

                {selectedOrder.status !== "in_progress" && (
                  <button
                    onClick={() => updateOrderStatus(selectedOrder.id, "in_progress")}
                    style={{
                      padding: "12px 16px",
                      backgroundColor: "#3B82F6",
                      color: "white",
                      border: "none",
                      borderRadius: 8,
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    Mark as In Progress
                  </button>
                )}

                {selectedOrder.status !== "ready" && (
                  <button
                    onClick={() => updateOrderStatus(selectedOrder.id, "ready")}
                    style={{
                      padding: "12px 16px",
                      backgroundColor: "#22C55E",
                      color: "white",
                      border: "none",
                      borderRadius: 8,
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    Mark as Ready
                  </button>
                )}

                {selectedOrder.status !== "completed" && (
                  <button
                    onClick={() => updateOrderStatus(selectedOrder.id, "completed")}
                    style={{
                      padding: "12px 16px",
                      backgroundColor: "#6B7280",
                      color: "white",
                      border: "none",
                      borderRadius: 8,
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    Mark as Completed
                  </button>
                )}

                <button
                  onClick={() => setSelectedOrderId(null)}
                  style={{
                    padding: "12px 16px",
                    backgroundColor: "#E5E7EB",
                    border: "none",
                    borderRadius: 8,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}