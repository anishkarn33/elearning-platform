"use client"

import { env } from "@/env.mjs"
import { HttpConfig } from "@/lib/http"

export const defaultAPIConfig: HttpConfig = {
  baseURL: env.NEXT_PUBLIC_BASE_API_URL,
  timeout: 30000,
}

export const analyticsAPIConfig: HttpConfig = {
  baseURL: env.NEXT_PUBLIC_ANALYTICS_API_URL,
  timeout: 30000,
}
