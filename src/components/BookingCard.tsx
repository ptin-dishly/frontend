import styles from "../pages/BookingPage.module.css";
import type { Booking } from "../services/api";

interface Props {
  booking: Booking;
  onClick?: () => void;
}

export default function BookingCard({ booking, onClick }: Props) {
  const statusClass = booking.status === "confirmed"
    ? styles.confirmed
    : booking.status === "pending"
    ? styles.pending
    : styles.cancelled;

  return (
    <div className={`${styles.card} ${statusClass}`} onClick={onClick}>
      <div className={styles.cardHeader}>
        <h3 className={styles.cardTitle}>{booking.name}</h3>
        <span className={styles.badge}>{booking.status}</span>
      </div>

      <p className={styles.cardText}>📅 {booking.date} at {booking.time}</p>
      <p className={styles.cardText}>👥 {booking.guests} guests</p>
      <p className={styles.cardText}>📞 {booking.phone}</p>

      {booking.specialRequests && (
        <p className={styles.cardNote}>✨ {booking.specialRequests}</p>
      )}
    </div>
  );
}
