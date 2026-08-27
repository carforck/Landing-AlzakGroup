import type { Metadata, Viewport } from "next";
import { Inter, Inter_Tight } from "next/font/google";
import "./globals.css";
import { Navigation } from "../src/components/Navigation";
import { Footer } from "../src/components/Footer";
import { ChromeGate } from "../src/components/ChromeGate";
import { CertBadge } from "../src/components/CertBadge";
import { MotionProvider } from "../src/components/MotionProvider";
import { site } from "../src/content/site";

/*
 * Tipografía. El Manual de Identidad Corporativa obliga a Helvetica. En web se
 * resuelve con Inter, la grotesca neogótica más cercana en métrica y carácter,
 * dejando el stack Helvetica/Arial por delante en globals.css para quien la
 * tenga instalada. Inter Tight, más estrecha, sostiene los titulares y evoca la
 * proporción del logotipo.
 */
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const interTight = Inter_Tight({
  variable: "--font-inter-tight",
  subsets: ["latin"],
  display: "swap",
});

const title = `${site.name} | ${site.claim}`;

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: title,
    template: `%s | ${site.shortName}`,
  },
  description: site.description,
  applicationName: site.name,
  authors: [{ name: site.name, url: site.url }],
  keywords: [
    "economía de la salud",
    "salud pública",
    "epidemiología",
    "evaluación económica de tecnologías sanitarias",
    "carga de enfermedad",
    "real world evidence",
    "impacto presupuestal",
    "rutas integrales de atención en salud",
    "consultoría en salud",
    "Cartagena",
    "Colombia",
    "ALZAK",
  ],
  icons: {
    icon: [{ url: "/favicon.png", type: "image/png" }],
    apple: [{ url: "/favicon.png" }],
  },
  alternates: { canonical: "/" },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "es_CO",
    url: site.url,
    siteName: site.name,
    title,
    description: site.description,
    images: [
      {
        url: "/brand/logo-alzak.png",
        width: 1200,
        height: 433,
        alt: site.name,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description: site.description,
    images: ["/brand/logo-alzak.png"],
  },
  category: "research",
};

export const viewport: Viewport = {
  // El sitio se sirve en claro por defecto, igual que el material corporativo.
  themeColor: "#ffffff",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es-CO" className={`${inter.variable} ${interTight.variable}`}>
      <body>
        <a
          href="#contenido"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:rounded-full focus:bg-gris-800 focus:px-5 focus:py-2.5 focus:text-sm focus:text-white"
        >
          Saltar al contenido
        </a>
        <MotionProvider>
          <ChromeGate>
            <Navigation />
          </ChromeGate>
          <main id="contenido">{children}</main>
          <ChromeGate>
            <Footer />
          </ChromeGate>
          <CertBadge />
        </MotionProvider>
      </body>
    </html>
  );
}
