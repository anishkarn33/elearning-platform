import { NextResponse, type NextRequest } from "next/server"
import jwt, { JwtPayload } from "jsonwebtoken"

import { accessTokenKey } from "./config/localstorage"
import { routes } from "./config/routes"
import { siteConfig } from "./config/site"
import { DecodedToken, USER_TYPES } from "./types/user"

export function middleware(req: NextRequest) {
  const requestHeaders = new Headers(req.headers)
  // to get pathname in generateMetadata , you need set "x-url here
  requestHeaders.set("x-url", req.url)
  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })

  const tokenCookie = req.cookies.get(accessTokenKey)
  const token = tokenCookie ? tokenCookie.value : null
  const isAuth = !!token
  let isInstructor = false

  if (isAuth) {
    try {
      const decodedToken = jwt.decode(token) as DecodedToken
      isInstructor = decodedToken.user_type === USER_TYPES.INSTRUCTOR
    } catch (error) {
      console.error("Invalid token", error)
      return NextResponse.redirect(new URL(routes.LOGIN, req.url))
    }
  }
  const isAuthPage =
    req.nextUrl.pathname.startsWith(routes.LOGIN) ||
    req.nextUrl.pathname.startsWith(routes.SIGNUP) ||
    req.nextUrl.pathname.startsWith(routes.FORGOT_PASSWORD)

  const isProtectedPage =
    req.nextUrl.pathname.startsWith(routes.EXPLORE) ||
    req.nextUrl.pathname.startsWith(routes.CHAT) ||
    req.nextUrl.pathname.startsWith(routes.DASHBOARD) ||
    req.nextUrl.pathname.startsWith(routes.DASHBOARD_COURSE_DETAIL) ||
    req.nextUrl.pathname.startsWith(routes.DASHBOARD_COURSE_DETAIL_STUDENTS) ||
    req.nextUrl.pathname.startsWith(routes.PROFILE)

  const isNeutralPage =
    // Optional user context
    req.nextUrl.pathname.startsWith(routes.LOGOUT) ||
    // No user context
    req.nextUrl.pathname.startsWith(routes.ABOUT) ||
    req.nextUrl.pathname.startsWith(routes.TERMS) ||
    req.nextUrl.pathname.startsWith(routes.PRIVACY) ||
    req.nextUrl.pathname.startsWith(routes.HELP) ||
    req.nextUrl.pathname.startsWith(routes.SUPPORT) ||
    req.nextUrl.pathname.startsWith(routes.CONTACT)

  const isHomePage = req.nextUrl.pathname === routes.HOME

  if (isNeutralPage) {
    return response
  }

  if (isHomePage) {
    if (isInstructor) {
      return NextResponse.redirect(
        new URL(siteConfig.defaultAdminRoute, req.url)
      )
    } else {
      return NextResponse.redirect(new URL(siteConfig.defaultRoute, req.url))
    }
  }

  if (isAuthPage) {
    if (isInstructor) {
      return NextResponse.redirect(
        new URL(siteConfig.defaultAdminRoute, req.url)
      )
    }

    if (isAuth) {
      if (isInstructor) {
        return NextResponse.redirect(
          new URL(siteConfig.defaultAdminRoute, req.url)
        )
      } else {
        return NextResponse.redirect(new URL(siteConfig.defaultRoute, req.url))
      }
    }
  }

  if (!isAuth && isProtectedPage) {
    let from = req.nextUrl.pathname
    if (req.nextUrl.search) {
      from += req.nextUrl.search
    }

    return NextResponse.redirect(
      new URL(`${routes.LOGIN}?redirect=${encodeURIComponent(from)}`, req.url)
    )
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    {
      source: "/((?!api|_next/static|_next/image|favicon.ico).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },

    {
      source: "/((?!api|_next/static|_next/image|favicon.ico).*)",
      has: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },

    {
      source: "/((?!api|_next/static|_next/image|favicon.ico).*)",
      has: [{ type: "header", key: "x-present" }],
      missing: [{ type: "header", key: "x-missing", value: "prefetch" }],
    },
  ],
}
