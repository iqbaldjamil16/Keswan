
import { ServiceForm } from "@/components/service-form";

export default function Home() {
  return (
    <div className="container py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold tracking-tight text-center md:text-left font-headline">Input Pelayanan Kesehatan Hewan</h1>
        <p className="text-muted-foreground mt-2 text-center md:text-left">
          Masukkan detail pelayanan yang telah diberikan.
        </p>
        <div className="mt-8">
          <ServiceForm />
        </div>
      </div>
    </div>
  );
}
