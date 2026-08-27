import { useState } from "react";
import type { UseFormReturn } from "react-hook-form";
import { FormInput } from "@/components/FormInput";
import { Button } from "@/components/ui/button";
import { Loader, Search } from "lucide-react";
import {
  searchDNI,
  searchRUC,
  isValidData,
} from "@/lib/document-search.service";

const MAX_LENGTH_BY_TYPE: Record<string, number> = {
  RUC: 11,
  DNI: 8,
  CE: 12,
  PASAPORTE: 9,
};

export interface FieldsFromSearch {
  names: boolean;
  father_surname: boolean;
  mother_surname: boolean;
  business_name: boolean;
  address: boolean;
}

// Detecta el tipo de documento según la longitud / formato del número
function detectDocumentType(docNumber: string): string | null {
  if (!docNumber) return null;
  const length = docNumber.length;

  if (length === 8 && /^\d+$/.test(docNumber)) return "DNI";
  if (length === 11 && /^\d+$/.test(docNumber)) return "RUC";
  if (length === 12 && /^\d+$/.test(docNumber)) return "CE";
  if (length >= 7 && length <= 9) return "PASAPORTE";

  return null;
}

interface DocumentNumberFieldProps {
  form: UseFormReturn<any>;
  typeDocument?: string;
  setFieldsFromSearch: React.Dispatch<React.SetStateAction<FieldsFromSearch>>;
}

export function DocumentNumberField({
  form,
  typeDocument,
  setFieldsFromSearch,
}: DocumentNumberFieldProps) {
  const [isSearching, setIsSearching] = useState(false);
  const numberDocument = (form.watch("number_document") as string) || "";

  const detectedDocType = detectDocumentType(numberDocument);
  const hasDocumentMismatch =
    !!detectedDocType &&
    !!typeDocument &&
    detectedDocType !== typeDocument &&
    [8, 11, 12].includes(numberDocument.length);

  const canSearch =
    (typeDocument === "DNI" && numberDocument.length === 8) ||
    (typeDocument === "RUC" && numberDocument.length === 11);

  const showSearchButton = typeDocument === "DNI" || typeDocument === "RUC";

  const handleSearch = async () => {
    setIsSearching(true);
    try {
      if (typeDocument === "DNI" && numberDocument.length === 8) {
        const response = await searchDNI({ search: numberDocument });
        if (response.data) {
          setFieldsFromSearch((prev) => {
            const next = { ...prev };
            if (isValidData(response.data.names)) {
              form.setValue("names", response.data.names);
              next.names = true;
            }
            if (isValidData(response.data.father_surname)) {
              form.setValue("father_surname", response.data.father_surname);
              next.father_surname = true;
            }
            if (isValidData(response.data.mother_surname)) {
              form.setValue("mother_surname", response.data.mother_surname);
              next.mother_surname = true;
            }
            return next;
          });
        }
      } else if (typeDocument === "RUC" && numberDocument.length === 11) {
        const response = await searchRUC({ search: numberDocument });
        if (response.data) {
          setFieldsFromSearch((prev) => {
            const next = { ...prev };
            if (isValidData(response.data.business_name)) {
              form.setValue("business_name", response.data.business_name);
              next.business_name = true;
            }
            if (isValidData(response.data.address)) {
              form.setValue("address", response.data.address!);
              next.address = true;
            }
            return next;
          });
        }
      }
    } catch (error) {
      console.error("Error searching document:", error);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="flex items-end gap-2">
      <div className="flex-1 min-w-0">
        <FormInput
          control={form.control}
          name="number_document"
          label="Número de Documento"
          placeholder="Número de Documento"
          maxLength={typeDocument ? MAX_LENGTH_BY_TYPE[typeDocument] ?? 0 : 0}
        >
          {hasDocumentMismatch && (
            <p className="w-full text-sm text-amber-600 dark:text-amber-500">
              ⚠️ El número ingresado parece ser un {detectedDocType}, pero
              seleccionaste {typeDocument}
            </p>
          )}
        </FormInput>
      </div>
      {showSearchButton && (
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="shrink-0 h-7 md:h-8"
          disabled={!canSearch || isSearching}
          onClick={handleSearch}
        >
          {isSearching ? (
            <Loader className="h-4 w-4 animate-spin" />
          ) : (
            <Search className="h-4 w-4" />
          )}
        </Button>
      )}
    </div>
  );
}
