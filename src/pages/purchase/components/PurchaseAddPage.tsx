import { useNavigate } from "react-router-dom";
import { PurchaseForm } from "./PurchaseForm";
import { usePurchaseStore } from "../lib/purchase.store";
import { useAllWarehouses } from "@/pages/warehouse/lib/warehouse.hook";
import { useAllCompanies } from "@/pages/company/lib/company.hook";
import { useAllProducts } from "@/pages/product/lib/product.hook";
import { useAllPersons } from "@/pages/person/lib/person.hook";
import TitleComponent from "@/components/TitleComponent";
import { PURCHASE } from "../lib/purchase.interface";
import {
  successToast,
  errorToast,
  SUCCESS_MESSAGE,
  ERROR_MESSAGE,
} from "@/lib/core.function";
import type { CreatePurchaseRequest } from "../lib/purchase.interface";
import { Loader } from "lucide-react";

export default function PurchaseAddPage() {
  const navigate = useNavigate();
  const { createPurchase, isSubmitting } = usePurchaseStore();
  const { data: companies, isLoading: isLoadingCompanies } = useAllCompanies();
  const { data: warehouses, isLoading: isLoadingWarehouses } =
    useAllWarehouses();
  const { data: products, isLoading: isLoadingProducts } = useAllProducts();
  const persons = useAllPersons();

  const { MODEL, ICON, ROUTE } = PURCHASE;

  const isLoading =
    isLoadingCompanies ||
    isLoadingWarehouses ||
    isLoadingProducts ||
    !persons;

  const handleSubmit = async (data: CreatePurchaseRequest) => {
    try {
      await createPurchase(data);
      successToast(SUCCESS_MESSAGE(MODEL, "create"));
      navigate(ROUTE);
    } catch (error: any) {
      errorToast(error.response?.data?.message, ERROR_MESSAGE(MODEL, "create"));
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <TitleComponent
        title={`Crear ${MODEL.name}`}
        subtitle={`Complete los campos para crear una nueva ${MODEL.name.toLowerCase()}`}
        icon={ICON}
      />

      <PurchaseForm
        defaultValues={{}}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        companies={companies || []}
        warehouses={warehouses || []}
        suppliers={persons?.filter((p) => p.roles.some((r) => r.name === "Proveedor")) || []}
        products={products || []}
        onCancel={() => navigate(ROUTE)}
      />
    </div>
  );
}
