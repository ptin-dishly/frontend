// ─────────────────────────────────────────────────────────────────────────────
// FITXER: src/components/FloorMapSection.tsx
//
// Mapa 2D interactiu integrat al Dashboard.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useRef, useEffect, useCallback } from "react";
import { getAccessToken } from "../utils/storage";

// ─────────────────────────────────────────────────────────────────────────────
// TIPUS LOCALS (mapa)
// ─────────────────────────────────────────────────────────────────────────────

interface Chair {
  id: string;
  angle?: number;
  side?: "top" | "bottom" | "left" | "right";
  pos?: number;
  allergy?: { name: string; tags: string[] };
}
interface Table {
  id: string; x: number; y: number; w: number; h: number;
  shape: "rect" | "round"; number: number | string;
  merged: boolean; chairs: Chair[];
  dbId?: string;
}
interface FloorData {
  tables: Record<string, Table[]>;
  nextNum: Record<string, number>;
}
interface DragState {
  type: "table" | "chair" | "resize" | "pan";
  id?: string; cid?: string; tid?: string; hname?: string;
  ox?: number; oy?: number; sx?: number; sy?: number; ow?: number; oh?: number;
}
type Panel =
  | { type: "table"; tableId: string }
  | { type: "chair"; chairId: string; tableId: string }
  | null;
type TableStatus = "empty" | "waiting" | "served";

// ─────────────────────────────────────────────────────────────────────────────
// TIPUS API
// ─────────────────────────────────────────────────────────────────────────────

interface ApiOrderItem {
  id: string;
  orderId: string;
  recipeId: string;
  menuCardItemId: string | null;
  quantity: number;
  name: string;
  specialNotes: string | null;
  hasAllergenRisk: boolean;
  allergyPerson: string | null;
  status: "pending" | "confirmed" | "preparing" | "served" | "cancelled";
}
interface ApiOrder {
  id: string;
  establishmentId: string;
  tableId: string | null;
  waiterId: string | null;
  status: "pending" | "confirmed" | "preparing" | "served" | "cancelled";
  notes: string | null;
  items: ApiOrderItem[];
}
interface ApiMenuItem {
  id: string;
  recipeId: string;
  recipeName: string;
  price: number;
  category: string;
  isAvailable: boolean;
  allergens: { code: string; nameEs: string; nameCa: string }[];
}
interface ApiTable {
  id: string;
  roomId: string;
  tableNumber: string;
  capacity: number | null;
  establishmentId: string;
}
interface ApiRoom {
  id: string;
  name: string;
  establishmentId: string;
}
interface CartItem {
  menuCardItemId: string | null;
  recipeId: string;
  name: string;
  qty: number;
  price: number;
  allergens: { code: string; nameEs: string; nameCa: string }[];
  allergyPerson: string | null;
}

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────

const GRID = 20;
const CS = 22;
const CO = 8;
const TW = 84;
const TH = 84;
const MIN_SIZE = 60;
const PANEL_W = 320;

const API_BASE = import.meta.env.VITE_API_URL as string;

const ALLERGEN_EMOJI: Record<string, string> = {
  GLU: "🌾", CRU: "🦐", HUE: "🥚", PES: "🐟", CAC: "🥜",
  SOJ: "🫘", LAC: "🥛", FRU: "🌰", API: "🌿", MOS: "🌱",
  SES: "🌾", SUL: "🍷", ALT: "🌱", MOL: "🐚",
};

interface AllergenOption { id: string; label: string; emoji: string; }

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS API
// ─────────────────────────────────────────────────────────────────────────────

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const token = getAccessToken();
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options?.headers ?? {}),
    },
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error?.message ?? "API error");
  return json.data as T;
}

// ─────────────────────────────────────────────────────────────────────────────
// LÒGICA MAPA (status de la taula)
// ─────────────────────────────────────────────────────────────────────────────

function getTableStatus(dbTableId: string | null, occupiedIds: Set<string>, activeOrders: Record<string, ApiOrder>): TableStatus {
  if (!dbTableId || !occupiedIds.has(dbTableId)) return "empty";
  const order = activeOrders[dbTableId];
  if (!order) return "waiting";
  const allServed = order.items.length > 0 && order.items.every(i => i.status === "served");
  return allServed ? "served" : "waiting";
}

// ─────────────────────────────────────────────────────────────────────────────
// LAYOUT PER DEFECTE
// ─────────────────────────────────────────────────────────────────────────────

const uid = () => Math.random().toString(36).slice(2, 10);
const doSnap = (v: number, on: boolean) => on ? Math.round(v / GRID) * GRID : v;

function mkRect(x: number, y: number, n: number, sides: { side: Chair["side"]; pos: number }[]): Table {
  return {
    id: uid(), x, y, w: TW, h: TH, shape: "rect", number: n, merged: false,
    chairs: sides.map(s => ({ id: uid(), side: s.side, pos: s.pos }))
  };
}
function mkRound(x: number, y: number, n: number | string, angles: number[]): Table {
  return {
    id: uid(), x, y, w: TW, h: TH, shape: "round", number: n, merged: false,
    chairs: angles.map(a => ({ id: uid(), angle: a }))
  };
}

function defaultFloorData(): FloorData {
  return {
    tables: {
      indoor: [
        mkRect(50, 50, 1, [{ side: "top", pos: .5 }, { side: "bottom", pos: .5 }]),
        mkRect(190, 50, 2, [{ side: "top", pos: .5 }, { side: "bottom", pos: .5 }]),
        mkRound(330, 50, 3, [-90, 90]),
        mkRound(460, 50, 4, [-90, -30, 30, 90, 150, 210]),
        mkRect(50, 200, 5, [{ side: "top", pos: .35 }, { side: "top", pos: .65 }, { side: "bottom", pos: .35 }, { side: "bottom", pos: .65 }]),
        mkRect(190, 200, 6, [{ side: "top", pos: .5 }, { side: "bottom", pos: .5 }, { side: "left", pos: .5 }, { side: "right", pos: .5 }]),
      ],
      terrassa: [
        mkRound(60, 60, "T1", [-90, 90]),
        mkRect(200, 60, "T2" as unknown as number, [{ side: "top", pos: .5 }, { side: "bottom", pos: .5 }]),
        mkRound(330, 60, "T3", [-90, 0, 90, 180]),
        mkRect(140, 200, "T4" as unknown as number, [{ side: "top", pos: .5 }, { side: "bottom", pos: .5 }]),
      ],
    },
    nextNum: { indoor: 7, terrassa: 5 },
  };
}

function loadFloorData(): FloorData {
  try {
    const raw = localStorage.getItem("dishly_floor_v1");
    if (raw) {
      const d = JSON.parse(raw) as FloorData;
      for (const zone of Object.values(d.tables))
        for (const t of zone) t.shape = t.shape || "rect";
      return d;
    }
  } catch { /* empty */ }
  return defaultFloorData();
}
function saveFloorData(d: FloorData) {
  try { localStorage.setItem("dishly_floor_v1", JSON.stringify({ tables: d.tables, nextNum: d.nextNum })); }
  catch { /* empty */ }
}

// ─────────────────────────────────────────────────────────────────────────────
// GEOMETRIA DE CADIRES
// ─────────────────────────────────────────────────────────────────────────────

function chairCSS(ch: Chair, t: Table) {
  if (t.shape === "round") {
    const rad = ((ch.angle ?? 0) * Math.PI) / 180;
    const r = Math.min(t.w, t.h) / 2;
    return { left: Math.round(t.w / 2 + (r + CO) * Math.cos(rad) - CS / 2), top: Math.round(t.h / 2 + (r + CO) * Math.sin(rad) - CS / 2), rot: (ch.angle ?? 0) + 90 };
  }
  const p = ch.pos ?? 0.5;
  switch (ch.side) {
    case "top": return { left: Math.round(p * t.w - CS / 2), top: -CS - CO, rot: 0 };
    case "bottom": return { left: Math.round(p * t.w - CS / 2), top: t.h + CO, rot: 180 };
    case "left": return { left: -CS - CO, top: Math.round(p * t.h - CS / 2), rot: -90 };
    case "right": return { left: t.w + CO, top: Math.round(p * t.h - CS / 2), rot: 90 };
    default: return { left: Math.round(p * t.w - CS / 2), top: -CS - CO, rot: 0 };
  }
}
function nearestPerimeter(mx: number, my: number, tw: number, th: number) {
  const cx = mx - tw / 2, cy = my - th / 2;
  const dT = Math.abs(cy + th / 2), dB = Math.abs(cy - th / 2), dL = Math.abs(cx + tw / 2), dR = Math.abs(cx - tw / 2);
  const min = Math.min(dT, dB, dL, dR);
  const cl = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
  if (min === dT) return { side: "top" as Chair["side"], pos: cl((cx + tw / 2) / tw, .05, .95) };
  if (min === dB) return { side: "bottom" as Chair["side"], pos: cl((cx + tw / 2) / tw, .05, .95) };
  if (min === dL) return { side: "left" as Chair["side"], pos: cl((cy + th / 2) / th, .05, .95) };
  return { side: "right" as Chair["side"], pos: cl((cy + th / 2) / th, .05, .95) };
}

const RECT_HANDLES = [
  { n: "nw", px: 0, py: 0 }, { n: "n", px: .5, py: 0 }, { n: "ne", px: 1, py: 0 },
  { n: "e", px: 1, py: .5 },
  { n: "se", px: 1, py: 1 }, { n: "s", px: .5, py: 1 }, { n: "sw", px: 0, py: 1 },
  { n: "w", px: 0, py: .5 },
];
const ROUND_HANDLES = [
  { n: "nw", px: 0, py: 0 }, { n: "ne", px: 1, py: 0 }, { n: "se", px: 1, py: 1 }, { n: "sw", px: 0, py: 1 },
];

// ─────────────────────────────────────────────────────────────────────────────
// ICONES D'ESTAT (SVG inline)
// ─────────────────────────────────────────────────────────────────────────────

function IconWaiting() {
  return (
    <svg width="13" height="13" fill="none" stroke="rgba(255,255,255,.95)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
    </svg>
  );
}
function IconServed() {
  return (
    <svg width="13" height="13" fill="none" stroke="rgba(255,255,255,.95)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
function IconEmpty() {
  return (
    <svg width="12" height="12" fill="none" stroke="rgba(255,255,255,.45)" strokeWidth="1.5" strokeLinecap="round" viewBox="0 0 24 24">
      <path d="M3 12h18M12 3a9 9 0 100 18" />
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT PRINCIPAL
// ─────────────────────────────────────────────────────────────────────────────

export default function FloorMapSection({ onOrderChange }: { onOrderChange?: () => void } = {}) {

  // ── Estat del mapa ─────────────────────────────────────────────────────────
  const [data, setData] = useState<FloorData>(loadFloorData);
  const [zone, setZone] = useState<"indoor" | "terrassa">("indoor");
  const [mode, setMode] = useState<"edit" | "service">("service");
  const [tool, setTool] = useState<"select" | "addChair">("select");
  const [selId, setSelId] = useState<string | null>(null);
  const [selType, setSelType] = useState<"table" | "chair" | null>(null);
  const [gridSnap, setGridSnap] = useState(true);
  const [history, setHistory] = useState<string[]>([]);
  const [renaming, setRenaming] = useState<string | null>(null);
  const [renameVal, setRenameVal] = useState("");
  const [toast, setToast] = useState("");
  const [canvasOffset, setCanvasOffset] = useState({ x: 0, y: 0 });
  const [isFullscreen, setIsFullscreen] = useState(false);

  // ── Dades de l'API ──────────────────────────────────────────────────────────
  const [dbTables, setDbTables] = useState<ApiTable[]>([]);
  const [rooms, setRooms] = useState<ApiRoom[]>([]);
  const [menuItems, setMenuItems] = useState<ApiMenuItem[]>([]);
  const [occupiedTableIds, setOccupiedTableIds] = useState<Set<string>>(new Set());
  const [activeOrders, setActiveOrders] = useState<Record<string, ApiOrder>>({});
  const [allergenList, setAllergenList] = useState<AllergenOption[]>([]);

  // ── Panell lateral ────────────────────────────────────────────────────────
  const [panel, setPanel] = useState<Panel>(null);
  const [allergyDraft, setAllergyDraft] = useState<{ name: string; tags: string[] }>({ name: "", tags: [] });
  const [showNewOrderForm, setShowNewOrderForm] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [panelLoading, setPanelLoading] = useState(false);

  // ── Refs ──────────────────────────────────────────────────────────────────
  const dragRef = useRef<DragState | null>(null);
  const dataRef = useRef(data);
  const zoneRef = useRef(zone);
  const modeRef = useRef(mode);
  const toolRef = useRef(tool);
  const snapRef = useRef(gridSnap);
  const selIdRef = useRef(selId);
  const selTypeRef = useRef(selType);
  const histRef = useRef(history);
  const canvasOffsetRef = useRef(canvasOffset);
  const roomsRef = useRef<ApiRoom[]>([]);
  const wrapRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const gridCvs = useRef<HTMLCanvasElement>(null);
  const renameRef = useRef<HTMLInputElement>(null);

  useEffect(() => { dataRef.current = data; }, [data]);
  useEffect(() => { zoneRef.current = zone; }, [zone]);
  useEffect(() => { modeRef.current = mode; }, [mode]);
  useEffect(() => { toolRef.current = tool; }, [tool]);
  useEffect(() => { snapRef.current = gridSnap; }, [gridSnap]);
  useEffect(() => { selIdRef.current = selId; }, [selId]);
  useEffect(() => { selTypeRef.current = selType; }, [selType]);
  useEffect(() => { histRef.current = history; }, [history]);
  useEffect(() => { canvasOffsetRef.current = canvasOffset; }, [canvasOffset]);
  useEffect(() => { roomsRef.current = rooms; }, [rooms]);

  // ── Toast ──────────────────────────────────────────────────────────────────
  const showToast = useCallback((msg: string) => {
    setToast(msg); setTimeout(() => setToast(""), 2400);
  }, []);

  // ── Càrrega inicial: taules DB + sales + menú + taules ocupades ────────────
  useEffect(() => {
    (async () => {
      let myEstablishmentId: string | null = null;
      try {
        const me = await apiFetch<{ establishmentId: string }>("/users/me");
        myEstablishmentId = me.establishmentId;
      } catch { /* continua sense filtre si falla */ }

      apiFetch<ApiTable[]>("/tables").then(tables => {
        const myTables = myEstablishmentId
          ? tables.filter(t => t.establishmentId === myEstablishmentId)
          : tables;
        setDbTables(myTables);
        // Sincronitza dbId en taules del mapa que encara no en tenen
        setData(prev => {
          let changed = false;
          const newTables: Record<string, Table[]> = {};
          for (const [z, ts] of Object.entries(prev.tables)) {
            newTables[z] = ts.map(t => {
              if (t.dbId) return t;
              const found = myTables.find(dt => dt.tableNumber === String(t.number));
              if (found) { changed = true; return { ...t, dbId: found.id }; }
              return t;
            });
          }
          if (!changed) return prev;
          const next = { ...prev, tables: newTables };
          saveFloorData(next);
          return next;
        });
      }).catch(() => { });

      apiFetch<ApiRoom[]>("/rooms").then(rooms => {
        const myRooms = myEstablishmentId
          ? rooms.filter(r => r.establishmentId === myEstablishmentId)
          : rooms;
        setRooms(myRooms);
      }).catch(() => { });

      apiFetch<ApiMenuItem[]>("/menu-card-items").then(setMenuItems).catch(() => { });
      apiFetch<string[]>("/orders/active-tables")
        .then(ids => setOccupiedTableIds(new Set(ids)))
        .catch(() => { });
      apiFetch<{ code: string; nameEs: string }[]>("/allergens").then(allergens => {
        setAllergenList(allergens.map(a => ({
          id: a.code,
          label: a.nameEs,
          emoji: ALLERGEN_EMOJI[a.code] ?? "⚠️",
        })));
      }).catch(() => { });
    })();
  }, []);

  // ── Reinicia formulari quan canvia el panell ───────────────────────────────
  useEffect(() => {
    setShowNewOrderForm(false);
    setCartItems([]);
  }, [panel]);

  // ── Carrega la comanda activa quan s'obre un panell de taula ──────────────
  useEffect(() => {
    if (!panel || panel.type !== "table") return;
    const mapTable = (data.tables[zone] ?? []).find(t => t.id === panel.tableId);
    if (!mapTable) return;
    const dbTable = mapTable.dbId
      ? dbTables.find(dt => dt.id === mapTable.dbId)
      : dbTables.find(dt => dt.tableNumber === String(mapTable.number));
    if (!dbTable) return;
    setPanelLoading(true);
    apiFetch<ApiOrder | null>(`/orders/active/${dbTable.id}`)
      .then(order => {
        if (order) {
          setActiveOrders(prev => ({ ...prev, [dbTable.id]: order }));
          setOccupiedTableIds(prev => new Set([...prev, dbTable.id]));
        } else {
          setActiveOrders(prev => { const n = { ...prev }; delete n[dbTable.id]; return n; });
          setOccupiedTableIds(prev => { const n = new Set(prev); n.delete(dbTable.id); return n; });
        }
      })
      .catch(() => { })
      .finally(() => setPanelLoading(false));
  }, [panel, dbTables, data.tables, zone]);

  // ── Mapeig: taula del mapa → registre de la DB (dbId primer, número com a fallback)
  const getDbTableId = useCallback((t: Table): string | null => {
    if (t.dbId) return t.dbId;
    return dbTables.find(dt => dt.tableNumber === String(t.number))?.id ?? null;
  }, [dbTables]);

  const getDbTable = useCallback((t: Table): ApiTable | null => {
    if (t.dbId) return dbTables.find(dt => dt.id === t.dbId) ?? null;
    return dbTables.find(dt => dt.tableNumber === String(t.number)) ?? null;
  }, [dbTables]);

  // ── Quadrícula ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const cvs = gridCvs.current, wrap = wrapRef.current;
    if (!cvs || !wrap) return;
    const draw = () => {
      cvs.width = wrap.clientWidth; cvs.height = wrap.clientHeight;
      const ctx = cvs.getContext("2d");
      if (!ctx) return;
      ctx.clearRect(0, 0, cvs.width, cvs.height);
      if (!snapRef.current) return;
      ctx.strokeStyle = "rgba(15,23,42,.055)"; ctx.lineWidth = 1;
      const offX = ((canvasOffsetRef.current.x % GRID) + GRID) % GRID;
      const offY = ((canvasOffsetRef.current.y % GRID) + GRID) % GRID;
      for (let x = offX; x <= cvs.width; x += GRID) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, cvs.height); ctx.stroke(); }
      for (let y = offY; y <= cvs.height; y += GRID) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(cvs.width, y); ctx.stroke(); }
    };
    draw();
    window.addEventListener("resize", draw);
    return () => window.removeEventListener("resize", draw);
  }, [gridSnap, canvasOffset]);

  // ── Pantalla completa ──────────────────────────────────────────────────────
  useEffect(() => {
    const fn = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", fn);
    return () => document.removeEventListener("fullscreenchange", fn);
  }, []);
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) containerRef.current?.requestFullscreen().catch(() => { });
    else document.exitFullscreen().catch(() => { });
  }, []);
  const resetView = useCallback(() => { setCanvasOffset({ x: 0, y: 0 }); showToast("Vista centrada"); }, [showToast]);

  // ── Reanomenació focus ─────────────────────────────────────────────────────
  useEffect(() => { if (renaming && renameRef.current) { renameRef.current.focus(); renameRef.current.select(); } }, [renaming]);

  const currentTables = data.tables[zone] ?? [];

  const pushHistory = useCallback(() => {
    setHistory(h => {
      const next = [...h, JSON.stringify({ tables: dataRef.current.tables, nextNum: dataRef.current.nextNum })];
      if (next.length > 40) next.shift();
      return next;
    });
  }, []);

  const updateTables = useCallback((z: string, updater: (ts: Table[]) => Table[]) => {
    setData(prev => {
      const next = { ...prev, tables: { ...prev.tables, [z]: updater(prev.tables[z] ?? []) } };
      saveFloorData(next);
      return next;
    });
  }, []);

  // ── Mouse global (drag / pan) ──────────────────────────────────────────────
  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      const drag = dragRef.current;
      if (!drag) return;
      const z = zoneRef.current, sn = snapRef.current;

      if (drag.type === "pan") {
        setCanvasOffset({ x: (drag.ox ?? 0) + e.clientX - (drag.sx ?? 0), y: (drag.oy ?? 0) + e.clientY - (drag.sy ?? 0) });

      } else if (drag.type === "table" && drag.id !== undefined) {
        const newX = doSnap(e.clientX - (drag.ox ?? 0), sn);
        const newY = doSnap(e.clientY - (drag.oy ?? 0), sn);
        setData(prev => {
          const ts = [...(prev.tables[z] ?? [])];
          const i = ts.findIndex(t => t.id === drag.id);
          if (i === -1) return prev;
          let sx = newX, sy = newY;
          const t = ts[i], DIST = 16;
          for (const o of ts) {
            if (o.id === t.id) continue;
            const aH = Math.abs(sy - o.y) < DIST, aV = Math.abs(sx - o.x) < DIST;
            if (aH && Math.abs((sx + t.w) - o.x) < DIST) { sx = o.x - t.w; if (!sn) sy = o.y; }
            else if (aH && Math.abs(sx - (o.x + o.w)) < DIST) { sx = o.x + o.w; if (!sn) sy = o.y; }
            else if (aV && Math.abs((sy + t.h) - o.y) < DIST) { sy = o.y - t.h; if (!sn) sx = o.x; }
            else if (aV && Math.abs(sy - (o.y + o.h)) < DIST) { sy = o.y + o.h; if (!sn) sx = o.x; }
          }
          ts[i] = { ...ts[i], x: sx, y: sy };
          return { ...prev, tables: { ...prev.tables, [z]: ts } };
        });

      } else if (drag.type === "chair" && drag.cid && drag.tid) {
        setData(prev => {
          const ts = [...(prev.tables[z] ?? [])];
          const ti = ts.findIndex(t => t.id === drag.tid);
          if (ti === -1) return prev;
          const t = ts[ti], wrap = wrapRef.current;
          if (!wrap) return prev;
          const wRect = wrap.getBoundingClientRect(), off = canvasOffsetRef.current;
          const mx = e.clientX - wRect.left - off.x - t.x;
          const my = e.clientY - wRect.top - off.y - t.y;
          const chairs = [...t.chairs];
          const ci = chairs.findIndex(c => c.id === drag.cid);
          if (ci === -1) return prev;
          if (t.shape === "round") {
            chairs[ci] = { ...chairs[ci], angle: Math.atan2(my - t.h / 2, mx - t.w / 2) * 180 / Math.PI };
          } else {
            const p = nearestPerimeter(mx, my, t.w, t.h);
            chairs[ci] = { ...chairs[ci], side: p.side, pos: p.pos };
          }
          ts[ti] = { ...t, chairs };
          return { ...prev, tables: { ...prev.tables, [z]: ts } };
        });

      } else if (drag.type === "resize" && drag.id) {
        setData(prev => {
          const ts = [...(prev.tables[z] ?? [])];
          const i = ts.findIndex(t => t.id === drag.id);
          if (i === -1) return prev;
          const t = ts[i], dx = e.clientX - (drag.sx ?? 0), dy = e.clientY - (drag.sy ?? 0), h = drag.hname ?? "";
          let nW = drag.ow ?? t.w, nH = drag.oh ?? t.h, nX = drag.ox ?? t.x, nY = drag.oy ?? t.y;
          if (h.includes("e")) nW = Math.max(MIN_SIZE, doSnap((drag.ow ?? t.w) + dx, sn));
          if (h.includes("s")) nH = Math.max(MIN_SIZE, doSnap((drag.oh ?? t.h) + dy, sn));
          if (h.includes("w")) { nW = Math.max(MIN_SIZE, doSnap((drag.ow ?? t.w) - dx, sn)); nX = (drag.ox ?? t.x) + (drag.ow ?? t.w) - nW; }
          if (h.includes("n")) { nH = Math.max(MIN_SIZE, doSnap((drag.oh ?? t.h) - dy, sn)); nY = (drag.oy ?? t.y) + (drag.oh ?? t.h) - nH; }
          if (t.shape === "round") {
            const s = Math.max(MIN_SIZE, Math.max(nW, nH));
            if (h.includes("w")) nX = (drag.ox ?? t.x) + (drag.ow ?? t.w) - s;
            if (h.includes("n")) nY = (drag.oy ?? t.y) + (drag.oh ?? t.h) - s;
            nW = nH = s;
          }
          ts[i] = { ...t, x: nX, y: nY, w: nW, h: nH };
          return { ...prev, tables: { ...prev.tables, [z]: ts } };
        });
      }
    };

    const onMouseUp = (e: MouseEvent) => {
      const drag = dragRef.current;
      if (drag) {
        if (drag.type === "pan") {
          const dx = e.clientX - (drag.sx ?? 0), dy = e.clientY - (drag.sy ?? 0);
          if (Math.abs(dx) < 4 && Math.abs(dy) < 4) { setSelId(null); setSelType(null); setTool(t => t === "addChair" ? "select" : t); }
        } else {
          saveFloorData(dataRef.current);
        }
        dragRef.current = null;
      }
    };
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => { window.removeEventListener("mousemove", onMouseMove); window.removeEventListener("mouseup", onMouseUp); };
  }, []);

  // ── Dreceres teclat ────────────────────────────────────────────────────────
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const active = document.activeElement;
      if (active && (active.tagName === "INPUT" || active.tagName === "TEXTAREA")) return;
      if (e.key === "Delete" || e.key === "Backspace") handleDelete();
      if (e.key === "Escape") { setSelId(null); setSelType(null); setTool("select"); setPanel(null); }
      if ((e.metaKey || e.ctrlKey) && e.key === "z") { e.preventDefault(); handleUndo(); }
      if ((e.metaKey || e.ctrlKey) && e.key === "d") { e.preventDefault(); handleDuplicate(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─────────────────────────────────────────────────────────────────────────
  // ACCIONS D'EDICIÓ
  // ─────────────────────────────────────────────────────────────────────────

  const handleAddTable = useCallback(async (shape: "rect" | "round") => {
    if (modeRef.current === "service") return;
    const wrap = wrapRef.current, off = canvasOffsetRef.current;
    const cx = wrap ? doSnap(wrap.clientWidth / 2 - TW / 2 - off.x + (Math.random() * 80 - 40), snapRef.current) : 60;
    const cy = wrap ? doSnap(wrap.clientHeight / 2 - TH / 2 - off.y + (Math.random() * 80 - 40), snapRef.current) : 60;
    const z = zoneRef.current;
    const num = dataRef.current.nextNum[z] ?? 1;

    // Determina la sala per a la zona actual
    const allRooms = roomsRef.current;
    const room = z === "terrassa"
      ? allRooms.find(r => r.name.toLowerCase().includes("terrass"))
      : allRooms.find(r => !r.name.toLowerCase().includes("terrass"));

    let dbId: string | undefined;
    if (room) {
      try {
        const dbTable = await apiFetch<ApiTable>("/tables", {
          method: "POST",
          body: JSON.stringify({ roomId: room.id, tableNumber: String(num), capacity: null }),
        });
        dbId = dbTable.id;
        setDbTables(prev => [...prev, dbTable]);
      } catch {
        showToast("Error creant la taula a la base de dades");
        return;
      }
    }

    pushHistory();
    setData(prev => {
      const n = prev.nextNum[z] ?? 1;
      const t: Table = {
        id: uid(), x: cx, y: cy, w: TW, h: TH, shape, number: n, merged: false, dbId,
        chairs: shape === "round"
          ? [{ id: uid(), angle: -90 }, { id: uid(), angle: 90 }]
          : [{ id: uid(), side: "top", pos: .5 }, { id: uid(), side: "bottom", pos: .5 }]
      };
      const next = { ...prev, tables: { ...prev.tables, [z]: [...(prev.tables[z] ?? []), t] }, nextNum: { ...prev.nextNum, [z]: n + 1 } };
      saveFloorData(next); setSelId(t.id); setSelType("table");
      return next;
    });
    showToast("Taula afegida");
  }, [pushHistory, showToast]);

  const handleDelete = useCallback(async () => {
    const id = selIdRef.current, type = selTypeRef.current;
    if (!id) return;
    const z = zoneRef.current;
    if (type === "table") {
      const table = (dataRef.current.tables[z] ?? []).find(t => t.id === id);
      const dbId = table?.dbId;
      if (dbId) {
        try {
          await apiFetch(`/tables/${dbId}`, { method: "DELETE" });
          setDbTables(prev => prev.filter(dt => dt.id !== dbId));
        } catch {
          showToast("No es pot eliminar: la taula té comandes associades");
          return;
        }
      }
      pushHistory();
      updateTables(z, ts => ts.filter(t => t.id !== id));
      showToast("Taula eliminada");
    } else if (type === "chair") {
      pushHistory();
      updateTables(z, ts => ts.map(t => ({ ...t, chairs: t.chairs.filter(c => c.id !== id) })));
      showToast("Cadira eliminada");
    }
    setSelId(null); setSelType(null);
  }, [pushHistory, updateTables, showToast]);

  const handleUndo = useCallback(() => {
    setHistory(h => {
      if (!h.length) { showToast("Res a desfer"); return h; }
      const prev = JSON.parse(h[h.length - 1]) as Pick<FloorData, "tables" | "nextNum">;
      setData(d => { const next = { ...d, ...prev }; saveFloorData(next); return next; });
      setSelId(null); setSelType(null); showToast("Acció desfeta");
      return h.slice(0, -1);
    });
  }, [showToast]);

  const handleDuplicate = useCallback(() => {
    const id = selIdRef.current;
    if (!id || selTypeRef.current !== "table") return;
    const z = zoneRef.current;
    pushHistory();
    setData(prev => {
      const ts = prev.tables[z] ?? [], orig = ts.find(t => t.id === id);
      if (!orig) return prev;
      const num = prev.nextNum[z] ?? 1;
      const copy: Table = { ...JSON.parse(JSON.stringify(orig)), id: uid(), x: orig.x + 20, y: orig.y + 20, number: num, chairs: orig.chairs.map(c => ({ ...c, id: uid() })) };
      const next = { ...prev, tables: { ...prev.tables, [z]: [...ts, copy] }, nextNum: { ...prev.nextNum, [z]: num + 1 } };
      saveFloorData(next); setSelId(copy.id); setSelType("table");
      return next;
    });
    showToast("Taula duplicada");
  }, [pushHistory, showToast]);

  const handleMerge = useCallback(() => {
    const id = selIdRef.current;
    if (!id || selTypeRef.current !== "table") { showToast("Selecciona una taula primer"); return; }
    const z = zoneRef.current, ts = dataRef.current.tables[z] ?? [], t1 = ts.find(t => t.id === id);
    if (!t1) return;
    let best: Table | null = null, bestG = Infinity;
    for (const t2 of ts) {
      if (t2.id === t1.id) continue;
      const aH = Math.abs(t1.y - t2.y) < 6, aV = Math.abs(t1.x - t2.x) < 6;
      const g = Math.min(aH ? Math.abs((t1.x + t1.w) - t2.x) : Infinity, aH ? Math.abs(t1.x - (t2.x + t2.w)) : Infinity,
        aV ? Math.abs((t1.y + t1.h) - t2.y) : Infinity, aV ? Math.abs(t1.y - (t2.y + t2.h)) : Infinity);
      if (g < 24 && g < bestG) { bestG = g; best = t2; }
    }
    if (!best) { showToast("Acosta la taula a una altra per unir-les"); return; }
    pushHistory();
    const b = best;
    updateTables(z, prev => {
      const minX = Math.min(t1.x, b.x), minY = Math.min(t1.y, b.y);
      const merged: Table = {
        id: uid(), shape: "rect", x: minX, y: minY,
        w: Math.max(t1.x + t1.w, b.x + b.w) - minX, h: Math.max(t1.y + t1.h, b.y + b.h) - minY,
        number: `${t1.number}+${b.number}`, merged: true, chairs: [...t1.chairs.map(c => ({ ...c })), ...b.chairs.map(c => ({ ...c }))]
      };
      return [...prev.filter(t => t.id !== t1.id && t.id !== b.id), merged];
    });
    showToast(`Taules ${t1.number} i ${best.number} unides`);
  }, [pushHistory, updateTables, showToast]);

  const handleSplit = useCallback(() => {
    const id = selIdRef.current;
    if (!id || selTypeRef.current !== "table") return;
    const z = zoneRef.current, ts = dataRef.current.tables[z] ?? [], t = ts.find(t => t.id === id);
    if (!t || !t.merged) { showToast("Aquesta taula no està unida"); return; }
    pushHistory();
    const wide = t.w >= t.h, hw = wide ? t.w / 2 : t.w, hh = wide ? t.h : t.h / 2;
    setData(prev => {
      const num = prev.nextNum[z] ?? 1;
      const make = (x: number, y: number, n: number): Table => ({ id: uid(), x, y, w: hw, h: hh, shape: "rect", number: n, merged: false, chairs: [{ id: uid(), side: "top", pos: .5 }, { id: uid(), side: "bottom", pos: .5 }] });
      const t1 = make(t.x, t.y, num), t2 = make(wide ? t.x + hw : t.x, wide ? t.y : t.y + hh, num + 1);
      const next = { ...prev, tables: { ...prev.tables, [z]: [...(prev.tables[z] ?? []).filter(x => x.id !== t.id), t1, t2] }, nextNum: { ...prev.nextNum, [z]: num + 2 } };
      saveFloorData(next); setSelId(null); setSelType(null);
      return next;
    });
    showToast("Taula separada en dues");
  }, [pushHistory, showToast]);

  const handleToggleShape = useCallback(() => {
    const id = selIdRef.current;
    if (!id || selTypeRef.current !== "table") return;
    const z = zoneRef.current;
    pushHistory();
    updateTables(z, ts => ts.map(t => {
      if (t.id !== id) return t;
      const newShape = t.shape === "round" ? "rect" : "round";
      let chairs = t.chairs;
      if (newShape === "round") {
        const s = Math.max(t.w, t.h), n = chairs.length || 2;
        chairs = chairs.map((c, i) => ({ id: c.id, angle: (i / n) * 360 - 90 }));
        return { ...t, shape: newShape, w: s, h: s, chairs };
      } else {
        const sides: Chair["side"][] = ["top", "bottom", "left", "right"];
        chairs = chairs.map((c, i) => ({ id: c.id, side: sides[i % 4], pos: .5 }));
        return { ...t, shape: newShape, chairs };
      }
    }));
    showToast("Forma canviada");
  }, [pushHistory, updateTables, showToast]);

  const commitRename = useCallback(() => {
    if (!renaming) return;
    const z = zoneRef.current, val = renameVal.trim();
    updateTables(z, ts => ts.map(t => t.id !== renaming ? t : { ...t, number: val === "" ? t.number : (isNaN(+val) ? val : +val) }));
    setRenaming(null);
  }, [renaming, renameVal, updateTables]);

  // ─────────────────────────────────────────────────────────────────────────
  // ACCIONS DE SERVEI (connectades a l'API)
  // ─────────────────────────────────────────────────────────────────────────

  const toggleItemServed = useCallback(async (dbTableId: string, orderId: string, itemId: string, currentStatus: string) => {
    if (currentStatus === "served") return;
    try {
      await apiFetch(`/orders/${orderId}/items/${itemId}/served`, { method: "PATCH" });
      setActiveOrders(prev => {
        const order = prev[dbTableId];
        if (!order) return prev;
        const items = order.items.map(i => i.id === itemId ? { ...i, status: "served" as const } : i);
        return { ...prev, [dbTableId]: { ...order, items } };
      });
    } catch {
      showToast("Error marcant el plat");
    }
  }, [showToast]);

  const closeTableOrder = useCallback(async (dbTableId: string, orderId: string, tableNumber: number | string) => {
    try {
      await apiFetch(`/orders/${orderId}/close`, { method: "PATCH" });
      setActiveOrders(prev => { const n = { ...prev }; delete n[dbTableId]; return n; });
      setOccupiedTableIds(prev => { const n = new Set(prev); n.delete(dbTableId); return n; });
      setPanel(null);
      showToast(`Taula ${tableNumber} tancada`);
      onOrderChange?.();
    } catch {
      showToast("Error tancant la comanda");
    }
  }, [showToast]);

  const confirmNewOrder = useCallback(async (mapTable: Table) => {
    if (cartItems.length === 0) { showToast("Afegeix almenys un plat"); return; }
    const dbTable = getDbTable(mapTable);
    if (!dbTable) { showToast("Taula no trobada a la base de dades"); return; }

    try {
      const order = await apiFetch<ApiOrder>("/orders", {
        method: "POST",
        body: JSON.stringify({
          establishmentId: dbTable.establishmentId,
          tableId: dbTable.id,
          waiterId: null,
          notes: null,
          items: cartItems.map(item => ({
            recipeId: item.recipeId,
            menuCardItemId: item.menuCardItemId,
            quantity: item.qty,
            name: item.name,
            specialNotes: null,
            hasAllergenRisk: item.allergens.length > 0,
            allergyPerson: item.allergyPerson,
          })),
        }),
      });
      setActiveOrders(prev => ({ ...prev, [dbTable.id]: order }));
      setOccupiedTableIds(prev => new Set([...prev, dbTable.id]));
      setCartItems([]);
      setShowNewOrderForm(false);
      showToast("Comanda creada!");
      onOrderChange?.();
    } catch {
      showToast("Error creant la comanda");
    }
  }, [cartItems, getDbTable, showToast]);

  const saveChairAllergy = useCallback(() => {
    if (!panel || panel.type !== "chair") return;
    const hasAllergy = allergyDraft.name.trim() !== "" || allergyDraft.tags.length > 0;
    updateTables(zoneRef.current, ts => ts.map(t => {
      if (t.id !== panel.tableId) return t;
      return { ...t, chairs: t.chairs.map(c => c.id !== panel.chairId ? c : { ...c, allergy: hasAllergy ? allergyDraft : undefined }) };
    }));
    showToast(hasAllergy ? "Al·lèrgia desada" : "Al·lèrgia eliminada");
  }, [panel, allergyDraft, updateTables, showToast]);

  const openChairPanel = useCallback((chairId: string, tableId: string) => {
    setPanel({ type: "chair", chairId, tableId });
    const t = (dataRef.current.tables[zoneRef.current] ?? []).find(t => t.id === tableId);
    const c = t?.chairs.find(c => c.id === chairId);
    setAllergyDraft(c?.allergy ?? { name: "", tags: [] });
  }, []);

  // ─────────────────────────────────────────────────────────────────────────
  // ESTADÍSTIQUES
  // ─────────────────────────────────────────────────────────────────────────

  const occupiedCount = currentTables.filter(t => {
    const dbId = getDbTableId(t);
    return dbId ? occupiedTableIds.has(dbId) : false;
  }).length;
  const availableCount = currentTables.length - occupiedCount;

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────

  const panelOpen = panel !== null;

  return (
    <div ref={containerRef} style={{
      width: "100%", borderRadius: isFullscreen ? 0 : 20, overflow: "hidden",
      border: isFullscreen ? "none" : "1px solid #E5E7EB",
      boxShadow: isFullscreen ? "none" : "0 2px 16px rgba(15,23,42,.08)",
      background: "#fff", marginBottom: isFullscreen ? 0 : 40,
      ...(isFullscreen ? { position: "fixed" as const, inset: 0, zIndex: 9999, display: "flex", flexDirection: "column" as const } : {}),
    }}>

      {/* ── CAPÇALERA ──────────────────────────────────────────────────────── */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "14px 20px 10px", borderBottom: "1px solid #F1F5F9", flexWrap: "wrap", gap: 10, flexShrink: 0
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <h2 style={{ fontFamily: "Fustat,sans-serif", fontSize: 17, fontWeight: 800, color: "#0F172A", margin: 0 }}>Mapa de Sala</h2>
          <Pill bg="rgba(239,68,68,.1)" color="#DC2626" dot="#EF4444">{occupiedCount} ocupades</Pill>
          <Pill bg="rgba(34,197,94,.1)" color="#16A34A" dot="#22C55E">{availableCount} lliures</Pill>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <ZoneTabs zone={zone} onZone={z => { setZone(z); setSelId(null); setSelType(null); setPanel(null); }} />
          <IconBtn title="Centrar vista" onClick={resetView} active={false}>⊙</IconBtn>
          <IconBtn title={isFullscreen ? "Sortir de pantalla completa" : "Pantalla completa"} onClick={toggleFullscreen} active={isFullscreen}>⛶</IconBtn>
        </div>
      </div>

      {/* ── TOOLBAR ────────────────────────────────────────────────────────── */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", background: "#F8FAFC", borderBottom: "1px solid #F1F5F9", flexWrap: "wrap", flexShrink: 0 }}>
        <div style={{ display: "flex", background: "#E2E8F0", borderRadius: 9, padding: 3, gap: 2, marginRight: 6 }}>
          {(["edit", "service"] as const).map(m => (
            <button key={m} onClick={() => { setMode(m); if (m === "service") { setSelId(null); setSelType(null); } else setPanel(null); }}
              style={{
                padding: "5px 13px", border: "none", borderRadius: 7, cursor: "pointer",
                fontFamily: "'Commissioner',sans-serif", fontSize: 12, fontWeight: 600,
                background: mode === m ? "#0F172A" : "transparent", color: mode === m ? "#fff" : "#6B7280", transition: "all .15s"
              }}>
              {m === "edit" ? "Editar" : "Servei"}
            </button>
          ))}
        </div>
        {mode === "edit" && <div style={{ width: 1, height: 22, background: "#E2E8F0", margin: "0 4px" }} />}
        {mode === "edit" && (<>
          <TBtn active={tool === "select"} onClick={() => setTool("select")}>
            <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M5 3l14 9-7 1-3 7z" /></svg>Seleccionar
          </TBtn>
          <TBtn active={tool === "addChair"} onClick={() => setTool("addChair")}>
            <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" /><path d="M12 8v8M8 12h8" /></svg>Cadira
          </TBtn>
          <div style={{ width: 1, height: 22, background: "#E2E8F0", margin: "0 4px" }} />
          <TBtn onClick={() => handleAddTable("rect")}>
            <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="7" width="18" height="10" rx="2" /></svg>Rectangular
          </TBtn>
          <TBtn onClick={() => handleAddTable("round")}>
            <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" /></svg>Rodona
          </TBtn>
          <div style={{ width: 1, height: 22, background: "#E2E8F0", margin: "0 4px" }} />
          <TBtn onClick={handleToggleShape} disabled={selType !== "table"}>
            <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="5" /><rect x="2" y="2" width="8" height="8" rx="1" /></svg>Canviar forma
          </TBtn>
          <TBtn onClick={handleMerge} disabled={selType !== "table"}>
            <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 6h7v12H4zM13 6h7v12h-7z" /></svg>Unir
          </TBtn>
          <TBtn onClick={handleSplit} disabled={selType !== "table"}>
            <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 6h16v12H4z" /><path d="M12 6v12" strokeDasharray="3 2" /></svg>Separar
          </TBtn>
          <TBtn onClick={handleDelete} danger disabled={!selId}>
            <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" /></svg>Eliminar
          </TBtn>
          <TBtn onClick={handleUndo}>
            <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 14L4 9l5-5" /><path d="M4 9h11a6 6 0 010 12h-1" /></svg>Desfer
          </TBtn>
          <div style={{ width: 1, height: 22, background: "#E2E8F0", margin: "0 4px" }} />
          <button onClick={() => setGridSnap(g => !g)}
            style={{
              display: "flex", alignItems: "center", gap: 5, padding: "5px 10px", border: "none", borderRadius: 8, cursor: "pointer",
              fontFamily: "'Commissioner',sans-serif", fontSize: 12, fontWeight: 600,
              background: gridSnap ? "rgba(124,58,237,.1)" : "transparent", color: gridSnap ? "#7C3AED" : "#6B7280", transition: "all .15s"
            }}>
            <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
            </svg>{gridSnap ? "Grid on" : "Grid off"}
          </button>
          <span style={{ marginLeft: "auto", fontSize: 10, color: "#94A3B8", fontWeight: 500 }}>
            Doble clic · reanomenar &nbsp;·&nbsp; Arrossega buit · moure vista &nbsp;·&nbsp; Del · eliminar &nbsp;·&nbsp; ⌘Z · desfer
          </span>
        </>)}
        {mode === "service" && (
          <span style={{ fontSize: 12, color: "#6B7280", fontWeight: 500 }}>
            Clic a taula · veure comanda &nbsp;·&nbsp; Doble clic a cadira · al·lèrgies
          </span>
        )}
      </div>

      {/* ── CANVAS + PANELL ────────────────────────────────────────────────── */}
      <div style={{ display: "flex", ...(isFullscreen ? { flex: 1, minHeight: 0 } : { height: 460 }), position: "relative" }}>

        {/* Canvas del mapa */}
        <div ref={wrapRef} style={{
          flex: 1, position: "relative", overflow: "hidden", background: "#EDE8E0",
          cursor: mode === "edit" && tool === "addChair" ? "crosshair" : "default"
        }}>
          <canvas ref={gridCvs} style={{ position: "absolute", inset: 0, pointerEvents: "none" }} />

          {/* Capa de pan (fons) */}
          <div style={{ position: "absolute", inset: 0, zIndex: 1, cursor: mode === "edit" ? "grab" : "default" }}
            onMouseDown={e => { if (e.button !== 0) return; dragRef.current = { type: "pan", sx: e.clientX, sy: e.clientY, ox: canvasOffsetRef.current.x, oy: canvasOffsetRef.current.y }; }}
          />

          {/* Capa de taules (translada amb el pan) */}
          <div style={{ position: "absolute", inset: 0, zIndex: 2, pointerEvents: "none", transform: `translate(${canvasOffset.x}px,${canvasOffset.y}px)` }}>
            {currentTables.map(table => {
              const isSelected = selId === table.id && selType === "table";
              const isRenaming = renaming === table.id;
              const dbTableId = mode === "service" ? getDbTableId(table) : null;
              const status = mode === "service" ? getTableStatus(dbTableId, occupiedTableIds, activeOrders) : null;
              const handleList = isSelected && mode === "edit" ? (table.shape === "round" ? ROUND_HANDLES : RECT_HANDLES) : [];

              const surfaceBg = mode === "service"
                ? status === "waiting" ? "linear-gradient(135deg,#F97316,#EA580C)"
                  : status === "served" ? "linear-gradient(135deg,#3B82F6,#2563EB)"
                    : "linear-gradient(135deg,#22C55E,#16A34A)"
                : "linear-gradient(135deg,#7C3AED,#6D28D9)";

              const surfaceShadow = mode === "service"
                ? status === "waiting" ? "0 4px 14px rgba(249,115,22,.4)"
                  : status === "served" ? "0 4px 14px rgba(59,130,246,.4)"
                    : "0 4px 14px rgba(34,197,94,.35)"
                : isSelected ? "0 0 0 3px #fff,0 0 0 5.5px #7C3AED,0 6px 18px rgba(124,58,237,.4)"
                  : "0 4px 14px rgba(124,58,237,.3)";

              return (
                <div key={table.id}
                  style={{
                    position: "absolute", left: table.x, top: table.y, width: table.w, height: table.h, zIndex: 10, overflow: "visible", pointerEvents: "all",
                    cursor: mode === "edit" ? "grab" : "pointer"
                  }}
                  onMouseDown={e => {
                    if (mode !== "edit") return;
                    e.stopPropagation();
                    if (tool === "addChair") {
                      pushHistory();
                      const rect = wrapRef.current!.getBoundingClientRect(), off = canvasOffsetRef.current;
                      const mx = e.clientX - rect.left - off.x - table.x, my = e.clientY - rect.top - off.y - table.y;
                      let newChair: Chair;
                      if (table.shape === "round") newChair = { id: uid(), angle: Math.atan2(my - table.h / 2, mx - table.w / 2) * 180 / Math.PI };
                      else { const p = nearestPerimeter(mx, my, table.w, table.h); newChair = { id: uid(), side: p.side, pos: p.pos }; }
                      updateTables(zoneRef.current, ts => ts.map(t => t.id === table.id ? { ...t, chairs: [...t.chairs, newChair] } : t));
                      showToast("Cadira afegida"); return;
                    }
                    setSelId(table.id); setSelType("table");
                    dragRef.current = { type: "table", id: table.id, ox: e.clientX - table.x, oy: e.clientY - table.y };
                  }}
                  onClick={e => {
                    if (mode !== "service") return;
                    e.stopPropagation();
                    setPanel(prev => prev?.type === "table" && prev.tableId === table.id ? null : { type: "table", tableId: table.id });
                  }}
                >
                  {/* Superfície de la taula */}
                  <div style={{
                    position: "absolute", inset: 0, borderRadius: table.shape === "round" ? "50%" : 10,
                    background: surfaceBg, boxShadow: surfaceShadow,
                    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2,
                    transition: "box-shadow .15s",
                    outline: isSelected && mode === "edit" ? "2.5px solid #fff" : "none", outlineOffset: 3
                  }}
                    onDoubleClick={e => {
                      if (mode !== "edit") return;
                      e.stopPropagation(); setRenaming(table.id); setRenameVal(String(table.number));
                    }}
                  >
                    {mode === "service" && status && (
                      <div style={{ lineHeight: 1 }}>
                        {status === "waiting" && <IconWaiting />}
                        {status === "served" && <IconServed />}
                        {status === "empty" && <IconEmpty />}
                      </div>
                    )}
                    {isRenaming ? (
                      <input ref={renameRef} value={renameVal} onChange={e => setRenameVal(e.target.value)}
                        onBlur={commitRename} onKeyDown={e => { if (e.key === "Enter") commitRename(); if (e.key === "Escape") setRenaming(null); }}
                        style={{
                          width: 50, background: "rgba(255,255,255,.18)", border: "1.5px solid rgba(255,255,255,.5)",
                          borderRadius: 5, color: "#fff", fontFamily: "Fustat,sans-serif", fontSize: 14, fontWeight: 800, textAlign: "center", outline: "none", padding: "1px 4px"
                        }}
                        onMouseDown={e => e.stopPropagation()} />
                    ) : (
                      <span style={{ fontFamily: "Fustat,sans-serif", fontSize: 14, fontWeight: 800, color: "rgba(255,255,255,.95)", lineHeight: 1 }}>
                        {table.number}
                      </span>
                    )}
                    <span style={{ fontSize: 9, color: "rgba(255,255,255,.55)", fontWeight: 600 }}>{table.chairs.length} pl.</span>
                  </div>

                  {/* Cadires */}
                  {table.chairs.map(ch => {
                    const css = chairCSS(ch, table), isCh = selId === ch.id;
                    const hasAllergy = !!ch.allergy;
                    return (
                      <div key={ch.id} style={{
                        position: "absolute", left: css.left, top: css.top, width: CS, height: CS,
                        background: hasAllergy ? "#D97706" : (isCh ? "#7C3AED" : "#1E1B4B"),
                        borderRadius: "50% 50% 42% 42% / 58% 58% 42% 42%",
                        transform: `rotate(${css.rot}deg)`,
                        boxShadow: hasAllergy ? "0 0 0 2px #fff,0 0 0 3.5px #D97706" : (isCh ? "0 0 0 2px #fff,0 0 0 4px #7C3AED" : "0 2px 5px rgba(15,23,42,.35)"),
                        cursor: mode === "edit" ? "grab" : "pointer", zIndex: 5
                      }}
                        onMouseDown={e => {
                          if (mode !== "edit") return;
                          e.stopPropagation(); setSelId(ch.id); setSelType("chair");
                          dragRef.current = { type: "chair", cid: ch.id, tid: table.id };
                        }}
                        onDoubleClick={e => {
                          if (mode !== "service") return;
                          e.stopPropagation();
                          openChairPanel(ch.id, table.id);
                        }}
                      >
                        {hasAllergy && (
                          <div style={{
                            position: "absolute", top: -4, right: -4, width: 13, height: 13,
                            background: "#FEF3C7", borderRadius: "50%", border: "1.5px solid #D97706",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: 8, fontWeight: "bold", color: "#92400E", zIndex: 6,
                            transform: `rotate(${-css.rot}deg)`
                          }}>!</div>
                        )}
                      </div>
                    );
                  })}

                  {/* Handles de redimensionament */}
                  {handleList.map(h => (
                    <div key={h.n} style={{
                      position: "absolute", width: 10, height: 10, left: h.px * table.w, top: h.py * table.h,
                      background: "#fff", border: "2px solid #7C3AED", borderRadius: 3, zIndex: 30,
                      transform: "translate(-50%,-50%)", cursor: `${h.n}-resize`
                    }}
                      onMouseDown={e => {
                        e.stopPropagation(); e.preventDefault(); pushHistory();
                        dragRef.current = { type: "resize", id: table.id, hname: h.n, sx: e.clientX, sy: e.clientY, ox: table.x, oy: table.y, ow: table.w, oh: table.h };
                      }} />
                  ))}
                </div>
              );
            })}
          </div>
        </div>

        {/* ── PANELL LATERAL ────────────────────────────────────────────────── */}
        <div style={{
          width: panelOpen ? PANEL_W : 0, overflow: "hidden",
          transition: "width .28s cubic-bezier(.34,1.56,.64,1)",
          background: "#0F172A", flexShrink: 0, position: "relative"
        }}>
          {panelOpen && (
            <div style={{
              position: "absolute", top: 0, right: 0, bottom: 0, width: PANEL_W, overflowY: "auto",
              display: "flex", flexDirection: "column"
            }}>

              {panel!.type === "table" && (() => {
                const tbl = currentTables.find(t => t.id === panel!.tableId);
                if (!tbl) return null;
                const dbTableId = getDbTableId(tbl);
                const order = dbTableId ? (activeOrders[dbTableId] ?? null) : null;
                const status = getTableStatus(dbTableId, occupiedTableIds, activeOrders);

                if (showNewOrderForm) return (
                  <NewOrderForm
                    tableNumber={tbl.number}
                    cartItems={cartItems}
                    menuItems={menuItems}
                    onAddDish={(item) => {
                      setCartItems(prev => {
                        const i = prev.findIndex(c => c.menuCardItemId === item.menuCardItemId && c.allergyPerson === item.allergyPerson);
                        if (i !== -1) { const n = [...prev]; n[i] = { ...n[i], qty: n[i].qty + item.qty }; return n; }
                        return [...prev, item];
                      });
                    }}
                    onRemoveItem={i => setCartItems(prev => prev.filter((_, j) => j !== i))}
                    onConfirm={() => confirmNewOrder(tbl)}
                    onBack={() => setShowNewOrderForm(false)}
                  />
                );

                return (
                  <TablePanel
                    table={tbl}
                    order={order}
                    status={status}
                    loading={panelLoading}
                    onClose={() => setPanel(null)}
                    onToggleItem={(orderId, itemId, itemStatus) => {
                      if (dbTableId) toggleItemServed(dbTableId, orderId, itemId, itemStatus);
                    }}
                    onNewOrder={() => setShowNewOrderForm(true)}
                    onCloseTable={() => {
                      if (dbTableId && order) closeTableOrder(dbTableId, order.id, tbl.number);
                    }}
                  />
                );
              })()}

              {panel!.type === "chair" && (() => {
                const tbl = currentTables.find(t => t.id === panel!.tableId);
                const chair = tbl?.chairs.find(c => c.id === (panel as { type: "chair"; chairId: string; tableId: string }).chairId);
                if (!tbl || !chair) return null;
                return (
                  <AllergyPanel
                    table={tbl}
                    chair={chair}
                    draft={allergyDraft}
                    allergens={allergenList}
                    onChange={setAllergyDraft}
                    onToggleTag={tag => setAllergyDraft(d => ({ ...d, tags: d.tags.includes(tag) ? d.tags.filter(t => t !== tag) : [...d.tags, tag] }))}
                    onSave={saveChairAllergy}
                    onRemove={() => {
                      setAllergyDraft({ name: "", tags: [] });
                      updateTables(zoneRef.current, ts => ts.map(t => {
                        if (t.id !== panel!.tableId) return t;
                        return { ...t, chairs: t.chairs.map(c => c.id !== (panel as { type: "chair"; chairId: string; tableId: string }).chairId ? c : { ...c, allergy: undefined }) };
                      }));
                      showToast("Al·lèrgia eliminada");
                    }}
                    onClose={() => setPanel(null)}
                  />
                );
              })()}

            </div>
          )}
        </div>
      </div>

      {/* ── LLEGENDA ───────────────────────────────────────────────────────── */}
      <div style={{
        display: "flex", alignItems: "center", gap: 16, padding: "7px 20px",
        borderTop: "1px solid #F1F5F9", background: "#FAFAFA", flexShrink: 0
      }}>
        <span style={{ fontSize: 11, color: "#94A3B8", fontWeight: 500 }}>
          {currentTables.length} taules · {currentTables.reduce((a, t) => a + t.chairs.length, 0)} places
        </span>
        {mode === "edit" && selId && selType === "table" && (
          <span style={{ fontSize: 11, color: "#7C3AED", fontWeight: 600 }}>
            Taula {currentTables.find(t => t.id === selId)?.number} seleccionada
          </span>
        )}
        {(canvasOffset.x !== 0 || canvasOffset.y !== 0) && (
          <span style={{ fontSize: 11, color: "#94A3B8" }}>
            vista desplaçada ·{" "}
            <button onClick={resetView} style={{ background: "none", border: "none", color: "#7C3AED", cursor: "pointer", fontSize: 11, fontWeight: 600, padding: 0 }}>centrar</button>
          </span>
        )}
        <div style={{ marginLeft: "auto", display: "flex", gap: 14 }}>
          {mode === "service" && [
            { color: "#22C55E", label: "Lliure" },
            { color: "#F97316", label: "Esperant" },
            { color: "#3B82F6", label: "Servit" },
            { color: "#D97706", label: "Al·lèrgia (cadira)" },
          ].map(({ color, label }) => (
            <div key={label} style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <div style={{ width: 9, height: 9, borderRadius: "50%", background: color }} />
              <span style={{ fontSize: 11, color: "#6B7280", fontWeight: 500 }}>{label}</span>
            </div>
          ))}
          {mode === "edit" && [{ color: "#EF4444", label: "Ocupada" }, { color: "#22C55E", label: "Lliure" }, { color: "#7C3AED", label: "Seleccionada" }].map(({ color, label }) => (
            <div key={label} style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <div style={{ width: 9, height: 9, borderRadius: "50%", background: color }} />
              <span style={{ fontSize: 11, color: "#6B7280", fontWeight: 500 }}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── TOAST ──────────────────────────────────────────────────────────── */}
      {toast && (
        <div style={{
          position: "fixed", bottom: 40, left: "50%", transform: "translateX(-50%)",
          background: "#0F172A", color: "rgba(255,255,255,.9)", padding: "9px 20px",
          borderRadius: 10, fontSize: 13, fontFamily: "'Commissioner',sans-serif", fontWeight: 500,
          zIndex: 99999, border: "1px solid rgba(255,255,255,.1)", boxShadow: "0 4px 20px rgba(0,0,0,.3)",
          pointerEvents: "none"
        }}>
          {toast}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SUB-COMPONENTS DEL PANELL LATERAL
// ─────────────────────────────────────────────────────────────────────────────

function PanelHeader({ title, sub, onClose }: { title: string; sub?: string; onClose: () => void }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16, flexShrink: 0 }}>
      <div>
        <div style={{ fontSize: 9, color: "rgba(255,255,255,.3)", textTransform: "uppercase", letterSpacing: "1.5px", fontWeight: 600, marginBottom: 3 }}>{sub || "Taula"}</div>
        <div style={{ fontFamily: "Fustat,sans-serif", fontSize: 28, fontWeight: 800, color: "#fff", lineHeight: 1 }}>{title}</div>
      </div>
      <button onClick={onClose} style={{
        background: "rgba(255,255,255,.08)", border: "none", color: "rgba(255,255,255,.6)",
        width: 28, height: 28, borderRadius: 7, cursor: "pointer", fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
      }}>✕</button>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const cfg: Record<string, { bg: string; color: string; label: string; Icon: () => React.ReactElement }> = {
    empty: { bg: "rgba(34,197,94,.15)", color: "#4ADE80", label: "Lliure", Icon: IconEmpty },
    waiting: { bg: "rgba(249,115,22,.18)", color: "#FB923C", label: "Esperant", Icon: IconWaiting },
    served: { bg: "rgba(59,130,246,.18)", color: "#60A5FA", label: "Servit", Icon: IconServed },
    pending: { bg: "rgba(251,191,36,.15)", color: "#FCD34D", label: "Pendent", Icon: IconWaiting },
    confirmed: { bg: "rgba(124,58,237,.2)", color: "#A78BFA", label: "Confirmada", Icon: IconWaiting },
    ready: { bg: "rgba(34,197,94,.15)", color: "#4ADE80", label: "Llesta", Icon: IconServed },
    closed: { bg: "rgba(255,255,255,.08)", color: "rgba(255,255,255,.4)", label: "Tancada", Icon: IconServed },
  };
  const c = cfg[status] ?? cfg.pending;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5, background: c.bg, color: c.color,
      fontSize: 11, fontWeight: 600, padding: "4px 10px", borderRadius: 6, marginBottom: 14, alignSelf: "flex-start"
    }}>
      <c.Icon />{c.label}
    </span>
  );
}

function TablePanel({ table, order, status, loading, onClose, onToggleItem, onNewOrder, onCloseTable }:
  {
    table: Table; order: ApiOrder | null; status: TableStatus; loading: boolean; onClose: () => void;
    onToggleItem: (orderId: string, itemId: string, status: string) => void;
    onNewOrder: () => void; onCloseTable: () => void
  }) {
  const total = order ? order.items.reduce((s, i) => {
    const item = i as ApiOrderItem & { price?: number };
    return s + (item.price ?? 0);
  }, 0) : 0;

  return (
    <div style={{ padding: "20px 18px", display: "flex", flexDirection: "column", gap: 0, boxSizing: "border-box", width: "100%", minHeight: "100%" }}>
      <PanelHeader title={String(table.number)} onClose={onClose} />
      <StatusBadge status={order?.status ?? status} />

      <div style={{ fontSize: 12, color: "rgba(255,255,255,.35)", marginBottom: 16, fontWeight: 500 }}>
        {table.chairs.length} places
        {table.chairs.filter(c => c.allergy).length > 0 && (
          <span style={{ marginLeft: 8, color: "#FCD34D" }}>· {table.chairs.filter(c => c.allergy).length} al·lèrgia{table.chairs.filter(c => c.allergy).length > 1 ? "es" : ""}</span>
        )}
      </div>

      {loading ? (
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,.3)", fontSize: 12 }}>
          Carregant...
        </div>
      ) : !order ? (
        <div style={{
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8,
          padding: "30px 0", color: "rgba(255,255,255,.25)", textAlign: "center", flex: 1
        }}>
          <span style={{ fontSize: 28 }}>🪑</span>
          <span style={{ fontSize: 12, fontWeight: 500 }}>Cap comanda activa</span>
        </div>
      ) : (
        <>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,.3)", textTransform: "uppercase", letterSpacing: "1px", fontWeight: 700, marginBottom: 8 }}>
            Comanda activa
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
            {order.items.map((item) => (
              <div key={item.id} style={{ background: "rgba(255,255,255,.05)", borderRadius: 10, padding: "10px 12px", boxSizing: "border-box", width: "100%" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
                  <span style={{ fontSize: 12, color: "rgba(255,255,255,.85)", fontWeight: 500, flex: 1, marginRight: 8 }}>{item.name}</span>
                  <span style={{ fontSize: 11, color: "rgba(255,255,255,.4)", whiteSpace: "nowrap" }}>×{item.quantity}</span>
                </div>
                {/* Badge d'al·lèrgia amb nom de la persona */}
                {item.hasAllergenRisk && item.allergyPerson && (
                  <div style={{
                    display: "inline-flex", alignItems: "center", gap: 4, background: "rgba(217,119,6,.2)",
                    borderRadius: 5, padding: "2px 7px", marginBottom: 6, fontSize: 10, color: "#FCD34D", fontWeight: 600
                  }}>
                    ⚠ Al·lèrgia · {item.allergyPerson}
                  </div>
                )}
                {item.hasAllergenRisk && !item.allergyPerson && (
                  <div style={{
                    display: "inline-flex", alignItems: "center", gap: 4, background: "rgba(217,119,6,.2)",
                    borderRadius: 5, padding: "2px 7px", marginBottom: 6, fontSize: 10, color: "#FCD34D", fontWeight: 600
                  }}>
                    ⚠ Modificació al·lèrgia
                  </div>
                )}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                    {item.status === "served"
                      ? <><IconServed /><span style={{ fontSize: 10, color: "#4ADE80", fontWeight: 600 }}>Servit</span></>
                      : <><IconWaiting /><span style={{ fontSize: 10, color: "#FB923C", fontWeight: 600 }}>Esperant</span></>
                    }
                  </div>
                  {item.status !== "served" && (
                    <button onClick={() => onToggleItem(order.id, item.id, item.status)}
                      style={{
                        background: "rgba(34,197,94,.15)", border: "none", borderRadius: 6, cursor: "pointer", padding: "3px 8px",
                        color: "#4ADE80", fontSize: 10, fontWeight: 600
                      }}>
                      ✓ Marcar servit
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
          {total > 0 && (
            <div style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              borderTop: "1px solid rgba(255,255,255,.08)", paddingTop: 12, marginBottom: 16
            }}>
              <span style={{ fontSize: 10, color: "rgba(255,255,255,.35)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px" }}>Total</span>
              <span style={{ fontFamily: "Fustat,sans-serif", fontSize: 20, fontWeight: 800, color: "#fff" }}>{total.toFixed(2)}€</span>
            </div>
          )}
        </>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: "auto", paddingTop: 8 }}>
        <button onClick={onNewOrder}
          style={{
            background: "rgba(124,58,237,.25)", border: "1px solid rgba(124,58,237,.4)", borderRadius: 10,
            color: "#C4B5FD", fontFamily: "'Commissioner',sans-serif", fontSize: 13, fontWeight: 600,
            padding: "10px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6
          }}>
          <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14" /></svg>
          Nova comanda
        </button>
        {order && (
          <button onClick={onCloseTable}
            style={{
              background: "rgba(239,68,68,.15)", border: "1px solid rgba(239,68,68,.3)", borderRadius: 10,
              color: "#FCA5A5", fontFamily: "'Commissioner',sans-serif", fontSize: 13, fontWeight: 600,
              padding: "10px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6
            }}>
            <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 14l-4-4 4-4" /><path d="M5 10h11a4 4 0 000-8h-1" /><path d="M20 14v6M17 17h6" /></svg>
            Tancar compte
          </button>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// FORMULARI NOVA COMANDA (amb carta del backend + captura d'al·lèrgens)
// ─────────────────────────────────────────────────────────────────────────────

function NewOrderForm({ tableNumber, cartItems, menuItems, onAddDish, onRemoveItem, onConfirm, onBack }:
  {
    tableNumber: number | string;
    cartItems: CartItem[];
    menuItems: ApiMenuItem[];
    onAddDish: (item: CartItem) => void;
    onRemoveItem: (i: number) => void;
    onConfirm: () => void;
    onBack: () => void;
  }) {
  const categories = [...new Set(menuItems.map(m => m.category))];
  const [activeCat, setActiveCat] = useState(categories[0] ?? "");
  // Modal al·lèrgen: plat pendent de confirmar
  const [pendingItem, setPendingItem] = useState<ApiMenuItem | null>(null);
  const [allergyPersonName, setAllergyPersonName] = useState("");

  const catItems = menuItems.filter(m => m.category === activeCat && m.isAvailable);
  const totalPrice = cartItems.reduce((s, i) => s + i.qty * i.price, 0);

  const handleDishClick = (m: ApiMenuItem) => {
    if (m.allergens.length > 0) {
      setPendingItem(m);
      setAllergyPersonName("");
    } else {
      onAddDish({ menuCardItemId: m.id, recipeId: m.recipeId, name: m.recipeName, qty: 1, price: m.price, allergens: [], allergyPerson: null });
    }
  };

  const confirmAllergyItem = (withPerson: boolean) => {
    if (!pendingItem) return;
    onAddDish({
      menuCardItemId: pendingItem.id,
      recipeId: pendingItem.recipeId,
      name: pendingItem.recipeName,
      qty: 1,
      price: pendingItem.price,
      allergens: pendingItem.allergens,
      allergyPerson: withPerson && allergyPersonName.trim() ? allergyPersonName.trim() : null,
    });
    setPendingItem(null);
  };

  return (
    <div style={{ padding: "20px 18px", display: "flex", flexDirection: "column", gap: 0, boxSizing: "border-box", width: "100%", minHeight: "100%", position: "relative" }}>

      {/* Modal al·lèrgen */}
      {pendingItem && (
        <div style={{
          position: "absolute", inset: 0, background: "rgba(0,0,0,.7)", zIndex: 50,
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 20, boxSizing: "border-box"
        }}>
          <div style={{ background: "#1E293B", borderRadius: 14, padding: 20, width: "100%", boxSizing: "border-box", border: "1px solid rgba(217,119,6,.3)" }}>
            <div style={{ fontSize: 11, color: "#FCD34D", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 8 }}>
              ⚠ Al·lèrgens detectats
            </div>
            <div style={{ fontSize: 14, color: "#fff", fontWeight: 600, marginBottom: 6 }}>{pendingItem.recipeName}</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 14 }}>
              {pendingItem.allergens.map(a => (
                <span key={a.code} style={{
                  background: "rgba(217,119,6,.2)", border: "1px solid rgba(217,119,6,.4)",
                  borderRadius: 5, padding: "2px 8px", fontSize: 10, color: "#FCD34D", fontWeight: 600
                }}>{a.nameCa}</span>
              ))}
            </div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,.5)", marginBottom: 8 }}>
              Nom de la persona amb al·lèrgia (opcional):
            </div>
            <input
              autoFocus
              value={allergyPersonName}
              onChange={e => setAllergyPersonName(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") confirmAllergyItem(true); if (e.key === "Escape") setPendingItem(null); }}
              placeholder="Ex: Maria García..."
              style={{
                width: "100%", boxSizing: "border-box", background: "rgba(255,255,255,.08)",
                border: "1px solid rgba(217,119,6,.3)", borderRadius: 8, color: "#fff",
                fontFamily: "'Commissioner',sans-serif", fontSize: 13, padding: "9px 12px",
                outline: "none", marginBottom: 12
              }}
            />
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => confirmAllergyItem(true)}
                style={{
                  flex: 1, background: "#D97706", border: "none", borderRadius: 8, color: "#fff",
                  fontFamily: "'Commissioner',sans-serif", fontSize: 12, fontWeight: 600, padding: "9px", cursor: "pointer"
                }}>
                Afegir amb nom
              </button>
              <button onClick={() => confirmAllergyItem(false)}
                style={{
                  flex: 1, background: "rgba(255,255,255,.08)", border: "1px solid rgba(255,255,255,.1)", borderRadius: 8, color: "rgba(255,255,255,.6)",
                  fontFamily: "'Commissioner',sans-serif", fontSize: 12, fontWeight: 600, padding: "9px", cursor: "pointer"
                }}>
                Sense nom
              </button>
            </div>
            <button onClick={() => setPendingItem(null)}
              style={{
                width: "100%", marginTop: 8, background: "none", border: "none", color: "rgba(255,255,255,.3)",
                fontFamily: "'Commissioner',sans-serif", fontSize: 11, cursor: "pointer", padding: "6px"
              }}>
              Cancel·lar
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
        <button onClick={onBack} style={{
          background: "rgba(255,255,255,.08)", border: "none", color: "rgba(255,255,255,.6)",
          width: 28, height: 28, borderRadius: 7, cursor: "pointer", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center"
        }}>←</button>
        <div>
          <div style={{ fontSize: 9, color: "rgba(255,255,255,.3)", textTransform: "uppercase", letterSpacing: "1.5px", fontWeight: 600 }}>Nova comanda</div>
          <div style={{ fontFamily: "Fustat,sans-serif", fontSize: 18, fontWeight: 800, color: "#fff" }}>Taula {tableNumber}</div>
        </div>
      </div>

      {/* Category tabs */}
      <div style={{ display: "flex", gap: 4, marginBottom: 10, flexWrap: "wrap" }}>
        {categories.map(cat => (
          <button key={cat} onClick={() => setActiveCat(cat)}
            style={{
              padding: "4px 10px", border: "none", borderRadius: 6, cursor: "pointer",
              fontFamily: "'Commissioner',sans-serif", fontSize: 11, fontWeight: 600,
              background: activeCat === cat ? "#7C3AED" : "rgba(255,255,255,.07)",
              color: activeCat === cat ? "#fff" : "rgba(255,255,255,.45)", transition: "all .13s"
            }}>
            {cat}
          </button>
        ))}
      </div>

      {/* Menu grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 14 }}>
        {catItems.map(m => {
          const inCart = cartItems.filter(c => c.menuCardItemId === m.id);
          const cartQty = inCart.reduce((s, c) => s + c.qty, 0);
          const hasAllergens = m.allergens.length > 0;
          return (
            <button key={m.id} onClick={() => handleDishClick(m)}
              style={{
                background: cartQty > 0 ? "rgba(124,58,237,.22)" : "rgba(255,255,255,.05)",
                border: `1px solid ${hasAllergens ? "rgba(217,119,6,.4)" : (cartQty > 0 ? "rgba(124,58,237,.45)" : "rgba(255,255,255,.08)")}`,
                borderRadius: 10, padding: "9px 8px", cursor: "pointer", textAlign: "left",
                display: "flex", flexDirection: "column", gap: 3, position: "relative", transition: "all .13s"
              }}>
              <span style={{ fontSize: 11, color: "rgba(255,255,255,.82)", fontWeight: 600, lineHeight: 1.3 }}>{m.recipeName}</span>
              <span style={{ fontSize: 10, color: "rgba(255,255,255,.38)", fontWeight: 500 }}>{m.price.toFixed(2)}€</span>
              {hasAllergens && (
                <span style={{ fontSize: 9, color: "#FCD34D", fontWeight: 600 }}>
                  ⚠ {m.allergens.map(a => a.nameCa).join(", ")}
                </span>
              )}
              {cartQty > 0 && (
                <span style={{
                  position: "absolute", top: 6, right: 6, background: "#7C3AED", color: "#fff",
                  fontSize: 9, fontWeight: 700, borderRadius: 4, padding: "1px 5px", lineHeight: "14px"
                }}>×{cartQty}</span>
              )}
            </button>
          );
        })}
        {catItems.length === 0 && (
          <div style={{ gridColumn: "1/-1", color: "rgba(255,255,255,.25)", fontSize: 11, textAlign: "center", padding: 16 }}>
            {menuItems.length === 0 ? "Carregant menú..." : "Cap plat en aquesta categoria"}
          </div>
        )}
      </div>

      {/* Cart */}
      {cartItems.length > 0 && (
        <>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,.3)", textTransform: "uppercase", letterSpacing: "1px", fontWeight: 700, marginBottom: 6 }}>
            Comanda ({cartItems.length} article{cartItems.length !== 1 ? "s" : ""})
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 5, marginBottom: 10, maxHeight: 130, overflowY: "auto" }}>
            {cartItems.map((item, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "flex-start", justifyContent: "space-between",
                background: "rgba(255,255,255,.06)", borderRadius: 8, padding: "6px 10px", boxSizing: "border-box", width: "100%"
              }}>
                <div style={{ flex: 1, marginRight: 8, minWidth: 0 }}>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,.8)", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {item.name}
                  </div>
                  {item.allergyPerson && (
                    <div style={{ fontSize: 10, color: "#FCD34D", fontWeight: 600 }}>⚠ {item.allergyPerson}</div>
                  )}
                  {item.allergens.length > 0 && !item.allergyPerson && (
                    <div style={{ fontSize: 10, color: "rgba(217,119,6,.8)", fontWeight: 600 }}>⚠ Al·lèrgia sense nom</div>
                  )}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                  {item.price > 0 && <span style={{ fontSize: 10, color: "rgba(255,255,255,.4)" }}>{(item.qty * item.price).toFixed(2)}€</span>}
                  <span style={{ fontSize: 10, color: "rgba(255,255,255,.3)", background: "rgba(255,255,255,.08)", padding: "1px 5px", borderRadius: 4 }}>×{item.qty}</span>
                  <button onClick={() => onRemoveItem(i)} style={{ background: "none", border: "none", color: "rgba(255,255,255,.3)", cursor: "pointer", fontSize: 13, padding: 0, lineHeight: 1 }}>✕</button>
                </div>
              </div>
            ))}
          </div>
          {totalPrice > 0 && (
            <div style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              borderTop: "1px solid rgba(255,255,255,.08)", paddingTop: 8, marginBottom: 10
            }}>
              <span style={{ fontSize: 10, color: "rgba(255,255,255,.35)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px" }}>Total</span>
              <span style={{ fontFamily: "Fustat,sans-serif", fontSize: 18, fontWeight: 800, color: "#fff" }}>{totalPrice.toFixed(2)}€</span>
            </div>
          )}
        </>
      )}

      <button onClick={onConfirm} disabled={cartItems.length === 0}
        style={{
          background: cartItems.length ? "#7C3AED" : "rgba(255,255,255,.1)", border: "none", borderRadius: 10,
          color: cartItems.length ? "#fff" : "rgba(255,255,255,.3)", fontFamily: "'Commissioner',sans-serif",
          fontSize: 13, fontWeight: 600, padding: "11px", cursor: cartItems.length ? "pointer" : "default",
          marginTop: "auto", transition: "all .2s"
        }}>
        {cartItems.length ? `Confirmar · ${totalPrice > 0 ? totalPrice.toFixed(2) + "€" : cartItems.length + " plats"}` : "Afegeix plats al menú"}
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PANELL D'AL·LÈRGIA DE CADIRA (edició local del mapa)
// ─────────────────────────────────────────────────────────────────────────────

function AllergyPanel({ table, chair, draft, allergens, onChange, onToggleTag, onSave, onRemove, onClose }:
  {
    table: Table; chair: Chair; draft: { name: string; tags: string[] };
    allergens: AllergenOption[];
    onChange: (d: { name: string; tags: string[] }) => void;
    onToggleTag: (tag: string) => void; onSave: () => void; onRemove: () => void; onClose: () => void
  }) {
  const hasAllergy = chair.allergy !== undefined;
  return (
    <div style={{ padding: "20px 18px", display: "flex", flexDirection: "column", gap: 0, boxSizing: "border-box", width: "100%", minHeight: "100%" }}>
      <PanelHeader title={`Cadira`} sub={`Taula ${table.number}`} onClose={onClose} />

      <div style={{
        display: "flex", alignItems: "center", gap: 10, marginBottom: 20,
        background: "rgba(255,255,255,.05)", borderRadius: 10, padding: "10px 14px", boxSizing: "border-box", width: "100%"
      }}>
        <div style={{
          width: 28, height: 28, borderRadius: "50%",
          background: draft.name || draft.tags.length ? "#D97706" : "#1E1B4B",
          boxShadow: draft.name || draft.tags.length ? "0 0 0 3px rgba(217,119,6,.3)" : "none",
          transition: "all .2s", flexShrink: 0
        }} />
        <div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,.7)", fontWeight: 600 }}>
            {draft.name || draft.tags.length ? "Cadira amb al·lèrgia" : "Cadira sense al·lèrgia"}
          </div>
          {hasAllergy && chair.allergy!.name && (
            <div style={{ fontSize: 11, color: "rgba(255,255,255,.35)" }}>{chair.allergy!.name}</div>
          )}
        </div>
      </div>

      <div style={{ fontSize: 10, color: "rgba(255,255,255,.35)", textTransform: "uppercase", letterSpacing: "1px", fontWeight: 700, marginBottom: 6 }}>
        Nom del client
      </div>
      <input value={draft.name} placeholder="Ex: Maria García..."
        onChange={e => onChange({ ...draft, name: e.target.value })}
        style={{
          background: "rgba(255,255,255,.08)", border: "1px solid rgba(255,255,255,.12)", borderRadius: 8,
          color: "#fff", fontFamily: "'Commissioner',sans-serif", fontSize: 13, padding: "9px 12px",
          outline: "none", marginBottom: 16, width: "100%", boxSizing: "border-box" as const
        }} />

      <div style={{ fontSize: 10, color: "rgba(255,255,255,.35)", textTransform: "uppercase", letterSpacing: "1px", fontWeight: 700, marginBottom: 8 }}>
        Al·lèrgens
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 20 }}>
        {allergens.map(a => {
          const active = draft.tags.includes(a.id);
          return (
            <button key={a.id} onClick={() => onToggleTag(a.id)}
              style={{
                background: active ? "rgba(217,119,6,.25)" : "rgba(255,255,255,.07)",
                border: `1px solid ${active ? "rgba(217,119,6,.5)" : "rgba(255,255,255,.1)"}`,
                borderRadius: 8, padding: "5px 10px", cursor: "pointer",
                color: active ? "#FCD34D" : "rgba(255,255,255,.5)",
                fontFamily: "'Commissioner',sans-serif", fontSize: 11, fontWeight: 600, transition: "all .13s"
              }}>
              {a.emoji} {a.label}
            </button>
          );
        })}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: "auto" }}>
        <button onClick={onSave}
          style={{
            background: "#D97706", border: "none", borderRadius: 10, color: "#fff",
            fontFamily: "'Commissioner',sans-serif", fontSize: 13, fontWeight: 600,
            padding: "11px", cursor: "pointer"
          }}>
          Desar al·lèrgia
        </button>
        {(hasAllergy || draft.name || draft.tags.length > 0) && (
          <button onClick={onRemove}
            style={{
              background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.1)", borderRadius: 10,
              color: "rgba(255,255,255,.4)", fontFamily: "'Commissioner',sans-serif", fontSize: 12, fontWeight: 600,
              padding: "9px", cursor: "pointer"
            }}>
            Eliminar al·lèrgia
          </button>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENTS AUXILIARS
// ─────────────────────────────────────────────────────────────────────────────

function Pill({ children, bg, color, dot }: { children: React.ReactNode; bg: string; color: string; dot: string }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, background: bg, color, fontSize: 11, fontWeight: 600, padding: "3px 9px", borderRadius: 6 }}>
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: dot, display: "inline-block" }} />
      {children}
    </span>
  );
}

function ZoneTabs({ zone, onZone }: { zone: string; onZone: (z: "indoor" | "terrassa") => void }) {
  return (
    <div style={{ display: "flex", background: "#F1F5F9", borderRadius: 10, padding: 3, gap: 2 }}>
      {(["indoor", "terrassa"] as const).map(z => (
        <button key={z} onClick={() => onZone(z)}
          style={{
            padding: "5px 14px", border: "none", borderRadius: 8, cursor: "pointer",
            fontFamily: "'Commissioner',sans-serif", fontSize: 12, fontWeight: 600,
            background: zone === z ? "#0F172A" : "transparent", color: zone === z ? "#fff" : "#6B7280", transition: "all .15s"
          }}>
          {z === "indoor" ? "Interior" : "Terrassa"}
        </button>
      ))}
    </div>
  );
}

function IconBtn({ children, onClick, title, active }: { children: React.ReactNode; onClick: () => void; title: string; active: boolean }) {
  const [hov, setHov] = useState(false);
  return (
    <button onClick={onClick} title={title}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        width: 32, height: 32, border: "1px solid #E5E7EB", borderRadius: 8,
        background: active ? "#0F172A" : (hov ? "#F8FAFC" : "#fff"),
        cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
        color: active ? "#fff" : (hov ? "#0F172A" : "#6B7280"), fontSize: 13, transition: "all .15s"
      }}>
      {children}
    </button>
  );
}

function TBtn({ children, onClick, active, danger, disabled, title }: {
  children: React.ReactNode; onClick: () => void;
  active?: boolean; danger?: boolean; disabled?: boolean; title?: string;
}) {
  const [hov, setHov] = useState(false);
  return (
    <button onClick={onClick} disabled={disabled} title={title}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        display: "flex", alignItems: "center", gap: 5, padding: "5px 10px", border: "none", borderRadius: 8,
        cursor: disabled ? "not-allowed" : "pointer", fontFamily: "'Commissioner',sans-serif", fontSize: 12, fontWeight: 600,
        opacity: disabled ? .4 : 1, transition: "all .13s",
        background: active ? "#7C3AED" : (danger && hov ? "rgba(239,68,68,.1)" : (hov ? "#E2E8F0" : "transparent")),
        color: active ? "#fff" : (danger ? "#EF4444" : "#374151"),
      }}>
      {children}
    </button>
  );
}
