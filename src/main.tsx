import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import "@fontsource/poppins/100.css";
import "@fontsource/poppins/200.css";
import "@fontsource/poppins/300.css";
import "@fontsource/poppins/400.css";
import "@fontsource/poppins/500.css";
import "@fontsource/poppins/600.css";
import "@fontsource/poppins/700.css";
import "@fontsource/poppins/800.css";
import "@fontsource/poppins/900.css";
import { ReactQueryProvider } from "./providers/ReactQueryProvider.tsx";
import { Toaster } from "./components/ui/sonner.tsx";
import { DEFAULT_COMPANY_ID } from "./lib/config.ts";

// Acento visual (color de header, etc.) de esta instancia según la empresa
// configurada en el .env. AuthInitializer puede sobreescribirlo una vez
// autenticado el usuario, si su company_id difiere.
document.documentElement.dataset.company = String(DEFAULT_COMPANY_ID);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ReactQueryProvider>
      <App />
      <Toaster />
    </ReactQueryProvider>
  </StrictMode>,
);
