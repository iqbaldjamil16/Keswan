
'use client';

import { useEffect, useState, useMemo, useCallback, useTransition } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
  } from "@/components/ui/accordion";
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
import { Download } from "lucide-react";
import * as XLSX from 'xlsx';
import { cn } from "@/lib/utils";
import { collection, query, where, getDocs, orderBy, Timestamp } from 'firebase/firestore';
import { useFirebase } from "@/firebase";

interface RecapData {
    [puskeswan: string]: {
        medicines: { [medicineName: string]: { count: number, unit: string } };
        diagnoses: { [diagnosis: string]: number };
    };
}

function processRecapData(services: HealthcareService[]): RecapData {
    const recap: RecapData = {};

    services.forEach(service => {
        if (!service.puskeswan) return;
        if (!recap[service.puskeswan]) {
            recap[service.puskeswan] = { medicines: {}, diagnoses: {} };
        }

        const diagnosis = service.diagnosis.trim();
        recap[service.puskeswan].diagnoses[diagnosis] = (recap[service.puskeswan].diagnoses[diagnosis] || 0) + 1;

        service.treatments.forEach(treatment => {
            const medicineName = treatment.medicineName.trim();
            const dosageValue = parseFloat(treatment.dosage.replace(',', '.')) || 0;
            const dosageUnit = treatment.dosage.replace(/[\d\s.,]/g, '') || 'unit';

            if (!recap[service.puskeswan].medicines[medicineName]) {
                recap[service.puskeswan].medicines[medicineName] = { count: 0, unit: dosageUnit };
            }
            
            recap[service.puskeswan].medicines[medicineName].count += dosageValue;
            if (!recap[service.puskeswan].medicines[medicineName].unit) {
                 recap[service.puskeswan].medicines[medicineName].unit = dosageUnit;
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


export default function RekapPage() {
    const [services, setServices] = useState<HealthcareService[]>([]);
    const [loading, setLoading] = useState(true);
    const [isPending, startTransition] = useTransition();
    const [selectedMonth, setSelectedMonth] = useState(getMonth(new Date()).toString());
    const [selectedYear, setSelectedYear] = useState(getYear(new Date()).toString());
    const { firestore } = useFirebase();

    const loadServices = useCallback(async (yearStr: string, monthStr: string) => {
        if (!firestore) return;
        const year = parseInt(yearStr, 10);
        const month = parseInt(monthStr, 10);
        try {
          const startDate = startOfMonth(new Date(year, month));
          const endDate = endOfMonth(new Date(year, month));
          const servicesCollection = collection(firestore, 'healthcareServices');
          const q = query(
              servicesCollection, 
              where('date', '>=', startDate),
              where('date', '<=', endDate),
          );

          const querySnapshot = await getDocs(q);
          const fetchedServices: HealthcareService[] = [];
          querySnapshot.forEach((doc) => {
              const data = doc.data();
              try {
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
            if (loading) {
                setLoading(false);
            }
        }
      }, [firestore, loading]);
    
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
    };

    const recapData = useMemo(() => processRecapData(services), [services]);
    const puskeswanList = Object.keys(recapData).sort();
    
    const formatDosage = (count: number) => {
        return Number(count.toFixed(2)).toLocaleString("id-ID");
    };

    const handleDownload = () => {
        const wb = XLSX.utils.book_new();

        const medicineDataForSheet = puskeswanList.flatMap(puskeswan => {
            const data = recapData[puskeswan];
            return Object.entries(data.medicines).map(([medicineName, { count, unit }]) => ({
                'Puskeswan': puskeswan,
                'Nama Obat': medicineName,
                'Total Dosis': `${formatDosage(count)} ${unit}`,
            }));
        });
        const wsMedicines = XLSX.utils.json_to_sheet(medicineDataForSheet);
        XLSX.utils.book_append_sheet(wb, wsMedicines, "Rekap Obat");

        const diagnosisDataForSheet = puskeswanList.flatMap(puskeswan => {
            const data = recapData[puskeswan];
            return Object.entries(data.diagnoses).map(([diagnosis, count]) => ({
                'Puskeswan': puskeswan,
                'Diagnosa': diagnosis,
                'Jumlah Kasus': count,
            }));
        });
        const wsDiagnoses = XLSX.utils.json_to_sheet(diagnosisDataForSheet);
        XLSX.utils.book_append_sheet(wb, wsDiagnoses, "Rekap Kasus");
        
        const monthLabel = months.find(m => m.value === selectedMonth)?.label || '';
        XLSX.writeFile(wb, `rekap_obat_kasus_${monthLabel}_${selectedYear}.xlsx`);
    };

  return (
    <div className="container py-4 md:py-8">
       <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight font-headline">Rekap Obat dan Kasus</h1>
        <p className="text-muted-foreground mt-2 text-sm md:text-base">
          Ringkasan penggunaan obat dan kasus yang ditangani per Puskeswan.
        </p>

        <div className="mt-6 md:mt-8">
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <Select value={selectedMonth} onValueChange={handleMonthChange}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                        <SelectValue placeholder="Pilih Bulan" />
                    </SelectTrigger>
                    <SelectContent>
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
                        {years.map(year => (
                        <SelectItem key={year} value={year}>{year}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            {(loading && services.length === 0) ? (
              <RecapSkeleton />
            ) : puskeswanList.length > 0 ? (
                 <Accordion type="multiple" className={cn("w-full space-y-4 transition-opacity duration-300", isPending && "opacity-50")}>
                    {puskeswanList.map(puskeswan => {
                        const data = recapData[puskeswan];
                        const sortedDiagnoses = Object.entries(data.diagnoses).sort(([, a], [, b]) => b - a);
                        const sortedMedicines = Object.entries(data.medicines).sort(([, a], [, b]) => b.count - a.count);

                        return (
                            <AccordionItem value={puskeswan} key={puskeswan} className="border rounded-lg bg-card">
                                <AccordionTrigger className="px-6 py-4 text-lg font-bold hover:no-underline">
                                    {puskeswan}
                                </AccordionTrigger>
                                <AccordionContent className="px-6 pb-6">
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                        <div>
                                            <h3 className="font-semibold mb-2">Rekap Kasus/Diagnosa</h3>
                                            <div className="rounded-md border">
                                                <Table>
                                                    <TableHeader>
                                                        <TableRow>
                                                            <TableHead>Diagnosa</TableHead>
                                                            <TableHead className="text-right w-[80px]">Jumlah</TableHead>
                                                        </TableRow>
                                                    </TableHeader>
                                                    <TableBody>
                                                        {sortedDiagnoses.map(([diagnosis, count]) => (
                                                            <TableRow key={diagnosis}>
                                                                <TableCell>{diagnosis}</TableCell>
                                                                <TableCell className="text-right font-medium">{count}</TableCell>
                                                            </TableRow>
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                            </div>
                                        </div>
                                        <div>
                                            <h3 className="font-semibold mb-2">Rekap Penggunaan Obat</h3>
                                             <div className="rounded-md border">
                                                <Table>
                                                    <TableHeader>
                                                        <TableRow>
                                                            <TableHead>Nama Obat</TableHead>
                                                            <TableHead className="text-right w-[120px]">Total Dosis</TableHead>
                                                        </TableRow>
                                                    </TableHeader>
                                                    <TableBody>
                                                        {sortedMedicines.map(([medicine, {count, unit}]) => (
                                                             <TableRow key={medicine}>
                                                                <TableCell>{medicine}</TableCell>
                                                                <TableCell className="text-right font-medium">{`${formatDosage(count)} ${unit}`}</TableCell>
                                                            </TableRow>
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                            </div>
                                        </div>
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                        )
                    })}
                 </Accordion>
            ) : (
                <Card>
                    <CardHeader>
                        <CardTitle>Data Kosong</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p>Belum ada data pelayanan pada periode yang dipilih untuk ditampilkan rekapitulasinya.</p>
                    </CardContent>
                </Card>
            )}
             <div className="flex justify-start md:justify-end mt-8">
                <Button onClick={handleDownload} disabled={loading || puskeswanList.length === 0 || isPending}>
                    <Download className="mr-2 h-4 w-4" />
                    Unduh Rekap
                </Button>
            </div>
        </div>
      </div>
    </div>
  );
}
