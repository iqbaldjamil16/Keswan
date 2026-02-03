
"use client";

import { useTransition, useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, PlusCircle, Trash2 } from "lucide-react";
import { format, parseISO } from "date-fns";
import { id } from 'date-fns/locale';
import { doc, updateDoc, addDoc, collection, Timestamp, Firestore } from 'firebase/firestore';

import { cn } from "@/lib/utils";
import { serviceSchema, type HealthcareService } from "@/lib/types";
import { livestockTypes, puskeswanList, karossaDesaList, budongBudongDesaList, pangaleDesaList, tobadakDesaList, topoyoDesaList, budongBudongOfficerList, karossaOfficerList, pangaleOfficerList, tobadakOfficerList, topoyoOfficerList, caseStatusOptions, priorityOfficerList, prioritySyndromeOptions, priorityDiagnosisOptions, programVaksinasiOptions, vaccineListMap } from "@/lib/definitions";

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


export function ServiceForm({ initialData, formType = 'keswan' }: { initialData?: HealthcareService, formType?: 'keswan' | 'priority' }) {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const { firestore } = useFirebase();
  const router = useRouter();
  const isEditMode = !!initialData;
  
  const [showManualProgramVaksinasi, setShowManualProgramVaksinasi] = useState(
    initialData ? (initialData.programVaksinasi && !programVaksinasiOptions.includes(initialData.programVaksinasi)) : false
  );

  const form = useForm<HealthcareService>({
    resolver: zodResolver(serviceSchema),
    defaultValues: initialData ? {
      ...initialData,
      date: initialData.date ? new Date(initialData.date) : new Date(),
      vaccinations: (initialData.vaccinations && initialData.vaccinations.length > 0)
        ? initialData.vaccinations
        : [{ jenisVaksin: "", jenisTernak: "", jumlahTernak: 1 }],
    } : {
      date: new Date(),
      puskeswan: "",
      officerName: "",
      ownerName: "",
      ownerAddress: "",
      nik: "",
      phoneNumber: "",
      programVaksinasi: "",
      vaccinations: [{ jenisVaksin: "", jenisTernak: "", jumlahTernak: 1 }],
    },
  });

  const [manualJenisVaksin, setManualJenisVaksin] = useState<Record<string, boolean>>({});
  
  const { fields: vaccinationFields, append: appendVaccination, remove: removeVaccination } = useFieldArray({
    control: form.control,
    name: "vaccinations",
  });

    const isInitialized = useRef(false);
    useEffect(() => {
        if (isEditMode && initialData?.vaccinations && !isInitialized.current) {
            const program = initialData.programVaksinasi;
            const vaccineList = vaccineListMap[program] || [];
            const initialManualState: Record<string, boolean> = {};

            vaccinationFields.forEach((field, index) => {
                const value = initialData.vaccinations![index].jenisVaksin;
                if (!vaccineList.length || (value && !vaccineList.includes(value))) {
                    initialManualState[field.id] = true;
                }
            });
            setManualJenisVaksin(initialManualState);
            isInitialized.current = true;
        }
    }, [isEditMode, initialData, vaccinationFields]);

  const watchedPuskeswan = form.watch("puskeswan");
  const watchedProgramVaksinasi = form.watch("programVaksinasi");

  const officerListMap: Record<string, string[]> = {
    'Puskeswan Budong-Budong': budongBudongOfficerList,
    'Puskeswan Karossa': karossaOfficerList,
    'Puskeswan Pangale': pangaleOfficerList,
    'Puskeswan Tobadak': tobadakOfficerList,
    'Puskeswan Topoyo': topoyoOfficerList,
  };
  const officerList = officerListMap[watchedPuskeswan] || [];
  const isOfficerSelection = officerList.length > 0;

  const [showManualOfficerName, setShowManualOfficerName] = useState(
    initialData ? isOfficerSelection && !officerList.includes(initialData.officerName) : false
  );

  const desaListMap: Record<string, string[]> = {
    'Puskeswan Karossa': karossaDesaList,
    'Puskeswan Budong-Budong': budongBudongDesaList,
    'Puskeswan Pangale': pangaleDesaList,
    'Puskeswan Tobadak': tobadakDesaList,
    'Puskeswan Topoyo': topoyoDesaList,
  };
  const desaList = desaListMap[watchedPuskeswan] || [];
  const isDesaSelection = desaList.length > 0;
  
  const watchedOwnerAddress = form.watch('ownerAddress');
  const [showManualOwnerAddress, setShowManualOwnerAddress] = useState(
    initialData ? isDesaSelection && !desaList.includes(initialData.ownerAddress) : false
  );

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
        const { id, ...dataToSave } = values;
        
        const calculatedLivestockCount = values.vaccinations.reduce((sum, vax) => sum + (vax.jumlahTernak || 0), 0);

        const serviceData = {
          ...dataToSave,
          date: Timestamp.fromDate(values.date),
          livestockCount: calculatedLivestockCount,
        };


        if (isEditMode && initialData?.id) {
            const serviceDocRef = doc(firestore, 'healthcareServices', initialData.id);
            await updateDoc(serviceDocRef, serviceData);
            toast({
              title: "Sukses",
              description: "Data pelayanan berhasil diperbarui!",
            });
            router.push('/laporan');
        } else {
            const servicesCollection = collection(firestore, 'healthcareServices');
            const newDocRef = await addDoc(servicesCollection, serviceData);
            
            // Store new ID in localStorage
            const newEntries = JSON.parse(localStorage.getItem('newEntries') || '[]');
            newEntries.push({ id: newDocRef.id, timestamp: Date.now() });
            localStorage.setItem('newEntries', JSON.stringify(newEntries));

            toast({
                title: "Sukses",
                description: "Data pelayanan berhasil disimpan!",
            });
            router.push('/laporan');
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
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
                          className="w-full"
                          value={field.value instanceof Date ? format(field.value, 'yyyy-MM-dd') : ''}
                          onChange={(e) => {
                            const dateValue = e.target.value;
                            if (dateValue) {
                              field.onChange(parseISO(dateValue));
                            } else {
                              field.onChange(null);
                            }
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
                  name="puskeswan"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Puskeswan</FormLabel>
                      <Select
                        onValueChange={(value) => {
                          field.onChange(value);
                          form.setValue('ownerAddress', ''); 
                          setShowManualOwnerAddress(false);
                          form.setValue('officerName', '');
                          setShowManualOfficerName(false);
                        }}
                        defaultValue={field.value}
                        value={field.value}
                      >
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
                  name="officerName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nama Petugas</FormLabel>
                      {formType === 'priority' ? (
                        <Select
                            onValueChange={field.onChange}
                            value={field.value}
                        >
                            <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Pilih Nama Petugas" />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                {priorityOfficerList.map((officer) => (
                                    <SelectItem key={officer} value={officer}>{officer}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                      ) : (
                        <>
                          {isOfficerSelection && !showManualOfficerName ? (
                            <Select
                              onValueChange={(value) => {
                                if (value === 'Lainnya') {
                                  setShowManualOfficerName(true);
                                  field.onChange('');
                                } else {
                                  field.onChange(value);
                                }
                              }}
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Pilih Nama Petugas" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {officerList.map((officer) => (
                                  <SelectItem key={officer} value={officer}>{officer}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          ) : (
                            <FormControl>
                              <Input 
                                placeholder="Nama Petugas" 
                                {...field} 
                                value={(showManualOfficerName && field.value === 'Lainnya') ? '' : field.value}
                              />
                            </FormControl>
                          )}
                        </>
                      )}
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
                      {(isDesaSelection && !showManualOwnerAddress) ? (
                        <Select 
                            onValueChange={(value) => {
                                if (value === 'Lainnya') {
                                    setShowManualOwnerAddress(true);
                                    field.onChange('');
                                } else {
                                    field.onChange(value);
                                }
                            }}
                            value={field.value}
                        >
                            <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Pilih Desa" />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                {desaList.map((desa) => (
                                    <SelectItem key={desa} value={desa}>{desa}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                      ) : (
                        <FormControl>
                            <Input 
                                placeholder="Alamat Desa, Contoh : Salopangkang" 
                                {...field}
                                value={(showManualOwnerAddress && field.value === 'Lainnya') ? '' : field.value}
                             />
                        </FormControl>
                      )}
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
                  name="nik"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>NIK KTP</FormLabel>
                      <FormControl>
                        <Input placeholder="Masukkan NIK" {...field} value={field.value ?? ''} />
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
                  name="phoneNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>No. Hp</FormLabel>
                      <FormControl>
                        <Input placeholder="Masukkan No. Hp" {...field} value={field.value ?? ''} />
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
                        name="programVaksinasi"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Program Vaksinasi</FormLabel>
                            {showManualProgramVaksinasi ? (
                                <FormControl>
                                    <Input 
                                        placeholder="Masukkan Program Vaksinasi"
                                        {...field}
                                    />
                                </FormControl>
                            ) : (
                                <Select 
                                    onValueChange={(value) => {
                                        if (value === 'Lainnya') {
                                            setShowManualProgramVaksinasi(true);
                                            field.onChange('');
                                        } else {
                                            field.onChange(value);
                                        }
                                        vaccinationFields.forEach((item, index) => {
                                            form.setValue(`vaccinations.${index}.jenisVaksin`, '');
                                        });
                                        setManualJenisVaksin({});
                                    }} 
                                    value={field.value}
                                >
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Pilih Program Vaksinasi" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {programVaksinasiOptions.map((program) => (
                                            <SelectItem key={program} value={program}>{program}</SelectItem>
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
          </div>

          <div className="space-y-4 md:space-y-6">
            <Card>
              <CardContent className="p-4">
                  <div className="space-y-4">
                      <div>
                          <Label>Vaksinasi</Label>
                      </div>
                      {vaccinationFields.map((item, index) => {
                        const vaccineList = vaccineListMap[watchedProgramVaksinasi] || [];
                        const programHasList = vaccineList.length > 0;
                        const isManual = manualJenisVaksin[item.id] ?? !programHasList;

                        return (
                          <Card key={item.id} className="relative p-4 bg-card">
                              {vaccinationFields.length > 1 && (
                                  <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      className="absolute -top-1 -right-1 h-6 w-6"
                                      onClick={() => removeVaccination(index)}
                                  >
                                      <Trash2 className="h-4 w-4 text-destructive" />
                                  </Button>
                              )}
                              <div className="space-y-4">
                                  <FormField
                                      control={form.control}
                                      name={`vaccinations.${index}.jenisVaksin`}
                                      render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Jenis Vaksin</FormLabel>
                                            {programHasList && !isManual ? (
                                                <Select
                                                    onValueChange={(value) => {
                                                        if (value === 'Lainnya') {
                                                            setManualJenisVaksin(s => ({ ...s, [item.id]: true }));
                                                            field.onChange('');
                                                        } else {
                                                            field.onChange(value);
                                                        }
                                                    }}
                                                    value={field.value}
                                                >
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Pilih Jenis Vaksin" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {vaccineList.map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
                                                    </SelectContent>
                                                </Select>
                                            ) : (
                                                <FormControl>
                                                    <Input placeholder="Contoh: PMK" {...field} />
                                                </FormControl>
                                            )}
                                            <FormMessage />
                                        </FormItem>
                                      )}
                                  />
                                  <FormField
                                      control={form.control}
                                      name={`vaccinations.${index}.jenisTernak`}
                                      render={({ field }) => (
                                          <FormItem>
                                              <FormLabel>Jenis Ternak</FormLabel>
                                              <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                                      name={`vaccinations.${index}.jumlahTernak`}
                                      render={({ field }) => (
                                          <FormItem>
                                              <FormLabel>Jumlah Ternak</FormLabel>
                                              <FormControl>
                                                  <Input type="number" placeholder="Jumlah" {...field} onChange={e => field.onChange(e.target.value === '' ? '' : Number(e.target.value))} />
                                              </FormControl>
                                              <FormMessage />
                                          </FormItem>
                                      )}
                                  />
                              </div>
                          </Card>
                        )
                      })}
                      <div className="flex justify-start">
                          <Button
                              type="button"
                              variant="default"
                              size="sm"
                              className="bg-accent text-accent-foreground hover:bg-accent/90"
                              onClick={() => appendVaccination({ jenisVaksin: "", jenisTernak: "", jumlahTernak: 1 }, { shouldFocus: false })}
                          >
                              <PlusCircle className="mr-2 h-4 w-4" />
                              Tambah
                          </Button>
                      </div>
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
