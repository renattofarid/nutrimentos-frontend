"use client";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import TitleFormComponent from "@/components/TitleFormComponent";
import { PersonForm } from "@/pages/person/components/PersonForm";
import { type PersonSchemaClient } from "@/pages/person/lib/person.schema";
import { createPersonWithRole } from "@/pages/person/lib/person.actions";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/lib/core.function";
import { CLIENT, CLIENT_ROLE_ID } from "../lib/client.interface";
import FormWrapper from "@/components/FormWrapper";

const { MODEL, ICON } = CLIENT;

export default function ClientAddPage() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: PersonSchemaClient) => {
    setIsSubmitting(true);
    try {
      // For names field: use business_name for JURIDICA, or concatenate names for NATURAL
      const fullName = data.type_person === "JURIDICA" 
        ? data.business_name || ""
        : `${data.names || ""} ${data.father_surname || ""} ${data.mother_surname || ""}`.trim();
      
      // Build payload with only the fields present in the form
      const createPersonData: any = {
        document_type_id: data.document_type_id,
        type_person: data.type_person,
        number_document: data.number_document || "", // Can be empty for clients
        names: fullName,
        address: data.address || "",
        phone: data.phone,
        email: data.email,
        status: "Activo",
        role_id: Number(data.role_id),
      };

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

      await createPersonWithRole(createPersonData, Number(data.role_id));
      successToast(
        SUCCESS_MESSAGE({ name: "Cliente", gender: false }, "create")
      );
      navigate("/clientes");
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

      errorToast(
        errorMessage,
        ERROR_MESSAGE({ name: "Cliente", gender: false }, "create")
      );
      // Propagate error so the form container can avoid resetting the form
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <FormWrapper>
      <div className="mb-6">
        <TitleFormComponent icon={ICON} title={MODEL.name} mode="edit" />
      </div>

      <PersonForm
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        onCancel={() => navigate("/clientes")}
        roleId={CLIENT_ROLE_ID}
        isClient={true}
        showBusinessType={true}
        showZone={true}
      />
    </FormWrapper>
  );
}
