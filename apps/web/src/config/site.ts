import { routes } from "./routes"

export type SiteConfig = typeof siteConfig

export const siteConfig = {
  name: "eLearner: An online learning Platform",
  description:
    "eLearner is an online learning platform that offers courses on various topics.",
  mainNav: [
    {
      title: "Home",
      href: routes.EXPLORE,
    },
    {
      title: "Courses",
      href: routes.EXPLORE,
    },
    {
      title: "Chat",
      href: routes.CHAT,
    },
    {
      title: "About",
      href: routes.ABOUT,
    },
  ],
  defaultRoute: routes.EXPLORE,
  defaultAdminRoute: routes.DASHBOARD_COURSES,
  links: {
    twitter: "https://twitter.com/elearner",
    github: "https://github.com/elearner",
    instagram: "https://instagram.com/elearner",
    linkedin: "https://linkedin.com/company/elearner",
    web: "https://elearner.com",
  },
}
