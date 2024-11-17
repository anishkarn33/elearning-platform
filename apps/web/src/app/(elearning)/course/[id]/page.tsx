"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
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
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "@/components/ui/sonner"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { CourseApi } from "@/service/course-api"
import {
  BookOpen,
  ChevronDown,
  Clock,
  Loader,
  Star,
  User,
  Users,
} from "lucide-react"


function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-5 h-5 ${
            star <= rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
          }`}
        />
      ))}
    </div>
  )
}

export default function Component() {
  const params = useParams<{ id: string }>()
  const [newFeedback, setNewFeedback] = useState("")
  const [newRating, setNewRating] = useState(0)

  const { data, isLoading, refetch } = CourseApi.useGetCourseByIdQuery(
    parseInt(params.id, 10)
  )

  const [triggerCourseEnrollMutation, enrollResult] =
    CourseApi.useEnrollCourseMutation()

  const [triggerCourseFeedbackMutation, feedbackResult] =
    CourseApi.useCreateCourseFeedbackMutation()

  const courseData = data?.data

  if (isLoading || courseData === undefined) {
    return (
      <div>
        <Skeleton className="w-64 h-12 mb-4" />
      </div>
    )
  }

  const handleSubmitFeedback = (e: React.FormEvent) => {
    e.preventDefault()
    // Here you would typically send the feedback to your backend
    console.log("Submitted feedback:", {
      rating: newRating,
      comment: newFeedback,
    })

    toast.promise(
      triggerCourseFeedbackMutation({
        id: courseData.id,
        body: {
          rating: newRating,
          feedback: newFeedback,
          course: courseData.id,
        },
      }).unwrap(),
      {
        loading: "Submitting feedback...",
        success: async () => {
          await refetch()
          return "Feedback submitted successfully"
        },
        error: "Error submitting feedback",
      }
    )

    // Reset form
    setNewFeedback("")
    setNewRating(0)
  }

  const handleEnrollClick = async () => {
    toast.promise(triggerCourseEnrollMutation(courseData.id).unwrap(), {
      loading: "Enrolling...",
      success: async () => {
        await refetch()
        return "Enrolled! Welcome to the course"
      },
      error: "Error enrolling in the course",
    })
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <h1 className="text-3xl font-bold mb-4">{courseData.title}</h1>
            <p className="text-muted-foreground mb-4">
              {courseData.description}
            </p>
            <div className="flex items-center space-x-4 mb-4">
              <Badge>{courseData.category}</Badge>
              <div className="flex items-center">
                <StarRating rating={courseData.averageRating || 0} />
                <span className="ml-2">
                  {courseData.averageRating || 0} (
                  {courseData.totalFeedbacks || 0} ratings)
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-6">
              <div className="flex items-center">
                <Users className="h-4 w-4 mr-1" />
                {courseData.membersCount} students
              </div>
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                {courseData.duration}
              </div>
            </div>
            <img
              src={courseData.coverUrl}
              alt={courseData.title}
              className="w-full rounded-lg mb-6"
            />

            <h2 className="text-2xl font-semibold mb-4">Course Content</h2>
            <Card>
              {courseData.materials.map((item, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center p-4 border-b last:border-b-0"
                >
                  <div className="flex items-center">
                    <BookOpen className="h-4 w-4 mr-2" />
                    <span>{item.title}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {item.duration}
                  </span>
                </div>
              ))}
            </Card>
          </div>

          <div>
            <Card className="sticky top-32 z-50">
              <CardHeader>
                <CardTitle className="text-2xl">Free</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  {!Boolean(courseData?.isEnrolled) && (
                    <Button className="w-full" onClick={handleEnrollClick}>
                      <BookOpen className="mr-2 size-4" /> Enroll Now
                    </Button>
                  )}
                  {Boolean(courseData?.isEnrolled) && (
                    <Button variant="outline" className="w-full">
                      <BookOpen className="mr-2 size-4" /> Enrolled
                    </Button>
                  )}
                </div>
                <Progress value={33} className="mb-2" />
                <p className="text-sm text-muted-foreground mb-4">
                  33% complete
                </p>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Total time</span>
                    <span>{courseData.duration}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Lectures</span>
                    <span>{courseData?.materials?.length || 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Instructor</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <Avatar className="h-12 w-12 mr-4 z-0">
                    <AvatarImage src={courseData.instructor.avatar} />
                    <AvatarFallback className="z-0">
                      <User />
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold">
                      {courseData.instructor.firstName}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {courseData.instructor.title || ""}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className={cn("mt-12")}>
          <h2 className="text-2xl font-semibold mb-6">Student Feedback</h2>
          <div className="space-y-6 mb-8">
            {courseData.feedbacks.map((feedback) => (
              <Card key={feedback.id}>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>{feedback.user.firstName}</CardTitle>
                    <StarRating rating={feedback.rating} />
                  </div>
                </CardHeader>
                <CardContent>
                  <p>{feedback.feedback}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card
            className={cn({
              invisible: !Boolean(courseData.isEnrolled),
            })}
          >
            <CardHeader>
              <CardTitle>Leave Your Feedback</CardTitle>
              <CardDescription>
                Share your experience with this course
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmitFeedback}>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">
                    Your Rating
                  </label>
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-6 h-6 cursor-pointer ${
                          star <= newRating
                            ? "text-yellow-400 fill-yellow-400"
                            : "text-gray-300"
                        }`}
                        onClick={() => setNewRating(star)}
                      />
                    ))}
                  </div>
                </div>
                <div className="mb-4">
                  <label
                    htmlFor="feedback"
                    className="block text-sm font-medium mb-2"
                  >
                    Your Feedback
                  </label>
                  <Textarea
                    id="feedback"
                    placeholder="Write your feedback here..."
                    value={newFeedback}
                    onChange={(e) => setNewFeedback(e.target.value)}
                    rows={4}
                  />
                </div>
                <Button type="submit">
                  {feedbackResult.isLoading && (
                    <Loader className="mr-2 size-4 animate-spin" />
                  )}
                  {feedbackResult.isLoading
                    ? "Submitting Feedback"
                    : "Submit Feedback"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
