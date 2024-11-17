"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Icons } from "@/components/icons"
import { cn, interpolate } from "@/lib/utils"
import { useUserStore } from "@/store/user"
import { SidebarNavItem } from "@/types"
import { ChevronDown } from "lucide-react"

interface DashboardNavProps {
  items: SidebarNavItem[]
}

export function DashboardNav({ items }: DashboardNavProps) {
  const path = usePathname()
  const { user } = useUserStore()

  const [openItems, setOpenItems] = useState<{ [key: number]: boolean }>({})

  const toggleItem = (index: number) => {
    setOpenItems((prev) => ({
      ...prev,
      [index]: !prev[index],
    }))
  }

  return (
    <nav className="grid items-start gap-2">
      {items.map((item, index) => {
        const Icon = Icons[item.icon || "arrowRight"]
        const isOpen = openItems[index]

        return (
          <div key={index}>
            <div
              className={cn(
                "hover:bg-accent hover:text-accent-foreground group flex items-center justify-between rounded-md px-3 py-2 text-sm font-medium",
                path === item.href ? "bg-accent" : "transparent",
                item.disabled && "cursor-not-allowed opacity-80"
              )}
            >
              {item.href ? (
                <Link
                  href={interpolate(item.href)}
                  className="flex grow items-center"
                >
                  <div className="flex items-center">
                    <Icon className="mr-2 size-4" />
                    <span>{item.title}</span>
                  </div>
                </Link>
              ) : (
                <div
                  className="flex grow cursor-pointer items-center"
                  onClick={() => toggleItem(index)}
                >
                  <div className="flex items-center">
                    <Icon className="mr-2 size-4" />
                    <span>{item.title}</span>
                  </div>
                </div>
              )}
              {item.items && (
                <ChevronDown
                  className={cn(
                    "ml-2 transition-transform hover:cursor-pointer",
                    isOpen ? "rotate-180" : "rotate-0"
                  )}
                  onClick={() => toggleItem(index)}
                />
              )}
            </div>

            {item.items && isOpen && (
              <div className="ml-6 mt-2">
                {item.items.map((subItem, subIndex) => (
                  <Link key={subIndex} href={interpolate(subItem.href)}>
                    <div
                      className={cn(
                        "hover:bg-accent hover:text-accent-foreground group flex items-center rounded-md px-3 py-2 text-sm font-medium",
                        path === subItem.href ? "bg-accent" : "transparent",
                        subItem.disabled && "cursor-not-allowed opacity-80"
                      )}
                    >
                      <Icon className="mr-2 size-4" />
                      <span>{subItem.title}</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )
      })}
    </nav>
  )
}
