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
import { WORKER, WORKER_ROLE_ID } from "../lib/worker.interface";
import FormWrapper from "@/components/FormWrapper";

const { MODEL, ICON } = WORKER;

export default function WorkerAddPage() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: PersonSchema) => {
    setIsSubmitting(true);
    try {
      // Transform PersonSchema to CreatePersonRequest
      // For names field: send only the 'names' field as entered by the user
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
      if (data.type_person === "NATURAL" || data.type_document === "DNI") {
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
      if (data.job_position_id) {
        createPersonData.job_position_id = Number(data.job_position_id);
      }
      if (data.zone_id) {
        createPersonData.zone_id = Number(data.zone_id);
      }

      await createPersonWithRole(createPersonData, Number(data.role_id));
      successToast(
        SUCCESS_MESSAGE({ name: "Trabajador", gender: false }, "create")
      );
      navigate("/trabajadores");
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
          : "Error al crear trabajador";

      errorToast(
        errorMessage,
        ERROR_MESSAGE({ name: "Trabajador", gender: false }, "create")
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
        <div className="flex items-center gap-4 mb-4">
          <TitleFormComponent
            handleBack={() => navigate("/trabajadores")}
            icon={ICON}
            title={MODEL.name}
            mode="create"
          />
        </div>
      </div>

      <PersonForm
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        onCancel={() => navigate("/trabajadores")}
        roleId={WORKER_ROLE_ID}
        isWorker={true}
        showJobPosition={true}
        showZone={true}
      />
    </FormWrapper>
  );
}
