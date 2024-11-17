"use client"

import { useCallback, useMemo, useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useAppSelector } from "@/ducks/useful-hooks"
import { cn, formatDate } from "@/lib/utils"
import { ChatApi, sendMessage } from "@/service/chat-api"
import { ChatGroup, MESSAGE_TYPE } from "@/types/chat"
import { Send, Users } from "lucide-react"

export default function Component() {
  const currentUser = useAppSelector((state) => state.user)
  const [selectedGroup, setSelectedGroup] = useState<ChatGroup>()
  const [newMessage, setNewMessage] = useState("")

  const { data: chatGroupsData, isLoading: isChatGroupsLoading } =
    ChatApi.useGetAllChatGroupsQuery()

  const chatGroups = chatGroupsData?.data?.results || []

  const { data: messagesData, isLoading: isMessagesLoading } =
    ChatApi.useGetAllChatGroupMessagesQuery(
      {
        chatGroupId: selectedGroup?.id || 0,
        courseId: selectedGroup?.course || 0,
      },
      {
        skip:
          !Boolean(selectedGroup?.id) || !Boolean(selectedGroup?.course)
            ? true
            : false,
      }
    )

  const chatMessages = useMemo(() => {
    return [...(messagesData?.data?.results || [])].reverse()
  }, [messagesData])

  const handleSendMessage = useCallback(
    (e: React.FormEvent) => {
      console.log(newMessage.trim() && selectedGroup?.id)
      e.preventDefault()
      if (newMessage.trim() && selectedGroup?.id) {
        sendMessage(selectedGroup.id, {
          chat_group: selectedGroup.id,
          message_type: MESSAGE_TYPE.TEXT,
          text: newMessage,
        })
        setNewMessage("")
      }
    },
    [selectedGroup, newMessage]
  )

  return (
    <div className="h-75vh flex flex-col">
      <div className="flex-1 border-t flex overflow-hidden">
        <aside className="w-72 border-r bg-background overflow-y-auto">
          <div className="p-4">
            <h2 className="font-semibold mb-4">Message</h2>
            <ScrollArea className="h-[calc(100vh-10rem)]">
              {chatGroups.map((group) => (
                <Button
                  key={group.id}
                  variant={
                    selectedGroup?.id === group.id ? "secondary" : "ghost"
                  }
                  className="w-full justify-start mb-2 p-3 h-auto"
                  onClick={() => setSelectedGroup(group)}
                >
                  <div className="flex items-start w-full">
                    <Avatar className="h-10 w-10 mr-3">
                      <AvatarImage src={group?.photo} alt={group.name} />
                      <AvatarFallback>{group?.name?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 text-left">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold truncate">
                          {group.name}
                        </span>
                        <span
                          className={cn("text-xs text-muted-foreground", {
                            invisible: !group?.lastMessage,
                          })}
                        >
                          {formatDate(
                            group?.lastMessage?.createdAt || new Date()
                          )}
                        </span>
                      </div>
                      <p
                        className={cn(
                          "text-sm text-muted-foreground truncate mt-1",
                          {
                            invisible: !group?.lastMessage,
                          }
                        )}
                      >
                        <span className="font-medium">
                          {group?.lastMessage?.user?.firstName}:
                        </span>{" "}
                        {group?.lastMessage?.text}
                      </p>
                    </div>
                    {group.unread > 0 && (
                      <Badge variant="destructive" className="ml-2 shrink-0">
                        {group.unread}
                      </Badge>
                    )}
                  </div>
                </Button>
              ))}
            </ScrollArea>
          </div>
        </aside>

        <main className="flex-1 flex flex-col overflow-hidden">
          <div className="bg-background border-b p-4 min-h-16">
            <h2 className="font-semibold">{selectedGroup?.name}</h2>
            {selectedGroup && (
              <div className="flex items-center text-sm text-muted-foreground mt-1">
                <Users className="h-4 w-4 mr-1" />
                <span>Active</span>
              </div>
            )}
          </div>

          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {chatMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex items-start space-x-2 ${
                    msg.user.id === currentUser.id ? "justify-end" : ""
                  }`}
                >
                  {msg.user.id !== currentUser.id && (
                    <Avatar>
                      <AvatarImage
                        src={msg.user.avatar}
                        alt={msg.user.username}
                      />
                      <AvatarFallback>
                        {msg.user?.firstName?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div
                    className={`flex flex-col ${
                      msg.user.id === currentUser.id
                        ? "items-end"
                        : "items-start"
                    }`}
                  >
                    <div
                      className={`flex items-center space-x-2 ${
                        msg.user.id === currentUser.id ? "flex-row-reverse" : ""
                      }`}
                    >
                      <span className="font-semibold px-2">
                        {msg.user.firstName}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(msg.createdAt)}
                      </span>
                    </div>
                    <div
                      className={`rounded-lg px-3 py-2 mt-1 ${
                        msg.user.id === currentUser.id
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      }`}
                    >
                      <p className="text-sm">{msg.text}</p>
                    </div>
                  </div>
                  {msg.user.id === currentUser.id && (
                    <Avatar>
                      <AvatarImage
                        src={msg.user.avatar}
                        alt={msg.user.username}
                      />
                      <AvatarFallback>You</AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>

          <div className="p-4 border-t bg-background">
            <form onSubmit={handleSendMessage} className="flex space-x-2">
              <Input
                type="text"
                placeholder="Type your message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="flex-grow"
              />
              <Button type="submit">
                <Send className="h-4 w-4 mr-2" />
                Send
              </Button>
            </form>
          </div>
        </main>
      </div>
    </div>
  )
}
