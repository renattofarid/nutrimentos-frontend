import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { BackButton } from "@/components/BackButton";
import TitleComponent from "@/components/TitleComponent";
import FormWrapper from "@/components/FormWrapper";
import FormSkeleton from "@/components/FormSkeleton";
import { GroupFormSection } from "@/components/GroupFormSection";
import { DataTable } from "@/components/DataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Pencil, CheckCircle, XCircle, FileText, Package } from "lucide-react";
import { WAREHOUSE_DOCUMENT } from "../lib/warehouse-document.interface";
import type {
  WarehouseDocumentResource,
  WarehouseDocumentResourceDetail,
} from "../lib/warehouse-document.interface";
import {
  findWarehouseDocumentById,
  confirmWarehouseDocument,
  cancelWarehouseDocument,
} from "../lib/warehouse-document.actions";
import {
  getDocumentTypeLabel,
  getDocumentStatusVariant,
} from "../lib/warehouse-document.constants";
import { errorToast, successToast } from "@/lib/core.function";
import { parse } from "date-fns";
import type { ColumnDef } from "@tanstack/react-table";

const { ROUTE } = WAREHOUSE_DOCUMENT;

export default function WarehouseDocumentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [document, setDocument] = useState<WarehouseDocumentResource | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [confirmId, setConfirmId] = useState<number | null>(null);
  const [cancelId, setCancelId] = useState<number | null>(null);

  const columns: ColumnDef<WarehouseDocumentResourceDetail>[] = [
    {
      id: "index",
      header: "#",
      cell: ({ row }) => <span className="font-medium">{row.index + 1}</span>,
    },
    {
      accessorKey: "product.name",
      header: "Producto",
      cell: ({ row }) => <span>{row.original.product.name}</span>,
    },
    {
      accessorKey: "quantity_sacks",
      header: "Cantidad (Sacos)",
      cell: ({ row }) => (
        <span className="text-right block">{row.original.quantity_sacks}</span>
      ),
    },
    {
      accessorKey: "quantity_kg",
      header: "Cantidad (Kg)",
      cell: ({ row }) => (
        <span className="text-right block">{row.original.quantity_kg}</span>
      ),
    },
    {
      accessorKey: "unit_price",
      header: "Precio Unitario",
      cell: ({ row }) => (
        <span className="text-right block">
          S/. {Number(row.original.unit_price).toFixed(2)}
        </span>
      ),
    },
    {
      id: "subtotal",
      header: "Subtotal",
      cell: ({ row }) => (
        <span className="text-right block font-semibold">
          S/.{" "}
          {(row.original.quantity_sacks * row.original.unit_price).toFixed(2)}
        </span>
      ),
    },
  ];

  useEffect(() => {
    if (!id) {
      navigate(`/${ROUTE}`);
      return;
    }
    loadDocument();
  }, [id, navigate]);

  const loadDocument = async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const response = await findWarehouseDocumentById(Number(id));
      setDocument(response.data);
    } catch (error: any) {
      const errorMessage =
        error.response.data.message ??
        error.response.data.error ??
        "Error al cargar el documento";
      errorToast(errorMessage);
      navigate(`/${ROUTE}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = () => {
    if (document) {
      navigate(`/${ROUTE}/actualizar/${document.id}`);
    }
  };

  const handleConfirm = async () => {
    if (!confirmId) return;
    try {
      await confirmWarehouseDocument(confirmId);
      successToast("Documento confirmado exitosamente");
      await loadDocument();
    } catch (error: any) {
      const errorMessage =
        error.response.data.message ??
        error.response.data.error ??
        "Error al confirmar el documento";
      errorToast(errorMessage);
    } finally {
      setConfirmId(null);
    }
  };

  const handleCancel = async () => {
    if (!cancelId) return;
    try {
      await cancelWarehouseDocument(cancelId);
      successToast("Documento cancelado exitosamente");
      await loadDocument();
    } catch (error: any) {
      const errorMessage =
        error.response.data.message ??
        error.response.data.error ??
        "Error al cancelar el documento";
      errorToast(errorMessage);
    } finally {
      setCancelId(null);
    }
  };

  if (isLoading) {
    return (
      <FormWrapper>
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            <BackButton to={`${ROUTE}`} />
            <TitleComponent title="Detalle del Documento" />
          </div>
        </div>
        <FormSkeleton />
      </FormWrapper>
    );
  }

  if (!document) {
    return (
      <FormWrapper>
        <div className="flex items-center gap-4 mb-6">
          <BackButton to={`${ROUTE}`} />
          <TitleComponent title="Detalle del Documento" />
        </div>
        <div className="text-center py-8">
          <p className="text-muted-foreground">Documento no encontrado</p>
        </div>
      </FormWrapper>
    );
  }

  const isEntry = document.document_type.startsWith("ENTRADA_");

  return (
    <FormWrapper>
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <BackButton to={`${ROUTE}`} />
            <TitleComponent
              title={`Documento ${document.document_number}`}
              subtitle={getDocumentTypeLabel(document.document_type)}
            />
          </div>
          <div className="flex gap-2">
            {document.status === "BORRADOR" && (
              <>
                <Button onClick={handleEdit} variant="outline">
                  <Pencil className="h-4 w-4 mr-2" />
                  Editar
                </Button>
                <Button
                  onClick={() => setConfirmId(document.id)}
                  variant="default"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Confirmar
                </Button>
              </>
            )}
            {document.status === "CONFIRMADO" && (
              <Button
                onClick={() => setCancelId(document.id)}
                variant="destructive"
              >
                <XCircle className="h-4 w-4 mr-2" />
                Cancelar
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <GroupFormSection title="Información General" icon={FileText}>
          <div>
            <span className="text-sm text-muted-foreground">
              Número de Documento
            </span>
            <p className="font-semibold text-lg font-mono">
              {document.document_number}
            </p>
          </div>
          <div>
            <span className="text-sm text-muted-foreground">
              Almacén de Origen
            </span>
            <p className="font-semibold">{document.warehouse_origin.name}</p>
          </div>
          {document.warehouse_destination && (
            <div>
              <span className="text-sm text-muted-foreground">
                Almacén de Destino
              </span>
              <p className="font-semibold">
                {document.warehouse_destination?.name || "N/A"}
              </p>
            </div>
          )}
          {document.responsible_origin && (
            <div>
              <span className="text-sm text-muted-foreground">
                Responsable de Origen
              </span>
              <p className="font-semibold">
                {document.responsible_origin?.name || "N/A"}
              </p>
            </div>
          )}
          {document.responsible_destination && (
            <div>
              <span className="text-sm text-muted-foreground">
                Responsable de Destino
              </span>
              <p className="font-semibold">
                {document.responsible_destination?.name || "N/A"}
              </p>
            </div>
          )}
          {document.purchase && (
            <div>
              <span className="text-sm text-muted-foreground">
                Compra Asociada
              </span>
              <p className="font-semibold">
                {document.purchase?.document_number || "N/A"}
              </p>
            </div>
          )}
          <div>
            <span className="text-sm text-muted-foreground">
              Tipo de Documento
            </span>
            <div className="mt-1">
              <Badge variant={isEntry ? "default" : "secondary"}>
                {getDocumentTypeLabel(document.document_type)}
              </Badge>
            </div>
          </div>
          <div>
            <span className="text-sm text-muted-foreground">
              Fecha del Documento
            </span>
            <p className="font-semibold">
              {parse(
                document.movement_date,
                "yyyy-MM-dd",
                new Date()
              ).toLocaleDateString("es-ES", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              })}
            </p>
          </div>
          <div>
            <span className="text-sm text-muted-foreground">Estado</span>
            <div className="mt-1">
              <Badge
                variant={getDocumentStatusVariant(document.status)}
                className="font-semibold"
              >
                {document.status}
              </Badge>
            </div>
          </div>
          <div>
            <span className="text-sm text-muted-foreground">
              Fecha de Creación
            </span>
            <p className="font-semibold">
              {new Date(document.created_at).toLocaleDateString("es-ES", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
          {document.observations && (
            <div className="col-span-full">
              <span className="text-sm text-muted-foreground">
                Observaciones
              </span>
              <p className="mt-1 text-sm bg-sidebar p-3 rounded-md">
                {document.observations}
              </p>
            </div>
          )}
        </GroupFormSection>

        <GroupFormSection
          title={`Detalles del Documento (${
            document.details?.length || 0
          } productos)`}
          icon={Package}
          cols={{ sm: 1 }}
        >
          <div className="col-span-full">
            {document.details && document.details.length > 0 ? (
              <>
                <DataTable
                  columns={columns}
                  data={document.details}
                  isVisibleColumnFilter={false}
                />
                <div className="mt-4 flex justify-end">
                  <div className="bg-muted px-6 py-3 rounded-lg">
                    <span className="text-lg font-bold mr-4">Total:</span>
                    <span className="text-lg font-bold text-primary">
                      S/.{" "}
                      {document.details
                        .reduce(
                          (sum, detail) =>
                            sum + detail.quantity_kg * detail.unit_price,
                          0
                        )
                        .toFixed(2)}
                    </span>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Badge variant="outline" className="text-lg p-3">
                  No hay productos en este documento
                </Badge>
              </div>
            )}
          </div>
        </GroupFormSection>
      </div>

      {confirmId !== null && (
        <AlertDialog
          open={true}
          onOpenChange={(open) => !open && setConfirmId(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar Documento</AlertDialogTitle>
              <AlertDialogDescription>
                ¿Está seguro que desea confirmar este documento? Esta acción
                actualizará el inventario y no se podrá editar posteriormente.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleConfirm}>
                Confirmar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {cancelId !== null && (
        <AlertDialog
          open={true}
          onOpenChange={(open) => !open && setCancelId(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Cancelar Documento</AlertDialogTitle>
              <AlertDialogDescription>
                ¿Está seguro que desea cancelar este documento? Esta acción
                revertirá los cambios en el inventario.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>No, mantener</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleCancel}
                className="bg-destructive"
              >
                Sí, cancelar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </FormWrapper>
  );
}
