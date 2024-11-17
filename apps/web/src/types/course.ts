import { ApiResponse, BaseListApiQueryParams, ListApiResponse } from "."
import { User } from "./user"

export enum COURSE_STATUS {
  PUBLISHED = "published",
  DRAFT = "draft",
  ARCHIVED = "archived",
}

export enum COURSE_MATERIAL_TYPE {
  IMAGE = "image",
  VIDEO = "video",
  AUDIO = "audio",
  DOCUMENT = "document",
  OTHER = "other",
}

export const COURSE_STATUS_LABELS_MAP = {
  [COURSE_STATUS.PUBLISHED]: "Published",
  [COURSE_STATUS.DRAFT]: "Draft",
  [COURSE_STATUS.ARCHIVED]: "Archived",
}

export const COURSE_MATERIAL_TYPE_LABELS_MAP = {
  [COURSE_MATERIAL_TYPE.IMAGE]: "Image",
  [COURSE_MATERIAL_TYPE.VIDEO]: "Video",
  [COURSE_MATERIAL_TYPE.AUDIO]: "Audio",
  [COURSE_MATERIAL_TYPE.DOCUMENT]: "Document",
  [COURSE_MATERIAL_TYPE.OTHER]: "Other",
}

export interface Course {
  id: number
  title: string
  description?: string

  duration: string
  category: string
  instructor: User

  isEnrolled?: boolean
  membersCount?: number
  averageRating?: number
  totalFeedbacks?: number

  status: COURSE_STATUS

  coverUrl: string
  createdAt?: string
  updatedAt?: string
}

export interface CourseDetail extends Course {
  materials: CourseMaterial[]
  feedbacks: CourseFeedback[]
}

export interface CourseMaterial {
  id: number
  title: string
  duration: string
  description: string
  url: string
  fileType: COURSE_MATERIAL_TYPE
  fileName: string
  thumnailUrl: string
  createdAt: string
  updatedAt: string
}

export interface CourseFeedback {
  id: number
  rating: number
  feedback: string
  createdAt: string
  user: User
}

export interface CourseMember
  extends Pick<
    User,
    "id" | "firstName" | "lastName" | "email" | "bio" | "avatar"
  > {
  is_user_blocked?: boolean
  is_course_completed?: boolean
}

export type CourseSingleResponse = ApiResponse<Course>
export type CourseDetailResponse = ApiResponse<CourseDetail>
export type CourseMaterialSingleResponse = ApiResponse<CourseMaterial>
export type CourseFeedbackSingleResponse = ApiResponse<CourseFeedback>

export type CourseListResponse = ListApiResponse<Course>

export interface CourseCreateRequest {
  title: string
  description: string
  duration: string
  category: string
  status: COURSE_STATUS
  cover_url: string
}

export interface CourseMaterialCreateRequest {
  title: string
  description: string
  url: string
  duration: string
  file_type: string
  thumnail_url?: string
  course_id?: number
}

export interface CourseFeedbackCreateRequest {
  rating: number
  feedback: string
  course: number // course id
}

export type CourseListQueryParams = BaseListApiQueryParams & {
  title?: string
}

export type CourseMaterialsResponse = ListApiResponse<CourseMaterial>
export type CourseMembersResponse = ListApiResponse<CourseMember>
export type CourseFeedbacksResponse = ListApiResponse<CourseFeedback>
