"use client"

import { useState } from "react"
import { CourseCard } from "@/components/elearning/course-card"
import { Button } from "@/components/ui/button"
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
import { useDebounce } from "@/hooks/use-debounce"
import { CourseApi } from "@/service/course-api"
import { Search } from "lucide-react"

const categories = [
  "All Courses",
  "Web Development",
  "Data Science",
  "Mobile Development",
  "Machine Learning",
  "DevOps",
  "Design",
]

export default function Component() {
  const [search, setSearch] = useState("")
  const debouncedSearch = useDebounce(search, 500)
  const [selectedCategory, setSelectedCategory] = useState("All Courses")
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const { data, isLoading } = CourseApi.useGetAllCoursesQuery({
    page,
    page_size: pageSize,
    title: debouncedSearch,
  })

  const totalCourses = data?.data?.count || 0
  const courses = data?.data?.results || []

  const handleSearch = (e: any) => {
    setSearch(e.target.value)
  }

  return (
    <div className="bg-background min-h-screen">
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="mb-4 text-3xl font-bold">Explore Courses</h2>
          <div className="relative">
            <Search className="text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              onChange={handleSearch}
              className="pl-10"
              placeholder="Search for courses..."
            />
          </div>
        </div>

        <div className="mb-8">
          <h3 className="mb-4 text-xl font-semibold">Categories</h3>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </Button>
            ))}
          </div>
        </div>

        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>

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
      </main>
    </div>
  )
}
