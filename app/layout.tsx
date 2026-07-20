import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PTI Training Management System",
  description: "Institutional Training Management System - Parliamentary Training Institute, Ghana"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-GB">
      <body>{children}</body>
    </html>
  );
}
