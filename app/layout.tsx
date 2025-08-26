import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { ClerkProvider } from "@clerk/nextjs"
import { dark } from "@clerk/themes"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "After Words",
  description: "For you and your loved ones.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider
      appearance={{
        baseTheme: dark,
        variables: {
          colorPrimary: "#F2BED1",
          colorBackground: "#0f172a",
          colorInputBackground: "#334155",
          colorInputText: "#ffffff",
          colorText: "#ffffff",
          colorTextSecondary: "#cbd5e1",
        },
        elements: {
          formButtonPrimary: {
            backgroundColor: "#F2BED1",
            color: "#0f172a",
            "&:hover": {
              backgroundColor: "#FDCEDF",
            },
          },
          card: {
            backgroundColor: "#1e293b",
            border: "1px solid #475569",
          },
          headerTitle: {
            color: "#ffffff",
          },
          headerSubtitle: {
            color: "#cbd5e1",
          },
        },
      }}
    >
      <html lang="en">
        <body className={inter.className}>{children}</body>
      </html>
    </ClerkProvider>
  )
}
