import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import DifyChatWidget from "./components/DifyChatWidget";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Handygo — On-Demand Home Repair & Service Booking",
  description:
    "Handygo connects homeowners with trusted local workers for repairs, maintenance, and home services. Book fast, track live, pay safe.",
  metadataBase: new URL("https://handygo.ai"),
  openGraph: {
    title: "Handygo — On-Demand Home Repair & Service Booking",
    description:
      "Book home repair services instantly. Receive worker bids, track progress live, and chat in real time.",
    url: "https://handygo.ai",
    siteName: "Handygo",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geist.variable} h-full`}>
      <body className="min-h-full flex flex-col antialiased">
        {children}
        <DifyChatWidget />
      </body>
    </html>
  );
}
