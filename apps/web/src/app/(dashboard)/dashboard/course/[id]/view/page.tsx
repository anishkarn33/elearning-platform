"use client"

import { useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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
import { toast } from "@/components/ui/sonner"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { routes } from "@/config/routes"
import { formatDate } from "@/lib/utils"
import { CourseApi } from "@/service/course-api"
import {
  COURSE_MATERIAL_TYPE,
  COURSE_MATERIAL_TYPE_LABELS_MAP,
  CourseMaterial,
} from "@/types/course"
import { Nullable } from "@/types/mixins"
import {
  ArrowLeft,
  File,
  FileText,
  Image as ImageIcon,
  MoreVertical,
  Pencil,
  Trash2,
  Upload,
  Video,
} from "lucide-react"

export default function Component() {
  const params = useParams<{ id: string }>()
  const [selectedMaterial, setSelectedMaterial] =
    useState<Nullable<CourseMaterial>>(null)
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false)

  // new course states
  const [newTitle, setNewTitle] = useState("")
  const [newCoverUrl, setNewCoverUrl] = useState("")
  const [newType, setNewType] = useState("document")
  const [newDuration, setNewDuration] = useState("")
  const [newDescription, setNewDescription] = useState("")

  const { data, isLoading, refetch } = CourseApi.useGetCourseByIdQuery(
    parseInt(params.id, 10)
  )

  const courseData = data?.data

  const {
    data: materialsData,
    isLoading: isMembersLoading,
    refetch: refetchMaterials,
  } = CourseApi.useGetCourseMaterialsQuery({
    id: parseInt(params.id, 10),
    filters: { page: 1, page_size: 100 },
  })

  const courseMaterials = materialsData?.data?.results || []

  const [triggerCreateCourseMaterial, newCourseMaterialResult] =
    CourseApi.useCreateCourseMaterialMutation()

  const getFileIcon = (type: COURSE_MATERIAL_TYPE) => {
    switch (type) {
      case "video":
        return <Video className="h-6 w-6" />
      case "document":
        return <FileText className="h-6 w-6" />
      case "image":
        return <ImageIcon className="h-6 w-6" />
      default:
        return <File className="h-6 w-6" />
    }
  }

  const handleCreateCourseMaterial = async () => {
    const newCourseMaterial = {
      course_id: courseData?.id || parseInt(params.id, 10),
      title: newTitle,
      url: newCoverUrl,
      duration: newDuration,
      file_type: newType,
      description: newDescription,
    }

    toast.promise(
      triggerCreateCourseMaterial({
        id: parseInt(params.id, 10),
        body: newCourseMaterial,
      }).unwrap(),
      {
        loading: "Creating...",
        success: async () => {
          setNewTitle("")
          setNewCoverUrl("")
          setNewType("")
          setNewDescription("")

          await refetchMaterials()
          setIsUploadDialogOpen(false)

          return "Material added successfully"
        },
        error: "Error adding material",
      }
    )
  }

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
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold">Course Materials</h2>
          <Dialog
            open={isUploadDialogOpen}
            onOpenChange={setIsUploadDialogOpen}
          >
            <DialogTrigger asChild>
              <Button>
                <Upload className="mr-2 h-4 w-4" /> Upload New Material
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Upload New Material</DialogTitle>
                <DialogDescription>
                  Add a new material to your course. Please provide the details
                  and upload the file.
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
                <Button type="submit" onClick={handleCreateCourseMaterial}>
                  Upload
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Material List</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Upload Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {courseMaterials.map((material) => (
                    <TableRow
                      key={material.id}
                      className="cursor-pointer"
                      onClick={() => setSelectedMaterial(material)}
                    >
                      <TableCell className="font-medium">
                        <div className="flex items-center">
                          {getFileIcon(material.fileType)}
                          <span className="ml-2">{material.title}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {COURSE_MATERIAL_TYPE_LABELS_MAP[material.fileType]}
                      </TableCell>
                      <TableCell>{material.duration}</TableCell>
                      <TableCell>{formatDate(material.createdAt)}</TableCell>
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
                              <Pencil className="mr-2 h-4 w-4" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Upload className="mr-2 h-4 w-4" /> Update File
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600">
                              <Trash2 className="mr-2 h-4 w-4" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Material Preview</CardTitle>
            </CardHeader>
            <CardContent>
              {selectedMaterial ? (
                <div>
                  <h3 className="text-lg font-semibold mb-2">
                    {selectedMaterial.title}
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Type:{" "}
                    {COURSE_MATERIAL_TYPE_LABELS_MAP[selectedMaterial.fileType]}
                  </p>
                  {selectedMaterial.fileType === COURSE_MATERIAL_TYPE.VIDEO && (
                    <div className="aspect-video bg-muted flex items-center justify-center rounded-lg">
                      <Video className="h-16 w-16 text-muted-foreground" />
                    </div>
                  )}
                  {selectedMaterial.fileType ===
                    COURSE_MATERIAL_TYPE.DOCUMENT && (
                    <div className="aspect-[3/4] bg-muted flex items-center justify-center rounded-lg">
                      <FileText className="h-16 w-16 text-muted-foreground" />
                    </div>
                  )}
                  {selectedMaterial.fileType === COURSE_MATERIAL_TYPE.IMAGE && (
                    <div className="aspect-square bg-muted flex items-center justify-center rounded-lg">
                      <ImageIcon className="h-16 w-16 text-muted-foreground" />
                    </div>
                  )}
                  <div className="mt-4">
                    <p>
                      <strong>Hours:</strong> {selectedMaterial.duration}
                    </p>
                    <p>
                      <strong>Uploaded:</strong>{" "}
                      {formatDate(selectedMaterial.createdAt)}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground">
                  Select a material to preview
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
