import { accessTokenKey, refreshTokenKey } from "@/config/localstorage"
import { AuthApi, UserApi } from "@/service"
import { CurrentUser, TokenData, User } from "@/types/user"
import { PayloadAction, createSlice } from "@reduxjs/toolkit"
import Cookies from "js-cookie"

/**
 * Define the initial user
 */
const initialUser: Partial<CurrentUser> = {
  loggedIn: false,
}

/**
 * Define the intiaial user slice object
 * @resources
 * https://redux-toolkit.js.org/api/createSlice
 */
const userSlice = createSlice({
  name: "user",
  initialState: initialUser,

  /**
   * Define the reducers for this slice
   */
  reducers: {
    logout: (state) => {
      state = initialUser
    },
    login: (state, action: PayloadAction<CurrentUser>) => {
      state = { ...state, ...action.payload }
    },
    tokenUpdated: (state, action: PayloadAction<TokenData>) => {
      state = { ...state, ...action.payload }
    },
    updateCurrentUser: (state, action: PayloadAction<User>) => {
      state = { ...state, ...action.payload }
    },
  },

  /**
   * For syncing with rtk-query, updating the local state when a query fetches
   *
   * @remarks
   * Only need these extra reducers for many actions that are handling the universal state for the user
   */
  extraReducers: (builder) => {
    /**
     * When user signs in, set the local state to the returned private user data
     *
     * @param {*} _state
     * @param {*} action
     * @return {*}
     */
    builder.addMatcher(
      AuthApi.endpoints.signIn.matchFulfilled,
      (_state, action) => {
        Cookies.set(accessTokenKey, action.payload.data.access)
        Cookies.set(refreshTokenKey, action.payload.data.refresh)
        return { ...action.payload.data, loggedIn: true }
      }
    )

    /**
     * When user signs out, reset the state to the initial user
     *
     * @param {*} _state
     * @param {PayloadAction<PrivateUserData>} action
     * @return {*}
     */
    builder.addMatcher(
      AuthApi.endpoints.signOut.matchFulfilled,
      () => initialUser
    )

    builder.addMatcher(
      AuthApi.endpoints.signOut.matchRejected,
      () => initialUser
    )

    builder.addMatcher(
      UserApi.endpoints.updateCurrentUser.matchFulfilled,
      (state, action) => {
        return { ...state, ...action.payload.data }
      }
    )

    builder.addMatcher(
      UserApi.endpoints.getCurrentUser.matchFulfilled,
      (state, action) => {
        return { ...state, ...action.payload.data }
      }
    )
  },
})

/**
 * Export the corresponding redux actions
 */
export const { tokenUpdated, logout, login, updateCurrentUser } =
  userSlice.actions
export default userSlice.reducer
