import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, Loader } from "lucide-react";
import {
  userCreateSchema,
  userUpdateSchema,
  type UserSchema,
} from "../lib/User.schema";
import { FormSelect } from "@/components/FormSelect";
import { FormInput } from "@/components/FormInput";
import type { TypeUserResource } from "@/pages/type-users/lib/typeUser.interface";
import { useState, useEffect } from "react";
import React from "react";
import { useAllCompanies } from "@/pages/company/lib/company.hook";
import {
  DocumentNumberField,
  type FieldsFromSearch,
} from "./DocumentNumberField";

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
  const { data: companies, isLoading: loadingCompanies, refetch } =
    useAllCompanies();

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

  const [showPassword, setShowPassword] = useState(false);
  const [fieldsFromSearch, setFieldsFromSearch] = useState<FieldsFromSearch>({
    names: false,
    father_surname: false,
    mother_surname: false,
    business_name: false,
    address: false,
  });

  useEffect(() => {
    refetch();
  }, []);

  // Lógica de validación entre tipo de persona y tipo de documento
  const getValidDocumentTypes = (personType: string) => {
    if (personType === "NATURAL") {
      return ["DNI", "CE", "PASAPORTE"];
    } else if (personType === "JURIDICA") {
      return ["RUC"];
    }
    return ["DNI", "RUC", "CE", "PASAPORTE"];
  };

  // Filtrar opciones de tipo de documento según el tipo de persona
  const documentTypeOptions = [
    { value: "DNI", label: "DNI" },
    { value: "RUC", label: "RUC" },
    { value: "CE", label: "Carnet de Extranjería" },
    { value: "PASAPORTE", label: "Pasaporte" },
  ].filter((option) =>
    getValidDocumentTypes(type_person ?? "").includes(option.value)
  );

  // Resetear el tipo de documento si no es válido para el tipo de persona seleccionado
  React.useEffect(() => {
    if (
      type_person &&
      type_document &&
      !getValidDocumentTypes(type_person).includes(type_document)
    ) {
      form.setValue("type_document", undefined);
      form.setValue("number_document", "");
    }
  }, [type_person, type_document, form]);

  // Preparar opciones para el selector de empresas
  const companyOptions =
    companies?.map((company) => ({
      value: company.id.toString(),
      label: company.trade_name || company.social_reason,
    })) || [];

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6 w-full"
        autoComplete="off"
      >
        {/* Campos señuelo para evitar que el navegador autocomplete usuario/contraseña */}
        <input
          type="text"
          name="username"
          autoComplete="username"
          className="hidden"
          tabIndex={-1}
        />
        <input
          type="password"
          name="password"
          autoComplete="new-password"
          className="hidden"
          tabIndex={-1}
        />
        <div className="bg-tertiary rounded-lg p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

            <FormSelect
              control={form.control}
              name="company_id"
              label="Empresa"
              placeholder="Seleccione una empresa"
              options={companyOptions}
              disabled={loadingCompanies}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormSelect
              control={form.control}
              name="type_document"
              label="Tipo de Documento"
              placeholder="Seleccione tipo de documento"
              options={documentTypeOptions}
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

            <DocumentNumberField
              form={form}
              typeDocument={type_document}
              setFieldsFromSearch={setFieldsFromSearch}
            />

            {type_person === "NATURAL" && (
              <>
                <FormInput
                  control={form.control}
                  name="names"
                  label="Nombres"
                  placeholder="Juan"
                  disabled={fieldsFromSearch.names}
                />
                <FormInput
                  control={form.control}
                  name="father_surname"
                  label="Apellido Paterno"
                  placeholder="Perez"
                  disabled={fieldsFromSearch.father_surname}
                />
                <FormInput
                  control={form.control}
                  name="mother_surname"
                  label="Apellido Materno"
                  placeholder="Gomez"
                  disabled={fieldsFromSearch.mother_surname}
                />
              </>
            )}

            {type_person === "JURIDICA" && (
              <FormInput
                control={form.control}
                name="business_name"
                label="Razón Social"
                placeholder="Razón Social"
                disabled={fieldsFromSearch.business_name}
              />
            )}

            <FormInput
              control={form.control}
              name="address"
              label="Dirección"
              placeholder="Dirección"
              disabled={fieldsFromSearch.address}
            />

            <FormInput
              control={form.control}
              name="phone"
              label="Teléfono"
              placeholder="Teléfono"
              maxLength={9}
            />

            <FormInput
              control={form.control}
              name="email"
              label="Correo Electrónico"
              type="email"
              placeholder="Correo Electrónico"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              control={form.control}
              name="username"
              label="Usuario"
              placeholder="Usuario"
              autoComplete="off"
            />

            <FormInput
              control={form.control}
              name="password"
              label="Contraseña"
              type={showPassword ? "text" : "password"}
              placeholder="Contraseña"
              autoComplete="new-password"
              addonEnd={
                <button
                  type="button"
                  className="cursor-pointer hover:text-primary text-muted-foreground"
                  onClick={() => setShowPassword((prev) => !prev)}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              }
            />
          </div>
        </div>

        {/* Botones */}
        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" size="sm" onClick={onCancel}>
            Cancelar
          </Button>
          <Button
            size="sm"
            type="submit"
            disabled={isSubmitting || !form.formState.isValid}
          >
            <Loader
              className={`mr-2 h-4 w-4 ${!isSubmitting ? "hidden" : ""}`}
            />
            {isSubmitting ? "Guardando" : "Guardar Usuario"}
          </Button>
        </div>
      </form>
    </Form>
  );
};
