import axios from "axios";
import { isMobile } from "./store";

const BACKEND = process.env.REACT_APP_BACKEND_URL;
export const API = BACKEND ? `${BACKEND}/api` : null;

export function sessionId() {
  let id = sessionStorage.getItem("ett_sid");
  if (!id) {
    id = Math.random().toString(36).slice(2) + Date.now().toString(36);
    sessionStorage.setItem("ett_sid", id);
  }
  return id;
}

const device = () => (isMobile() ? "mobile" : "desktop");

export function track(type, data = {}) {
  if (!API || navigator.onLine === false) return;
  axios.post(`${API}/events`, { type, session_id: sessionId(), device: device(), ...data }).catch(() => {});
}

let sent = 0;
export function logError(message, stack, level = "error") {
  if (!API || sent > 30) return;
  sent += 1;
  axios.post(`${API}/logs`, {
    level,
    message: String(message || "Errore sconosciuto").slice(0, 2000),
    stack: stack ? String(stack).slice(0, 6000) : null,
    url: window.location.href.slice(0, 500),
    user_agent: navigator.userAgent.slice(0, 400),
    session_id: sessionId(),
  }).catch(() => {});
}

export function installErrorLogging() {
  window.addEventListener("error", (e) => {
    if (e?.message?.includes("ResizeObserver")) return;
    logError(e.message, e.error?.stack);
  });
  window.addEventListener("unhandledrejection", (e) => {
    logError(`Promise rifiutata: ${e.reason?.message || e.reason}`, e.reason?.stack);
  });
}

export function formatApiError(detail) {
  if (detail == null) return "Qualcosa è andato storto. Riprova.";
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) return detail.map((e) => e?.msg || JSON.stringify(e)).join(" ");
  return detail.msg || String(detail);
}

export const adminApi = () => {
  const token = sessionStorage.getItem("ett_admin_token");
  return axios.create({ baseURL: API, headers: token ? { Authorization: `Bearer ${token}` } : {} });
};
