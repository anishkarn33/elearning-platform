"use client"

import React, { useEffect } from "react"
import { GlobalAppProvider } from "@/components/global-context-provider"

type Props = { children: React.ReactNode }

const AppProviders: React.FC<Props> = ({ children }) => {
  // Wrap all providers here
  return <GlobalAppProvider>{children}</GlobalAppProvider>
}

export default AppProviders
