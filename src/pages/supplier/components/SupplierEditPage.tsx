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
import { SUPPLIER, SUPPLIER_ROLE_ID } from "../lib/supplier.interface";
import type { PersonResource } from "@/pages/person/lib/person.interface";
import FormWrapper from "@/components/FormWrapper";
import TitleFormComponent from "@/components/TitleFormComponent";
import { TYPE_DOCUMENT } from "@/pages/person/lib/person.constants";
import FormSkeleton from "@/components/FormSkeleton";

const { MODEL, ICON } = SUPPLIER;

export default function SupplierEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [personData, setPersonData] = useState<PersonResource | null>(null);

  useEffect(() => {
    const loadPersonData = async () => {
      if (!id) {
        navigate("/proveedores");
        return;
      }

      try {
        setIsLoading(true);
        const response = await findPersonById(Number(id));
        const person = response.data;
        setPersonData(person);
      } catch {
        errorToast("Error al cargar los datos del proveedor");
        navigate("/proveedores");
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
      // Transform PersonSchema to UpdatePersonRequest
      const updatePersonData: any = {
        document_type_id: data.document_type_id,
        type_person: data.type_person,
        number_document: data.number_document,
        address: data.address || "",
        phone: data.phone,
        email: data.email,
      };

      // Only include names when NATURAL or when the document type is DNI
      if (
        data.type_person === "NATURAL" ||
        data.document_type_id === TYPE_DOCUMENT.DNI.id
      ) {
        updatePersonData.names = data.names || "";
      }

      // Add fields specific to NATURAL person
      if (data.type_person === "NATURAL") {
        updatePersonData.gender = data.gender || "M";
        updatePersonData.birth_date = data.birth_date || "";
        updatePersonData.father_surname = data.father_surname || "";
        updatePersonData.mother_surname = data.mother_surname || "";
      }

      // Add fields specific to JURIDICA person
      if (data.type_person === "JURIDICA") {
        updatePersonData.business_name = data.business_name || "";
        updatePersonData.commercial_name = data.commercial_name || "";
      }

      // Add optional fields if provided
      if (data.business_type_id) {
        updatePersonData.business_type_id = Number(data.business_type_id);
      }
      if (data.zone_id) {
        updatePersonData.zone_id = Number(data.zone_id);
      }

      await updatePerson(personData.id, updatePersonData);
      successToast(
        SUCCESS_MESSAGE({ name: "Proveedor", gender: false }, "update")
      );
      navigate("/proveedores");
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
          : "Error al actualizar proveedor";

      errorToast(
        errorMessage,
        ERROR_MESSAGE({ name: "Proveedor", gender: false }, "update")
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <FormWrapper>
        <div className="flex items-center gap-4 mb-6">
          <TitleFormComponent
            title={MODEL.name}
            mode="edit"
            icon={ICON}
            handleBack={() => navigate("/proveedores")}
          />
        </div>

        <FormSkeleton />
      </FormWrapper>
    );
  }

  return (
    <FormWrapper>
      <div className="flex items-center gap-4 mb-6">
        <TitleFormComponent
          title={MODEL.name}
          mode="edit"
          icon={ICON}
          handleBack={() => navigate("/proveedores")}
        />
      </div>

      <PersonForm
        initialData={personData}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        onCancel={() => navigate("/proveedores")}
        roleId={SUPPLIER_ROLE_ID}
        showBusinessType={true}
        showZone={true}
      />
    </FormWrapper>
  );
}
