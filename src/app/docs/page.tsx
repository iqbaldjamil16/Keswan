'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { CornerUpLeft, Download, Loader2 } from 'lucide-react';
import { FormControl, FormItem, FormLabel } from '@/components/ui/form';
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

export default function DocsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { firestore } = useFirebase();
  const [isGenerating, setIsGenerating] = useState(false);
  const [servicePhotoUrl, setServicePhotoUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handlePhotoSelect = (file: File | undefined) => {
    if (!file) {
      setServicePhotoUrl(null);
      return;
    }
    if (!file.type.startsWith('image/')) {
      toast({
        variant: 'destructive',
        title: 'File Tidak Valid',
        description: 'Silakan pilih file gambar (jpg, png, dll).',
      });
      return;
    }
    setIsUploading(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      setServicePhotoUrl(reader.result as string);
      setIsUploading(false);
      toast({
        title: 'Foto Siap',
        description: 'Foto telah dimuat dan siap untuk ditambahkan ke PDF.',
      });
    };
    reader.onerror = () => {
      setIsUploading(false);
      toast({
        variant: 'destructive',
        title: 'Gagal Memuat Foto',
        description: 'Terjadi kesalahan saat membaca file gambar.',
      });
    };
    reader.readAsDataURL(file);
  };

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

        if (services.length === 0 && !servicePhotoUrl) {
            toast({ title: 'Info', description: 'Tidak ada data pelayanan atau foto untuk drh. Iqbal Djamil.' });
            setIsGenerating(false);
            return;
        }

        // Sort services by date from oldest to newest
        services.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        const doc = new jsPDF();
        
        doc.setFontSize(18);
        doc.text('Laporan Pelayanan Kesehatan Hewan', 14, 22);
        doc.setFontSize(11);
        doc.text('Petugas: drh. Iqbal Djamil', 14, 30);

        if (services.length > 0) {
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
        } else {
          doc.setFontSize(11);
          doc.text('Tidak ada data pelayanan tabel untuk periode ini.', 14, 40);
        }

        if (servicePhotoUrl) {
          if (services.length > 0) {
            doc.addPage();
          }
          doc.setFontSize(14);
          doc.text('Lampiran Foto Pelayanan', 14, 22);
          try {
            const imgProps = doc.getImageProperties(servicePhotoUrl);
            const pdfWidth = doc.internal.pageSize.getWidth();
            const pdfHeight = doc.internal.pageSize.getHeight();
            const margin = 14;
            const maxWidth = pdfWidth - margin * 2;
            const maxHeight = pdfHeight - margin * 4;
            
            const ratio = Math.min(maxWidth / imgProps.width, maxHeight / imgProps.height);
    
            const imgWidth = imgProps.width * ratio;
            const imgHeight = imgProps.height * ratio;
    
            const x = (pdfWidth - imgWidth) / 2;
            const y = 35;
            
            doc.addImage(servicePhotoUrl, imgProps.format.toUpperCase(), x, y, imgWidth, imgHeight);
          } catch (e) {
            console.error("Gagal menambahkan gambar ke PDF:", e);
            toast({ variant: 'destructive', title: 'Gagal', description: 'Gagal menambahkan gambar ke PDF. Pastikan format gambar didukung.' });
          }
        }

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
              Dokumentasi & Unduh PDF
            </CardTitle>
            <CardDescription className="text-muted-foreground pt-2 text-sm md:text-base">
              Gunakan fitur di bawah untuk melampirkan foto dan mengunduh laporan PDF khusus.
            </CardDescription>
          </CardHeader>
          <CardContent>
            
          </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>Upload Foto</CardTitle>
                <CardDescription>Upload foto pelayanan untuk dilampirkan di PDF.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <FormItem>
                  <FormLabel>Nama Petugas</FormLabel>
                  <Select value="drh. Iqbal Djamil" disabled>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="drh. Iqbal Djamil">
                        drh. Iqbal Djamil
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>

                <FormItem>
                  <FormLabel>File Foto Pelayanan</FormLabel>
                  <FormControl>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handlePhotoSelect(e.target.files?.[0])}
                      disabled={isUploading || isGenerating}
                    />
                  </FormControl>
                </FormItem>

                {isUploading && (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Memuat foto...
                  </div>
                )}

                {servicePhotoUrl && !isUploading && (
                  <div>
                    <p className="text-sm font-medium text-green-600">
                      Foto berhasil dimuat.
                    </p>
                    <img
                      src={servicePhotoUrl}
                      alt="Preview"
                      className="mt-2 rounded-md border max-h-48 w-auto"
                    />
                  </div>
                )}
              </div>
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>Unduh Laporan PDF</CardTitle>
                <CardDescription>Hanya memuat data pelayanan khusus untuk drh. Iqbal Djamil.</CardDescription>
            </CardHeader>
            <CardContent>
                <Button onClick={handleGeneratePdf} disabled={isGenerating}>
                    {isGenerating ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Membuat PDF...</> : <><Download className="mr-2 h-4 w-4" /> Unduh Laporan PDF</>}
                </Button>
                <p className="text-xs text-muted-foreground mt-2">
                    Catatan: Foto yang diunggah akan disertakan dalam PDF, namun tidak disimpan permanen. Jika Anda memuat ulang halaman, foto harus diunggah kembali.
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
