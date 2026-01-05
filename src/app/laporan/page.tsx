
import { ServiceTable } from "@/components/service-table";
import { getServices } from "@/lib/data";

export default async function ReportPage() {
  const services = await getServices();

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold tracking-tight font-headline">Laporan Pelayanan</h1>
      <p className="text-muted-foreground mt-2">
        Cari dan lihat semua data pelayanan yang telah diinput.
      </p>
      <div className="mt-8">
        <ServiceTable services={services} />
      </div>
    </div>
  );
}
