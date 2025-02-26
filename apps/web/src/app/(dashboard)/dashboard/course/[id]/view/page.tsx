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
import { DirectFileUpload } from "@/components/ui/direct-file-upload"
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
  const [newFileName, setNewFileName] = useState("")
  const [newType, setNewType] = useState("document")
  const [newDuration, setNewDuration] = useState("")
  const [newDescription, setNewDescription] = useState("")

  // Add these near your other state variables
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isFileUpdateDialogOpen, setIsFileUpdateDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [editingMaterial, setEditingMaterial] =
    useState<Nullable<CourseMaterial>>(null)

  // Edit form states
  const [editTitle, setEditTitle] = useState("")
  const [editDuration, setEditDuration] = useState("")
  const [editDescription, setEditDescription] = useState("")

  // File update states
  const [updatedFileUrl, setUpdatedFileUrl] = useState("")
  const [updatedFileName, setUpdatedFileName] = useState("")

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

  const [triggerUpdateCourseMaterial, updateCourseMaterialResult] =
    CourseApi.useUpdateCourseMaterialMutation()

  const [triggerDeleteCourseMaterial, deleteCourseMaterialResult] =
    CourseApi.useDeleteCourseMaterialMutation()

  const getFileIcon = (type: COURSE_MATERIAL_TYPE) => {
    switch (type) {
      case "video":
        return <Video className="size-6" />
      case "document":
        return <FileText className="size-6" />
      case "image":
        return <ImageIcon className="size-6" />
      default:
        return <File className="size-6" />
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

  const handleFileUploadComplete = (url: string, fileName: string) => {
    setNewCoverUrl(url)
    setNewFileName(fileName)
  }

  const getAcceptAttributeForFileType = (type: string) => {
    switch (type) {
      case "video":
        return "video/*"
      case "document":
        return ".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt"
      case "image":
        return "image/*"
      default:
        return "*"
    }
  }

  // Edit material handlers
  const handleEditMaterial = (
    material: CourseMaterial,
    e: React.MouseEvent
  ) => {
    e.stopPropagation() // Prevent material selection
    setEditingMaterial(material)
    setEditTitle(material.title)
    setEditDuration(material.duration || "")
    setEditDescription(material.description || "")
    setIsEditDialogOpen(true)
  }

  const handleUpdateCourseMaterial = async () => {
    if (!editingMaterial) return

    const updatedMaterial = {
      course_id: editingMaterial.courseId,
      title: editTitle,
      url: editingMaterial.url,
      duration: editDuration,
      file_type: editingMaterial.fileType,
      description: editDescription,
    }

    toast.promise(
      triggerUpdateCourseMaterial({
        id: parseInt(params.id, 10),
        materialId: editingMaterial.id,
        body: updatedMaterial,
      }).unwrap(),
      {
        loading: "Updating...",
        success: async () => {
          await refetchMaterials()
          setIsEditDialogOpen(false)
          return "Material updated successfully"
        },
        error: "Error updating material",
      }
    )
  }

  // Update file handlers
  const handleUpdateFile = (material: CourseMaterial, e: React.MouseEvent) => {
    e.stopPropagation() // Prevent material selection
    setEditingMaterial(material)
    setUpdatedFileUrl("")
    setUpdatedFileName("")
    setIsFileUpdateDialogOpen(true)
  }

  const handleUpdateFileComplete = (url: string, fileName: string) => {
    setUpdatedFileUrl(url)
    setUpdatedFileName(fileName)
  }

  const handleSubmitFileUpdate = async () => {
    if (!editingMaterial || !updatedFileUrl) return

    const updatedMaterial = {
      course_id: editingMaterial.courseId,
      title: editingMaterial.title,
      url: updatedFileUrl,
      duration: editingMaterial.duration,
      file_type: editingMaterial.fileType,
      description: editingMaterial.description,
    }

    toast.promise(
      triggerUpdateCourseMaterial({
        id: parseInt(params.id, 10),
        materialId: editingMaterial.id,
        body: updatedMaterial,
      }).unwrap(),
      {
        loading: "Updating file...",
        success: async () => {
          await refetchMaterials()
          setIsFileUpdateDialogOpen(false)
          return "File updated successfully"
        },
        error: "Error updating file",
      }
    )
  }

  // Delete material handlers
  const handleDeleteDialog = (
    material: CourseMaterial,
    e: React.MouseEvent
  ) => {
    e.stopPropagation() // Prevent material selection
    setEditingMaterial(material)
    setIsDeleteDialogOpen(true)
  }

  const handleDeleteMaterial = async () => {
    if (!editingMaterial) return

    toast.promise(
      triggerDeleteCourseMaterial({
        id: parseInt(params.id, 10),
        materialId: editingMaterial.id,
      }).unwrap(),
      {
        loading: "Deleting...",
        success: async () => {
          await refetchMaterials()
          // Clear selected material if we deleted the one being viewed
          if (selectedMaterial?.id === editingMaterial.id) {
            setSelectedMaterial(null)
          }
          setIsDeleteDialogOpen(false)
          return "Material deleted successfully"
        },
        error: "Error deleting material",
      }
    )
  }

  return (
    <div className="bg-background min-h-screen">
      <header className="border-b">
        <div className="container mx-auto flex items-center justify-between p-4">
          <div className="flex items-center">
            <Link href={routes.DASHBOARD}>
              <div className="p-2">
                <ArrowLeft className="size-4" />
              </div>
            </Link>
            <h1 className="text-2xl font-bold">{courseData?.title}</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-3xl font-bold">Course Materials</h2>
          <Dialog
            open={isUploadDialogOpen}
            onOpenChange={setIsUploadDialogOpen}
          >
            <DialogTrigger asChild>
              <Button>
                <Upload className="mr-2 size-4" /> Upload New Material
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Upload New Material</DialogTitle>
                <DialogDescription>
                  Add a new material to your course. Please provide the details
                  and upload the file.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
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
                  <Label htmlFor="type" className="text-left">
                    Type
                  </Label>
                  <select
                    id="type"
                    className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring col-span-3 flex h-10 w-full rounded-md border px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={newType}
                    onChange={(e) => setNewType(e.target.value)}
                  >
                    <option value="document">Document</option>
                    <option value="video">Video</option>
                    <option value="image">Image</option>
                  </select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-left">File</Label>
                  <div className="col-span-3">
                    <DirectFileUpload
                      onUploadComplete={handleFileUploadComplete}
                      accept={getAcceptAttributeForFileType(newType)}
                      courseId={parseInt(params.id, 10)}
                      fileType={newType}
                    />
                    {newCoverUrl && (
                      <p className="mt-1 text-xs text-green-600">
                        File uploaded successfully
                      </p>
                    )}
                  </div>
                </div>

                {/* File preview section - add this */}
                {newCoverUrl && (
                  <div className="mb-4 mt-2">
                    <div className="rounded-md border p-4">
                      <p className="mb-2 text-sm font-medium">Preview:</p>

                      {/* Make each preview container have a consistent max height */}
                      <div className="max-h-[200px] overflow-auto">
                        {newType === "image" && (
                          <div className="overflow-hidden rounded-lg">
                            <img
                              src={newCoverUrl}
                              alt={newFileName}
                              className="h-auto max-h-[180px] w-full object-contain"
                            />
                          </div>
                        )}

                        {newType === "video" && (
                          <div className="overflow-hidden rounded-lg">
                            <video
                              controls
                              className="max-h-[180px] w-full"
                              src={newCoverUrl}
                            >
                              Your browser does not support the video tag.
                            </video>
                          </div>
                        )}

                        {newType === "document" &&
                          newCoverUrl.toLowerCase().endsWith(".pdf") && (
                            <div className="h-[180px] overflow-hidden rounded-lg border">
                              <iframe
                                src={`${newCoverUrl}#toolbar=0&navpanes=0`}
                                className="size-full"
                                title={newFileName}
                              />
                            </div>
                          )}

                        {newType === "document" &&
                          !newCoverUrl.toLowerCase().endsWith(".pdf") && (
                            <div className="flex flex-col items-center justify-center rounded-lg border p-4">
                              <FileText className="text-muted-foreground mb-2 size-12" />
                              <p className="text-sm">{newFileName}</p>
                            </div>
                          )}
                      </div>

                      {/* Make URL section collapsible or compact */}
                      <div className="mt-3">
                        <details className="text-xs">
                          <summary className="cursor-pointer font-medium">
                            URL
                          </summary>
                          <p className="text-muted-foreground mt-1 break-all text-xs">
                            {newCoverUrl}
                          </p>
                        </details>
                      </div>

                      <div className="mt-2 flex justify-end">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(newCoverUrl, "_blank")}
                        >
                          Open in New Tab
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

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
              </div>
              <DialogFooter className="bg-background sticky bottom-0 pt-2">
                <Button
                  type="submit"
                  onClick={handleCreateCourseMaterial}
                  disabled={!newTitle || !newCoverUrl}
                >
                  Upload
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
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
                            <Button variant="ghost" className="size-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreVertical className="size-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem
                              onClick={(e) => setSelectedMaterial(material)}
                            >
                              <File className="mr-2 size-4" /> View
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={(e) => handleEditMaterial(material, e)}
                            >
                              <Pencil className="mr-2 size-4" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={(e) => handleUpdateFile(material, e)}
                            >
                              <Upload className="mr-2 size-4" /> Update File
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={(e) => handleDeleteDialog(material, e)}
                            >
                              <Trash2 className="mr-2 size-4" /> Delete
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
                  <h3 className="mb-2 text-lg font-semibold">
                    {selectedMaterial.title}
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Type:{" "}
                    {COURSE_MATERIAL_TYPE_LABELS_MAP[selectedMaterial.fileType]}
                  </p>

                  {/* File preview based on type */}
                  {selectedMaterial.fileType === COURSE_MATERIAL_TYPE.VIDEO && (
                    <div className="overflow-hidden rounded-lg">
                      <video
                        controls
                        className="w-full"
                        src={selectedMaterial.url}
                        poster={selectedMaterial.thumnailUrl} // Optional: add if you have thumbnails
                      >
                        Your browser does not support the video tag.
                      </video>
                    </div>
                  )}

                  {selectedMaterial.fileType === COURSE_MATERIAL_TYPE.IMAGE && (
                    <div className="overflow-hidden rounded-lg">
                      <img
                        src={selectedMaterial.url}
                        alt={selectedMaterial.title}
                        className="h-auto w-full object-contain"
                      />
                    </div>
                  )}

                  {selectedMaterial.fileType ===
                    COURSE_MATERIAL_TYPE.DOCUMENT &&
                    (selectedMaterial.url?.toLowerCase().endsWith(".pdf") ? (
                      <div className="aspect-[3/4] overflow-hidden rounded-lg border">
                        <iframe
                          src={`${selectedMaterial.url}#toolbar=0&navpanes=0`}
                          className="size-full"
                          title={selectedMaterial.title}
                        />
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center rounded-lg border p-6">
                        <FileText className="text-muted-foreground mb-4 size-16" />
                        <Button asChild>
                          <a
                            href={selectedMaterial.url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Download Document
                          </a>
                        </Button>
                      </div>
                    ))}

                  <div className="mt-4">
                    <p>
                      <strong>Hours:</strong> {selectedMaterial.duration}
                    </p>
                    <p>
                      <strong>Uploaded:</strong>{" "}
                      {formatDate(selectedMaterial.createdAt)}
                    </p>
                    {selectedMaterial.description && (
                      <div className="mt-2">
                        <strong>Description:</strong>
                        <p className="mt-1">{selectedMaterial.description}</p>
                      </div>
                    )}
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

      {/* Edit Material Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Material</DialogTitle>
            <DialogDescription>
              Update the details for this course material.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="editTitle" className="text-left">
                Title
              </Label>
              <Input
                id="editTitle"
                className="col-span-3"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="editDuration" className="text-left">
                Duration
              </Label>
              <Input
                id="editDuration"
                className="col-span-3"
                value={editDuration}
                onChange={(e) => setEditDuration(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="editDescription" className="text-left">
                Description
              </Label>
              <Textarea
                id="editDescription"
                className="col-span-3"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleUpdateCourseMaterial} disabled={!editTitle}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Update File Dialog */}
      <Dialog
        open={isFileUpdateDialogOpen}
        onOpenChange={setIsFileUpdateDialogOpen}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Update File</DialogTitle>
            <DialogDescription>
              Upload a new file for "{editingMaterial?.title}".
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label className="text-left">Upload New File</Label>
              <DirectFileUpload
                onUploadComplete={handleUpdateFileComplete}
                accept={
                  editingMaterial
                    ? getAcceptAttributeForFileType(editingMaterial.fileType)
                    : "*"
                }
                courseId={parseInt(params.id, 10)}
                fileType={editingMaterial?.fileType || "document"}
              />
            </div>

            {updatedFileUrl && (
              <div className="rounded-md border p-4">
                <p className="mb-2 text-sm font-medium">Preview:</p>

                <div className="max-h-[200px] overflow-auto">
                  {editingMaterial?.fileType === "image" && (
                    <div className="overflow-hidden rounded-lg">
                      <img
                        src={updatedFileUrl}
                        alt={updatedFileName}
                        className="h-auto max-h-[180px] w-full object-contain"
                      />
                    </div>
                  )}

                  {editingMaterial?.fileType === "video" && (
                    <div className="overflow-hidden rounded-lg">
                      <video
                        controls
                        className="max-h-[180px] w-full"
                        src={updatedFileUrl}
                      >
                        Your browser does not support the video tag.
                      </video>
                    </div>
                  )}

                  {editingMaterial?.fileType === "document" && (
                    <div className="flex flex-col items-center justify-center p-4">
                      <FileText className="mb-2 h-12 w-12 text-muted-foreground" />
                      <p className="text-sm">{updatedFileName}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsFileUpdateDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleSubmitFileUpdate} disabled={!updatedFileUrl}>
              Update File
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{editingMaterial?.title}"? This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteMaterial}>
              Delete Material
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
