// import CredentialsProvider from "next-auth/providers/credentials"
// import dotenv from "dotenv"
// import { createApolloClient } from "@/lib/apollo"
// import { NextAuthOptions } from "next-auth"
// import { gql } from "@apollo/client"

// dotenv.config()

// const LOGIN = gql`
// mutation Login($username: String!, $password: String!) {
//     login(input: { username: $username, password: $password }) {
//         token
//         user {
//             _id
//             name
//             username
//             contact
//             role
//         }
//     }
// }
// `

// const LOGOUT = gql`
//     mutation Logout($token: String!) {
//     logout(token: $token) {
//         _id
//         name
//     }
// }
// `

// interface LoginCredentials { 
//     username: string
//     password: string
// }

// export const options: NextAuthOptions = {
//     providers: [
//       CredentialsProvider({
//         name: "Credentials",
//         credentials: {
//           username: { label: "Username", type: "text" },
//           password: { label: "Password", type: "password" },
//         },
//         async authorize(credentials): Promise<any> {
//           try {
//             const client = createApolloClient();
//             const { username, password } = credentials as LoginCredentials;
        
//             const { data, errors } = await client.mutate({
//               mutation: LOGIN,
//               variables: { username, password },
//             });
        
//             if (errors) throw errors;
        
//             if (!data) throw new Error("Login failed");
//             const { login } = data;
//             const { user: authUser, token: accessToken } = login;
        
//             return {
//               _id: authUser._id, 
//               name: authUser.name,
//               email: authUser.email,
//               role: authUser.role,
//               username: authUser.username,
//               accessToken,
//             };
//           } catch (error) {
//             console.error(error);
//             return null;
//           }}
//       }),
//     ],
//     callbacks: {
//       async jwt({ token, user }: any) {
//         if (user) {
//           token.accessToken = user.accessToken;
//           token.user = {
//             _id: user._id, 
//             name: user.name,
//             email: user.email,
//             role: user.role,
//             username: user.username,
//           };
//         }
//         return token;
//       },
//       async session({ session, token }: any) {
//         session.accessToken = token.accessToken;
//         session.user = token.user; 
//         console.log("Session:", session)
//         return session
        
//       },
//     },
//     events: {
//       async signOut({ token }) {
//         const client = createApolloClient(token.accessToken as string)
//         await client.mutate({
//           mutation: LOGOUT,
//           variables: { token: token.accessToken },
//         })
//       },
//     },
//     session: {
//       strategy: "jwt",
//       maxAge: 12 * 60 * 60, // 12 hours
//     },
//     pages: {
//       signIn: "/",
//       signOut: "/",
//     },
//     secret: process.env.NEXTAUTH_SECRET,
//   }
  

import CredentialsProvider from "next-auth/providers/credentials";
import dotenv from "dotenv";
import { createApolloClient } from "@/lib/apollo";
import { NextAuthOptions } from "next-auth";
import { gql } from "@apollo/client";

dotenv.config();

const LOGIN_WITH_PIN = gql`
  mutation LoginWithPin($pin: String!) {
    loginWithPin(input: { pin: $pin }) {
      token
      user {
        _id
        name
        username
        contact
        role
      }
    }
  }
`
const LOGOUT = gql`
    mutation Logout($token: String!) {
    logout(token: $token) {
        _id
        name
    }
}
`
interface PinCredentials {
  pin: string;
}

export const options: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        pin: { label: "PIN", type: "text" }, 
      },
      async authorize(credentials): Promise<any> {
        try {
          const client = createApolloClient();
          const { pin } = credentials as PinCredentials;

          const { data, errors } = await client.mutate({
            mutation: LOGIN_WITH_PIN,
            variables: { pin },
          });

          if (errors) throw errors;

          if (!data) throw new Error("Login with PIN failed");
          const { loginWithPin } = data;
          const { user: authUser, token: accessToken } = loginWithPin;

          return {
            _id: authUser._id,
            name: authUser.name,
            email: authUser.email,
            role: authUser.role,
            username: authUser.username,
            accessToken,
          };
        } catch (error) {
          console.error(error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }: any) {
      if (user) {
        token.accessToken = user.accessToken;
        token.user = {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          username: user.username,
        };
      }
      return token;
    },
    async session({ session, token }: any) {
      session.accessToken = token.accessToken;
      session.user = token.user;
      console.log("Session:", session);
      return session;
    },
  },
  events: {
    async signOut({ token }) {
      const client = createApolloClient(token.accessToken as string);
      await client.mutate({
        mutation: LOGOUT,
        variables: { token: token.accessToken },
      });
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 12 * 60 * 60, // 12 hours
  },
  pages: {
    signIn: "/",
    signOut: "/",
  },
  secret: process.env.NEXTAUTH_SECRET,
};