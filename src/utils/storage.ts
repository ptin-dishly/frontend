import type { User } from "../services/api";

/**
 * Get current authenticated user from localStorage
 */
export function getCurrentUser(): User | null {
  try {
    const userStr = localStorage.getItem("currentUser");
    if (!userStr) return null;
    return JSON.parse(userStr) as User;
  } catch (err) {
    console.error("Failed to parse currentUser from localStorage:", err);
    localStorage.removeItem("currentUser");
    return null;
  }
}

/**
 * Set current user in localStorage
 */
export function setCurrentUser(user: User): void {
  localStorage.setItem("currentUser", JSON.stringify(user));
}

/**
 * Clear current user from localStorage
 */
export function clearCurrentUser(): void {
  localStorage.removeItem("currentUser");
}

/**
 * Get access token from localStorage
 */
export function getAccessToken(): string | null {
  return localStorage.getItem("accessToken");
}

/**
 * Get refresh token from localStorage
 */
export function getRefreshToken(): string | null {
  return localStorage.getItem("refreshToken");
}

/**
 * Set both tokens in localStorage
 */
export function setTokens(accessToken: string, refreshToken: string): void {
  localStorage.setItem("accessToken", accessToken);
  localStorage.setItem("refreshToken", refreshToken);
}

/**
 * Clear both tokens from localStorage
 */
export function clearTokens(): void {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
}

/**
 * Clear all authentication data from localStorage
 */
export function clearAllAuth(): void {
  clearTokens();
  clearCurrentUser();
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  return !!getAccessToken();
}

/**
 * Get user role
 */
export function getUserRole(): string | null {
  const user = getCurrentUser();
  return user?.role || null;
}