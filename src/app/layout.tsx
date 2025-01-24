import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import ClientLayout from "@/components/layout/Client"

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
      <ClientLayout>{children}</ClientLayout>
    </body>
  </html>
)

export default HomeLayout
