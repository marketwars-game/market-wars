import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Market Wars — The Investment Game",
  description: "เกมจำลองการลงทุนแบบ multiplayer สำหรับ Dime! Kids Camp",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th">
      <body className="min-h-screen font-sans">{children}</body>
    </html>
  );
}
