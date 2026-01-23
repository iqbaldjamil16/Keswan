'use client';

import { useEffect, useState, useMemo, useCallback, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { type HealthcareService, serviceSchema } from "@/lib/types";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from "@/components/ui/select";
import { getMonth, getYear, subYears, format, startOfMonth, endOfMonth } from "date-fns";
import { id } from 'date-fns/locale';
import { Button } from "@/components/ui/button";
import { Download, CornerUpLeft } from "lucide-react";
import * as XLSX from 'xlsx';
import { cn } from "@/lib/utils";
import { collection, query, where, getDocs, orderBy, Timestamp } from 'firebase/firestore';
import { useFirebase } from "@/firebase";
import { PasswordDialog } from "@/components/password-dialog";

interface RecapData {
    medicines: { [medicineName: string]: { count: number, unit: string } };
    cases: { 
        [desa: string]: {
            [livestockType: string]: {
                [diagnosis: string]: number 
            }
        }
    };
}

// Simplified for single puskeswan
function processRecapData(services: HealthcareService[]): RecapData {
    const recap: RecapData = { medicines: {}, cases: {} };

    services.forEach(service => {
        const desa = service.ownerAddress.trim() || 'Tidak Diketahui';
        const livestockType = service.livestockType.trim();
        const diagnosis = service.diagnosis.trim();

        if (!recap.cases[desa]) {
            recap.cases[desa] = {};
        }
        if (!recap.cases[desa][livestockType]) {
            recap.cases[desa][livestockType] = {};
        }
        
        recap.cases[desa][livestockType][diagnosis] = (recap.cases[desa][livestockType][diagnosis] || 0) + service.livestockCount;

        service.treatments.forEach(treatment => {
            const medicineName = treatment.medicineName.trim();
            const dosageValue = treatment.dosageValue || 0;
            const dosageUnit = treatment.dosageUnit || 'unit';

            if (!recap.medicines[medicineName]) {
                recap.medicines[medicineName] = { count: 0, unit: dosageUnit };
            }
            
            recap.medicines[medicineName].count += dosageValue;
            if (recap.medicines[medicineName].unit === 'unit' && dosageUnit !== 'unit') {
                 recap.medicines[medicineName].unit = dosageUnit;
            }
        });
    });

    return recap;
}

function RecapSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-16 w-full mt-6" />
      <Skeleton className="h-16 w-full" />
      <Skeleton className="h-16 w-full" />
    </div>
  );
}

const years = Array.from({ length: 5 }, (_, i) => getYear(subYears(new Date(), i)).toString());
const months = Array.from({ length: 12 }, (_, i) => ({
    value: i.toString(),
    label: new Date(0, i).toLocaleString(id, { month: 'long' }),
}));


export default function RekapTopoyoPage() {
    const [services, setServices] = useState<HealthcareService[]>([]);
    const [loading, setLoading] = useState(true);
    const [isPending, startTransition] = useTransition();
    const [selectedMonth, setSelectedMonth] = useState<string>(getMonth(new Date()).toString());
    const [selectedYear, setSelectedYear] = useState<string>(getYear(new Date()).toString());
    const { firestore } = useFirebase();
    const router = useRouter();

    const loadServices = useCallback(async (yearStr: string, monthStr: string) => {
        if (!firestore) return;
        setLoading(true);
        
        const year = yearStr === 'all-years' ? null : parseInt(yearStr, 10);
        const month = monthStr === 'all-months' || monthStr === '' ? null : parseInt(monthStr, 10);

        const servicesCollection = collection(firestore, 'healthcareServices');
        const queryConstraints: any[] = [
            where('puskeswan', '==', 'Puskeswan Topoyo'),
            orderBy('date', 'desc')
        ];

        if (year !== null && month !== null) {
            const startDate = startOfMonth(new Date(year, month));
            const endDate = endOfMonth(new Date(year, month));
            queryConstraints.push(where('date', '>=', startDate));
            queryConstraints.push(where('date', '<=', endDate));
        } else if (year !== null) {
            const startDate = new Date(year, 0, 1);
            const endDate = new Date(year, 11, 31, 23, 59, 59);
            queryConstraints.push(where('date', '>=', startDate));
            queryConstraints.push(where('date', '<=', endDate));
        }

        const q = query(servicesCollection, ...queryConstraints);

        try {
          const querySnapshot = await getDocs(q);
          const fetchedServices: HealthcareService[] = [];
          querySnapshot.forEach((doc) => {
              const data = doc.data();
              try {
                  if (!data.caseDevelopments || data.caseDevelopments.length === 0) {
                    let status = 'Sembuh';
                    if (data.caseDevelopment && typeof data.caseDevelopment === 'string' && data.caseDevelopment.length > 0) {
                      status = data.caseDevelopment;
                    }
                    data.caseDevelopments = [{
                      status: status,
                      count: data.livestockCount || 1,
                    }];
                  }
                  const service = serviceSchema.parse({
                      ...data,
                      id: doc.id,
                      date: (data.date as Timestamp).toDate(),
                  });
                  fetchedServices.push(service);
              } catch (e) {
                  console.error("Validation error parsing service data:", e);
              }
          });
          setServices(fetchedServices);
        } catch (error) {
          console.error("Failed to fetch services:", error);
          setServices([]);
        } finally {
            setLoading(false);
        }
      }, [firestore]);
    
      useEffect(() => {
        startTransition(() => {
            loadServices(selectedYear, selectedMonth);
        });
      }, [loadServices, selectedYear, selectedMonth]);

    const handleMonthChange = (month: string) => {
        setSelectedMonth(month);
    };

    const handleYearChange = (year: string) => {
        setSelectedYear(year);
         if (year === 'all-years') {
            setSelectedMonth('all-months');
        } else if (year !== getYear(new Date()).toString() && selectedMonth === getMonth(new Date()).toString()){
            setSelectedMonth('all-months');
        }
    };

    const recapData = useMemo(() => processRecapData(services), [services]);
    
    const formatDosage = (count: number) => {
        return Number(count.toFixed(2)).toLocaleString("id-ID");
    };

    const handleDownload = () => {
        const wb = XLSX.utils.book_new();
    
        const monthLabel = selectedMonth === 'all-months' 
            ? 'Semua Bulan' 
            : months.find(m => m.value === selectedMonth)?.label || '';
    
        const data = recapData;
        if (data) {
            // Rekap Kasus
            const diagnosisHeader = [{ 'Rekap Kasus/Diagnosa': '' }];
            const diagnosisDataForSheet = Object.entries(data.cases).flatMap(([desa, livestockData]) => {
                return Object.entries(livestockData).flatMap(([livestockType, diagnoses]) => {
                    return Object.entries(diagnoses).map(([diagnosis, count]) => ({
                        'Bulan': monthLabel,
                        'Desa': desa,
                        'Jenis Hewan': livestockType,
                        'Diagnosa': diagnosis,
                        'Jumlah Kasus': count,
                    }));
                });
            }).sort((a, b) => {
                const desaComp = a['Desa'].localeCompare(b['Desa']);
                if (desaComp !== 0) return desaComp;
                const hewanComp = a['Jenis Hewan'].localeCompare(b['Jenis Hewan']);
                if (hewanComp !== 0) return hewanComp;
                return a['Diagnosa'].localeCompare(b['Diagnosa']);
            });

            // Rekap Obat
            const medicineHeader = [{ 'Rekap Obat': '' }];
            const medicineDataForSheet = Object.entries(data.medicines)
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([medicineName, { count, unit }]) => ({
                    'Bulan': monthLabel,
                    'Nama Obat': medicineName,
                    'Total Dosis': `${formatDosage(count)} ${unit}`,
            }));
            
            const ws = XLSX.utils.json_to_sheet(diagnosisHeader, { skipHeader: true });
            XLSX.utils.sheet_add_json(ws, diagnosisDataForSheet, { origin: 'A2' });
            XLSX.utils.sheet_add_json(ws, [{}, {}], { origin: -1, skipHeader: true });
            XLSX.utils.sheet_add_json(ws, medicineHeader, { origin: -1, skipHeader: true });
            XLSX.utils.sheet_add_json(ws, medicineDataForSheet, { origin: -1 });
            
            const sheetName = 'Topoyo'.replace(/[/\\?*:[\]]/g, "");
            XLSX.utils.book_append_sheet(wb, ws, sheetName.substring(0, 31));
        }
    
        const yearLabel = selectedYear === 'all-years' ? 'SemuaTahun' : selectedYear;
        const filenameMonthLabel = selectedMonth === 'all-months' ? 'SemuaBulan' : months.find(m => m.value === selectedMonth)?.label || 'Bulan';
        XLSX.writeFile(wb, `rekap_topoyo_${filenameMonthLabel}_${yearLabel}.xlsx`);
    };

    const hasData = recapData && (Object.keys(recapData.medicines).length > 0 || Object.keys(recapData.cases).length > 0);

  return (
    <div className="container px-4 sm:px-8 py-4 md:py-8">
       <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight font-headline">Rekap Puskeswan Topoyo</h1>
        <p className="text-muted-foreground mt-2 text-sm md:text-base">
          Ringkasan penggunaan obat dan kasus yang ditangani di Puskeswan Topoyo.
        </p>

        <div className="mt-6 md:mt-8">
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <Select value={selectedMonth} onValueChange={handleMonthChange}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                        <SelectValue placeholder="Pilih Bulan" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all-months">Semua Bulan</SelectItem>
                        {months.map(month => (
                        <SelectItem key={month.value} value={month.value}>{month.label}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Select value={selectedYear} onValueChange={handleYearChange}>
                    <SelectTrigger className="w-full sm:w-[120px]">
                        <SelectValue placeholder="Pilih Tahun" />
                    </SelectTrigger>
                    <SelectContent>
                         <SelectItem value="all-years">Semua Tahun</SelectItem>
                        {years.map(year => (
                        <SelectItem key={year} value={year}>{year}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            {(loading || isPending) && !hasData ? (
              <RecapSkeleton />
            ) : hasData ? (
                <Card className={cn("border rounded-lg bg-card", isPending && "opacity-50")}>
                    <CardHeader className="px-4 sm:px-6 py-4">
                        <CardTitle className="text-lg font-bold">Puskeswan Topoyo</CardTitle>
                    </CardHeader>
                    <CardContent className="px-4 sm:px-6 pb-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div className="overflow-x-auto">
                                <h3 className="font-semibold mb-2">Rekap Kasus/Diagnosa</h3>
                                <div className="rounded-md border">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Desa</TableHead>
                                                <TableHead>Jenis Hewan</TableHead>
                                                <TableHead>Diagnosa</TableHead>
                                                <TableHead className="text-right w-[80px]">Jumlah</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                        {Object.keys(recapData.cases).length > 0 ? Object.keys(recapData.cases).sort().map((desa) => 
                                            Object.entries(recapData.cases[desa]).flatMap(([livestockType, diagnoses], livestockIndex) => 
                                                Object.entries(diagnoses).map(([diagnosis, count], diagnosisIndex) => (
                                                    <TableRow key={`${desa}-${livestockType}-${diagnosis}`}>
                                                        {livestockIndex === 0 && diagnosisIndex === 0 && (
                                                            <TableCell rowSpan={Object.values(recapData.cases[desa]).reduce((total, d) => total + Object.keys(d).length, 0)} className="align-top font-medium">{desa}</TableCell>
                                                        )}
                                                        {diagnosisIndex === 0 && (
                                                            <TableCell rowSpan={Object.keys(diagnoses).length} className="align-top">{livestockType}</TableCell>
                                                        )}
                                                        <TableCell>{diagnosis}</TableCell>
                                                        <TableCell className="text-right font-medium">{count}</TableCell>
                                                    </TableRow>
                                                ))
                                            )
                                        ) : (
                                            <TableRow><TableCell colSpan={4} className="text-center">Tidak ada kasus</TableCell></TableRow>
                                        )}
                                        </TableBody>
                                    </Table>
                                </div>
                            </div>
                            <div className="overflow-x-auto">
                                <h3 className="font-semibold mb-2">Rekap Penggunaan Obat</h3>
                                 <div className="rounded-md border">
                                    <Table>
                                        <TableHeader>
                                            <TableRow><TableHead>Nama Obat</TableHead><TableHead className="text-right w-[120px]">Total Dosis</TableHead></TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {Object.keys(recapData.medicines).length > 0 ? Object.entries(recapData.medicines).sort(([, a], [, b]) => b.count - a.count).map(([medicine, {count, unit}]) => (
                                                 <TableRow key={medicine}><TableCell>{medicine}</TableCell><TableCell className="text-right font-medium">{`${formatDosage(count)} ${unit}`}</TableCell></TableRow>
                                            )) : (
                                                <TableRow><TableCell colSpan={2} className="text-center">Tidak ada penggunaan obat</TableCell></TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <Card>
                    <CardHeader><CardTitle>Data Kosong</CardTitle></CardHeader>
                    <CardContent><p>Tidak ada data untuk periode yang dipilih.</p></CardContent>
                </Card>
            )}
             <div className="flex justify-end mt-8">
                <PasswordDialog
                    title="Akses Terbatas"
                    description="Silakan masukkan kata sandi untuk mengunduh rekap."
                    onSuccess={handleDownload}
                    trigger={
                        <Button disabled={loading || !hasData || isPending}>
                            <Download className="mr-2 h-4 w-4" />
                            Unduh Rekap
                        </Button>
                    }
                />
            </div>
        </div>
      </div>
       <Button variant="default" className="fixed bottom-6 left-6 h-14 w-14 rounded-full shadow-lg" aria-label="Kembali ke halaman utama" onClick={() => router.push('/')}>
          <CornerUpLeft className="h-7 w-7" />
        </Button>
    </div>
  );
}
