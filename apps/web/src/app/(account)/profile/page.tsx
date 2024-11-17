"use client"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { toast } from "@/components/ui/sonner"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { formatDate } from "@/lib/utils"
import { UserApi } from "@/service"
import {
  Calendar,
  Check,
  Github,
  Link2,
  Linkedin,
  Mail,
  MapPin,
  Pencil,
  Twitter,
  X,
} from "lucide-react"

export default function Component() {
  const socialLinks = {
    twitter: "https://twitter.com",
    linkedin: "https://linkedin.com/",
    github: "https://github.com/",
  }

  const { data: myCourseStatsData } = UserApi.useGetMyCourseStatsQuery()
  const myCourseStats = myCourseStatsData?.data
  const { data: myCoursesData } = UserApi.useGetMyCoursesQuery({
    page: 1,
    page_size: 100,
  })
  const myCourses = myCoursesData?.data?.results || []
  const { data: currentUserData, refetch: refetchCurrentUser } =
    UserApi.useGetCurrentUserQuery()
  const currentUser = currentUserData?.data
  const [triggerUpdateUser, updateUserResult] =
    UserApi.useUpdateCurrentUserMutation()

  const [editingStatus, setEditingStatus] = useState(false)
  const [tempEditValue, setTempEditValue] = useState("")

  const handleStatusEdit = () => {
    setEditingStatus(true)
    setTempEditValue(currentUser?.bio || "")
  }

  const handleStatusSave = async () => {
    const body = {
      first_name: currentUser?.firstName,
      username: currentUser?.username,
      email: currentUser?.email,
      last_name: currentUser?.lastName,
      bio: tempEditValue,
    }
    toast.promise(triggerUpdateUser({ ...body }).unwrap(), {
      loading: "Saving...",
      success: async () => {
        await refetchCurrentUser()
        setEditingStatus(false)
        return "Status updated"
      },
      error: "Error updating status",
    })
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-4">
                  <Avatar className="w-20 h-20">
                    <AvatarImage
                      src={currentUser?.avatar}
                      alt={currentUser?.username}
                    />
                    <AvatarFallback>
                      {currentUser?.firstName?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle>
                      {currentUser?.firstName} {currentUser?.lastName}
                    </CardTitle>
                    <CardDescription>@{currentUser?.username}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="w-64">
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <p className="text-muted-foreground line-clamp-1">
                      {currentUser?.bio}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center">
                        <MapPin className="mr-2 h-4 w-4" />
                        {currentUser?.location}
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center">
                        <Mail className="mr-2 h-4 w-4" />
                        {currentUser?.email}
                      </div>
                    </div>
                    <div className="flex items-center text-sm">
                      <Calendar className="mr-2 h-4 w-4" />
                      Joined {formatDate(currentUser?.createdAt || new Date())}
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <div className="flex space-x-4">
                  <Button variant="outline" size="icon">
                    <Twitter className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon">
                    <Linkedin className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon">
                    <Github className="h-4 w-4" />
                  </Button>
                </div>
              </CardFooter>
            </Card>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle>User Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Courses Enrolled</span>
                      <span>{myCourseStats?.courseCount || 0}</span>
                    </div>
                    <Progress
                      value={
                        myCourseStats?.totalCompletedCourses &&
                        myCourseStats?.courseCount
                          ? (myCourseStats?.totalCompletedCourses /
                              myCourseStats?.courseCount) *
                            100
                          : 0
                      }
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Courses Completed</span>
                      <span>{myCourseStats?.totalCompletedCourses}</span>
                    </div>
                    <Progress
                      value={
                        myCourseStats?.totalCompletedCourses &&
                        myCourseStats?.courseCount
                          ? (myCourseStats?.totalCompletedCourses /
                              myCourseStats?.courseCount) *
                            100
                          : 0
                      }
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Certificates Earned</span>
                      <span>{0}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="md:col-span-2">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Current Status</CardTitle>
              </CardHeader>
              <CardContent>
                {editingStatus ? (
                  <div className="space-y-2">
                    <Textarea
                      value={tempEditValue}
                      onChange={(e) => setTempEditValue(e.target.value)}
                      className="w-full"
                    />
                    <div className="flex justify-end space-x-2">
                      <Button onClick={() => setEditingStatus(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleStatusSave}>Save</Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-between items-center">
                    <p className="text-lg font-medium">{currentUser?.bio}</p>
                    <Button variant="ghost" onClick={handleStatusEdit}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            <Tabs defaultValue="courses" className="w-full">
              <TabsList>
                <TabsTrigger value="courses">Enrolled Courses</TabsTrigger>
                <TabsTrigger value="achievements">
                  Recent Achievements
                </TabsTrigger>
              </TabsList>
              <TabsContent value="courses">
                <Card>
                  <CardHeader>
                    <CardTitle>Enrolled Courses</CardTitle>
                    <CardDescription>
                      Courses that {currentUser?.firstName} is currently taking
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {myCourses?.map((course) => (
                        <div key={course.id} className="border rounded-lg p-4">
                          <div className="flex justify-between items-center mb-2">
                            <h3 className="font-semibold">{course.title}</h3>
                            <Badge>{0}%</Badge>
                          </div>
                          <Progress value={0} />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="achievements">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Achievements</CardTitle>
                    <CardDescription>
                      Latest accomplishments and milestones
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-4">
                      {myCourses.map((achievement, index) => (
                        <li key={index} className="flex items-center">
                          <Badge className="mr-2" variant="secondary">
                            {index + 1}
                          </Badge>
                          {achievement.title}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  )
}
