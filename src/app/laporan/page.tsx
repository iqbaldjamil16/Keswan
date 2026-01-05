
'use client';

import { useEffect, useState } from "react";
import { ServiceTable } from "@/components/service-table";
import { getServices } from "@/lib/data";
import type { HealthcareService } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";

function ReportSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-10 w-1/3" />
      <div className="rounded-md border">
        <div className="p-4">
            <Skeleton className="h-8 w-full md:w-1/3 ml-auto" />
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


export default function ReportPage() {
  const [services, setServices] = useState<HealthcareService[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadServices() {
      try {
        setLoading(true);
        const fetchedServices = await getServices();
        setServices(fetchedServices);
      } catch (error) {
        console.error("Failed to fetch services:", error);
      } finally {
        setLoading(false);
      }
    }
    loadServices();
  }, []);

  return (
    <div className="container py-4 md:py-8">
      <h1 className="text-2xl md:text-3xl font-bold tracking-tight font-headline">Laporan Pelayanan</h1>
      <p className="text-muted-foreground mt-2 text-sm md:text-base">
        Cari dan lihat semua data pelayanan yang telah diinput.
      </p>
      <div className="mt-6 md:mt-8">
        {loading ? <ReportSkeleton /> : <ServiceTable services={services} />}
      </div>
    </div>
  );
}
