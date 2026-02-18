import PageWrapper from "@/components/PageWrapper";
import TitleComponent from "@/components/TitleComponent";
import { FileBarChart } from "lucide-react";
import { ReportCard } from "../reports/components/ReportCard";
import { REPORTS } from "../reports/lib/reports.constants";

export default function ReportsPage() {
  return (
    <PageWrapper>
      {/* Header */}
      <TitleComponent
        title="Reportes"
        subtitle="Visualiza y exporta reportes detallados."
        icon="FileBarChart"
      />

      {/* Lista de reportes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {REPORTS.map((report) => (
          <ReportCard key={report.id} report={report} />
        ))}
      </div>

      {/* Mensaje si no hay reportes */}
      {REPORTS.length === 0 && (
        <div className="text-center py-12">
          <FileBarChart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">
            No hay reportes disponibles
          </h3>
          <p className="text-muted-foreground">
            Los reportes se agregarán próximamente
          </p>
        </div>
      )}
    </PageWrapper>
  );
}
