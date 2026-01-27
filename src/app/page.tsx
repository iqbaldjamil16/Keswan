
import { ServiceForm } from "@/components/service-form";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Star } from "lucide-react";

export default function Home() {
  return (
    <div className="container px-3 sm:px-8 py-4 md:py-8">
      <div className="max-w-4xl mx-auto">
        <Tabs defaultValue="keswan" className="w-full">
            <Card>
                <CardContent className="p-4 sm:p-6">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="keswan">
                            <FileText className="mr-2 h-4 w-4" />
                            Lap. Keswan
                        </TabsTrigger>
                        <TabsTrigger value="prioritas">
                            <Star className="mr-2 h-4 w-4" />
                            Lap. Prioritas
                        </TabsTrigger>
                    </TabsList>
                </CardContent>
            </Card>

            <TabsContent value="keswan" className="mt-6 md:mt-8">
                <Card>
                <CardHeader>
                    <CardTitle className="text-2xl md:text-3xl font-bold tracking-tight font-headline">Pelayanan Kesehatan Hewan</CardTitle>
                    <CardDescription className="text-muted-foreground pt-2 text-sm md:text-base">
                    Input detail pelayanan yang telah dilakukan
                    </CardDescription>
                    <div>
                        <a href="https://keswan-pearl.vercel.app/" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 italic underline text-sm">
                            https://keswan-pearl.vercel.app/
                        </a>
                    </div>
                </CardHeader>
                </Card>
                <div className="mt-6 md:mt-8">
                <ServiceForm formType="keswan" />
                </div>
            </TabsContent>
            <TabsContent value="prioritas" className="mt-6 md:mt-8">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-2xl md:text-3xl font-bold tracking-tight font-headline">Laporan Prioritas</CardTitle>
                        <CardDescription className="text-muted-foreground pt-2 text-sm md:text-base">
                            Input detail laporan prioritas.
                        </CardDescription>
                    </CardHeader>
                </Card>
                <div className="mt-6 md:mt-8">
                    <ServiceForm formType="priority" />
                </div>
            </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
