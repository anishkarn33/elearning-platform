"use client"

import Link from "next/link"
import { routes } from "@/config/routes"
import { useAppSelector } from "@/ducks/useful-hooks"
import { USER_TYPES } from "@/types/user"

import { Icons } from "./icons"
import UserMenu from "./users/user-menu"

export function SiteTopHeader() {
  const user = useAppSelector((state) => state.user)

  if (user?.userType === USER_TYPES.SUPER_ADMIN) {
    return <></>
  }

  return (
    <header className="bg-background sticky top-0 z-50 h-12 w-full border-b md:h-16">
      <div className="flex size-full items-start justify-between md:items-center md:justify-center">
        <Link href={routes.HOME} className="pl-2 pt-2 md:pl-2">
          <h2 className="text-3xl font-semibold">eLearning</h2>
        </Link>
        {!user && (
          <Link
            href="/login"
            className="flex h-12 max-h-12 items-center justify-center bg-white px-12 text-black md:hidden"
          >
            <span className="text-center text-sm">Join Now</span>
          </Link>
        )}
        <div className="block pt-2 md:hidden">{user && <UserMenu />}</div>
      </div>
    </header>
  )
}
