import { StaticImageData } from "next/image"

import { ApiResponse, ListApiResponse } from "."

export enum USER_TYPES {
  SUPER_ADMIN = 3,
  INSTRUCTOR = 2,
  USER = 1,
}

export interface BaseUser {
  id: number
  username: string
  email: string
  phone?: string
  bio?: string
  avatar?: string
  title?: string
  firstName?: string
  lastName?: string
  location?: string
  isEmailVerified?: boolean
  userType?: USER_TYPES
  createdAt?: string
}

export interface User extends BaseUser {}

export type CurrentUser = User &
  TokenData & {
    loggedIn: boolean
  }

export type LoginRequest = {
  username: string
  password: string
}

export type TokenData = {
  access: string
  refresh: string
}

export type LoginResponse = ApiResponse<TokenData>

export type MeResponse = ApiResponse<User>

export type UserResponse = ApiResponse<User>

export type UserListResponse = ListApiResponse<User>

export type ChangePasswordRequest = {
  old_password: string
  new_password: string
}

export type ChangePasswordResponse = ApiResponse

export type SignupRequest = {
  firstName: string
  lastName: string
  username: string
  email: string
  password: string
}

export type UserUpdateRequest = Pick<
  User,
  | "firstName"
  | "lastName"
  | "username"
  | "bio"
  | "avatar"
  | "location"
  | "phone"
>

export type SignupResponse = ApiResponse<User>

// standard claims https://datatracker.ietf.org/doc/html/rfc7519#section-4.1
export interface JwtPayload {
  [key: string]: any
  iss?: string | undefined
  sub?: string | undefined
  aud?: string | string[] | undefined
  exp?: number | undefined
  nbf?: number | undefined
  iat?: number | undefined
  jti?: string | undefined
}

export interface DecodedToken extends JwtPayload {
  user_type: USER_TYPES
  is_superadmin: boolean
}

export type UserCourseStats = {
  courseCount?: number // student
  totalCompletedCourses?: number // student
  totalCourseCount?: number // instructor
  publishedCourseCount?: number // instructor
  totalStudentsCount?: number // instructor
}

export type UserCourseStatsResponse = ApiResponse<UserCourseStats>
