import type { Metadata } from "next";
import { Toaster } from "sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: "Gouvernance Cyber",
  description: "Plateforme de gouvernance cybersécurité",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        {children}
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
