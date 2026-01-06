
import { ServiceForm } from "@/components/service-form";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="container px-4 sm:px-8 py-4 md:py-8">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl md:text-3xl font-bold tracking-tight font-headline">Pelayanan Kesehatan Hewan</CardTitle>
            <CardDescription className="text-muted-foreground pt-2 text-sm md:text-base">
              Input detail pelayanan yang telah dilakukan
            </CardDescription>
          </CardHeader>
        </Card>
        <div className="mt-6 md:mt-8">
          <ServiceForm />
        </div>
      </div>
    </div>
  );
}
