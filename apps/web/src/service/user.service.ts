"use client"

import { HttpConfig, handleApiError } from "@/lib/http"
import { interpolate } from "@/lib/utils"
import BaseService, { IBaseService } from "@/service/base.service"
import { MeResponse, User, UserResponse, UserUpdateRequest } from "@/types/user"

export interface IUserService extends IBaseService {}

export default class UserService extends BaseService implements IUserService {
  constructor(httpConfig: HttpConfig) {
    super(httpConfig)
  }

  async me(): Promise<MeResponse> {
    try {
      const response = await this.http.get<MeResponse>(interpolate(`/users/me`))
      return response.data
    } catch (error) {
      if (this.http.isAxiosError(error)) {
        throw handleApiError(error)
      }
      throw error
    }
  }

  async updateUser(user: UserUpdateRequest): Promise<User> {
    try {
      const response = await this.http.put<User>("/users/me", { user })
      return response.data
    } catch (error) {
      if (this.http.isAxiosError(error)) {
        throw handleApiError(error)
      }
      throw error
    }
  }

  async getUser(id: number): Promise<UserResponse> {
    try {
      const response = await this.http.get<UserResponse>(
        interpolate("/users/:id", { id })
      )
      return response.data
    } catch (error) {
      if (this.http.isAxiosError(error)) {
        throw handleApiError(error)
      }
      throw error
    }
  }
}
