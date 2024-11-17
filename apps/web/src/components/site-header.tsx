"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { MainNav } from "@/components/main-nav"
import { ThemeToggle } from "@/components/theme-toggle"
import { routes } from "@/config/routes"
import { siteConfig } from "@/config/site"
import { useAppSelector } from "@/ducks/useful-hooks"
import { cn } from "@/lib/utils"
import { useUserStore } from "@/store/user"
import { USER_TYPES } from "@/types/user"
import { ArrowLeft } from "lucide-react"

import { Button } from "./ui/button"
import UserMenu from "./users/user-menu"

export function SiteHeader() {
  const user = useAppSelector((state) => state.user)
  const path = usePathname()
  const router = useRouter()

  const isDashboard = path.includes(routes.DASHBOARD)
  const isExplore = path.includes(routes.EXPLORE)
  const isHome = path === routes.HOME

  const showBackButton = !isHome && !isExplore

  if (isDashboard) {
    return <></>
  }

  if (user?.userType === USER_TYPES.SUPER_ADMIN) {
    return <></>
  }

  const handleBackClick = () => {
    router.back()
  }

  return (
    <header className="sticky top-12 z-50 w-full bg-background md:top-16">
      <div className="mx-4 flex justify-center md:justify-between items-center">
        <div
          className={cn({
            invisible: !showBackButton,
          })}
        >
          <Button onClick={handleBackClick} variant="link">
            <ArrowLeft size={24} />
          </Button>
        </div>
        <div className="flex px-4 py-2">
          <MainNav items={siteConfig.mainNav} />
        </div>
        <div
          className={cn("flex", {
            "items-end": !!user,
          })}
        >
          {!user?.loggedIn && (
            <Link
              href="/login"
              className="hidden h-12 max-h-12 items-center justify-center bg-muted px-12 md:flex"
            >
              <span className="text-center text-sm">Join Now</span>
            </Link>
          )}
          <div className="hidden pt-2 md:block">
            {user?.loggedIn && <UserMenu />}
          </div>
        </div>
      </div>
    </header>
  )
}
