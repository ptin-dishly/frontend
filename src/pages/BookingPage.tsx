import React, { useState, useEffect } from "react";
import { getCurrentUser } from "../utils/storage";
import { bookingService, type Booking } from "../services/api";
import MenuBar from "../components/MenuBar";
import SearchBar from "../components/SearchBar";
import SelectDropdown from "../components/SelectDropdown";

export default function BookingsPage() {
  const user = getCurrentUser();
  const userRole = (user?.role || "admin") as "admin" | "kitchen" | "waiter" | "sales";

  if (!["admin", "sales"].includes(userRole)) {
    return (
      <div style={{ display: "flex", minHeight: "100vh" }}>
        <MenuBar role={userRole} />
        <main style={{ flex: 1, padding: "40px 20px", textAlign: "center" }}>
          <p style={{ fontSize: "16px", color: "#6B7280" }}>
            Access denied. This page is only available for admin and sales roles.
          </p>
        </main>
      </div>
    );
  }

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBookings = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await bookingService.getAll();
        if (res.success && res.data) {
          setBookings(res.data);
        }
      } catch (err) {
        console.error("Error fetching bookings:", err);
        setError("Failed to load bookings");
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  const filteredBookings = bookings.filter((booking) => {
    const matchesStatus = !filterStatus || booking.status === filterStatus;
    const matchesSearch =
      !searchTerm ||
      booking.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.email.includes(searchTerm) ||
      booking.phone.includes(searchTerm) ||
      booking.id.includes(searchTerm);
    return matchesStatus && matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "#22C55E";
      case "pending":
        return "#F59E0B";
      case "cancelled":
        return "#EF4444";
      default:
        return "#6B7280";
    }
  };

  const selectedBooking = bookings.find((b) => b.id === selectedBookingId);

  const updateBookingStatus = async (
    bookingId: string,
    newStatus: Booking["status"]
  ) => {
    try {
      const res = await bookingService.updateStatus(bookingId, newStatus);
      if (res.success && res.data) {
        setBookings((prevBookings) =>
          prevBookings.map((booking) =>
            booking.id === bookingId ? res.data! : booking
          )
        );
        setSelectedBookingId(null);
      }
    } catch (err) {
      console.error("Error updating booking status:", err);
    }
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <MenuBar role={userRole} />

      <main style={{ flex: 1, padding: "48px 56px", maxWidth: 1400, margin: "0 auto" }}>
        <div style={{ marginBottom: 30 }}>
          <h1 style={{ fontSize: 32, color: "#0F172A", margin: 0 }}>Bookings</h1>
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
              placeholder="Search bookings..."
            />
          </div>

          <SelectDropdown
            options={[
              { label: "All Status", value: "" },
              { label: "Confirmed", value: "confirmed" },
              { label: "Pending", value: "pending" },
              { label: "Cancelled", value: "cancelled" },
            ]}
            value={filterStatus}
            onChange={setFilterStatus}
            placeholder="Filter by status"
          />
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "60px 20px", color: "#6B7280" }}>
            <p>Loading bookings...</p>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))",
              gap: 20,
            }}
          >
            {filteredBookings.length === 0 ? (
              <p style={{ gridColumn: "1 / -1", textAlign: "center", color: "#6B7280" }}>
                No bookings found
              </p>
            ) : (
              filteredBookings.map((booking) => (
                <div
                  key={booking.id}
                  onClick={() => setSelectedBookingId(booking.id)}
                  style={{
                    backgroundColor: "white",
                    borderRadius: 12,
                    padding: 20,
                    border: `2px solid ${getStatusColor(booking.status)}`,
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
                      {booking.name}
                    </h3>
                    <span
                      style={{
                        backgroundColor: getStatusColor(booking.status),
                        color: "white",
                        padding: "4px 12px",
                        borderRadius: 20,
                        fontSize: 12,
                        fontWeight: 600,
                        textTransform: "capitalize",
                      }}
                    >
                      {booking.status}
                    </span>
                  </div>

                  <p style={{ margin: "8px 0", color: "#6B7280", fontSize: 14 }}>
                    📅 {booking.date} at {booking.time}
                  </p>

                  <p style={{ margin: "8px 0", color: "#6B7280", fontSize: 14 }}>
                    👥 {booking.guests} guests
                  </p>

                  <p style={{ margin: "8px 0", color: "#6B7280", fontSize: 14 }}>
                    📞 {booking.phone}
                  </p>

                  {booking.specialRequests && (
                    <p style={{ margin: "8px 0", color: "#7C3AED", fontSize: 13, fontStyle: "italic" }}>
                      ✨ {booking.specialRequests}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {selectedBooking && (
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
            onClick={() => setSelectedBookingId(null)}
          >
            <div
              style={{
                backgroundColor: "white",
                borderRadius: 16,
                padding: 32,
                maxWidth: 600,
                width: "90%",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <h2 style={{ margin: "0 0 20px", color: "#0F172A" }}>
                Booking #{selectedBooking.id}
              </h2>

              <div style={{ marginBottom: 20 }}>
                <p style={{ color: "#6B7280", fontSize: 14 }}>
                  <strong>Name:</strong> {selectedBooking.name}
                </p>
                <p style={{ color: "#6B7280", fontSize: 14 }}>
                  <strong>Email:</strong> {selectedBooking.email}
                </p>
                <p style={{ color: "#6B7280", fontSize: 14 }}>
                  <strong>Phone:</strong> {selectedBooking.phone}
                </p>
                <p style={{ color: "#6B7280", fontSize: 14 }}>
                  <strong>Date:</strong> {selectedBooking.date}
                </p>
                <p style={{ color: "#6B7280", fontSize: 14 }}>
                  <strong>Time:</strong> {selectedBooking.time}
                </p>
                <p style={{ color: "#6B7280", fontSize: 14 }}>
                  <strong>Guests:</strong> {selectedBooking.guests}
                </p>
                {selectedBooking.specialRequests && (
                  <p style={{ color: "#6B7280", fontSize: 14 }}>
                    <strong>Special Requests:</strong> {selectedBooking.specialRequests}
                  </p>
                )}
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {selectedBooking.status !== "confirmed" && (
                  <button
                    onClick={() => updateBookingStatus(selectedBooking.id, "confirmed")}
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
                    Confirm Booking
                  </button>
                )}

                {selectedBooking.status !== "pending" && (
                  <button
                    onClick={() => updateBookingStatus(selectedBooking.id, "pending")}
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

                {selectedBooking.status !== "cancelled" && (
                  <button
                    onClick={() => updateBookingStatus(selectedBooking.id, "cancelled")}
                    style={{
                      padding: "12px 16px",
                      backgroundColor: "#EF4444",
                      color: "white",
                      border: "none",
                      borderRadius: 8,
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    Cancel Booking
                  </button>
                )}

                <button
                  onClick={() => setSelectedBookingId(null)}
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