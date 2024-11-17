"use client"

import Link from "next/link"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { AuthForm } from "@/components/users/user-auth-form"
import { routes } from "@/config/routes"

export default function LoginCard() {
  return (
    <Card className="mx-auto border-white sm:w-[400px] dark:border-black">
      <CardHeader className="flex flex-col items-start text-center">
        <CardTitle className="text-lg">Sign in</CardTitle>
        <CardDescription className="text-muted-foreground text-sm">
          Enter your account details to sign back in.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <AuthForm />
        <div className="mt-4 text-center text-xs">
          Don&apos;t have an account?{" "}
          <Link href={routes.SIGNUP} className="underline">
            Sign up
          </Link>
        </div>
      </CardContent>
      <CardFooter className="text-muted-foreground -mt-6 text-center text-xs">
        <span>
          By continuing to sign up with email or a 3rd party, you agree to
          eLearner
          <Link
            href={routes.TERMS}
            className="ml-1 inline  no-underline hover:text-blue-500"
          >
            Terms of Service
          </Link>
          <span className="mx-1">and</span>
          <Link
            href={routes.PRIVACY}
            className="inline  no-underline hover:text-blue-500"
          >
            Policies.
          </Link>
        </span>
      </CardFooter>
    </Card>
  )
}
