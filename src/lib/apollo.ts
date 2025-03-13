import { ApolloClient, HttpLink, InMemoryCache, split } from "@apollo/client"
import { GraphQLWsLink } from "@apollo/client/link/subscriptions"
import { getMainDefinition } from "@apollo/client/utilities"
import { createClient } from "graphql-ws"
import { setContext } from "@apollo/client/link/context"
import dotenv from "dotenv"

dotenv.config()

export const createApolloClient = (token?: string) => {
  const graphqlUrl = process.env.NEXT_PUBLIC_GRAPHQL_URL;
  const wsUrl = process.env.NEXT_PUBLIC_WS_URL;

  const cache = new InMemoryCache();

  if (!graphqlUrl) {
    throw new Error("The GraphQL URL is not defined.");
  }

  if (!wsUrl) {
    throw new Error("The WebSocket URL is not defined.");
  }

  // Set up the HTTP Link
  const httpLink = new HttpLink({
    uri: graphqlUrl,
  })

  const authLink = setContext((_, { headers }) => {
    return {
      headers: {
        ...headers,
        Authorization: token ? `Bearer ${token}` : "no token",
      },
    };
  });

  const wsLink = new GraphQLWsLink(
    createClient({
      url: wsUrl,
      connectionParams: {
        headers: {
          Authorization: token ? `Bearer ${token}` : "no token",
        },
      },
      keepAlive: 10000,
       on: {
      connected: () => console.log("WebSocket connected!"),
      error: (err) => console.error("WebSocket error:", err),
      closed: () => console.log("WebSocket closed!"),
    },
    })
  );

  // Use split for HTTP and WebSocket links
  const splitLink = split(
    ({ query }) => {
      const definition = getMainDefinition(query);
      return (
        definition.kind === "OperationDefinition" &&
        definition.operation === "subscription"
      );
    },
    wsLink,
    authLink.concat(httpLink)
  );

  // Return the Apollo Client with the correctly initialized cache
  return new ApolloClient({
    link: splitLink,
    // cache: new InMemoryCache(), 
    cache
  });
}