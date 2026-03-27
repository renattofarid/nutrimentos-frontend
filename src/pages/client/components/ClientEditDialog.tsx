"use client";

import { useEffect, useState } from "react";
import { GeneralModal } from "@/components/GeneralModal";
import { PersonForm } from "@/pages/person/components/PersonForm";
import { type PersonSchemaClient } from "@/pages/person/lib/person.schema";
import {
  findPersonById,
  updatePerson,
} from "@/pages/person/lib/person.actions";
import {
  SUCCESS_MESSAGE,
  ERROR_MESSAGE,
  successToast,
  errorToast,
} from "@/lib/core.function";
import { CLIENT_ROLE_ID } from "../lib/client.interface";
import type { PersonResource } from "@/pages/person/lib/person.interface";
import { TYPE_DOCUMENT } from "@/pages/person/lib/person.constants";
import { Loader2 } from "lucide-react";

interface ClientEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  personId: number;
  onClientUpdated?: () => void;
}

export function ClientEditDialog({
  open,
  onOpenChange,
  personId,
  onClientUpdated,
}: ClientEditDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [personData, setPersonData] = useState<PersonResource | null>(null);

  useEffect(() => {
    if (!open || !personId) return;

    const loadPersonData = async () => {
      try {
        setIsLoading(true);
        const response = await findPersonById(personId);
        setPersonData(response.data);
      } catch {
        errorToast("Error al cargar los datos del cliente");
        onOpenChange(false);
      } finally {
        setIsLoading(false);
      }
    };

    loadPersonData();
  }, [open, personId]);

  const handleSubmit = async (data: PersonSchemaClient) => {
    if (!personData) return;

    setIsSubmitting(true);
    try {
      const updatePersonData: any = {
        document_type_id: data.document_type_id,
        type_person: data.type_person,
        number_document: data.number_document || "",
        address: data.address || "",
        phone: data.phone,
        email: data.email,
      };

      if (
        data.type_person === "NATURAL" ||
        data.document_type_id === TYPE_DOCUMENT.DNI.id
      ) {
        updatePersonData.names = data.names || "";
      }

      if (data.type_person === "NATURAL") {
        updatePersonData.gender = data.gender || "M";
        updatePersonData.birth_date = data.birth_date || "";
        updatePersonData.father_surname = data.father_surname || "";
        updatePersonData.mother_surname = data.mother_surname || "";
      }

      if (data.type_person === "JURIDICA") {
        updatePersonData.business_name = data.business_name || "";
        updatePersonData.commercial_name = data.commercial_name || "";
      }

      if (data.business_type_id) {
        updatePersonData.business_type_id = Number(data.business_type_id);
      }
      if (data.zone_id) {
        updatePersonData.zone_id = Number(data.zone_id);
      }
      if (data.client_category_id) {
        updatePersonData.client_category_id = Number(data.client_category_id);
      }

      await updatePerson(personData.id, updatePersonData);
      successToast(SUCCESS_MESSAGE({ name: "Cliente", gender: false }, "update"));
      onOpenChange(false);
      onClientUpdated?.();
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
          : undefined;

      errorToast(
        errorMessage,
        ERROR_MESSAGE({ name: "Cliente", gender: false }, "update")
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <GeneralModal
      open={open}
      onClose={() => onOpenChange(false)}
      title="Editar Cliente"
      subtitle="Modifica los datos del cliente"
      size="4xl"
    >
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="size-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <PersonForm
          initialData={personData}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          onCancel={() => onOpenChange(false)}
          roleId={CLIENT_ROLE_ID}
          isClient={true}
          showBusinessType={true}
          showZone={false}
          showPriceList={true}
          showDirection={false}
        />
      )}
    </GeneralModal>
  );
}
