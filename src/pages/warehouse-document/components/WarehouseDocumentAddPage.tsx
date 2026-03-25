import { useState } from "react";
import { useNavigate } from "react-router-dom";
import WarehouseDocumentForm from "./WarehouseDocumentForm";

import { WAREHOUSE_DOCUMENT } from "../lib/warehouse-document.interface";
import type { WarehouseDocumentSchema } from "../lib/warehouse-document.schema";
import { storeWarehouseDocument } from "../lib/warehouse-document.actions";
import { useAllWarehouses } from "@/pages/warehouse/lib/warehouse.hook";
import { successToast, errorToast } from "@/lib/core.function";
import { useAllWorkers } from "@/pages/worker/lib/worker.hook";
import { useAllPurchases } from "@/pages/purchase/lib/purchase.hook";
import PageWrapper from "@/components/PageWrapper";

const { EMPTY } = WAREHOUSE_DOCUMENT;

export default function WarehouseDocumentAddPage() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: warehouses } = useAllWarehouses();
  const { data: persons = [] } = useAllWorkers();
  const { data: purchases = [] } = useAllPurchases();

  const handleSubmit = async (data: WarehouseDocumentSchema) => {
    setIsSubmitting(true);
    try {
      const payload = {
        warehouse_origin_id: parseInt(data.warehouse_origin_id),
        document_type: data.document_type as any,
        motive: data.motive as any,
        warehouse_dest_id: data.warehouse_dest_id
          ? parseInt(data.warehouse_dest_id)
          : undefined,
        responsible_origin_id: parseInt(data.responsible_origin_id),
        responsible_dest_id: data.responsible_dest_id
          ? parseInt(data.responsible_dest_id)
          : undefined,
        movement_date: data.movement_date,
        purchase_id: data.purchase_id ? parseInt(data.purchase_id) : undefined,
        observations: data.observations,
        details: data.details.map((detail) => ({
          product_id: parseInt(detail.product_id),
          quantity_sacks: detail.quantity_sacks,
          quantity_kg: detail.quantity_kg,
          unit_price: detail.unit_price,
          observations: detail.observations,
        })),
      };

      await storeWarehouseDocument(payload);
      successToast("Documento creado exitosamente");
      navigate("/documentos-almacen");
    } catch (error: any) {
      const errorMessage =
        error.response.data.message ??
        error.response.data.error ??
        "Error al crear el documento";
      errorToast(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate("/documentos-almacen");
  };

  return (
    <PageWrapper>
      <div className="space-y-4">
        {warehouses && persons && (
          <WarehouseDocumentForm
            onSubmit={handleSubmit}
            defaultValues={EMPTY}
            isSubmitting={isSubmitting}
            mode="create"
            warehouses={warehouses}
            persons={persons}
            purchases={purchases || []}
            onCancel={handleCancel}
          />
        )}
      </div>
    </PageWrapper>
  );
}
