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

export interface ErrorResponse {
  success: false;
  error: {
    code: ErrorCode;
    message: string;
    details?: Record<string, unknown>;
  };
  meta: {
    timestamp: string;
    pagination?: {
      page: number;
      hasNext: boolean;
    };
  };
}

async function api<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...options?.headers,
  };

  const token = localStorage.getItem("accessToken");
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const error: ErrorResponse = await res.json();
    throw new APIError(
      error.error.code,
      res.status,
      error.error.message,
    );
  }

  return res.json();
}
// Allergens
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
  list: () => api<{ success: boolean; data: Allergen[] }>("/allergens"),
  getById: (id: string) => api<{ success: boolean; data: Allergen }>(`/allergens/${id}`),
  getByEuNumber: (euNumber: number) => api<{ success: boolean; data: Allergen }>(`/allergens/eu/${euNumber}`),
  search: (q: string) => api<{ success: boolean; data: Allergen[] }>(`/allergens/search?q=${encodeURIComponent(q)}`),
  create: (body: Omit<Allergen, "id" | "createdAt">) =>
    api<{ success: boolean; data: Allergen }>("/allergens", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  delete: (id: string) =>
    api<{ success: boolean }>(`/allergens/${id}`, {
      method: "DELETE",
    }),
};

// Sessions
export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export const sessionService = {
  login: (email: string, password: string) =>
    api<{ success: boolean; data: TokenPair }>("/sessions", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
    refresh: (refreshToken: string) =>
      api<{ success: boolean; data: TokenPair }>("/sessions", {
        method: "PUT",
        body: JSON.stringify({ refreshToken }),
      }),
    logout: () =>
      api<{ success: boolean }>("/sessions", {
        method: "DELETE",
      }),
  };

// Users
export interface User {
  id: string;
  name: string;
  email: string;
  role: string; // Example: "admin", "kitchen", "waiter"
  isActive: boolean;
  createdAt: string;
}

export const userService = {
  getById: (id: string) => api<{ success: boolean; data: User }>(`/users/${id}`),
  delete: (id: string) =>
    api<{ success: boolean }>(`/users/${id}`, {
      method: "DELETE",
    }),
};


// Recipes
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
  getById: (id: string) => api<{ success: boolean; data: Recipe }>(`/recipes/${id}`),
  getAll: () => api<{ success: boolean; data: Recipe[] }>("/recipes"),
  getIngredients: (recipeId: string) => api<{ success: boolean; data: RecipeIngredientDetail[] }>(`/recipes/${recipeId}/ingredients`),
};