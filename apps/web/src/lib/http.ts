import { env } from "@/env.mjs"
import {
  BadRequestError,
  ForbiddenError,
  InternalServerError,
  UnauthorizedError,
} from "@/lib/exceptions"
import { ApiResponse } from "@/types"
import axios, { AxiosError, AxiosInstance, AxiosRequestHeaders } from "axios"

export interface HttpConfig {
  baseURL?: string
  timeout?: number
  headers?: AxiosRequestHeaders | (() => AxiosRequestHeaders)
}

export class Http {
  private axiosInstance: AxiosInstance

  constructor(private config: HttpConfig = {}) {
    this.config = config
    this.axiosInstance = axios.create({
      baseURL: config.baseURL || env.NEXT_PUBLIC_BASE_API_URL,
      timeout: 30000,
      timeoutErrorMessage: "Time out!",
    })
    this.applyInterceptors()
  }

  private applyInterceptors() {
    this.axiosInstance.interceptors.request.use(
      (config) => {
        const headers =
          typeof this.config.headers === "function"
            ? this.config.headers()
            : this.config.headers
        config.headers = {
          ...config.headers,
          ...headers,
        } as AxiosRequestHeaders
        return config
      },
      (error) => Promise.reject(error)
    )

    this.axiosInstance.interceptors.response.use(
      (response) => {
        return response
      },
      (error) => {
        console.log("error", error)
        return Promise.reject(error)
      }
    )
  }

  isAxiosError(error: unknown): error is AxiosError {
    return (error as AxiosError).isAxiosError !== undefined
  }

  get<T>(url: string, params?: {}, useProxy: boolean = false) {
    if (useProxy) {
      const baseUrl = `${env.NEXT_PUBLIC_APP_URL}/api/proxy`
      const fullUrl = `${baseUrl}?url=${
        url.startsWith("http")
          ? url
          : encodeURIComponent(this.config.baseURL + url)
      }&${new URLSearchParams(params || {})}`

      return this.axiosInstance.get<T>(fullUrl)
    }

    return this.axiosInstance.get<T>(url, { params })
  }

  getBlob<T>(url: string, params?: {}, useProxy: boolean = false) {
    return this.axiosInstance.get<T>(url, { params, responseType: "blob" })
  }

  post<TResponse, TBody = {}>(url: string, data?: TBody, config?: {}) {
    return this.axiosInstance.post<TResponse>(url, data, config)
  }

  put<TResponse, TBody = {}>(url: string, data?: TBody) {
    return this.axiosInstance.put<TResponse>(url, data)
  }

  delete<T>(url: string) {
    return this.axiosInstance.delete<T>(url)
  }
}

export function getAxiosErrorMessage(error: AxiosError): string {
  if (error.response?.data) {
    return (
      (error.response.data as ApiResponse<{}>).detail ||
      (error.response.data as ApiResponse<{}>).errors?.[0] ||
      error.message ||
      "Something went wrong!"
    )
  }

  return "Something went wrong!"
}

export function handleApiError(
  error: AxiosError,
  errorMessage?: string
): Error {
  if (errorMessage) {
    return new Error(errorMessage)
  }
  if (error instanceof AxiosError && error.response) {
    if (error.response?.status === 400) {
      return new BadRequestError(getAxiosErrorMessage(error))
    } else if (error.response?.status === 401) {
      return new UnauthorizedError(getAxiosErrorMessage(error))
    } else if (error.response?.status === 500) {
      return new InternalServerError(getAxiosErrorMessage(error))
    } else if (error.response?.status === 403) {
      return new ForbiddenError(getAxiosErrorMessage(error))
    } else {
      return new Error(getAxiosErrorMessage(error))
    }
  }
  return error
}
