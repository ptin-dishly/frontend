
interface BigButtonProps {
  label: string;
  value?: string | number;
  variant?: "navy" | "green";
  onClick?: () => void;
}

export default function BigButton({
  label,
  value,
  variant = "navy",
  onClick,
}: BigButtonProps) {
  const isClickable = !!onClick;
  const bgColor = variant === "green" ? "#F0FDF4" : "#F8FAFC";
  const borderColor = variant === "green" ? "#22C55E" : "#E2E8F0";
  const accentColor = variant === "green" ? "#22C55E" : "#7C3AED";
  const labelColor = "#6B7280";
  const valueColor = variant === "green" ? "#15803D" : "#0F172A";

  return (
    <div
      onClick={onClick}
      role={isClickable ? "button" : undefined}
      tabIndex={isClickable ? 0 : undefined}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        padding: "20px 28px",
        minWidth: 200,
        borderRadius: 16,
        border: `1.5px solid ${borderColor}`,
        backgroundColor: bgColor,
        boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
        cursor: isClickable ? "pointer" : "default",
        transition: "box-shadow 0.2s",
        borderLeft: `4px solid ${accentColor}`,
      }}
      onMouseEnter={(e) => {
        if (isClickable) e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.12)";
      }}
      onMouseLeave={(e) => {
        if (isClickable) e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,0.06)";
      }}
    >
      <span style={{ fontSize: 12, fontWeight: 600, color: labelColor, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>
        {label}
      </span>
      {value !== undefined && (
        <span style={{ fontSize: 36, fontWeight: 700, color: valueColor, lineHeight: 1 }}>
          {value}
        </span>
      )}
    </div>
  );
}
