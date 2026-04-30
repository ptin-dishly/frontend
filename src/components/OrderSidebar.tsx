import CounterInput from "./CounterInput";
import DeleteButton from "./DeleteButton";
import sampleImage from "../assets/imagen.png";

type OrderItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
};

type OrderSidebarProps = {
  orderId: string;
  items: OrderItem[];
  onClose: () => void;
  onQuantityChange: (id: string, quantity: number) => void;
  onDelete: (id: string) => void;
};

export default function OrderSidebar({
  orderId,
  items,
  onClose,
  onQuantityChange,
  onDelete,
}: OrderSidebarProps) {
  const subtotal = items.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  const iva = subtotal * 0.21;
  const total = subtotal + iva;

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(15, 23, 42, 0.35)",
        zIndex: 3000,
        display: "flex",
        justifyContent: "flex-end",
      }}
    >
      <aside
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 380,
          height: "100vh",
          backgroundColor: "var(--color-white)",
          boxShadow: "-6px 0 20px rgba(0,0,0,0.15)",
          padding: 24,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          overflowY: "auto",
          boxSizing: "border-box",
        }}
      >
        <div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              marginBottom: 24,
            }}
          >
            <div>
              <h2 style={{ margin: 0 }}>Cashier:</h2>
              <p style={{ marginTop: 8, color: "var(--color-dark-blue)" }}>
                Marc Ortiz
              </p>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <h2 style={{ margin: 0 }}>#{orderId}</h2>

              <button
                onClick={onClose}
                type="button"
                style={{
                  border: "none",
                  background: "transparent",
                  cursor: "pointer",
                  fontSize: 24,
                  color: "var(--color-dark-blue)",
                }}
              >
                ×
              </button>
            </div>
          </div>

          <h2 style={{ marginBottom: 20 }}>Order Details</h2>

          {items.length === 0 ? (
            <p style={{ color: "var(--color-gray)" }}>
              Encara no hi ha plats afegits.
            </p>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  marginBottom: 18,
                }}
              >
                <img
                  src={sampleImage}
                  alt={item.name}
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: 10,
                    objectFit: "cover",
                  }}
                />

                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontWeight: 700 }}>{item.name}</p>
                  <p style={{ margin: "4px 0", fontSize: 12 }}>
                    {item.price.toFixed(2)}€ x {item.quantity}
                  </p>

                  <CounterInput
                    value={item.quantity}
                    onChange={(value) => onQuantityChange(item.id, value)}
                  />
                </div>

                <DeleteButton onClick={() => onDelete(item.id)} />
              </div>
            ))
          )}
        </div>

        <div>
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <strong>Subtotal</strong>
              <span>{subtotal.toFixed(2)}€</span>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <strong>IVA 21% (inc.)</strong>
              <span>{iva.toFixed(2)}€</span>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: 18,
                fontWeight: 700,
              }}
            >
              <span>Total</span>
              <span>{total.toFixed(2)}€</span>
            </div>
          </div>

          <button
            style={{
              width: "100%",
              padding: "14px",
              border: "none",
              borderRadius: 12,
              backgroundColor: "var(--color-green)",
              color: "white",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Send order
          </button>
        </div>
      </aside>
    </div>
  );
}