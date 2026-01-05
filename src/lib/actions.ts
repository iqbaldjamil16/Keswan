
"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { serviceSchema } from "./types";
// The addService function is no longer needed here as logic is moved to client.

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
    // We only revalidate paths now. The actual data saving is done on the client.
    revalidatePath('/laporan');
    revalidatePath('/rekap');
    revalidatePath('/');
    return { success: "Data pelayanan berhasil disimpan!" };
  } catch (e) {
    return { error: "Gagal menyegarkan data." };
  }
}
