
import { z } from 'zod';

export const vaccinationEntrySchema = z.object({
  jenisVaksin: z.string().min(1, "Jenis vaksin wajib diisi."),
  jenisTernak: z.string().min(1, "Jenis ternak wajib diisi."),
  jumlahTernak: z.coerce.number().min(1, "Jumlah ternak harus minimal 1."),
});


export const serviceSchema = z.object({
  id: z.string().optional(),
  date: z.date({
    required_error: "Wajib diisi.",
  }),
  puskeswan: z.string().min(1, "Wajib diisi."),
  officerName: z.string().min(1, "Wajib diisi."),
  ownerName: z.string().min(1, "Wajib diisi."),
  ownerAddress: z.string().min(1, "Wajib diisi."),
  nik: z.string().optional(),
  phoneNumber: z.string().optional(),
  programVaksinasi: z.string().min(1, "Wajib diisi."),
  livestockCount: z.coerce.number().optional(),
  vaccinations: z.array(vaccinationEntrySchema).min(1, "Minimal satu vaksinasi harus ditambahkan."),
});

export type HealthcareService = z.infer<typeof serviceSchema>;
export type VaccinationEntry = z.infer<typeof vaccinationEntrySchema>;
