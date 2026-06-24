import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
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
import { FormInput } from "@/components/FormInput";
import { useFormLayout, FormLayoutContext } from "@/components/GroupFormSection";
import {
  Loader,
  Search,
  Paperclip,
  IdCard,
  ChevronDown,
  ChevronUp,
  Save,
  X,
  MapPin,
  Plus,
  Check,
  Trash2,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  personCreateSchema,
  personCreateSchemaClient,
  personCreateSchemaWorker,
  personCreateSchemaDriver,
  type PersonSchema,
  type PersonSchemaClient,
} from "../lib/person.schema";
import { FormSelect } from "@/components/FormSelect";
import {
  searchDNI,
  searchRUC,
  isValidData,
} from "@/lib/document-search.service";
import type { PersonResource } from "../lib/person.interface";
import { DatePickerFormField } from "@/components/DatePickerFormField";
import { useAllDocumentTypes } from "@/pages/document-type/lib/document-type.hook";
import type { DocumentTypeResource } from "@/pages/document-type/lib/document-type.interface";
import { useAllJobPositions } from "@/pages/jobposition/lib/jobposition.hook";
import type { JobPositionResource } from "@/pages/jobposition/lib/jobposition.interface";
import { useAllBusinessTypes } from "@/pages/businesstype/lib/businesstype.hook";
import type { BusinessTypeResource } from "@/pages/businesstype/lib/businesstype.interface";
import { usePriceList } from "@/pages/pricelist/lib/pricelist.hook";
import type { PriceList } from "@/pages/pricelist/lib/pricelist.interface";
import {
  assignClientToPriceList,
  getPersonAssignedPriceList,
} from "@/pages/pricelist/lib/pricelist.actions";
import { TYPE_DOCUMENT } from "../lib/person.constants";
import { GroupFormSection } from "@/components/GroupFormSection";
import { Skeleton } from "@/components/ui/skeleton";

import { useAllZones } from "@/pages/zone/lib/zone.hook";
import type { ZoneResource } from "@/pages/zone/lib/zone.interface";
import {
  createPersonZone,
  updatePersonZone,
} from "@/pages/client/lib/personzone.actions";
import { CLIENT } from "@/pages/client/lib/client.interface";

interface StagedAddress {
  zone_id: string;
  address: string;
  reference?: string;
  is_primary: boolean;
}

interface NumberDocumentContentProps {
  field: any;
  errors: any;
  fieldsFromSearch: { names: boolean };
  dirtyFields: any;
  document_type_id: string;
  isSearching: boolean;
  handleDocumentSearch: () => void;
}

function NumberDocumentContent({
  field,
  errors,
  fieldsFromSearch,
  dirtyFields,
  document_type_id,
  isSearching,
  handleDocumentSearch,
}: NumberDocumentContentProps) {
  const { horizontal, labelWidth } = useFormLayout();

  const labelText = <p className="leading-none">Número de Documento</p>;

  const inputEl = (
    <FormControl>
      <div className="relative">
        <Input
          placeholder={
            document_type_id === TYPE_DOCUMENT.DNI.id
              ? "Ingrese 8 dígitos"
              : document_type_id === TYPE_DOCUMENT.RUC.id
                ? "Ingrese 11 dígitos"
                : document_type_id === "CE"
                  ? "Ingrese 8-9 dígitos"
                  : document_type_id === "PASAPORTE"
                    ? "Ingrese 8-11 caracteres"
                    : "Ingrese el número"
          }
          {...field}
          className={`h-8 
            ${fieldsFromSearch.names ? "bg-blue-50 border-blue-200" : ""}
            ${errors.number_document ? "border-destructive focus-visible:ring-destructive" : ""}
            ${dirtyFields.number_document && !errors.number_document ? "border-primary" : ""}
          `}
          maxLength={
            document_type_id === TYPE_DOCUMENT.DNI.id
              ? 8
              : document_type_id === TYPE_DOCUMENT.RUC.id
                ? 11
                : document_type_id === "CE"
                  ? 9
                  : 11
          }
          onChange={(e) => {
            let value;
            if (
              document_type_id === TYPE_DOCUMENT.DNI.id ||
              document_type_id === TYPE_DOCUMENT.RUC.id ||
              document_type_id === "CE"
            ) {
              value = e.target.value.replace(/\D/g, "");
            } else {
              value = e.target.value.replace(/[^a-zA-Z0-9]/g, "");
            }
            field.onChange(value);
            if (
              value &&
              ((document_type_id === TYPE_DOCUMENT.DNI.id &&
                value.length === 8) ||
                (document_type_id === TYPE_DOCUMENT.RUC.id &&
                  value.length === 11))
            ) {
              setTimeout(() => handleDocumentSearch(), 100);
            }
          }}
        />
        {(document_type_id === TYPE_DOCUMENT.DNI.id ||
          document_type_id === TYPE_DOCUMENT.RUC.id) && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
            onClick={handleDocumentSearch}
            disabled={isSearching || !field.value}
          >
            {isSearching ? (
              <Loader className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
          </Button>
        )}
      </div>
    </FormControl>
  );

  if (horizontal) {
    return (
      <FormItem className="flex flex-row items-center gap-3">
        <FormLabel className={`${labelWidth} shrink-0 justify-end text-right text-sm font-bold uppercase dark:text-muted-foreground`}>
          {labelText}
        </FormLabel>
        <div className="flex-1 min-w-0 flex flex-col gap-0.5">
          {inputEl}
          <FormMessage />
        </div>
      </FormItem>
    );
  }

  return (
    <FormItem>
      <FormLabel className={errors.number_document ? "text-destructive" : ""}>
        {labelText}
      </FormLabel>
      {inputEl}
      <FormMessage />
    </FormItem>
  );
}

interface PersonFormProps {
  initialData?: PersonResource | null;
  onSubmit: (data: PersonSchema | PersonSchemaClient) => Promise<number | void>;
  onAfterSubmit?: () => void;
  isSubmitting?: boolean;
  onCancel?: () => void;
  roleId: number; // Role ID to assign automatically
  isWorker?: boolean; // If true, only allow DNI and NATURAL person
  isClient?: boolean; // If true, number_document is optional
  isDriver?: boolean; // If true, driver_license is required
  showJobPosition?: boolean; // Show job position field
  showBusinessType?: boolean; // Show business type field
  showZone?: boolean; // Show zone field
  showDirection?: boolean; // Show address field
  showPriceList?: boolean; // Show price list field for clients
  labelWidth?: string; // Tailwind width class for horizontal labels, e.g. "w-32", "w-48", "w-56"
}

export const PersonForm = ({
  initialData,
  onSubmit,
  onAfterSubmit,
  isSubmitting = false,
  onCancel,
  roleId,
  isWorker = false,
  isClient = false,
  isDriver = false,
  showJobPosition = false,
  showBusinessType = false,
  showZone = false,
  showDirection = true,
  showPriceList = false,
  labelWidth = "w-32",
}: PersonFormProps) => {
  const isEditing = !!initialData;
  const primaryZone =
    initialData?.person_zones?.find((pz) => pz.is_primary) ??
    initialData?.person_zones?.[0];
  const queryClient = useQueryClient();

  // Use client schema if isClient is true
  const schema = isClient
    ? personCreateSchemaClient
    : isWorker
      ? personCreateSchemaWorker
      : isDriver
        ? personCreateSchemaDriver
        : personCreateSchema;
  type FormSchema = PersonSchema | PersonSchemaClient;

  const form = useForm<FormSchema>({
    resolver: zodResolver(schema),
    defaultValues: {
      document_type_id:
        initialData?.document_type_id?.toString() || TYPE_DOCUMENT.DNI.id,
      type_person:
        (initialData?.type_person as "NATURAL" | "JURIDICA") || "NATURAL",
      number_document: initialData?.number_document ?? "",
      names: initialData?.names || "",
      gender: (initialData?.gender as "M" | "F" | "O") || "M",
      birth_date: initialData?.birth_date || "",
      father_surname: initialData?.father_surname || "",
      mother_surname: "",
      business_name: initialData?.business_name || "",
      commercial_name: initialData?.commercial_name || "",
      address: primaryZone?.address || initialData?.address || "",
      phone: initialData?.phone || "",
      email: initialData?.email || "",
      role_id: roleId.toString(),
      job_position_id: initialData?.job_position_id?.toString() || "",
      business_type_id: initialData?.business_type_id?.toString() || "",
      client_category_id: initialData?.client_category?.id.toString() || "",
      zone_id:
        primaryZone?.zone_id?.toString() ||
        initialData?.zone_id?.toString() ||
        "",
      driver_license: initialData?.driver_license || "",
      reference: primaryZone?.reference || "",
    },
    mode: "onChange", // Validate on change for immediate feedback
  });

  const type_person = form.watch("type_person");
  const document_type_id = form.watch("document_type_id");
  const [isSearching, setIsSearching] = useState(false);
  const [showExtraFields, setShowExtraFields] = useState(false);
  const [stagedAddresses, setStagedAddresses] = useState<StagedAddress[]>([]);
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [newAddrZoneId, setNewAddrZoneId] = useState("");
  const [newAddrAddress, setNewAddrAddress] = useState("");
  const [newAddrReference, setNewAddrReference] = useState("");

  const nonPrimaryZones = isEditing
    ? (initialData?.person_zones?.filter((pz) => pz.id !== primaryZone?.id) ??
      [])
    : [];

  // Ref to track if document type change triggered person type change
  const documentChangeRef = useRef(false);

  // Get all document types from API
  const { data: documentTypes, isLoading: isLoadingDocumentTypes } =
    useAllDocumentTypes();
  const { data: zones, isLoading: isLoadingZones } = useAllZones();

  // Get optional data from API
  const { data: jobPositions, isLoading: isLoadingJobPositions } =
    useAllJobPositions();
  const { data: businessTypes, isLoading: isLoadingBusinessTypes } =
    useAllBusinessTypes();
  const { data: priceLists, isLoading: isLoadingPriceLists } = usePriceList();

  // Update document_type_id when document_type_id changes
  useEffect(() => {
    if (documentTypes) {
      const selectedDocType = documentTypes.find(
        (dt: DocumentTypeResource) => dt.id.toString() === document_type_id,
      );
      if (selectedDocType) {
        form.setValue("document_type_id", selectedDocType.id.toString(), {
          shouldValidate: true,
        });
      }
    }
  }, [document_type_id, documentTypes, form]);

  // Get form state for better UX
  const { errors, dirtyFields } = form.formState;
  const [fieldsFromSearch, setFieldsFromSearch] = useState({
    names: false,
    father_surname: false,
    mother_surname: false,
    business_name: false,
    address: false,
  });

  // Auto-set person type based on document type
  // This handles when user changes document type first
  useEffect(() => {
    if (
      document_type_id === TYPE_DOCUMENT.DNI.id &&
      type_person !== "NATURAL"
    ) {
      documentChangeRef.current = true; // Mark that this change came from document type
      form.setValue("type_person", "NATURAL", { shouldValidate: false });
      // Reset the flag after a brief moment
      setTimeout(() => {
        documentChangeRef.current = false;
      }, 50);
    } else if (
      document_type_id === TYPE_DOCUMENT.RUC.id &&
      type_person !== "JURIDICA"
    ) {
      documentChangeRef.current = true; // Mark that this change came from document type
      form.setValue("type_person", "JURIDICA", { shouldValidate: false });
      // Reset the flag after a brief moment
      setTimeout(() => {
        documentChangeRef.current = false;
      }, 50);
    }
  }, [document_type_id, form]);

  // Auto-select first zone when creating and zones load
  useEffect(() => {
    if (!isEditing && zones && zones.length > 0 && !form.getValues("zone_id")) {
      form.setValue("zone_id", zones[0].id.toString(), {
        shouldValidate: false,
      });
    }
  }, [zones, isEditing, form]);

  // Load existing price list assignment when editing
  useEffect(() => {
    if (isEditing && showPriceList && initialData?.id) {
      getPersonAssignedPriceList(initialData.id).then((response) => {
        if (response?.data?.client_category_id) {
          form.setValue(
            "client_category_id",
            response.data.client_category_id.toString(),
            { shouldValidate: false },
          );
        }
      });
    }
  }, [isEditing, showPriceList, initialData?.id]);

  // Reset document type when person type changes to JURIDICA manually
  // Only trigger if the change came from user changing type_person, not from document type change
  useEffect(() => {
    // Only auto-set RUC if user manually changes type_person to JURIDICA while document is DNI
    // Skip if the change came from document type change
    const currentDoc = form.getValues("document_type_id");
    if (
      type_person === "JURIDICA" &&
      currentDoc === TYPE_DOCUMENT.DNI.id &&
      !documentChangeRef.current
    ) {
      form.setValue("document_type_id", TYPE_DOCUMENT.RUC.id, {
        shouldValidate: true,
      });
      form.setValue("number_document", "", { shouldValidate: true });
    }
  }, [type_person, form]);

  const handleDocumentSearch = async () => {
    const numberDocument = form.getValues("number_document");
    const typeDocument = form.getValues("document_type_id");

    if (!numberDocument || !typeDocument) return;

    setIsSearching(true);

    try {
      if (typeDocument === TYPE_DOCUMENT.DNI.id) {
        const result = await searchDNI({ search: numberDocument });

        if (result && isValidData(result.message) && result.data) {
          const updates: Record<string, string> = {};
          const fieldsSet = {
            names: false,
            father_surname: false,
            mother_surname: false,
            business_name: false,
            address: false,
          };

          updates.names = result.data.names || "";
          updates.father_surname = [
            result.data.father_surname,
            result.data.mother_surname,
          ]
            .filter(Boolean)
            .join(" ");
          updates.mother_surname = "";
          fieldsSet.names = true;
          fieldsSet.father_surname = true;

          Object.keys(updates).forEach((key) => {
            form.setValue(key as keyof PersonSchema, updates[key], {
              shouldValidate: true,
            });
          });

          setFieldsFromSearch(fieldsSet);
        }
      } else if (typeDocument === TYPE_DOCUMENT.RUC.id) {
        const result = await searchRUC({ search: numberDocument });

        if (result && isValidData(result.message) && result.data) {
          const updates: Record<string, string> = {};
          const fieldsSet = {
            names: false,
            father_surname: false,
            mother_surname: false,
            business_name: false,
            address: false,
          };

          updates.business_name = result.data.business_name || "";
          updates.address = result.data.address || "";
          fieldsSet.business_name = true;
          fieldsSet.address = true;

          Object.keys(updates).forEach((key) => {
            form.setValue(key as keyof PersonSchema, updates[key], {
              shouldValidate: true,
            });
          });

          setFieldsFromSearch(fieldsSet);
        }
      }
    } catch (error) {
      console.error("Error searching document:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSubmit = async (data: FormSchema) => {
    try {
      const submitData = isEditing ? { ...data, role_id: "" } : data;
      (submitData as any).commercial_name =
        (submitData as any).business_name || "";

      const returnedId = await onSubmit(submitData);
      const effectivePersonId =
        returnedId ?? (initialData?.id as number | undefined);

      if (effectivePersonId) {
        if (!isEditing && isClient && (data as any).zone_id) {
          await createPersonZone({
            person_id: effectivePersonId,
            zone_id: parseInt((data as any).zone_id),
            address: (data as any).address || "",
            reference: (data as any).reference || "",
            is_primary: true,
          });
        } else if (isEditing && isClient) {
          if (primaryZone?.id) {
            await updatePersonZone(primaryZone.id, {
              zone_id: parseInt((data as any).zone_id),
              address: (data as any).address || "",
              reference: (data as any).reference || "",
              is_primary: true,
            });
          } else if ((data as any).zone_id) {
            await createPersonZone({
              person_id: effectivePersonId,
              zone_id: parseInt((data as any).zone_id),
              address: (data as any).address || "",
              reference: (data as any).reference || "",
              is_primary: true,
            });
          }
        }

        if (stagedAddresses.length > 0) {
          for (const addr of stagedAddresses) {
            await createPersonZone({
              person_id: effectivePersonId,
              zone_id: parseInt(addr.zone_id),
              address: addr.address,
              reference: addr.reference || "",
              is_primary: false,
            });
          }
          setStagedAddresses([]);
        }

        const selectedPriceListId = (data as any).client_category_id;
        if (showPriceList && selectedPriceListId) {
          await assignClientToPriceList(parseInt(selectedPriceListId), {
            person_id: effectivePersonId.toString(),
          });
          queryClient.invalidateQueries({ queryKey: [CLIENT.QUERY_KEY] });
        }
      }

      if (!isEditing) {
        form.reset();
      }

      onAfterSubmit?.();
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)}>
        <fieldset
          disabled={isSearching}
          className="space-y-6 border-0 p-0 m-0 min-w-0"
        >
          {/* Form Actions */}
          <div className="flex items-center gap-2">
            <Button size="sm" type="submit" disabled={isSubmitting}>
              {isSubmitting ? <Loader className="animate-spin" /> : <Save />}
              {isSubmitting
                ? isEditing
                  ? "Actualizando..."
                  : "Creando..."
                : isEditing
                  ? "Actualizar"
                  : "Guardar"}
            </Button>
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onCancel}
              >
                <X /> Cancelar
              </Button>
            )}
          </div>

          {isClient ? (
            /* Flat form for client create and edit */
            <FormLayoutContext.Provider value={{ horizontal: true, labelWidth }}>
            <div className="space-y-3">
              {type_person === "NATURAL" && (
                <>
                  {isSearching ? (
                    <Skeleton className="h-8 w-full" />
                  ) : (
                    <FormInput
                      control={form.control}
                      name="names"
                      label="Nombres"
                      placeholder="Ingrese los nombres"
                      uppercase
                      className={
                        fieldsFromSearch.names
                          ? "bg-blue-50 border-blue-200"
                          : ""
                      }
                    />
                  )}
                  {isSearching ? (
                    <Skeleton className="h-8 w-full" />
                  ) : (
                    <FormInput
                      control={form.control}
                      name="father_surname"
                      label="Apellidos"
                      placeholder="Ingrese los apellidos"
                      uppercase
                      className={
                        fieldsFromSearch.father_surname
                          ? "bg-blue-50 border-blue-200"
                          : ""
                      }
                    />
                  )}
                </>
              )}
              <FormSelect
                control={form.control}
                name="document_type_id"
                label="Tipo de Documento"
                placeholder="Seleccione tipo"
                disabled={isLoadingDocumentTypes}
                options={
                  isLoadingDocumentTypes
                    ? []
                    : (documentTypes || []).map((dt: DocumentTypeResource) => ({
                        value: dt.id.toString(),
                        label: dt.name,
                      }))
                }
              />

              <FormField
                control={form.control}
                name="number_document"
                render={({ field }) => (
                  <NumberDocumentContent
                    field={field}
                    errors={errors}
                    fieldsFromSearch={fieldsFromSearch}
                    dirtyFields={dirtyFields}
                    document_type_id={document_type_id}
                    isSearching={isSearching}
                    handleDocumentSearch={handleDocumentSearch}
                  />
                )}
              />

              {type_person === "JURIDICA" && (
                <>
                  {isSearching ? (
                    <Skeleton className="h-8 w-full" />
                  ) : (
                    <FormInput
                      control={form.control}
                      name="business_name"
                      label="Razón Social"
                      placeholder="Ingrese la razón social"
                      className={
                        fieldsFromSearch.business_name
                          ? "bg-blue-50 border-blue-200"
                          : ""
                      }
                    />
                  )}
                </>
              )}

              <FormInput
                control={form.control}
                name="address"
                label="Dirección"
                placeholder="Ingrese la dirección"
              />

              <FormInput
                control={form.control}
                name="reference"
                label="Referencia"
                placeholder="Referencia o indicaciones (opcional)"
              />

              <FormSelect
                control={form.control}
                name="zone_id"
                label="Zona"
                placeholder="Seleccione zona"
                disabled={isLoadingZones || !zones}
                options={(zones ?? []).map((z: ZoneResource) => ({
                  value: z.id.toString(),
                  label: z.name,
                }))}
              />

              <FormInput
                control={form.control}
                name="phone"
                label="Teléfono"
                placeholder="987654321 (9 dígitos)"
                maxLength={9}
              />

              {showPriceList && (
                <FormSelect
                  control={form.control}
                  name="client_category_id"
                  label="Lista de Precio"
                  placeholder="Seleccione lista de precio"
                  disabled={isLoadingPriceLists}
                  options={
                    isLoadingPriceLists
                      ? []
                      : (priceLists || [])
                          .filter((pl: PriceList) => pl.is_active)
                          .map((pl: PriceList) => ({
                            value: pl.id.toString(),
                            label: `${pl.name} (${pl.code})`,
                          }))
                  }
                />
              )}

              {/* Extra fields toggle */}
              <div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowExtraFields(!showExtraFields)}
                  className="text-xs gap-1 text-muted-foreground hover:text-foreground h-7 px-2 -ml-2"
                >
                  {showExtraFields ? (
                    <ChevronUp className="h-3 w-3" />
                  ) : (
                    <ChevronDown className="h-3 w-3" />
                  )}
                  {showExtraFields
                    ? "Ocultar campos adicionales"
                    : "Mostrar más campos"}
                </Button>
              </div>

              {showExtraFields && (
                <>
                  <FormInput
                    control={form.control}
                    name="email"
                    label="Correo Electrónico"
                    type="email"
                    placeholder="ejemplo@correo.com"
                  />
                  {type_person === "NATURAL" && (
                    <>
                      <FormSelect
                        control={form.control}
                        name="gender"
                        label="Género"
                        placeholder="Seleccione género"
                        options={[
                          { value: "M", label: "Masculino" },
                          { value: "F", label: "Femenino" },
                          { value: "O", label: "Otro" },
                        ]}
                      />
                      <DatePickerFormField
                        control={form.control}
                        name="birth_date"
                        label="Fecha de Nacimiento"
                        placeholder="Seleccione fecha"
                        captionLayout="dropdown"
                        endMonth={
                          new Date(
                            new Date().getFullYear() - 18,
                            new Date().getMonth(),
                            new Date().getDate(),
                          )
                        }
                      />
                    </>
                  )}
                  {showBusinessType && (
                    <FormSelect
                      control={form.control}
                      name="business_type_id"
                      label="Tipo de Negocio"
                      placeholder="Seleccione tipo de negocio"
                      disabled={isLoadingBusinessTypes}
                      options={
                        isLoadingBusinessTypes
                          ? []
                          : (businessTypes || []).map(
                              (bt: BusinessTypeResource) => ({
                                value: bt.id.toString(),
                                label: bt.name,
                              }),
                            )
                      }
                    />
                  )}
                </>
              )}

              {/* Additional addresses section — only in edit mode */}
              {isEditing && (
                <GroupFormSection
                  title="Otras Direcciones"
                  icon={MapPin}
                  cols={{ sm: 1 }}
                  horizontal
                  labelWidth={labelWidth}
                  headerExtra={
                    !showNewAddressForm ? (
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setNewAddrZoneId(zones?.[0]?.id.toString() ?? "");
                          setNewAddrAddress("");
                          setNewAddrReference("");
                          setShowNewAddressForm(true);
                        }}
                      >
                        <Plus className="size-4 mr-1" />
                        Nueva
                      </Button>
                    ) : undefined
                  }
                >
                  {/* Existing non-primary addresses */}
                  {nonPrimaryZones.map((pz) => (
                    <div
                      key={pz.id}
                      className="flex flex-row items-center gap-3"
                    >
                      <span className={`${labelWidth} shrink-0 text-right text-xs font-bold uppercase text-muted-foreground`}>
                        {pz.zone_name}
                      </span>
                      <div className="flex-1 min-w-0 flex flex-col">
                        <span className="text-sm">{pz.address}</span>
                        {pz.reference && (
                          <span className="text-xs text-muted-foreground">
                            {pz.reference}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}

                  {/* Staged (pending) addresses */}
                  {stagedAddresses.map((addr, i) => {
                    const zoneName =
                      zones?.find((z) => z.id.toString() === addr.zone_id)
                        ?.name ?? addr.zone_id;
                    return (
                      <div key={i} className="flex flex-row items-center gap-3">
                        <span className={`${labelWidth} shrink-0 text-right text-xs font-bold uppercase text-muted-foreground`}>
                          {zoneName}
                        </span>
                        <div className="flex-1 min-w-0 flex flex-col">
                          <span className="text-sm flex items-center gap-2">
                            {addr.address}
                            <Badge variant="outline" className="text-xs">
                              Pendiente
                            </Badge>
                          </span>
                          {addr.reference && (
                            <span className="text-xs text-muted-foreground">
                              {addr.reference}
                            </span>
                          )}
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="size-7 text-destructive hover:text-destructive flex-shrink-0"
                          onClick={() =>
                            setStagedAddresses((prev) =>
                              prev.filter((_, idx) => idx !== i),
                            )
                          }
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>
                    );
                  })}

                  {/* Inline new address form */}
                  {showNewAddressForm && (
                    <>
                      <div className="flex flex-row items-center gap-3">
                        <label className={`${labelWidth} shrink-0 text-right text-xs font-bold uppercase text-muted-foreground`}>
                          Zona
                        </label>
                        <div className="flex-1 min-w-0">
                          <Select
                            value={newAddrZoneId}
                            onValueChange={setNewAddrZoneId}
                          >
                            <SelectTrigger className="h-8 text-xs">
                              <SelectValue placeholder="Seleccione zona" />
                            </SelectTrigger>
                            <SelectContent>
                              {(zones ?? []).map((z: ZoneResource) => (
                                <SelectItem
                                  key={z.id}
                                  value={z.id.toString()}
                                  className="text-xs"
                                >
                                  {z.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="flex flex-row items-center gap-3">
                        <label className={`${labelWidth} shrink-0 text-right text-xs font-bold uppercase text-muted-foreground`}>
                          Dirección
                        </label>
                        <div className="flex-1 min-w-0">
                          <Input
                            value={newAddrAddress}
                            onChange={(e) => setNewAddrAddress(e.target.value)}
                            placeholder="Ingrese la dirección"
                            className="h-8 text-sm"
                          />
                        </div>
                      </div>

                      <div className="flex flex-row items-center gap-3">
                        <label className={`${labelWidth} shrink-0 text-right text-xs font-bold uppercase text-muted-foreground`}>
                          Referencia
                        </label>
                        <div className="flex-1 min-w-0">
                          <Input
                            value={newAddrReference}
                            onChange={(e) =>
                              setNewAddrReference(e.target.value)
                            }
                            placeholder="Referencia (opcional)"
                            className="h-8 text-sm"
                          />
                        </div>
                      </div>

                      <div className="flex flex-row items-center gap-3">
                        <span className={`${labelWidth} shrink-0`} />
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            size="sm"
                            disabled={!newAddrAddress.trim() || !newAddrZoneId}
                            onClick={() => {
                              setStagedAddresses((prev) => [
                                ...prev,
                                {
                                  zone_id: newAddrZoneId,
                                  address: newAddrAddress.trim(),
                                  reference: newAddrReference.trim(),
                                  is_primary: false,
                                },
                              ]);
                              setShowNewAddressForm(false);
                            }}
                          >
                            <Check className="size-3.5 mr-1" />
                            Agregar
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            onClick={() => setShowNewAddressForm(false)}
                          >
                            <X className="size-3.5 mr-1" />
                            Cancelar
                          </Button>
                        </div>
                      </div>
                    </>
                  )}
                </GroupFormSection>
              )}
            </div>
            </FormLayoutContext.Provider>
          ) : (
            /* Section-based layout for editing or non-client */
            <>
              {/* Document Information */}
              <GroupFormSection
                title="Información de Documento"
                icon={IdCard}
                cols={{ sm: 1 }}
                horizontal
                labelWidth={labelWidth}
              >
                <FormSelect
                  control={form.control}
                  name="document_type_id"
                  label="Tipo de Documento"
                  placeholder="Seleccione tipo"
                  disabled={isLoadingDocumentTypes}
                  options={
                    isLoadingDocumentTypes
                      ? []
                      : isWorker
                        ? (documentTypes || [])
                            .filter(
                              (dt: DocumentTypeResource) =>
                                dt.name === TYPE_DOCUMENT.DNI.name,
                            )
                            .map((dt: DocumentTypeResource) => ({
                              value: dt.id.toString(),
                              label: dt.name,
                            }))
                        : (documentTypes || []).map(
                            (dt: DocumentTypeResource) => ({
                              value: dt.id.toString(),
                              label: dt.name,
                            }),
                          )
                  }
                />

                <FormField
                  control={form.control}
                  name="number_document"
                  render={({ field }) => (
                    <NumberDocumentContent
                      field={field}
                      errors={errors}
                      fieldsFromSearch={fieldsFromSearch}
                      dirtyFields={dirtyFields}
                      document_type_id={document_type_id}
                      isSearching={isSearching}
                      handleDocumentSearch={handleDocumentSearch}
                    />
                  )}
                />

                {type_person === "NATURAL" && (
                  <>
                    {isSearching ? (
                      <div className="flex flex-row items-center gap-3">
                        <span className={`${labelWidth} shrink-0 text-right text-xs font-bold uppercase text-muted-foreground`}>
                          Nombres
                        </span>
                        <Skeleton className="h-8 flex-1 min-w-0" />
                      </div>
                    ) : (
                      <FormInput
                        control={form.control}
                        name="names"
                        label="Nombres"
                        placeholder="Ingrese los nombres"
                        uppercase
                        className={
                          fieldsFromSearch.names
                            ? "bg-blue-50 border-blue-200"
                            : ""
                        }
                      />
                    )}

                    {isSearching ? (
                      <div className="flex flex-row items-center gap-3">
                        <span className={`${labelWidth} shrink-0 text-right text-xs font-bold uppercase text-muted-foreground`}>
                          Apellidos
                        </span>
                        <Skeleton className="h-8 flex-1 min-w-0" />
                      </div>
                    ) : (
                      <FormInput
                        control={form.control}
                        name="father_surname"
                        label="Apellidos"
                        placeholder="Ingrese los apellidos"
                        uppercase
                        className={
                          fieldsFromSearch.father_surname
                            ? "bg-blue-50 border-blue-200"
                            : ""
                        }
                      />
                    )}

                    {(!isClient || showExtraFields) && (
                      <FormSelect
                        control={form.control}
                        name="gender"
                        label="Género"
                        placeholder="Seleccione género"
                        options={[
                          { value: "M", label: "Masculino" },
                          { value: "F", label: "Femenino" },
                          { value: "O", label: "Otro" },
                        ]}
                      />
                    )}

                    {(!isClient || showExtraFields) && (
                      <DatePickerFormField
                        control={form.control}
                        name="birth_date"
                        label="Fecha de Nacimiento"
                        placeholder="Seleccione fecha"
                        captionLayout="dropdown"
                        endMonth={
                          new Date(
                            new Date().getFullYear() - 18,
                            new Date().getMonth(),
                            new Date().getDate(),
                          )
                        }
                      />
                    )}
                  </>
                )}

                {type_person === "JURIDICA" && (
                  <>
                    {isSearching ? (
                      <div className="flex flex-row items-center gap-3">
                        <span className={`${labelWidth} shrink-0 text-right text-xs font-bold uppercase text-muted-foreground`}>
                          Razón Social
                        </span>
                        <Skeleton className="h-8 flex-1 min-w-0" />
                      </div>
                    ) : (
                      <FormInput
                        control={form.control}
                        name="business_name"
                        label="Razón Social"
                        placeholder="Ingrese la razón social"
                        className={
                          fieldsFromSearch.business_name
                            ? "bg-blue-50 border-blue-200"
                            : ""
                        }
                      />
                    )}
                  </>
                )}
              </GroupFormSection>

              {/* Optional Fields - Context specific */}
              {(showJobPosition ||
                showBusinessType ||
                showZone ||
                showPriceList ||
                isDriver) && (
                <GroupFormSection
                  title="Información Adicional"
                  icon={Paperclip}
                  cols={{ sm: 1 }}
                  horizontal
                  labelWidth={labelWidth}
                  headerExtra={
                    isClient ? (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowExtraFields(!showExtraFields)}
                        className="text-xs gap-1 text-muted-foreground hover:text-foreground h-7 px-2"
                      >
                        {showExtraFields ? (
                          <ChevronUp className="h-3 w-3" />
                        ) : (
                          <ChevronDown className="h-3 w-3" />
                        )}
                        {showExtraFields ? "Ocultar" : "Mostrar más campos"}
                      </Button>
                    ) : undefined
                  }
                >
                  {(!isClient || showExtraFields) && (
                    <FormInput
                      control={form.control}
                      name="email"
                      label="Correo Electrónico"
                      type="email"
                      placeholder="ejemplo@correo.com"
                    />
                  )}

                  <FormInput
                    control={form.control}
                    name="phone"
                    label="Teléfono"
                    placeholder="987654321 (9 dígitos)"
                    maxLength={9}
                  />

                  {showDirection && !(isClient && isEditing) && (
                    <FormInput
                      control={form.control}
                      name="address"
                      label="Dirección"
                      placeholder="Ingrese la dirección"
                      className={fieldsFromSearch.address ? "bg-blue-50" : ""}
                    />
                  )}

                  {showJobPosition && (
                    <FormSelect
                      control={form.control}
                      name="job_position_id"
                      label="Cargo / Puesto de Trabajo"
                      placeholder="Seleccione cargo"
                      disabled={isLoadingJobPositions}
                      options={
                        isLoadingJobPositions
                          ? []
                          : (jobPositions || []).map(
                              (jp: JobPositionResource) => ({
                                value: jp.id.toString(),
                                label: jp.name,
                              }),
                            )
                      }
                    />
                  )}

                  {showBusinessType && (!isClient || showExtraFields) && (
                    <FormSelect
                      control={form.control}
                      name="business_type_id"
                      label="Tipo de Negocio"
                      placeholder="Seleccione tipo de negocio"
                      disabled={isLoadingBusinessTypes}
                      options={
                        isLoadingBusinessTypes
                          ? []
                          : (businessTypes || []).map(
                              (bt: BusinessTypeResource) => ({
                                value: bt.id.toString(),
                                label: bt.name,
                              }),
                            )
                      }
                    />
                  )}

                  {showPriceList && (
                    <FormSelect
                      control={form.control}
                      name="client_category_id"
                      label="Lista de Precio"
                      placeholder="Seleccione lista de precio"
                      disabled={isLoadingPriceLists}
                      options={
                        isLoadingPriceLists
                          ? []
                          : (priceLists || [])
                              .filter((pl: PriceList) => pl.is_active)
                              .map((pl: PriceList) => ({
                                value: pl.id.toString(),
                                label: `${pl.name} (${pl.code})`,
                              }))
                      }
                    />
                  )}

                  {showZone && (
                    <FormSelect
                      control={form.control}
                      name="zone_id"
                      label="Zona"
                      placeholder="Seleccione zona"
                      disabled={isLoadingZones}
                      options={
                        isLoadingZones
                          ? []
                          : (zones || []).map((z: ZoneResource) => ({
                              value: z.id.toString(),
                              label: z.name,
                            }))
                      }
                    />
                  )}

                  {isDriver && (
                    <FormInput
                      control={form.control}
                      name="driver_license"
                      label="Licencia de Conducir"
                      placeholder="Ingrese el número de licencia"
                    />
                  )}
                </GroupFormSection>
              )}
            </>
          )}

          {/* Form validation summary */}
          {Object.keys(errors).length > 0 && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-red-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    Hay {Object.keys(errors).length} error
                    {Object.keys(errors).length > 1 ? "es" : ""} que necesita
                    {Object.keys(errors).length > 1 ? "n" : ""} corrección
                  </h3>
                  <div className="mt-2 text-sm text-red-700">
                    <ul className="space-y-1">
                      {Object.entries(errors).map(([field, error]) => (
                        <li key={field} className="flex items-start">
                          <span className="inline-block w-1 h-1 bg-red-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                          {error?.message || `Error en ${field}`}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </fieldset>
      </form>
    </Form>
  );
};
