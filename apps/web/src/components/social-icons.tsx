"use client"

import Link from "next/link"
import { siteConfig } from "@/config/site"

import { Icons } from "./icons"
import { buttonVariants } from "./ui/button"

export default function SocialIcons() {
  return (
    <div className="flex items-center space-x-1">
      <Link href={siteConfig.links.github} target="_blank" rel="noreferrer">
        <div
          className={buttonVariants({
            size: "icon",
            variant: "ghost",
          })}
        >
          <Icons.gitHub className="size-5" />
          <span className="sr-only">GitHub</span>
        </div>
      </Link>
      <Link href={siteConfig.links.twitter} target="_blank" rel="noreferrer">
        <div
          className={buttonVariants({
            size: "icon",
            variant: "ghost",
          })}
        >
          <Icons.newTwitter className="size-4 fill-current" />
          <span className="sr-only">Twitter</span>
        </div>
      </Link>
      <Link href={siteConfig.links.instagram} target="_blank" rel="noreferrer">
        <div
          className={buttonVariants({
            size: "icon",
            variant: "ghost",
          })}
        >
          <Icons.instagram className="size-4" />
          <span className="sr-only">Instagram</span>
        </div>
      </Link>
      <Link href={siteConfig.links.linkedin} target="_blank" rel="noreferrer">
        <div
          className={buttonVariants({
            size: "icon",
            variant: "ghost",
          })}
        >
          <Icons.linkedIn className="size-4" />
          <span className="sr-only">LinkedIn</span>
        </div>
      </Link>
    </div>
  )
}
