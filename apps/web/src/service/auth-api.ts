import { accessTokenKey, refreshTokenKey } from "@/config/localstorage"
import {
  LoginRequest,
  LoginResponse,
  SignupRequest,
  SignupResponse,
} from "@/types/user"
import Cookies from "js-cookie"

import { ConfigApi } from "./config-api"

export const AuthApi = ConfigApi.injectEndpoints({
  endpoints: (build) => ({
    signUp: build.mutation<SignupResponse, SignupRequest>({
      query: (body) => ({
        url: "/users/",
        method: "POST",
        body,
      }),
    }),

    signIn: build.mutation<LoginResponse, LoginRequest>({
      query: (body) => ({
        url: "/auth/jwt/create/",
        method: "POST",
        body,
      }),
      async onCacheEntryAdded(arg, api) {
        const cache = await api.cacheDataLoaded
        const token = cache.data.data
        Cookies.set(accessTokenKey, token.access)
        Cookies.set(refreshTokenKey, token.refresh)
      },
    }),

    signOut: build.mutation<void, string>({
      query: (refreshToken) => ({
        url: "/auth/jwt/revoke/",
        method: "POST",
        body: { refresh: refreshToken },
      }),
    }),
  }),
  overrideExisting: true,
})
