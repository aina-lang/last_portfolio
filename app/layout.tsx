import type { Metadata } from "next";
import { Bangers, Space_Grotesk, JetBrains_Mono, Press_Start_2P } from "next/font/google";
import "./globals.css";

const bangers = Bangers({
  weight: "400",
  variable: "--font-manga",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-body",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

const pressStart = Press_Start_2P({
  weight: "400",
  variable: "--font-pixel",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Mercia — Développeur Fullstack",
  description:
    "Portfolio de RAFANDEFERANA Maminiaina Mercia, développeur fullstack web et mobile : React Native, Next.js, NestJS, Laravel.",
  openGraph: {
    title: "Mercia — Développeur Fullstack",
    description:
      "Développeur fullstack web et mobile — React Native, Next.js, NestJS, Laravel.",
    type: "profile",
    locale: "fr_FR",
    images: ["/portrait.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${bangers.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable} ${pressStart.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
