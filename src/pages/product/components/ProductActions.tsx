"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { PRODUCT } from "../lib/product.interface";
import ActionsWrapper from "@/components/ActionsWrapper";

interface ProductActionsProps {
  onCreateProduct: () => void;
}

export default function ProductActions({ onCreateProduct }: ProductActionsProps) {
  const { MODEL } = PRODUCT;

  return (
    <ActionsWrapper>
      <Button
        size="sm"
        className="ml-auto"
        onClick={onCreateProduct}
      >
        <Plus className="size-4 mr-2" /> Agregar {MODEL.name}
      </Button>
    </ActionsWrapper>
  );
}