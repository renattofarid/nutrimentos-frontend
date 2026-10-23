// Prueba sin backend: mockea sale.actions y verifica el request que se enviaría.
// Uso: node scripts/test-sale-description.mjs
import { build } from "esbuild";
import path from "node:path";
import { pathToFileURL } from "node:url";
import assert from "node:assert/strict";
import os from "node:os";
import fs from "node:fs";

const root = path.resolve(import.meta.dirname, "..");
const outFile = path.join(fs.mkdtempSync(path.join(os.tmpdir(), "sale-test-")), "bundle.mjs");

const entry = `
  export { useSaleStore } from "${path.join(root, "src/pages/sale/lib/sales.store.ts").replace(/\\/g, "/")}";
  export { buildSaleDetailsPayload } from "${path.join(root, "src/pages/sale/lib/sale-details.payload.ts").replace(/\\/g, "/")}";
  export * as mock from "mock:sale.actions";
`;

await build({
  stdin: { contents: entry, resolveDir: root, loader: "ts" },
  bundle: true,
  format: "esm",
  platform: "node",
  outfile: outFile,
  logLevel: "error",
  alias: { "@": path.join(root, "src") },
  plugins: [
    {
      name: "mocks",
      setup(b) {
        b.onResolve({ filter: /sale\.actions$/ }, () => ({ path: "sale.actions", namespace: "mock" }));
        b.onResolve({ filter: /^mock:sale\.actions$/ }, () => ({ path: "sale.actions", namespace: "mock" }));
        b.onResolve({ filter: /core\.function$/ }, () => ({ path: "core.function", namespace: "mock" }));
        b.onLoad({ filter: /.*/, namespace: "mock" }, (args) => ({
          loader: "js",
          contents:
            args.path === "sale.actions"
              ? `export const calls = [];
                 export const storeSale = async (r) => { calls.push({ fn: "storeSale", r }); return { data: { id: 1 } }; };
                 export const updateSale = async (id, r) => { calls.push({ fn: "updateSale", r }); };
                 export const getSales = async () => ({}); export const getAllSales = async () => ({});
                 export const findSaleById = async () => ({}); export const deleteSale = async () => ({});`
              : `export const ERROR_MESSAGE = () => "error"; export const errorToast = () => {};`,
        }));
      },
    },
  ],
});

const { useSaleStore, buildSaleDetailsPayload, mock } = await import(pathToFileURL(outFile).href);

// Filas como las deja la grid: una normal y una con código 999
const gridRows = [
  { product_id: "10", product_code: "ABC", product_name: "Alimento Normal", quantity_sacks: "2", quantity_kg: "", unit_price: "50" },
  { product_id: "99", product_code: "999", product_name: "Producto libre escrito", quantity_sacks: "1", quantity_kg: "5", unit_price: "20" },
];

const details = buildSaleDetailsPayload(gridRows);
const base = {
  branch_id: "1", customer_id: "2", warehouse_id: "3", vendedor_id: "4", person_zone_id: "5",
  document_type: "boleta", issue_date: "2026-10-23", payment_type: "contado",
  discount_global: "0", total_weight: 0, currency: "PEN", observations: "", details, installments: [],
};

await useSaleStore.getState().createSale(base);
await useSaleStore.getState().updateSale(1, base);

for (const call of mock.calls) {
  const [normal, libre] = call.r.details;
  console.log(`${call.fn} details ->`, JSON.stringify(call.r.details));
  assert.equal("description" in normal, false, `${call.fn}: producto normal NO debe enviar description`);
  assert.equal(libre.description, "Producto libre escrito", `${call.fn}: código 999 debe enviar description`);
  assert.equal(libre.product_id, 99);
}
assert.equal(mock.calls.length, 2);
console.log("OK: description se envía solo para el código 999 (create y update)");
