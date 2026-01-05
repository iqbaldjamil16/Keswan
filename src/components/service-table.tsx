
"use client";

import { useState, useMemo } from "react";
import { format } from "date-fns";
import { id } from 'date-fns/locale';

import { HealthcareService } from "@/lib/types";
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
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { PawPrint, PlusCircle } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface ServiceTableProps {
  services: HealthcareService[];
}

export function ServiceTable({ services }: ServiceTableProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredServices = useMemo(() => {
    if (!searchTerm) return services;

    const lowercasedFilter = searchTerm.toLowerCase();
    
    return services.filter((service) => {
        const serviceValues = Object.entries(service)
            .filter(([key]) => key !== 'treatments')
            .map(([, value]) => String(value).toLowerCase());
        
        const treatmentValues = service.treatments.flatMap(t => Object.values(t).map(v => String(v).toLowerCase()));
        
        const allValues = [...serviceValues, ...treatmentValues];

        return allValues.some(value => value.includes(lowercasedFilter));
    });
}, [searchTerm, services]);

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <CardTitle>Data Pelayanan</CardTitle>
          <div className="w-full md:w-1/3">
            <Input
              placeholder="Cari semua data..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="relative w-full overflow-auto rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[120px]">Tanggal</TableHead>
                <TableHead>Pemilik</TableHead>
                <TableHead>Jenis Ternak</TableHead>
                <TableHead>Diagnosa</TableHead>
                <TableHead>Pengobatan</TableHead>
                <TableHead>Petugas</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredServices.length > 0 ? (
                filteredServices.map((service) => (
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
                    <TableCell className="text-muted-foreground align-top">{service.officerName}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <PawPrint className="h-8 w-8 text-muted-foreground" />
                      <p className="text-muted-foreground">
                        {searchTerm ? "Tidak ada hasil ditemukan." : "Belum ada data pelayanan."}
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

    