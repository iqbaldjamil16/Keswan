
'use client';

import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { CalendarIcon } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
  } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

const ibFormSchema = z.object({
  inseminationDate: z.date({
    required_error: 'Tanggal IB harus diisi.',
  }),
});

type IbFormValues = z.infer<typeof ibFormSchema>;

export default function IbPage() {
  const { toast } = useToast();
  const form = useForm<IbFormValues>({
    resolver: zodResolver(ibFormSchema),
  });

  function onSubmit(data: IbFormValues) {
    toast({
      title: 'Data Tersimpan',
      description: (
        <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
          <code className="text-white">
            {JSON.stringify({
              inseminationDate: format(data.inseminationDate, 'PPP', { locale: id }),
            }, null, 2)}
          </code>
        </pre>
      ),
    });
  }

  return (
    <div className="container px-3 sm:px-8 py-4 md:py-8">
        <div className="max-w-md mx-auto">
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl md:text-3xl font-bold tracking-tight font-headline">
                        Tanggal Inseminasi Buatan
                    </CardTitle>
                    <CardDescription className="text-muted-foreground pt-2 text-sm md:text-base">
                        Pilih tanggal pelaksanaan Inseminasi Buatan (IB).
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        <FormField
                            control={form.control}
                            name="inseminationDate"
                            render={({ field }) => (
                            <FormItem className="flex flex-col">
                                <FormLabel>Tanggal IB</FormLabel>
                                <Popover>
                                <PopoverTrigger asChild>
                                    <FormControl>
                                    <Button
                                        variant={'outline'}
                                        className={cn(
                                        'w-full pl-3 text-left font-normal',
                                        !field.value && 'text-muted-foreground'
                                        )}
                                    >
                                        {field.value ? (
                                        format(field.value, 'PPP', { locale: id })
                                        ) : (
                                        <span>Pilih tanggal</span>
                                        )}
                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                    </Button>
                                    </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                    mode="single"
                                    selected={field.value}
                                    onSelect={field.onChange}
                                    disabled={(date) =>
                                        date > new Date() || date < new Date('1900-01-01')
                                    }
                                    initialFocus
                                    />
                                </PopoverContent>
                                </Popover>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                        <Button type="submit">Simpan</Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    </div>
  );
}
