import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import TitleComponent from "@/components/TitleComponent";
import PriceListForm from "./PriceListForm";
import { usePriceListStore } from "../lib/pricelist.store";
import { PRICELIST } from "../lib/pricelist.interface";
import type { PriceListSchemaCreate } from "../lib/pricelist.schema";
import {
  successToast,
  errorToast,
  SUCCESS_MESSAGE,
  ERROR_MESSAGE,
} from "@/lib/core.function";
import FormWrapper from "@/components/FormWrapper";

const { MODEL, ICON, TITLES } = PRICELIST;

export default function PriceListAddPage() {
  const navigate = useNavigate();
  const { createPriceList, isSubmitting } = usePriceListStore();

  const handleSubmit = async (data: PriceListSchemaCreate) => {
    try {
      await createPriceList(data);
      successToast(SUCCESS_MESSAGE(MODEL, "create"));
      navigate(PRICELIST.ROUTE);
    } catch (error: any) {
      errorToast(error.response?.data?.message, ERROR_MESSAGE(MODEL, "create"));
    }
  };

  const handleCancel = () => {
    navigate(PRICELIST.ROUTE);
  };

  return (
    <FormWrapper>
      <TitleComponent
        title={TITLES.create.title}
        subtitle={TITLES.create.subtitle}
        icon={ICON}
      />

      <Card>
        <CardContent className="pt-6">
          <PriceListForm
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isSubmitting={isSubmitting}
            mode="create"
          />
        </CardContent>
      </Card>
    </FormWrapper>
  );
}
