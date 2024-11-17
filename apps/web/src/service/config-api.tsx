import { accessTokenKey, refreshTokenKey } from "@/config/localstorage"
import { env } from "@/env.mjs"
import { LoginResponse } from "@/types/user"
import {
  Middleware,
  MiddlewareAPI,
  isRejectedWithValue,
} from "@reduxjs/toolkit"
import {
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
  createApi,
  fetchBaseQuery,
} from "@reduxjs/toolkit/query/react"
import { Mutex } from "async-mutex"
import axios, { AxiosError, AxiosRequestConfig } from "axios"
import Cookies from "js-cookie"
import { RootState } from "src/ducks/store"

const mutex = new Mutex()

const baseQuery = fetchBaseQuery({
  baseUrl: env.NEXT_PUBLIC_BASE_API_URL,
  prepareHeaders: (headers, { getState }) => {
    const {
      user: { access },
    } = getState() as RootState
    if (access) {
      headers.set("Authorization", `Bearer ${access}`)
    }
    return headers
  },
})

const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  // wait until the mutex is available without locking it
  // await mutex.waitForUnlock();
  let result = await baseQuery(args, api, extraOptions)

  if (
    result.error &&
    (result.error.status === 401 || result.error.status === 403)
  ) {
    // checking whether the mutex is locked
    if (!mutex.isLocked()) {
      const release = await mutex.acquire()
      try {
        const refreshToken = (api.getState() as RootState).user.refresh
        const refreshResult = await baseQuery(
          {
            url: "/auth/jwt/refresh/",
            method: "POST",
            body: {
              refresh: refreshToken,
            },
          },
          api,
          extraOptions
        )
        if (refreshResult.data) {
          const data = refreshResult.data as LoginResponse
          Cookies.set(accessTokenKey, data.data.access)
          Cookies.set(refreshTokenKey, refreshToken!)
          api.dispatch({
            type: "user/tokenUpdated",
            payload: {
              access: data.data.access,
              refresh: refreshToken,
            },
          })
          // retry the initial query
          result = await baseQuery(args, api, extraOptions)
        } else {
          api.dispatch({ type: "user/logout" })
        }
      } finally {
        // release must be called once the mutex should be released again.
        release()
      }
    } else {
      // wait until the mutex is available without locking it
      await mutex.waitForUnlock()
      result = await baseQuery(args, api, extraOptions)
    }
  }
  return result
}

/**
 * Log a warning and show a toast!
 */
export const rtkQueryErrorLogger: Middleware =
  (api: MiddlewareAPI) => (next) => (action) => {
    // RTK Query uses `createAsyncThunk` from redux-toolkit under the hood, so we're able to utilize these matchers!
    if (isRejectedWithValue(action)) {
      console.log(JSON.stringify(action.payload))
    }

    return next(action)
  }

/**
 * Defines the empty configuration api, will allow for code splitting the middleware across multiple files
 *
 * @resources
 * Code splitting: https://redux-toolkit.js.org/rtk-query/usage/code-splitting
 */
export const ConfigApi = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauth,
  endpoints: () => ({}),
  tagTypes: ["Courses", "Me", "Feedbacks", "Materials", "Users"],
})
