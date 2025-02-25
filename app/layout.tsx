import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { CategoryProvider } from "@/lib/contexts/category-context"

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Smart Finance',
  description: 'あなたの家計をスマートに管理',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
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
            {children}
            <Toaster />
          </CategoryProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}