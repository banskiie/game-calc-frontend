// "use client"
// import { useRouter } from "next/navigation"
// import { Input } from "@/components/ui/input"
// import { Button } from "@/components/ui/button"
// import {
//   Form,
//   FormControl,
//   FormField,
//   FormItem,
//   FormMessage,
// } from "@/components/ui/form"
// import ButtonLoader from "@/components/custom/ButtonLoader"
// import { zodResolver } from "@hookform/resolvers/zod"
// import { useForm } from "react-hook-form"
// import { z } from "zod"
// import { useTransition, useState } from "react"
// import { LoginSchema } from "@/lib/schemas"
// import { getSession, signIn } from "next-auth/react"
// import { createApolloClient } from "@/lib/apollo"
// import favicon from "@/app/favicon.ico"
// import Image from "next/image"
// import ForgotPassword from "@/views/login/ForgotPassword"

// const Home = () => {
//   const router = useRouter()
//   const [isPending, startTransition] = useTransition()
//   const [isHovered, setIsHovered] = useState({ username: false, password: false })

//   const form = useForm<z.infer<typeof LoginSchema>>({
//     resolver: zodResolver(LoginSchema),
//     values: {
//       username: "",
//       password: "",
//     },
//   })

//   const onSubmit = (values: z.infer<typeof LoginSchema>) =>
//     startTransition(async () => {
//       try {
//         const response = await signIn("credentials", {
//           ...values,
//           redirect: false,
//         });
//         if (response?.error) throw new Error(response.error);
  
//         const session = await getSession();
  
//         if (!session) throw new Error("Session not available");
  
//         const user = (session as any)?.user;
//         const accessToken = (session as any)?.accessToken;
  
//         if (user && accessToken) {
//           // const client = createApolloClient(accessToken);
  
//           switch (user.role) {
//             case "admin":
//               router.push("/admin/sessions");
//               break;
//             case "user":
//               router.push("/users/page");
//               break;
//           }
//         }
//       } catch (error: any) {
//         console.error(error);
//         form.setError("username", { type: "custom", message: "" });
//         form.setError("password", {
//           type: "custom",
//           message: "Invalid Username or Password.",
//         });
//       }
//     })

//   return (
//     <div className="h-screen w-screen flex justify-center items-center bg-gray-50">
//       <div className="max-w-[30rem] w-full bg-white p-10 rounded-lg shadow-md">
//         <div className="flex flex-row items-center justify-center mb-14">
//           <Image
//             src={favicon}
//             alt="Game Calculator Icon"
//             width={48}
//             height={48}
//             className="mr-2"
//           />
//           <h1 className="text-2xl font-bold">Game Calculator</h1>
//         </div>
//         <div className="mb-10">
//           <h2 className="text-2xl font-semibold">Welcome Back!!</h2>
//           <p className="text-sm text-gray-500 text-start mt-4">Enter your Credentials to Login</p>
//         </div>

//         <Form {...form}>
//           <form onSubmit={form.handleSubmit(onSubmit)}>
//             <FormField
//               control={form.control}
//               name="username"
//               render={({ field }) => (
//                 <FormItem className="relative mb-8">
//                   <FormControl>
//                     <div className="relative">
//                       <Input
//                         disabled={isPending}
//                         placeholder=" "
//                         className="peer placeholder-transparent focus:border-blue-500 focus:ring-0"
//                         {...field}
//                         onMouseEnter={() => setIsHovered(prev => ({ ...prev, username: true }))}
//                         onMouseLeave={() => setIsHovered(prev => ({ ...prev, username: false }))}
//                       />
//                       <span className={`absolute left-3 top-2 text-sm text-gray-500 transition-all duration-200 transform -translate-y-1/2 pointer-events-none ${
//                         (isHovered.username || field.value) ? 'top-[-0.45rem] text-sm text-green-500' : 'peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-base peer-focus:top-[-0.45rem] peer-focus:text-sm peer-focus:text-green-500'
//                       }`}>
//                         Username
//                       </span>
//                     </div>
//                   </FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />
//             <FormField
//               control={form.control}
//               name="password"
//               render={({ field }) => (
//                 <FormItem className="relative mb-6">
//                   <FormControl>
//                     <div className="relative">
//                       <Input
//                         disabled={isPending}
//                         placeholder=" "
//                         type="password"
//                         className="peer placeholder-transparent focus:ring-0" 
//                         {...field}
//                         onMouseEnter={() => setIsHovered(prev => ({ ...prev, password: true }))}
//                         onMouseLeave={() => setIsHovered(prev => ({ ...prev, password: false }))}
//                       />
//                       <span className={`absolute left-3 top-2 text-sm text-gray-500 transition-all duration-200 transform -translate-y-1/2 pointer-events-none ${
//                         (isHovered.password || field.value) ? 'top-[-0.45rem] text-sm text-green-500' : 'peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-base peer-focus:top-[-0.45rem] peer-focus:text-sm peer-focus:text-green-500'
//                       }`}>
//                         Password
//                       </span>
//                     </div>
//                   </FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />
//             <div className="flex justify-end mb-6">
//                 <ForgotPassword />
//             </div>
//             <Button className="w-full bg-green-700 hover:bg-green-800" disabled={isPending} type="submit" >
//               {isPending ? <ButtonLoader /> : "Login"}
//             </Button>
//           </form>
//         </Form>
        
//         <span className="block text-center text-xs text-slate-400 mt-6">
//           ©2025 C-ONE Development Team
//         </span>
//       </div>
//     </div>
//   )
// }

// export default Home

// PIN 
"use client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import ButtonLoader from "@/components/custom/ButtonLoader";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useTransition, useState, useRef, useEffect, useCallback } from "react";
import { LoginWithPinSchema } from "@/lib/schemas";
import { getSession, signIn } from "next-auth/react";
import Image from "next/image";
import favicon from "@/app/favicon.ico";

const Home = () => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [pin, setPin] = useState<string[]>(Array(4).fill("")); // Array to store PIN digits
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]); // Refs for each input

  const form = useForm<z.infer<typeof LoginWithPinSchema>>({
    resolver: zodResolver(LoginWithPinSchema),
    defaultValues: {
      pin: "",
    },
  });

  // Handle PIN input change
  const handlePinChange = (index: number, value: string) => {
    if (/^\d$/.test(value)) {
      const newPin = [...pin];
      newPin[index] = value;
      setPin(newPin);

      // Move focus to the next input
      if (index < 3 && value !== "") {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  // Handle backspace
  const handleKeyDown = (index: number, event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Backspace" && index > 0 && pin[index] === "") {
      const newPin = [...pin];
      newPin[index - 1] = "";
      setPin(newPin);
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Submit the form
  const onSubmit = useCallback(() => {
    const enteredPin = pin.join("");
    form.setValue("pin", enteredPin);

    startTransition(async () => {
      try {
        const response = await signIn("credentials", {
          pin: enteredPin, // Pass the PIN here
          redirect: false,
        });
        if (response?.error) throw new Error(response.error);

        const session = await getSession();
        if (!session) throw new Error("Session not available");

        const user = (session as any)?.user;
        const accessToken = (session as any)?.accessToken;

        if (user && accessToken) {
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
        console.error(error);
        form.setError("pin", { type: "custom", message: "Invalid PIN." });
      }
    });
  }, [pin, form, router]);

  // Auto-submit when PIN is complete
  useEffect(() => {
    if (pin.every((digit) => digit !== "")) {
      onSubmit();
    }
  }, [pin, onSubmit])

  return (
    <div className="h-screen w-screen flex justify-center items-center bg-gray-50">
      <div className="max-w-[30rem] w-full bg-white p-10 rounded-lg shadow-md">
        <div className="flex flex-row items-center justify-center mb-14">
          <Image src={favicon} alt="Game Calculator Icon" width={48} height={48} className="mr-2" />
          <h1 className="text-2xl font-bold">Game Calculator</h1>
        </div>
        <div className="mb-10">
          <h2 className="text-2xl font-semibold">Welcome Back!!</h2>
          <p className="text-sm text-gray-500 text-start mt-4">Enter your 4-digit PIN to Login</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="pin"
              render={() => (
                <FormItem className="relative mb-8">
                  <FormControl>
                    <div className="flex justify-center space-x-4">
                      {pin.map((digit, index) => (
                        <div
                          key={index}
                          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                            digit ? "bg-black border-black" : "border-gray-300"
                          }`}
                        >
                          <input
                            type="text"
                            inputMode="numeric"
                            maxLength={1}
                            value={digit}
                            onChange={(e) => handlePinChange(index, e.target.value)}
                            onKeyDown={(e) => handleKeyDown(index, e)}
                            ref={(el) => {
                              if (el) {
                                inputRefs.current[index] = el;
                              }
                            }}
                            className="w-full h-full text-center bg-transparent outline-none text-transparent"
                          />
                        </div>
                      ))}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button className="w-full bg-green-700 hover:bg-green-800" disabled={isPending} type="submit">
              {isPending ? <ButtonLoader /> : "Login with PIN"}
            </Button>
          </form>
        </Form>

        <span className="block text-center text-xs text-slate-400 mt-6">©2025 C-ONE Development Team</span>
      </div>
    </div>
  );
};

export default Home