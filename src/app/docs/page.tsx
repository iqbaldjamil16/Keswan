
'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { CornerUpLeft } from 'lucide-react';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

const docFormSchema = z.object({
  officerName: z.string().min(1, 'Nama petugas harus diisi.'),
  servicePhoto: z.any().optional(),
});

type DocFormValues = z.infer<typeof docFormSchema>;

const officerList = ['drh. Iqbal Djamil'];

export default function DocsPage() {
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<DocFormValues>({
    resolver: zodResolver(docFormSchema),
    defaultValues: {
      officerName: '',
    },
  });

  function onSubmit(data: DocFormValues) {
    console.log(data);
    toast({
      title: 'Informasi Terkirim',
      description: 'Data telah dicatat (simulasi).',
    });
  }

  return (
    <div className="container px-4 sm:px-8 py-4 md:py-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl md:text-3xl font-bold tracking-tight font-headline">
              Dokumentasi Aplikasi
            </CardTitle>
            <CardDescription className="text-muted-foreground pt-2 text-sm md:text-base">
              Panduan penggunaan dan informasi mengenai aplikasi Manajemen Pelayanan Kesehatan Hewan.
            </CardDescription>
          </CardHeader>
          <CardContent>
            
          </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>Form Tambahan</CardTitle>
                <CardDescription>Kolom isian sesuai permintaan.</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                            control={form.control}
                            name="officerName"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Nama Petugas</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih Nama Petugas" />
                                    </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                    {officerList.map((officer) => (
                                        <SelectItem key={officer} value={officer}>
                                        {officer}
                                        </SelectItem>
                                    ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="servicePhoto"
                            render={({ field: { onChange, onBlur, name, ref } }) => (
                                <FormItem>
                                <FormLabel>Upload Foto Pelayanan</FormLabel>
                                <FormControl>
                                    <Input 
                                      type="file" 
                                      accept="image/*"
                                      name={name}
                                      ref={ref}
                                      onBlur={onBlur}
                                      onChange={(e) => onChange(e.target.files?.[0])}
                                    />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />

                        <Button type="submit">Kirim</Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
      </div>
      <Button
        variant="default"
        className="fixed bottom-6 left-6 h-14 w-14 rounded-full shadow-lg"
        aria-label="Kembali ke halaman utama"
        onClick={() => router.push('/')}
      >
        <CornerUpLeft className="h-7 w-7" />
      </Button>
    </div>
  );
}
