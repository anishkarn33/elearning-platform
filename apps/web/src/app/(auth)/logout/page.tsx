"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { accessTokenKey, refreshTokenKey } from "@/config/localstorage"
import { routes } from "@/config/routes"
import { useAppDispatch, useAppSelector } from "@/ducks/useful-hooks"
import { logout } from "@/ducks/user-slice"
import { AuthApi } from "@/service"
import Cookies from "js-cookie"
import { Loader } from "lucide-react"

export default function LogoutPage() {
  const user = useAppSelector((state) => state.user)
  const [trgiggerSignOutMutation, signOutResult] = AuthApi.useSignOutMutation()
  const router = useRouter()
  const dispatch = useAppDispatch()

  const signOut = async () => {
    try {
      if (user?.refresh) await trgiggerSignOutMutation(user.refresh).unwrap()
    } finally {
      Cookies.remove(accessTokenKey)
      Cookies.remove(refreshTokenKey)
      dispatch(logout())
      router.push(routes.LOGIN)
    }
  }

  React.useEffect(() => {
    signOut()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center p-4">
      <div className="flex flex-row items-center justify-center space-x-2">
        <Loader className="animate-spin" />
        <h1 className="text-center text-2xl font-medium">Logging out..</h1>
      </div>
    </div>
  )
}
