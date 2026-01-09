"use client";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import TitleFormComponent from "@/components/TitleFormComponent";
import { PersonForm } from "@/pages/person/components/PersonForm";
import { type PersonSchema } from "@/pages/person/lib/person.schema";
import { createPersonWithRole } from "@/pages/person/lib/person.actions";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/lib/core.function";
import { DRIVER, DRIVER_ROLE_ID } from "../lib/driver.interface";
import FormWrapper from "@/components/FormWrapper";
import { TYPE_DOCUMENT } from "@/pages/person/lib/person.constants";

const { MODEL, ICON } = DRIVER;

// Helper function to map document_type_id to type_document name
const getDocumentTypeName = (documentTypeId: string): "DNI" | "RUC" | "CE" | "PASAPORTE" => {
  if (documentTypeId === TYPE_DOCUMENT.DNI.id) return "DNI";
  if (documentTypeId === TYPE_DOCUMENT.RUC.id) return "RUC";
  return "DNI"; // Default fallback
};

export default function DriverAddPage() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: PersonSchema) => {
    setIsSubmitting(true);
    try {
      // Ensure number_document is not undefined
      const numberDocument = data.number_document || "";
      
      // Transform PersonSchema to CreatePersonRequest
      const createPersonData = {
        username: numberDocument, // Use document number as username
        password: numberDocument, // Use document number as password
        type_document: getDocumentTypeName(data.document_type_id), // Map ID to type name
        document_type_id: data.document_type_id, // Keep the ID as string
        type_person: data.type_person,
        number_document: numberDocument,
        names: data.names || "",
        gender: data.type_person === "NATURAL" ? data.gender || "M" : undefined,
        birth_date:
          data.type_person === "NATURAL" ? data.birth_date || "" : undefined,
        father_surname: data.father_surname || "",
        mother_surname: data.mother_surname || "",
        business_name: data.business_name || "",
        commercial_name: data.commercial_name || "",
        address: data.address || "",
        phone: data.phone,
        email: data.email,
        status: "Activo",
        role_id: Number(data.role_id),
      };

      await createPersonWithRole(createPersonData, Number(data.role_id));
      successToast(
        SUCCESS_MESSAGE({ name: "Conductor", gender: false }, "create")
      );
      navigate("/conductores");
    } catch (error: any) {
      const errorMessage =
        ((error.response.data.message ??
          error.response.data.error) as string) ?? "Error al crear conductor";

      errorToast(
        errorMessage,
        ERROR_MESSAGE({ name: "Conductor", gender: false }, "create")
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <FormWrapper>
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <TitleFormComponent title={MODEL.name} mode="create" icon={ICON} />
        </div>
      </div>

      <PersonForm
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        onCancel={() => navigate("/conductores")}
        roleId={DRIVER_ROLE_ID}
        isWorker={false}
        showBusinessType
      />
    </FormWrapper>
  );
}
