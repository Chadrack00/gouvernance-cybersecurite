import type { Metadata } from "next";
import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip"
import "./globals.css";

export const metadata: Metadata = {
  title: {
    template: '%s | Gouvernance',
    default: 'Gouvernance',
  },
  description: "Plateforme de gouvernance Cybersécurité",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`h-full antialiased`}>
      <body className="min-h-full flex flex-col p-3">
         <TooltipProvider>
          {children}
        </TooltipProvider>
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
