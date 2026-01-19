'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import * as XLSX from 'xlsx';
import { getYear, getMonth, format, subYears } from "date-fns";
import { id } from 'date-fns/locale';

import { ServiceTable } from "@/components/service-table";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CornerUpLeft, Download, LayoutGrid, BarChart2 } from "lucide-react";
import { type HealthcareService } from "@/lib/types";
import { PasswordDialog } from "@/components/password-dialog";
import { puskeswanList } from "@/lib/definitions";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface StatItem {
  name: string;
  count: number;
  percentage: number;
}

function calculateStats(services: HealthcareService[], groupBy: 'month' | 'officerName' | 'puskeswan'): StatItem[] {
  if (services.length === 0) return [];

  const total = services.length;
  const counts: { [key: string]: number } = {};

  services.forEach(service => {
      let key: string;
      if (groupBy === 'month') {
          key = format(new Date(service.date), 'MMMM yyyy', { locale: id });
      } else {
          key = service[groupBy as keyof HealthcareService] as string;
      }
      counts[key] = (counts[key] || 0) + 1;
  });

  return Object.entries(counts)
      .map(([name, count]) => ({
          name,
          count,
          percentage: (count / total) * 100,
      }))
      .sort((a, b) => b.count - a.count);
}

function StatisticsDisplay({ services }: { services: HealthcareService[] }) {
  if (services.length === 0) {
      return (
        <Card>
            <CardHeader>
                <CardTitle>Statistik Belum Tersedia</CardTitle>
                <CardDescription>
                    Tidak ada data untuk ditampilkan statistiknya pada periode yang dipilih.
                </CardDescription>
            </CardHeader>
        </Card>
      );
  }

  const statsByMonth = calculateStats(services, 'month');
  const statsByOfficer = calculateStats(services, 'officerName');
  const statsByPuskeswan = calculateStats(services, 'puskeswan');

  const StatCard = ({ title, data }: { title: string; data: StatItem[] }) => (
      <Card>
          <CardHeader>
              <CardTitle className="text-lg">{title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm max-h-60 overflow-y-auto">
              {data.map(item => (
                  <div key={item.name}>
                      <div className="flex justify-between mb-1">
                          <span className="font-medium truncate pr-2" title={item.name}>{item.name}</span>
                          <span className="text-muted-foreground whitespace-nowrap">{item.count} ({item.percentage.toFixed(1)}%)</span>
                      </div>
                      <Progress value={item.percentage} className="h-2" />
                  </div>
              ))}
          </CardContent>
      </Card>
  );

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <StatCard title="Per Bulan" data={statsByMonth} />
        <StatCard title="Per Petugas" data={statsByOfficer} />
        <StatCard title="Per Puskeswan" data={statsByPuskeswan} />
    </div>
  );
}


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
      const headers = ['Tanggal', 'Nama Pemilik', 'Alamat Pemilik', 'Gejala Klinis', 'Diagnosa', 'Jenis Penanganan', 'Obat yang Digunakan', 'Dosis', 'Jenis Ternak', 'Jumlah Ternak'];
      
      const officerNames = Object.keys(servicesByOfficer).sort();

      officerNames.forEach(officerName => {
        allDataForSheet.push({ 'Nama Petugas': officerName }); 
        allDataForSheet.push(Object.fromEntries(headers.map(h => [h, h])));

        const officerServices = servicesByOfficer[officerName];
        const data = officerServices.map((service) => ({
            'Tanggal': format(new Date(service.date), 'dd-MM-yyyy'),
            'Nama Pemilik': service.ownerName,
            'Alamat Pemilik': service.ownerAddress,
            'Gejala Klinis': service.clinicalSymptoms,
            'Diagnosa': service.diagnosis,
            'Jenis Penanganan': service.treatmentType,
            'Obat yang Digunakan': service.treatments.map((t) => t.medicineName).join(', '),
            'Dosis': service.treatments.map((t) => `${t.dosageValue} ${t.dosageUnit}`).join(', '),
            'Jenis Ternak': service.livestockType,
            'Jumlah Ternak': service.livestockCount,
        }));
        allDataForSheet.push(...data);
        allDataForSheet.push({});
        allDataForSheet.push({});
      });

      const sheetName = puskeswan
        .replace('Puskeswan ', '')
        .replace(/[/\\?*:[\]]/g, ''); 

      const ws = XLSX.utils.json_to_sheet(allDataForSheet, { skipHeader: true });

      const columnWidths = headers.map((header) => {
        const allValues = allDataForSheet.map(row => row[header]).filter(Boolean);
        const maxLength = allValues.reduce((max, cellValue) => {
          const cellLength = cellValue ? String(cellValue).length : 0;
          return Math.max(max, cellLength);
        }, header.length);
        return { wch: maxLength + 2 }; 
      });
      ws['!cols'] = columnWidths;
      
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex-1">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight font-headline">Laporan Pelayanan</h1>
          <p className="text-muted-foreground mt-1 text-sm md:text-base">
            Cari, lihat, dan unduh semua data pelayanan yang telah diinput.
          </p>
        </div>
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
      </div>

      <Tabs defaultValue="tabel" className="w-full">
        <TabsList>
          <TabsTrigger value="tabel">
            <LayoutGrid className="mr-2 h-4 w-4" />
            Tabel
          </TabsTrigger>
          <TabsTrigger value="statistik">
            <BarChart2 className="mr-2 h-4 w-4" />
            Statistik
          </TabsTrigger>
        </TabsList>
        <TabsContent value="tabel" className="mt-4">
          <ServiceTable 
            onServicesFiltered={setFilteredServices}
            onMonthChange={setSelectedMonth}
            onYearChange={setSelectedYear}
          />
        </TabsContent>
        <TabsContent value="statistik" className="mt-4">
           <StatisticsDisplay services={filteredServices} />
        </TabsContent>
      </Tabs>
      
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