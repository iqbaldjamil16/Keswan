
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
        const fieldError = (validatedFields.error.flatten().fieldErrors as any)[key];
        if(fieldError) {
          errorMessages.push(fieldError[0]);
        }
      }
    }

    const formErrors = validatedFields.error.flatten().formErrors.join(' ');
    const finalErrorMessage = errorMessages.length > 0 ? errorMessages.join(". ") : formErrors;
    
    return {
      error: finalErrorMessage || "Data tidak valid. Silakan periksa kembali.",
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
