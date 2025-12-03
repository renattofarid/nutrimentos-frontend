import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useEffect, useRef } from "react";
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
import {
  Loader,
  Search,
  Paperclip,
  IdCard,
  IdCardLanyard,
  ListPlus,
} from "lucide-react";
import {
  personCreateSchema,
  personCreateSchemaClient,
  personCreateSchemaWorker,
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
import { useAllZones } from "@/pages/zone/lib/zone.hook";
import type { ZoneResource } from "@/pages/zone/lib/zone.interface";
import { usePriceList } from "@/pages/pricelist/lib/pricelist.hook";
import type { PriceList } from "@/pages/pricelist/lib/pricelist.interface";
import { TYPE_DOCUMENT } from "../lib/person.constants";
import { GroupFormSection } from "@/components/GroupFormSection";

interface PersonFormProps {
  initialData?: PersonResource | null;
  onSubmit: (data: PersonSchema | PersonSchemaClient) => Promise<void>;
  isSubmitting?: boolean;
  onCancel?: () => void;
  roleId: number; // Role ID to assign automatically
  isWorker?: boolean; // If true, only allow DNI and NATURAL person
  isClient?: boolean; // If true, number_document is optional
  showJobPosition?: boolean; // Show job position field
  showBusinessType?: boolean; // Show business type field
  showZone?: boolean; // Show zone field
  showPriceList?: boolean; // Show price list field for clients
}

export const PersonForm = ({
  initialData,
  onSubmit,
  isSubmitting = false,
  onCancel,
  roleId,
  isWorker = false,
  isClient = false,
  showJobPosition = false,
  showBusinessType = false,
  showZone = false,
  showPriceList = false,
}: PersonFormProps) => {
  const isEditing = !!initialData;

  // Use client schema if isClient is true
  const schema = isClient
    ? personCreateSchemaClient
    : isWorker
    ? personCreateSchemaWorker
    : personCreateSchema;
  type FormSchema = PersonSchema | PersonSchemaClient;

  const form = useForm<FormSchema>({
    resolver: zodResolver(schema),
    defaultValues: {
      document_type_id: initialData?.document_type_id?.toString() || "",
      type_person:
        (initialData?.type_person as "NATURAL" | "JURIDICA") || "NATURAL",
      number_document: initialData?.number_document ?? "",
      names: initialData?.names || "",
      gender: (initialData?.gender as "M" | "F" | "O") || "M",
      birth_date: initialData?.birth_date || "",
      father_surname: initialData?.father_surname || "",
      mother_surname: initialData?.mother_surname || "",
      business_name: initialData?.business_name || "",
      commercial_name: initialData?.commercial_name || "",
      address: initialData?.address || "",
      phone: initialData?.phone || "",
      email: initialData?.email || "",
      role_id: roleId.toString(),
      job_position_id: initialData?.job_position_id?.toString() || "",
      business_type_id: initialData?.business_type_id?.toString() || "",
      zone_id: initialData?.zone_id?.toString() || "",
      client_category_id: initialData?.client_category_id?.toString() || "",
    },
    mode: "onChange", // Validate on change for immediate feedback
  });

  const type_person = form.watch("type_person");
  const document_type_id = form.watch("document_type_id");
  const [isSearching, setIsSearching] = useState(false);

  // Ref to track if document type change triggered person type change
  const documentChangeRef = useRef(false);

  // Get all document types from API
  const { data: documentTypes, isLoading: isLoadingDocumentTypes } =
    useAllDocumentTypes();

  // Get optional data from API
  const { data: jobPositions, isLoading: isLoadingJobPositions } =
    useAllJobPositions();
  const { data: businessTypes, isLoading: isLoadingBusinessTypes } =
    useAllBusinessTypes();
  const { data: zones, isLoading: isLoadingZones } = useAllZones();
  const { data: priceLists, isLoading: isLoadingPriceLists } = usePriceList();

  // Update document_type_id when document_type_id changes
  useEffect(() => {
    if (documentTypes) {
      const selectedDocType = documentTypes.find(
        (dt: DocumentTypeResource) => dt.id.toString() === document_type_id
      );
      if (selectedDocType) {
        form.setValue("document_type_id", selectedDocType.id.toString(), {
          shouldValidate: true,
        });
      }
    }
  }, [document_type_id, documentTypes, form]);

  // Get form state for better UX
  const { errors, isValid, dirtyFields } = form.formState;
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
          updates.father_surname = result.data.father_surname || "";
          updates.mother_surname = result.data.mother_surname || "";
          fieldsSet.names = true;
          fieldsSet.father_surname = true;
          fieldsSet.mother_surname = true;

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
      // Only include role_id when creating (not editing)
      const submitData = isEditing ? { ...data, role_id: "" } : data;

      await onSubmit(submitData);
      if (!isEditing) {
        form.reset();
      }
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Document Information */}
        <GroupFormSection
          title="Información de Documento"
          icon={IdCard}
          cols={{ md: 3 }}
        >
          <FormSelect
            control={form.control}
            name="document_type_id"
            label="Tipo de Documento"
            placeholder="Seleccione tipo"
            disabled={isWorker || isLoadingDocumentTypes} // Workers can only use DNI
            options={
              isLoadingDocumentTypes
                ? []
                : isWorker
                ? (documentTypes || [])
                    .filter(
                      (dt: DocumentTypeResource) =>
                        dt.name === TYPE_DOCUMENT.DNI.id
                    )
                    .map((dt: DocumentTypeResource) => ({
                      value: dt.id.toString(),
                      label: dt.name,
                    }))
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
              <FormItem>
                <FormLabel
                  className={errors.number_document ? "text-destructive" : ""}
                >
                  Número de Documento{" "}
                  {!isClient && errors.number_document && "*"}
                  {isClient && " (Opcional)"}
                </FormLabel>
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
                      className={`
                        ${
                          fieldsFromSearch.names
                            ? "bg-blue-50 border-blue-200"
                            : ""
                        }
                        ${
                          errors.number_document
                            ? "border-destructive focus-visible:ring-destructive"
                            : ""
                        }
                        ${
                          dirtyFields.number_document && !errors.number_document
                            ? "border-primary"
                            : ""
                        }
                      `}
                      maxLength={
                        document_type_id === TYPE_DOCUMENT.DNI.id
                          ? 8
                          : document_type_id === TYPE_DOCUMENT.RUC.id
                          ? 11
                          : document_type_id === "CE"
                          ? 9
                          : document_type_id === "PASAPORTE"
                          ? 11
                          : 11
                      }
                      onChange={(e) => {
                        let value;
                        // For DNI, RUC, CE only allow numbers
                        if (
                          document_type_id === TYPE_DOCUMENT.DNI.id ||
                          document_type_id === TYPE_DOCUMENT.RUC.id ||
                          document_type_id === "CE"
                        ) {
                          value = e.target.value.replace(/\D/g, "");
                        } else {
                          // For PASAPORTE allow alphanumeric
                          value = e.target.value.replace(/[^a-zA-Z0-9]/g, "");
                        }

                        field.onChange(value);

                        // Auto-search when completing DNI (8 digits) or RUC (11 digits)
                        // Only if value is not empty (for optional client documents)
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
                <FormMessage />
                {/* Fixed height container for feedback messages */}
                {field.value && !errors.number_document && (
                  <div className="h-4 text-xs">
                    <>
                      {document_type_id === TYPE_DOCUMENT.DNI.id &&
                        field.value.length === 8 && (
                          <p className="text-primary">
                            ✓ DNI válido (8 dígitos)
                          </p>
                        )}
                      {document_type_id === TYPE_DOCUMENT.RUC.id &&
                        field.value.length === 11 && (
                          <p className="text-primary">
                            ✓ RUC válido (11 dígitos)
                          </p>
                        )}
                      {document_type_id === "CE" &&
                        field.value.length >= 8 &&
                        field.value.length <= 9 && (
                          <p className="text-primary">
                            ✓ CE válido ({field.value.length} dígitos)
                          </p>
                        )}
                      {document_type_id === "PASAPORTE" &&
                        field.value.length >= 8 &&
                        field.value.length <= 11 && (
                          <p className="text-primary">
                            ✓ Pasaporte válido ({field.value.length} caracteres)
                          </p>
                        )}
                      {/* Show progress */}
                      {((document_type_id === TYPE_DOCUMENT.DNI.id &&
                        field.value.length < 8) ||
                        (document_type_id === TYPE_DOCUMENT.RUC.id &&
                          field.value.length < 11) ||
                        (document_type_id === "CE" && field.value.length < 8) ||
                        (document_type_id === "PASAPORTE" &&
                          field.value.length < 8)) && (
                        <p className="text-amber-600">
                          {document_type_id === TYPE_DOCUMENT.DNI.id &&
                            `${8 - field.value.length} dígitos restantes`}
                          {document_type_id === TYPE_DOCUMENT.RUC.id &&
                            `${11 - field.value.length} dígitos restantes`}
                          {document_type_id === "CE" &&
                            field.value.length < 8 &&
                            `${8 - field.value.length} dígitos restantes`}
                          {document_type_id === "PASAPORTE" &&
                            field.value.length < 8 &&
                            `${8 - field.value.length} caracteres restantes`}
                        </p>
                      )}
                    </>
                  </div>
                )}
              </FormItem>
            )}
          />

          <FormSelect
            control={form.control}
            name="type_person"
            label="Tipo de Persona"
            placeholder="Seleccione tipo"
            disabled={isWorker} // Workers are always natural persons
            options={
              isWorker
                ? [{ value: "NATURAL", label: "Natural" }] // Workers are always natural
                : [
                    { value: "NATURAL", label: "Natural" },
                    { value: "JURIDICA", label: "Jurídica" },
                  ]
            }
          />
        </GroupFormSection>

        {/* Personal Information - Natural Person */}
        {type_person === "NATURAL" && (
          <GroupFormSection
            title="Información de Persona"
            icon={IdCardLanyard}
            cols={{ md: 3 }}
          >
            <FormField
              control={form.control}
              name="names"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={errors.names ? "text-destructive" : ""}>
                    Nombres {errors.names && "*"}
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ingrese los nombres"
                      {...field}
                      className={`
                        ${
                          fieldsFromSearch.names
                            ? "bg-blue-50 border-blue-200"
                            : ""
                        }
                        ${
                          errors.names
                            ? "border-destructive focus-visible:ring-destructive"
                            : ""
                        }
                        ${
                          dirtyFields.names && !errors.names
                            ? "border-primary"
                            : ""
                        }
                      `}
                    />
                  </FormControl>
                  <FormMessage />
                  {/* Fixed height container for feedback */}
                  {!errors.names && dirtyFields.names && (
                    <div className="h-4 text-xs">
                      <p className="text-primary">✓ Nombres válidos</p>
                    </div>
                  )}
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="father_surname"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Apellido Paterno</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ingrese apellido paterno"
                      {...field}
                      className={
                        fieldsFromSearch.father_surname ? "bg-blue-50" : ""
                      }
                    />
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
                  <FormLabel>Apellido Materno</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ingrese apellido materno"
                      {...field}
                      className={
                        fieldsFromSearch.mother_surname ? "bg-blue-50" : ""
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                  new Date().getDate()
                )
              }
            />

            {/* <FormField
              control={form.control}
              name="ocupation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel
                    className={errors.ocupation ? "text-destructive" : ""}
                  >
                    Ocupación {errors.ocupation && "*"}
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ingrese la ocupación"
                      {...field}
                      className={`
                        ${
                          errors.ocupation
                            ? "border-destructive focus-visible:ring-destructive"
                            : ""
                        }
                        ${
                          dirtyFields.ocupation && !errors.ocupation
                            ? "border-primary"
                            : ""
                        }
                      `}
                    />
                  </FormControl>
                  <FormMessage />
                  
                  <div className="h-4 text-xs">
                    {!errors.ocupation && dirtyFields.ocupation && (
                      <p className="text-primary">✓ Ocupación válida</p>
                    )}
                  </div>
                </FormItem>
              )}
            /> */}
          </GroupFormSection>
        )}

        {/* Business Information - Legal Person */}
        {type_person === "JURIDICA" && (
          <GroupFormSection
            title="Información de Documento y Persona"
            icon={ListPlus}
            cols={{ md: 3 }}
          >
            <FormField
              control={form.control}
              name="business_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel
                    className={errors.business_name ? "text-destructive" : ""}
                  >
                    Razón Social {errors.business_name && "*"}
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ingrese la razón social"
                      {...field}
                      className={`
                        ${
                          fieldsFromSearch.business_name
                            ? "bg-blue-50 border-blue-200"
                            : ""
                        }
                        ${
                          errors.business_name
                            ? "border-destructive focus-visible:ring-destructive"
                            : ""
                        }
                        ${
                          dirtyFields.business_name && !errors.business_name
                            ? "border-primary"
                            : ""
                        }
                      `}
                    />
                  </FormControl>
                  <FormMessage />
                  {/* Fixed height container for feedback */}
                  {!errors.business_name && dirtyFields.business_name && (
                    <div className="h-4 text-xs">
                      <p className="text-primary">✓ Razón social válida</p>
                    </div>
                  )}
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="commercial_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel
                    className={errors.commercial_name ? "text-destructive" : ""}
                  >
                    Nombre Comercial {errors.commercial_name && "*"}
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ingrese el nombre comercial"
                      {...field}
                      className={`
                        ${
                          errors.commercial_name
                            ? "border-destructive focus-visible:ring-destructive"
                            : ""
                        }
                        ${
                          dirtyFields.commercial_name && !errors.commercial_name
                            ? "border-primary"
                            : ""
                        }
                      `}
                    />
                  </FormControl>
                  <FormMessage />
                  {/* Fixed height container for feedback */}
                  {!errors.commercial_name && dirtyFields.commercial_name && (
                    <div className="h-4 text-xs">
                      <p className="text-primary">✓ Nombre comercial válido</p>
                    </div>
                  )}
                </FormItem>
              )}
            />
          </GroupFormSection>
        )}

        {/* Optional Fields - Context specific */}
        {(showJobPosition || showBusinessType || showZone || showPriceList) && (
          <GroupFormSection
            title="Información Adicional"
            icon={Paperclip}
            cols={{ md: 3 }}
          >
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={errors.email ? "text-destructive" : ""}>
                    Correo Electrónico {errors.email && "*"}
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="ejemplo@correo.com"
                      {...field}
                      className={`
                      ${
                        errors.email
                          ? "border-destructive focus-visible:ring-destructive"
                          : ""
                      }
                      ${
                        dirtyFields.email && !errors.email
                          ? "border-primary"
                          : ""
                      }
                    `}
                    />
                  </FormControl>
                  <FormMessage />
                  {/* Fixed height container for feedback */}
                  {!errors.email && dirtyFields.email && (
                    <div className="h-4 text-xs">
                      <p className="text-primary">
                        ✓ Correo electrónico válido
                      </p>
                    </div>
                  )}
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={errors.phone ? "text-destructive" : ""}>
                    Teléfono {errors.phone && "*"}
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="987654321 (9 dígitos)"
                      {...field}
                      className={`
                      ${
                        errors.phone
                          ? "border-destructive focus-visible:ring-destructive"
                          : ""
                      }
                      ${
                        dirtyFields.phone && !errors.phone
                          ? "border-primary"
                          : ""
                      }
                    `}
                      maxLength={9}
                      onChange={(e) => {
                        // Only allow numbers
                        const value = e.target.value.replace(/\D/g, "");
                        field.onChange(value);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                  {/* Fixed height container for feedback */}
                  {!errors.phone && dirtyFields.phone && (
                    <div className="h-4 text-xs">
                      <p className="text-primary">✓ Teléfono válido</p>
                      {field.value &&
                        field.value.length < 9 &&
                        field.value.length > 0 && (
                          <p className="text-amber-600">
                            {9 - field.value.length} dígitos restantes
                          </p>
                        )}
                    </div>
                  )}
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dirección</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ingrese la dirección"
                      {...field}
                      className={fieldsFromSearch.address ? "bg-blue-50" : ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                    : (jobPositions || []).map((jp: JobPositionResource) => ({
                        value: jp.id.toString(),
                        label: jp.name,
                      }))
                }
              />
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
                    : (businessTypes || []).map((bt: BusinessTypeResource) => ({
                        value: bt.id.toString(),
                        label: bt.name,
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
          </GroupFormSection>
        )}

        {/* Form Actions */}
        <div className="flex justify-end gap-3">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
          )}
          <Button
            type="submit"
            disabled={isSubmitting || !isValid}
            className={`gap-2 ${!isValid ? "opacity-50" : ""}`}
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                {isEditing ? "Actualizando..." : "Creando..."}
              </>
            ) : (
              <>{isEditing ? "Actualizar" : "Crear"} Persona</>
            )}
          </Button>
        </div>

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
      </form>

      {/* <pre>
        <code>{JSON.stringify(form.formState.errors, null, 2)}</code>
      </pre>
      <Button onClick={() => form.trigger()}>Button</Button> */}
    </Form>
  );
};
