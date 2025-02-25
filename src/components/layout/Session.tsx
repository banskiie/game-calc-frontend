"use client"
import React from "react"
import { SessionProvider } from "next-auth/react"
import ClientLayout from "./Client"
import { Toaster } from "sonner"

const SessionLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode
}>) => {
  return (
    <SessionProvider>
      <ClientLayout>
        {children}
        <Toaster
          richColors
          theme="light"
          visibleToasts={5}
          pauseWhenPageIsHidden={true}
          closeButton
        />
      </ClientLayout>
    </SessionProvider>
  )
}

export default SessionLayout
