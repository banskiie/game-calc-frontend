import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet"
import { gql, useMutation, useQuery } from "@apollo/client"
import { Input } from "@/components/ui/input"
import { zodResolver } from "@hookform/resolvers/zod"
import React, { useEffect, useState, useTransition } from "react"
import { useForm } from "react-hook-form"   
import { z } from "zod"
import Loader from "@/components/custom/Loader"
import ButtonLoader from "@/components/custom/ButtonLoader"

const FETCH_USER = gql`
  query FetchUser($id: ID!) {
    fetchUser(_id: $id) {
        _id
        name
        contact
        password
        username
        role
        active
        createdAt
        updatedAt
    }
  }
`

const CREATE_USER = gql`
  mutation CreateUser($input: UserInput!) {
    createUser(input: $input) {
        _id
        name
        contact
        password
        username
        role
        active
        createdAt
        updatedAt
    }
  }
`
const UPDATE_USER = gql`
  mutation UpdateUser($id: ID!, $name: String!, $contact: String!, $password: String!, $username: String!, $role: String!) {
    updateUser(input: { _id: $id, name: $name, contact: $contact, password: $password, username: $username, role: $role }) {
      _id
      name
      contact
      password
      username
      role
      active
      createdAt
      updatedAt
    }
  }
`

export const UserSchema = z.object({
  name: z.string().nonempty({ message: "Name is required." }),
  contact: z.string().nonempty({ message: "Contact is required." }),
  password: z.string().nonempty({ message: "Password is required." }),
  username: z.string().nonempty({ message: "Username is required." }),
  role: z.enum(["admin", "user"]),
})

const UserForm = ({ 
  id, 
  refetch 
}: { 
  id?: string
   refetch?: () => void }) => {
  const [open, setOpen] = useState<boolean>(false)
  const [isPending, startTransition] = useTransition()
  const { data, loading } = useQuery(FETCH_USER, {
    variables: { id },
    skip: !id,
    fetchPolicy: "network-only",
  })
  const [submit] = useMutation(id ? UPDATE_USER : CREATE_USER)
  const form = useForm<z.infer<typeof UserSchema>>({
    resolver: zodResolver(UserSchema),
    values: {
      name: "",
      contact: "",
      password: "",
      username: "",
      role: "user",
    },
  })

  useEffect(() => {
    if (data) {
      form.reset(data?.fetchUser)
    }
  }, [data, form])

  const onSubmit = async (values: z.infer<typeof UserSchema>) => {
    startTransition(async () => {
    try {
        const response = await submit({
          variables: {
            id,
            input: {
              ...values,
              role: values.role,
            },
          },
        })
        if (response) closeForm()
      } catch (error) {
        console.error("Error submitting user:", error);
      }
      });
    }

  const closeForm = () => {
    setOpen(false)
    form.reset()
    if (refetch) refetch()
  }

  if (loading) return <Loader />

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button className="w-full">{id ? "Edit User" : "Add User"}</Button>
      </SheetTrigger>
      <SheetContent
        side="bottom"
        onOpenAutoFocus={(e) => e.preventDefault()}
        className="w-screen max-h-screen flex flex-col"
      >
        <SheetHeader>
          <SheetTitle>{id ? "Edit User" : "Add User"}</SheetTitle>
          <SheetDescription>
            Please fill up the necessary information below.
          </SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form
            className="flex-1 overflow-auto px-1 -mx-1"
            onSubmit={form.handleSubmit(onSubmit)}
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      disabled={isPending}
                      className="text-sm"
                      placeholder="Name"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
           
            <FormField
              control={form.control}
              name="contact"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contact Number</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      disabled={isPending}
                      className="text-sm"
                      placeholder="Contact Number"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
           
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
                <FormItem>
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
            
              <FormField
      control={form.control}
      name="role"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Role</FormLabel>
          <FormControl>
            <select {...field} disabled={isPending} className="text-sm">
              <option value="admin">Admin</option>
              <option value="user">User</option>
            </select>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
            <SheetFooter className="gap-2 py-2">
              <Button
                disabled={isPending}
                onClick={() => closeForm()}
                className="w-full"
              >
                Close
              </Button>
              <Button disabled={isPending} className="bg-green-900">
                {isPending ? <ButtonLoader /> : "Submit"}
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  )
}

export default UserForm
