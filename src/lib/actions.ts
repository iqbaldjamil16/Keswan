
"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { serviceSchema } from "./types";
import { addService } from "./data";

// The 'treatment' field has been replaced by 'medicineType', 'medicineName', and 'dosage'.
// The HealthcareService type from lib/types.ts already reflects this.
export async function createService(data: z.infer<typeof serviceSchema>) {
  const validatedFields = serviceSchema.safeParse(data);

  if (!validatedFields.success) {
    const errorMessages = Object.values(validatedFields.error.flatten().fieldErrors).flat().join(' ');
    return {
      error: errorMessages || "Data tidak valid. Silakan periksa kembali.",
    };
  }

  try {
    // The data is already in the correct shape, so we can pass it directly.
    await addService(validatedFields.data);
    revalidatePath('/laporan');
    revalidatePath('/');
    return { success: "Data pelayanan berhasil disimpan!" };
  } catch (e) {
    return { error: "Gagal menyimpan data ke server." };
  }
}
