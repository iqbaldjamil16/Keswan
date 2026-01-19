
import { z } from 'zod';

export const treatmentSchema = z.object({
  medicineType: z.string().min(1, "Wajib diisi."),
  medicineName: z.string().min(1, "Wajib diisi."),
  dosageValue: z.coerce.number().gt(0, "Dosis harus lebih dari 0."),
  dosageUnit: z.string().min(1, "Wajib diisi."),
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
  caseId: z.string().optional().default(''),
  livestockType: z.string().min(1, "Wajib diisi."),
  livestockCount: z.coerce.number().min(1, "Jumlah ternak harus minimal 1."),
  clinicalSymptoms: z.string().min(1, "Wajib diisi."),
  diagnosis: z.string().min(1, "Wajib diisi."),
  treatmentType: z.string().min(1, "Wajib diisi."),
  treatments: z.array(treatmentSchema).min(1, "Minimal satu pengobatan harus ditambahkan."),
});

export type HealthcareService = z.infer<typeof serviceSchema>;
export type Treatment = z.infer<typeof treatmentSchema>;

    
