import z from "zod"
 

export const LoginSchema = z.object({
    username: z.string().nonempty({ message: "Username is required" }),
    password: z.string().nonempty({ message: "Password must not be empty" }),
})

