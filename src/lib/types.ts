
import { z } from 'zod';

export const treatmentSchema = z.object({
  medicineType: z.string().min(1, "Jenis obat harus dipilih."),
  medicineName: z.string().min(1, "Nama obat harus dipilih."),
  dosage: z.string().min(1, "Dosis harus diisi."),
});

export const serviceSchema = z.object({
  id: z.string().optional(),
  date: z.date({
    required_error: "Tanggal harus diisi.",
  }),
  puskeswan: z.string().min(1, "Puskeswan harus dipilih."),
  officerName: z.string().min(1, "Nama petugas harus diisi."),
  ownerName: z.string().min(1, "Nama pemilik harus diisi."),
  ownerAddress: z.string().min(1, "Alamat pemilik harus diisi."),
  caseId: z.string().optional().default(''),
  livestockType: z.string().min(1, "Jenis ternak harus diisi."),
  livestockCount: z.coerce.number().min(1, "Jumlah ternak harus minimal 1."),
  clinicalSymptoms: z.string().min(1, "Gejala klinis harus diisi."),
  diagnosis: z.string().min(1, "Diagnosa harus diisi."),
  treatmentType: z.string().min(1, "Jenis pengobatan harus diisi."),
  treatments: z.array(treatmentSchema).min(1, "Minimal satu pengobatan harus ditambahkan."),
});

export type HealthcareService = z.infer<typeof serviceSchema>;
export type Treatment = z.infer<typeof treatmentSchema>;

    