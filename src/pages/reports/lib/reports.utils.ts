import type {
  CustomerAccountStatementResponse,
  CustomerAccountStatementTableItem,
  Zone,
  Vendor,
  Customer,
  Sale,
} from "./reports.interface";

/**
 * Transforma la respuesta jerárquica del backend a un formato plano
 * que puede ser usado por la tabla con agrupación expandible
 */
export function transformCustomerAccountStatementData(
  response: CustomerAccountStatementResponse
): CustomerAccountStatementTableItem[] {
  const flatData: CustomerAccountStatementTableItem[] = [];

  response.data.forEach((zone) => {
    // Agregar zona
    const zoneId = `zone-${zone.zone_id}`;
    flatData.push({
      id: zoneId,
      type: "zone",
      level: 0,
      zone_id: zone.zone_id,
      zone_name: zone.zone_name,
      total_debt: zone.total_debt,
      hasChildren: zone.vendors.length > 0,
    });

    zone.vendors.forEach((vendor) => {
      // Agregar vendedor
      const vendorId = `vendor-${zone.zone_id}-${vendor.vendedor_id}`;
      flatData.push({
        id: vendorId,
        type: "vendor",
        level: 1,
        zone_id: zone.zone_id,
        zone_name: zone.zone_name,
        vendedor_id: vendor.vendedor_id,
        vendedor_name: vendor.vendedor_name,
        total_debt: vendor.total_debt,
        parentId: zoneId,
        hasChildren: vendor.customers.length > 0,
      });

      vendor.customers.forEach((customer) => {
        // Agregar cliente
        const customerId = `customer-${zone.zone_id}-${vendor.vendedor_id}-${customer.customer_id}`;
        flatData.push({
          id: customerId,
          type: "customer",
          level: 2,
          zone_id: zone.zone_id,
          zone_name: zone.zone_name,
          vendedor_id: vendor.vendedor_id,
          vendedor_name: vendor.vendedor_name,
          customer_id: customer.customer_id,
          customer_name: customer.customer_name,
          customer_zone: customer.customer_zone,
          total_debt: customer.total_debt,
          parentId: vendorId,
          hasChildren: customer.sales.length > 0,
        });

        customer.sales.forEach((sale) => {
          // Agregar venta
          const saleId = `sale-${zone.zone_id}-${vendor.vendedor_id}-${customer.customer_id}-${sale.id}`;
          flatData.push({
            id: saleId,
            type: "sale",
            level: 3,
            zone_id: zone.zone_id,
            zone_name: zone.zone_name,
            vendedor_id: vendor.vendedor_id,
            vendedor_name: vendor.vendedor_name,
            customer_id: customer.customer_id,
            customer_name: customer.customer_name,
            customer_zone: customer.customer_zone,
            sale_id: sale.id,
            date: sale.date,
            document_number: sale.document_number,
            document_type: sale.document_type,
            payment_type: sale.payment_type,
            total_amount: sale.total_amount,
            paid_amount: sale.paid_amount,
            debt_amount: sale.debt_amount,
            days_overdue: sale.days_overdue,
            reference: sale.reference,
            total_debt: sale.debt_amount,
            parentId: customerId,
            hasChildren: false,
          });
        });
      });
    });
  });

  return flatData;
}

/**
 * Calcula las métricas totales de la respuesta
 */
export function calculateAccountStatementMetrics(
  response: CustomerAccountStatementResponse
) {
  let totalCustomers = 0;
  let totalDebt = 0;
  let totalPaid = 0;
  let totalPending = 0;

  response.data.forEach((zone) => {
    zone.vendors.forEach((vendor) => {
      vendor.customers.forEach((customer) => {
        totalCustomers++;
        customer.sales.forEach((sale) => {
          totalDebt += sale.total_amount;
          totalPaid += sale.paid_amount;
          totalPending += sale.debt_amount;
        });
      });
    });
  });

  return {
    total: totalCustomers,
    total_debt: totalDebt,
    total_pending: totalPending,
    total_paid: totalPaid,
  };
}
