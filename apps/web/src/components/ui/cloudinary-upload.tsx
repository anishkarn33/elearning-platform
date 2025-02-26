"use client";

import { useState } from "react";
import { CldUploadWidget } from "next-cloudinary";
import { Button } from "./button";
import { Upload, Check, Loader2 } from "lucide-react";
import { cloudinaryConfig } from "@/lib/cloudinary";

interface CloudinaryUploadProps {
  onUploadComplete: (url: string, fileName: string) => void;
  accept?: string;
  fileType?: string;
  courseId?: number;
}

export function CloudinaryUpload({
  onUploadComplete,
  accept = "*",
  fileType = "document",
  courseId,
}: CloudinaryUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isUploaded, setIsUploaded] = useState(false);

  return (
    <CldUploadWidget
      uploadPreset={cloudinaryConfig.uploadPreset}
      options={{
        maxFiles: 1,
        resourceType: "auto",
        folder: `course-materials/${courseId || "general"}/${fileType}`,
        clientAllowedFormats: accept?.split(",").map(type => 
          type.replace(".", "").replace("*", "")),
      }}
      onUpload={(result, widget) => {
        setIsUploading(false);
        if (result.event !== "success") return;
        
        const info = result.info as any;
        const url = info.secure_url;
        const fileName = info.original_filename;
        
        onUploadComplete(url, fileName);
        setIsUploaded(true);
        widget.close();
      }}
      onOpen={() => {
        setIsUploading(true);
      }}
    >
      {({ open }) => (
        <Button
          type="button"
          variant="outline"
          onClick={() => open()}
          disabled={isUploading}
          className="w-full"
        >
          {isUploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Uploading...
            </>
          ) : isUploaded ? (
            <>
              <Check className="mr-2 h-4 w-4" />
              File uploaded
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Choose file
            </>
          )}
        </Button>
      )}
    </CldUploadWidget>
  );
}