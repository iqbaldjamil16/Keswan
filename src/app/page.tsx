
import { ServiceForm } from "@/components/service-form";

export default function Home() {
  return (
    <div className="container py-4 md:py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight font-headline">Pelayanan Kesehatan Hewan</h1>
        <p className="text-muted-foreground mt-2 text-sm md:text-base">
          Input detail pelayanan yang telah dilakukan
        </p>
        <div className="mt-6 md:mt-8">
          <ServiceForm />
        </div>
      </div>
    </div>
  );
}
