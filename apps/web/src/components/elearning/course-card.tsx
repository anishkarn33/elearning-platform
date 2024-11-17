import { useCallback } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { toast } from "@/components/ui/sonner"
import { routes } from "@/config/routes"
import { interpolate } from "@/lib/utils"
import { CourseApi } from "@/service/course-api"
import { Course } from "@/types/course"
import { BookOpen, Clock, Search, User, Users } from "lucide-react"

interface CourseCardProps {
  course: Course
}

export const CourseCard: React.FC<CourseCardProps> = ({ course }) => {
  const router = useRouter()
  const [triggerCourseEnrollMutation, enrollResult] =
    CourseApi.useEnrollCourseMutation()

  const handleEnrollClick = async () => {
    toast.promise(triggerCourseEnrollMutation(course.id).unwrap(), {
      loading: "Enrolling...",
      success: "Enrolled! Welcome to the course",
      error: "Error enrolling in the course",
    })
  }

  const handleCardClick = () => {
    router.push(interpolate(routes.COURSE_DETAIL, { id: course.id }))
  }

  return (
    <Card
      key={course.id}
      className="group hover:shadow-lg hover:cursor-pointer"
      onClick={handleCardClick}
    >
      <CardHeader>
        <Image
          width="500"
          height="350"
          style={{
            height: "250px",
            minHeight: "250px",
          }}
          objectFit="cover"
          className="left-0 top-0 size-full rounded-2xl object-cover"
          loader={({ src }) => src}
          src={course.coverUrl}
          alt={course.title}
        />
      </CardHeader>
      <CardContent>
        <Link href={interpolate(routes.COURSE_DETAIL, { id: course.id })}>
          <CardTitle className="mb-2 group-hover:text-blue-500">
            {course.title}
          </CardTitle>
        </Link>
        <div className="mb-2 flex items-center">
          <Avatar className="mr-2 size-6">
            <AvatarImage src={course.instructor.avatar} />
            <AvatarFallback>
              <User className="size-4" />
            </AvatarFallback>
          </Avatar>
          <span className="text-muted-foreground text-sm">
            {course.instructor.firstName} {course.instructor.lastName}
          </span>
        </div>
        <Badge>{course.category}</Badge>
        <div className="text-muted-foreground mt-4 flex justify-between text-sm">
          <div className="flex items-center">
            <Users className="mr-1 size-4" />
            {course.membersCount} students
          </div>
          <div className="flex items-center">
            <Clock className="mr-1 size-4" />
            {course.duration}
          </div>
        </div>
      </CardContent>
      <CardFooter>
        {!Boolean(course?.isEnrolled) && (
          <Button className="w-full" onClick={handleEnrollClick}>
            <BookOpen className="mr-2 size-4" /> Enroll Now
          </Button>
        )}
        {Boolean(course?.isEnrolled) && (
          <Button
            variant="outline"
            className="w-full"
            onClick={handleCardClick}
          >
            <BookOpen className="mr-2 size-4" /> Enrolled
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
