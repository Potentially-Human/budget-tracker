import { API_URL } from "./constants";

// Helper to handle JSON errors safely
const parseError = async (res, fallback) => {
  try {
    const data = await res.json();
    return new Error(data.detail || fallback);
  } catch {
    return new Error(fallback);
  }
};

export const api = {
  // ============ AUTH ============
  register: async (data) => {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw await parseError(res, "Registration failed");
    return res.json();
  },

  login: async (email, password) => {
    const fd = new URLSearchParams();
    fd.append("username", email);
    fd.append("password", password);
    const res = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: fd,
    });
    if (!res.ok) throw await parseError(res, "Login failed");
    return res.json();
  },

  getMe: async (token) => {
    const res = await fetch(`${API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Failed to get user");
    return res.json();
  },

  // ============ TRANSACTIONS ============
  addTransaction: async (token, data) => {
    const res = await fetch(`${API_URL}/transactions`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw await parseError(res, "Failed to add transaction");
    return res.json();
  },

  getTransactions: async (token) => {
    const res = await fetch(`${API_URL}/transactions`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return [];
    return res.json();
  },

  // ============ BUDGETS ============
  addBudget: async (token, data) => {
    const res = await fetch(`${API_URL}/budgets`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw await parseError(res, "Failed to create budget");
    return res.json();
  },

  getBudgets: async (token) => {
    const res = await fetch(`${API_URL}/budgets`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return [];
    return res.json();
  },

  // ============ AI INSIGHTS ============
  getNarrative: async (token, period) => {
    const res = await fetch(`${API_URL}/insights/narrative`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ time_period: period }),
    });
    if (!res.ok) throw await parseError(res, "Failed to generate narrative");
    return res.json();
  },

  // ============ PEER GROUPS ============
  joinPeerGroup: async (token) => {
    const res = await fetch(`${API_URL}/peer_groups/join`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw await parseError(res, "Failed to join peer group");
    return res.json();
  },

  getPeerComparison: async (token) => {
    const res = await fetch(`${API_URL}/peer_groups/compare`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw await parseError(res, "Failed to get peer comparison");
    return res.json();
  },
};