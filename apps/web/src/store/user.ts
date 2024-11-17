"use client"

import { User } from "@/types/user"
import Cookies from "js-cookie"
import { create } from "zustand"
import { devtools, persist } from "zustand/middleware"

export const currentUserKey = "currentUser"

interface UserState {
  user?: User
  saveUser: (user: User) => void
  clearUser: () => void
  init: () => void
}

export const useUserStore = create<UserState>()(
  devtools(
    persist(
      (set) => ({
        saveUser: (user) => {
          localStorage.setItem(currentUserKey, JSON.stringify(user))
          Cookies.set(currentUserKey, JSON.stringify(user), {
            expires: 7,
          })
          set({ user })
        },
        clearUser: () => {
          localStorage.removeItem(currentUserKey)
          Cookies.remove(currentUserKey)
          set({ user: undefined })
        },
        init: () => {
          const currentUserString = localStorage.getItem(currentUserKey)

          if (currentUserString) {
            let user: User

            try {
              user = JSON.parse(currentUserString)
              set({
                user,
              })
              Cookies.set(currentUserKey, JSON.stringify(user))
            } catch (e) {}
          }
        },
      }),
      {
        name: "user-storage",
      }
    )
  )
)
