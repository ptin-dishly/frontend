import { FaPlus, FaMinus } from "react-icons/fa";

type CounterInputProps = {
  value: number;
  onChange: (value: number) => void;
  min?: number;
};

export default function CounterInput({
  value,
  onChange,
  min = 0,
}: CounterInputProps) {
  const increment = () => {
    onChange(value + 1);
  };

  const decrement = () => {
    if (value > min) {
      onChange(value - 1);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        backgroundColor: "var(--color-white)",
        border: "1px solid #d9d9d9",
        borderRadius: 999,
        padding: "6px 10px",
        width: "fit-content",
      }}
    >
      {/* Botó - */}
      <button
        onClick={decrement}
        style={{
          border: "none",
          background: "transparent",
          cursor: "pointer",
          color: "var(--color-dark-blue)",
        }}
      >
        <FaMinus />
      </button>

      {/* Valor */}
      <span
        style={{
          minWidth: 20,
          textAlign: "center",
          fontWeight: "bold",
        }}
      >
        {value}
      </span>

      {/* Botó + */}
      <button
        onClick={increment}
        style={{
          border: "none",
          background: "transparent",
          cursor: "pointer",
          color: "var(--color-dark-blue)",
        }}
      >
        <FaPlus />
      </button>
    </div>
  );
}