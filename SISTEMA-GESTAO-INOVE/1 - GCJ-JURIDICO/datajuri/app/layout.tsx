import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { auth } from "@/auth";
import { Providers } from "./providers";
import { LayoutClient } from "./layout-client";
import "./globals.css";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist-sans" });

export const metadata: Metadata = {
  title: "GCJ Gestão de Sistemas",
  description: "Gonçalves Consultoria Jurídica — GCJ Gestão de Sistemas",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const autenticado = !!session;

  return (
    <html lang="pt-BR">
      <body className={`${geist.variable} font-sans antialiased`}>
        <Providers session={session}>
          {autenticado ? (
            <LayoutClient>{children}</LayoutClient>
          ) : (
            <main className="min-h-screen">{children}</main>
          )}
        </Providers>
      </body>
    </html>
  );
}
