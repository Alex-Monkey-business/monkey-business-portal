import type { Metadata } from "next";
import { Geist } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Ukelønn",
  description: "Ukelønnsapp for barna",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="nb"
      className={`${geistSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        <header className="border-b border-stone-200 dark:border-stone-800">
          <nav className="mx-auto max-w-3xl flex items-center justify-between px-4 py-3">
            <Link href="/" className="text-xl font-bold tracking-tight">
              💰 Ukelønn
            </Link>
            <div className="flex gap-4 text-sm">
              <Link
                href="/"
                className="hover:underline underline-offset-4"
              >
                Oversikt
              </Link>
              <Link
                href="/historikk"
                className="hover:underline underline-offset-4"
              >
                Historikk
              </Link>
            </div>
          </nav>
        </header>
        <main className="flex-1 mx-auto w-full max-w-3xl px-4 py-6">
          {children}
        </main>
      </body>
    </html>
  );
}
