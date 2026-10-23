// Código de producto "libre": es el único que envía la descripción escrita en la grid
export const FREE_DESCRIPTION_PRODUCT_CODE = "999";

interface DetailPayloadSource {
  product_id: string;
  product_code?: string;
  product_name?: string;
  quantity_sacks?: string;
  quantity_kg?: string;
  unit_price: string;
}

export const buildSaleDetailsPayload = (details: DetailPayloadSource[]) =>
  details.map((detail) => ({
    product_id: detail.product_id,
    ...(detail.product_code === FREE_DESCRIPTION_PRODUCT_CODE && {
      description: detail.product_name || "",
    }),
    quantity_sacks: detail.quantity_sacks || "",
    quantity_kg: detail.quantity_kg || "",
    unit_price: detail.unit_price,
  }));
