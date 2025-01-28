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

const FETCH_COURT = gql`
  query FetchCourt($id: ID!) {
    fetchCourt(_id: $id) {
      _id
      name
      price
      active
      createdAt
      updatedAt
    }
  }
`

const CREATE_COURT = gql`
  mutation CreateCourt($name: String!, $price: Float!) {
    createCourt(input: { name: $name, price: $price }) {
      _id
      name
      price
      active
      createdAt
      updatedAt
    }
  }
`
const UPDATE_COURT = gql`
  mutation UpdateCourt($id: ID!, $name: String, $price: Float) {
    updateCourt(input: { _id: $id, name: $name, price: $price }) {
      _id
      name
      price
      active
      createdAt
      updatedAt
    }
  }
`

export const CourtSchema = z.object({
  name: z.string().nonempty({ message: "Name is required." }),
  price: z.number().positive({ message: "Price must be greater than 0." }),
})

const CourtForm = ({ id, refetch }: { id?: string; refetch?: () => void }) => {
  const [open, setOpen] = useState<boolean>(false)
  const [isPending, startTransition] = useTransition()
  const { data, loading } = useQuery(FETCH_COURT, {
    variables: { id },
    skip: !id,
    fetchPolicy: "network-only",
  })
  const [submit] = useMutation(id ? UPDATE_COURT : CREATE_COURT)
  const form = useForm<z.infer<typeof CourtSchema>>({
    resolver: zodResolver(CourtSchema),
    values: {
      name: "",
      price: 0,
    },
  })

  useEffect(() => {
    if (data) {
      form.reset(data?.fetchCourt)
    }
  }, [data, form])

  const onSubmit = (values: z.infer<typeof CourtSchema>) => {
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

  if (loading) return <Loader />

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button className="w-full">{id ? "Edit Court" : "Add Court"}</Button>
      </SheetTrigger>
      <SheetContent
        side="bottom"
        onOpenAutoFocus={(e) => e.preventDefault()}
        className="w-screen max-h-screen flex flex-col"
      >
        <SheetHeader>
          <SheetTitle>{id ? "Edit Court" : "Add Court"}</SheetTitle>
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
                      placeholder="Court Name"
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
                <FormItem className="my-1">
                  <FormLabel>
                    Price
                    <span className="text-destructive font-extrabold">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      disabled={isPending}
                      className="text-sm"
                      placeholder="Court Price"
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

export default CourtForm
