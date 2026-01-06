
'use client';

import { useState } from "react";
import * as XLSX from 'xlsx';
import { getYear, getMonth, format } from "date-fns";
import { id } from 'date-fns/locale';

import { ServiceTable } from "@/components/service-table";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CornerUpLeft, Download } from "lucide-react";
import Link from "next/link";
import { type HealthcareService } from "@/lib/types";
import { PasswordDialog } from "@/components/password-dialog";
import { puskeswanList } from "@/lib/definitions";

const years = Array.from({ length: 5 }, (_, i) =>
  getYear(subYears(new Date(), i)).toString()
);
const months = Array.from({ length: 12 }, (_, i) => ({
  value: i.toString(),
  label: new Date(0, i).toLocaleString(id, { month: 'long' }),
}));


export default function ReportPage() {
  const [filteredServices, setFilteredServices] = useState<HealthcareService[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<string>('');

  const handleDownload = () => {
    const wb = XLSX.utils.book_new();

    puskeswanList.forEach((puskeswan) => {
      const servicesByPuskeswan = filteredServices.filter(
        (s) => s.puskeswan === puskeswan
      );

      if (servicesByPuskeswan.length === 0) return;

      const sortedServices = servicesByPuskeswan.sort((a, b) => {
        const nameA = a.officerName.toLowerCase();
        const nameB = b.officerName.toLowerCase();
        if (nameA < nameB) return -1;
        if (nameA > nameB) return 1;
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      });

      const dataForSheet = sortedServices.map((service) => ({
        Tanggal: format(new Date(service.date), 'dd-MM-yyyy'),
        'Nama Petugas': service.officerName,
        'Nama Pemilik': service.ownerName,
        'Alamat Pemilik': service.ownerAddress,
        'Jenis Ternak': service.livestockType,
        'Gejala Klinis': service.clinicalSymptoms,
        Diagnosa: service.diagnosis,
        'Jenis Penanganan': service.treatmentType,
        'Obat yang Digunakan': service.treatments
          .map((t) => `${t.medicineName} (${t.dosageValue} ${t.dosageUnit})`)
          .join(', '),
        'Jumlah Ternak': service.livestockCount,
      }));

      const sheetName = puskeswan
        .replace('Puskeswan ', '')
        .replace(/[/\\?*:[\]]/g, ''); // Sanitize sheet name
      const ws = XLSX.utils.json_to_sheet(dataForSheet);
      XLSX.utils.book_append_sheet(wb, ws, sheetName.substring(0, 31));
    });

    const monthLabel =
      selectedMonth === 'all-months'
        ? 'SemuaBulan'
        : months.find((m) => m.value === selectedMonth)?.label || 'SemuaBulan';
    const yearLabel =
      selectedYear === 'all-years'
        ? 'SemuaTahun'
        : selectedYear === ''
        ? getYear(new Date()).toString()
        : selectedYear;

    XLSX.writeFile(wb, `laporan_pelayanan_${monthLabel}_${yearLabel}.xlsx`);
  };

  return (
    <div className="container px-4 sm:px-8 py-4 md:py-8 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Data Laporan Pelayanan</CardTitle>
          <CardDescription>Cari dan lihat semua data pelayanan yang telah diinput.</CardDescription>
        </CardHeader>
         <CardFooter className="p-4 md:p-6 flex justify-end">
            <PasswordDialog
              title="Akses Terbatas"
              description="Silakan masukkan kata sandi untuk mengunduh laporan."
              onSuccess={handleDownload}
              trigger={
                <Button 
                  disabled={filteredServices.length === 0}
                >
                  <Download className="mr-2 h-5 w-5" />
                  Unduh Laporan
                </Button>
              }
            />
        </CardFooter>
      </Card>
      
      <ServiceTable 
        onServicesFiltered={setFilteredServices}
        onMonthChange={setSelectedMonth}
        onYearChange={setSelectedYear}
      />

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
