"use client";

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { BackButton } from "@/components/BackButton";
import TitleFormComponent from "@/components/TitleFormComponent";
import { PurchaseForm } from "./PurchaseForm";
import { usePurchaseInstallmentStore } from "../lib/purchase-installment.store";
import { useAllWarehouses } from "@/pages/warehouse/lib/warehouse.hook";
import { useAllProducts } from "@/pages/product/lib/product.hook";
import { useAuthStore } from "@/pages/auth/lib/auth.store";
import FormWrapper from "@/components/FormWrapper";
import FormSkeleton from "@/components/FormSkeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { PurchaseDetailTable } from "./PurchaseDetailTable";
import { errorToast } from "@/lib/core.function";
import { useAllSuppliers } from "@/pages/supplier/lib/supplier.hook";
import { usePurchaseStore } from "../lib/purchase.store";
import type { PurchaseResource } from "../lib/purchase.interface";
import type { PurchaseSchema } from "../lib/purchase.schema";
import { PurchaseInstallmentTable } from "./PurchaseInstallmentTable";
import { useAllCompanies } from "@/pages/company/lib/company.hook";
import { PurchaseInstallmentModal } from "./PurchaseInstallmentModal";

export const PurchaseEditPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modal states
  const [isInstallmentModalOpen, setIsInstallmentModalOpen] = useState(false);
  const [editingInstallmentId, setEditingInstallmentId] = useState<
    number | null
  >(null);

  const { user } = useAuthStore();
  const { data: suppliers, isLoading: suppliersLoading } = useAllSuppliers();
  const { data: warehouses, isLoading: warehousesLoading } = useAllWarehouses();
  const { data: products, isLoading: productsLoading } = useAllProducts();
  const { data: companies = [], isLoading: companiesLoading } =
    useAllCompanies();

  const { updatePurchase, fetchPurchase, purchase, isFinding } =
    usePurchaseStore();
  const { fetchInstallments, installments } = usePurchaseInstallmentStore();

  const isLoading =
    suppliersLoading ||
    warehousesLoading ||
    productsLoading ||
    companiesLoading ||
    isFinding;

  useEffect(() => {
    if (!id) {
      navigate("/compras");
      return;
    }
    fetchPurchase(Number(id));
  }, [id, navigate, fetchPurchase]);

  useEffect(() => {
    if (id) {
      fetchPurchase(Number(id));
      fetchInstallments(Number(id));
    }
  }, [id, fetchPurchase, fetchInstallments]);

  const mapPurchaseToForm = (
    data: PurchaseResource
  ): Partial<PurchaseSchema> => ({
    supplier_id: data.supplier_id?.toString(),
    warehouse_id: data.warehouse_id?.toString(),
    purchase_order_id: data.purchase_order_id?.toString() || "",
    document_type: data.document_type,
    document_number: data.document_number,
    issue_date: data.issue_date,
    payment_type: data.payment_type,
    currency: data.currency,
    details: data.details.map((detail) => ({
      product_id: detail.product.id.toString(),
      quantity: detail.quantity.toString(),
      unit_price: detail.unit_price.toString(),
    })),
    installments: data.installments.map((installment) => ({
      due_date: installment.due_date.toString(),
      amount: installment.amount.toString(),
      due_days: installment.due_days.toString(),
    })),
  });

  const handleSubmit = async (data: Partial<PurchaseSchema>) => {
    if (!purchase || !id) return;

    setIsSubmitting(true);
    try {
      await updatePurchase(Number(id), data);
      // El toast de éxito se muestra en el store
      navigate("/compras");
    } catch (error: any) {
      errorToast(
        error.response?.data?.message || "Error al actualizar la compra"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Installment handlers
  const handleAddInstallment = () => {
    setEditingInstallmentId(null);
    setIsInstallmentModalOpen(true);
  };

  const handleEditInstallment = (installmentId: number) => {
    setEditingInstallmentId(installmentId);
    setIsInstallmentModalOpen(true);
  };

  const handleInstallmentModalClose = () => {
    setIsInstallmentModalOpen(false);
    setEditingInstallmentId(null);
    if (id) {
      fetchInstallments(Number(id));
      fetchPurchase(Number(id));
    }
  };

  if (isLoading) {
    return (
      <FormWrapper>
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            <BackButton to="/compras" />
            <TitleFormComponent title="Compra" mode="edit" />
          </div>
        </div>
        <FormSkeleton />
      </FormWrapper>
    );
  }

  if (!purchase) {
    return (
      <FormWrapper>
        <div className="flex items-center gap-4 mb-6">
          <BackButton to="/compras" />
          <TitleFormComponent title="Compra" mode="edit" />
        </div>
        <div className="text-center py-8">
          <p className="text-muted-foreground">Compra no encontrada</p>
        </div>
      </FormWrapper>
    );
  }

  return (
    <FormWrapper>
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <TitleFormComponent title="Compra" mode="edit" />
        </div>
      </div>

      <div className="space-y-6">
        {/* Main Form */}
        {suppliers &&
          suppliers.length > 0 &&
          warehouses &&
          warehouses.length > 0 &&
          products &&
          products.length > 0 &&
          user && (
            <PurchaseForm
              defaultValues={mapPurchaseToForm(purchase)}
              onSubmit={handleSubmit}
              isSubmitting={isSubmitting}
              mode="update"
              suppliers={suppliers}
              warehouses={warehouses}
              products={products}
              purchase={purchase}
              companies={companies!}
              onCancel={() => navigate("/compras")}
            />
          )}

        {/* Details Section */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Detalles de la Compra</CardTitle>
            <Button onClick={() => {}}>
              <Plus className="h-4 w-4 mr-2" />
              Agregar Detalle
            </Button>
          </CardHeader>
          <CardContent>
            <PurchaseDetailTable
              details={purchase.details || []}
              onEdit={() => {}}
              onRefresh={() => id && fetchPurchase(Number(id))}
            />
          </CardContent>
        </Card>

        {/* Installments Section */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Cuotas</CardTitle>
            <Button onClick={handleAddInstallment}>
              <Plus className="h-4 w-4 mr-2" />
              Agregar Cuota
            </Button>
          </CardHeader>
          <CardContent>
            <PurchaseInstallmentTable
              installments={installments || []}
              onEdit={handleEditInstallment}
              onRefresh={() => id && fetchInstallments(Number(id))}
              isCashPayment={purchase?.payment_type === "CONTADO"}
            />
          </CardContent>
        </Card>
      </div>

      {/* Modals */}

      {isInstallmentModalOpen && (
        <PurchaseInstallmentModal
          open={isInstallmentModalOpen}
          onClose={handleInstallmentModalClose}
          purchaseId={Number(id)}
          installmentId={editingInstallmentId}
        />
      )}
    </FormWrapper>
  );
};
