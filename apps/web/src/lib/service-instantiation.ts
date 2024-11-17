import { env } from "@/env.mjs"
import { HttpConfig } from "@/lib/http"
import BaseService from "@/service/base.service"
import { AxiosRequestHeaders } from "axios"

export function createServiceInstance<T extends typeof BaseService>(
  ServiceClass: T,
  token?: string
): InstanceType<T> {
  const httpConfig: HttpConfig = {
    baseURL: env.NEXT_PUBLIC_BASE_API_URL,
    timeout: 30000,
    headers:
      typeof token !== "string" || token === ""
        ? ({} as AxiosRequestHeaders)
        : ({
            Authorization: `Bearer ${token}`,
          } as AxiosRequestHeaders),
  }

  return new ServiceClass(httpConfig) as InstanceType<T>
}
