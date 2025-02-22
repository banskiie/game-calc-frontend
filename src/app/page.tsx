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
  // const onSubmit = (values: z.infer<typeof LoginSchema>) => {
  //   console.log(values)
  //   startTransition(async () => {
  //     router.push("/admin/sessions")
  //   })
  // }
  const onSubmit = (values: z.infer<typeof LoginSchema>) =>
    startTransition(async () => {
      try {
        const response = await signIn("credentials", {
          ...values,
          redirect: false,
        });
        if (response?.error) throw new Error(response.error);
  
        const session = await getSession();
        console.log("Session after login:", session); // Log the session
  
        const user = (session as any)?.user;
        const accessToken = (session as any)?.accessToken; // Retrieve the accessToken from the session
        console.log("User from session:", user);
        console.log("AccessToken from session:", accessToken); // Log the accessToken
  
        if (user && accessToken) {
          // Pass the token to the Apollo Client
          const client = createApolloClient(accessToken);
  
          switch (user.role) {
            case "admin":
              router.push("/admin/sessions");
              break;
            case "user":
              router.push("/users/page");
              break;
          }
        }
      } catch (error: any) {
        if (error) {
          console.error(error);
          form.setError("username", { type: "custom", message: "" });
          form.setError("password", {
            type: "custom",
            message: "Invalid Username or Password.",
          });
        }
      }
    })


  return (
    <div className="h-screen w-screen flex justify-center items-center">
      <div className=" max-w-96 flex flex-col h-fit w-full items-center bg-white">
        <Form {...form}>
          <form
            className="flex-1 overflow-auto px-1 -mx-1"
            onSubmit={form.handleSubmit(onSubmit)}
          >
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      disabled={isPending}
                      className="text-sm"
                      placeholder="Username"
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
                <FormItem className="my-1">
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      disabled={isPending}
                      className="text-sm"
                      placeholder="Password"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button className="w-full mt-5" disabled={isPending} type="submit">
              {isPending ? <ButtonLoader /> : "Sign In"}
            </Button>
          </form>
        </Form>
        <span className="absolute bottom-7 text-xs text-slate-400 drop-shadow-sm">
        ©2025 C-ONE Development Team{" "}
      </span>
      </div>
    </div>
  )
}

export default Home
