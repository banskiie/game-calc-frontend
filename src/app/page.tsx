"use client"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import ButtonLoader from "@/components/custom/ButtonLoader"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { useTransition } from "react"
import { gql } from "@apollo/client"
import { LoginSchema } from "@/lib/schemas"
import { getSession, signIn } from "next-auth/react"
import { createApolloClient } from "@/lib/apollo"
import favicon from "@/app/favicon.ico" // Import the favicon
import Image from "next/image" // Import the Image component from Next.js

const Home = () => {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const form = useForm<z.infer<typeof LoginSchema>>({
    resolver: zodResolver(LoginSchema),
    values: {
      username: "",
      password: "",
    },
  })

  const onSubmit = (values: z.infer<typeof LoginSchema>) =>
    startTransition(async () => {
      try {
        const response = await signIn("credentials", {
          ...values,
          redirect: false,
        })
        if (response?.error) throw new Error(response.error);
  
        const session = await getSession();
        console.log("Session after login:", session)
  
        const user = (session as any)?.user;
        const accessToken = (session as any)?.accessToken
        console.log("User from session:", user);
        console.log("AccessToken from session:", accessToken)
  
        if (user && accessToken) {
          
          const client = createApolloClient(accessToken)
          console.log("Apollo Client created with token:", client, accessToken)

          switch (user.role) {
            case "admin":
              router.push("/admin/sessions")
              break
            case "user":
              router.push("/users/page")
              break
          }
        }
      } catch (error: any) {
        if (error) {
          console.error(error);
          form.setError("username", { type: "custom", message: "" });
          form.setError("password", {
            type: "custom",
            message: "Invalid Username or Password.",
          })
        }
      }
    })

  return (
    <div className="h-screen w-screen flex justify-center items-center bg-gray-50">
      <div className="max-w-96 w-full bg-white p-8 rounded-lg shadow-md">
        {/* Updated: Use flex-row to align icon and text horizontally */}
        <div className="flex flex-row items-center justify-center mb-6">
          <Image
            src={favicon}
            alt="Game Calculator Icon"
            width={48} // Adjust the size as needed
            height={48}
            className="mr-2" // Add margin to the right of the icon
          />
          <h1 className="text-2xl font-bold">Game Calculator</h1>
        </div>
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-center">Welcome Back!!</h2>
          <p className="text-sm text-gray-500 text-center mt-2">Enter your Credentials to Login</p>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem className="mb-4">
                  <FormLabel className="text-sm text-gray-700">Username</FormLabel>
                  <FormControl>
                    <Input
                      disabled={isPending}
                      className="text-sm border-0 border-b-2 border-gray-300 focus:border-blue-500 focus:ring-0 rounded-none"
                      placeholder="Username"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem className="mb-6">
                  <FormLabel className="text-sm text-gray-700">Password</FormLabel>
                  <FormControl>
                    <Input
                      disabled={isPending}
                      className="text-sm border-0 border-b-2 border-gray-300 focus:border-blue-500 focus:ring-0 rounded-none"
                      placeholder="Password"
                      type="password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end mb-6">
              <a href="#" className="text-sm text-blue-500 hover:text-blue-700">Forgot Password?</a>
            </div>
            <Button className="w-full bg-blue-500 hover:bg-blue-600" disabled={isPending} type="submit">
              {isPending ? <ButtonLoader /> : "Login"}
            </Button>
          </form>
        </Form>
        <span className="block text-center text-xs text-slate-400 mt-6">
          ©2025 C-ONE Development Team
        </span>
      </div>
    </div>
  )
}

export default Home