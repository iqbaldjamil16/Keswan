
"use client";

import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, PlusCircle, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { doc, updateDoc, addDoc, collection, Timestamp, Firestore } from 'firebase/firestore';

import { cn } from "@/lib/utils";
import { serviceSchema, type HealthcareService } from "@/lib/types";
import { medicineData, medicineTypes, type MedicineType, livestockTypes, puskeswanList, treatmentTypes, dosageUnits } from "@/lib/definitions";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Form,
  FormControl,
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


export function ServiceForm({ initialData }: { initialData?: HealthcareService }) {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const { firestore } = useFirebase();
  const router = useRouter();
  const isEditMode = !!initialData;
  const [showManualTreatmentType, setShowManualTreatmentType] = useState(
    initialData ? !treatmentTypes.includes(initialData.treatmentType) : false
  );
  const [showManualLivestockType, setShowManualLivestockType] = useState(
    initialData ? !livestockTypes.includes(initialData.livestockType) : false
  );

  const form = useForm<HealthcareService>({
    resolver: zodResolver(serviceSchema),
    defaultValues: initialData ? {
      ...initialData,
      date: initialData.date ? new Date(initialData.date) : new Date(),
    } : {
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
      treatmentType: "",
      treatments: [{ medicineType: "", medicineName: "", dosageValue: undefined, dosageUnit: "" }],
    },
  });
  
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "treatments",
  });

  const watchedTreatments = form.watch("treatments");

  async function onSubmit(values: HealthcareService) {
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
        const serviceData = {
          ...values,
          date: Timestamp.fromDate(values.date),
        };

        if (isEditMode && initialData?.id) {
            const serviceDocRef = doc(firestore, 'healthcareServices', initialData.id);
            await updateDoc(serviceDocRef, serviceData);
            toast({
              title: "Sukses",
              description: "Data pelayanan berhasil diperbarui!",
            });
            router.push('/laporan');
            router.refresh();
        } else {
            const servicesCollection = collection(firestore, 'healthcareServices');
            await addDoc(servicesCollection, serviceData);
            toast({
                title: "Sukses",
                description: "Data pelayanan berhasil disimpan!",
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
                treatmentType: "",
                treatments: [{ medicineType: "", medicineName: "", dosageValue: undefined, dosageUnit: "" }],
            });
            setShowManualTreatmentType(false);
            setShowManualLivestockType(false);
             router.refresh();
        }
      } catch (error: any) {
        console.error("Submit error:", error);
        toast({
          variant: "destructive",
          title: "Gagal Menyimpan",
          description: error.message || "Terjadi kesalahan saat menyimpan data.",
        });
      }
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                          value={format(new Date(field.value), 'yyyy-MM-dd')}
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
                        <Input placeholder="Alamat lengkap pemilik ternak" {...field} />
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
                        <Input placeholder="contoh : 53144622" {...field} />
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
                            {showManualLivestockType ? (
                              <FormControl>
                                <Input 
                                  placeholder="Masukkan jenis ternak"
                                  {...field}
                                />
                              </FormControl>
                            ) : (
                              <Select 
                                onValueChange={(value) => {
                                  if (value === 'Lainnya') {
                                    setShowManualLivestockType(true);
                                    field.onChange('');
                                  } else {
                                    field.onChange(value);
                                  }
                                }} 
                                value={field.value}
                              >
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
                            )}
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
                            <Input type="number" {...field} onChange={e => field.onChange(e.target.value === '' ? '' : Number(e.target.value))} />
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
                        <Textarea placeholder="Diagnosa penyakit" {...field} className="min-h-[60px]" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 space-y-2">
                <FormField
                  control={form.control}
                  name="treatmentType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Jenis Penanganan</FormLabel>
                      {showManualTreatmentType ? (
                        <FormControl>
                          <Input
                            placeholder="Masukkan jenis penanganan"
                            {...field}
                          />
                        </FormControl>
                      ) : (
                        <Select
                          onValueChange={(value) => {
                            if (value === 'Lainnya') {
                              setShowManualTreatmentType(true);
                              field.onChange('');
                            } else {
                              field.onChange(value);
                            }
                          }}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Pilih Jenis Penanganan" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {treatmentTypes.map((type) => (
                              <SelectItem key={type} value={type}>
                                {type}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
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
                      variant="default"
                      size="sm"
                      className="bg-accent text-accent-foreground hover:bg-accent/90"
                      onClick={() => append({ medicineType: "", medicineName: "", dosageValue: undefined, dosageUnit: "" })}
                    >
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Tambah
                    </Button>
                  </div>

                  {fields.map((item, index) => {
                    const selectedMedicineType = watchedTreatments?.[index]?.medicineType as MedicineType;
                    const medicineNameValue = form.watch(`treatments.${index}.medicineName`);
                    const isManualMedicineName = medicineNameValue === 'Lainnya';
                    const dosageUnitValue = form.watch(`treatments.${index}.dosageUnit`);
                    const isManualDosageUnit = dosageUnitValue === 'Lainnya';

                    const isMedicineTypeLainnya = selectedMedicineType === 'Lainnya';

                    return (
                      <Card key={item.id} className="relative p-4 bg-card">
                         {fields.length > 1 && (
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="absolute -top-1 -right-1 h-6 w-6"
                                onClick={() => remove(index)}
                            >
                                <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                        )}
                        <div className="space-y-4">
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
                                {isMedicineTypeLainnya || isManualMedicineName ? (
                                   <FormControl>
                                      <Input
                                        placeholder="Masukkan nama obat"
                                        {...field}
                                        value={field.value === 'Lainnya' ? '' : field.value}
                                        onChange={(e) => field.onChange(e.target.value)}
                                      />
                                    </FormControl>
                                ) : (
                                  <Select
                                    onValueChange={(value) => {
                                      field.onChange(value);
                                    }}
                                    value={field.value}
                                    disabled={!selectedMedicineType}
                                  >
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Pilih Obat" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      {selectedMedicineType && medicineData[selectedMedicineType] ? (
                                        medicineData[selectedMedicineType].map((drug) => (
                                          <SelectItem key={drug} value={drug}>
                                            {drug}
                                          </SelectItem>
                                        ))
                                      ) : (
                                        <SelectItem value="-" disabled>
                                          Pilih jenis dahulu
                                        </SelectItem>
                                      )}
                                    </SelectContent>
                                  </Select>
                                )}
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <div className="space-y-2">
                            <FormLabel>Dosis</FormLabel>
                            <div className="grid grid-cols-2 gap-2">
                              <FormField
                                  control={form.control}
                                  name={`treatments.${index}.dosageValue`}
                                  render={({ field }) => (
                                  <FormItem>
                                      <FormControl>
                                        <Input type="number" placeholder="Jumlah" {...field} onChange={e => field.onChange(e.target.value === '' ? '' : Number(e.target.value))} />
                                      </FormControl>
                                      <FormMessage />
                                  </FormItem>
                                  )}
                              />
                               <FormField
                                control={form.control}
                                name={`treatments.${index}.dosageUnit`}
                                render={({ field }) => (
                                  <FormItem>
                                    {isManualDosageUnit ? (
                                       <FormControl>
                                          <Input
                                            placeholder="Satuan"
                                            {...field}
                                            value={field.value === 'Lainnya' ? '' : field.value}
                                            onChange={(e) => field.onChange(e.target.value)}
                                          />
                                        </FormControl>
                                    ) : (
                                      <Select
                                        onValueChange={(value) => {
                                          if (value === 'Lainnya') {
                                            field.onChange('Lainnya');
                                          } else {
                                            field.onChange(value);
                                          }
                                        }}
                                        value={field.value}
                                      >
                                        <FormControl>
                                          <SelectTrigger>
                                            <SelectValue placeholder="Satuan" />
                                          </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                          {dosageUnits.map((unit) => (
                                            <SelectItem key={unit} value={unit}>
                                              {unit}
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                    )}
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                          </div>
                        </div>
                      </Card>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        <div className="flex justify-start md:justify-end">
          <Button type="submit" disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEditMode ? 'Simpan Perubahan' : 'Simpan Data'}
          </Button>
        </div>
      </form>
    </Form>
  );
}


    