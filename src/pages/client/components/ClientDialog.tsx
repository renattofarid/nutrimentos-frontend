"use client";

import { useState } from "react";
import { GeneralModal } from "@/components/GeneralModal";
import { PersonForm } from "@/pages/person/components/PersonForm";
import { type PersonSchemaClient } from "@/pages/person/lib/person.schema";
import { createPersonWithRole } from "@/pages/person/lib/person.actions";
import { errorToast, successToast } from "@/lib/core.function";
import { CLIENT_ROLE_ID } from "../lib/client.interface";

interface ClientDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClientCreated?: () => void;
}

export function ClientDialog({
  open,
  onOpenChange,
  onClientCreated,
}: ClientDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: PersonSchemaClient) => {
    setIsSubmitting(true);
    try {
      // Transform PersonSchemaClient to CreatePersonRequest
      const namesOnly = data.names || "";

      // Build payload with only the fields present in the form
      const createPersonData: any = {
        document_type_id: data.document_type_id,
        type_person: data.type_person,
        number_document: data.number_document || "",
        address: data.address || "",
        phone: data.phone,
        email: data.email,
        status: "Activo",
        role_id: Number(data.role_id),
      };

      // Only include names when NATURAL or when the document type is DNI
      if (data.type_person === "NATURAL" || data.document_type_id === "1") {
        createPersonData.names = namesOnly;
      }

      // Add fields specific to NATURAL person
      if (data.type_person === "NATURAL") {
        createPersonData.gender = data.gender || "M";
        createPersonData.birth_date = data.birth_date || "";
        createPersonData.father_surname = data.father_surname || "";
        createPersonData.mother_surname = data.mother_surname || "";
      }

      // Add fields specific to JURIDICA person
      if (data.type_person === "JURIDICA") {
        createPersonData.business_name = data.business_name || "";
        createPersonData.commercial_name = data.commercial_name || "";
      }

      // Add optional fields if provided
      if (data.business_type_id) {
        createPersonData.business_type_id = Number(data.business_type_id);
      }
      if (data.zone_id) {
        createPersonData.zone_id = Number(data.zone_id);
      }
      if (data.client_category_id) {
        createPersonData.client_category_id = Number(data.client_category_id);
      }

      await createPersonWithRole(createPersonData, Number(data.role_id));
      successToast("Cliente creado exitosamente");
      onOpenChange(false);
      onClientCreated?.();
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error &&
        "response" in error &&
        typeof error.response === "object" &&
        error.response !== null &&
        "data" in error.response &&
        typeof error.response.data === "object" &&
        error.response.data !== null &&
        "message" in error.response.data
          ? (error.response.data.message as string)
          : "Error al crear cliente";

      errorToast(errorMessage);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <GeneralModal
      open={open}
      onClose={() => onOpenChange(false)}
      title="Agregar Cliente"
      subtitle="Complete los campos para crear un nuevo cliente"
      maxWidth="max-w-(--breakpoint-lg)!"
    >
      <PersonForm
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        onCancel={() => onOpenChange(false)}
        roleId={CLIENT_ROLE_ID}
        isClient={true}
        showBusinessType={true}
        showZone={true}
        showPriceList={true}
      />
    </GeneralModal>
  );
}
