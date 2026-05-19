import { HiOutlinePrinter } from "react-icons/hi2";

interface PrintButtonProps {
  onPrint: () => void;
}

export default function PrintButton({ onPrint }: PrintButtonProps) {
  return (
    <button
      type="button"
      onClick={onPrint}

      aria-label="Print order"
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        padding: "10px 14px",
        borderRadius: 8,
        border: "1px solid #E5E7EB",
        backgroundColor: "#FFFFFF",
        color: "#0F172A",
        cursor: "pointer",
        fontFamily: "'Commissioner', sans-serif",
        fontSize: 14,
        fontWeight: 600,
        transition: "background-color 0.2s ease, border-color 0.2s ease",
      }}
    >
      <HiOutlinePrinter style={{ fontSize: 18 }} />
      Print
    </button>
  );
}