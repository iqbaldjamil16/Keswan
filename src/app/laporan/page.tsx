
'use client';

import { ServiceTable } from "@/components/service-table";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function ReportPage() {

  return (
    <div className="container px-4 sm:px-8 py-4 md:py-8 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Laporan Pelayanan</CardTitle>
          <CardDescription>Cari dan lihat semua data pelayanan yang telah diinput.</CardDescription>
        </CardHeader>
      </Card>
      
      <ServiceTable />

    </div>
  );
}
