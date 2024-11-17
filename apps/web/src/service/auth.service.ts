"use client"

import { HttpConfig, handleApiError } from "@/lib/http"
import {
  ChangePasswordRequest,
  ChangePasswordResponse,
  LoginRequest,
  LoginResponse,
  SignupRequest,
  SignupResponse,
} from "@/types/user"

import BaseService, { IBaseService } from "./base.service"

export interface IAuthService extends IBaseService {
  login(data: LoginRequest): Promise<LoginResponse>
  signup(data: SignupRequest): Promise<SignupResponse>
}

export default class AuthService extends BaseService implements IBaseService {
  constructor(httpConfig: HttpConfig) {
    super(httpConfig)
  }

  async login(data: LoginRequest): Promise<LoginResponse> {
    try {
      const response = await this.http.post<LoginResponse>(
        "/auth/jwt/create",
        data
      )
      return response.data
    } catch (error) {
      if (this.http.isAxiosError(error)) {
        throw handleApiError(error)
      }
      throw error
    }
  }

  async signup(data: SignupRequest): Promise<SignupResponse> {
    try {
      const response = await this.http.post<SignupResponse>("/users", data)
      return response.data
    } catch (error) {
      if (this.http.isAxiosError(error)) {
        throw handleApiError(error)
      }
      throw error
    }
  }

  async changePassword(
    data: ChangePasswordRequest
  ): Promise<ChangePasswordResponse> {
    try {
      const response = await this.http.post<ChangePasswordResponse>(
        "/users/change-password",
        {
          old_password: data.old_password,
          new_password: data.new_password,
        }
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
