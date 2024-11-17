import { Http, HttpConfig } from "@/lib/http"

export interface IBaseService {
  httpConfig: HttpConfig
  http: Http
}

class BaseService implements IBaseService {
  private _httpConfig: HttpConfig
  private _http: Http

  constructor(httpConfig: HttpConfig) {
    this._httpConfig = httpConfig
    this._http = new Http(httpConfig)
  }

  get httpConfig() {
    return this._httpConfig
  }

  get http() {
    return this._http
  }

  protected buildQueryString<T extends Record<string, any>>(
    filters: T
  ): string {
    const params = new URLSearchParams()
    ;(Object.keys(filters) as (keyof T)[]).forEach((key) => {
      const value = filters[key]
      if (value !== undefined && value !== null && value !== "") {
        params.append(key as string, String(value))
      }
    })
    return params.toString()
  }
}

export default BaseService
