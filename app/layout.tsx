import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Across the Ocean, Kavindi",
  description: "Sri Lanka → Maldives • Since June 01, 2024",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="noise">{children}</body>
    </html>
  );
}
