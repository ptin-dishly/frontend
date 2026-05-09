import React, { useMemo, useState } from "react";
import AlergenFilter from "../components/AlergenFilter";
import BackButton from "../components/BackButton";
import BigButton from "../components/BigButton";
import Btn from "../components/Btn";
import Button from "../components/Button";
import ConjuntButton from "../components/ConjuntButton";
import CounterInput from "../components/CounterInput";
import DeleteButton from "../components/DeleteButton";
import DishCard from "../components/DishCard";
import IngredientCard from "../components/IngredientCard";
import Logo from "../components/Logo";
import MenuBar from "../components/MenuBar";
import NewIngredientCard from "../components/NewIngredientCard";
import Notification from "../components/Notification";
import OrderCard from "../components/OrderCard";
import OrderSidebar from "../components/OrderSidebar";
import { ProtectedRoute } from "../components/ProtectedRoute";
import ResponseBox from "../components/ResponseBox";
import SearchBar from "../components/SearchBar";
import SelectDropdown from "../components/SelectDropdown";
import TicketCard from "../components/TicketCard";
import UserProfile from "../components/UserProfile";
import sampleImage from "../assets/imagen.png";

function PreviewCard({ name, children }: { name: string; children: React.ReactNode }) {
  return (
    <section
      style={{
        background: "#ffffff",
        border: "1px solid #e2e8f0",
        borderRadius: 16,
        padding: 16,
        minHeight: 220,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        gap: 16,
      }}
    >
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 140 }}>
        {children}
      </div>

      <p
        style={{
          margin: 0,
          fontSize: 13,
          fontWeight: 700,
          color: "#334155",
          textAlign: "center",
        }}
      >
        {name}
      </p>
    </section>
  );
}

export default function TestPage() {
  const [search, setSearch] = useState("Pasta");
  const [selectedOption, setSelectedOption] = useState("admin");
  const [counter, setCounter] = useState(2);
  const [orderSidebarOpen, setOrderSidebarOpen] = useState(false);
  const [excludedAllergens, setExcludedAllergens] = useState<string[]>([]);
  const [orderItems, setOrderItems] = useState([
    { id: "1", name: "Lasaña", price: 12.5, quantity: 1 },
    { id: "2", name: "Ensalada", price: 7.9, quantity: 2 },
  ]);

  const selectOptions = useMemo(
    () => [
      { label: "Admin", value: "admin" },
      { label: "Kitchen", value: "kitchen" },
      { label: "Waiter", value: "waiter" },
      { label: "Sales", value: "sales" },
    ],
    [],
  );

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f8fafc",
        padding: "24px 20px 48px",
        color: "#0f172a",
      }}
    >
      <header style={{ marginBottom: 20 }}>
        <h1 style={{ margin: 0, fontSize: 28 }}>Component Test Page</h1>
        <p style={{ margin: "8px 0 0", color: "#475569" }}>
          Visual sandbox for all components under <strong>src/components</strong>
        </p>
      </header>

      <div
        style={{
          display: "grid",
          gap: 16,
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          alignItems: "stretch",
        }}
      >
        <PreviewCard name="AlergenFilter">
          <AlergenFilter onAllergenChange={setExcludedAllergens} />
        </PreviewCard>

        <PreviewCard name="BackButton">
          <BackButton label="Back" />
        </PreviewCard>

        <PreviewCard name="BigButton">
          <BigButton label="Pending Orders" value={8} variant="green" onClick={() => undefined} />
        </PreviewCard>

        <PreviewCard name="Btn">
          <Btn onClick={() => undefined}>Action</Btn>
        </PreviewCard>

        <PreviewCard name="Button">
          <Button onClick={() => undefined} variant="secondary">
            Secondary Button
          </Button>
        </PreviewCard>

        <PreviewCard name="ConjuntButton">
          <ConjuntButton />
        </PreviewCard>

        <PreviewCard name="CounterInput">
          <CounterInput value={counter} onChange={setCounter} />
        </PreviewCard>

        <PreviewCard name="DeleteButton">
          <DeleteButton onClick={() => undefined} />
        </PreviewCard>

        <PreviewCard name="DishCard">
          <DishCard name="Paella" image={sampleImage} />
        </PreviewCard>

        <PreviewCard name="IngredientCard">
          <IngredientCard
            category="Vegetables"
            name="Tomato"
            image={sampleImage}
            quantity="4 kg"
            expiration="Expires in 3 days"
          />
        </PreviewCard>

        <PreviewCard name="Logo">
          <Logo />
        </PreviewCard>

        <PreviewCard name="MenuBar">
          <div style={{ width: 250 }}>
            <MenuBar role="admin" fixed={false} />
          </div>
        </PreviewCard>

        <PreviewCard name="NewIngredientCard">
          <NewIngredientCard onClick={() => undefined} />
        </PreviewCard>

        <PreviewCard name="Notification">
          <Notification />
        </PreviewCard>

        <PreviewCard name="OrderCard">
          <OrderCard
            orderId="024"
            tableNumber="12"
            items={[
              { name: "Pasta Carbonara", quantity: 1, price: 13.9 },
              { name: "Water", quantity: 2, price: 2.0 },
            ]}
            total={17.9}
          />
        </PreviewCard>

        <PreviewCard name="OrderSidebar">
          <button
            type="button"
            style={{
              padding: "10px 16px",
              borderRadius: 10,
              border: "1px solid #cbd5e1",
              cursor: "pointer",
              background: "#ffffff",
            }}
            onClick={() => setOrderSidebarOpen(true)}
          >
            Open OrderSidebar Preview
          </button>
        </PreviewCard>

        <PreviewCard name="ProtectedRoute">
          <ProtectedRoute>
            <div style={{ padding: 10, borderRadius: 8, background: "#dcfce7", color: "#166534" }}>
              Protected content preview
            </div>
          </ProtectedRoute>
        </PreviewCard>

        <PreviewCard name="ResponseBox">
          <ResponseBox
            result={{
              success: true,
              selectedOption,
              search,
              excludedAllergens,
            }}
          />
        </PreviewCard>

        <PreviewCard name="SearchBar">
          <SearchBar value={search} onChange={setSearch} placeholder="Search ingredient..." />
        </PreviewCard>

        <PreviewCard name="SelectDropdown">
          <SelectDropdown options={selectOptions} value={selectedOption} onChange={setSelectedOption} />
        </PreviewCard>

        <PreviewCard name="TicketCard">
          <TicketCard
            ticketId="T-001"
            orderId="024"
            tableNumber="12"
            items={[
              { name: "Pasta Carbonara", quantity: 1, price: 13.9 },
              { name: "Water", quantity: 2, price: 2.0 },
            ]}
            total={17.9}
            paymentMethod="Card"
            paymentDate="09/05/2026 14:30"
          />
        </PreviewCard>

        <PreviewCard name="UserProfile">
          <div style={{ width: 260, background: "#0f172a", borderRadius: 12, padding: 8 }}>
            <UserProfile />
          </div>
        </PreviewCard>
      </div>

      {orderSidebarOpen && (
        <OrderSidebar
          orderId="024"
          items={orderItems}
          onClose={() => setOrderSidebarOpen(false)}
          onDelete={(id) => setOrderItems((prev) => prev.filter((item) => item.id !== id))}
          onQuantityChange={(id, quantity) =>
            setOrderItems((prev) =>
              prev.map((item) => (item.id === id ? { ...item, quantity } : item)),
            )
          }
        />
      )}
    </div>
  );
}
