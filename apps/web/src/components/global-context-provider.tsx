"use client"

import * as React from "react"
import { store } from "@/ducks/store"
import { useAuthStore } from "@/store/auth"
import { useUserStore } from "@/store/user"
import { User } from "@/types/user"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { Provider as ReduxProvider } from "react-redux"
import { persistStore } from "redux-persist"
import { PersistGate } from "redux-persist/integration/react"

const persistor = persistStore(store)

const queryClient = new QueryClient()

interface GlobalAppProviderProps {
  children: React.ReactNode
}

export function GlobalAppProvider({
  children,
  ...props
}: GlobalAppProviderProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <ReduxProvider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          {children}
        </PersistGate>
      </ReduxProvider>
    </QueryClientProvider>
  )
}
