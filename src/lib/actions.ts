
"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { serviceSchema } from "./types";
import { deleteServiceById } from "./data";

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

  // If validation is successful, revalidate paths and return success.
  // The actual database operation is handled on the client.
  try {
    revalidatePath('/laporan');
    revalidatePath('/rekap');
    revalidatePath('/');
    return { success: true };
  } catch (e) {
    // This catch block is for potential revalidation errors, which are rare.
    return { error: "Gagal menyegarkan data cache." };
  }
}

export async function deleteService(serviceId: string) {
    if (!serviceId) {
      return { error: "ID layanan tidak valid." };
    }
    try {
      await deleteServiceById(serviceId);
      revalidatePath("/laporan");
      revalidatePath("/rekap");
      return { success: "Data berhasil dihapus." };
    } catch (e) {
      return { error: "Gagal menghapus data." };
    }
  }

    