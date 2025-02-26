import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { CategoryProvider } from "@/lib/contexts/category-context";
import Link from "next/link";
import { Settings } from "lucide-react";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Smart Finance",
  description: "あなたの家計をスマートに管理",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <CategoryProvider>
            <div className="flex flex-col min-h-screen">
              <header className="border-b">
                <div className="container mx-auto py-4"></div>
              </header>
              <main className="flex-1">{children}</main>
            </div>
            <Toaster />
          </CategoryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
