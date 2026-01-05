
'use client';

import { useEffect, useState } from 'react';
import { notFound } from 'next/navigation';
import { ServiceForm } from '@/components/service-form';
import { getServiceById } from '@/lib/data';
import type { HealthcareService } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

function EditSkeleton() {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
            <Skeleton className="h-8 w-1/2" />
            <Skeleton className="h-4 w-3/4" />
        </div>
        <div className="space-y-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

export default function EditServicePage({ params }: { params: { id: string } }) {
  const { id } = params;
  const [service, setService] = useState<HealthcareService | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchService() {
      try {
        setLoading(true);
        const fetchedService = await getServiceById(id);
        if (!fetchedService) {
          notFound();
        } else {
          setService(fetchedService);
        }
      } catch (error) {
        console.error('Failed to fetch service:', error);
        notFound();
      } finally {
        setLoading(false);
      }
    }
    fetchService();
  }, [id]);

  return (
    <div className="container py-4 md:py-8">
      <div className="max-w-4xl mx-auto">
        {loading ? (
            <EditSkeleton />
        ) : service ? (
          <>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight font-headline">Edit Pelayanan Kesehatan Hewan</h1>
            <p className="text-muted-foreground mt-2 text-sm md:text-base">
              Perbarui detail pelayanan yang telah diberikan.
            </p>
            <div className="mt-6 md:mt-8">
              <ServiceForm initialData={service} />
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
