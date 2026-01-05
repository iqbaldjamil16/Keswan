
"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { serviceSchema } from "./types";
import { addService } from "./data";

export async function createService(data: z.infer<typeof serviceSchema>) {
  const validatedFields = serviceSchema.safeParse(data);

  if (!validatedFields.success) {
    const errorMessages = Object.values(validatedFields.error.flatten().fieldErrors).flat().join(' ');
    return {
      error: errorMessages || "Data tidak valid. Silakan periksa kembali.",
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
