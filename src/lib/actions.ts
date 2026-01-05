
"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { serviceSchema } from "./types";
import { addService } from "./data";

export async function createService(data: z.infer<typeof serviceSchema>) {
  const validatedFields = serviceSchema.safeParse(data);

  if (!validatedFields.success) {
    const errorMessages = Object.values(validatedFields.error.flatten().fieldErrors).flat().join(' ');
    // Handle array-specific errors
    const formErrors = validatedFields.error.flatten().formErrors.join(' ');
    
    return {
      error: errorMessages || formErrors || "Data tidak valid. Silakan periksa kembali.",
    };
  }

  try {
    await addService(validatedFields.data);
    revalidatePath('/laporan');
    revalidatePath('/');
    return { success: "Data pelayanan berhasil disimpan!" };
  } catch (e) {
    return { error: "Gagal menyimpan data ke server." };
  }
}

    