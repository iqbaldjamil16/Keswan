
"use client";

import { useState, useMemo, useTransition, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format, getMonth, getYear, subYears, startOfMonth, endOfMonth } from "date-fns";
import { id } from 'date-fns/locale';
import * as XLSX from 'xlsx';
import { doc, deleteDoc, collection, query, where, orderBy, getDocs, Timestamp } from "firebase/firestore";

import { HealthcareService, serviceSchema } from "@/lib/types";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "./ui/badge";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { PawPrint, PlusCircle, ChevronDown, Download, Pencil, Trash2, Loader2 } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "./ui/button";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
  } from "@/components/ui/collapsible";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from "@/components/ui/select";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "./ui/skeleton";
import { cn } from "@/lib/utils";
import { useFirebase } from "@/firebase";

  
  interface ServiceTableProps {}

function ReportSkeleton() {
    return (
      <Card>
        <CardHeader className="p-4 md:p-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <Skeleton className="h-8 w-1/3" />
                 <div className="flex flex-col sm:flex-row w-full md:w-auto md:justify-end gap-2">
                    <div className="flex gap-2">
                       <Skeleton className="h-10 w-full sm:w-[180px]" />
                       <Skeleton className="h-10 w-full sm:w-[120px]" />
                    </div>
                    <Skeleton className="h-10 w-full md:w-64" />
                </div>
            </div>
        </CardHeader>
        <CardContent className="p-0 md:p-6 md:pt-0">
             {/* Mobile Skeleton */}
            <div className="md:hidden space-y-4 p-4">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
            </div>
            {/* Desktop Skeleton */}
            <div className="hidden md:block rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[120px]"><Skeleton className="h-5 w-full" /></TableHead>
                            <TableHead><Skeleton className="h-5 w-full" /></TableHead>
                            <TableHead><Skeleton className="h-5 w-full" /></TableHead>
                            <TableHead><Skeleton className="h-5 w-full" /></TableHead>
                            <TableHead><Skeleton className="h-5 w-full" /></TableHead>
                            <TableHead><Skeleton className="h-5 w-full" /></TableHead>
                            <TableHead className="w-[100px]"><Skeleton className="h-5 w-full" /></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        <TableRow><TableCell colSpan={7}><Skeleton className="h-10 w-full" /></TableCell></TableRow>
                        <TableRow><TableCell colSpan={7}><Skeleton className="h-10 w-full" /></TableCell></TableRow>
                        <TableRow><TableCell colSpan={7}><Skeleton className="h-10 w-full" /></TableCell></TableRow>
                    </TableBody>
                </Table>
            </div>
        </CardContent>
        <CardFooter className="p-4 md:p-6 flex justify-end">
            <Skeleton className="h-10 w-36" />
        </CardFooter>
      </Card>
    )
  }

function ServiceCard({ service, onDelete }: { service: HealthcareService, onDelete: (id: string) => void }) {
    const [isOpen, setIsOpen] = useState(false);
    const [isDeleting, startDeleteTransition] = useTransition();
    const { toast } = useToast();
    const { firestore } = useFirebase();
    const router = useRouter();

    const handleDelete = () => {
        if (!firestore || !service.id) return;
        startDeleteTransition(async () => {
            try {
                const serviceDoc = doc(firestore, "healthcareServices", service.id);
                await deleteDoc(serviceDoc);
                toast({ title: "Sukses", description: "Data pelayanan berhasil dihapus." });
                onDelete(service.id!);
                router.refresh();
            } catch (e) {
                toast({ variant: "destructive", title: "Gagal", description: "Gagal menghapus data." });
            }
        });
    };

    return (
        <Collapsible
            asChild
            key={service.id}
            open={isOpen}
            onOpenChange={setIsOpen}
        >
            <Card>
                <CardHeader className="p-4">
                    <div className="flex justify-between items-start">
                        <div>
                            <div className="font-semibold">{service.officerName}</div>
                            <div className="text-sm text-muted-foreground">{service.puskeswan}</div>
                            <div className="text-sm text-muted-foreground pt-1">
                                {format(new Date(service.date), "dd MMM yyyy", { locale: id })}
                            </div>
                        </div>
                        <CollapsibleTrigger asChild>
                            <Button variant="ghost" size="sm" className="w-8 h-8 p-0">
                                <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                                <span className="sr-only">Toggle</span>
                            </Button>
                        </CollapsibleTrigger>
                    </div>
                </CardHeader>
                <CollapsibleContent>
                    <CardContent className="p-4 pt-0 space-y-3">
                        <div>
                            <div className="text-xs font-semibold text-muted-foreground">Pemilik</div>
                            <p className="text-sm">{service.ownerName}</p>
                            <p className="text-xs text-muted-foreground">{service.ownerAddress}</p>
                        </div>
                        <div>
                            <div className="text-xs font-semibold text-muted-foreground">Ternak</div>
                            <Badge variant="secondary">{service.livestockType} ({service.livestockCount})</Badge>
                        </div>
                        <div>
                            <div className="text-xs font-semibold text-muted-foreground">Diagnosa</div>
                            <p className="text-sm">{service.diagnosis}</p>
                        </div>
                        <div>
                            <div className="text-xs font-semibold text-muted-foreground">Pengobatan</div>
                             <ul className="list-disc pl-5 mt-1 space-y-1 text-sm">
                              {service.treatments.map((treatment, index) => (
                                <li key={index}>
                                  <span className="font-semibold">{treatment.medicineName}</span> ({treatment.dosage})
                                  <br />
                                  <span className="text-muted-foreground text-xs">{treatment.medicineType}</span>
                                </li>
                              ))}
                            </ul>
                        </div>
                    </CardContent>
                    <CardFooter className="p-4 pt-0 flex justify-end gap-2">
                         <Button asChild variant="ghost" size="icon" className="h-8 w-8">
                            <Link href={`/laporan/${service.id}/edit`}><Pencil className="h-4 w-4" /></Link>
                        </Button>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive h-8 w-8" disabled={isDeleting}>
                                     {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Anda yakin?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Tindakan ini tidak bisa dibatalkan. Data pelayanan akan dihapus secara permanen.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Batal</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
                                        {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                        Ya, Hapus
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </CardFooter>
                </CollapsibleContent>
            </Card>
        </Collapsible>
    )
}

function ActionsCell({ service, onDelete }: { service: HealthcareService, onDelete: (id: string) => void }) {
    const [isDeleting, startDeleteTransition] = useTransition();
    const { toast } = useToast();
    const { firestore } = useFirebase();
    const router = useRouter();

    const handleDelete = () => {
        if (!firestore || !service.id) return;
        startDeleteTransition(async () => {
            try {
                const serviceDoc = doc(firestore, "healthcareServices", service.id);
                await deleteDoc(serviceDoc);
                toast({ title: "Sukses", description: "Data pelayanan berhasil dihapus." });
                onDelete(service.id!);
                router.refresh();
            } catch (e) {
                toast({ variant: "destructive", title: "Gagal", description: "Gagal menghapus data." });
            }
        });
    };

    return (
        <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="icon">
                <Link href={`/laporan/${service.id}/edit`}><Pencil className="h-4 w-4" /></Link>
            </Button>
            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" disabled={isDeleting}>
                         {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Anda yakin?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Tindakan ini tidak bisa dibatalkan. Data pelayanan akan dihapus secara permanen.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
                            {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Ya, Hapus
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

const years = Array.from({ length: 5 }, (_, i) => getYear(subYears(new Date(), i)).toString());
const months = Array.from({ length: 12 }, (_, i) => ({
    value: i.toString(),
    label: new Date(0, i).toLocaleString(id, { month: 'long' }),
}));


export function ServiceTable({}: ServiceTableProps) {
    const [services, setServices] = useState<HealthcareService[]>([]);
    const [loading, setLoading] = useState(true);
    const [isPending, startTransition] = useTransition();
    const [selectedMonth, setSelectedMonth] = useState(getMonth(new Date()).toString());
    const [selectedYear, setSelectedYear] = useState(getYear(new Date()).toString());
    const [searchTerm, setSearchTerm] = useState("");
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
                orderBy('date', 'desc')
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
    }, [selectedYear, selectedMonth, loadServices]);


    const handleMonthChange = (month: string) => {
        setSelectedMonth(month);
    };
    
    const handleYearChange = (year: string) => {
        setSelectedYear(year);
    };

    const handleLocalDelete = (serviceId: string) => {
        setServices(currentServices => currentServices.filter(s => s.id !== serviceId));
    };


    const searchedServices = useMemo(() => {
        const lowercasedFilter = searchTerm.toLowerCase();
        
        return services.filter((service) => {
            if (!searchTerm) return true;
            const ownerName = service.ownerName.toLowerCase();
            const formattedDate = format(new Date(service.date), "dd MMM yyyy", { locale: id }).toLowerCase();
            
            return ownerName.includes(lowercasedFilter) || formattedDate.includes(lowercasedFilter);
        });
    }, [searchTerm, services]);

    const handleDownload = () => {
        const sortedServices = [...searchedServices].sort((a, b) => {
          if (a.puskeswan < b.puskeswan) return -1;
          if (a.puskeswan > b.puskeswan) return 1;
          if (a.officerName < b.officerName) return -1;
          if (a.officerName > b.officerName) return 1;
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        });

        const dataForSheet = sortedServices.map(service => ({
          'Puskeswan': service.puskeswan,
          'Nama Petugas': service.officerName,
          'Tanggal Pelayanan': format(new Date(service.date), 'dd-MM-yyyy'),
          'Nama Pemilik': service.ownerName,
          'Alamat Pemilik': service.ownerAddress,
          'ID Kasus iSIKHNAS': service.caseId,
          'Jenis Ternak': service.livestockType,
          'Jumlah': service.livestockCount,
          'Gejala Klinis': service.clinicalSymptoms,
          'Diagnosa': service.diagnosis,
          'Penanganan': service.handling,
          'Jenis Pengobatan': service.treatmentType,
          'Obat yang Digunakan': service.treatments.map(t => `${t.medicineName} (${t.dosage})`).join(', '),
        }));

        const ws = XLSX.utils.json_to_sheet(dataForSheet);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Data Pelayanan");

        const monthLabel = months.find(m => m.value === selectedMonth)?.label || '';
        XLSX.writeFile(wb, `laporan_pelayanan_${monthLabel}_${selectedYear}.xlsx`);
    };

    if (loading && services.length === 0) {
        return <ReportSkeleton />;
    }


  return (
    <Card className={cn(isPending && "opacity-50 transition-opacity duration-300")}>
      <CardHeader className="p-4 md:p-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <CardTitle>Data Pelayanan</CardTitle>
          <div className="flex flex-col sm:flex-row w-full md:w-auto md:justify-end gap-2">
            <div className="flex gap-2">
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
            <Input
              placeholder="Cari nama pemilik atau tanggal..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full md:w-64"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0 md:p-6 md:pt-0">
        <div className="md:hidden space-y-4 p-4">
            {searchedServices.length > 0 ? (
                searchedServices.map(service => <ServiceCard key={service.id} service={service} onDelete={handleLocalDelete} />)
            ) : (
                <div className="flex flex-col items-center justify-center gap-2 py-12">
                    <PawPrint className="h-8 w-8 text-muted-foreground" />
                    <p className="text-muted-foreground text-center">
                    {searchTerm ? "Tidak ada hasil ditemukan." : "Belum ada data untuk periode ini."}
                    </p>
                </div>
            )}
        </div>


        {/* Desktop View */}
        <div className="hidden md:block relative w-full overflow-auto rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[120px]">Tanggal</TableHead>
                <TableHead>Pemilik</TableHead>
                <TableHead>Jenis Ternak</TableHead>
                <TableHead>Diagnosa</TableHead>
                <TableHead>Pengobatan</TableHead>
                <TableHead>Petugas</TableHead>
                <TableHead className="w-[100px] text-center">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {searchedServices.length > 0 ? (
                searchedServices.map((service) => (
                  <TableRow key={service.id}>
                    <TableCell className="font-medium align-top">
                      {format(new Date(service.date), "dd MMM yyyy", { locale: id })}
                    </TableCell>
                    <TableCell className="align-top">
                      <div className="font-medium">{service.ownerName}</div>
                      <div className="text-xs text-muted-foreground">{service.ownerAddress}</div>
                    </TableCell>
                    <TableCell className="align-top">
                      <Badge variant="secondary">{service.livestockType} ({service.livestockCount})</Badge>
                    </TableCell>
                    <TableCell className="align-top">{service.diagnosis}</TableCell>
                     <TableCell className="align-top">
                      <Accordion type="single" collapsible className="w-full max-w-xs">
                        <AccordionItem value="item-1">
                          <AccordionTrigger className="py-1 text-primary hover:no-underline">
                             <PlusCircle className="mr-2 h-4 w-4" /> Lihat {service.treatments.length} pengobatan
                          </AccordionTrigger>
                          <AccordionContent>
                            <ul className="list-disc pl-5 space-y-1 text-xs">
                              {service.treatments.map((treatment, index) => (
                                <li key={index}>
                                  <span className="font-semibold">{treatment.medicineName}</span> ({treatment.dosage})
                                  <br />
                                  <span className="text-muted-foreground">{treatment.medicineType}</span>
                                </li>
                              ))}
                            </ul>
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    </TableCell>
                    <TableCell className="align-top">
                        <div className="font-medium">{service.officerName}</div>
                        <div className="text-xs text-muted-foreground">{service.puskeswan}</div>
                    </TableCell>
                    <TableCell className="align-top text-center">
                        <ActionsCell service={service} onDelete={handleLocalDelete} />
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <PawPrint className="h-8 w-8 text-muted-foreground" />
                      <p className="text-muted-foreground">
                        {searchTerm ? "Tidak ada hasil ditemukan." : "Belum ada data untuk periode ini."}
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
      <CardFooter className="p-4 md:p-6 flex justify-end">
        <Button onClick={handleDownload} variant="outline" disabled={searchedServices.length === 0 || isPending}>
            <Download className="mr-2 h-4 w-4" />
            Unduh Laporan
        </Button>
      </CardFooter>
    </Card>
  );
}

    

    