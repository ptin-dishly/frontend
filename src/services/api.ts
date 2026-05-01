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

    // Check if response indicates an error
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

export const allergenService = {
  list: () => api<Allergen[]>("/allergens"),
  getById: (id: string) => api<Allergen>(`/allergens/${id}`),
  getByEuNumber: (euNumber: number) => api<Allergen>(`/allergens/eu/${euNumber}`),
  search: (q: string) => api<Allergen[]>(`/allergens/search?q=${encodeURIComponent(q)}`),
  create: (body: Omit<Allergen, "id" | "createdAt">) =>
    api<Allergen>("/allergens", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  delete: (id: string) =>
    api<void>(`/allergens/${id}`, {
      method: "DELETE",
    }),
};

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
  role: string; // "admin", "kitchen", "waiter", etc.
  isActive: boolean;
  createdAt: string;
}

export const userService = {
  // Get current authenticated user
  getMe: () => api<User>("/users/me"),
  
  // Get user by ID (admin only)
  getById: (id: string) => api<User>(`/users/${id}`),
  
  // Delete user by ID (admin only)
  delete: (id: string) =>
    api<void>(`/users/${id}`, {
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
}

export const recipeService = {
  getById: (id: string) => api<Recipe>(`/recipes/${id}`),
  getAll: () => api<Recipe[]>("/recipes"),
  getIngredients: (recipeId: string) => api<RecipeIngredientDetail[]>(`/recipes/${recipeId}/ingredients`),
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
  menuId: string;
  recipeId: string;
  name: string;
  category: string;
  price: number;
  description: string | null;
  imageUrl: string | null;
}

export const menuService = {
  getAll: () => api<Menu[]>("/menus"),
  getById: (id: string) => api<Menu>(`/menus/${id}`),
};