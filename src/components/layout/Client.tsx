// layouts/Client.tsx
"use client"
import React, { useMemo } from "react"
import { createApolloClient } from "@/lib/apollo"
import { ApolloProvider } from "@apollo/client"
import { signOut, useSession } from "next-auth/react"
import { SessionProvider } from "@/hooks/use-requests"
import { Loader2 } from "lucide-react"

const ClientLayout = ({ children }: { children: React.ReactNode }) => {
  const { data: session, status } = useSession({
    onUnauthenticated: () => signOut(),
    required: false,
  });

  const client = useMemo(
    () => createApolloClient((session as any)?.accessToken),
    [session]
  )
  if(status === "loading") return <Loader2/>
  return (
    <ApolloProvider client={client}>
      {status === "authenticated" ? (
        <SessionProvider>{children}</SessionProvider>
      ) : (
        <>{children}</>
      )}
    </ApolloProvider>
  );
};

export default ClientLayout;