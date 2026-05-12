import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";

import { getCurrentUser } from "../utils/storage";
import { bookingService, type Booking } from "../services/api";
import MenuBar from "../components/MenuBar";
import SearchBar from "../components/SearchBar";
import SelectDropdown from "../components/SelectDropdown";
import BookingCard from "../components/BookingCard";
import styles from "./BookingPage.module.css";

export default function BookingsPage() {
  const user = getCurrentUser();
  const userRole = (user?.role || "admin") as "admin" | "kitchen" | "waiter" | "sales";
  const { t } = useTranslation();

  if (!["admin", "sales"].includes(userRole)) {
    return (
      <div style={{ display: "flex", minHeight: "100vh" }}>
        <MenuBar role={userRole} />
        <main style={{ flex: 1, padding: "40px 48px", textAlign: "center" }}>
          <p style={{ fontSize: "16px", color: "#6B7280" }}>
            {t("bookings.accessDenied")}
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

  /*
  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed": return "#22C55E";
      case "pending": return "#F59E0B";
      case "cancelled": return "#EF4444";
      default: return "#6B7280";
    }
  };
  */

  const selectedBooking = bookings.find((b) => b.id === selectedBookingId);

  const updateBookingStatus = async (bookingId: string, newStatus: Booking["status"]) => {
    try {
      const res = await bookingService.updateStatus(bookingId, newStatus);
      if (res.success && res.data) {
        setBookings((prevBookings) =>
          prevBookings.map((booking) => (booking.id === bookingId ? res.data! : booking))
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

      <main style={{ flex: 1, padding: "40px 48px" }}>
        <div style={{ marginBottom: 30 }}>
          <h1 style={{ fontSize: 32, color: "#0F172A", margin: 0 }}>{t("bookings.title")}</h1>
        </div>

        {error && (
          <div style={{ backgroundColor: "#FEE2E2", color: "#DC2626", padding: "16px", borderRadius: "8px", marginBottom: "24px", fontSize: "14px" }}>
            ⚠️ {error}
          </div>
        )}

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 44, gap: 24, flexWrap: "wrap" }}>
          <div style={{ maxWidth: 420, width: "100%" }}>
            <SearchBar value={searchTerm} onChange={setSearchTerm} placeholder={t("bookings.searchPlaceholder")} />
          </div>

          <SelectDropdown
            options={[
              { label: t("bookings.allStatus"), value: "" },
              { label: t("bookings.confirmed"), value: "confirmed" },
              { label: t("bookings.pending"), value: "pending" },
              { label: t("bookings.cancelled"), value: "cancelled" },
            ]}
            value={filterStatus}
            onChange={setFilterStatus}
            placeholder={t("bookings.allStatus")}
          />
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "60px 20px", color: "#6B7280" }}>
            <p>{t("bookings.loading")}</p>
          </div>
        ) : (
          <div className={styles.grid}>
            {filteredBookings.length === 0 ? (
              <p style={{ gridColumn: "1 / -1", textAlign: "center", color: "#6B7280" }}>
                {t("bookings.notFound")}
              </p>
            ) : (
              filteredBookings.map((booking) => (
                <BookingCard
                  key={booking.id}
                  booking={booking}
                  onClick={() => setSelectedBookingId(booking.id)}
                />
              ))
            )}
          </div>
        )}

        {selectedBooking && (
          <div
            style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}
            onClick={() => setSelectedBookingId(null)}
          >
            <div
              style={{ backgroundColor: "white", borderRadius: 16, padding: 32, maxWidth: 600, width: "90%" }}
              onClick={(e) => e.stopPropagation()}
            >
              <h2 style={{ margin: "0 0 20px", color: "#0F172A" }}>
                {t("bookings.bookingTitle", { id: selectedBooking.id })}
              </h2>

              <div style={{ marginBottom: 20 }}>
                <p style={{ color: "#6B7280", fontSize: 14 }}><strong>{t("bookings.nameLabel")}</strong> {selectedBooking.name}</p>
                <p style={{ color: "#6B7280", fontSize: 14 }}><strong>{t("bookings.emailLabel")}</strong> {selectedBooking.email}</p>
                <p style={{ color: "#6B7280", fontSize: 14 }}><strong>{t("bookings.phoneLabel")}</strong> {selectedBooking.phone}</p>
                <p style={{ color: "#6B7280", fontSize: 14 }}><strong>{t("bookings.dateLabel")}</strong> {selectedBooking.date}</p>
                <p style={{ color: "#6B7280", fontSize: 14 }}><strong>{t("bookings.timeLabel")}</strong> {selectedBooking.time}</p>
                <p style={{ color: "#6B7280", fontSize: 14 }}><strong>{t("bookings.guestsLabel")}</strong> {selectedBooking.guests}</p>
                {selectedBooking.specialRequests && (
                  <p style={{ color: "#6B7280", fontSize: 14 }}>
                    <strong>{t("bookings.specialRequestsLabel")}</strong> {selectedBooking.specialRequests}
                  </p>
                )}
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {selectedBooking.status !== "confirmed" && (
                  <button onClick={() => updateBookingStatus(selectedBooking.id, "confirmed")} style={{ padding: "12px 16px", backgroundColor: "#22C55E", color: "white", border: "none", borderRadius: 8, fontWeight: 600, cursor: "pointer" }}>
                    {t("bookings.confirmBooking")}
                  </button>
                )}
                {selectedBooking.status !== "pending" && (
                  <button onClick={() => updateBookingStatus(selectedBooking.id, "pending")} style={{ padding: "12px 16px", backgroundColor: "#F59E0B", color: "white", border: "none", borderRadius: 8, fontWeight: 600, cursor: "pointer" }}>
                    {t("bookings.markPending")}
                  </button>
                )}
                {selectedBooking.status !== "cancelled" && (
                  <button onClick={() => updateBookingStatus(selectedBooking.id, "cancelled")} style={{ padding: "12px 16px", backgroundColor: "#EF4444", color: "white", border: "none", borderRadius: 8, fontWeight: 600, cursor: "pointer" }}>
                    {t("bookings.cancelBooking")}
                  </button>
                )}
                <button onClick={() => setSelectedBookingId(null)} style={{ padding: "12px 16px", backgroundColor: "#E5E7EB", border: "none", borderRadius: 8, fontWeight: 600, cursor: "pointer" }}>
                  {t("common.close")}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
