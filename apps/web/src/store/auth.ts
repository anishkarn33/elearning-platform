import { accessTokenKey, refreshTokenKey } from "@/config/localstorage"
import { createServiceInstance } from "@/lib/service-instantiation"
import AuthService from "@/service/auth.service"
import { LoginResponse, SignupResponse, TokenData } from "@/types/user"
import Cookies from "js-cookie"
import { create } from "zustand"
import { devtools, persist } from "zustand/middleware"

interface AuthState {
  token: TokenData | null
  setToken: (token: TokenData) => void
  signup: (user: {
    firstName: string
    lastName: string
    email: string
    username: string
    password: string
  }) => Promise<SignupResponse>
  login: (username: string, password: string) => Promise<LoginResponse>
  logout: (refreshToken?: string) => Promise<void>
  init: () => void
  isAuthenticated: () => boolean
}

export const saveToken = (token: TokenData) => {
  Cookies.set(accessTokenKey, token.access)
  Cookies.set(refreshTokenKey, token.refresh)
  localStorage.setItem(accessTokenKey, token.access)
  localStorage.setItem(refreshTokenKey, token.refresh)
}

export const removeToken = () => {
  Cookies.remove(accessTokenKey)
  Cookies.remove(refreshTokenKey)
  localStorage.removeItem(accessTokenKey)
  localStorage.removeItem(refreshTokenKey)
}

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set) => ({
        token: null,
        setToken: (token) => {
          set({ token })
          saveToken(token)
        },

        signup: async (user: {
          firstName: string
          lastName: string
          email: string
          username: string
          password: string
        }): Promise<SignupResponse> => {
          const authService = createServiceInstance(AuthService)
          try {
            const response = await authService.signup(user)

            if (response.data) {
              return response
            } else {
              throw new Error("Invalid response")
            }
          } catch (error: unknown) {
            if (error instanceof Error) {
              throw error
            }
            throw new Error("Unknown error during signup")
          }
        },

        login: async (
          username: string,
          password: string
        ): Promise<LoginResponse> => {
          const authService = createServiceInstance(AuthService)
          try {
            const data = {
              username,
              password,
            }
            const response = await authService.login(data)

            if (response.data) {
              const token = response.data
              set({ token })
              saveToken(token)
              return response
            } else {
              throw new Error("Invalid response")
            }
          } catch (error: unknown) {
            if (error instanceof Error) {
              throw error
            }
            throw new Error("Unknown error")
          }
        },

        logout: async (refreshToken?: string) => {
          const authService = createServiceInstance(AuthService)
          if (refreshToken) {
            try {
              // TODO: Implement logout
              // await authService.logout(refreshToken)
            } catch (error: unknown) {
              console.log(error)
            }
          }
          set({ token: null })
          removeToken()
        },

        init: () => {
          const accessToken = localStorage.getItem(accessTokenKey)
          const refreshToken = localStorage.getItem(refreshTokenKey)

          set({
            token: {
              access: accessToken || "",
              refresh: refreshToken || "",
            },
          })
          if (accessToken && refreshToken) {
            saveToken({
              access: accessToken,
              refresh: refreshToken,
            })
          }
        },

        isAuthenticated: () => {
          const accessToken = localStorage.getItem(accessTokenKey)
          return !!accessToken
        },
      }),
      {
        name: "auth-storage",
      }
    )
  )
)
