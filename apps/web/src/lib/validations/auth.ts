"use client"

import { z } from "zod"

export const authSchema = z.object({
  username: z.string().min(1, { message: "Username is required" }),
  password: z.string().min(1, { message: "Password is required" }),
})

export const newUserSchema = z
  .object({
    firstName: z.string().min(1, { message: "First name is required" }),
    lastName: z.string().min(1, { message: "Last name is required" }),
    username: z.string().min(1, { message: "Username is required" }),
    email: z
      .string()
      .email({ message: "Please enter a valid email address" })
      .min(1, { message: "Email is required" }),
    password: z.string().min(1, { message: "Password is required" }),
    confirmPassword: z
      .string()
      .min(1, { message: "Please confirm your password" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

export const changePasswordSchema = z
  .object({
    oldPassword: z.string().min(1, { message: "Current password is required" }),
    newPassword: z
      .string()
      .min(8, { message: "Password must be at least 8 characters long" }),
    confirmNewPassword: z
      .string()
      .min(1, { message: "Please re-enter your new password" }),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "Passwords do not match",
    path: ["confirmNewPassword"],
  })
