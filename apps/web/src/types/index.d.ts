import { Icons } from "@/components/icons"
import { AxiosResponse } from "axios"
import type { Icon } from "lucide-react"

import { USER_TYPES } from "./user"

export type NavItem = {
  title: string
  href: string
  disabled?: boolean
  hidden?: boolean
}

export type MainNavItem = NavItem

export type SidebarNavItem = {
  title: string
  disabled?: boolean
  external?: boolean
  hidden?: boolean
  allowedUserTypes: USER_TYPES[]
  icon?: keyof typeof Icons
} & (
  | {
      href: string
      items?: never
    }
  | {
      href?: string
      items: NavLink[]
    }
)

export type DocsConfig = {
  mainNav: MainNavItem[]
  sidebarNav: SidebarNavItem[]
}

export type DashboardConfig = {
  mainNav: MainNavItem[]
  sidebarNav: SidebarNavItem[]
}

export interface DataTableSearchableColumn<TData> {
  id: keyof TData
  title: string
}

export interface DataTableFilterableColumn<TData>
  extends DataTableSearchableColumn<TData> {
  options: Option[]
}

export interface BaseResponse<T = null> {
  detail: string
  status: string
  errors?: string[]
}

export type ApiResponse<T = null> = BaseResponse<T> & {
  data: T
}

export type ListApiResponse<T> = BaseResponse & {
  data: {
    count: number
    next: string
    previous: string
    results: T[]
  }
}

export type BaseListApiQueryParams = {
  page?: number
  page_size?: number
}
