import * as React from "react"
import Link from "next/link"
import { Icons } from "@/components/icons"
import { routes } from "@/config/routes"
import { cn } from "@/lib/utils"
import { useUserStore } from "@/store/user"
import { NavItem } from "@/types/nav"

interface MainNavProps {
  items?: NavItem[]
  hideLogo?: boolean
}

export function MainNav({ items }: MainNavProps) {

  return (
    <div>
      {items?.length ? (
        <nav className="flex gap-6">
          {items?.map(
            (item, index) =>
              item.href && (
                <Link
                  key={index}
                  href={item.href}
                  className={cn(
                    "flex items-center text-md font-normal",
                    item.disabled && "cursor-not-allowed opacity-80"
                  )}
                >
                  {item.title}
                </Link>
              )
          )}
        </nav>
      ) : null}
    </div>
  )
}
