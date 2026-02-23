import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import WarehouseDocumentForm from "./WarehouseDocumentForm";
import TitleComponent from "@/components/TitleComponent";
import { BackButton } from "@/components/BackButton";
import PageWrapper from "@/components/PageWrapper";
import { WAREHOUSE_DOCUMENT } from "../lib/warehouse-document.interface";
import type { WarehouseDocumentSchema } from "../lib/warehouse-document.schema";
import { useWarehouseDocumentById } from "../lib/warehouse-document.hook";
import { useWarehouseDocumentStore } from "../lib/warehouse-document.store";
import { useAllWarehouses } from "@/pages/warehouse/lib/warehouse.hook";
import { successToast, errorToast } from "@/lib/core.function";
import PageSkeleton from "@/components/PageSkeleton";
import { useAllWorkers } from "@/pages/worker/lib/worker.hook";
import { useAllPurchases } from "@/pages/purchase/lib/purchase.hook";

const { ICON, TITLES } = WAREHOUSE_DOCUMENT;

export default function WarehouseDocumentEditPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: warehouses } = useAllWarehouses();
  const { data: persons = [] } = useAllWorkers();
  const { data: purchases = [] } = useAllPurchases();

  const { data: document, isFinding } = useWarehouseDocumentById(parseInt(id!));
  const { updateDocument } = useWarehouseDocumentStore();

  const handleSubmit = async (data: WarehouseDocumentSchema) => {
    if (!id) return;

    setIsSubmitting(true);
    try {
      const payload = {
        warehouse_origin_id: parseInt(data.warehouse_origin_id),
        warehouse_dest_id: data.warehouse_dest_id
          ? parseInt(data.warehouse_dest_id)
          : undefined,
        responsible_origin_id: data.responsible_origin_id
          ? parseInt(data.responsible_origin_id)
          : undefined,
        responsible_dest_id: data.responsible_dest_id
          ? parseInt(data.responsible_dest_id)
          : undefined,
        document_type: data.document_type as any,
        motive: data.motive as any,
        movement_date: data.movement_date,
        purchase_id: data.purchase_id ? parseInt(data.purchase_id) : undefined,
        observations: data.observations,
        details: data.details.map((detail) => ({
          id: detail.id,
          product_id: parseInt(detail.product_id),
          quantity: detail.quantity_sacks,
          quantity_sacks: detail.quantity_sacks,
          quantity_kg: detail.quantity_kg,
          unit_price: detail.unit_price,
          observations: detail.observations,
        })),
      };

      await updateDocument(parseInt(id), payload);
      successToast("Documento actualizado exitosamente");
      navigate("/documentos-almacen");
    } catch (error: any) {
      const errorMessage =
        error.response.data.message ??
        error.response.data.error ??
        "Error al actualizar el documento";
      errorToast(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isFinding) {
    return <PageSkeleton />;
  }

  if (!document) {
    return (
      <PageWrapper>
        <div className="text-center py-8">
          <p className="text-muted-foreground">Documento no encontrado</p>
        </div>
      </PageWrapper>
    );
  }

  const defaultValues: Partial<WarehouseDocumentSchema> = {
    warehouse_origin_id: document.warehouse_origin
      ? document.warehouse_origin.id.toString()
      : "",
    warehouse_dest_id: document.warehouse_destination
      ? document.warehouse_destination.id.toString()
      : "",
    document_type: document.document_type,
    motive: document.motive,
    responsible_dest_id: document.responsible_destination
      ? document.responsible_destination.id.toString()
      : "",
    responsible_origin_id: document.responsible_origin
      ? document.responsible_origin.id.toString()
      : "",
    purchase_id: document.purchase ? document.purchase.id.toString() : "",
    movement_date: document.movement_date,
    observations: document.observations || "",
    details: document.details?.map((detail) => ({
      id: detail.id,
      product_id: detail.product.id.toString(),
      product_code: detail.product.codigo,
      product_name: detail.product.name,
      quantity_sacks: detail.quantity_sacks,
      quantity_kg: detail.quantity_kg,
      unit_price: detail.unit_price,
      observations: "",
    })) as any,
  };

  return (
    <PageWrapper>
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <BackButton />
          <TitleComponent
            title={TITLES.update.title}
            subtitle={TITLES.update.subtitle}
            icon={ICON}
          />
        </div>

        {warehouses && persons &&  (
          <WarehouseDocumentForm
            onSubmit={handleSubmit}
            defaultValues={defaultValues}
            isSubmitting={isSubmitting}
            mode="update"
            warehouses={warehouses}
            persons={persons}
            purchases={purchases || []}
          />
        )}
      </div>
    </PageWrapper>
  );
}
