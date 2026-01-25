import type { Metadata } from "next";
import { Karla, Playfair_Display_SC } from "next/font/google";

import "./globals.css";

const karla = Karla({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const playfair = Playfair_Display_SC({
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "Vimenu — Guest",
  description: "Vimenu guest PWA",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi" className={`${karla.variable} ${playfair.variable} dark`}>
      <body className="min-h-[max(884px,100dvh)] bg-background-light text-slate-900 dark:bg-background-dark dark:text-white">
        {children}
      </body>
    </html>
  );
}
