'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { CornerUpLeft, Download, Loader2 } from 'lucide-react';
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
              Unduh PDF Khusus
            </CardTitle>
            <CardDescription className="text-muted-foreground pt-2 text-sm md:text-base">
              Halaman ini menyediakan fitur untuk mengunduh laporan PDF khusus untuk drh. Iqbal Djamil.
            </CardDescription>
          </CardHeader>
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
