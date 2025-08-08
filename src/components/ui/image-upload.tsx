import { useState, useCallback } from "react"
import { Upload, X, Image as ImageIcon, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface ImageUploadProps {
  onUpload?: (file: File) => void
  onAnalyze?: (file: File) => Promise<void>
  maxSize?: number
  accept?: string
  className?: string
}

export function ImageUpload({ 
  onUpload, 
  onAnalyze,
  maxSize = 10 * 1024 * 1024, // 10MB
  accept = "image/*",
  className 
}: ImageUploadProps) {
  const [dragActive, setDragActive] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [analyzing, setAnalyzing] = useState(false)

  const handleFile = useCallback((selectedFile: File) => {
    if (selectedFile.size > maxSize) {
      alert(`File size must be less than ${maxSize / 1024 / 1024}MB`)
      return
    }

    setFile(selectedFile)
    
    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreview(e.target?.result as string)
    }
    reader.readAsDataURL(selectedFile)

    onUpload?.(selectedFile)
  }, [maxSize, onUpload])

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }, [handleFile])

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0])
    }
  }, [handleFile])

  const removeFile = () => {
    setFile(null)
    setPreview(null)
  }

  const analyzeImage = async () => {
    if (!file || !onAnalyze) return
    
    setAnalyzing(true)
    try {
      await onAnalyze(file)
    } catch (error) {
      console.error("Analysis failed:", error)
    } finally {
      setAnalyzing(false)
    }
  }

  return (
    <div className={cn("w-full", className)}>
      {!file ? (
        <div
          className={cn(
            "relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200",
            dragActive 
              ? "border-primary bg-primary/5 scale-105" 
              : "border-border hover:border-primary/50 hover:bg-muted/50"
          )}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            type="file"
            accept={accept}
            onChange={handleInputChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          
          <div className="space-y-4">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <Upload className="w-8 h-8 text-primary" />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Upload Your Outfit Photo</h3>
              <p className="text-muted-foreground">
                Drag and drop your image here, or click to select
              </p>
              <p className="text-sm text-muted-foreground">
                Supports: JPG, PNG, WebP (max {maxSize / 1024 / 1024}MB)
              </p>
            </div>
            
            <button className="btn-primary">
              Choose File
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="relative group">
            <img
              src={preview || ""}
              alt="Upload preview"
              className="w-full h-64 object-cover rounded-xl shadow-md"
            />
            <button
              onClick={removeFile}
              className="absolute top-2 right-2 bg-destructive text-destructive-foreground rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="absolute bottom-2 left-2 bg-black/70 text-white px-3 py-1 rounded-lg text-sm">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4" />
                {file.name}
              </div>
            </div>
          </div>
          
          {onAnalyze && (
            <button
              onClick={analyzeImage}
              disabled={analyzing}
              className="btn-gradient w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {analyzing ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Analyzing Style...
                </>
              ) : (
                "Analyze Fashion Style"
              )}
            </button>
          )}
        </div>
      )}
    </div>
  )
}