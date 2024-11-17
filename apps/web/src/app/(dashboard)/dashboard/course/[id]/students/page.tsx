"use client"

import { useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Progress } from "@/components/ui/progress"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { routes } from "@/config/routes"
import { useDebounce } from "@/hooks/use-debounce"
import { formatDate } from "@/lib/utils"
import { CourseApi } from "@/service/course-api"
import { CourseMember } from "@/types/course"
import {
  ArrowLeft,
  Clock,
  GraduationCap,
  Mail,
  MoreVertical,
  Search,
  UserMinus,
  Users,
} from "lucide-react"


export default function Component() {
  const params = useParams<{ id: string }>()

  const [searchTerm, setSearchTerm] = useState("")
  const [progressFilter, setProgressFilter] = useState("all")

  const debouncedSearch = useDebounce(searchTerm, 500)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const { data, isLoading, refetch } = CourseApi.useGetCourseByIdQuery(
    parseInt(params.id, 10)
  )
  const courseData = data?.data

  const { data: membersData, isLoading: isMembersLoading } =
    CourseApi.useGetCourseMembersQuery({
      id: parseInt(params.id, 10),
      filters: { page, page_size: pageSize },
    })

  const filteredStudents = (
    membersData?.data?.results || ([] as CourseMember[])
  )?.filter((student) =>
    student?.firstName?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <Link href={routes.DASHBOARD}>
              <div className="p-2">
                <ArrowLeft className="h-4 w-4" />
              </div>
            </Link>
            <h1 className="text-2xl font-bold">{courseData?.title}</h1>
          </div>
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
                {courseData?.membersCount?.toLocaleString()}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Average Progress
              </CardTitle>
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0%</div>
              <Progress value={0} className="mt-2" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Course Hours
              </CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{courseData?.duration}</div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold">Enrolled Students</h2>
        </div>

        <div className="flex justify-between items-center mb-4">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-10"
              placeholder="Search students..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={progressFilter} onValueChange={setProgressFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by progress" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Progress</SelectItem>
              <SelectItem value="low">Low (&lt;50%)</SelectItem>
              <SelectItem value="medium">Medium (50-79%)</SelectItem>
              <SelectItem value="high">High (≥80%)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Enroll Date</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Last Access</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.map((student) => (
                <TableRow key={student.id}>
                  <TableCell className="font-medium">
                    {student.firstName} {student.lastName}
                  </TableCell>
                  <TableCell>{student.email}</TableCell>
                  <TableCell>{formatDate(new Date())}</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Progress value={0} className="w-[60px] mr-2" />
                      <span>0%</span>
                    </div>
                  </TableCell>
                  <TableCell>{formatDate(new Date())}</TableCell>
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
                        <DropdownMenuItem>
                          <Mail className="mr-2 h-4 w-4" /> Send Message
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <GraduationCap className="mr-2 h-4 w-4" /> View
                          Progress
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600">
                          <UserMinus className="mr-2 h-4 w-4" /> Remove from
                          Course
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
