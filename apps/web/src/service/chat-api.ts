import { accessTokenKey } from "@/config/localstorage"
import { env } from "@/env.mjs"
import { constructSearchParams, interpolate } from "@/lib/utils"
import {
  ChatGroupListResponse,
  MessageListResponse,
  NewMessageRequest,
  SocketReceiveMessage,
  SocketSendAction,
  SocketSendMessage,
  isSocketMessage,
} from "@/types/chat"
import { CourseListQueryParams, CourseListResponse } from "@/types/course"
import { Nullable, Optional } from "@/types/mixins"
import {
  MeResponse,
  UserCourseStatsResponse,
  UserUpdateRequest,
} from "@/types/user"
import Cookies from "js-cookie"
import { number } from "zod"

import { ConfigApi } from "./config-api"

let chatGroupListeners = {} // Map to track listeners for each chat group
export let wsMap = new Map<number, WebSocket>()

// Function to send a message over the WebSocket
export const sendMessage = (
  chatGroupId: number,
  message: NewMessageRequest
) => {
  let ws: Optional<WebSocket> = wsMap.get(chatGroupId)
  if (ws && ws.readyState === WebSocket.OPEN) {
    const messageData: SocketSendMessage<SocketSendAction.MESSAGE> = {
      action: SocketSendAction.MESSAGE, // action type (or whatever your backend expects)
      data: message, // message content
    }
    ws.send(JSON.stringify(messageData)) // Send the message over WebSocket
  } else {
    console.error("WebSocket is not connected.")
  }
}

export const ChatApi = ConfigApi.injectEndpoints({
  endpoints: (build) => ({
    getAllChatGroups: build.query<ChatGroupListResponse, void>({
      query: () => ({
        url: "/course/chat_groups/",
      }),
    }),
    getAllChatGroupMessages: build.query<
      MessageListResponse,
      { courseId: number; chatGroupId: number }
    >({
      query: (data) => ({
        url: interpolate("/course/:courseId/chat/:chatGroupId/message/", data),
      }),
      async onCacheEntryAdded(
        arg,
        { updateCachedData, cacheDataLoaded, cacheEntryRemoved }
      ) {
        // Check if WebSocket connection is already established
        let ws: Optional<WebSocket> = wsMap.get(arg.chatGroupId)
        if (!ws) {
          const token = Cookies.get(accessTokenKey)
          if (!token) return
          ws = new WebSocket(
            `${env.NEXT_PUBLIC_BASE_WS_URL}/socket/chat/${arg.chatGroupId}/?token=${token}`
          )
          ws.onopen = () => {
            console.log("WebSocket connection established")
          }
          wsMap.set(arg.chatGroupId, ws)
        }

        try {
          // wait for the initial query to resolve before proceeding
          await cacheDataLoaded

          // when data is received from the socket connection to the server,
          // if it is a message and for the appropriate channel,
          // update our query result with the received message
          const listener = (event: MessageEvent) => {
            const data = JSON.parse(
              event.data
            ) as SocketReceiveMessage<SocketSendAction.MESSAGE>
            console.log("data", data)
            console.log("isSocketMessage", !isSocketMessage(data))
            console.log(
              "isSocketMessage",
              isSocketMessage(data) && data.action === SocketSendAction.MESSAGE
            )
            if (!isSocketMessage(data)) return

            if (
              isSocketMessage(data) &&
              data.action === SocketSendAction.MESSAGE
            ) {
              console.log("data", data)

              updateCachedData((draft) => {
                // append at the start of the list
                draft.data.results = [
                  (data as SocketReceiveMessage<SocketSendAction.MESSAGE>)
                    ?.data,
                  ...draft.data.results,
                ]
                console.log("draft", draft.data.results)
              })
            }
          }

          ws.addEventListener("message", listener)
        } catch {
          // no-op in case `cacheEntryRemoved` resolves before `cacheDataLoaded`,
          // in which case `cacheDataLoaded` will throw
        }
        // cacheEntryRemoved will resolve when the cache subscription is no longer active
        await cacheEntryRemoved
        // perform cleanup steps once the `cacheEntryRemoved` promise resolves
        ws.close()
      },
    }),
  }),
  overrideExisting: true,
})
