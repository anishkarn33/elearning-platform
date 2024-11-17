import { DashboardConfig } from "@/types/index"
import { USER_TYPES } from "@/types/user"

export const dashboardConfig: DashboardConfig = {
  mainNav: [
    {
      title: "Super Admin",
      href: "/superadmin",
    },
  ],
  sidebarNav: [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: "laptop",
      allowedUserTypes: [USER_TYPES.INSTRUCTOR],
    },
    {
      title: "Courses",
      icon: "media",
      href:"/dashboard/courses",
      allowedUserTypes: [USER_TYPES.INSTRUCTOR],
      items: [
        {
          title: "Feedbacks",
          href: "/dashboard/courses/feedbacks",
          icon: "warning"
        },
      ],
    },
  ],
}
