import { Suspense } from "react"
import { Metadata } from "next"
import Link from "next/link"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { NewUserForm } from "@/components/users/new-user-form"
import { routes } from "@/config/routes"

export const metadata: Metadata = {
  title: "Sign up",
  description: "Create an account",
}

export default function SignupPage() {
  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center p-4">
      <Card className="mx-auto border-white sm:w-[400px] dark:border-black">
        <CardHeader className="flex flex-col items-start text-center">
          <CardTitle className="text-lg">Create an account</CardTitle>
          <CardDescription className="text-muted-foreground text-start text-sm">
            you are 30 seconds away from learning from the best instructors
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense>
            <NewUserForm />
          </Suspense>
        </CardContent>
        <CardFooter className="text-muted-foreground -mt-2 text-center text-xs">
          <span>
            By continuing to sign up with email or a 3rd party, you agree to
            eLearners
            <Link
              href={routes.TERMS}
              className="ml-1 inline no-underline hover:text-blue-500"
            >
              Terms of Service
            </Link>
            <span className="mx-1">and</span>
            <Link
              href={routes.PRIVACY}
              className="inline no-underline hover:text-blue-500"
            >
              Policies.
            </Link>
          </span>
        </CardFooter>
        <div className=" flex justify-center text-center">
          <div className="text-muted-foreground px-2 text-xs">
            Already have an account?
          </div>
          <Link href={routes.LOGIN} className="text-xs underline">
            Sign in
          </Link>
        </div>
      </Card>
    </div>
  )
}
