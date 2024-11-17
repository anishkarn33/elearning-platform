"use client"

import Image from "next/image"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { routes } from "@/config/routes"
import { useAppSelector } from "@/ducks/useful-hooks"
import { User } from "lucide-react"

import { Separator } from "../ui/separator"

export default function UserMenu() {
  const user = useAppSelector((state) => state.user)
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild className="hover:cursor-pointer">
        <Avatar>
          <AvatarImage src={user.avatar} />
          <AvatarFallback>
            <User />
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[160px]">
        <Link href={routes.PROFILE} className="w-full">
          <Button variant="ghost" className="w-full justify-start">
            <span>Profile</span>
          </Button>
        </Link>
        <Separator />
        <Link href={routes.LOGOUT} className="w-full">
          <Button variant="ghost" className="w-full justify-start">
            <span>Logout</span>
          </Button>
        </Link>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
