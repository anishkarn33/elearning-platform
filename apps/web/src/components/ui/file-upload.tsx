"use client";

import { useState } from 'react';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Upload } from 'lucide-react';

interface FileUploadProps {
  onUploadComplete: (url: string, fileName: string) => void;
  accept?: string;
  courseId: number;
  fileType: string;
}

export function FileUpload({ onUploadComplete, accept = "*", courseId, fileType }: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [fileName, setFileName] = useState("");

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setFileName(file.name);

    // Create a storage reference
    const storageRef = ref(storage, `courses/${courseId}/${fileType}/${Date.now()}-${file.name}`);
    
    // Upload file
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        // Update progress
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setProgress(progress);
      },
      (error) => {
        // Handle error
        console.error('Upload error:', error);
        setUploading(false);
      },
      async () => {
        // Get download URL and pass to parent
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        onUploadComplete(downloadURL, file.name);
        setUploading(false);
      }
    );
  };

  return (
    <div className="w-full">
      <div className="flex items-center gap-4">
        <input
          type="file"
          id="file-upload"
          className="sr-only"
          onChange={handleFileChange}
          accept={accept}
          disabled={uploading}
        />
        <label
          htmlFor="file-upload"
          className={`flex items-center justify-center w-full h-10 px-4 rounded-md border cursor-pointer ${
            uploading ? 'bg-muted text-muted-foreground' : 'bg-primary text-primary-foreground hover:bg-primary/90'
          }`}
        >
          <Upload className="h-4 w-4 mr-2" />
          {uploading ? 'Uploading...' : 'Choose File'}
        </label>
      </div>
      
      {fileName && <p className="text-xs mt-1">{fileName}</p>}
      
      {uploading && (
        <div className="mt-2">
          <Progress value={progress} className="h-2" />
          <p className="text-xs text-muted-foreground mt-1">{Math.round(progress)}% uploaded</p>
        </div>
      )}
    </div>
  );
}