
import { ServiceForm } from "@/components/service-form";
import { getServiceById } from "@/lib/data";
import { notFound } from "next/navigation";

export default async function EditServicePage({ params }: { params: { id: string } }) {
  const id = params.id;
  const service = await getServiceById(id);

  if (!service) {
    notFound();
  }

  return (
    <div className="container py-4 md:py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight font-headline">Edit Pelayanan Kesehatan Hewan</h1>
        <p className="text-muted-foreground mt-2 text-sm md:text-base">
          Perbarui detail pelayanan yang telah diberikan.
        </p>
        <div className="mt-6 md:mt-8">
          <ServiceForm initialData={service} />
        </div>
      </div>
    </div>
  );
}
