import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function RekapPage() {
  return (
    <div className="container py-4 md:py-8">
       <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-center md:text-left font-headline">Rekap Obat dan Kasus</h1>
        <p className="text-muted-foreground mt-2 text-center md:text-left text-sm md:text-base">
          Ringkasan penggunaan obat dan kasus yang ditangani.
        </p>
        <div className="mt-6 md:mt-8">
            <Card>
                <CardHeader>
                    <CardTitle>Dalam Pengembangan</CardTitle>
                    <CardDescription>
                        Fitur ini sedang dalam tahap pengembangan dan akan segera tersedia.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <p>
                        Halaman ini akan menampilkan rekapitulasi data penggunaan obat dan jumlah kasus penyakit yang telah diinput.
                    </p>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
