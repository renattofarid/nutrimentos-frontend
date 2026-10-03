import { useMemo, useState } from "react";
import { ClipboardPaste, Loader } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { formatNumber } from "@/lib/formatCurrency";
import { useHomeProducts } from "@/pages/product/lib/product.hook";
import type { ProductResource } from "@/pages/product/lib/product.interface";

export interface PastedDetail {
  product: ProductResource;
  quantity: number;
  unit_price: number;
  is_by_sack: boolean;
}

interface ParsedLine {
  line: number;
  code: string;
  product?: ProductResource;
  quantity: number;
  unit_price: number;
  is_by_sack: boolean;
  subtotal: number;
  tax: number;
  total: number;
  error?: string;
}

interface PurchasePasteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  includeIgv: boolean;
  igvRate: number;
  onConfirm: (rows: PastedDetail[]) => void;
}

// Acepta "1,234.56", "1234,56", "S/. 76.186", "  20 "
const parseNumber = (raw: string | undefined): number => {
  if (raw === undefined) return NaN;
  let s = raw.replace(/s\/\.?/gi, "").replace(/\s/g, "");
  if (s === "") return NaN;
  const lastComma = s.lastIndexOf(",");
  const lastDot = s.lastIndexOf(".");
  if (lastComma >= 0 && lastDot >= 0) {
    // El separador que aparece al final es el decimal
    s =
      lastComma > lastDot
        ? s.replace(/\./g, "").replace(",", ".")
        : s.replace(/,/g, "");
  } else if (lastComma >= 0) {
    // Solo comas: "1,234" / "1,234,567" = miles (formato Perú); "76,5" = decimal
    s = /^-?\d{1,3}(,\d{3})+$/.test(s) ? s.replace(/,/g, "") : s.replace(",", ".");
  }
  return Number(s);
};

const normalizeCode = (code: string) =>
  code.trim().toUpperCase().replace(/^0+(?=.)/, "");

const parseMode = (raw: string | undefined): boolean | null => {
  const v = (raw ?? "").trim().toUpperCase();
  if (v === "" || v === "S" || v.startsWith("SAC")) return true;
  if (v === "K" || v === "KG" || v.startsWith("KILO")) return false;
  return null;
};

export function PurchasePasteDialog({
  open,
  onOpenChange,
  includeIgv,
  igvRate,
  onConfirm,
}: PurchasePasteDialogProps) {
  const [text, setText] = useState("");
  const { data: allProducts, isLoading } = useHomeProducts();

  const productsByCode = useMemo(() => {
    const map = new Map<string, ProductResource>();
    (allProducts ?? []).forEach((p) => {
      if (p.codigo) map.set(normalizeCode(p.codigo), p);
    });
    return map;
  }, [allProducts]);

  const parsed = useMemo<ParsedLine[]>(() => {
    const lines = text.split(/\r?\n/);
    const result: ParsedLine[] = [];

    lines.forEach((rawLine, i) => {
      if (rawLine.trim() === "") return;
      const cells = rawLine.includes("\t")
        ? rawLine.split("\t")
        : rawLine.split(";");
      const [codeCell, qtyCell, priceCell, modeCell] = cells;
      const code = (codeCell ?? "").trim();
      const quantity = parseNumber(qtyCell);
      const unit_price = parseNumber(priceCell);

      // Ignorar fila de encabezados (ej. "Código | Cantidad | Precio")
      if (result.length === 0 && isNaN(quantity) && isNaN(unit_price)) return;

      const mode = parseMode(modeCell);
      const product = code ? productsByCode.get(normalizeCode(code)) : undefined;

      let error: string | undefined;
      if (!code) error = "Sin código";
      else if (!product) error = `Código "${code}" no existe`;
      else if (isNaN(quantity) || quantity <= 0) error = "Cantidad inválida";
      else if (isNaN(unit_price) || unit_price <= 0) error = "Precio inválido";
      else if (mode === null) error = `Modo "${modeCell?.trim()}" inválido (SACO/KG)`;

      let subtotal = 0;
      let tax = 0;
      let total = 0;
      if (!error) {
        if (includeIgv) {
          total = quantity * unit_price;
          subtotal = total / (1 + igvRate);
          tax = total - subtotal;
        } else {
          subtotal = quantity * unit_price;
          tax = subtotal * igvRate;
          total = subtotal + tax;
        }
      }

      result.push({
        line: i + 1,
        code,
        product,
        quantity,
        unit_price,
        is_by_sack: mode ?? true,
        subtotal,
        tax,
        total,
        error,
      });
    });

    return result;
  }, [text, productsByCode, includeIgv, igvRate]);

  const valid = parsed.filter((r) => !r.error);
  const invalid = parsed.length - valid.length;
  const sum = (key: "subtotal" | "tax" | "total") =>
    valid.reduce((acc, r) => acc + r[key], 0);

  const handleOpenChange = (value: boolean) => {
    if (!value) setText("");
    onOpenChange(value);
  };

  const handleConfirm = () => {
    onConfirm(
      valid.map((r) => ({
        product: r.product!,
        quantity: r.quantity,
        unit_price: r.unit_price,
        is_by_sack: r.is_by_sack,
      })),
    );
    handleOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-5xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ClipboardPaste className="size-4" /> Pegar detalles desde Excel
          </DialogTitle>
          <DialogDescription>
            Copie las columnas <b>Código · Cantidad · Precio · Modo</b> (Modo
            opcional: SACO o KG, por defecto SACO) y péguelas aquí. Precios{" "}
            {includeIgv ? "CON IGV" : "SIN IGV"}, según el switch "Precios
            incluyen IGV".
          </DialogDescription>
        </DialogHeader>

        <Textarea
          autoFocus
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={"28\t116\t76.186\tSACO\n30\t20\t1.9046\tKG"}
          className="font-mono text-xs h-28 resize-none"
        />

        {isLoading && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Loader className="size-3 animate-spin" /> Cargando productos…
          </div>
        )}

        {parsed.length > 0 && (
          <>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
              <span>
                <b>{parsed.length}</b> filas leídas
              </span>
              <span className="text-emerald-700">
                <b>{valid.length}</b> válidas
              </span>
              {invalid > 0 && (
                <span className="text-red-600">
                  <b>{invalid}</b> con error (no se agregarán)
                </span>
              )}
              <span className="ml-auto">
                Subtotal <b>S/. {formatNumber(sum("subtotal"))}</b> · IGV{" "}
                <b>S/. {formatNumber(sum("tax"))}</b> · Total{" "}
                <b className="text-emerald-700">
                  S/. {formatNumber(sum("total"))}
                </b>
              </span>
            </div>

            <div className="border rounded-md overflow-auto flex-1 min-h-0">
              <table className="w-full text-xs">
                <thead className="sticky top-0 bg-[var(--table-header)]">
                  <tr className="text-left uppercase">
                    <th className="px-2 py-1 w-8 text-center font-normal text-muted-foreground">#</th>
                    <th className="px-2 py-1">Código</th>
                    <th className="px-2 py-1">Descripción</th>
                    <th className="px-2 py-1">Modo</th>
                    <th className="px-2 py-1 text-right">Cantidad</th>
                    <th className="px-2 py-1 text-right">Precio</th>
                    <th className="px-2 py-1 text-right">Subtotal</th>
                    <th className="px-2 py-1 text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {parsed.map((r, i) => (
                    <tr
                      key={r.line}
                      className={cn(
                        "border-t",
                        r.error && "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300",
                      )}
                    >
                      <td className="px-2 py-1 text-center text-[10px] text-muted-foreground tabular-nums">
                        {i + 1}
                      </td>
                      <td className="px-2 py-1">{r.code || "-"}</td>
                      <td className="px-2 py-1">
                        {r.error ? <b>{r.error}</b> : r.product?.name}
                      </td>
                      <td className="px-2 py-1">{r.is_by_sack ? "SACO" : "KG"}</td>
                      <td className="px-2 py-1 text-right tabular-nums">
                        {isNaN(r.quantity) ? "-" : r.quantity}
                      </td>
                      <td className="px-2 py-1 text-right tabular-nums">
                        {isNaN(r.unit_price) ? "-" : r.unit_price}
                      </td>
                      <td className="px-2 py-1 text-right tabular-nums">
                        {r.error ? "-" : formatNumber(r.subtotal)}
                      </td>
                      <td className="px-2 py-1 text-right tabular-nums font-semibold">
                        {r.error ? "-" : formatNumber(r.total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handleOpenChange(false)}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            size="sm"
            disabled={valid.length === 0}
            onClick={handleConfirm}
          >
            <ClipboardPaste />
            Agregar {valid.length} fila{valid.length === 1 ? "" : "s"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
