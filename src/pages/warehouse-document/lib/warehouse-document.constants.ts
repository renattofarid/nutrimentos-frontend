import type {
  DocumentType,
  DocumentStatus,
  DocumentMotive,
} from "./warehouse-document.interface";

export const DOCUMENT_TYPES: { value: DocumentType; label: string }[] = [
  { value: "INGRESO", label: "Ingreso" },
  { value: "SALIDA", label: "Salida" },
  { value: "TRASLADO", label: "Traslado" },
  { value: "AJUSTE", label: "Ajuste" },
];

export const DOCUMENT_MOTIVES: { value: DocumentMotive; label: string }[] = [
  { value: "COMPRA", label: "Compra" },
  { value: "DEVOLUCION", label: "Devolución" },
  { value: "TRASLADO_INTERNO", label: "Traslado Interno" },
  { value: "AJUSTE_STOCK", label: "Ajuste de Stock" },
  { value: "OTRO", label: "Otro" },
];

export const DOCUMENT_STATUS: {
  value: DocumentStatus;
  label: string;
  variant: "default" | "secondary" | "destructive";
}[] = [
  { value: "BORRADOR", label: "Borrador", variant: "secondary" },
  { value: "CONFIRMADO", label: "Confirmado", variant: "default" },
  { value: "CANCELADO", label: "Cancelado", variant: "destructive" },
];

export const MOVEMENT_TYPES = [
  { value: "ENTRADA", label: "Entrada" },
  { value: "SALIDA", label: "Salida" },
];

export const getDocumentTypeLabel = (type: DocumentType): string => {
  return DOCUMENT_TYPES.find((dt) => dt.value === type)?.label || type;
};

export const getDocumentStatusLabel = (status: DocumentStatus): string => {
  return DOCUMENT_STATUS.find((ds) => ds.value === status)?.label || status;
};

export const getDocumentStatusVariant = (
  status: DocumentStatus,
): "default" | "secondary" | "destructive" => {
  return (
    DOCUMENT_STATUS.find((ds) => ds.value === status)?.variant || "default"
  );
};

export const isEntryDocument = (type: DocumentType): boolean => {
  return type.startsWith("ENTRADA_");
};

export const isExitDocument = (type: DocumentType): boolean => {
  return type.startsWith("SALIDA_");
};
