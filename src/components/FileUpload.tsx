import React, { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useToast } from '@/hooks/use-toast'
import { 
  Upload, 
  File, 
  Image, 
  Music, 
  Video, 
  FileText,
  X,
  Check,
  AlertCircle,
  Download
} from 'lucide-react'

interface FileUploadProps {
  onFileUpload: (files: File[]) => void
  maxFiles?: number
  maxSize?: number
  acceptedTypes?: string[]
  className?: string
}

interface UploadedFile {
  file: File
  id: string
  progress: number
  status: 'uploading' | 'completed' | 'error'
  url?: string
}

export function FileUpload({ 
  onFileUpload, 
  maxFiles = 5, 
  maxSize = 50 * 1024 * 1024, // 50MB
  acceptedTypes = ['.pdf', '.doc', '.docx', '.txt', '.jpg', '.jpeg', '.png', '.gif', '.mp3', '.wav', '.mp4', '.mov'],
  className = ''
}: FileUploadProps) {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const { toast } = useToast()

  const getFileIcon = (file: File) => {
    const type = file.type.split('/')[0]
    const extension = file.name.split('.').pop()?.toLowerCase()

    if (type === 'image') return Image
    if (type === 'audio') return Music
    if (type === 'video') return Video
    if (extension === 'pdf' || extension === 'doc' || extension === 'docx') return FileText
    return File
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const simulateUpload = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(URL.createObjectURL(file))
      }, 1000 + Math.random() * 2000)
    })
  }

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const validFiles = acceptedFiles.filter(file => {
      if (file.size > maxSize) {
        toast({
          title: "File too large",
          description: `${file.name} exceeds the ${formatFileSize(maxSize)} limit`,
          variant: "destructive"
        })
        return false
      }
      return true
    })

    if (uploadedFiles.length + validFiles.length > maxFiles) {
      toast({
        title: "Too many files",
        description: `Maximum ${maxFiles} files allowed`,
        variant: "destructive"
      })
      return
    }

    setIsUploading(true)
    
    const newFiles: UploadedFile[] = validFiles.map(file => ({
      file,
      id: Math.random().toString(36).substr(2, 9),
      progress: 0,
      status: 'uploading'
    }))

    setUploadedFiles(prev => [...prev, ...newFiles])

    // Simulate upload progress
    for (const uploadFile of newFiles) {
      try {
        // Simulate progress
        for (let progress = 0; progress <= 100; progress += 10) {
          await new Promise(resolve => setTimeout(resolve, 50))
          setUploadedFiles(prev => 
            prev.map(f => 
              f.id === uploadFile.id 
                ? { ...f, progress }
                : f
            )
          )
        }

        const url = await simulateUpload(uploadFile.file)
        
        setUploadedFiles(prev => 
          prev.map(f => 
            f.id === uploadFile.id 
              ? { ...f, status: 'completed', url }
              : f
          )
        )
      } catch (error) {
        setUploadedFiles(prev => 
          prev.map(f => 
            f.id === uploadFile.id 
              ? { ...f, status: 'error' }
              : f
          )
        )
      }
    }

    setIsUploading(false)
    onFileUpload(validFiles)
  }, [uploadedFiles, maxFiles, maxSize, onFileUpload, toast])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp'],
      'audio/*': ['.mp3', '.wav', '.m4a'],
      'video/*': ['.mp4', '.mov', '.avi', '.wmv'],
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt']
    },
    maxSize,
    disabled: isUploading
  })

  const removeFile = (id: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== id))
  }

  const downloadFile = (file: UploadedFile) => {
    if (file.url) {
      const link = document.createElement('a')
      link.href = file.url
      link.download = file.file.name
      link.click()
    }
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      <Card className="border-dashed border-2 transition-all duration-300 hover:border-primary/50">
        <CardContent className="p-6">
          <div
            {...getRootProps()}
            className={`cursor-pointer transition-all duration-300 ${
              isDragActive 
                ? 'bg-primary/5 border-primary/20' 
                : 'hover:bg-muted/50'
            }`}
          >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center justify-center space-y-4 py-8">
              <motion.div
                animate={{ 
                  scale: isDragActive ? 1.1 : 1,
                  rotate: isDragActive ? 5 : 0
                }}
                transition={{ type: "spring", damping: 20, stiffness: 300 }}
                className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${
                  isDragActive 
                    ? 'bg-primary/20 text-primary' 
                    : 'bg-muted/50 text-muted-foreground'
                }`}
              >
                <Upload className="h-8 w-8" />
              </motion.div>
              
              <div className="text-center">
                <p className="text-lg font-medium">
                  {isDragActive ? 'Drop files here' : 'Drag & drop files here'}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  or click to browse • Max {maxFiles} files • {formatFileSize(maxSize)} each
                </p>
              </div>
              
              <Button 
                variant="outline" 
                disabled={isUploading}
                className="mt-4"
              >
                <Upload className="h-4 w-4 mr-2" />
                Choose Files
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Uploaded Files */}
      <AnimatePresence>
        {uploadedFiles.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-3"
          >
            <h4 className="font-medium text-sm text-muted-foreground">
              Uploaded Files ({uploadedFiles.length})
            </h4>
            
            {uploadedFiles.map((uploadFile) => {
              const FileIcon = getFileIcon(uploadFile.file)
              return (
                <motion.div
                  key={uploadFile.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        uploadFile.status === 'completed' 
                          ? 'bg-green-500/10 text-green-500'
                          : uploadFile.status === 'error'
                          ? 'bg-red-500/10 text-red-500'
                          : 'bg-primary/10 text-primary'
                      }`}>
                        {uploadFile.status === 'completed' ? (
                          <Check className="h-5 w-5" />
                        ) : uploadFile.status === 'error' ? (
                          <AlertCircle className="h-5 w-5" />
                        ) : (
                          <FileIcon className="h-5 w-5" />
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium truncate">
                            {uploadFile.file.name}
                          </p>
                          <Badge variant="outline" className="ml-2">
                            {formatFileSize(uploadFile.file.size)}
                          </Badge>
                        </div>
                        
                        {uploadFile.status === 'uploading' && (
                          <div className="mt-2">
                            <Progress 
                              value={uploadFile.progress} 
                              className="h-2"
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                              {uploadFile.progress}% uploaded
                            </p>
                          </div>
                        )}
                        
                        {uploadFile.status === 'completed' && (
                          <p className="text-xs text-green-500 mt-1">
                            Upload completed
                          </p>
                        )}
                        
                        {uploadFile.status === 'error' && (
                          <p className="text-xs text-red-500 mt-1">
                            Upload failed
                          </p>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {uploadFile.status === 'completed' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => downloadFile(uploadFile)}
                            className="h-8 w-8 p-0"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        )}
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(uploadFile.id)}
                          className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* File Types Info */}
      <div className="text-xs text-muted-foreground">
        <p className="font-medium mb-2">Supported file types:</p>
        <div className="flex flex-wrap gap-1">
          {acceptedTypes.map((type) => (
            <Badge key={type} variant="outline" className="text-xs">
              {type}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  )
}