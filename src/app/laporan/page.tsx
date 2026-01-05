
'use client';

import { ServiceTable } from "@/components/service-table";

export default function ReportPage() {

  return (
    <div className="container px-4 sm:px-8 py-4 md:py-8">
      <h1 className="text-2xl md:text-3xl font-bold tracking-tight font-headline">Laporan Pelayanan</h1>
      <p className="text-muted-foreground mt-2 text-sm md:text-base">
        Cari dan lihat semua data pelayanan yang telah diinput.
      </p>
      <div className="mt-6 md:mt-8">
        <ServiceTable />
      </div>
    </div>
  );
}
