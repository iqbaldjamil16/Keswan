
'use client';

import { ServiceTable } from "@/components/service-table";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CornerUpLeft } from "lucide-react";
import Link from "next/link";

export default function ReportPage() {

  return (
    <div className="container px-4 sm:px-8 py-4 md:py-8 space-y-6 pb-20">
      <Card>
        <CardHeader>
          <CardTitle>Data Laporan Pelayanan</CardTitle>
          <CardDescription>Cari dan lihat semua data pelayanan yang telah diinput.</CardDescription>
        </CardHeader>
      </Card>
      
      <ServiceTable />

      <Link href="/" passHref>
        <Button
          variant="default"
          className="fixed bottom-6 left-6 h-14 w-14 rounded-full shadow-lg"
          aria-label="Kembali ke halaman utama"
        >
          <CornerUpLeft className="h-7 w-7" />
        </Button>
      </Link>
    </div>
  );
}
