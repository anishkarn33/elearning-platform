"use client"

import { useState } from "react"
import { cloudinaryConfig } from "@/lib/cloudinary"
import { Check, Loader2, Upload } from "lucide-react"
import { CldUploadWidget } from "next-cloudinary"

import { Button } from "./button"

interface CloudinaryUploadProps {
  onUploadComplete: (url: string, fileName: string) => void
  accept?: string
  fileType?: string
  courseId?: number
}

export function CloudinaryUpload({
  onUploadComplete,
  accept = "*",
  fileType = "document",
  courseId,
}: CloudinaryUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [isUploaded, setIsUploaded] = useState(false)

  return (
    <CldUploadWidget
      uploadPreset={cloudinaryConfig.uploadPreset}
      options={{
        maxFiles: 1,
        resourceType: "auto",
        folder: `course-materials/${courseId || "general"}/${fileType}`,
        clientAllowedFormats: accept
          ?.split(",")
          .map((type) => type.replace(".", "").replace("*", "")),
      }}
      onUpload={(result, widget) => {
        setIsUploading(false)
        if (result.event !== "success") return

        const info = result.info as any
        const url = info.secure_url
        const fileName = info.original_filename

        onUploadComplete(url, fileName)
        setIsUploaded(true)
        widget.close()
      }}
      onOpen={() => {
        setIsUploading(true)
      }}
    >
      {({ open }) => (
        <Button
          type="button"
          variant="outline"
          onClick={(e) => {
            e.stopPropagation() // Stop event from propagating to parent dialog
            open()
          }}
          disabled={isUploading}
          className="w-full"
        >
          {isUploading ? (
            <>Loading...</>
          ) : isUploaded ? (
            <>File uploaded</>
          ) : (
            <>Choose file</>
          )}
        </Button>
      )}
    </CldUploadWidget>
  )
}
