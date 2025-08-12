import { useState, useRef, useEffect } from "react";
import {
	Camera as CameraIcon,
	Square,
	Zap,
	Settings,
	RotateCcw,
	AlertCircle,
	Play,
	Pause,
	Timer,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FashionAnalysisCard } from "@/components/ui/fashion-analysis-card";
import { Navbar } from "@/components/navigation/navbar";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuthStore } from "@/stores/authStore";
import { fashionAPI } from "@/services/api";
import { FashionAnalysisResponse, ApiResponse } from "@/types";

export default function Camera() {
	const videoRef = useRef<HTMLVideoElement>(null);
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const liveAnalysisIntervalRef = useRef<NodeJS.Timeout | null>(null);
	const [isStreaming, setIsStreaming] = useState(false);
	const [capturedImage, setCapturedImage] = useState<string | null>(null);
	const [analysisResult, setAnalysisResult] =
		useState<FashionAnalysisResponse | null>(null);
	const [isAnalyzing, setIsAnalyzing] = useState(false);
	const [isStartingCamera, setIsStartingCamera] = useState(false);
	const [isLiveAnalysis, setIsLiveAnalysis] = useState(false);
	const [liveAnalysisInterval, setLiveAnalysisInterval] = useState(5); // seconds
	const [facingMode, setFacingMode] = useState<"user" | "environment">(
		"user"
	);
	const [error, setError] = useState<string | null>(null);
	const { user } = useAuthStore();

	const startCamera = async () => {
		console.log("🎥 Starting camera...");
		setError(null); // Clear any previous errors
		setIsStartingCamera(true);

		try {
			// Check if mediaDevices is supported
			if (
				!navigator.mediaDevices ||
				!navigator.mediaDevices.getUserMedia
			) {
				throw new Error("Camera not supported in this browser");
			}

			console.log("📱 Requesting camera access...");
			const stream = await navigator.mediaDevices.getUserMedia({
				video: {
					facingMode,
					width: { ideal: 1280 },
					height: { ideal: 720 },
				},
			});

			console.log("✅ Camera access granted");

			if (videoRef.current) {
				videoRef.current.srcObject = stream;
				setIsStreaming(true);
				console.log("🔄 Video stream connected");
			} else {
				console.error("❌ Video ref not available");
				throw new Error("Video element not ready");
			}
		} catch (error: any) {
			console.error("❌ Camera error:", error);

			let errorMessage = "Unable to access camera. ";

			// Handle specific error types
			if (error.name === "NotAllowedError") {
				errorMessage +=
					"Please allow camera permissions and try again.";
			} else if (error.name === "NotFoundError") {
				errorMessage += "No camera found on this device.";
			} else if (error.name === "NotReadableError") {
				errorMessage +=
					"Camera is already in use by another application.";
			} else if (error.name === "OverconstrainedError") {
				errorMessage += "Camera settings not supported.";
			} else if (error.name === "SecurityError") {
				errorMessage += "Camera access blocked by security policy.";
			} else {
				errorMessage += error.message || "Unknown error occurred.";
			}

			setError(errorMessage);
		} finally {
			setIsStartingCamera(false);
		}
	};

	const stopCamera = () => {
		if (videoRef.current?.srcObject) {
			const tracks = (
				videoRef.current.srcObject as MediaStream
			).getTracks();
			tracks.forEach((track) => track.stop());
			setIsStreaming(false);
		}

		// Stop live analysis when camera stops
		stopLiveAnalysis();
	};

	const switchCamera = async () => {
		stopCamera();
		setFacingMode((prev) => (prev === "user" ? "environment" : "user"));
		// Add a small delay to allow the previous stream to fully stop
		setTimeout(startCamera, 100);
	};

	const capturePhoto = () => {
		if (videoRef.current && canvasRef.current) {
			const canvas = canvasRef.current;
			const video = videoRef.current;
			const context = canvas.getContext("2d");

			// Ensure video is ready and has dimensions
			if (video.videoWidth === 0 || video.videoHeight === 0) {
				setError(
					"Video not ready. Please wait for camera to fully initialize."
				);
				return;
			}

			canvas.width = video.videoWidth;
			canvas.height = video.videoHeight;

			if (context) {
				try {
					// Clear canvas first
					context.clearRect(0, 0, canvas.width, canvas.height);

					// Draw the video frame
					context.drawImage(video, 0, 0);

					// Convert to data URL with higher quality
					const imageData = canvas.toDataURL("image/jpeg", 0.9);

					// Validate the captured image
					if (!imageData || imageData.length < 100) {
						setError("Failed to capture image. Please try again.");
						return;
					}

					console.log("📸 Photo captured:", {
						width: canvas.width,
						height: canvas.height,
						dataSize: imageData.length,
					});

					setCapturedImage(imageData);
				} catch (error) {
					console.error("❌ Error capturing photo:", error);
					setError("Failed to capture photo. Please try again.");
				}
			}
		}
	};

	// Convert data URL to File object with better error handling (fallback method)
	const dataURLtoFile = (dataurl: string, filename: string): File => {
		try {
			const arr = dataurl.split(",");
			if (arr.length !== 2) {
				throw new Error("Invalid data URL format");
			}

			const mimeMatch = arr[0].match(/:(.*?);/);
			if (!mimeMatch) {
				throw new Error("Could not extract MIME type");
			}

			const mime = mimeMatch[1];
			const bstr = atob(arr[1]);
			const n = bstr.length;
			const u8arr = new Uint8Array(n);

			for (let i = 0; i < n; i++) {
				u8arr[i] = bstr.charCodeAt(i);
			}

			console.log("🖼️ Created file from data URL:", {
				filename,
				mime,
				size: u8arr.length,
				dataUrlLength: dataurl.length,
			});

			return new File([u8arr], filename, { type: mime });
		} catch (error) {
			console.error("❌ Error converting data URL to file:", error);
			throw new Error(`Failed to convert image data: ${error.message}`);
		}
	};

	// Alternative method to capture frame as Blob (better for file handling)
	const captureFrameAsBlob = (): Promise<File | null> => {
		return new Promise((resolve) => {
			if (videoRef.current && canvasRef.current) {
				const canvas = canvasRef.current;
				const video = videoRef.current;
				const context = canvas.getContext("2d");

				// Ensure video is ready and has dimensions
				if (video.videoWidth === 0 || video.videoHeight === 0) {
					console.warn("⚠️ Video not ready - no dimensions");
					resolve(null);
					return;
				}

				canvas.width = video.videoWidth;
				canvas.height = video.videoHeight;

				if (context) {
					try {
						// Clear canvas first
						context.clearRect(0, 0, canvas.width, canvas.height);

						// Draw the video frame
						context.drawImage(video, 0, 0);

						// Convert to blob (better encoding than data URL)
						canvas.toBlob(
							(blob) => {
								if (blob) {
									const file = new File(
										[blob],
										`frame-${Date.now()}.jpg`,
										{
											type: "image/jpeg",
										}
									);

									console.log("� Frame captured as blob:", {
										width: canvas.width,
										height: canvas.height,
										fileSize: file.size,
										fileType: file.type,
									});

									resolve(file);
								} else {
									console.error(
										"❌ Failed to create blob from canvas"
									);
									resolve(null);
								}
							},
							"image/jpeg",
							0.9
						);
					} catch (error) {
						console.error(
							"❌ Error capturing frame as blob:",
							error
						);
						resolve(null);
					}
				} else {
					resolve(null);
				}
			} else {
				resolve(null);
			}
		});
	};

	// Capture current video frame without stopping the stream
	const captureCurrentFrame = (): string | null => {
		if (videoRef.current && canvasRef.current) {
			const canvas = canvasRef.current;
			const video = videoRef.current;
			const context = canvas.getContext("2d");

			// Ensure video is ready and has dimensions
			if (video.videoWidth === 0 || video.videoHeight === 0) {
				console.warn("⚠️ Video not ready - no dimensions");
				return null;
			}

			canvas.width = video.videoWidth;
			canvas.height = video.videoHeight;

			if (context) {
				try {
					// Clear canvas first
					context.clearRect(0, 0, canvas.width, canvas.height);

					// Draw the video frame
					context.drawImage(video, 0, 0);

					// Convert to data URL with higher quality and explicit format
					const imageData = canvas.toDataURL("image/jpeg", 0.9);

					// Validate the data URL
					if (!imageData || imageData.length < 100) {
						console.warn("⚠️ Generated image data seems too small");
						return null;
					}

					console.log("📸 Frame captured:", {
						width: canvas.width,
						height: canvas.height,
						dataSize: imageData.length,
					});

					return imageData;
				} catch (error) {
					console.error("❌ Error capturing frame:", error);
					return null;
				}
			}
		}
		return null;
	};

	// Live analysis function that runs periodically
	const performLiveAnalysis = async () => {
		if (!isStreaming || !user || isAnalyzing) {
			return;
		}

		console.log("🔄 Performing live analysis...");

		setIsAnalyzing(true);
		setError(null);

		try {
			// Capture frame as blob (better encoding)
			const file = await captureFrameAsBlob();

			if (!file) {
				console.warn("⚠️ Could not capture frame for live analysis");
				return;
			}

			// Additional validation of file size
			if (file.size < 1000) {
				throw new Error("Captured image file is too small");
			}

			if (file.size > 10 * 1024 * 1024) {
				// 10MB limit
				throw new Error("Captured image file is too large");
			}

			console.log("📤 Sending live frame for analysis...", {
				fileSize: file.size,
				fileType: file.type,
				fileName: file.name,
			});

			const response: ApiResponse<any> = await fashionAPI.cameraAnalyze(
				file
			);
			console.log("✅ Live analysis completed:", response);

			// Transform the ApiResponse to FashionAnalysisResponse format
			const fashionAnalysisResponse: FashionAnalysisResponse = {
				success: response.success,
				message: response.message || "Live analysis completed",
				data: response.data,
			};

			setAnalysisResult(fashionAnalysisResponse);
		} catch (err: any) {
			console.error("❌ Live analysis failed:", err);
			// Don't show errors for live analysis to avoid spam, except for critical ones
			if (
				err?.status !== 429 &&
				(err?.message?.includes("decode") ||
					err?.message?.includes("encoding"))
			) {
				setError(`Image encoding error: ${err.message}`);
			}
		} finally {
			setIsAnalyzing(false);
		}
	};

	// Start live analysis mode
	const startLiveAnalysis = () => {
		if (!user) {
			setError("Please log in to enable live analysis");
			return;
		}

		if (!isStreaming) {
			setError("Please start the camera first");
			return;
		}

		console.log(
			`🔴 Starting live analysis every ${liveAnalysisInterval} seconds`
		);
		setIsLiveAnalysis(true);

		// Perform initial analysis
		performLiveAnalysis();

		// Set up interval for periodic analysis
		liveAnalysisIntervalRef.current = setInterval(
			performLiveAnalysis,
			liveAnalysisInterval * 1000
		);
	};

	// Stop live analysis mode
	const stopLiveAnalysis = () => {
		console.log("⏹️ Stopping live analysis");
		setIsLiveAnalysis(false);

		if (liveAnalysisIntervalRef.current) {
			clearInterval(liveAnalysisIntervalRef.current);
			liveAnalysisIntervalRef.current = null;
		}
	};

	const analyzeCapture = async () => {
		if (!capturedImage) return;

		console.log("🔍 Starting camera analysis...", {
			user: !!user,
			hasImage: !!capturedImage,
		});

		if (!user) {
			setError("Please log in to analyze your outfit");
			return;
		}

		setIsAnalyzing(true);
		setError(null);

		try {
			// Convert captured image to File object using the data URL method
			// (since capturedImage is a data URL from the captured photo)
			const file = dataURLtoFile(capturedImage, "camera-capture.jpg");

			// Additional validation of file size
			if (file.size < 1000) {
				throw new Error("Captured image file is too small");
			}

			if (file.size > 10 * 1024 * 1024) {
				// 10MB limit
				throw new Error("Captured image file is too large");
			}

			console.log("📤 Uploading camera capture for analysis...", {
				fileSize: file.size,
				fileType: file.type,
				fileName: file.name,
			});

			const response: ApiResponse<any> = await fashionAPI.cameraAnalyze(
				file
			);
			console.log("✅ Camera analysis completed:", response);

			// Transform the ApiResponse to FashionAnalysisResponse format
			const fashionAnalysisResponse: FashionAnalysisResponse = {
				success: response.success,
				message: response.message || "Analysis completed successfully",
				data: response.data,
			};

			setAnalysisResult(fashionAnalysisResponse);
		} catch (err: any) {
			console.error("❌ Camera analysis failed:", err);
			const errorMessage =
				err?.message ||
				err?.details?.message ||
				"Failed to analyze outfit";
			setError(errorMessage);
		} finally {
			setIsAnalyzing(false);
		}
	};

	const retakePhoto = () => {
		setCapturedImage(null);
		setAnalysisResult(null);
		setError(null);
	};

	useEffect(() => {
		// Check for camera support on component mount
		const checkCameraSupport = () => {
			console.log("🔍 Checking camera support...");
			console.log("navigator.mediaDevices:", !!navigator.mediaDevices);
			console.log(
				"getUserMedia:",
				!!navigator.mediaDevices?.getUserMedia
			);
			console.log("Location protocol:", window.location.protocol);
			console.log("User agent:", navigator.userAgent);

			if (
				!navigator.mediaDevices ||
				!navigator.mediaDevices.getUserMedia
			) {
				setError("Camera not supported in this browser or environment");
			}

			// Warn about HTTPS requirement for some browsers
			if (
				window.location.protocol !== "https:" &&
				window.location.hostname !== "localhost"
			) {
				console.warn(
					"⚠️ Camera access may require HTTPS in production"
				);
			}
		};

		checkCameraSupport();

		return () => {
			stopCamera();
			// Clean up live analysis interval
			if (liveAnalysisIntervalRef.current) {
				clearInterval(liveAnalysisIntervalRef.current);
			}
		};
	}, []);

	return (
		<div className="min-h-screen bg-gradient-hero">
			<Navbar />

			<div className="w-full px-4 py-8">
				<div className="w-full max-w-none mx-auto">
					{/* Header */}
					<div className="text-center mb-8 animate-fade-up">
						<div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
							<CameraIcon className="w-8 h-8 text-primary" />
						</div>
						<h1 className="text-4xl font-bold mb-4">
							Live Camera Analysis
						</h1>
						<p className="text-xl text-muted-foreground max-w-2xl mx-auto">
							Get real-time fashion feedback using your device
							camera
						</p>
					</div>

					<div className="grid lg:grid-cols-2 gap-8">
						{/* Camera Section */}
						<div className="space-y-6">
							{error && (
								<Alert variant="destructive">
									<AlertCircle className="h-4 w-4" />
									<AlertDescription>{error}</AlertDescription>
								</Alert>
							)}

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
											<div
												className="absolute inset-0 flex items-center justify-center"
												onClick={(e) =>
													console.log(
														"🖱️ Container clicked",
														e.target
													)
												}
											>
												<div
													className="text-center space-y-4"
													onClick={(e) => {
														console.log(
															"🖱️ Inner div clicked",
															e.target
														);
														e.stopPropagation();
													}}
												>
													<CameraIcon className="w-16 h-16 text-muted-foreground mx-auto" />
													<div>
														<h3 className="font-medium mb-2">
															Camera Ready
														</h3>
														<p className="text-sm text-muted-foreground mb-4">
															Start your camera to
															begin live analysis
														</p>
														<Button
															onClick={(e) => {
																console.log(
																	"🖱️ Start Camera button clicked!",
																	e
																);
																startCamera();
															}}
															className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
															disabled={
																isStartingCamera
															}
															style={{
																pointerEvents:
																	"auto",
																zIndex: 10,
																position:
																	"relative",
															}}
														>
															{isStartingCamera
																? "Starting..."
																: "Start Camera"}
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

										<canvas
											ref={canvasRef}
											className="hidden"
										/>
									</div>

									{/* Camera Controls */}
									<div className="flex items-center justify-center gap-4 mt-4">
										{isStreaming && !capturedImage && (
											<>
												<Button
													variant="outline"
													onClick={switchCamera}
												>
													<RotateCcw className="w-4 h-4 mr-2" />
													Switch
												</Button>
												<Button
													onClick={capturePhoto}
													className="btn-gradient"
												>
													<Square className="w-4 h-4 mr-2" />
													Capture
												</Button>
												<Button
													variant="outline"
													onClick={stopCamera}
												>
													Stop Camera
												</Button>
											</>
										)}

										{capturedImage && (
											<>
												<Button
													variant="outline"
													onClick={retakePhoto}
												>
													Retake Photo
												</Button>
												<Button
													onClick={analyzeCapture}
													className="btn-gradient"
													disabled={
														isAnalyzing || !user
													}
												>
													<Zap className="w-4 h-4 mr-2" />
													{isAnalyzing
														? "Analyzing..."
														: "Analyze Style"}
												</Button>
											</>
										)}
									</div>

									{/* Live Analysis Controls */}
									{isStreaming && !capturedImage && (
										<div className="mt-4 p-4 bg-gray-50 rounded-lg">
											<div className="flex items-center justify-between mb-3">
												<h4 className="text-sm font-medium flex items-center gap-2">
													<Timer className="w-4 h-4 text-blue-600" />
													Live Analysis
												</h4>
												{isLiveAnalysis && (
													<Badge className="bg-red-100 text-red-700 border-red-200">
														<div className="w-2 h-2 bg-red-500 rounded-full mr-1 animate-pulse" />
														Live
													</Badge>
												)}
											</div>

											<div className="flex items-center gap-3 mb-3">
												<label className="text-xs text-gray-600">
													Interval:
												</label>
												<select
													value={liveAnalysisInterval}
													onChange={(e) =>
														setLiveAnalysisInterval(
															Number(
																e.target.value
															)
														)
													}
													className="text-xs border rounded px-2 py-1"
													disabled={isLiveAnalysis}
												>
													<option value={3}>
														3 seconds
													</option>
													<option value={5}>
														5 seconds
													</option>
													<option value={10}>
														10 seconds
													</option>
													<option value={15}>
														15 seconds
													</option>
													<option value={30}>
														30 seconds
													</option>
												</select>
											</div>

											<div className="flex items-center justify-center gap-2">
												{!isLiveAnalysis ? (
													<Button
														onClick={
															startLiveAnalysis
														}
														size="sm"
														className="bg-green-600 hover:bg-green-700 text-white"
														disabled={
															!user || isAnalyzing
														}
													>
														<Play className="w-3 h-3 mr-1" />
														Start Live Analysis
													</Button>
												) : (
													<Button
														onClick={
															stopLiveAnalysis
														}
														size="sm"
														variant="outline"
														className="border-red-300 text-red-600 hover:bg-red-50"
													>
														<Pause className="w-3 h-3 mr-1" />
														Stop Live Analysis
													</Button>
												)}
											</div>

											{!user && (
												<p className="text-xs text-gray-500 mt-2 text-center">
													Login required for live
													analysis
												</p>
											)}
										</div>
									)}
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
									{!user && (
										<Alert className="mb-4">
											<AlertCircle className="h-4 w-4" />
											<AlertDescription>
												Please log in to enable outfit
												analysis functionality
											</AlertDescription>
										</Alert>
									)}
									<ul className="space-y-2 text-sm text-muted-foreground">
										<li className="flex items-start gap-2">
											<span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
											Stand in good lighting for best
											results
										</li>
										<li className="flex items-start gap-2">
											<span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
											Show your full outfit in the frame
										</li>
										<li className="flex items-start gap-2">
											<span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
											Keep the camera steady while
											capturing
										</li>
										<li className="flex items-start gap-2">
											<span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
											Use a plain background when possible
										</li>
										<li className="flex items-start gap-2">
											<span className="w-1.5 h-1.5 bg-green-600 rounded-full mt-2 flex-shrink-0" />
											Use Live Analysis for real-time
											fashion feedback
										</li>
										<li className="flex items-start gap-2">
											<span className="w-1.5 h-1.5 bg-green-600 rounded-full mt-2 flex-shrink-0" />
											Longer intervals save battery and
											data usage
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
												<h3 className="text-lg font-semibold">
													{isLiveAnalysis
														? "Live Analysis Running..."
														: "Analyzing Your Style..."}
												</h3>
												<p className="text-muted-foreground">
													{isLiveAnalysis
														? "Continuously analyzing your outfit"
														: "Processing your capture"}
												</p>
											</div>
										</div>
									</CardContent>
								</Card>
							)}

							{analysisResult && !isAnalyzing && (
								<div className="space-y-3">
									{isLiveAnalysis && (
										<div className="text-center">
											<Badge className="bg-green-100 text-green-700 border-green-200">
												<Timer className="w-3 h-3 mr-1" />
												Live Analysis Active
											</Badge>
											<p className="text-xs text-gray-500 mt-1">
												Updates every{" "}
												{liveAnalysisInterval} seconds
											</p>
										</div>
									)}
									<FashionAnalysisCard
										result={analysisResult}
									/>
								</div>
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
	);
}
