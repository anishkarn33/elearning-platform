import { Suspense } from "react"
import { Metadata } from "next"
import LoginCard from "@/components/auth/login-card"

export const metadata: Metadata = {
  title: "Login",
  description: "Login to your account",
}

export default function LoginPage() {
  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center p-4">
      <Suspense>
        <LoginCard />
      </Suspense>
    </div>
  )
}
