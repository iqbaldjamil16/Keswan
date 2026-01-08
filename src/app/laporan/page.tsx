
'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import * as XLSX from 'xlsx';
import { getYear, getMonth, format, subYears } from "date-fns";
import { id } from 'date-fns/locale';

import { ServiceTable } from "@/components/service-table";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CornerUpLeft, Download } from "lucide-react";
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
  const router = useRouter();

  const handleDownload = () => {
    const wb = XLSX.utils.book_new();
  
    puskeswanList.forEach((puskeswan) => {
      const servicesByPuskeswan = filteredServices.filter(
        (s) => s.puskeswan === puskeswan
      );
  
      if (servicesByPuskeswan.length === 0) return;
  
      const sortedServices = servicesByPuskeswan.sort((a, b) => {
        const officerComparison = a.officerName.localeCompare(b.officerName);
        if (officerComparison !== 0) {
          return officerComparison;
        }
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      });
  
      // Group services by officer
      const servicesByOfficer: { [key: string]: HealthcareService[] } = {};
      sortedServices.forEach(service => {
        if (!servicesByOfficer[service.officerName]) {
          servicesByOfficer[service.officerName] = [];
        }
        servicesByOfficer[service.officerName].push(service);
      });
  
      const allDataForSheet: any[] = [];
      const headers = ['Tanggal', 'Nama Pemilik', 'Alamat Pemilik', 'Jenis Ternak', 'Jumlah Ternak', 'Gejala Klinis', 'Diagnosa', 'Jenis Penanganan', 'Obat yang Digunakan', 'Dosis'];
      
      const officerNames = Object.keys(servicesByOfficer).sort();

      officerNames.forEach(officerName => {
        allDataForSheet.push({ 'Nama Petugas': officerName }); // Add officer name header
        allDataForSheet.push(Object.fromEntries(headers.map(h => [h, h]))); // Add column headers

        const officerServices = servicesByOfficer[officerName];
        const data = officerServices.map((service) => ({
            'Tanggal': format(new Date(service.date), 'dd-MM-yyyy'),
            'Nama Pemilik': service.ownerName,
            'Alamat Pemilik': service.ownerAddress,
            'Jenis Ternak': service.livestockType,
            'Jumlah Ternak': service.livestockCount,
            'Gejala Klinis': service.clinicalSymptoms,
            'Diagnosa': service.diagnosis,
            'Jenis Penanganan': service.treatmentType,
            'Obat yang Digunakan': service.treatments.map((t) => t.medicineName).join(', '),
            'Dosis': service.treatments.map((t) => `${t.dosageValue} ${t.dosageUnit}`).join(', '),
        }));
        allDataForSheet.push(...data);
        allDataForSheet.push({}); // Add a blank row for spacing
      });

      const sheetName = puskeswan
        .replace('Puskeswan ', '')
        .replace(/[/\\?*:[\]]/g, ''); // Sanitize sheet name

      // Create worksheet from the unified data array, but skip the auto-generated header
      const ws = XLSX.utils.json_to_sheet(allDataForSheet, { skipHeader: true });

      // Adjust column widths
      const colWidths = [
        { wch: 12 }, // Tanggal
        { wch: 25 }, // Nama Pemilik
        { wch: 30 }, // Alamat Pemilik
        { wch: 15 }, // Jenis Ternak
        { wch: 10 }, // Jumlah Ternak
        { wch: 30 }, // Gejala Klinis
        { wch: 30 }, // Diagnosa
        { wch: 20 }, // Jenis Penanganan
        { wch: 30 }, // Obat
        { wch: 20 }, // Dosis
      ];
      ws['!cols'] = colWidths;
      
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
         <CardFooter className="p-4 flex justify-end">
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

      <Button
          variant="default"
          className="fixed bottom-6 left-6 h-14 w-14 rounded-full shadow-lg"
          aria-label="Kembali ke halaman utama"
          onClick={() => router.back()}
        >
          <CornerUpLeft className="h-7 w-7" />
        </Button>
    </div>
  );
}
