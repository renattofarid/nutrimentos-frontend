"use client";

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { type PersonSchema } from "@/pages/person/lib/person.schema";
import { PersonForm } from "@/pages/person/components/PersonForm";
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
import { DRIVER_ROLE_ID } from "../lib/driver.interface";
import type { PersonResource } from "@/pages/person/lib/person.interface";

import FormWrapper from "@/components/FormWrapper";
import FormSkeleton from "@/components/FormSkeleton";
import { TYPE_DOCUMENT } from "@/pages/person/lib/person.constants";

// Helper function to map document_type_id to type_document name
const getDocumentTypeName = (
  documentTypeId: string,
): "DNI" | "RUC" | "CE" | "PASAPORTE" => {
  if (documentTypeId === TYPE_DOCUMENT.DNI.id) return "DNI";
  if (documentTypeId === TYPE_DOCUMENT.RUC.id) return "RUC";
  return "DNI"; // Default fallback
};

export default function DriverEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [personData, setPersonData] = useState<PersonResource | null>(null);

  useEffect(() => {
    const loadPersonData = async () => {
      if (!id) {
        navigate("/conductores");
        return;
      }

      try {
        setIsLoading(true);
        const response = await findPersonById(Number(id));
        const person = response.data;
        setPersonData(person);
      } catch {
        errorToast("Error al cargar los datos del conductor");
        navigate("/conductores");
      } finally {
        setIsLoading(false);
      }
    };

    loadPersonData();
  }, [id, navigate]);

  const handleSubmit = async (data: PersonSchema) => {
    if (!personData) return;

    setIsSubmitting(true);
    try {
      // Ensure number_document is not undefined
      const numberDocument = data.number_document || "";

      // Transform PersonSchema to UpdatePersonRequest
      const updatePersonData = {
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
        driver_license: data.driver_license || "",
      };

      await updatePerson(personData.id, updatePersonData);
      successToast(
        SUCCESS_MESSAGE({ name: "Conductor", gender: false }, "update"),
      );
      navigate("/conductores");
    } catch (error: any) {
      const errorMessage =
        ((error.response.data.message ??
          error.response.data.error) as string) ??
        "Error al actualizar conductor";

      errorToast(
        errorMessage,
        ERROR_MESSAGE({ name: "Conductor", gender: false }, "update"),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <FormWrapper>
        <FormSkeleton />
      </FormWrapper>
    );
  }

  return (
    <FormWrapper>
      <PersonForm
        initialData={personData}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        onCancel={() => navigate("/conductores")}
        roleId={DRIVER_ROLE_ID}
        isWorker={false}
        isDriver
        showBusinessType
      />
    </FormWrapper>
  );
}
