"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { PERSON } from "../lib/person.interface";
import ActionsWrapper from "@/components/ActionsWrapper";
export default function PersonActions() {
  const { MODEL } = PERSON;
  return (
    <ActionsWrapper>
      <Button size="sm" className="ml-auto">
        <Plus className="size-4 mr-2" /> Agregar {MODEL.name}
      </Button>
    </ActionsWrapper>
  );
}
