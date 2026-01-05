'use server';

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
import { getServices } from "@/lib/data";
import type { HealthcareService } from "@/lib/types";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from "@/components/ui/table";

interface RecapData {
    [puskeswan: string]: {
        medicines: { [medicineName: string]: number };
        diagnoses: { [diagnosis: string]: number };
    };
}

function processRecapData(services: HealthcareService[]): RecapData {
    const recap: RecapData = {};

    services.forEach(service => {
        if (!recap[service.puskeswan]) {
            recap[service.puskeswan] = { medicines: {}, diagnoses: {} };
        }

        // Process diagnoses
        const diagnosis = service.diagnosis.trim();
        recap[service.puskeswan].diagnoses[diagnosis] = (recap[service.puskeswan].diagnoses[diagnosis] || 0) + 1;

        // Process medicines
        service.treatments.forEach(treatment => {
            const medicineName = treatment.medicineName.trim();
            recap[service.puskeswan].medicines[medicineName] = (recap[service.puskeswan].medicines[medicineName] || 0) + 1;
        });
    });

    return recap;
}


export default async function RekapPage() {
    const services = await getServices();
    const recapData = processRecapData(services);
    const puskeswanList = Object.keys(recapData).sort();

  return (
    <div className="container py-4 md:py-8">
       <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-center md:text-left font-headline">Rekap Obat dan Kasus</h1>
        <p className="text-muted-foreground mt-2 text-center md:text-left text-sm md:text-base">
          Ringkasan penggunaan obat dan kasus yang ditangani per Puskeswan.
        </p>
        <div className="mt-6 md:mt-8">
            {puskeswanList.length > 0 ? (
                 <Accordion type="multiple" className="w-full space-y-4">
                    {puskeswanList.map(puskeswan => {
                        const data = recapData[puskeswan];
                        const sortedDiagnoses = Object.entries(data.diagnoses).sort(([, a], [, b]) => b - a);
                        const sortedMedicines = Object.entries(data.medicines).sort(([, a], [, b]) => b - a);

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
                                                            <TableHead className="text-right w-[80px]">Jumlah</TableHead>
                                                        </TableRow>
                                                    </TableHeader>
                                                    <TableBody>
                                                        {sortedMedicines.map(([medicine, count]) => (
                                                             <TableRow key={medicine}>
                                                                <TableCell>{medicine}</TableCell>
                                                                <TableCell className="text-right font-medium">{count}</TableCell>
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
                        <p>Belum ada data pelayanan yang diinput untuk ditampilkan rekapitulasinya.</p>
                    </CardContent>
                </Card>
            )}
        </div>
      </div>
    </div>
  );
}