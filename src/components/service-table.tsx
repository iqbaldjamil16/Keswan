
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
import { PawPrint, PlusCircle, ChevronDown } from "lucide-react";
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

interface ServiceTableProps {
  services: HealthcareService[];
}

function ServiceCard({ service }: { service: HealthcareService }) {
    const [isOpen, setIsOpen] = useState(false);
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
                            <div className="font-semibold">{service.ownerName}</div>
                            <div className="text-sm text-muted-foreground">{service.ownerAddress}</div>
                            <div className="text-sm text-muted-foreground pt-1">
                                {format(new Date(service.date), "dd MMM yyyy", { locale: id })}
                            </div>
                        </div>
                        <CollapsibleTrigger asChild>
                            <Button variant="ghost" size="sm">
                                <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                                <span className="sr-only">Toggle</span>
                            </Button>
                        </CollapsibleTrigger>
                    </div>
                </CardHeader>
                <CollapsibleContent>
                    <CardContent className="p-4 pt-0 space-y-3">
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
                         <div>
                            <div className="text-xs font-semibold text-muted-foreground">Petugas</div>
                            <p className="text-sm">{service.officerName}</p>
                        </div>
                    </CardContent>
                </CollapsibleContent>
            </Card>
        </Collapsible>
    )
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
      <CardHeader className="p-4 md:p-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <CardTitle>Data Pelayanan</CardTitle>
          <div className="w-full md:w-1/3">
            <Input
              placeholder="Cari semua data..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 md:p-6">
        {/* Mobile View */}
        <div className="md:hidden space-y-4">
            {filteredServices.length > 0 ? (
                filteredServices.map(service => <ServiceCard key={service.id} service={service} />)
            ) : (
                <div className="flex flex-col items-center justify-center gap-2 py-12">
                    <PawPrint className="h-8 w-8 text-muted-foreground" />
                    <p className="text-muted-foreground">
                    {searchTerm ? "Tidak ada hasil ditemukan." : "Belum ada data pelayanan."}
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
