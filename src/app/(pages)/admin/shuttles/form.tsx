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
import ButtonLoader from "@/components/custom/ButtonLoader"
import { Loader2 } from "lucide-react"

const FETCH_SHUTTLE = gql`
  query FetchShuttle($id: ID!) {
    fetchShuttle(_id: $id) {
      _id
      name
      price
      active
      createdAt
      updatedAt
    }
  }
`

const CREATE_SHUTTLE = gql`
  mutation CreateShuttle($name: String!, $price: Float!) {
    createShuttle(input: { name: $name, price: $price }) {
      _id
      name
      price
      active
      createdAt
      updatedAt
    }
  }
`
const UPDATE_SHUTTLE = gql`
  mutation UpdateShuttle($id: ID!, $name: String, $price: Float) {
    updateShuttle(input: { _id: $id, name: $name, price: $price }) {
      _id
      name
      price
      active
      createdAt
      updatedAt
    }
  }
`

export const ShuttleSchema = z.object({
  name: z.string().nonempty({ message: "Name is required." }),
  price: z.number().positive({ message: "Price must be greater than 0." }),
})

const ShuttleForm = ({
  id,
  refetch,
}: {
  id?: string
  refetch?: () => void
}) => {
  const [open, setOpen] = useState<boolean>(false)
  const [isPending, startTransition] = useTransition()
  const { data, loading } = useQuery(FETCH_SHUTTLE, {
    variables: { id },
    skip: !id,
    fetchPolicy: "network-only",
  })
  const [submit] = useMutation(id ? UPDATE_SHUTTLE : CREATE_SHUTTLE)
  const form = useForm<z.infer<typeof ShuttleSchema>>({
    resolver: zodResolver(ShuttleSchema),
    values: {
      name: "",
      price: 0,
    },
  })

  useEffect(() => {
    if (data) {
      form.reset(data?.fetchShuttle)
    }
  }, [data, form])

  const onSubmit = (values: z.infer<typeof ShuttleSchema>) => {
    startTransition(async () => {
      try {
        const response = await submit({
          variables: id ? { ...values, id } : values,
        })
        if (response) closeForm()
      } catch (error) {
        console.error(error)
      }
    })
  }

  const closeForm = () => {
    setOpen(false)
    form.reset()
    if (refetch) refetch()
  }

  if (loading) return <Loader2 />

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button className="w-full">
          {id ? "Edit Shuttle" : "Add Shuttle"}
        </Button>
      </SheetTrigger>
      <SheetContent
        side="bottom"
        onOpenAutoFocus={(e) => e.preventDefault()}
        className="w-screen max-h-screen flex flex-col"
      >
        <SheetHeader>
          <SheetTitle>{id ? "Edit Shuttle" : "Add Shuttle"}</SheetTitle>
          <SheetDescription className='text-base'>
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
                      placeholder="Shuttle Name"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem className="my-1````````````````````````````````````````````">
                  <FormLabel>
                    Price
                    <span className="text-destructive font-extrabold">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      disabled={isPending}
                      className="text-sm"
                      placeholder="Shuttle Price"
                      step={0.01}
                      type="number"
                      onChange={(e) =>
                        field.onChange(
                          e.target.value === "" ? "" : +e.target.value
                        )
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <SheetFooter className="gap-2 py-2">
             
              <Button disabled={isPending} className="w-full bg-green-900 hover:bg-green-800 !p-4">
                {isPending ? <ButtonLoader /> : "Submit"}
              </Button>
              <Button
                disabled={isPending}
                onClick={() => closeForm()}
                className="w-full !p-4 !m-0 bg-red-600 hover:bg-red-700"
              >
                Close
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  )
}

export default ShuttleForm
