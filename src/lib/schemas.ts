import z from "zod"

export const LoginSchema = z.object({
  username: z.string().nonempty({ message: "Username is required" }),
  password: z.string().nonempty({ message: "Password must not be empty" }),
})

export const LoginWithPinSchema = z.object({
  pin: z.string().length(4, { message: "PIN must be exactly 4 digits" }),
})