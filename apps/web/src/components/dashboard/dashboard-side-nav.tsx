"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Icons } from "@/components/icons"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTrigger,
} from "@/components/ui/sheet"
import { siteConfig } from "@/config/site"
import { useAppSelector } from "@/ducks/useful-hooks"
import { cn } from "@/lib/utils"
import { useUserStore } from "@/store/user"
import { SidebarNavItem } from "@/types"
import { Menu } from "lucide-react"

interface DashboardSideNavProps {
  items: SidebarNavItem[]
  children?: React.ReactNode
}

export function DashboardSideNav({ items }: DashboardSideNavProps) {
  const path = usePathname()
  const user = useAppSelector((state) => state.user)

  return (
    <Sheet>
      <SheetTrigger className="md:hidden">
        <Menu className="size-6" />
      </SheetTrigger>
      <SheetContent side={"left"}>
        <SheetHeader className="mb-4 ml-2">
          <Link
            href="/dashboard"
            className="flex flex-row items-center space-x-2 md:flex"
          >
            <h2 className="text-2xl">eLearning</h2>
          </Link>
        </SheetHeader>
        <nav className="grid grid-flow-row auto-rows-max gap-2 text-sm">
          {items
            .filter((item) =>
              user?.userType
                ? item.allowedUserTypes.includes(user.userType)
                : false
            )
            .map((item, index) => {
              const Icon = Icons[item.icon || "arrowRight"]
              return (
                item.href && (
                  <Link key={index} href={item.disabled ? "/" : item.href}>
                    <SheetClose asChild>
                      <span
                        className={cn(
                          "hover:bg-accent hover:text-accent-foreground group flex items-center rounded-md px-3 py-2 text-sm font-medium",
                          path === item.href ? "bg-accent" : "transparent",
                          item.disabled && "cursor-not-allowed opacity-80"
                        )}
                      >
                        <Icon className="mr-2 size-4" />
                        <span>{item.title}</span>
                      </span>
                    </SheetClose>
                  </Link>
                )
              )
            })}
        </nav>
      </SheetContent>
    </Sheet>
  )
}
