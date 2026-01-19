import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "宵の口 - Zen Fishing",
  description: "A Japanese Zen fishing game",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className={`font-serif antialiased`}>
        {children}
      </body>
    </html>
  );
}
