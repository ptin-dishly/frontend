import { useState, useEffect } from "react";
import { getCurrentUser } from "../utils/storage";
import { tableService, type Table } from "../services/api";
import MenuBar from "../components/MenuBar";
import SearchBar from "../components/SearchBar";
import SelectDropdown from "../components/SelectDropdown";

export default function TablesPage() {
  const user = getCurrentUser();
  const userRole = (user?.role || "waiter") as "admin" | "kitchen" | "waiter" | "sales";

  if (!["admin", "waiter", "sales"].includes(userRole)) {
    return (
      <div style={{ display: "flex", minHeight: "100vh" }}>
        <MenuBar role={userRole} />
        <main style={{ flex: 1, padding: "40px 20px", textAlign: "center" }}>
          <p style={{ fontSize: "16px", color: "#6B7280" }}>
            Access denied. This page is only available for admin, waiter and sales roles.
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
      case "available":
        return "#22C55E";
      case "occupied":
        return "#EF4444";
      case "reserved":
        return "#F59E0B";
      default:
        return "#6B7280";
    }
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <MenuBar role={userRole} />

      <main style={{ flex: 1, padding: "48px 56px", maxWidth: 1400, margin: "0 auto" }}>
        <div style={{ marginBottom: 30 }}>
          <h1 style={{ fontSize: 32, color: "#0F172A", margin: 0 }}>Tables</h1>
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
              placeholder="Search tables..."
            />
          </div>

          <SelectDropdown
            options={[
              { label: "All Status", value: "" },
              { label: "Available", value: "available" },
              { label: "Occupied", value: "occupied" },
              { label: "Reserved", value: "reserved" },
            ]}
            value={filterStatus}
            onChange={setFilterStatus}
            placeholder="Filter by status"
          />
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "60px 20px", color: "#6B7280" }}>
            <p>Loading tables...</p>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: 20,
            }}
          >
            {filteredTables.length === 0 ? (
              <p style={{ gridColumn: "1 / -1", textAlign: "center", color: "#6B7280" }}>
                No tables found
              </p>
            ) : (
              filteredTables.map((table) => (
                <div
                  key={table.id}
                  onClick={() => setSelectedTable(table)}
                  style={{
                    backgroundColor: "white",
                    borderRadius: 12,
                    padding: 20,
                    border: `2px solid ${getStatusColor(table.status)}`,
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
                    <h3 style={{ margin: 0, fontSize: 20, color: "#0F172A" }}>
                      Table {table.number}
                    </h3>
                    <span
                      style={{
                        backgroundColor: getStatusColor(table.status),
                        color: "white",
                        padding: "4px 12px",
                        borderRadius: 20,
                        fontSize: 12,
                        fontWeight: 600,
                        textTransform: "capitalize",
                      }}
                    >
                      {table.status}
                    </span>
                  </div>

                  <p style={{ margin: "8px 0", color: "#6B7280", fontSize: 14 }}>
                    Capacity: {table.capacity} people
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
            onClick={() => setSelectedTable(null)}
          >
            <div
              style={{
                backgroundColor: "white",
                borderRadius: 16,
                padding: 32,
                maxWidth: 500,
                width: "90%",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <h2 style={{ margin: "0 0 20px", color: "#0F172A" }}>
                Table {selectedTable.number}
              </h2>

              <div style={{ marginBottom: 20 }}>
                <p style={{ color: "#6B7280", fontSize: 14 }}>
                  <strong>Status:</strong> {selectedTable.status}
                </p>
                <p style={{ color: "#6B7280", fontSize: 14 }}>
                  <strong>Capacity:</strong> {selectedTable.capacity} people
                </p>
                {selectedTable.currentOrder && (
                  <p style={{ color: "#6B7280", fontSize: 14 }}>
                    <strong>Current Order:</strong> {selectedTable.currentOrder}
                  </p>
                )}
              </div>

              <div style={{ display: "flex", gap: 12 }}>
                <button
                  onClick={() => setSelectedTable(null)}
                  style={{
                    flex: 1,
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
                <button
                  style={{
                    flex: 1,
                    padding: "12px 16px",
                    backgroundColor: "#7C3AED",
                    color: "white",
                    border: "none",
                    borderRadius: 8,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Manage Order
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}