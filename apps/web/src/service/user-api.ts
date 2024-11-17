import { constructSearchParams, interpolate } from "@/lib/utils"
import { BaseListApiQueryParams } from "@/types"
import { CourseListQueryParams, CourseListResponse } from "@/types/course"
import {
  MeResponse,
  UserCourseStatsResponse,
  UserListResponse,
  UserUpdateRequest,
} from "@/types/user"

import { ConfigApi } from "./config-api"

export const UserApi = ConfigApi.injectEndpoints({
  endpoints: (build) => ({
    getAllUsers: build.query<UserListResponse[], BaseListApiQueryParams>({
      query: (filters) => ({
        url: interpolate("/users/?:filters", {
          filters: constructSearchParams(filters),
        }),
      }),
    }),
    getCurrentUser: build.query<MeResponse, void>({
      query: (data) => ({
        url: "/users/me/",
      }),
    }),

    getUserById: build.query<MeResponse, string>({
      query: (id) => ({
        url: interpolate("/users/:id/profile/", { id }),
      }),
    }),

    updateCurrentUser: build.mutation<MeResponse, Partial<UserUpdateRequest>>({
      query: (body) => ({
        url: "/users/me/",
        method: "PUT",
        body,
      }),
    }),

    getMyCourses: build.query<CourseListResponse, CourseListQueryParams>({
      query: (filters) => ({
        url: interpolate("/users/my_courses/?:filters", {
          filters: constructSearchParams(filters),
        }),
      }),
    }),

    getMyCourseStats: build.query<UserCourseStatsResponse, void>({
      query: () => ({
        url: "/users/my_course_stats/",
      }),
    }),
  }),
  overrideExisting: true,
})
