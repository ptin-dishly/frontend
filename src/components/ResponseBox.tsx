import React from "react";

interface ResponseBoxProps {
  result: unknown;
}

export default function ResponseBox({ result }: ResponseBoxProps) {
  if (result === null) return null;

  const isError =
    typeof result === "object" &&
    result !== null &&
    "success" in result &&
    (result as any).success === false;

  return (
    <pre
      style={{
        marginTop: 12,
        padding: "12px 16px",
        borderRadius: 8,
        background: isError ? "#fff1f0" : "#f0fdf4",
        border: `1px solid ${isError ? "#fca5a5" : "#86efac"}`,
        color: isError ? "#b91c1c" : "#166534",
        fontSize: 13,
        overflowX: "auto",
        whiteSpace: "pre-wrap",
        wordBreak: "break-all",
        maxHeight: 320,
        overflowY: "auto",
      }}
    >
      {JSON.stringify(result, null, 2)}
    </pre>
  );
}