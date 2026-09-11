// Robust API URL resolution: handles local relative proxy and production Render/Vercel URLs
const rawEnvUrl = (import.meta.env.VITE_API_URL || "").trim().replace(/\/+$/, "");
const BASE = (!rawEnvUrl || rawEnvUrl.includes(":4000") || rawEnvUrl.includes("localhost"))
  ? "/api"
  : (rawEnvUrl.endsWith("/api") ? rawEnvUrl : `${rawEnvUrl}/api`);

let token = null;
export function setToken(t) { token = t; }
export function getToken() { return token; }

async function request(path, { method = "GET", body } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;
  try {
    const res = await fetch(`${BASE}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
    let data;
    try { data = await res.json(); } catch { data = {}; }
    if (!res.ok) throw new Error(data.error || "Something went wrong");
    return data;
  } catch (err) {
    if (err.name === "TypeError" && err.message?.toLowerCase().includes("fetch")) {
      // If direct relative call had an issue or was blocked
      console.error("[SICP API] Fetch error connecting to", `${BASE}${path}`, err);
      throw new Error("Unable to connect to the portal server. Please check your connection or reload the page.");
    }
    throw err;
  }
}

export const api = {
  register: (payload) => request("/auth/register", { method: "POST", body: payload }),
  login: (payload) => request("/auth/login", { method: "POST", body: payload }),
  me: () => request("/auth/me"),
  googleAuth: (payload) => request("/auth/google", { method: "POST", body: payload }),
  getGoogleAuthUrl: (redirectUri) => request(`/auth/google/url${redirectUri ? `?redirect_uri=${encodeURIComponent(redirectUri)}` : ""}`),
  sendOtp: (payload) => request("/auth/otp/send", { method: "POST", body: payload }),
  verifyOtp: (payload) => request("/auth/otp/verify", { method: "POST", body: payload }),

  listProblems: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/problems${qs ? "?" + qs : ""}`);
  },
  getProblem: (id) => request(`/problems/${id}`),
  publicImpact: () => request("/problems/public/impact"),
  organisations: () => request("/problems/organisations"),
  submitProblem: (payload) => request("/problems", { method: "POST", body: payload }),

  approve: (id, university) => request(`/problems/${id}/approve`, { method: "POST", body: { university } }),
  reject: (id, reason) => request(`/problems/${id}/reject`, { method: "POST", body: { reason } }),
  formTeam: (id, payload) => request(`/problems/${id}/form-team`, { method: "POST", body: payload }),
  requestIndustry: (id) => request(`/problems/${id}/request-industry`, { method: "POST" }),
  submitProposal: (id, payload) => request(`/problems/${id}/submit-proposal`, { method: "POST", body: payload }),
  approveBudget: (id) => request(`/problems/${id}/approve-budget`, { method: "POST" }),
  rejectBudget: (id) => request(`/problems/${id}/reject-budget`, { method: "POST" }),
  resubmit: (id) => request(`/problems/${id}/resubmit`, { method: "POST" }),
  updateProgress: (id, progress) => request(`/problems/${id}/progress`, { method: "POST", body: { progress } }),
  complete: (id, payload) => request(`/problems/${id}/complete`, { method: "POST", body: payload }),

  chatbot: (message, lang) => request("/chatbot", { method: "POST", body: { message, lang } }),
};
