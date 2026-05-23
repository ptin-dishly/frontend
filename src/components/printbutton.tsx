import { HiOutlinePrinter } from "react-icons/hi2";

interface PrintButtonProps {
  onPrint: () => void;
  label?: string;
}

export default function PrintButton({ onPrint, label = "Print" }: PrintButtonProps) {
  return (
    <button
      type="button"
      onClick={onPrint}

      aria-label="Print order"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        width: "100%",
        padding: "12px 20px",
        borderRadius: 10,
        border: "none",
        backgroundColor: "#111827",
        color: "white",
        cursor: "pointer",
        fontFamily: "'Commissioner', sans-serif",
        fontSize: 14,
        fontWeight: 600,
        transition: "background-color 0.2s ease, transform 0.2s ease",
      }}
    >
      <HiOutlinePrinter style={{ fontSize: 18 }} />
      {label}
    </button>
  );
}