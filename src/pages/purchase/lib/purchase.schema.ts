import { z } from "zod";

export const purchaseDetailSchema = z.object({
  product_id: z
    .number({
      error: "El producto es requerido",
    })
    .min(1, {
      message: "Debe seleccionar un producto",
    }),
  quantity: z
    .number({
      error: "La cantidad es requerida",
    })
    .min(0.01, {
      message: "La cantidad debe ser mayor a 0",
    }),
  unit_price: z
    .number({
      error: "El precio unitario es requerido",
    })
    .min(0, {
      message: "El precio unitario debe ser mayor o igual a 0",
    }),
});

export const purchaseInstallmentSchema = z.object({
  due_days: z
    .number({
      error: "Los días de vencimiento son requeridos",
    })
    .min(1, {
      message: "Los días de vencimiento deben ser mayores a 0",
    }),
  amount: z
    .number({
      error: "El monto es requerido",
    })
    .min(0.01, {
      message: "El monto debe ser mayor a 0",
    }),
});

export const purchaseSchemaCreate = z
  .object({
    company_id: z
      .number({
        error: "La empresa es requerida",
      })
      .min(1, {
        message: "Debe seleccionar una empresa",
      }),
    warehouse_id: z
      .number({
        error: "El almacén es requerido",
      })
      .min(1, {
        message: "Debe seleccionar un almacén",
      }),
    supplier_id: z
      .number({
        error: "El proveedor es requerido",
      })
      .min(1, {
        message: "Debe seleccionar un proveedor",
      }),
    issue_date: z.string().min(1, {
      message: "La fecha de emisión es requerida",
    }),
    reception_date: z.string().min(1, {
      message: "La fecha de recepción es requerida",
    }),
    due_date: z.string().min(1, {
      message: "La fecha de vencimiento es requerida",
    }),
    document_type: z.enum(["BOLETA", "FACTURA"]),
    document_number: z
      .string()
      .min(1, {
        message: "El número de documento es requerido",
      })
      .max(50, {
        message: "El número de documento no puede tener más de 50 caracteres",
      }),
    payment_type: z.enum(["CONTADO", "CREDITO"]),
    include_igv: z.boolean(),
    currency: z.enum(["PEN", "USD"]),
    details: z
      .array(purchaseDetailSchema)
      .min(1, {
        message: "Debe agregar al menos un detalle de compra",
      }),
    installments: z.array(purchaseInstallmentSchema).optional(),
  })
  .refine(
    (data) => {
      // Si el tipo de pago es CREDITO, debe haber al menos una cuota
      if (data.payment_type === "CREDITO") {
        return data.installments && data.installments.length > 0;
      }
      return true;
    },
    {
      message: "Debe agregar al menos una cuota para pago a crédito",
      path: ["installments"],
    }
  );

export const purchaseSchemaUpdate = purchaseSchemaCreate.partial();

export type PurchaseSchema = z.infer<typeof purchaseSchemaCreate>;
export type PurchaseDetailSchema = z.infer<typeof purchaseDetailSchema>;
export type PurchaseInstallmentSchema = z.infer<typeof purchaseInstallmentSchema>;
