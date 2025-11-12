import { useEffect } from "react";
import { useDocumentTypeStore } from "./document-type.store";

export function useDocumentType(params?: Record<string, unknown>) {
  const { documentTypes, meta, isLoading, error, fetchDocumentTypes } = useDocumentTypeStore();

  useEffect(() => {
    if (!documentTypes) fetchDocumentTypes(params);
  }, [documentTypes, fetchDocumentTypes, params]);

  return {
    data: documentTypes,
    meta,
    isLoading,
    error,
    refetch: fetchDocumentTypes,
  };
}

export function useAllDocumentTypes() {
  const { allDocumentTypes, isLoadingAll, error, fetchAllDocumentTypes } = useDocumentTypeStore();

  useEffect(() => {
    if (!allDocumentTypes) fetchAllDocumentTypes();
  }, [allDocumentTypes, fetchAllDocumentTypes]);

  return {
    data: allDocumentTypes,
    isLoading: isLoadingAll,
    error,
    refetch: fetchAllDocumentTypes,
  };
}

export function useDocumentTypeById(id: number) {
  const { documentType, isFinding, error, fetchDocumentType } = useDocumentTypeStore();

  useEffect(() => {
    fetchDocumentType(id);
  }, [id, fetchDocumentType]);

  return {
    data: documentType,
    isFinding,
    error,
    refetch: () => fetchDocumentType(id),
  };
}

