import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { Suspense } from "react"

export const metadata: Metadata = {
  title: "APOLLYO - Advanced Word Discovery Platform",
  description: "AI-Powered English Word Discovery with Speed Mode and Hyper Mode",
  generator: "v0.app",
  keywords: ["word discovery", "domain names", "brand names", "APOLLYO"],
  authors: [{ name: "APOLLYO Team" }],
  openGraph: {
    title: "APOLLYO - Advanced Word Discovery",
    description: "Discover rare and valuable English words with AI",
    siteName: "APOLLYO",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <Suspense fallback={null}>{children}</Suspense>
        <Analytics />
      </body>
    </html>
  )
}
