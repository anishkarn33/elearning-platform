import "@/styles/globals.css"
import "@radix-ui/themes/styles.css"
import { Metadata, Viewport } from "next"
import { SiteHeader } from "@/components/site-header"
import { SiteTopHeader } from "@/components/site-top-header"
import { TailwindIndicator } from "@/components/tailwind-indicator"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner"
import { siteConfig } from "@/config/site"
import AppProviders from "@/contexts"
import { fontSans } from "@/lib/fonts"
import { cn } from "@/lib/utils"

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s - ${siteConfig.name}`,
  },
  description: siteConfig.description,
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
}

interface RootLayoutProps {
  children: React.ReactNode
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <>
      <html lang="en" suppressHydrationWarning>
        <head />
        <body
          className={cn(
            "bg-background min-h-screen font-sans antialiased",
            fontSans.variable
          )}
        >
          <AppProviders>
            <ThemeProvider attribute="class" defaultTheme="dark">
              <div className="relative flex min-h-screen flex-col">
                <SiteTopHeader />
                <div className="sticky right-4 top-12 mr-4 md:top-16">
                  <SiteHeader />
                </div>
                <div className="flex-1">{children}</div>
              </div>
              <Toaster />
              <TailwindIndicator />
            </ThemeProvider>
          </AppProviders>
        </body>
      </html>
    </>
  )
}
