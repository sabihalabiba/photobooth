import type { Metadata } from "next";
import { Fredoka, Poppins } from "next/font/google";
import "./globals.css";

const fredoka = Fredoka({ subsets: ["latin"], variable: "--font-fredoka" });
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: "Photobooth Studio",
  description: "Make photobooth strips, cutouts and stickers",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${fredoka.variable} ${poppins.variable}`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Anton&family=Caveat:wght@600&family=Chewy&family=Gaegu:wght@400;700&family=Montserrat:wght@700&family=Patrick+Hand&family=Playfair+Display:ital,wght@1,600&family=Special+Elite&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-cream font-body text-ink">{children}</body>
    </html>
  );
}