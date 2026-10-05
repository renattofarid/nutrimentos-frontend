import axios from "axios";
import { errorToast } from "./core.function";

const API_BASE =
  import.meta.env.VITE_API_BASE_URL ??
  "https://develop.garzasoft.com:82/nutrimentos/public";

const baseURL = `${API_BASE}/api`;
export const prodAssetURL = `${API_BASE}/`;

export const prodAssetStorageURL = `${API_BASE}/storage/`;

export const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
    "X-Requested-With": "XMLHttpRequest",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Flag global para prevenir múltiples notificaciones de sesión expirada
let isSessionExpired = false;

// Interceptor para manejar respuestas y errores
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const status = error.response?.status;
    const message = String(error.response?.data?.message ?? "");
    const isUnauthenticated =
      status === 401 || /unauthenticated/i.test(message);
    // El login mismo devuelve 401 con credenciales inválidas: no es sesión expirada
    const isLoginRequest = String(error.config?.url ?? "").includes("/login");

    if (isUnauthenticated && !isLoginRequest && !isSessionExpired) {
      isSessionExpired = true;
      ["token", "user", "access", "message"].forEach((k) =>
        localStorage.removeItem(k)
      );
      errorToast("SESIÓN EXPIRADA", "Inicia sesión nuevamente");
      // Recarga completa: el store se reinicia sin token y App muestra el Login
      window.location.replace("/");
    }
    return Promise.reject(error);
  }
);

export const APP_LOCALE = "es-PE";

// Company por defecto para el login. Ya no se muestra en el formulario;
// se puede sobreescribir con VITE_DEFAULT_COMPANY_ID en el .env
export const DEFAULT_COMPANY_ID = Number(
  import.meta.env.VITE_DEFAULT_COMPANY_ID ?? 1
);

// Nombre de la empresa para esta instancia (branding: login, título, etc.)
export const APP_COMPANY_NAME =
  import.meta.env.VITE_APP_COMPANY_NAME ?? "Grupo El Milagro";

export const APP_COMPANY_SHORT_NAME =
  import.meta.env.VITE_APP_COMPANY_SHORT_NAME ??
  "Sistema de Gestión Empresarial";
