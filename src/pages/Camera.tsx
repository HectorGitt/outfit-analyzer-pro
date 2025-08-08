import { useState, useRef, useEffect } from "react"
import { Camera as CameraIcon, Square, Zap, Settings, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AnalysisCard } from "@/components/ui/analysis-card"
import { Navbar } from "@/components/navigation/navbar"
import { Badge } from "@/components/ui/badge"

// Mock analysis result
const mockAnalysisResult = {
  overall_score: 78,
  color_harmony: 85,
  style_coherence: 71,
  suggestions: ["Try a contrasting belt", "Add layering piece", "Consider statement jewelry"],
  improvements: ["Color balance", "Proportions", "Accessories"],
  analysis_text: "Great base outfit with good color coordination. The silhouette works well for your body type. Adding a few accessories would elevate the overall look and create more visual interest."
}

export default function Camera() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isStreaming, setIsStreaming] = useState(false)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [analysisResult, setAnalysisResult] = useState<typeof mockAnalysisResult | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user")

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      })
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        setIsStreaming(true)
      }
    } catch (error) {
      console.error("Error accessing camera:", error)
      alert("Unable to access camera. Please check permissions.")
    }
  }

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks()
      tracks.forEach(track => track.stop())
      setIsStreaming(false)
    }
  }

  const switchCamera = () => {
    stopCamera()
    setFacingMode(prev => prev === "user" ? "environment" : "user")
    setTimeout(startCamera, 100)
  }

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current
      const video = videoRef.current
      const context = canvas.getContext("2d")

      canvas.width = video.videoWidth
      canvas.height = video.videoHeight

      if (context) {
        context.drawImage(video, 0, 0)
        const imageData = canvas.toDataURL("image/jpeg", 0.8)
        setCapturedImage(imageData)
      }
    }
  }

  const analyzeCapture = async () => {
    if (!capturedImage) return
    
    setIsAnalyzing(true)
    
    // Simulate AI analysis
    await new Promise(resolve => setTimeout(resolve, 3000))
    
    setAnalysisResult(mockAnalysisResult)
    setIsAnalyzing(false)
  }

  const retakePhoto = () => {
    setCapturedImage(null)
    setAnalysisResult(null)
  }

  useEffect(() => {
    return () => {
      stopCamera()
    }
  }, [])

  return (
    <div className="min-h-screen bg-gradient-hero">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8 animate-fade-up">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
              <CameraIcon className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-4xl font-bold mb-4">
              Live Camera Analysis
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Get real-time fashion feedback using your device camera
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Camera Section */}
            <div className="space-y-6">
              <Card className="card-fashion">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <CameraIcon className="w-5 h-5 text-primary" />
                      Camera Feed
                    </span>
                    {isStreaming && (
                      <Badge className="bg-success text-success-foreground">
                        <div className="w-2 h-2 bg-white rounded-full mr-1 animate-pulse" />
                        Live
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="relative bg-muted rounded-xl overflow-hidden aspect-video">
                    {!isStreaming && !capturedImage && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center space-y-4">
                          <CameraIcon className="w-16 h-16 text-muted-foreground mx-auto" />
                          <div>
                            <h3 className="font-medium mb-2">Camera Ready</h3>
                            <p className="text-sm text-muted-foreground mb-4">
                              Start your camera to begin live analysis
                            </p>
                            <Button onClick={startCamera} className="btn-primary">
                              Start Camera
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}

                    {capturedImage ? (
                      <img 
                        src={capturedImage} 
                        alt="Captured outfit" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-full object-cover"
                      />
                    )}

                    <canvas ref={canvasRef} className="hidden" />
                  </div>

                  {/* Camera Controls */}
                  <div className="flex items-center justify-center gap-4 mt-4">
                    {isStreaming && !capturedImage && (
                      <>
                        <Button variant="outline" onClick={switchCamera}>
                          <RotateCcw className="w-4 h-4 mr-2" />
                          Switch
                        </Button>
                        <Button onClick={capturePhoto} className="btn-gradient">
                          <Square className="w-4 h-4 mr-2" />
                          Capture
                        </Button>
                        <Button variant="outline" onClick={stopCamera}>
                          Stop Camera
                        </Button>
                      </>
                    )}

                    {capturedImage && (
                      <>
                        <Button variant="outline" onClick={retakePhoto}>
                          Retake Photo
                        </Button>
                        <Button onClick={analyzeCapture} className="btn-gradient" disabled={isAnalyzing}>
                          <Zap className="w-4 h-4 mr-2" />
                          {isAnalyzing ? "Analyzing..." : "Analyze Style"}
                        </Button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Camera Tips */}
              <Card className="card-fashion">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Settings className="w-5 h-5 text-primary" />
                    Camera Tips
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
                      Stand in good lighting for best results
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
                      Show your full outfit in the frame
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
                      Keep the camera steady while capturing
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
                      Use a plain background when possible
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            {/* Analysis Results */}
            <div className="space-y-6">
              {isAnalyzing && (
                <Card className="card-fashion">
                  <CardContent className="flex items-center justify-center py-12">
                    <div className="text-center space-y-4">
                      <div className="w-16 h-16 bg-gradient-primary rounded-full mx-auto animate-float flex items-center justify-center">
                        <Zap className="w-8 h-8 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold">Analyzing Your Style...</h3>
                        <p className="text-muted-foreground">Processing your live capture</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {analysisResult && !isAnalyzing && (
                <AnalysisCard result={analysisResult} />
              )}

              {!analysisResult && !isAnalyzing && (
                <Card className="card-fashion border-dashed">
                  <CardContent className="flex items-center justify-center py-12">
                    <div className="text-center space-y-2">
                      <div className="w-12 h-12 bg-muted rounded-full mx-auto flex items-center justify-center">
                        <CameraIcon className="w-6 h-6 text-muted-foreground" />
                      </div>
                      <h3 className="text-lg font-medium text-muted-foreground">
                        Capture a photo to see analysis
                      </h3>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}