import type { Metadata } from "next";
import { Fraunces, Space_Grotesk, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["500", "600"],
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["400", "500", "700"],
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://gadonpay.lat"),
  title: {
    default: "GadonPay — Confirmation automatique NatCash & MonCash",
    template: "%s — GadonPay",
  },
  description:
    "GadonPay confirme automatiquement vos paiements NatCash et MonCash et déclenche vos livraisons, abonnements ou crédits — sans jamais détenir vos fonds.",
  openGraph: {
    type: "website",
    locale: "fr_HT",
    siteName: "GadonPay",
    title: "GadonPay — Confirmation automatique NatCash & MonCash",
    description:
      "Le client paie directement votre portefeuille NatCash/MonCash. GadonPay détecte, vérifie, et déclenche l'action automatiquement.",
  },
  twitter: {
    card: "summary_large_image",
    title: "GadonPay — Confirmation automatique NatCash & MonCash",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className={`${fraunces.variable} ${spaceGrotesk.variable} ${plexMono.variable} font-sans`}>
        {children}
      </body>
    </html>
  );
}
