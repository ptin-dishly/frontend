import { useState } from "react";
import { FaChevronDown } from "react-icons/fa";

type Option = {
  label: string;
  value: string;
};

type SelectDropdownProps = {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

export default function SelectDropdown({
  options,
  value,
  onChange,
  placeholder = "Select...",
}: SelectDropdownProps) {
  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <div style={{ position: "relative", width: 220 }}>
      
      {/* Botón principal */}
      <div
        onClick={() => setOpen(!open)}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "10px 14px",
          backgroundColor: "var(--color-white)",
          border: "1px solid #d9d9d9",
          borderRadius: 999,
          cursor: "pointer",
        }}
      >
        <span style={{ color: "var(--color-dark-blue)" }}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>

        <FaChevronDown
          style={{
            fontSize: 12,
            color: "var(--color-dark-blue)",
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
            transition: "0.2s",
          }}
        />
      </div>

      {/* Opciones */}
      {open && (
        <div
          style={{
            position: "absolute",
            top: "110%",
            left: 0,
            width: "100%",
            backgroundColor: "var(--color-white)",
            border: "1px solid #d9d9d9",
            borderRadius: 10,
            boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
            zIndex: 10,
          }}
        >
          {options.map((option) => (
            <div
              key={option.value}
              onClick={() => {
                onChange(option.value);
                setOpen(false);
              }}
              onMouseEnter={() => setHovered(option.value)}
              onMouseLeave={() => setHovered(null)}
              style={{
                padding: 10,
                cursor: "pointer",
                backgroundColor:
                  hovered === option.value
                    ? "rgba(0,0,0,0.05)"
                    : "transparent",
                transition: "0.2s",
              }}
            >
              {option.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}