"use client"

import { useState } from "react"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { toast } from "@/components/ui/sonner"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { routes } from "@/config/routes"
import { useDebounce } from "@/hooks/use-debounce"
import { interpolate } from "@/lib/utils"
import { UserApi } from "@/service"
import { CourseApi } from "@/service/course-api"
import { COURSE_STATUS, COURSE_STATUS_LABELS_MAP, Course } from "@/types/course"
import { UserCourseStats } from "@/types/user"
import {
  BookOpen,
  DollarSign,
  MoreVertical,
  Pencil,
  Plus,
  Search,
  Trash2,
  Upload,
  Users,
} from "lucide-react"

export default function Component() {
  const [searchTerm, setSearchTerm] = useState("")
  const debouncedSearch = useDebounce(searchTerm, 500)
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false)

  // new course states
  const [newTitle, setNewTitle] = useState("")
  const [newCoverUrl, setNewCoverUrl] = useState("")
  const [newType, setNewType] = useState("Web Development")
  const [newDuration, setNewDuration] = useState("")
  const [newDescription, setNewDescription] = useState("")

  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const {
    data: coursesData,
    isLoading,
    refetch: refetchCourses,
  } = UserApi.useGetMyCoursesQuery({
    page,
    page_size: pageSize,
    title: debouncedSearch,
  })

  const {
    data: courseStatsData,
    isLoading: isCourseStatsLoading,
    refetch: refetchStats,
  } = UserApi.useGetMyCourseStatsQuery()

  const [triggerCreateCourse, newCourseResult] =
    CourseApi.useCreateCourseMutation()

  const [triggerUpdateCourse, updateCourseResult] =
    CourseApi.useUpdateCourseMutation()

  const totalCourses = coursesData?.data?.count || 0
  const courses = coursesData?.data?.results || []

  const courseStats = (courseStatsData?.data || {}) as Partial<UserCourseStats>

  const filteredCourses = courses.filter((course) =>
    course.title.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const totalStudents = courseStats?.totalStudentsCount || 0
  const totalCourse = courseStats?.totalCourseCount || 0
  const publishedCourses = courseStats?.publishedCourseCount || 0

  const handlePublishCourse = async (course: Course) => {
    const body = {
      status: COURSE_STATUS.PUBLISHED,
      title: course.title,
      description: course.description,
      duration: course.duration,
      category: course.category,
    }

    toast.promise(triggerUpdateCourse({ id: course.id, body }).unwrap(), {
      loading: "Publishing...",
      success: async () => {
        await refetchCourses()
        await refetchStats()
        return "Course published successfully"
      },
      error: "Error publishing course",
    })
  }

  const handleArchiveCourse = async (course: Course) => {
    const body = {
      status: COURSE_STATUS.ARCHIVED,
      title: course.title,
      description: course.description,
      duration: course.duration,
      category: course.category,
    }

    toast.promise(triggerUpdateCourse({ id: course.id, body }).unwrap(), {
      loading: "Archiving...",
      success: async () => {
        await refetchCourses()
        await refetchStats()
        return "Course archived successfully"
      },
      error: "Error archiving course",
    })
  }

  const handleCreateCourse = async () => {
    const newCourse = {
      title: newTitle,
      cover_url: newCoverUrl,
      duration: newDuration,
      category: newType,
      status: COURSE_STATUS.DRAFT,
      description: newDescription,
    }

    toast.promise(triggerCreateCourse(newCourse).unwrap(), {
      loading: "Creating...",
      success: async () => {
        setNewTitle("")
        setNewCoverUrl("")
        setNewType("")
        setNewDescription("")

        await refetchCourses()
        await refetchStats()
        setIsUploadDialogOpen(false)
        return "Course created successfully"
      },
      error: "Error creating course",
    })
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">LearnHub Instructor Dashboard</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Students
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {totalStudents.toLocaleString()}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Course
              </CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {totalCourse.toLocaleString()}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Published Courses
              </CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{publishedCourses}</div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold">Your Courses</h2>
          <Dialog
            open={isUploadDialogOpen}
            onOpenChange={setIsUploadDialogOpen}
          >
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" /> Add new course
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add New Course</DialogTitle>
                <DialogDescription>
                  Fill in the details to add a new course
                </DialogDescription>
              </DialogHeader>
              <form className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="title" className="text-left">
                    Title
                  </Label>
                  <Input
                    id="title"
                    className="col-span-3"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="cover_url" className="text-left">
                    Cover URL
                  </Label>
                  <Input
                    id="cover_url"
                    className="col-span-3"
                    value={newCoverUrl}
                    onChange={(e) => setNewCoverUrl(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="type" className="text-left">
                    Category
                  </Label>
                  <Input
                    id="type"
                    className="col-span-3"
                    value={newType}
                    onChange={(e) => setNewType(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="duration" className="text-left">
                    Duration
                  </Label>
                  <Input
                    id="duration"
                    className="col-span-3"
                    value={newDuration}
                    onChange={(e) => setNewDuration(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="description" className="text-left">
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    className="col-span-3"
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                  />
                </div>
              </form>
              <DialogFooter>
                <Button type="submit" onClick={handleCreateCourse}>
                  Add
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-10"
              placeholder="Search courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Course Title</TableHead>
                <TableHead>Students</TableHead>
                <TableHead>Revenue</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCourses.map((course) => (
                <TableRow key={course.id}>
                  <TableCell className="font-medium hover:cursor-pointer hover:text-blue-500">
                    <Link
                      href={interpolate(routes.DASHBOARD_COURSE_DETAIL, {
                        id: course.id,
                      })}
                    >
                      {course.title}
                    </Link>
                  </TableCell>
                  <TableCell>{course.membersCount?.toLocaleString()}</TableCell>
                  <TableCell>Not Applicable (Free)</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        course.status === COURSE_STATUS.PUBLISHED
                          ? "default"
                          : "secondary"
                      }
                    >
                      {COURSE_STATUS_LABELS_MAP[course.status]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {course.status !== COURSE_STATUS.PUBLISHED && (
                          <DropdownMenuItem
                            onClick={() => handlePublishCourse(course)}
                          >
                            <div className="inline-flex items-center">
                              <Upload className="mr-2 h-4 w-4" /> Publish
                            </div>
                          </DropdownMenuItem>
                        )}
                        {course.status === COURSE_STATUS.PUBLISHED && (
                          <DropdownMenuItem
                            onClick={() => handleArchiveCourse(course)}
                          >
                            <div className="inline-flex items-center">
                              <Trash2 className="mr-2 h-4 w-4" /> Archive
                            </div>
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem>
                          <div className="inline-flex items-center">
                            <Pencil className="mr-2 h-4 w-4" /> Edit
                          </div>
                        </DropdownMenuItem>

                        <DropdownMenuItem>
                          <Link
                            href={interpolate(routes.DASHBOARD_COURSE_DETAIL, {
                              id: course.id,
                            })}
                          >
                            <div className="inline-flex items-center">
                              <BookOpen className="mr-2 h-4 w-4" /> View
                              Materials
                            </div>
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Link
                            href={interpolate(
                              routes.DASHBOARD_COURSE_DETAIL_STUDENTS,
                              {
                                id: course.id,
                              }
                            )}
                          >
                            <div className="inline-flex items-center">
                              <Users className="mr-2 h-4 w-4" /> View Students
                            </div>
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600">
                          <div className="inline-flex items-center">
                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                          </div>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>

        <div className="mt-4 flex justify-center">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious href="#" />
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#" isActive>
                  1
                </PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#">2</PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#">3</PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
              <PaginationItem>
                <PaginationNext href="#" />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </main>
    </div>
  )
}
