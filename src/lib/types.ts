import { z } from 'zod';

export const serviceSchema = z.object({
  id: z.string().optional(),
  date: z.date({
    required_error: "Tanggal harus diisi.",
  }),
  officerName: z.string().min(1, "Nama petugas harus diisi."),
  ownerName: z.string().min(1, "Nama pemilik harus diisi."),
  ownerAddress: z.string().min(1, "Alamat pemilik harus diisi."),
  caseId: z.string().optional(),
  livestockType: z.string().min(1, "Jenis ternak harus diisi."),
  livestockCount: z.coerce.number().min(1, "Jumlah ternak harus minimal 1."),
  clinicalSymptoms: z.string().min(1, "Gejala klinis harus diisi."),
  diagnosis: z.string().min(1, "Diagnosa harus diisi."),
  handling: z.string().min(1, "Penanganan harus diisi."),
  treatmentType: z.string().min(1, "Jenis pengobatan harus diisi."),
  medicineType: z.string().min(1, "Jenis obat harus dipilih."),
  medicineName: z.string().min(1, "Nama obat harus dipilih."),
  dosage: z.string().min(1, "Dosis harus diisi."),
});

export type HealthcareService = z.infer<typeof serviceSchema>;