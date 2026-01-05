
"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { serviceSchema } from "./types";
import { addService } from "./data";

export async function createService(data: z.infer<typeof serviceSchema>) {
  const validatedFields = serviceSchema.safeParse(data);

  if (!validatedFields.success) {
    const errorMessages: string[] = [];
    for (const key in validatedFields.error.flatten().fieldErrors) {
      if (Object.prototype.hasOwnProperty.call(validatedFields.error.flatten().fieldErrors, key)) {
        const fieldErrors = (validatedFields.error.flatten().fieldErrors as any)[key];
        if (fieldErrors) {
          errorMessages.push(`${fieldErrors[0]}`);
        }
      }
    }

    const formErrors = validatedFields.error.flatten().formErrors.join(' ');
    let finalErrorMessage = errorMessages.join(". ");
    if (formErrors) {
        finalErrorMessage = finalErrorMessage ? `${finalErrorMessage}. ${formErrors}`: formErrors;
    }
    
    return {
      error: finalErrorMessage || "Data tidak valid. Silakan periksa kembali.",
    };
  }

  try {
    // This no longer awaits, but we keep the try/catch for initial validation errors if any were missed.
    addService(validatedFields.data);
    revalidatePath('/laporan');
    revalidatePath('/');
    return { success: "Data pelayanan berhasil disimpan!" };
  } catch (e) {
    // This will now likely only catch synchronous errors before the Firestore call.
    return { error: "Gagal memproses permintaan penyimpanan." };
  }
}
