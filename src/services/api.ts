const API_URL = import.meta.env.VITE_API_URL;

export async function api(endpoint: string, options?: RequestInit) {
  const res = await fetch(`${API_URL}${endpoint}`, {
    headers: { "Content-Type": "application/json" },
    ...options
  });

  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export const getMenus = () => api("/menus");
export const getDishes = () => api("/dishes");
