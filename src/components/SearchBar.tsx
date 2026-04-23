import { FaSearch } from "react-icons/fa";

type SearchBarProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

export default function SearchBar({
  value,
  onChange,
  placeholder = "Search...",
}: SearchBarProps) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        width: 320,
        height: 42,
        padding: "0 14px",
        backgroundColor: "var(--color-white)",
        border: "1px solid #d9d9d9",
        borderRadius: 999,
      }}
    >
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          border: "none",
          outline: "none",
          width: "100%",
          fontSize: 14,
          background: "transparent",
          color: "var(--color-dark-blue)",
        }}
      />
      <FaSearch color="var(--color-dark-blue)" />
    </div>
  );
}