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
    if (error.response && error.response.status === 401) {
      // Solo mostrar el toast y redirigir si no se ha manejado ya
      if (!isSessionExpired) {
        isSessionExpired = true;
        console.error(
          "No autenticado: Redirigiendo al inicio de sesión en 3 segundos..."
        );
        localStorage.removeItem("token");
        errorToast(
          "SESIÓN EXPIRADA",
          "Redirigiendo al inicio de sesión en 3 segundos"
        );
        setTimeout(() => {
          window.location.href = "/";
        }, 3000);
      }
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
