
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

        services.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        const doc = new jsPDF({ orientation: 'landscape' });
        
        const pageWidth = doc.internal.pageSize.getWidth();
        doc.setFontSize(18);
        doc.setFont(undefined, 'bold');
        doc.text('Laporan Pelayanan Kesehatan Hewan', pageWidth / 2, 22, { align: 'center' });
        
        doc.setFontSize(11);
        doc.setFont(undefined, 'bold');
        doc.text('Petugas: drh. Iqbal Djamil', 14, 30);
        doc.setFont(undefined, 'normal');

        if (services.length > 0) {
          const tableColumn = ["No.", "Tanggal", "Puskeswan", "Pemilik", "Alamat", "ID Kasus", "Ternak", "Gejala Klinis", "Diagnosa", "Penanganan", "Pengobatan", "Perkembangan Kasus"];
          const tableRows: any[][] = [];

          services.forEach((service, index) => {
              const treatments = service.treatments.map(t => `${t.medicineName} (${t.dosageValue} ${t.dosageUnit})`).join('\n');
              const caseDevelopmentText = (service.caseDevelopments || [])
                .filter(dev => dev.status && dev.count > 0)
                .map(dev => `${dev.status} (${dev.count})`)
                .join(', ');

              const serviceData = [
                  index + 1,
                  format(new Date(service.date), 'dd-MM-yyyy', { locale: id }),
                  service.puskeswan,
                  service.ownerName,
                  service.ownerAddress,
                  service.caseId || '-',
                  `${service.livestockType} (${service.livestockCount})`,
                  service.clinicalSymptoms,
                  service.diagnosis,
                  service.treatmentType,
                  treatments,
                  caseDevelopmentText || (service.caseDevelopment || '-'),
              ];
              tableRows.push(serviceData);
          });
          
          const totalLivestock = services.reduce((sum, service) => sum + service.livestockCount, 0);

          autoTable(doc, {
              head: [tableColumn],
              body: tableRows,
              startY: 35,
              styles: { fontSize: 8, cellPadding: 2, textColor: [0, 0, 0] },
              headStyles: { fillColor: [38, 89, 43], textColor: [255, 255, 255], fontSize: 9, halign: 'center' },
              columnStyles: {
                5: { halign: 'left' },
                11: { halign: 'left' },
              }
          });
          
          const finalY = (doc as any).lastAutoTable.finalY;
          const totalText = `Total Data: ${services.length} - Total Pelayanan Keswan: ${totalLivestock} Ekor`;
          doc.setFontSize(10);
          doc.setFont(undefined, 'bold');
          doc.text(totalText, 14, finalY + 10);
          doc.setFont(undefined, 'normal');

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
