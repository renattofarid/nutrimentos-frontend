"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import ActionsWrapper from "@/components/ActionsWrapper";
export default function PersonActions() {
  return (
    <ActionsWrapper>
      <Button colorIcon="green" size="sm" variant="outline">
        <Plus /> Nuevo
      </Button>
    </ActionsWrapper>
  );
}
