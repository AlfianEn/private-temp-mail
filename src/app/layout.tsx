import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ToastViewport } from "@/components/toast";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Private Temp Mail",
  description: "Generator inbox email sementara privat untuk OTP dan testing internal dengan akses JWT.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-slate-950 text-slate-50">
        {children}
        <ToastViewport />
      </body>
    </html>
  );
}
