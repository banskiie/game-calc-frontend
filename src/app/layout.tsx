import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import SessionLayout from "@/components/layout/Session"

const inter = Inter({
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: {
    default: "Game Calculator",
    template: "%s | Game Calculator",
  },
  description: "C-ONE Game Calculator",
}

const HomeLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode
}>) => (
  <html lang="en">
    <body className={`${inter.className} antialiased`}>
      <SessionLayout>{children}</SessionLayout>
    </body>
  </html>
)

export default HomeLayout
