"use client"

import React from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { routes } from "@/config/routes"
import { siteConfig } from "@/config/site"
import { authSchema } from "@/lib/validations/auth"
import { AuthApi, UserApi } from "@/service"
import { DecodedToken, USER_TYPES } from "@/types/user"
import { zodResolver } from "@hookform/resolvers/zod"
import jwt from "jsonwebtoken"
import { Loader } from "lucide-react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

interface AuthFormProps extends React.HTMLAttributes<HTMLDivElement> {}

type FormData = z.infer<typeof authSchema>

export function AuthForm({}: AuthFormProps) {
  const form = useForm<FormData>({
    resolver: zodResolver(authSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  })

  const router = useRouter()
  const searchParams = useSearchParams()

  // redux
  const [triggerLoginMutation, loginResult] = AuthApi.useSignInMutation()
  const [triggerGetCurrentUser, userResult] =
    UserApi.useLazyGetCurrentUserQuery()

  const isLoading = loginResult.isLoading || userResult.isLoading

  async function onFormSubmit(formData: FormData) {
    try {
      const loginResponse = await triggerLoginMutation({
        username: formData.username,
        password: formData.password,
      }).unwrap()

      // fetch current user
      await triggerGetCurrentUser().unwrap()

      const decodedToken = jwt.decode(loginResponse.data.access) as DecodedToken
      const isInstructor = decodedToken.user_type === USER_TYPES.INSTRUCTOR

      const redirectUrl = searchParams?.get("redirect")
      if (redirectUrl) {
        router.replace(redirectUrl)
      } else {
        if (isInstructor) {
          router.replace(siteConfig.defaultAdminRoute)
        } else {
          router.replace(siteConfig.defaultRoute)
        }
      }

      toast.success("Login successful", {
        description: "You are now logged in.",
      })
    } catch (error) {
      if ((error as Error)?.message === "Incorrect email or password") {
        toast.error("Email or password incorrect")
      } else {
        toast.error("Something went wrong", {
          description: (error as Error)?.message || "Try again!",
        })
      }
    }
  }

  return (
    <div className="items-center justify-center">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onFormSubmit)}>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <FormField
                name="username"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input placeholder="Username" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                name="password"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="flex gap-2">
              <div className="text-muted-foreground text-xs">
                Forgot your password?
              </div>
              <Link
                href={routes.FORGOT_PASSWORD}
                className="inline-block text-xs font-semibold underline"
              >
                Retrive Here
              </Link>
            </div>
            <Button
              type="submit"
              variant="default"
              className="w-full bg-[#555AD7] text-white"
              disabled={isLoading}
            >
              {isLoading && <Loader className="mr-2 size-4 animate-spin" />}
              {isLoading ? "Signing in" : "Sign in!"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
