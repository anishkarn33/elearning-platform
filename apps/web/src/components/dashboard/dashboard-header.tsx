"use client"

import { useRouter } from "next/navigation"

import { Icons } from "../icons"

interface DashboardHeaderProps {
  heading: string
  text?: string
  children?: React.ReactNode
  showBackButton?: boolean
  backButtonHref?: string
}

export function DashboardHeader({
  heading,
  text,
  children,
  showBackButton,
  backButtonHref,
}: DashboardHeaderProps) {
  const router = useRouter()
  return (
    <div className="flex items-center justify-between px-2">
      <div className="grid gap-1">
        {showBackButton && (
          <div
            className="hover:text-primary flex items-center space-x-1 hover:cursor-pointer"
            onClick={() => {
              if (backButtonHref) {
                router.push(backButtonHref)
              } else {
                router.back()
              }
            }}
          >
            <Icons.chevronLeft className="size-5" />
            <span className="">Back</span>
          </div>
        )}
        <h1 className="font-heading text-3xl md:text-4xl">{heading}</h1>
        {text && <p className="text-muted-foreground text-lg">{text}</p>}
      </div>
      {children}
    </div>
  )
}
