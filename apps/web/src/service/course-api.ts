import { constructSearchParams, interpolate } from "@/lib/utils"
import { ApiResponse, BaseListApiQueryParams } from "@/types"
import {
  CourseCreateRequest,
  CourseDetailResponse,
  CourseFeedbackCreateRequest,
  CourseFeedbackSingleResponse,
  CourseFeedbacksResponse,
  CourseListQueryParams,
  CourseListResponse,
  CourseMaterialCreateRequest,
  CourseMaterialSingleResponse,
  CourseMaterialsResponse,
  CourseSingleResponse,
} from "@/types/course"
import { MeResponse, UserListResponse, UserUpdateRequest } from "@/types/user"

import { ConfigApi } from "./config-api"

export const CourseApi = ConfigApi.injectEndpoints({
  endpoints: (build) => ({
    /**
     * Courses
     */
    updateCourse: build.mutation<
      CourseSingleResponse,
      { id: number; body: Partial<CourseCreateRequest> }
    >({
      query: (data) => ({
        url: interpolate("/course/:id/", { id: data.id }),
        method: "PUT",
        body: data.body,
      }),
    }),

    getCourseById: build.query<CourseDetailResponse, number>({
      query: (id) => ({
        url: interpolate("/course/:id/", { id }),
      }),
    }),

    createCourse: build.mutation<CourseSingleResponse, CourseCreateRequest>({
      query: (body) => ({
        url: "/course/",
        method: "POST",
        body,
      }),
    }),

    deleteCourse: build.mutation<ApiResponse, number>({
      query: (id) => ({
        url: interpolate("/course/:id/", { id }),
        method: "DELETE",
      }),
    }),

    enrollCourse: build.mutation<ApiResponse, number>({
      query: (id) => ({
        url: interpolate("/course/:id/enroll/", { id }),
        method: "POST",
      }),
      invalidatesTags: ["Courses"],
    }),

    markCourseAsCompleted: build.mutation<ApiResponse, number>({
      query: (id) => ({
        url: interpolate("/course/:id/mark_complete/", { id }),
        method: "POST",
      }),
      invalidatesTags: ["Courses"],
    }),

    getMyCourses: build.query<CourseListResponse, CourseListQueryParams>({
      query: (data) => ({
        url: interpolate("/course/mine/?:filters", {
          filters: constructSearchParams(data),
        }),
      }),
      providesTags: ["Courses"],
    }),

    getAllCourses: build.query<CourseListResponse, CourseListQueryParams>({
      query: (data) => ({
        url: interpolate("/course/?:filters", {
          filters: constructSearchParams(data),
        }),
        providesTags: ["Courses"],
        keepUnusedDataFor: 0,
      }),
    }),

    /**
     * Course Materials
     */
    createCourseMaterial: build.mutation<
      CourseMaterialSingleResponse,
      { id: number; body: CourseMaterialCreateRequest }
    >({
      query: (data) => ({
        url: interpolate("/course/:id/materials/", { id: data.id }),
        method: "POST",
        body: data.body,
      }),
    }),

    updateCourseMaterial: build.mutation<
      CourseMaterialSingleResponse,
      { id: number; materialId: number; body: CourseMaterialCreateRequest }
    >({
      query: (data) => ({
        url: interpolate("/course/:id/materials/:materialId/", {
          id: data.id,
          materialId: data.materialId,
        }),
        method: "PUT",
        body: data.body,
      }),
    }),

    deleteCourseMaterial: build.mutation<
      ApiResponse,
      { id: number; materialId: number }
    >({
      query: (data) => ({
        url: interpolate("/course/:id/materials/:materialId/", {
          id: data.id,
          materialId: data.materialId,
        }),
        method: "DELETE",
      }),
    }),

    getCourseMaterials: build.query<
      CourseMaterialsResponse,
      { id: number; filters: BaseListApiQueryParams }
    >({
      query: (data) => ({
        url: interpolate("/course/:id/materials/?:filters", {
          id: data.id,
          filters: constructSearchParams(data.filters),
        }),
      }),
    }),

    /**
     * Course Feedbacks
     */
    createCourseFeedback: build.mutation<
      CourseFeedbackSingleResponse,
      { id: number; body: CourseFeedbackCreateRequest }
    >({
      query: (data) => ({
        url: interpolate("/course/:id/feedbacks/", { id: data.id }),
        method: "POST",
        body: data.body,
      }),
      invalidatesTags: ["Courses"],
    }),

    updateCourseFeedback: build.mutation<
      CourseFeedbackSingleResponse,
      { id: number; feedbackId: number; body: CourseFeedbackCreateRequest }
    >({
      query: (data) => ({
        url: interpolate("/course/:id/feedbacks/:feedbackId/", {
          id: data.id,
          feedbackId: data.feedbackId,
        }),
        method: "PUT",
        body: data.body,
      }),
    }),

    deleteCourseFeedback: build.mutation<
      ApiResponse,
      { id: number; feedbackId: number }
    >({
      query: (data) => ({
        url: interpolate("/course/:id/feedbacks/:feedbackId/", {
          id: data.id,
          feedbackId: data.feedbackId,
        }),
        method: "DELETE",
      }),
    }),

    getCourseFeedbacks: build.query<
      CourseFeedbacksResponse,
      { id: number; filters: BaseListApiQueryParams }
    >({
      query: (data) => ({
        url: interpolate("/course/:id/feedbacks/?:filters", {
          id: data.id,
          filters: constructSearchParams(data.filters),
        }),
      }),
    }),

    /**
     * Course Members
     */
    getCourseMembers: build.query<
      UserListResponse,
      { id: number; filters: BaseListApiQueryParams }
    >({
      query: (data) => ({
        url: interpolate("/course/:id/members/?:filters", {
          id: data.id,
          filters: constructSearchParams(data.filters),
        }),
      }),
    }),

    blockCourseMember: build.mutation<
      ApiResponse,
      { id: number; memberId: number }
    >({
      query: (data) => ({
        url: interpolate("/course/:id/members/:memberId/block_user/", {
          id: data.id,
          memberId: data.memberId,
        }),
        method: "POST",
      }),
    }),
  }),
  overrideExisting: true,
})
