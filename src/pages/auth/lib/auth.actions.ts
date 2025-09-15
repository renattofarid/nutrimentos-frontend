import { api } from "@/lib/config";
import { useAuthStore } from "./auth.store";
import type { AuthResponse } from "./auth.interface";

// Define el tipo para los datos de inicio de sesión
export interface LoginBody {
  username: string;
  password: string;
}

export async function login(body: LoginBody): Promise<AuthResponse> {
  try {
    const { data } = await api.post<AuthResponse>("/login", body);

    const { setToken, setUser, setAccess } = useAuthStore.getState();

    setToken(data.token);
    setUser(data.user);
    setAccess(data.access);

    return data;
  } catch (error) {
    console.error("Error en login:", error);
    throw error;
  }
}

export async function authenticate(): Promise<AuthResponse> {
  try {
    const { data } = await api.get<AuthResponse>("/authenticate");
    const { setUser } = useAuthStore.getState();

    setUser(data.user);

    return data;
  } catch (error) {
    console.error("Error en authenticate:", error);
    throw error;
  }
}

export async function logout(): Promise<void> {
  try {
    const { token, clearAuth } = useAuthStore.getState();
    if (!token) throw new Error("Token no disponible");

    // await api.get("/logout", {
    //   headers: {
    //     Authorization: `Bearer ${token}`,
    //   },
    // });

    clearAuth();
  } catch (error) {
    console.error("Error en logout:", error);
    throw error;
  }
}

export async function updateEmail(newEmail: string): Promise<void> {
  try {
    await api.post("/confirmEmail", { email: newEmail });
  } catch (error) {
    console.error("Error en updateEmail:", error);
    throw error;
  }
}
