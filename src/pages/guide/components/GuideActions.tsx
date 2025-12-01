import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { GUIDE } from "../lib/guide.interface";

export default function GuideActions() {
  const navigate = useNavigate();

  return (
    <Button onClick={() => navigate(GUIDE.ROUTE_ADD)}>
      <Plus className="mr-2 h-4 w-4" />
      Agregar {GUIDE.MODEL.name}
    </Button>
  );
}
