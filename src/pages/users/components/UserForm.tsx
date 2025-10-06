import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, Loader } from "lucide-react";
import {
  userCreateSchema,
  userUpdateSchema,
  type UserSchema,
} from "../lib/User.schema";
import { FormSelect } from "@/components/FormSelect";
import type { TypeUserResource } from "@/pages/type-users/lib/typeUser.interface";
import { useEffect, useState } from "react";

interface MetricFormProps {
  defaultValues: Partial<UserSchema>;
  onSubmit: (data: any) => void;
  onCancel?: () => void;
  isSubmitting?: boolean;
  mode?: "create" | "update";
  typeUsers: TypeUserResource[];
}

export const UserForm = ({
  onCancel,
  defaultValues,
  onSubmit,
  isSubmitting = false,
  mode = "create",
  typeUsers,
}: MetricFormProps) => {
  const form = useForm({
    resolver: zodResolver(
      mode === "create" ? userCreateSchema : userUpdateSchema
    ),
    defaultValues: {
      ...defaultValues,
    },
    mode: "onChange",
  });

  const type_person = form.watch("type_person");
  const type_document = form.watch("type_document");

  // Función para obtener la longitud máxima del documento según su tipo
  const getMaxLength = (docType: string) => {
    switch (docType) {
      case "RUC":
        return 11;
      case "DNI":
        return 8;
      case "CE":
        return 12;
      case "PASAPORTE":
        return 9;
      default:
        return 0;
    }
  };

  // Función para validar si el número de documento actual es compatible con el nuevo tipo
  const isDocumentNumberCompatible = (
    currentNumber: string,
    newDocType: string
  ) => {
    if (!currentNumber) return true;
    const maxLength = getMaxLength(newDocType);
    return currentNumber.length <= maxLength;
  };

  // useEffect para manejar cambios en type_document
  useEffect(() => {
    if (!type_document) return;

    const currentDocumentNumber = form.getValues("number_document");

    // Siempre limpiar el número de documento cuando cambia el tipo
    form.setValue("number_document", "");

    // Si el número actual no es compatible con el nuevo tipo, forzar limpieza
    if (
      !isDocumentNumberCompatible(currentDocumentNumber ?? "", type_document)
    ) {
      form.setValue("number_document", "");
    }

    // Limpiar campos según el tipo de documento y persona
    if (type_document === "DNI") {
      form.setValue("business_name", "");
      // Si DNI, debe ser persona natural
      form.setValue("type_person", "NATURAL");
    } else if (type_document === "RUC") {
      form.setValue("names", "");
      form.setValue("father_surname", "");
      form.setValue("mother_surname", "");
      // Si RUC, debe ser persona jurídica
      form.setValue("type_person", "JURIDICA");
    }

    // Forzar revalidación después de cambiar los valores
    setTimeout(() => {
      form.trigger(["type_person", "type_document", "number_document"]);
    }, 0);
  }, [type_document]);

  // useEffect para manejar cambios en type_person
  useEffect(() => {
    if (!type_person) return;

    // Limpiar campos según el tipo de persona
    if (type_person === "NATURAL") {
      form.setValue("business_name", "");
      // Si es natural, no puede tener RUC
      const currentDocType = form.getValues("type_document");
      if (currentDocType === "RUC") {
        form.setValue("type_document", "DNI");
        form.setValue("number_document", "");
      }
    } else if (type_person === "JURIDICA") {
      form.setValue("names", "");
      form.setValue("father_surname", "");
      form.setValue("mother_surname", "");
      // Si es jurídica, debe tener RUC
      form.setValue("type_document", "RUC");
      form.setValue("number_document", "");
    }

    // Forzar revalidación después de cambiar los valores
    setTimeout(() => {
      form.trigger(["type_person", "type_document", "number_document"]);
    }, 0);
  }, [type_person]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 w-full">
        <div className="bg-tertiary rounded-lg p-6 space-y-4">
          <div className="grid grid-cols-1">
            <FormSelect
              control={form.control}
              name="rol_id"
              label="Tipo de Usuario"
              placeholder="Seleccione tipo de usuario"
              options={typeUsers!.map((type) => ({
                value: type.id.toString(),
                label: type.name,
              }))}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormSelect
              control={form.control}
              name="type_document"
              label="Tipo de Documento"
              placeholder="Seleccione tipo de documento"
              options={[
                { value: "DNI", label: "DNI" },
                { value: "RUC", label: "RUC" },
                {
                  value: "CE",
                  label: "Carnet de Extranjería",
                },
                {
                  value: "PASAPORTE",
                  label: "Pasaporte",
                },
              ]}
            />

            <FormSelect
              control={form.control}
              name="type_person"
              label="Tipo de Persona"
              placeholder="Seleccione tipo de persona"
              options={[
                { value: "NATURAL", label: "Natural" },
                { value: "JURIDICA", label: "Juridica" },
              ]}
            />

            <FormField
              control={form.control}
              name="number_document"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-normal">
                    Número de Documento
                    {type_document && (
                      <span className="text-xs text-muted-foreground ml-2">
                        ({getMaxLength(type_document)} dígitos)
                      </span>
                    )}
                  </FormLabel>
                  <FormControl>
                    <Input
                      maxLength={getMaxLength(type_document ?? "")}
                      placeholder={`Número de Documento${
                        type_document
                          ? ` (${getMaxLength(type_document)} dígitos)`
                          : ""
                      }`}
                      {...field}
                      onChange={(e) => {
                        // Solo permitir números
                        const value = e.target.value.replace(/\D/g, "");
                        field.onChange(value);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {type_person === "NATURAL" && (
              <>
                <FormField
                  control={form.control}
                  name="names"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-normal">
                        Nombres
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Juan" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="father_surname"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-normal">
                        Apellido Paterno
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Perez" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="mother_surname"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-normal">
                        Apellido Materno
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Gomez" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            {type_person === "JURIDICA" && (
              <FormField
                control={form.control}
                name="business_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-normal">
                      Razón Social
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Razón Social" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-normal">
                    Dirección
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Dirección" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-normal">
                    Teléfono
                  </FormLabel>
                  <FormControl>
                    <Input
                      maxLength={9}
                      placeholder="Teléfono"
                      {...field}
                      onChange={(e) => {
                        // Solo permitir números
                        const value = e.target.value.replace(/\D/g, "");
                        field.onChange(value);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-normal">
                    Correo Electrónico
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="Correo Electrónico"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-normal">Usuario</FormLabel>
                  <FormControl>
                    <Input placeholder="Usuario" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => {
                const [showPassword, setShowPassword] = useState(false);
                return (
                  <FormItem>
                    <FormLabel className="text-sm font-normal">
                      Contraseña {mode === "update" && "(Opcional)"}
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder={
                            mode === "update"
                              ? "Dejar vacío para mantener actual"
                              : "Contraseña"
                          }
                          {...field}
                        />
                        <button
                          type="button"
                          className="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer hover:text-primary text-muted-foreground"
                          onClick={() => setShowPassword((prev) => !prev)}
                          tabIndex={-1}
                        >
                          {showPassword ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />
          </div>
        </div>

        {/* Botones */}
        <div className="flex justify-end gap-4">
          <Button type="button" variant="neutral" onClick={onCancel}>
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting || !form.formState.isValid}
          >
            <Loader
              className={`mr-2 h-4 w-4 ${!isSubmitting ? "hidden" : ""}`}
            />
            {isSubmitting
              ? "Guardando"
              : mode === "create"
              ? "Crear Usuario"
              : "Actualizar Usuario"}
          </Button>
        </div>
      </form>
    </Form>
  );
};
