"use client"

import * as React from "react"
import { usePathname, useRouter } from "next/navigation"

import { useSearchParams } from "./use-search-params"

interface URLTabsProps {
  key: string
  defaultValue?: string
}

export const useUrlTabs = (props: URLTabsProps) => {
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const router = useRouter()
  const [activeTab, setActiveTab] = React.useState<string | undefined>(
    searchParams?.[props.key] ?? props.defaultValue
  )

  // Create query string
  const createQueryString = React.useCallback(
    (params: Record<string, string | number | null>) => {
      const newSearchParams = new URLSearchParams(searchParams)

      for (const [key, value] of Object.entries(params)) {
        if (value === null) {
          newSearchParams.delete(key)
        } else {
          newSearchParams.set(key, String(value))
        }
      }

      return newSearchParams.toString()
    },
    [searchParams]
  )

  const handleTabChange = (tab: string) => {
    setActiveTab(tab)
    router.push(`${pathname}?${createQueryString({ [props.key]: tab })}`)
  }

  React.useEffect(() => {
    setActiveTab(searchParams?.[props.key] ?? props.defaultValue)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

  return {
    activeTab,
    handleTabChange,
  }
}
