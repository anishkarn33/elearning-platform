import { ConfigApi, rtkQueryErrorLogger } from "@/service"
import { combineReducers, configureStore } from "@reduxjs/toolkit"
import {
  FLUSH,
  PAUSE,
  PERSIST,
  PURGE,
  PersistConfig,
  REGISTER,
  REHYDRATE,
  persistReducer,
} from "redux-persist"
import storage from "redux-persist/lib/storage"

import courseReducer from "./course-slice"
import userReducer from "./user-slice"

/**
 * @remarks
 * set the persist configuration
 *
 * @resources
 * Usage with redux persist: https://redux-toolkit.js.org/usage/usage-guide#use-with-redux-persist
 * Helpful tutorial: https://edvins.io/how-to-use-redux-persist-with-redux-toolkit
 * Splitting the rtk-query api: https://stackoverflow.com/questions/71466817/splitting-api-definitions-with-rtk-query
 */
const persistConfig = {
  key: "root",
  version: 1,
  storage,
  blacklist: [ConfigApi.reducerPath, "course"],
}

// combine reducers
const reducers = combineReducers({
  user: userReducer,
  course: courseReducer,
  [ConfigApi.reducerPath]: ConfigApi.reducer,
})

// set the persisting reducers
const persistedReducers = persistReducer({ ...persistConfig }, reducers)

// configure the store
export const store = configureStore({
  reducer: persistedReducers,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      thunk: true,
      immutableCheck: false,
      serializableCheck: false,
      actionCreatorCheck: false,
      // serializableCheck: {
      //   ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      // },
    }).concat(ConfigApi.middleware, rtkQueryErrorLogger),
  // }).concat(ConfigApi.middleware),
})

// export the redux dispatch and root states
export type AppDispatch = typeof store.dispatch
export type RootState = ReturnType<typeof store.getState>
