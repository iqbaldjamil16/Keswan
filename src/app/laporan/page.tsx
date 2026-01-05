
'use client';

import { useEffect, useState, useMemo } from "react";
import { ServiceTable } from "@/components/service-table";
import { getServices } from "@/lib/data";
import type { HealthcareService } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { getMonth, getYear, subYears } from "date-fns";
import { id } from 'date-fns/locale';

function ReportSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-10 w-1/3" />
      <div className="rounded-md border">
        <div className="p-4 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex gap-2 w-full md:w-auto">
                <Skeleton className="h-10 w-full sm:w-[180px]" />
                <Skeleton className="h-10 w-full sm:w-[120px]" />
            </div>
            <Skeleton className="h-10 w-full md:w-1/3 ml-auto" />
        </div>
        <div className="p-4 space-y-4 md:hidden">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
        </div>
        <div className="hidden md:block p-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full mt-2" />
            <Skeleton className="h-12 w-full mt-2" />
            <Skeleton className="h-12 w-full mt-2" />
        </div>
      </div>
    </div>
  )
}

const years = Array.from({ length: 5 }, (_, i) => getYear(subYears(new Date(), i)).toString());
const months = Array.from({ length: 12 }, (_, i) => ({
    value: i.toString(),
    label: new Date(0, i).toLocaleString(id, { month: 'long' }),
}));

export default function ReportPage() {
  const [allServices, setAllServices] = useState<HealthcareService[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(getMonth(new Date()).toString());
  const [selectedYear, setSelectedYear] = useState(getYear(new Date()).toString());

  useEffect(() => {
    async function loadServices() {
      try {
        setLoading(true);
        const fetchedServices = await getServices();
        setAllServices(fetchedServices);
      } catch (error) {
        console.error("Failed to fetch services:", error);
      } finally {
        setLoading(false);
      }
    }
    loadServices();
  }, []);

  const filteredServices = useMemo(() => {
    if (!allServices) return [];
    return allServices.filter(service => {
        const serviceDate = new Date(service.date);
        return getMonth(serviceDate).toString() === selectedMonth && getYear(serviceDate).toString() === selectedYear;
    });
}, [allServices, selectedMonth, selectedYear]);

  return (
    <div className="container py-4 md:py-8">
      <h1 className="text-2xl md:text-3xl font-bold tracking-tight font-headline">Laporan Pelayanan</h1>
      <p className="text-muted-foreground mt-2 text-sm md:text-base">
        Cari dan lihat semua data pelayanan yang telah diinput.
      </p>
      <div className="mt-6 md:mt-8">
        {loading ? <ReportSkeleton /> : (
            <ServiceTable
                services={filteredServices}
                selectedMonth={selectedMonth}
                selectedYear={selectedYear}
                onMonthChange={setSelectedMonth}
                onYearChange={setSelectedYear}
                months={months}
                years={years}
             />
        )}
      </div>
    </div>
  );
}
