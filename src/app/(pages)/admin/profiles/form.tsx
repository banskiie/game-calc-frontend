import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { gql, useMutation, useQuery } from "@apollo/client";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useEffect, useTransition } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import ButtonLoader from "@/components/custom/ButtonLoader";
import { toast } from "sonner";
import { Loader2 } from "lucide-react"

const FETCH_USER = gql`
  query FetchUser($id: ID!) {
    fetchUser(_id: $id) {
      _id
      name
      contact
      password
      username
      role
      pin
      active
      createdAt
      updatedAt
    }
  }
`;

const CREATE_USER = gql`
  mutation CreateUser($input: UserInput!) {
    createUser(input: $input) {
      _id
      name
      contact
      password
      username
      role
      pin
      active
      createdAt
      updatedAt
    }
  }
`;

const UPDATE_USER = gql`
  mutation UpdateUser($input: UpdateUserInput!) {
    updateUser(input: $input) {
      _id
      name
      contact
      password
      username
      role
      pin
      active
      createdAt
      updatedAt
    }
  }
`;

export const UserSchema = z.object({
  name: z.string().nonempty({ message: "Name is required." }),
  contact: z.string(),
  password: z.string().optional(),
  username: z.string(),
  role: z.enum(["admin", "user"]),
  pin: z.string().optional().refine((val) => !val || /^\d{4}$/.test(val), {
    message: "PIN must be exactly 4 digits and contain only numbers.",
  }),
})

const UserForm = ({ id, refetch, open, onOpenChange }: { id?: string; refetch?: () => void; open?: boolean; onOpenChange?:(open: boolean) => void }) => {
  // const [open, setOpen] = useState<boolean>(false);
  const [isPending, startTransition] = useTransition();
  const { data, loading } = useQuery(FETCH_USER, {
    variables: { id },
    skip: !id,
    fetchPolicy: "network-only",
  });
  const [createUser] = useMutation(CREATE_USER);
  const [updateUser] = useMutation(UPDATE_USER);

  const form = useForm<z.infer<typeof UserSchema>>({
    resolver: zodResolver(UserSchema),
    defaultValues: {
      name: "",
      contact: "",
      password: "",
      username: "",
      role: "user",
      pin: "",
    },
  })

  useEffect(() => {
    if (data) {
      const { ...userDataWithoutPassword } = data?.fetchUser
      form.reset(userDataWithoutPassword)
    }
  }, [data, form])

  const onSubmit = async (values: z.infer<typeof UserSchema>) => {
    startTransition(async () => {
      try {

        if (id && !values.password){
          const { ...updatedValues } = values
          values = updatedValues
        }

        const response = id
          ? await updateUser({
              variables: {
                input: {
                  _id: id,
                  ...values,
                },
              },
            })
          : await createUser({
              variables: { input: values },
            });

        if (response) {
          toast.success("User created successfully!")
          closeForm()
        }
      } catch (err) {
        console.error("Failed to submit user. Please try again.", err);
      }
    });
  };

  const closeForm = () => {
    if (onOpenChange) onOpenChange(false)
    form.reset()
    if (refetch) refetch()
  }

  if (loading) return <Loader2 />;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetTrigger asChild>
        <Button className="w-full">{"Add User"}</Button>
      </SheetTrigger>
      <SheetContent side="bottom" className=" !max-w-xl mx-auto w-full overflow-auto max-h-screen flex flex-col">
        <SheetHeader>
          <SheetTitle>{id? "Edit User" : "Add User"}</SheetTitle>
          <SheetDescription className='text-base mb-2'>Please fill up the necessary information below.</SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form className="flex-1 overflow-auto px-1 -mx-1" onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input {...field} disabled={isPending} className="text-sm" placeholder="Name" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Contact Number */}
            {id && (
              <FormField
                control={form.control}
                name="contact"
                render={({ field }) => (
                  <FormItem className="mt-5">
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
            )}
           {/* PIN (4-digit number only) */}
           {id && (
            <FormField
              control={form.control}
              name="pin"
              render={({ field }) => (
                <FormItem className="mt-5">
                  <FormLabel>PIN</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      maxLength={4}
                      pattern="[0-9]*"
                      inputMode="numeric"
                      disabled={isPending}
                      className="text-sm"
                      placeholder="4-digit PIN"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
           )}
            {/* Username */}
            {id && (
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem className="mt-6">
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
            )}

            {/* Password */}
            {id && (
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem className="mt-5">
                    <FormLabel>New Password</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        disabled={isPending}
                        className="text-sm"
                        placeholder="Password"
                        type="password"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
             
           {id && (
              <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem className="mt-5">
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
           )} 

            <SheetFooter className="!flex !flex-row gap-2 py-2 mt-8">
              <Button type="submit" disabled={isPending} className="w-full bg-green-900 hover:bg-green-800 !p-4">
                {isPending ? <ButtonLoader /> : "Submit"}
              </Button>
              <Button disabled={isPending} onClick={closeForm} className="w-full !p-4 !m-0 bg-red-600 hover:bg-red-700">
                Close
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
};

export default UserForm;
