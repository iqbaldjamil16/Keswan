
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
import { PasswordDialog } from "@/components/password-dialog";

interface RecapData {
    [puskeswan: string]: {
        medicines: { [medicineName: string]: { count: number, unit: string } };
        cases: { 
            [desa: string]: {
                [livestockType: string]: {
                    [diagnosis: string]: number 
                }
            }
        };
    };
}

function processRecapData(services: HealthcareService[]): RecapData {
    const recap: RecapData = {};

    services.forEach(service => {
        if (!service.puskeswan) return;
        if (!recap[service.puskeswan]) {
            recap[service.puskeswan] = { medicines: {}, cases: {} };
        }

        const desa = service.ownerAddress.trim() || 'Tidak Diketahui';
        const livestockType = service.livestockType.trim();
        const diagnosis = service.diagnosis.trim();

        if (!recap[service.puskeswan].cases[desa]) {
            recap[service.puskeswan].cases[desa] = {};
        }
        if (!recap[service.puskeswan].cases[desa][livestockType]) {
            recap[service.puskeswan].cases[desa][livestockType] = {};
        }
        
        recap[service.puskeswan].cases[desa][livestockType][diagnosis] = (recap[service.puskeswan].cases[desa][livestockType][diagnosis] || 0) + 1;
        

        service.treatments.forEach(treatment => {
            const medicineName = treatment.medicineName.trim();
            const dosageValue = treatment.dosageValue || 0;
            const dosageUnit = treatment.dosageUnit || 'unit';

            if (!recap[service.puskeswan].medicines[medicineName]) {
                recap[service.puskeswan].medicines[medicineName] = { count: 0, unit: dosageUnit };
            }
            
            recap[service.puskeswan].medicines[medicineName].count += dosageValue;
            if (recap[service.puskeswan].medicines[medicineName].unit === 'unit' && dosageUnit !== 'unit') {
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
    const [selectedMonth, setSelectedMonth] = useState<string>(getMonth(new Date()).toString());
    const [selectedYear, setSelectedYear] = useState<string>(getYear(new Date()).toString());
    const { firestore } = useFirebase();

    const loadServices = useCallback(async (yearStr: string, monthStr: string) => {
        if (!firestore) return;
        setServices([]);
        
        const year = yearStr === 'all-years' ? null : parseInt(yearStr, 10);
        const month = monthStr === 'all-months' ? null : parseInt(monthStr, 10);

        if (!year && !month) {
            if (loading) setLoading(false);
            setServices([]); // Clear services if no filter
            return;
        }

        let q;
        const servicesCollection = collection(firestore, 'healthcareServices');

        if (year !== null && month !== null) {
            const startDate = startOfMonth(new Date(year, month));
            const endDate = endOfMonth(new Date(year, month));
            q = query(
                servicesCollection, 
                where('date', '>=', startDate),
                where('date', '<=', endDate),
            );
        } else if (year !== null) {
            const startDate = new Date(year, 0, 1);
            const endDate = new Date(year, 11, 31, 23, 59, 59);
             q = query(
                servicesCollection, 
                where('date', '>=', startDate),
                where('date', '<=', endDate),
            );
        } else {
             q = query(servicesCollection);
        }

        try {
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
         if (year === 'all-years') {
            setSelectedMonth('all-months');
        }
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
            return Object.entries(data.cases).flatMap(([desa, livestockData]) => {
                return Object.entries(livestockData).flatMap(([livestockType, diagnoses]) => {
                    return Object.entries(diagnoses).map(([diagnosis, count]) => ({
                        'Puskeswan': puskeswan,
                        'Desa': desa,
                        'Jenis Hewan': livestockType,
                        'Diagnosa': diagnosis,
                        'Jumlah Kasus': count,
                    }));
                });
            });
        });

        const wsDiagnoses = XLSX.utils.json_to_sheet(diagnosisDataForSheet);
        XLSX.utils.book_append_sheet(wb, wsDiagnoses, "Rekap Kasus");
        
        const monthLabel = months.find(m => m.value === selectedMonth)?.label || '';
        XLSX.writeFile(wb, `rekap_obat_kasus_${monthLabel}_${selectedYear}.xlsx`);
    };

  return (
    <div className="container px-4 sm:px-8 py-4 md:py-8">
       <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight font-headline">Rekap Obat dan Kasus</h1>
        <p className="text-muted-foreground mt-2 text-sm md:text-base">
          Ringkasan penggunaan obat dan kasus yang ditangani per Puskeswan.
        </p>

        <div className="mt-6 md:mt-8">
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <Select value={selectedMonth} onValueChange={handleMonthChange} disabled={selectedYear === 'all-years'}>
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
            {(loading) ? (
              <RecapSkeleton />
            ) : puskeswanList.length > 0 ? (
                 <Accordion type="multiple" className={cn("w-full space-y-4 transition-opacity duration-300", isPending && "opacity-50")}>
                    {puskeswanList.map(puskeswan => {
                        const data = recapData[puskeswan];
                        const sortedMedicines = Object.entries(data.medicines).sort(([, a], [, b]) => b.count - a.count);
                        const sortedDesa = Object.keys(data.cases).sort();

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
                                                            <TableHead>Desa</TableHead>
                                                            <TableHead>Jenis Hewan</TableHead>
                                                            <TableHead>Diagnosa</TableHead>
                                                            <TableHead className="text-right w-[80px]">Jumlah</TableHead>
                                                        </TableRow>
                                                    </TableHeader>
                                                    <TableBody>
                                                    {sortedDesa.length > 0 ? sortedDesa.map((desa) => 
                                                        Object.entries(data.cases[desa]).flatMap(([livestockType, diagnoses], livestockIndex) => 
                                                            Object.entries(diagnoses).map(([diagnosis, count], diagnosisIndex) => (
                                                                <TableRow key={`${desa}-${livestockType}-${diagnosis}`}>
                                                                    {livestockIndex === 0 && diagnosisIndex === 0 && (
                                                                        <TableCell rowSpan={
                                                                            Object.values(data.cases[desa]).reduce((total, diagnoses) => total + Object.keys(diagnoses).length, 0)
                                                                        } className="align-top font-medium">
                                                                            {desa}
                                                                        </TableCell>
                                                                    )}
                                                                    {diagnosisIndex === 0 && (
                                                                        <TableCell rowSpan={Object.keys(diagnoses).length} className="align-top">
                                                                            {livestockType}
                                                                        </TableCell>
                                                                    )}
                                                                    <TableCell>{diagnosis}</TableCell>
                                                                    <TableCell className="text-right font-medium">{count}</TableCell>
                                                                </TableRow>
                                                            ))
                                                        )
                                                    ) : (
                                                        <TableRow>
                                                            <TableCell colSpan={4} className="text-center">Tidak ada kasus</TableCell>
                                                        </TableRow>
                                                    )}
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
                        <p>Tidak ada data untuk periode yang dipilih atau belum ada data sama sekali.</p>
                    </CardContent>
                </Card>
            )}
             <div className="flex justify-start md:justify-end mt-8">
                <PasswordDialog
                    title="Akses Terbatas"
                    description="Silakan masukkan kata sandi untuk mengunduh rekap."
                    onSuccess={handleDownload}
                    trigger={
                        <Button disabled={loading || puskeswanList.length === 0 || isPending}>
                            <Download className="mr-2 h-4 w-4" />
                            Unduh Rekap
                        </Button>
                    }
                />
            </div>
        </div>
      </div>
    </div>
  );
}

    