const API_URL = import.meta.env.VITE_API_URL;

export type ErrorCode =
  | "VALIDATION_ERROR"
  | "INVALID_REQUEST"
  | "INVALID_ID"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "AUTH_REQUIRED"
  | "INVALID_PASSWORD"
  | "NOT_FOUND"
  | "USER_NOT_FOUND"
  | "DUPLICATE_RESOURCE"
  | "USER_INACTIVE"
  | "USER_NO_PASSWORD"
  | "ACCESS_DENIED"
  | "INTERNAL_ERROR"
  | "CREATE_ERROR"
  | "UPDATE_ERROR"
  | "DELETE_ERROR"
  | "RETRIEVE_ERROR"
  | "DB_ERROR";

export class APIError extends Error {
  constructor(
    public code: ErrorCode,
    public statusCode: number,
    message: string,
  ) {
    super(message);
    this.name = "APIError";
  }
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: {
    code: ErrorCode;
    message: string;
    details?: Record<string, unknown>;
  };
  meta?: {
    timestamp: string;
  };
}

async function api<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...options?.headers,
  };

  const token = localStorage.getItem("accessToken");
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  try {
    console.log(`📡 Making request to: ${API_URL}${endpoint}`);
    
    const res = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    console.log(`📊 Response status: ${res.status}`);
    console.log(`📋 Response headers:`, {
      contentType: res.headers.get("content-type"),
    });

    let data: ApiResponse<T>;

    try {
      const text = await res.text();
      console.log(`📝 Response text:`, text);

      if (!text) {
        if (res.ok) {
          return { success: true, data: undefined as T } as ApiResponse<T>;
        }
        throw new APIError(
          "INTERNAL_ERROR" as ErrorCode,
          res.status,
          "Empty response from server"
        );
      }

      data = JSON.parse(text) as ApiResponse<T>;
    } catch (parseErr) {
      console.error("❌ JSON Parse Error:", parseErr);
      throw new APIError(
        "INTERNAL_ERROR" as ErrorCode,
        res.status,
        `Invalid JSON response from server`
      );
    }

    if (!res.ok) {
      console.error(`❌ API Error:`, data);
      throw new APIError(
        data.error?.code || ("INTERNAL_ERROR" as ErrorCode),
        res.status,
        data.error?.message || data.message || "Unknown error from server",
      );
    }

    console.log(`✅ Success response:`, data);
    return data;
  } catch (err) {
    if (err instanceof APIError) {
      console.error(`❌ APIError caught:`, err.message);
      throw err;
    }
    console.error(`❌ Unexpected error:`, err);
    throw new Error(`API request failed: ${String(err)}`);
  }
}

// ============================================================================
// SESSIONS
// ============================================================================

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export const sessionService = {
  login: (email: string, password: string) =>
    api<TokenPair>("/sessions", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  refresh: (refreshToken: string) =>
    api<TokenPair>("/sessions", {
      method: "PUT",
      body: JSON.stringify({ refreshToken }),
    }),
  logout: () =>
    api<void>("/sessions", {
      method: "DELETE",
    }),
};

// ============================================================================
// USERS
// ============================================================================

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

export const userService = {
  getMe: () => api<User>("/users/me"),
  getById: (id: string) => api<User>(`/users/:id`, {
    method: "GET",
  }),
  update: (id: string, data: Partial<User>) =>
    api<User>(`/users/:id`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    api<void>(`/users/:id`, {
      method: "DELETE",
    }),
};

// ============================================================================
// ALLERGENS
// ============================================================================

export interface Allergen {
  id: string;
  code: string;
  nameEs: string;
  nameCa: string;
  nameEn: string;
  iconUrl: string | null;
  description: string | null;
  euNumber: number;
  createdAt: string;
}

export interface IngredientAllergen {
  id: string;
  ingredientId: string;
  allergenId: string;
  nameEs?: string;
  allergen?: Allergen;
}

export interface Ingredient {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  establishmentId: string;
  allergens?: IngredientAllergen[];
  createdAt: string;
  updatedAt: string;
}

export const allergenService = {
  getAll: () => api<Allergen[]>("/allergens"),
  getById: (id: string) => api<Allergen>(`/allergens/${id}`),
  getByEuNumber: (euNumber: number) => api<Allergen>(`/allergens/eu/${euNumber}`),
  search: (q: string) => api<Allergen[]>(`/allergens/search?q=${encodeURIComponent(q)}`),
  getByIngredient: (ingredientId: string) =>
    api<Allergen[]>(`/allergens/ingredient/${ingredientId}`),
  create: (data: Partial<Allergen>) =>
    api<Allergen>("/allergens", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id: string, data: Partial<Allergen>) =>
    api<Allergen>(`/allergens/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    api<void>(`/allergens/${id}`, {
      method: "DELETE",
    }),
};

export const ingredientService = {
  getAll: () => api<Ingredient[]>("/ingredients"),
  getById: (id: string) => api<Ingredient>(`/ingredients/${id}`),
  getAllergens: (ingredientId: string) =>
    api<IngredientAllergen[]>(`/ingredients/${ingredientId}/allergens`),
  search: (q: string) =>
    api<Ingredient[]>(`/ingredients/search?q=${encodeURIComponent(q)}`),
  create: (data: Partial<Ingredient>) =>
    api<Ingredient>("/ingredients", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id: string, data: Partial<Ingredient>) =>
    api<Ingredient>(`/ingredients/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    api<void>(`/ingredients/${id}`, {
      method: "DELETE",
    }),
};

// ============================================================================
// RECIPES
// ============================================================================

export interface Recipe {
  id: string;
  establishment_id: string;
  name: string;
  description: string | null;
  category: string;
  portion_size_kg: number;
  servings: number;
  preparation_time: number;
  version: number;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface RecipeIngredientDetail {
  id: string;
  recipeId: string;
  ingredientId: string;
  name: string;
  quantity: number;
  unit: string;
  isOptional: boolean;
  allergens?: IngredientAllergen[];
}

export const recipeService = {
  getAll: () => api<Recipe[]>("/recipes"),
  getById: (id: string) => api<Recipe>(`/recipes/${id}`),
  getIngredients: (recipeId: string) =>
    api<RecipeIngredientDetail[]>(`/recipes/${recipeId}/ingredients`),
  getByAllergen: (allergenId: string) =>
    api<Recipe[]>(`/recipes/allergens/${allergenId}`),
  create: (data: Omit<Recipe, "id" | "created_at" | "updated_at" | "created_by" | "version">) =>
    api<Recipe>("/recipes", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id: string, data: Partial<Recipe>) =>
    api<Recipe>(`/recipes/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    api<void>(`/recipes/${id}`, {
      method: "DELETE",
    }),
};

// ============================================================================
// MENUS
// ============================================================================

export interface Menu {
  id: string;
  establishmentId: string;
  name: string;
  isPublic: boolean;
  qrCodeUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface MenuItem {
  id: string;
  menuCardId: string;
  recipeId: string;
  recipeName: string;
  recipeDescription: string;
  category: string;
  price: number;
  displayOrder: number;
  isAvailable: boolean;
  preparationTime: number;
  portionSizeKg: number;
  servings: number;
  version: number;
  establishmentId: string;
  createdBy: string;
  ingredients?: RecipeIngredientDetail[];
}

export const menuService = {
  getAll: () => api<Menu[]>("/menus"),
  getById: (id: string) => api<Menu>(`/menus/${id}`),
  getItems: () => api<MenuItem[]>("/menu-card-items"),
  getByAllergen: (allergenId: string) =>
    api<Menu[]>(`/menus/allergen/${allergenId}`),
  create: (data: Omit<Menu, "id" | "createdAt" | "updatedAt">) =>
    api<Menu>("/menus", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id: string, data: Partial<Menu>) =>
    api<Menu>(`/menus/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    api<void>(`/menus/${id}`, {
      method: "DELETE",
    }),
};

// ============================================================================
// TABLES (FAKE DATA - No API endpoint)
// ============================================================================

export interface Table {
  id: string;
  number: number;
  capacity: number;
  status: "available" | "occupied" | "reserved";
  currentOrder?: string;
}

const FAKE_TABLES: Table[] = [
  { id: "1", number: 1, capacity: 2, status: "available" },
  { id: "2", number: 2, capacity: 4, status: "occupied", currentOrder: "Order #001" },
  { id: "3", number: 3, capacity: 6, status: "reserved" },
  { id: "4", number: 4, capacity: 2, status: "available" },
  { id: "5", number: 5, capacity: 4, status: "occupied", currentOrder: "Order #002" },
];

export const tableService = {
  getAll: async (): Promise<ApiResponse<Table[]>> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true, data: FAKE_TABLES });
      }, 500);
    });
  },
  getById: async (id: string): Promise<ApiResponse<Table>> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const table = FAKE_TABLES.find((t) => t.id === id);
        if (table) {
          resolve({ success: true, data: table });
        } else {
          reject(new APIError("NOT_FOUND", 404, "Table not found"));
        }
      }, 500);
    });
  },
};

// ============================================================================
// ORDERS (FAKE DATA - No API endpoint)
// ============================================================================

export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  tableNumber: string;
  status: "pending" | "in_progress" | "ready" | "completed";
  items: OrderItem[];
  total: number;
  createdAt: string;
}

let FAKE_ORDERS: Order[] = [
  {
    id: "1",
    orderNumber: "#001",
    tableNumber: "2",
    status: "pending",
    items: [
      { id: "1", name: "Lasaña de carne", quantity: 1, price: 15.5 },
      { id: "2", name: "Salmón a la plancha", quantity: 2, price: 18.0 },
    ],
    total: 51.5,
    createdAt: "2026-05-02T10:30:00Z",
  },
  {
    id: "2",
    orderNumber: "#002",
    tableNumber: "5",
    status: "in_progress",
    items: [{ id: "3", name: "Crema catalana", quantity: 1, price: 8.5 }],
    total: 8.5,
    createdAt: "2026-05-02T10:45:00Z",
  },
  {
    id: "3",
    orderNumber: "#003",
    tableNumber: "3",
    status: "ready",
    items: [{ id: "4", name: "Ensalada César", quantity: 3, price: 12.0 }],
    total: 36.0,
    createdAt: "2026-05-02T11:00:00Z",
  },
];

export const orderService = {
  getAll: async (): Promise<ApiResponse<Order[]>> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true, data: FAKE_ORDERS });
      }, 500);
    });
  },
  getById: async (id: string): Promise<ApiResponse<Order>> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const order = FAKE_ORDERS.find((o) => o.id === id);
        if (order) {
          resolve({ success: true, data: order });
        } else {
          reject(new APIError("NOT_FOUND", 404, "Order not found"));
        }
      }, 500);
    });
  },
  updateStatus: async (
    id: string,
    status: Order["status"]
  ): Promise<ApiResponse<Order>> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const orderIndex = FAKE_ORDERS.findIndex((o) => o.id === id);
        if (orderIndex !== -1) {
          FAKE_ORDERS[orderIndex].status = status;
          resolve({ success: true, data: FAKE_ORDERS[orderIndex] });
        } else {
          reject(new APIError("NOT_FOUND", 404, "Order not found"));
        }
      }, 500);
    });
  },
};

// ============================================================================
// BOOKINGS (FAKE DATA - No API endpoint)
// ============================================================================

export interface Booking {
  id: string;
  name: string;
  email: string;
  phone: string;
  date: string;
  time: string;
  guests: number;
  specialRequests?: string;
  status: "confirmed" | "pending" | "cancelled";
}

let FAKE_BOOKINGS: Booking[] = [
  {
    id: "B001",
    name: "Maria Garcia",
    email: "maria.garcia@email.com",
    phone: "666123456",
    date: "2026-05-15",
    time: "20:00",
    guests: 4,
    specialRequests: "Birthday celebration",
    status: "confirmed",
  },
  {
    id: "B002",
    name: "Joan Martínez",
    email: "joan.martinez@email.com",
    phone: "666234567",
    date: "2026-05-16",
    time: "19:30",
    guests: 2,
    status: "confirmed",
  },
  {
    id: "B003",
    name: "Anna López",
    email: "anna.lopez@email.com",
    phone: "666345678",
    date: "2026-05-17",
    time: "21:00",
    guests: 6,
    specialRequests: "Vegetarian options needed",
    status: "pending",
  },
  {
    id: "B004",
    name: "Pere Sanchez",
    email: "pere.sanchez@email.com",
    phone: "666456789",
    date: "2026-05-18",
    time: "20:30",
    guests: 3,
    status: "confirmed",
  },
  {
    id: "B005",
    name: "Laura Fernandez",
    email: "laura.fernandez@email.com",
    phone: "666567890",
    date: "2026-05-19",
    time: "19:00",
    guests: 8,
    specialRequests: "Wedding celebration",
    status: "pending",
  },
  {
    id: "B006",
    name: "Carlos Ruiz",
    email: "carlos.ruiz@email.com",
    phone: "666678901",
    date: "2026-05-20",
    time: "20:00",
    guests: 5,
    status: "cancelled",
  },
  {
    id: "B007",
    name: "Sofía Moreno",
    email: "sofia.moreno@email.com",
    phone: "666789012",
    date: "2026-05-21",
    time: "19:30",
    guests: 2,
    status: "confirmed",
  },
  {
    id: "B008",
    name: "Miguel González",
    email: "miguel.gonzalez@email.com",
    phone: "666890123",
    date: "2026-05-22",
    time: "21:00",
    guests: 4,
    specialRequests: "Anniversary dinner",
    status: "confirmed",
  },
];

export const bookingService = {
  getAll: async (): Promise<ApiResponse<Booking[]>> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true, data: FAKE_BOOKINGS });
      }, 500);
    });
  },
  getById: async (id: string): Promise<ApiResponse<Booking>> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const booking = FAKE_BOOKINGS.find((b) => b.id === id);
        if (booking) {
          resolve({ success: true, data: booking });
        } else {
          reject(new APIError("NOT_FOUND", 404, "Booking not found"));
        }
      }, 500);
    });
  },
  updateStatus: async (
    id: string,
    status: Booking["status"]
  ): Promise<ApiResponse<Booking>> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const bookingIndex = FAKE_BOOKINGS.findIndex((b) => b.id === id);
        if (bookingIndex !== -1) {
          FAKE_BOOKINGS[bookingIndex].status = status;
          resolve({ success: true, data: FAKE_BOOKINGS[bookingIndex] });
        } else {
          reject(new APIError("NOT_FOUND", 404, "Booking not found"));
        }
      }, 500);
    });
  },
};