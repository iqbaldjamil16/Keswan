
'use client';

import { useState, useTransition, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { format, getMonth, getYear, subYears } from 'date-fns';
import { id } from 'date-fns/locale';
import * as XLSX from 'xlsx';
import {
  doc,
  deleteDoc,
  collection,
  query,
  orderBy,
  getDocs,
  Timestamp,
} from 'firebase/firestore';

import { HealthcareService, serviceSchema } from '@/lib/types';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from './ui/badge';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from './ui/card';
import {
  PawPrint,
  PlusCircle,
  ChevronDown,
  Pencil,
  Trash2,
  Loader2,
  Download,
} from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from './ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from './ui/skeleton';
import { cn } from '@/lib/utils';
import { useFirebase } from '@/firebase';
import { PasswordDialog } from './password-dialog';
import { puskeswanList } from '@/lib/definitions';


function ReportSkeleton() {
  return (
    <Card>
      <CardHeader className="p-4 md:p-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
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
                <TableHead className="w-[120px]">
                  <Skeleton className="h-5 w-full" />
                </TableHead>
                <TableHead>
                  <Skeleton className="h-5 w-full" />
                </TableHead>
                <TableHead>
                  <Skeleton className="h-5 w-full" />
                </TableHead>
                <TableHead>
                  <Skeleton className="h-5 w-full" />
                </TableHead>
                <TableHead>
                  <Skeleton className="h-5 w-full" />
                </TableHead>
                <TableHead>
                  <Skeleton className="h-5 w-full" />
                </TableHead>
                <TableHead className="w-[100px]">
                  <Skeleton className="h-5 w-full" />
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell colSpan={7}>
                  <Skeleton className="h-10 w-full" />
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell colSpan={7}>
                  <Skeleton className="h-10 w-full" />
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell colSpan={7}>
                  <Skeleton className="h-10 w-full" />
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </CardContent>
      <CardFooter className="p-4 md:p-6 flex justify-end">
        <Skeleton className="h-10 w-36" />
      </CardFooter>
    </Card>
  );
}

function ServiceCard({
  service,
  onDelete,
}: {
  service: HealthcareService;
  onDelete: (id: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, startDeleteTransition] = useTransition();
  const { toast } = useToast();
  const { firestore } = useFirebase();
  const router = useRouter();

  const handleDelete = () => {
    if (!firestore || !service.id) return;
    startDeleteTransition(async () => {
      try {
        const serviceDoc = doc(firestore, 'healthcareServices', service.id);
        await deleteDoc(serviceDoc);
        toast({
          title: 'Sukses',
          description: 'Data pelayanan berhasil dihapus.',
        });
        onDelete(service.id!);
        router.refresh();
      } catch (e) {
        toast({
          variant: 'destructive',
          title: 'Gagal',
          description: 'Gagal menghapus data.',
        });
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
              <div className="text-sm text-muted-foreground">
                {service.puskeswan}
              </div>
              <div className="text-sm text-muted-foreground pt-1">
                {format(new Date(service.date), 'dd MMM yyyy', { locale: id })}
              </div>
            </div>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="w-8 h-8 p-0">
                <ChevronDown
                  className={`h-4 w-4 transition-transform ${
                    isOpen ? 'rotate-180' : ''
                  }`}
                />
                <span className="sr-only">Toggle</span>
              </Button>
            </CollapsibleTrigger>
          </div>
        </CardHeader>
        <CollapsibleContent>
          <CardContent className="p-4 pt-0 space-y-3">
            <div>
              <div className="text-xs font-semibold text-muted-foreground">
                Pemilik
              </div>
              <p className="text-sm">{service.ownerName}</p>
              <p className="text-xs text-muted-foreground">
                {service.ownerAddress}
              </p>
            </div>
            <div>
              <div className="text-xs font-semibold text-muted-foreground">
                Ternak
              </div>
              <Badge variant="secondary">
                {service.livestockType} ({service.livestockCount})
              </Badge>
            </div>
            <div>
              <div className="text-xs font-semibold text-muted-foreground">
                Diagnosa
              </div>
              <p className="text-sm">{service.diagnosis}</p>
            </div>
            <div>
              <div className="text-xs font-semibold text-muted-foreground">
                Pengobatan
              </div>
              <ul className="list-disc pl-5 mt-1 space-y-1 text-sm">
                {service.treatments.map((treatment, index) => (
                  <li key={index}>
                    <span className="font-semibold">{treatment.medicineName}</span>{' '}
                    ({treatment.dosageValue} {treatment.dosageUnit})
                    <br />
                    <span className="text-muted-foreground text-xs">
                      {treatment.medicineType}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
          <CardFooter className="p-4 pt-0 flex justify-end gap-2">
            <PasswordDialog
              title="Akses Terbatas"
              description="Silakan masukkan kata sandi untuk mengedit data."
              onSuccess={() => router.push(`/laporan/${service.id}/edit`)}
              trigger={
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Pencil className="h-4 w-4" />
                </Button>
              }
            />
            <PasswordDialog
              title="Konfirmasi Hapus"
              description="Tindakan ini memerlukan verifikasi. Masukkan kata sandi untuk melanjutkan."
              onSuccess={handleDelete}
              trigger={
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive hover:text-destructive h-8 w-8"
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </Button>
              }
            />
          </CardFooter>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}

function ActionsCell({
  service,
  onDelete,
}: {
  service: HealthcareService;
  onDelete: (id: string) => void;
}) {
  const [isDeleting, startDeleteTransition] = useTransition();
  const { toast } = useToast();
  const { firestore } = useFirebase();
  const router = useRouter();

  const handleDelete = () => {
    if (!firestore || !service.id) return;
    startDeleteTransition(async () => {
      try {
        const serviceDoc = doc(firestore, 'healthcareServices', service.id);
        await deleteDoc(serviceDoc);
        toast({
          title: 'Sukses',
          description: 'Data pelayanan berhasil dihapus.',
        });
        onDelete(service.id!);
        router.refresh();
      } catch (e) {
        toast({
          variant: 'destructive',
          title: 'Gagal',
          description: 'Gagal menghapus data.',
        });
      }
    });
  };

  return (
    <div className="flex items-center justify-center gap-2">
      <PasswordDialog
        title="Akses Terbatas"
        description="Silakan masukkan kata sandi untuk mengedit data."
        onSuccess={() => router.push(`/laporan/${service.id}/edit`)}
        trigger={
          <Button variant="ghost" size="icon">
            <Pencil className="h-4 w-4" />
          </Button>
        }
      />
      <PasswordDialog
        title="Konfirmasi Hapus"
        description="Tindakan ini memerlukan verifikasi. Masukkan kata sandi untuk melanjutkan."
        onSuccess={handleDelete}
        trigger={
          <Button
            variant="ghost"
            size="icon"
            className="text-destructive hover:text-destructive"
            disabled={isDeleting}
          >
            {isDeleting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
          </Button>
        }
      />
    </div>
  );
}

const years = Array.from({ length: 5 }, (_, i) =>
  getYear(subYears(new Date(), i)).toString()
);
const months = Array.from({ length: 12 }, (_, i) => ({
  value: i.toString(),
  label: new Date(0, i).toLocaleString(id, { month: 'long' }),
}));

export function ServiceTable() {
  const [allServices, setAllServices] = useState<HealthcareService[]>([]);
  const [filteredServices, setFilteredServices] = useState<HealthcareService[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const { firestore } = useFirebase();

  const loadAllServices = useCallback(async () => {
    if (!firestore) return;
    setLoading(true);
    try {
      const servicesCollection = collection(firestore, 'healthcareServices');
      const q = query(servicesCollection, orderBy('date', 'desc'));

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
          console.error('Validation error parsing service data:', e);
        }
      });
      setAllServices(fetchedServices);
    } catch (error) {
      console.error('Failed to fetch services:', error);
      setAllServices([]);
    } finally {
      setLoading(false);
    }
  }, [firestore]);

  useEffect(() => {
    loadAllServices();
  }, [loadAllServices]);

  useEffect(() => {
    startTransition(() => {
      let servicesToFilter = allServices;

      const year =
        selectedYear === 'all-years' || selectedYear === ''
          ? null
          : parseInt(selectedYear, 10);
      const month =
        selectedMonth === 'all-months' || selectedMonth === ''
          ? null
          : parseInt(selectedMonth, 10);

      if (year || month !== null) {
        servicesToFilter = allServices.filter((service) => {
          const serviceDate = new Date(service.date);
          const isYearMatch = year ? getYear(serviceDate) === year : true;
          const isMonthMatch =
            month !== null ? getMonth(serviceDate) === month : true;
          return isYearMatch && isMonthMatch;
        });
      }

      const lowercasedFilter = searchTerm.toLowerCase();
      if (lowercasedFilter) {
        servicesToFilter = servicesToFilter.filter((service) => {
          const ownerName = service.ownerName.toLowerCase();
          const officerName = service.officerName.toLowerCase();
          const puskeswan = service.puskeswan.toLowerCase();
          const diagnosis = service.diagnosis.toLowerCase();
          const livestockType = service.livestockType.toLowerCase();
          const formattedDate = format(new Date(service.date), 'dd MMM yyyy', {
            locale: id,
          }).toLowerCase();

          return (
            ownerName.includes(lowercasedFilter) ||
            officerName.includes(lowercasedFilter) ||
            puskeswan.includes(lowercasedFilter) ||
            diagnosis.includes(lowercasedFilter) ||
            livestockType.includes(lowercasedFilter) ||
            formattedDate.includes(lowercasedFilter)
          );
        });
      }

      setFilteredServices(servicesToFilter);
    });
  }, [selectedMonth, selectedYear, searchTerm, allServices]);


  const handleLocalDelete = (serviceId: string) => {
    setAllServices((currentServices) =>
      currentServices.filter((s) => s.id !== serviceId)
    );
  };
  
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

  if (loading && allServices.length === 0) {
    return <ReportSkeleton />;
  }

  return (
    <div className="pb-16">
      <Card
        className={cn(isPending && 'opacity-50 transition-opacity duration-300')}
      >
        <CardHeader className="p-4 md:p-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row w-full md:w-auto md:justify-end gap-2">
              <div className="flex gap-2">
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Pilih Bulan" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all-months">Semua Bulan</SelectItem>
                    {months.map((month) => (
                      <SelectItem key={month.value} value={month.value}>
                        {month.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger className="w-full sm:w-[120px]">
                    <SelectValue placeholder="Pilih Tahun" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all-years">Semua Tahun</SelectItem>
                    {years.map((year) => (
                      <SelectItem key={year} value={year}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Input
                placeholder="Cari data..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full md:w-64"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0 md:p-6 md:pt-0">
          {/* Mobile View */}
          <div className="md:hidden">
            {loading && filteredServices.length === 0 ? (
              <div className="space-y-4 p-4">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
              </div>
            ) : (
              <div className="space-y-4 p-4 max-h-[calc(100vh-280px)] overflow-y-auto">
                {filteredServices.length > 0 ? (
                  filteredServices.map((service) => (
                    <ServiceCard
                      key={service.id}
                      service={service}
                      onDelete={handleLocalDelete}
                    />
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center gap-2 py-12">
                    <PawPrint className="h-8 w-8 text-muted-foreground" />
                    <p className="text-muted-foreground text-center">
                      {searchTerm
                        ? 'Tidak ada hasil ditemukan.'
                        : 'Belum ada data untuk periode ini.'}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Desktop View */}
          <div className="hidden md:block relative w-full overflow-auto rounded-md border h-[520px]">
            <Table>
              <TableHeader className="sticky top-0 bg-card">
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
                {loading && filteredServices.length === 0 ? (
                  <>
                    <TableRow>
                      <TableCell colSpan={7}>
                        <Skeleton className="h-10 w-full" />
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell colSpan={7}>
                        <Skeleton className="h-10 w-full" />
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell colSpan={7}>
                        <Skeleton className="h-10 w-full" />
                      </TableCell>
                    </TableRow>
                  </>
                ) : filteredServices.length > 0 ? (
                  filteredServices.map((service) => (
                    <TableRow key={service.id}>
                      <TableCell className="font-medium align-top">
                        {format(new Date(service.date), 'dd MMM yyyy', {
                          locale: id,
                        })}
                      </TableCell>
                      <TableCell className="align-top">
                        <div className="font-medium">{service.ownerName}</div>
                        <div className="text-xs text-muted-foreground">
                          {service.ownerAddress}
                        </div>
                      </TableCell>
                      <TableCell className="align-top">
                        <Badge variant="secondary">
                          {service.livestockType} ({service.livestockCount})
                        </Badge>
                      </TableCell>
                      <TableCell className="align-top">
                        {service.diagnosis}
                      </TableCell>
                      <TableCell className="align-top">
                        <Accordion
                          type="single"
                          collapsible
                          className="w-full max-w-xs"
                        >
                          <AccordionItem value="item-1">
                            <AccordionTrigger className="py-1 text-primary hover:no-underline">
                              <PlusCircle className="mr-2 h-4 w-4" /> Lihat{' '}
                              {service.treatments.length} pengobatan
                            </AccordionTrigger>
                            <AccordionContent>
                              <ul className="list-disc pl-5 space-y-1 text-xs">
                                {service.treatments.map((treatment, index) => (
                                  <li key={index}>
                                    <span className="font-semibold">
                                      {treatment.medicineName}
                                    </span>{' '}
                                    ({treatment.dosageValue}{' '}
                                    {treatment.dosageUnit})
                                    <br />
                                    <span className="text-muted-foreground">
                                      {treatment.medicineType}
                                    </span>
                                  </li>
                                ))}
                              </ul>
                            </AccordionContent>
                          </AccordionItem>
                        </Accordion>
                      </TableCell>
                      <TableCell className="align-top">
                        <div className="font-medium">{service.officerName}</div>
                        <div className="text-xs text-muted-foreground">
                          {service.puskeswan}
                        </div>
                      </TableCell>
                      <TableCell className="align-top text-center">
                        <ActionsCell
                          service={service}
                          onDelete={handleLocalDelete}
                        />
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <PawPrint className="h-8 w-8 text-muted-foreground" />
                        <p className="text-muted-foreground">
                          {searchTerm
                            ? 'Tidak ada hasil ditemukan.'
                            : 'Pilih bulan dan tahun untuk menampilkan data.'}
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
            <PasswordDialog
              title="Akses Terbatas"
              description="Silakan masukkan kata sandi untuk mengunduh laporan."
              onSuccess={handleDownload}
              trigger={
                <Button 
                  disabled={filteredServices.length === 0 || isPending}
                >
                  <Download className="mr-2 h-5 w-5" />
                  Unduh Laporan
                </Button>
              }
            />
        </CardFooter>
      </Card>
    </div>
  );
}
