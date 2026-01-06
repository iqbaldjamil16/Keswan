
import type { Metadata } from "next";
import { PT_Sans } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/toaster";
import { Providers } from "@/components/providers";

export const metadata: Metadata = {
  title: "PKH Mateng",
  description: "Aplikasi Manajemen Pelayanan Kesehatan Hewan",
};

const ptSans = PT_Sans({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-body",
});


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen bg-background font-body antialiased",
          ptSans.variable
        )}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
