
"use client";

import { useTransition, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarIcon, Loader2 } from "lucide-react";
import { format } from "date-fns";

import { cn } from "@/lib/utils";
import { serviceSchema, type HealthcareService } from "@/lib/types";
import { createService } from "@/lib/actions";
import { medicineData, medicineTypes, type MedicineType } from "@/lib/data";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";

export function ServiceForm() {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const form = useForm<HealthcareService>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      date: new Date(),
      officerName: "",
      ownerName: "",
      ownerAddress: "",
      caseId: "",
      livestockType: "",
      livestockCount: 1,
      clinicalSymptoms: "",
      diagnosis: "",
      handling: "",
      treatmentType: "",
      medicineType: "",
      medicineName: "",
      dosage: "",
    },
  });

  const selectedMedicineType = form.watch("medicineType") as MedicineType;

  function onSubmit(values: HealthcareService) {
    // The 'treatment' field is no longer in the form, so we can construct it
    // before sending if needed by the backend, or adjust the backend.
    // For now, we remove it from submission.
    const { ...submissionData } = values;

    startTransition(async () => {
      const result = await createService(submissionData);
      if (result.success) {
        toast({
          title: "Sukses",
          description: result.success,
        });
        form.reset();
      } else if (result.error) {
        toast({
          variant: "destructive",
          title: "Gagal Menyimpan",
          description: result.error,
        });
      }
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-6">
                <FormField
                  control={form.control}
                  name="ownerName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nama Pemilik</FormLabel>
                      <FormControl>
                        <Input placeholder="Contoh: Budi" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="ownerAddress"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Alamat Pemilik</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Alamat lengkap pemilik ternak" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="livestockType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Jenis Ternak</FormLabel>
                        <FormControl>
                          <Input placeholder="Sapi, Kambing, Ayam" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="livestockCount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Jumlah</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="clinicalSymptoms"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gejala Klinis</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Gejala yang teramati pada ternak" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="diagnosis"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Diagnosa</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Diagnosa penyakit" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-6">
                 <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Tanggal Pelayanan</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
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
                              date > new Date() || date < new Date("1900-01-01")
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="officerName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nama Petugas</FormLabel>
                      <FormControl>
                        <Input placeholder="Nama lengkap petugas" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="caseId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ID Kasus iSIKHNAS (Opsional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Contoh: ISIKHNAS-2024-001" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="handling"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Penanganan</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Tindakan yang dilakukan" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="treatmentType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Jenis Pengobatan</FormLabel>
                      <FormControl>
                        <Input placeholder="Injeksi, Oral, Topikal" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="space-y-2">
                    <Label>Pengobatan</Label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 border rounded-md">
                    <FormField
                        control={form.control}
                        name="medicineType"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-xs">Jenis Obat</FormLabel>
                            <Select onValueChange={(value) => {
                                field.onChange(value)
                                form.setValue('medicineName', '');
                            }} defaultValue={field.value}>
                            <FormControl>
                                <SelectTrigger>
                                <SelectValue placeholder="Pilih Jenis" />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                {medicineTypes.map((type) => (
                                <SelectItem key={type} value={type}>{type}</SelectItem>
                                ))}
                            </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="medicineName"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-xs">Nama Obat</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value} disabled={!selectedMedicineType}>
                            <FormControl>
                                <SelectTrigger>
                                <SelectValue placeholder="Pilih Obat" />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                {selectedMedicineType && medicineData[selectedMedicineType] && medicineData[selectedMedicineType].length > 0 ? (
                                    medicineData[selectedMedicineType].map((drug) => (
                                        <SelectItem key={drug} value={drug}>{drug}</SelectItem>
                                    ))
                                ) : (
                                    <SelectItem value="-" disabled>Pilih jenis dahulu</SelectItem>
                                )}
                            </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="dosage"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-xs">Dosis</FormLabel>
                            <FormControl>
                            <Input placeholder="cth: 10ml" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    </div>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end p-6">
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Simpan Data
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
}
