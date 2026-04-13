import React, { useState } from "react";
import { allergenService, sessionService, type Allergen } from "../services/api";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: { code: string; message: string; details?: Record<string, unknown> };
  meta?: { timestamp: string };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function authHeaders(token: string | null): Record<string, string> {
  const h: Record<string, string> = { "Content-Type": "application/json" };
  if (token) h["Authorization"] = `Bearer ${token}`;
  return h;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ResponseBox({ result }: { result: unknown }) {
  if (result === null) return null;
  const isError =
    typeof result === "object" &&
    result !== null &&
    "success" in result &&
    (result as ApiResponse).success === false;

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

function SectionTitle({ title, tag }: { title: string; tag: string }) {
  const tagColors: Record<string, string> = {
    GET: "#16a34a",
    POST: "#2563eb",
    DELETE: "#dc2626",
    PUT: "#d97706",
  };
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
      <span
        style={{
          background: tagColors[tag] ?? "#64748b",
          color: "#fff",
          fontWeight: 700,
          fontSize: 11,
          padding: "2px 8px",
          borderRadius: 4,
          letterSpacing: 1,
        }}
      >
        {tag}
      </span>
      <h2 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>{title}</h2>
    </div>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #e2e8f0",
        borderRadius: 12,
        padding: 20,
        marginBottom: 16,
        boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
      }}
    >
      {children}
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <label style={{ display: "block", marginBottom: 8 }}>
      <span style={{ fontSize: 12, fontWeight: 600, color: "#475569" }}>{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          display: "block",
          width: "100%",
          marginTop: 4,
          padding: "8px 10px",
          borderRadius: 6,
          border: "1px solid #cbd5e1",
          fontSize: 13,
          boxSizing: "border-box",
          outline: "none",
        }}
      />
    </label>
  );
}

function Btn({
  onClick,
  loading,
  children,
  color = "#2563eb",
}: {
  onClick: () => void;
  loading: boolean;
  children: React.ReactNode;
  color?: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      style={{
        marginTop: 8,
        padding: "8px 18px",
        background: loading ? "#94a3b8" : color,
        color: "#fff",
        border: "none",
        borderRadius: 6,
        fontSize: 13,
        fontWeight: 600,
        cursor: loading ? "not-allowed" : "pointer",
        transition: "background 0.15s",
      }}
    >
      {loading ? "Carregant…" : children}
    </button>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AllergensTestPage() {
  const [accessToken, setAccessToken] = useState("");
  const [refreshToken, setRefreshToken] = useState("");

  // ── Sessions ──
  const [loginEmail, setLoginEmail] = useState("marc@calblay.cat");
  const [loginPassword, setLoginPassword] = useState("secret123");
  const [loginResult, setLoginResult] = useState<unknown>(null);
  const [loginLoading, setLoginLoading] = useState(false);

  const [refreshInput, setRefreshInput] = useState("");
  const [refreshResult, setRefreshResult] = useState<unknown>(null);
  const [refreshLoading, setRefreshLoading] = useState(false);

  const [logoutResult, setLogoutResult] = useState<unknown>(null);
  const [logoutLoading, setLogoutLoading] = useState(false);

  // ── Allergens ──
  const [listResult, setListResult] = useState<unknown>(null);
  const [listLoading, setListLoading] = useState(false);

  const [searchQ, setSearchQ] = useState("");
  const [searchResult, setSearchResult] = useState<unknown>(null);
  const [searchLoading, setSearchLoading] = useState(false);

  const [getIdInput, setGetIdInput] = useState("");
  const [getResult, setGetResult] = useState<unknown>(null);
  const [getLoading, setGetLoading] = useState(false);

  const [getByEuNumberInput, setGetByEuNumberInput] = useState("");
  const [getByEuNumberResult, setGetByEuNumberResult] = useState<unknown>(null);
  const [getByEuNumberLoading, setGetByEuNumberLoading] = useState(false);


  const [createForm, setCreateForm] = useState({
    code: "GLU",
    nameEs: "Gluten",
    nameCa: "Gluten",
    nameEn: "Gluten",
    euNumber: "1",
    iconUrl: "",
    description: "",
  });
  const [createResult, setCreateResult] = useState<unknown>(null);
  const [createLoading, setCreateLoading] = useState(false);

  const [deleteIdInput, setDeleteIdInput] = useState("");
  const [deleteResult, setDeleteResult] = useState<unknown>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // ── Handlers ──

  async function handleLogin() {
    setLoginLoading(true);
    try {
      const json = await sessionService.login(loginEmail, loginPassword);
      setLoginResult(json);
      if (json.success && json.data) {
        localStorage.setItem("accessToken", json.data.accessToken);
        localStorage.setItem("refreshToken", json.data.refreshToken);
        setAccessToken(json.data.accessToken);
        setRefreshToken(json.data.refreshToken);
        setRefreshInput(json.data.refreshToken);
      }
    } catch (e) {
      setLoginResult({ success: false, error: { code: "ERROR", message: String(e) } });
    } finally {
      setLoginLoading(false);
    }
  }

  async function handleRefresh() {
    setRefreshLoading(true);
    try {
      const json = await sessionService.refresh(refreshInput || refreshToken);
      setRefreshResult(json);
      if (json.success && json.data) {
        localStorage.setItem("accessToken", json.data.accessToken);
        localStorage.setItem("refreshToken", json.data.refreshToken);
        setAccessToken(json.data.accessToken);
        setRefreshToken(json.data.refreshToken);
        setRefreshInput(json.data.refreshToken);
      }
    } catch (e) {
      setRefreshResult({ success: false, error: { code: "ERROR", message: String(e) } });
    } finally {
      setRefreshLoading(false);
    }
  }

  async function handleLogout() {
    setLogoutLoading(true);
    try {
      const json = await sessionService.logout();
      setLogoutResult(json);
      if (json.success) {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        setAccessToken("");
        setRefreshToken("");
      }
    } catch (e) {
      setLogoutResult({ success: false, error: { code: "ERROR", message: String(e) } });
    } finally {
      setLogoutLoading(false);
    }
  }

  async function handleList() {
    setListLoading(true);
    try {
      const json = await allergenService.list();
      setListResult(json);
    } catch (e) {
      setListResult({ success: false, error: { code: "ERROR", message: String(e) } });
    } finally {
      setListLoading(false);
    }
  }

  async function handleSearch() {
    setSearchLoading(true);
    try {
      const json = await allergenService.search(searchQ);
      setSearchResult(json);
    } catch (e) {
      setSearchResult({ success: false, error: { code: "ERROR", message: String(e) } });
    } finally {
      setSearchLoading(false);
    }
  }

  async function handleGetById() {
    setGetLoading(true);
    try {
      const json = await allergenService.getById(getIdInput);
      setGetResult(json);
    } catch (e) {
      setGetResult({ success: false, error: { code: "ERROR", message: String(e) } });
    } finally {
      setGetLoading(false);
    }
  }

  async function handleGetByEuNumber() {
    setGetByEuNumberLoading(true);
    try {
      const json = await allergenService.getByEuNumber(parseInt(getByEuNumberInput, 10));
      setGetByEuNumberResult(json);
    } catch (e) {
      setGetByEuNumberResult({ success: false, error: { code: "ERROR", message: String(e) } });
    } finally {
      setGetByEuNumberLoading(false);
    }
  }

  async function handleCreate() {
    setCreateLoading(true);
    try {
      const json = await allergenService.create({
        code: createForm.code,
        nameEs: createForm.nameEs,
        nameCa: createForm.nameCa,
        nameEn: createForm.nameEn,
        euNumber: parseInt(createForm.euNumber, 10),
        iconUrl: createForm.iconUrl || null,
        description: createForm.description || null,
      });
      setCreateResult(json);
      if (json.success && json.data) {
        setGetIdInput(json.data.id);
        setDeleteIdInput(json.data.id);
      }
    } catch (e) {
      setCreateResult({ success: false, error: { code: "ERROR", message: String(e) } });
    } finally {
      setCreateLoading(false);
    }
  }

  async function handleDelete() {
    setDeleteLoading(true);
    try {
      const json = await allergenService.delete(deleteIdInput);
      setDeleteResult(json);
    } catch (e) {
      setDeleteResult({ success: false, error: { code: "ERROR", message: String(e) } });
    } finally {
      setDeleteLoading(false);
    }
  }

  // ── Render ──

  return (
    <div
      style={{
        fontFamily: "'Inter', system-ui, sans-serif",
        background: "#f8fafc",
        minHeight: "100vh",
        padding: "32px 16px",
      }}
    >
      <div style={{ maxWidth: 760, margin: "0 auto" }}>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ margin: 0, fontSize: 26, fontWeight: 700, color: "#0f172a" }}>
            🍽️ Dishly — API Test Page
          </h1>
          <p style={{ margin: "6px 0 0", color: "#64748b", fontSize: 14 }}>
            Prova dels endpoints de l'API v0.1.0 · Cal Blay
          </p>
        </div>

        <div
          style={{
            background: accessToken ? "#f0fdf4" : "#fef9c3",
            border: `1px solid ${accessToken ? "#86efac" : "#fde047"}`,
            borderRadius: 8,
            padding: "10px 16px",
            marginBottom: 24,
            fontSize: 13,
            color: accessToken ? "#166534" : "#854d0e",
          }}
        >
          {accessToken ? (
            <>
              ✅ <strong>Access token actiu</strong> ·{" "}
              <span style={{ fontFamily: "monospace" }}>
                {accessToken.slice(0, 30)}…
              </span>
            </>
          ) : (
            <>⚠️ Cap token actiu — fes login primer per als endpoints autenticats</>
          )}
        </div>

        <h2
          style={{
            fontSize: 13,
            fontWeight: 700,
            letterSpacing: 1,
            color: "#94a3b8",
            textTransform: "uppercase",
            marginBottom: 12,
          }}
        >
          Sessions
        </h2>

        <Card>
          <SectionTitle title="POST /sessions — Login" tag="POST" />
          <Input label="Email" value={loginEmail} onChange={setLoginEmail} placeholder="marc@calblay.cat" type="email" />
          <Input label="Password" value={loginPassword} onChange={setLoginPassword} placeholder="secret123" type="password" />
          <Btn onClick={handleLogin} loading={loginLoading} color="#2563eb">
            Login
          </Btn>
          <ResponseBox result={loginResult} />
        </Card>

        <Card>
          <SectionTitle title="PUT /sessions — Refresh token" tag="PUT" />
          <Input
            label="Refresh Token"
            value={refreshInput}
            onChange={setRefreshInput}
            placeholder="S'omple automàticament al fer login"
          />
          <Btn onClick={handleRefresh} loading={refreshLoading} color="#d97706">
            Refresh
          </Btn>
          <ResponseBox result={refreshResult} />
        </Card>

        <Card>
          <SectionTitle title="DELETE /sessions — Logout" tag="DELETE" />
          <p style={{ margin: "0 0 8px", fontSize: 13, color: "#64748b" }}>
            Requereix Authorization: Bearer &lt;accessToken&gt;
          </p>
          <Btn onClick={handleLogout} loading={logoutLoading} color="#dc2626">
            Logout
          </Btn>
          <ResponseBox result={logoutResult} />
        </Card>

        <h2
          style={{
            fontSize: 13,
            fontWeight: 700,
            letterSpacing: 1,
            color: "#94a3b8",
            textTransform: "uppercase",
            marginBottom: 12,
            marginTop: 24,
          }}
        >
          Al·lèrgens
        </h2>

        <Card>
          <SectionTitle title="GET /allergens — Llistar tots" tag="GET" />
          <p style={{ margin: "0 0 8px", fontSize: 13, color: "#64748b" }}>
            Retorna els 14 al·lèrgens regulats per la UE ordenats per número EU.
          </p>
          <Btn onClick={handleList} loading={listLoading} color="#16a34a">
            Llistar
          </Btn>
          <ResponseBox result={listResult} />
        </Card>

        <Card>
          <SectionTitle title="GET /allergens/search?q= — Cercar" tag="GET" />
          <Input
            label="Terme de cerca (mínim 2 caràcters)"
            value={searchQ}
            onChange={setSearchQ}
            placeholder="ex: Glu"
          />
          <Btn onClick={handleSearch} loading={searchLoading} color="#16a34a">
            Cercar
          </Btn>
          <ResponseBox result={searchResult} />
        </Card>

        <Card>
          <SectionTitle title="GET /allergens/:id — Obtenir per ID" tag="GET" />
          <Input
            label="UUID de l'al·lèrgen"
            value={getIdInput}
            onChange={setGetIdInput}
            placeholder="a1b2c3d4-e5f6-7890-abcd-ef1234567890"
          />
          <Btn onClick={handleGetById} loading={getLoading} color="#16a34a">
            Obtenir
          </Btn>
          <ResponseBox result={getResult} />
        </Card>
        
        <Card>
          <SectionTitle title="GET /allergens/by-eu-number?euNumber= — Obtenir per número EU" tag="GET" />
          <p style={{ margin: "0 0 8px", fontSize: 13, color: "#64748b" }}>
            Cercar per número EU (1–14)
          </p>
          <Input
            label="Número EU"
            value={getByEuNumberInput}
            onChange={setGetByEuNumberInput}
            placeholder="ex: 1, 7, 14..."
            type="number"
          />
          <Btn onClick={handleGetByEuNumber} loading={getByEuNumberLoading} color="#16a34a">
            Cercar per EU
          </Btn>
          <ResponseBox result={getByEuNumberResult} />
        </Card>

        <Card>
          <SectionTitle title="POST /allergens — Crear al·lèrgen" tag="POST" />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
            <Input
              label="Codi (màx 10 car.)"
              value={createForm.code}
              onChange={(v) => setCreateForm((f) => ({ ...f, code: v }))}
              placeholder="GLU"
            />
            <Input
              label="Número EU (1–14)"
              value={createForm.euNumber}
              onChange={(v) => setCreateForm((f) => ({ ...f, euNumber: v }))}
              placeholder="1"
              type="number"
            />
            <Input
              label="Nom en Espanyol"
              value={createForm.nameEs}
              onChange={(v) => setCreateForm((f) => ({ ...f, nameEs: v }))}
              placeholder="Gluten"
            />
            <Input
              label="Nom en Català"
              value={createForm.nameCa}
              onChange={(v) => setCreateForm((f) => ({ ...f, nameCa: v }))}
              placeholder="Gluten"
            />
            <Input
              label="Nom en Anglès"
              value={createForm.nameEn}
              onChange={(v) => setCreateForm((f) => ({ ...f, nameEn: v }))}
              placeholder="Gluten"
            />
            <Input
              label="Icon URL (opcional)"
              value={createForm.iconUrl}
              onChange={(v) => setCreateForm((f) => ({ ...f, iconUrl: v }))}
              placeholder="https://..."
            />
          </div>
          <Input
            label="Descripció (opcional)"
            value={createForm.description}
            onChange={(v) => setCreateForm((f) => ({ ...f, description: v }))}
            placeholder="Descripció opcional"
          />
          <Btn onClick={handleCreate} loading={createLoading} color="#2563eb">
            Crear
          </Btn>
          <ResponseBox result={createResult} />
        </Card>

        <Card>
          <SectionTitle title="DELETE /allergens/:id — Eliminar al·lèrgen" tag="DELETE" />
          <Input
            label="UUID de l'al·lèrgen"
            value={deleteIdInput}
            onChange={setDeleteIdInput}
            placeholder="a1b2c3d4-e5f6-7890-abcd-ef1234567890"
          />
          <Btn onClick={handleDelete} loading={deleteLoading} color="#dc2626">
            Eliminar
          </Btn>
          <ResponseBox result={deleteResult} />
        </Card>
      </div>
    </div>
  );
}