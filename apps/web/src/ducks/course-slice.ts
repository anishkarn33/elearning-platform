import { PayloadAction, createSlice } from "@reduxjs/toolkit"

/**
 * Define the initial user
 */
const initialCourse: {} = {}

/**
 * Define the intiaial user slice object
 * @resources
 * https://redux-toolkit.js.org/api/createSlice
 */
const courseSlice = createSlice({
  name: "course",
  initialState: initialCourse,

  /**
   * Define the reducers for this slice
   */
  reducers: {
    reset: (state) => {
      state = initialCourse
    },
  },
})

/**
 * Export the corresponding redux actions
 */
export const { reset } = courseSlice.actions
export default courseSlice.reducer
