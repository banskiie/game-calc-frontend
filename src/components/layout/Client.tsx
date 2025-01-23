"use client"
import { createApolloClient } from "@/lib/apollo"
import { ApolloProvider } from "@apollo/client"
import { useMemo } from "react"

const ClientLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode
}>) => {
  const client = useMemo(() => createApolloClient(), [])
  return <ApolloProvider client={client}>{children}</ApolloProvider>
}

export default ClientLayout
