import * as React from "react"
import Link from "next/link"
import { DashboardSideNav } from "@/components/dashboard/dashboard-side-nav"
import { Icons } from "@/components/icons"
import { DashboardNav } from "@/components/nav"
import UserMenu from "@/components/users/user-menu"
import { dashboardConfig } from "@/config/dashboard"

interface DashboardLayoutProps {
  children?: React.ReactNode
}

export default async function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  return (
    <div className="bg-background relative flex min-h-screen flex-col">
      <header className="bg-background sticky top-0 z-50 h-12 w-full border-b md:h-16">
        <div className="flex size-full items-start justify-between md:items-center md:justify-between">
          <div className="flex flex-row space-x-4">
            <DashboardSideNav items={dashboardConfig.sidebarNav} />
            <Link
              href="/dashboard"
              className="flex flex-row items-center space-x-2 md:flex"
            >
              <h2 className="text-2xl font-medium">Instructors Panel</h2>
            </Link>
          </div>
          <UserMenu />
        </div>
      </header>
      <div className="grid md:grid-cols-[200px_1fr]">
        <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] w-[200px] border-r p-4 md:block">
          <DashboardNav items={dashboardConfig.sidebarNav} />
        </aside>
        <main className="flex-1 pb-24 pt-4">{children}</main>
      </div>
    </div>
  )
}
