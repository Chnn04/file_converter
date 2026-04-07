import "@mantine/core/styles.css";
import "@mantine/dropzone/styles.css";
import "./globals.css";
import type { Metadata } from "next";
import { ColorSchemeScript, MantineProvider } from "@mantine/core";
import { theme } from "@/theme";
import Header from "@/components/Header";

export const metadata: Metadata = {
  title: "PDF Hub — Herramientas PDF",
  description:
    "Hub de herramientas PDF: une, divide, rota, comprime, protege y edita tus documentos PDF directamente en el navegador.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <ColorSchemeScript defaultColorScheme="auto" />
      </head>
      <body>
        <MantineProvider theme={theme} defaultColorScheme="auto">
          <Header />
          <main style={{ minHeight: "var(--page-min-height)" }}>{children}</main>
        </MantineProvider>
      </body>
    </html>
  );
}
