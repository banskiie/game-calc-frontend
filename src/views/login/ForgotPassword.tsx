import React from "react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"

const ForgotPassword = () => (
  <AlertDialog>
    <AlertDialogTrigger asChild>
      <Button type="button" variant="link" className="text-sm text-black-500">
        Forgot Password?
      </Button>
    </AlertDialogTrigger>
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Forgot Password?</AlertDialogTitle>
        <AlertDialogDescription>
          Please contact{" "}
          <code className="bg-slate-200 rounded-sm px-1.5 py-0.5 text-slate-800 font-bold">
            nats@c-one.ph
          </code>{" "}
          for help.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogAction className="bg-green-900 hover:bg-green-800">Continue</AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
)

export default ForgotPassword
