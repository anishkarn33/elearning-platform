import { ListApiResponse } from "."
import { User } from "./user"

export enum CHAT_GROUP_TYPE {
  GROUP = "group",
  INDIVIDUAL = "individual",
}

export interface ChatGroup {
  id: number
  name?: string
  description?: string
  photo?: string
  chatType: CHAT_GROUP_TYPE
  course: number
  blocked: boolean
  createdAt?: string
  isActive: boolean
  isAdmin: boolean
  isPublic: boolean
  isDeleted: boolean
  lastMessage?: ChatMessage // TODO
  unread: number
  updatedAt?: string
  user?: User
  removedAt?: string
}

export enum MESSAGE_TYPE {
  TEXT = "text",
}

export interface ChatMessage {
  id: number
  text: string
  messageType: MESSAGE_TYPE
  chatGroup: number
  createdAt: string
  updatedAt: string
  removedAt: string
  isDeletedBySender: boolean
  isDeletedByAdmin: boolean
  isRead: boolean
  files: any[] // TODO
  user: User
}

export type NewMessageRequest = {
  text: string
  message_type: MESSAGE_TYPE
  chat_group: number
}

export type ChatGroupListResponse = ListApiResponse<ChatGroup>

export type MessageListResponse = ListApiResponse<ChatMessage>

// Web Socket
export enum SocketSendAction {
  TYPING = "chat_typing",
  MESSAGE = "chat_message",
}

export type SocketSendMessage<T> = {
  action: T
  data: T extends SocketSendAction.MESSAGE ? NewMessageRequest : null
}

export type SocketReceiveMessage<T> = {
  action: T
  data: T extends SocketSendAction.TYPING
    ? { user: User }
    : T extends SocketSendAction.MESSAGE
    ? ChatMessage
    : null
}

export const isSocketMessage = (
  data: any
): data is SocketReceiveMessage<any> => {
  return (
    data.action === SocketSendAction.MESSAGE ||
    data.action === SocketSendAction.TYPING
  )
}
