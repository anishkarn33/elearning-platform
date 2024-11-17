"use client"

import React from "react"
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
import { newUserSchema } from "@/lib/validations/auth"
import { AuthApi } from "@/service"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader } from "lucide-react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

interface RegisterFormProps extends React.HTMLAttributes<HTMLDivElement> {}

type FormData = z.infer<typeof newUserSchema>

export function NewUserForm({}: RegisterFormProps) {
  const form = useForm<FormData>({
    resolver: zodResolver(newUserSchema),
  })

  const router = useRouter()
  const searchParams = useSearchParams()

  // redux
  const [triggerSignupMutation, signUpResult] = AuthApi.useSignUpMutation()

  async function onFormSubmit(formData: FormData) {
    try {
      await triggerSignupMutation({
        firstName: formData.firstName,
        lastName: formData.lastName,
        username: formData.username,
        email: formData.email.toLowerCase(),
        password: formData.password,
      }).unwrap()

      const redirectUrl = searchParams?.get("redirect")
      if (redirectUrl) {
        router.push(redirectUrl)
      } else {
        router.push(routes.LOGIN)
      }
      toast.success("Signup successful", {
        description: "You can now log in.",
      })
    } catch (error) {
      return toast.error("Something went wrong.", {
        description: (error as Error)?.message || "Please try again.",
      })
    }
  }

  return (
    <div className="items-center justify-center">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onFormSubmit)}>
          <div className="grid gap-1">
            <div className="grid gap-1">
              <FormField
                name="firstName"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input placeholder="First Name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                name="lastName"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input placeholder="Last Name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                name="email"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input placeholder="Email" {...field} />
                    </FormControl>
                    <FormMessage className="" />
                  </FormItem>
                )}
              />
            </div>
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
                    <Input type="password" placeholder="Password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="confirmPassword"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Confirm Password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex gap-2">
              <div className="text-muted-foreground text-xs">
                All Passwords must contain at minimum an uppercase, lowercase
                and numerical value.
              </div>
            </div>
            <Button
              type="submit"
              variant="default"
              className="mt-4 w-full bg-[#555AD7] text-white"
              disabled={signUpResult.isLoading}
            >
              {signUpResult.isLoading && (
                <Loader className="mr-2 size-4 animate-spin" />
              )}
              {signUpResult.isLoading ? "Signing up" : "Sign Up!"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
