import { createEnv } from "@t3-oss/env-nextjs"
import { z } from "zod"

export const env = createEnv({
  client: {
    NEXT_PUBLIC_APP_URL: z.string().default(""),
    NEXT_PUBLIC_BASE_API_URL: z.string().default(""),
    NEXT_PUBLIC_BASE_WS_URL: z.string().default(""),
  },
  runtimeEnv: {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_BASE_API_URL: process.env.NEXT_PUBLIC_BASE_API_URL,
    NEXT_PUBLIC_BASE_WS_URL: process.env.NEXT_PUBLIC_BASE_WS_URL,
    NODE_ENV: process.env.NODE_ENV,
  },
  server: {
    NODE_ENV: z.nativeEnum({
      development: "development",
      production: "production",
      test: "test",
    }),
  },
})
