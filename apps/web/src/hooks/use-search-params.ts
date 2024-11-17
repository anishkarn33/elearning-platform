"use client"

import * as React from "react"
import { useSearchParams as useNextSearchParams } from "next/navigation"

export const useSearchParams = () => {
  const nextSearchParams = useNextSearchParams()
  const searchParams = React.useMemo(() => {
    const searchParamsDict: { [key: string]: string } = {}
    for (const [key, value] of nextSearchParams.entries()) {
      searchParamsDict[key] = value
    }
    return searchParamsDict
  }, [nextSearchParams])

  return searchParams
}
