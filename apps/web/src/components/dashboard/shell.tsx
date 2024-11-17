"use client"

import * as React from "react"
import { useUserStore } from "@/store/user"
import { cn } from "@/lib/utils"

interface DashboardShellProps extends React.HTMLAttributes<HTMLDivElement> {}

export function DashboardShell({
  children,
  className,
  ...props
}: DashboardShellProps) {
  const user = useUserStore((state) => state.user)

  return (
    <div
      className={cn("grid items-start gap-8 px-6 md:px-12", className)}
      {...props}
    >
      {children}
    </div>
  )
}
