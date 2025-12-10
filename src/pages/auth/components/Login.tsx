"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { login } from "../lib/auth.actions";
import { errorToast, successToast } from "@/lib/core.function";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAllCompanies } from "@/pages/company/lib/company.hook";
import { FormSelect } from "@/components/FormSelect";
import { useMemo } from "react";

const formSchema = z.object({
  username: z
    .string()
    .nonempty("El usuario no puede estar vacío")
    .max(50, "El usuario no puede tener más de 50 caracteres"),
  password: z
    .string()
    .nonempty("La contraseña no puede estar vacía")
    .max(50, "La contraseña no puede tener más de 50 caracteres"),
  company_id: z.string().nonempty("Debe seleccionar una empresa"),
});

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { data: companies, isLoading: isLoadingCompanies } = useAllCompanies();

  const companyOptions = useMemo(() => {
    if (!companies) return [];
    return companies.map((company) => ({
      value: company.id.toString(),
      label: company.trade_name || company.social_reason,
      description: company.ruc,
    }));
  }, [companies]);

  console.log("Companies:", companyOptions);

  const companiesMock = [
    { value: "1", label: "Empresa A", description: "RUC: 1234567890" },
    { value: "2", label: "Empresa B", description: "RUC: 0987654321" },
  ];

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      password: "",
      company_id: "1",
    },
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      await login({
        username: data.username,
        password: data.password,
        company_id: Number(data.company_id),
      });
      successToast("Inicio de sesión exitoso");
      navigate("/inicio");
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Error al iniciar sesión.";
      console.error("Detalles del error:", errorMessage);
      errorToast(errorMessage ?? "Error al iniciar sesión");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center bg-muted/50 justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="bg-background rounded-2xl shadow-lg p-8 border">
          {/* Profile Icon and Branding */}
          <div className="text-start mb-8">
            <div className="text-base font-extrabold text-primary">
              Grupo El Milagro
            </div>
            <div className="text-xs font-semibold text-muted-foreground ">
              Sistema de Gestión de Nutrimentos para animales
            </div>
          </div>

          {/* Login Form */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <h3 className="flex justify-start text-foreground text-lg font-bold text-center mb-6">
                Iniciar sesión
              </h3>

              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-foreground ">
                        Usuario
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Ingresa usuario"
                          className="text-sm text-foreground rounded-lg focus:outline-none focus-visible:ring-0 focus-visible:ring-transparent"
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-foreground ">
                        Contraseña
                      </FormLabel>
                      <div className="relative">
                        <FormControl>
                          <Input
                            {...field}
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••••"
                            className="text-sm text-foreground  rounded-lg focus:outline-none focus-visible:ring-0 focus-visible:ring-transparent"
                          />
                        </FormControl>
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-primary"
                        >
                          {showPassword ? (
                            <EyeOff size={18} className="text-primary" />
                          ) : (
                            <Eye size={18} />
                          )}
                        </button>
                      </div>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                <FormSelect
                  name="company_id"
                  label="Empresa"
                  placeholder={
                    isLoadingCompanies
                      ? "Cargando empresas..."
                      : "Selecciona una empresa"
                  }
                  options={companiesMock}
                  control={form.control}
                  disabled={isLoadingCompanies}
                />
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                variant="default"
                className="w-full"
              >
                {isLoading ? "Iniciando sesión..." : "Iniciar sesión"}
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
