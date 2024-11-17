"use client"

import React from "react"
import { createServiceInstance } from "@/lib/service-instantiation"
import BaseService from "@/service/base.service"
import { useAuthStore } from "@/store/auth"

export const useService = <T extends typeof BaseService>(
  ServiceClass: T,
  requireAuth = true
) => {
  const token = useAuthStore((state) => state.token?.access)

  const serviceInstance = React.useMemo(() => {
    // if (requireAuth && !token) return null
    return createServiceInstance(ServiceClass, token || "")
    // Handle the case where there's no token; depends on application's logic
  }, [ServiceClass, token, requireAuth]) // eslint-disable-line react-hooks/exhaustive-deps

  return serviceInstance
}
