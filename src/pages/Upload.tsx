import { useState, useCallback } from "react";
import { ImageUpload } from "@/components/ui/image-upload";
import { FashionAnalysisCard } from "@/components/ui/fashion-analysis-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
	Upload as UploadIcon,
	Sparkles,
	AlertCircle,
	Camera,
	Image as ImageIcon,
	X,
	RotateCcw,
	Download,
	Share2,
	Heart,
	Star,
	TrendingUp,
	Zap,
	Users,
	Clock,
	CheckCircle,
	Loader2,
	Grid3X3,
	List,
	Filter,
	Search,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuthStore } from "@/stores/authStore";
import { fashionAPI } from "@/services/api";
import { FashionAnalysisResponse, ApiResponse } from "@/types";
import { Navbar } from "@/components/navigation/navbar";
import { cn } from "@/lib/utils";

interface UploadedFile {
	id: string;
	file: File;
	preview: string;
	analysis?: FashionAnalysisResponse;
	isAnalyzing: boolean;
	error?: string;
	uploadedAt: Date;
}

export default function Upload() {
	const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
	const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
	const [isBatchAnalyzing, setIsBatchAnalyzing] = useState(false);
	const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
	const [searchQuery, setSearchQuery] = useState("");
	const [filterStatus, setFilterStatus] = useState<
		"all" | "analyzed" | "pending" | "error"
	>("all");
	const { user } = useAuthStore();

	const selectedFile = uploadedFiles.find((f) => f.id === selectedFileId);

	const handleFileUpload = useCallback(
		(files: File[]) => {
			const newUploadedFiles: UploadedFile[] = files.map((file) => ({
				id:
					Date.now().toString() +
					Math.random().toString(36).substr(2, 9),
				file,
				preview: "",
				isAnalyzing: false,
				uploadedAt: new Date(),
			}));

			// Create previews for new files
			newUploadedFiles.forEach((uploadedFile) => {
				const reader = new FileReader();
				reader.onload = (e) => {
					const preview = e.target?.result as string;
					setUploadedFiles((prev) =>
						prev.map((f) =>
							f.id === uploadedFile.id ? { ...f, preview } : f
						)
					);
				};
				reader.readAsDataURL(uploadedFile.file);
			});

			setUploadedFiles((prev) => [...prev, ...newUploadedFiles]);

			// Auto-select first file if none selected
			if (!selectedFileId && newUploadedFiles.length > 0) {
				setSelectedFileId(newUploadedFiles[0].id);
			}
		},
		[selectedFileId]
	);

	const handleAnalyze = async (fileId: string): Promise<void> => {
		if (!user) {
			setUploadedFiles((prev) =>
				prev.map((f) =>
					f.id === fileId
						? {
								...f,
								error: "Please log in to analyze your outfit",
						  }
						: f
				)
			);
			return;
		}

		setUploadedFiles((prev) =>
			prev.map((f) =>
				f.id === fileId
					? { ...f, isAnalyzing: true, error: undefined }
					: f
			)
		);

		try {
			const fileData = uploadedFiles.find((f) => f.id === fileId);
			if (!fileData) return;

			const response: ApiResponse<any> = await fashionAPI.uploadAnalyze(
				fileData.file
			);

			const fashionAnalysisResponse: FashionAnalysisResponse = {
				success: response.success,
				message: response.message || "Analysis completed successfully",
				data: response.data,
			};

			setUploadedFiles((prev) =>
				prev.map((f) =>
					f.id === fileId
						? {
								...f,
								analysis: fashionAnalysisResponse,
								isAnalyzing: false,
						  }
						: f
				)
			);
		} catch (err: any) {
			console.error("❌ Analysis failed:", err);
			const errorMessage =
				err?.message ||
				err?.details?.message ||
				"Failed to analyze outfit";

			setUploadedFiles((prev) =>
				prev.map((f) =>
					f.id === fileId
						? { ...f, error: errorMessage, isAnalyzing: false }
						: f
				)
			);
		}
	};

	const handleBatchAnalyze = async () => {
		const pendingFiles = uploadedFiles.filter(
			(f) => !f.analysis && !f.isAnalyzing && !f.error
		);

		if (pendingFiles.length === 0) return;

		setIsBatchAnalyzing(true);

		try {
			await Promise.all(
				pendingFiles.map((file) => handleAnalyze(file.id))
			);
		} finally {
			setIsBatchAnalyzing(false);
		}
	};

	const removeFile = (fileId: string) => {
		setUploadedFiles((prev) => prev.filter((f) => f.id !== fileId));
		if (selectedFileId === fileId) {
			const remainingFiles = uploadedFiles.filter((f) => f.id !== fileId);
			setSelectedFileId(
				remainingFiles.length > 0 ? remainingFiles[0].id : null
			);
		}
	};

	const filteredFiles = uploadedFiles.filter((file) => {
		const matchesSearch = file.file.name
			.toLowerCase()
			.includes(searchQuery.toLowerCase());
		const matchesFilter =
			filterStatus === "all" ||
			(filterStatus === "analyzed" && file.analysis) ||
			(filterStatus === "pending" && !file.analysis && !file.error) ||
			(filterStatus === "error" && file.error);

		return matchesSearch && matchesFilter;
	});

	const stats = {
		total: uploadedFiles.length,
		analyzed: uploadedFiles.filter((f) => f.analysis).length,
		pending: uploadedFiles.filter((f) => !f.analysis && !f.error).length,
		errors: uploadedFiles.filter((f) => f.error).length,
	};

	return (
		<div className="min-h-screen bg-gradient-hero overflow-x-hidden pt-16">
			<Navbar />
			<div className="container mx-auto px-2 sm:px-4 py-8">
				<div className="max-w-7xl mx-auto">
					{/* Enhanced Header */}
					<div className="text-center mb-8 animate-fade-up">
						<div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full mb-6 shadow-lg">
							<Camera className="w-10 h-10 text-primary" />
						</div>
						<h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
							AI Fashion Analysis
						</h1>
						<p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
							Upload multiple outfit photos and get instant
							AI-powered style analysis, personalized
							recommendations, and fashion insights
						</p>

						{/* Quick Stats */}
						{uploadedFiles.length > 0 && (
							<div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6 mt-6">
								<div className="text-center">
									<div className="text-2xl font-bold text-primary">
										{stats.total}
									</div>
									<div className="text-sm text-muted-foreground">
										Uploaded
									</div>
								</div>
								<div className="text-center">
									<div className="text-2xl font-bold text-green-600">
										{stats.analyzed}
									</div>
									<div className="text-sm text-muted-foreground">
										Analyzed
									</div>
								</div>
								<div className="text-center">
									<div className="text-2xl font-bold text-blue-600">
										{stats.pending}
									</div>
									<div className="text-sm text-muted-foreground">
										Pending
									</div>
								</div>
							</div>
						)}
					</div>

					<div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-8">
						{/* Upload Section */}
						<div className="lg:col-span-1 space-y-6">
							<Card className="card-fashion border-2 border-dashed border-primary/20 hover:border-primary/40 transition-colors">
								<CardHeader>
									<CardTitle className="flex items-center gap-2">
										<UploadIcon className="w-5 h-5 text-primary" />
										Upload Photos
									</CardTitle>
								</CardHeader>
								<CardContent>
									<ImageUpload
										onUpload={handleFileUpload}
										maxFiles={10}
										multiple={true}
									/>
								</CardContent>
							</Card>

							{/* Batch Actions */}
							{uploadedFiles.length > 0 && (
								<Card className="card-fashion">
									<CardHeader>
										<CardTitle className="text-lg">
											Batch Actions
										</CardTitle>
									</CardHeader>
									<CardContent className="space-y-3">
										<Button
											onClick={handleBatchAnalyze}
											disabled={
												isBatchAnalyzing ||
												stats.pending === 0
											}
											className="w-full btn-gradient"
											size="lg"
										>
											{isBatchAnalyzing ? (
												<>
													<Loader2 className="w-5 h-5 mr-2 animate-spin" />
													Analyzing All...
												</>
											) : (
												<>
													<Zap className="w-5 h-5 mr-2" />
													Analyze All ({stats.pending}
													)
												</>
											)}
										</Button>

										<div className="flex gap-2">
											<Button
												variant="outline"
												size="sm"
												onClick={() =>
													setViewMode("grid")
												}
												className={cn(
													viewMode === "grid" &&
														"bg-primary/10"
												)}
											>
												<Grid3X3 className="w-4 h-4" />
											</Button>
											<Button
												variant="outline"
												size="sm"
												onClick={() =>
													setViewMode("list")
												}
												className={cn(
													viewMode === "list" &&
														"bg-primary/10"
												)}
											>
												<List className="w-4 h-4" />
											</Button>
										</div>
									</CardContent>
								</Card>
							)}

							{/* Enhanced Tips */}
							<Card className="card-fashion">
								<CardHeader>
									<CardTitle className="text-lg flex items-center gap-2">
										<Sparkles className="w-5 h-5 text-primary" />
										Pro Tips
									</CardTitle>
								</CardHeader>
								<CardContent>
									<div className="space-y-4">
										<div className="flex items-start gap-3 p-3 bg-primary/5 rounded-lg">
											<CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
											<div>
												<h4 className="font-medium text-sm">
													Best Lighting
												</h4>
												<p className="text-xs text-muted-foreground">
													Natural daylight gives the
													most accurate analysis
												</p>
											</div>
										</div>
										<div className="flex items-start gap-3 p-3 bg-blue/5 rounded-lg">
											<TrendingUp className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
											<div>
												<h4 className="font-medium text-sm">
													Full Body Shots
												</h4>
												<p className="text-xs text-muted-foreground">
													Include your entire outfit
													for comprehensive feedback
												</p>
											</div>
										</div>
										<div className="flex items-start gap-3 p-3 bg-purple/5 rounded-lg">
											<Users className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
											<div>
												<h4 className="font-medium text-sm">
													Multiple Angles
												</h4>
												<p className="text-xs text-muted-foreground">
													Upload different views for
													better style assessment
												</p>
											</div>
										</div>
									</div>
								</CardContent>
							</Card>
						</div>

						{/* Files Gallery */}
						<div className="lg:col-span-2 space-y-6">
							{uploadedFiles.length > 0 && (
								<Card className="card-fashion">
									<CardHeader>
										<div className="flex items-center justify-between">
											<CardTitle>
												Your Photos (
												{filteredFiles.length})
											</CardTitle>
											<div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
												<div className="relative">
													<Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
													<input
														type="text"
														placeholder="Search photos..."
														value={searchQuery}
														onChange={(e) =>
															setSearchQuery(
																e.target.value
															)
														}
														className="pl-9 pr-3 py-2 text-sm border rounded-md w-full sm:w-48"
													/>
												</div>
												<select
													value={filterStatus}
													onChange={(e) =>
														setFilterStatus(
															e.target
																.value as any
														)
													}
													className="px-3 py-2 text-sm border rounded-md w-full sm:w-auto"
												>
													<option value="all">
														All ({stats.total})
													</option>
													<option value="analyzed">
														Analyzed (
														{stats.analyzed})
													</option>
													<option value="pending">
														Pending ({stats.pending}
														)
													</option>
													<option value="error">
														Errors ({stats.errors})
													</option>
												</select>
											</div>
										</div>
									</CardHeader>
									<CardContent>
										{filteredFiles.length === 0 ? (
											<div className="text-center py-12">
												<ImageIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
												<p className="text-muted-foreground">
													No photos match your filters
												</p>
											</div>
										) : (
											<div
												className={cn(
													viewMode === "grid"
														? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4"
														: "space-y-4"
												)}
											>
												{filteredFiles.map((file) => (
													<div
														key={file.id}
														className={cn(
															"relative group cursor-pointer transition-all duration-200 hover:scale-105",
															selectedFileId ===
																file.id &&
																"ring-2 ring-primary",
															viewMode === "grid"
																? "aspect-square"
																: "flex gap-4 p-4 border rounded-lg"
														)}
														onClick={() =>
															setSelectedFileId(
																file.id
															)
														}
													>
														<img
															src={file.preview}
															alt={file.file.name}
															className={cn(
																"object-cover rounded-lg shadow-md",
																viewMode ===
																	"grid"
																	? "w-full h-full"
																	: "w-24 h-24 flex-shrink-0"
															)}
														/>
														<div
															className={cn(
																"absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded-lg",
																viewMode ===
																	"grid"
																	? ""
																	: "relative bg-transparent"
															)}
														>
															<div className="absolute top-2 right-2 flex gap-1">
																{file.analysis && (
																	<Badge className="bg-green-500 text-white text-xs">
																		<CheckCircle className="w-3 h-3 mr-1" />
																		Done
																	</Badge>
																)}
																{file.isAnalyzing && (
																	<Badge className="bg-blue-500 text-white text-xs">
																		<Loader2 className="w-3 h-3 mr-1 animate-spin" />
																		Analyzing
																	</Badge>
																)}
																{file.error && (
																	<Badge className="bg-red-500 text-white text-xs">
																		Error
																	</Badge>
																)}
																<Button
																	size="icon"
																	variant="destructive"
																	className="w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity"
																	onClick={(
																		e
																	) => {
																		e.stopPropagation();
																		removeFile(
																			file.id
																		);
																	}}
																>
																	<X className="w-3 h-3" />
																</Button>
															</div>
														</div>
														{viewMode ===
															"list" && (
															<div className="flex-1 min-w-0">
																<h4 className="font-medium text-sm truncate">
																	{
																		file
																			.file
																			.name
																	}
																</h4>
																<p className="text-xs text-muted-foreground">
																	{file.file
																		.size >
																	1024 * 1024
																		? `${(
																				file
																					.file
																					.size /
																				(1024 *
																					1024)
																		  ).toFixed(
																				1
																		  )} MB`
																		: `${(
																				file
																					.file
																					.size /
																				1024
																		  ).toFixed(
																				1
																		  )} KB`}
																</p>
																<p className="text-xs text-muted-foreground">
																	{file.uploadedAt.toLocaleDateString()}
																</p>
															</div>
														)}
													</div>
												))}
											</div>
										)}
									</CardContent>
								</Card>
							)}

							{/* Analysis Results */}
							{selectedFile && (
								<Card className="card-fashion">
									<CardHeader>
										<div className="flex items-center justify-between">
											<CardTitle className="flex items-center gap-2">
												<Star className="w-5 h-5 text-primary" />
												Analysis Results
											</CardTitle>
											<div className="flex items-center gap-2">
												{selectedFile.analysis && (
													<Button
														variant="outline"
														size="sm"
													>
														<Download className="w-4 h-4 mr-2" />
														Export
													</Button>
												)}
												{!selectedFile.analysis &&
													!selectedFile.isAnalyzing && (
														<Button
															onClick={() =>
																handleAnalyze(
																	selectedFile.id
																)
															}
															size="sm"
															className="btn-gradient"
														>
															<Sparkles className="w-4 h-4 mr-2" />
															Analyze
														</Button>
													)}
											</div>
										</div>
									</CardHeader>
									<CardContent>
										{selectedFile.isAnalyzing ? (
											<div className="text-center py-12">
												<div className="w-16 h-16 bg-gradient-primary rounded-full mx-auto mb-4 animate-float flex items-center justify-center">
													<Sparkles className="w-8 h-8 text-white animate-pulse" />
												</div>
												<h3 className="text-lg font-semibold mb-2">
													Analyzing Your Style...
												</h3>
												<p className="text-muted-foreground mb-4">
													Our AI is evaluating your
													outfit
												</p>
												<Progress
													value={undefined}
													className="w-48 mx-auto"
												/>
											</div>
										) : selectedFile.error ? (
											<Alert variant="destructive">
												<AlertCircle className="h-4 w-4" />
												<AlertDescription>
													{selectedFile.error}
												</AlertDescription>
											</Alert>
										) : selectedFile.analysis ? (
											<FashionAnalysisCard
												result={selectedFile.analysis}
											/>
										) : (
											<div className="text-center py-12">
												<ImageIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
												<h3 className="text-lg font-medium text-muted-foreground mb-2">
													Ready to Analyze
												</h3>
												<p className="text-muted-foreground mb-4">
													Click the analyze button to
													get AI-powered fashion
													insights
												</p>
												<Button
													onClick={() =>
														handleAnalyze(
															selectedFile.id
														)
													}
													className="btn-gradient"
												>
													<Sparkles className="w-5 h-5 mr-2" />
													Start Analysis
												</Button>
											</div>
										)}
									</CardContent>
								</Card>
							)}

							{/* Empty State */}
							{uploadedFiles.length === 0 && (
								<Card className="card-fashion border-dashed border-2">
									<CardContent className="flex items-center justify-center py-16">
										<div className="text-center space-y-4">
											<div className="w-20 h-20 bg-muted/50 rounded-full mx-auto flex items-center justify-center">
												<Camera className="w-10 h-10 text-muted-foreground" />
											</div>
											<div>
												<h3 className="text-xl font-semibold text-muted-foreground mb-2">
													No Photos Yet
												</h3>
												<p className="text-muted-foreground max-w-md">
													Upload your outfit photos to
													get started with AI-powered
													fashion analysis and
													personalized style
													recommendations.
												</p>
											</div>
											<div className="flex items-center gap-4 text-sm text-muted-foreground">
												<div className="flex items-center gap-1">
													<CheckCircle className="w-4 h-4 text-green-600" />
													Free Analysis
												</div>
												<div className="flex items-center gap-1">
													<TrendingUp className="w-4 h-4 text-blue-600" />
													Trend Insights
												</div>
												<div className="flex items-center gap-1">
													<Heart className="w-4 h-4 text-red-600" />
													Personalized Tips
												</div>
											</div>
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
