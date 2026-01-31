'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { CornerUpLeft, Download } from 'lucide-react';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useFirebase } from '@/firebase';
import { collection, getDocs, query, where, Timestamp } from 'firebase/firestore';
import { type HealthcareService, serviceSchema } from '@/lib/types';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { useState } from 'react';

const docFormSchema = z.object({
  officerName: z.string().min(1, 'Nama petugas harus diisi.'),
  servicePhoto: z.any().optional(),
});

type DocFormValues = z.infer<typeof docFormSchema>;

const officerList = ['drh. Iqbal Djamil'];

export default function DocsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { firestore } = useFirebase();
  const [isGenerating, setIsGenerating] = useState(false);

  const form = useForm<DocFormValues>({
    resolver: zodResolver(docFormSchema),
    defaultValues: {
      officerName: '',
    },
  });

  function onSubmit(data: DocFormValues) {
    console.log(data);
    if (data.servicePhoto) {
        toast({
            title: 'Informasi Terkirim',
            description: 'Data dan foto telah dicatat (simulasi). PDF tidak akan menyertakan foto ini.',
        });
    } else {
        toast({
            title: 'Informasi Terkirim',
            description: 'Data telah dicatat (simulasi).',
        });
    }
  }

  const handleGeneratePdf = async () => {
    if (!firestore) {
        toast({ variant: 'destructive', title: 'Error', description: 'Koneksi Firestore tidak tersedia.' });
        return;
    }
    setIsGenerating(true);

    try {
        const servicesCollection = collection(firestore, 'healthcareServices');
        const q = query(servicesCollection, where('officerName', '==', 'drh. Iqbal Djamil'));
        const querySnapshot = await getDocs(q);

        const services: HealthcareService[] = [];
        querySnapshot.forEach((doc) => {
            const data = doc.data();
             try {
                const service = serviceSchema.parse({
                    ...data,
                    id: doc.id,
                    date: (data.date as Timestamp).toDate(),
                });
                services.push(service);
            } catch (e) {
                console.error("Validation error parsing service data for PDF:", e, data);
            }
        });

        if (services.length === 0) {
            toast({ title: 'Info', description: 'Tidak ada data pelayanan untuk drh. Iqbal Djamil.' });
            return;
        }

        // Sort services by date from oldest to newest
        services.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        const doc = new jsPDF();
        
        doc.setFontSize(18);
        doc.text('Laporan Pelayanan Kesehatan Hewan', 14, 22);
        doc.setFontSize(11);
        doc.text('Petugas: drh. Iqbal Djamil', 14, 30);

        const tableColumn = ["Tanggal", "Pemilik", "Alamat", "Ternak", "Diagnosa", "Pengobatan"];
        const tableRows: any[][] = [];

        services.forEach(service => {
            const treatments = service.treatments.map(t => `${t.medicineName} (${t.dosageValue} ${t.dosageUnit})`).join('\n');
            const serviceData = [
                format(new Date(service.date), 'dd MMM yyyy', { locale: id }),
                service.ownerName,
                service.ownerAddress,
                `${service.livestockType} (${service.livestockCount})`,
                service.diagnosis,
                treatments,
            ];
            tableRows.push(serviceData);
        });

        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 35,
        });

        doc.save('laporan-drh-iqbal-djamil.pdf');

    } catch (error) {
        console.error("Gagal membuat PDF: ", error);
        toast({ variant: 'destructive', title: 'Gagal', description: 'Terjadi kesalahan saat membuat PDF.' });
    } finally {
        setIsGenerating(false);
    }
  };

  return (
    <div className="container px-4 sm:px-8 py-4 md:py-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl md:text-3xl font-bold tracking-tight font-headline">
              Dokumentasi Aplikasi
            </CardTitle>
            <CardDescription className="text-muted-foreground pt-2 text-sm md:text-base">
              Panduan penggunaan dan informasi mengenai aplikasi Manajemen Pelayanan Kesehatan Hewan.
            </CardDescription>
          </CardHeader>
          <CardContent>
            
          </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>Form Tambahan</CardTitle>
                <CardDescription>Kolom isian sesuai permintaan.</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                            control={form.control}
                            name="officerName"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Nama Petugas</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih Nama Petugas" />
                                    </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                    {officerList.map((officer) => (
                                        <SelectItem key={officer} value={officer}>
                                        {officer}
                                        </SelectItem>
                                    ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="servicePhoto"
                            render={({ field: { onChange, onBlur, name, ref } }) => (
                                <FormItem>
                                <FormLabel>Upload Foto Pelayanan</FormLabel>
                                <FormControl>
                                    <Input 
                                      type="file" 
                                      accept="image/*"
                                      name={name}
                                      ref={ref}
                                      onBlur={onBlur}
                                      onChange={(e) => onChange(e.target.files?.[0])}
                                    />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />

                        <Button type="submit">Kirim</Button>
                    </form>
                </Form>
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>Unduh Laporan PDF</CardTitle>
                <CardDescription>Hanya memuat data pelayanan khusus untuk drh. Iqbal Djamil.</CardDescription>
            </CardHeader>
            <CardContent>
                <Button onClick={handleGeneratePdf} disabled={isGenerating}>
                    {isGenerating ? 'Membuat PDF...' : <><Download className="mr-2 h-4 w-4" /> Unduh Laporan PDF</>}
                </Button>
                <p className="text-xs text-muted-foreground mt-2">
                    Catatan: Fitur ini tidak akan menyertakan foto yang diunggah dari form di atas karena unggahan tersebut hanya simulasi.
                </p>
            </CardContent>
        </Card>
      </div>
      <Button
        variant="default"
        className="fixed bottom-6 left-6 h-14 w-14 rounded-full shadow-lg"
        aria-label="Kembali ke halaman utama"
        onClick={() => router.push('/')}
      >
        <CornerUpLeft className="h-7 w-7" />
      </Button>
    </div>
  );
}
