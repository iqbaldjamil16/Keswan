
"use client";

import { useTransition } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, PlusCircle, Trash2 } from "lucide-react";
import { format } from "date-fns";

import { cn } from "@/lib/utils";
import { serviceSchema, type HealthcareService } from "@/lib/types";
import { createService } from "@/lib/actions";
import { medicineData, medicineTypes, type MedicineType, livestockTypes, puskeswanList, addService } from "@/lib/data";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import { useFirebase } from "@/firebase";


export function ServiceForm() {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const { firestore } = useFirebase();

  const form = useForm<HealthcareService>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      date: new Date(),
      puskeswan: "",
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
      treatments: [{ medicineType: "", medicineName: "", dosage: "" }],
    },
  });
  
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "treatments",
  });

  const watchedTreatments = form.watch("treatments");

  function onSubmit(values: HealthcareService) {
    if (!firestore) {
        toast({
          variant: "destructive",
          title: "Gagal Menyimpan",
          description: "Koneksi database tidak tersedia.",
        });
        return;
    }

    startTransition(async () => {
      try {
        await addService(firestore, values);
        
        const result = await createService(values);

        if (result.success) {
          toast({
            title: "Sukses",
            description: result.success,
          });
          form.reset({
              date: new Date(),
              puskeswan: "",
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
              treatments: [{ medicineType: "", medicineName: "", dosage: "" }],
          });
        } else if (result.error) {
           toast({
            variant: "destructive",
            title: "Gagal Validasi",
            description: result.error,
          });
        }
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Gagal Menyimpan",
          description: "Terjadi kesalahan saat menyimpan data ke database.",
        });
      }
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 md:space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <div className="space-y-4 md:space-y-6">
            <Card>
              <CardContent className="p-4">
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tanggal Pelayanan</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          value={format(field.value, 'yyyy-MM-dd')}
                          onChange={(e) => {
                            const date = new Date(e.target.value);
                            const userTimezoneOffset = date.getTimezoneOffset() * 60000;
                            field.onChange(new Date(date.getTime() + userTimezoneOffset));
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
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
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <FormField
                  control={form.control}
                  name="puskeswan"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Puskeswan</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih Puskeswan" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {puskeswanList.map((puskeswan) => (
                            <SelectItem key={puskeswan} value={puskeswan}>{puskeswan}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
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
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
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
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
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
              </CardContent>
            </Card>
            <Card>
                <CardContent className="p-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="livestockType"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Jenis Ternak</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                            <FormControl>
                                <SelectTrigger>
                                <SelectValue placeholder="Pilih Jenis Ternak" />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                {livestockTypes.map((type) => (
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
                </CardContent>
            </Card>
          </div>

          <div className="space-y-4 md:space-y-6">
            <Card>
              <CardContent className="p-4">
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
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
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
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
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
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
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
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Pengobatan</Label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => append({ medicineType: "", medicineName: "", dosage: "" })}
                    >
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Tambah
                    </Button>
                  </div>

                  {fields.map((item, index) => {
                    const selectedMedicineType = watchedTreatments?.[index]?.medicineType as MedicineType;
                    return (
                      <div key={item.id} className="p-4 border rounded-md relative bg-background/50">
                        {fields.length > 1 && (
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="absolute -top-3 -right-3 h-6 w-6 bg-card"
                                onClick={() => remove(index)}
                            >
                                <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                        )}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <FormField
                              control={form.control}
                              name={`treatments.${index}.medicineType`}
                              render={({ field }) => (
                              <FormItem>
                                  <FormLabel>Jenis Obat</FormLabel>
                                  <Select
                                  onValueChange={(value) => {
                                      field.onChange(value);
                                      form.setValue(`treatments.${index}.medicineName`, '');
                                  }}
                                  defaultValue={field.value}
                                  >
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
                              name={`treatments.${index}.medicineName`}
                              render={({ field }) => (
                              <FormItem>
                                  <FormLabel>Nama Obat</FormLabel>
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
                              name={`treatments.${index}.dosage`}
                              render={({ field }) => (
                              <FormItem>
                                  <FormLabel>Dosis</FormLabel>
                                  <FormControl>
                                  <Input placeholder="cth: 10ml" {...field} />
                                  </FormControl>
                                  <FormMessage />
                              </FormItem>
                              )}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        <div className="flex justify-end">
          <Button type="submit" disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Simpan Data
          </Button>
        </div>
      </form>
    </Form>
  );
}

    
    
