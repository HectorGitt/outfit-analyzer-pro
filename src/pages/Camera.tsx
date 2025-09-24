import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
	Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FashionAnalysisCard } from "@/components/ui/fashion-analysis-card";
import { Navbar } from "@/components/navigation/navbar";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuthStore } from "@/stores/authStore";
import { fashionAPI } from "@/services/api";
import { useUserPricingTier } from "@/hooks/usePricing";

export default function Camera() {
	const { user } = useAuthStore();
	const { data: userTier, isLoading: pricingLoading } = useUserPricingTier();
	const isPro = userTier?.tier !== "free";

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

	const startCamera = async () => {
		if (!isPro) {
			setError(
				"Camera analysis is a Pro feature. Please upgrade to access live camera functionality."
			);
			return;
		}

		//console.log("🎥 Starting camera...");
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

			//console.log("📱 Requesting camera access...");
			const stream = await navigator.mediaDevices.getUserMedia({
				video: {
					facingMode,
					width: { ideal: 1280 },
					height: { ideal: 720 },
				},
			});

			//console.log("✅ Camera access granted");

			if (videoRef.current) {
				videoRef.current.srcObject = stream;
				setIsStreaming(true);
				//console.log("🔄 Video stream connected");
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

					/* console.log("📸 Photo captured:", {
						width: canvas.width,
						height: canvas.height,
						dataSize: imageData.length,
					}); */

					setCapturedImage(imageData);

					// Stop the camera after capturing the image
					stopCamera();
					//console.log("📵 Camera stopped after capture");
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

			/* console.log("🖼️ Created file from data URL:", {
				filename,
				mime,
				size: u8arr.length,
				dataUrlLength: dataurl.length,
			}); */

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

									/* console.log("� Frame captured as blob:", {
										width: canvas.width,
										height: canvas.height,
										fileSize: file.size,
										fileType: file.type,
									}); */

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

					/* console.log("📸 Frame captured:", {
						width: canvas.width,
						height: canvas.height,
						dataSize: imageData.length,
					}); */

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

		//console.log("🔄 Performing live analysis...");

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

			/* console.log("📤 Sending live frame for analysis...", {
				fileSize: file.size,
				fileType: file.type,
				fileName: file.name,
			}); */

			const response: ApiResponse<any> = await fashionAPI.cameraAnalyze(
				file
			);
			//console.log("✅ Live analysis completed:", response);

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
		if (!isPro) {
			setError(
				"Live analysis is a Pro feature. Please upgrade to access this functionality."
			);
			return;
		}

		if (!user) {
			setError("Please log in to enable live analysis");
			return;
		}

		if (!isStreaming) {
			setError("Please start the camera first");
			return;
		}

		/* console.log(
			`🔴 Starting live analysis every ${liveAnalysisInterval} seconds`
		); */
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
		//console.log("⏹️ Stopping live analysis");
		setIsLiveAnalysis(false);

		if (liveAnalysisIntervalRef.current) {
			clearInterval(liveAnalysisIntervalRef.current);
			liveAnalysisIntervalRef.current = null;
		}
	};

	const analyzeCapture = async () => {
		if (!capturedImage) return;
		/* console.log("🔍 Starting camera analysis...", {
			user: !!user,
			hasImage: !!capturedImage,
		}); */

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

			/* console.log("📤 Uploading camera capture for analysis...", {
				fileSize: file.size,
				fileType: file.type,
				fileName: file.name,
			}); */

			const response: ApiResponse<any> = await fashionAPI.cameraAnalyze(
				file
			);
			//console.log("✅ Camera analysis completed:", response);

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
		// Restart the camera when retaking
		startCamera();
	};

	useEffect(() => {
		// Check for camera support on component mount
		const checkCameraSupport = () => {
			//console.log("🔍 Checking camera support...");
			//console.log("navigator.mediaDevices:", !!navigator.mediaDevices);
			/* console.log(
				"getUserMedia:",
				!!navigator.mediaDevices?.getUserMedia
			); */
			//console.log("Location protocol:", window.location.protocol);
			//console.log("User agent:", navigator.userAgent);

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
		<div className="min-h-screen bg-gradient-hero pt-16">
			<Navbar />

			<div className="container mx-auto px-4 py-6 lg:py-8">
				<div className="max-w-7xl mx-auto">
					{/* Header */}
					<div className="text-center mb-6 lg:mb-8 animate-fade-up">
						<div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
							<CameraIcon className="w-8 h-8 text-primary" />
						</div>
						<h1 className="text-3xl lg:text-4xl font-bold mb-3 lg:mb-4">
							Live Camera Analysis
						</h1>
						<p className="text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto px-4">
							Get real-time fashion feedback using your device
							camera
						</p>
						{!isPro && (
							<div className="mt-4">
								<Badge
									variant="outline"
									className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200 text-purple-700"
								>
									<Lock className="w-3 h-3 mr-1" />
									Pro Feature
								</Badge>
							</div>
						)}
					</div>

					{/* Error Alert */}
					{error && (
						<div className="mb-6 lg:mb-8">
							<Alert
								variant="destructive"
								className="max-w-4xl mx-auto"
							>
								<AlertCircle className="h-4 w-4" />
								<AlertDescription className="text-sm lg:text-base">
									{error}
								</AlertDescription>
							</Alert>
						</div>
					)}

					<div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
						{/* Camera Section */}
						<div className="xl:col-span-2 space-y-6">
							<Card className="card-fashion overflow-hidden">
								<CardHeader className="pb-4">
									<div className="flex items-center justify-between">
										<CardTitle className="flex items-center gap-3">
											<div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
												<CameraIcon className="w-5 h-5 text-primary" />
											</div>
											Camera Feed
											{!isPro && (
												<Badge
													variant="outline"
													className="ml-2 bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200 text-purple-700"
												>
													Pro Only
												</Badge>
											)}
										</CardTitle>
										{isStreaming && (
											<Badge className="bg-green-100 text-green-700 border-green-200 animate-pulse">
												<div className="w-2 h-2 bg-green-500 rounded-full mr-2" />
												Live
											</Badge>
										)}
									</div>
									{!isPro && (
										<p className="text-sm text-muted-foreground mt-2">
											Live camera analysis is available
											with our Pro plan. Upgrade to access
											real-time outfit feedback.
										</p>
									)}
								</CardHeader>
								<CardContent className="p-0">
									<div className="relative bg-muted rounded-xl overflow-hidden aspect-video">
										{!isPro && (
											<div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-10 rounded-xl flex items-center justify-center">
												<div className="text-center">
													<Lock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
													<h3 className="text-lg font-semibold mb-2">
														Camera Analysis - Pro
														Feature
													</h3>
													<p className="text-muted-foreground mb-4 max-w-sm mx-auto">
														Get real-time fashion
														feedback with live
														camera analysis
													</p>
													<div className="space-y-3 mb-4">
														<div className="text-sm text-muted-foreground">
															<p>
																📸 Live camera
																analysis
															</p>
															<p>
																⚡ Real-time
																outfit feedback
															</p>
															<p>
																🎯 Instant style
																recommendations
															</p>
															<p>
																📱 Mobile &
																desktop support
															</p>
														</div>
													</div>
												</div>
											</div>
										)}

										{!isStreaming && !capturedImage && (
											<div className="absolute inset-0 flex items-center justify-center">
												<div className="text-center space-y-4">
													<CameraIcon className="w-16 h-16 text-muted-foreground mx-auto" />
													<div>
														<h3 className="font-medium mb-2">
															Camera Ready
														</h3>
														<p className="text-sm text-muted-foreground mb-4">
															Start your camera to
															begin live analysis
														</p>
														{isPro && (
															<Button
																onClick={(
																	e
																) => {
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
														)}
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
									<div className="p-6 bg-gradient-to-r from-gray-50 to-white">
										{isStreaming &&
											!capturedImage &&
											isPro && (
												<div className="flex flex-wrap items-center justify-center gap-3">
													<Button
														variant="outline"
														onClick={switchCamera}
														className="flex items-center gap-2 hover:bg-gray-50"
													>
														<RotateCcw className="w-4 h-4" />
														<span className="hidden sm:inline">
															Switch Camera
														</span>
													</Button>
													<Button
														onClick={capturePhoto}
														className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-6 py-2 rounded-lg font-medium"
													>
														<Square className="w-4 h-4 mr-2" />
														Capture Photo
													</Button>
													<Button
														variant="outline"
														onClick={stopCamera}
														className="text-red-600 border-red-200 hover:bg-red-50"
													>
														Stop Camera
													</Button>
												</div>
											)}

										{capturedImage && isPro && (
											<div className="flex flex-wrap items-center justify-center gap-3">
												<Button
													variant="outline"
													onClick={retakePhoto}
													className="flex items-center gap-2 hover:bg-gray-50"
												>
													<RotateCcw className="w-4 h-4" />
													Retake Photo
												</Button>
												<Button
													onClick={analyzeCapture}
													disabled={
														isAnalyzing || !user
													}
													className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white px-6 py-2 rounded-lg font-medium"
												>
													<Zap className="w-4 h-4 mr-2" />
													{isAnalyzing
														? "Analyzing..."
														: "Analyze Style"}
												</Button>
											</div>
										)}

										{!isPro && (
											<div className="text-center">
												<Button
													onClick={() =>
														navigate("/pricing")
													}
													className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-8 py-3 rounded-lg font-medium"
													size="lg"
												>
													<Lock className="w-4 h-4 mr-2" />
													Upgrade for Camera Access
												</Button>
											</div>
										)}
									</div>

									{/* Live Analysis Controls */}
									{isStreaming && !capturedImage && isPro && (
										<Card className="card-fashion">
											<CardHeader>
												<CardTitle className="flex items-center gap-3">
													<div className="w-10 h-10 bg-gradient-to-r from-green-100 to-blue-100 rounded-lg flex items-center justify-center">
														<Timer className="w-5 h-5 text-green-600" />
													</div>
													Live Analysis
													{isLiveAnalysis && (
														<Badge className="bg-green-100 text-green-700 border-green-200 animate-pulse">
															<div className="w-2 h-2 bg-green-500 rounded-full mr-1" />
															Active
														</Badge>
													)}
												</CardTitle>
												<p className="text-sm text-muted-foreground mt-1">
													Get real-time fashion
													feedback with automatic
													analysis
												</p>
											</CardHeader>
											<CardContent>
												<div className="space-y-4">
													<div className="flex items-center justify-between">
														<label className="text-sm font-medium text-gray-700">
															Analysis Interval
														</label>
														<select
															value={
																liveAnalysisInterval
															}
															onChange={(e) =>
																setLiveAnalysisInterval(
																	Number(
																		e.target
																			.value
																	)
																)
															}
															className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
															disabled={
																isLiveAnalysis
															}
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

													<div className="flex items-center justify-center gap-3">
														{!isLiveAnalysis ? (
															<Button
																onClick={
																	startLiveAnalysis
																}
																disabled={
																	!user ||
																	isAnalyzing
																}
																className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white px-6 py-2 rounded-lg font-medium"
															>
																<Play className="w-4 h-4 mr-2" />
																Start Live
																Analysis
															</Button>
														) : (
															<Button
																onClick={
																	stopLiveAnalysis
																}
																variant="outline"
																className="border-red-200 text-red-600 hover:bg-red-50 px-6 py-2 rounded-lg"
															>
																<Pause className="w-4 h-4 mr-2" />
																Stop Live
																Analysis
															</Button>
														)}
													</div>

													{!user && (
														<Alert>
															<AlertCircle className="h-4 w-4" />
															<AlertDescription className="text-sm">
																Please log in to
																enable live
																analysis
															</AlertDescription>
														</Alert>
													)}
												</div>
											</CardContent>
										</Card>
									)}
								</CardContent>
							</Card>

							{/* Camera Tips */}
							<Card className="card-fashion">
								<CardHeader>
									<CardTitle className="flex items-center gap-3">
										<div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
											<Settings className="w-5 h-5 text-primary" />
										</div>
										Camera Tips
									</CardTitle>
								</CardHeader>
								<CardContent>
									{!isPro && (
										<Alert className="mb-4 border-purple-200 bg-purple-50">
											<Lock className="h-4 w-4 text-purple-600" />
											<AlertDescription className="text-sm">
												Live camera analysis is a Pro
												feature.
												<Button
													variant="link"
													className="p-0 h-auto ml-1 text-purple-600 hover:text-purple-700 font-medium"
													onClick={() =>
														navigate("/pricing")
													}
												>
													Upgrade to Pro
												</Button>
												to unlock real-time outfit
												feedback.
											</AlertDescription>
										</Alert>
									)}
									{!user && (
										<Alert className="mb-4">
											<AlertCircle className="h-4 w-4" />
											<AlertDescription className="text-sm">
												Please log in to enable outfit
												analysis functionality
											</AlertDescription>
										</Alert>
									)}
									<div className="space-y-3">
										<div className="flex items-start gap-3">
											<div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
											<p className="text-sm text-muted-foreground">
												Stand in good lighting for best
												results
											</p>
										</div>
										<div className="flex items-start gap-3">
											<div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
											<p className="text-sm text-muted-foreground">
												Show your full outfit in the
												frame
											</p>
										</div>
										<div className="flex items-start gap-3">
											<div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
											<p className="text-sm text-muted-foreground">
												Keep the camera steady while
												capturing
											</p>
										</div>
										<div className="flex items-start gap-3">
											<div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
											<p className="text-sm text-muted-foreground">
												Use a plain background when
												possible
											</p>
										</div>
										{isPro && (
											<>
												<div className="flex items-start gap-3">
													<div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
													<p className="text-sm text-green-700 font-medium">
														Use Live Analysis for
														real-time fashion
														feedback
													</p>
												</div>
												<div className="flex items-start gap-3">
													<div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
													<p className="text-sm text-green-700 font-medium">
														Longer intervals save
														battery and data usage
													</p>
												</div>
											</>
										)}
									</div>
								</CardContent>
							</Card>
						</div>

						{/* Analysis Results & Tips */}
						<div className="space-y-6">
							{/* Analysis Results */}
							{analysisResult && (
								<div className="space-y-3">
									{isLiveAnalysis && (
										<div className="text-center mb-4">
											<Badge className="bg-green-100 text-green-700 border-green-200 animate-pulse">
												<Timer className="w-3 h-3 mr-1" />
												Live Analysis Active
											</Badge>
											<p className="text-xs text-gray-500 mt-1">
												Updates every{" "}
												{liveAnalysisInterval} seconds
											</p>
										</div>
									)}
									{isAnalyzing && !analysisResult && (
										<div className="mb-4">
											<Card className="card-fashion border-blue-200 bg-blue-50/50">
												<CardContent className="flex items-center justify-center py-6">
													<div className="text-center space-y-3">
														<div className="w-12 h-12 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full mx-auto animate-pulse flex items-center justify-center">
															<Zap className="w-6 h-6 text-blue-600" />
														</div>
														<div>
															<h4 className="text-sm font-semibold text-blue-700">
																{isLiveAnalysis
																	? "Updating Live Analysis..."
																	: "Analyzing New Style..."}
															</h4>
															<p className="text-xs text-blue-600">
																{isLiveAnalysis
																	? "Getting latest fashion feedback"
																	: "Processing your new capture"}
															</p>
														</div>
														<div className="w-24 h-1.5 bg-blue-200 rounded-full overflow-hidden">
															<div className="w-full h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse"></div>
														</div>
													</div>
												</CardContent>
											</Card>
										</div>
									)}
									<FashionAnalysisCard
										result={analysisResult}
									/>
								</div>
							)}

							{!analysisResult && isAnalyzing && (
								<Card className="card-fashion">
									<CardContent className="flex items-center justify-center py-12">
										<div className="text-center space-y-4">
											<div className="w-16 h-16 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full mx-auto animate-pulse flex items-center justify-center">
												<Zap className="w-8 h-8 text-blue-600" />
											</div>
											<div>
												<h3 className="text-lg font-semibold">
													{isLiveAnalysis
														? "Live Analysis Running..."
														: "Analyzing Your Style..."}
												</h3>
												<p className="text-muted-foreground text-sm">
													{isLiveAnalysis
														? "Continuously analyzing your outfit"
														: "Processing your capture with AI"}
												</p>
											</div>
											<div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
												<div className="w-full h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse"></div>
											</div>
										</div>
									</CardContent>
								</Card>
							)}

							{!analysisResult && !isAnalyzing && (
								<Card className="card-fashion border-dashed border-2">
									<CardContent className="flex items-center justify-center py-12">
										<div className="text-center space-y-3">
											<div className="w-12 h-12 bg-muted rounded-full mx-auto flex items-center justify-center">
												<CameraIcon className="w-6 h-6 text-muted-foreground" />
											</div>
											<h3 className="text-lg font-medium text-muted-foreground">
												Ready for Analysis
											</h3>
											<p className="text-sm text-muted-foreground">
												Capture a photo to see your
												fashion analysis
											</p>
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
