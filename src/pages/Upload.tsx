import { useState } from "react";
import { ImageUpload } from "@/components/ui/image-upload";
import { FashionAnalysisCard } from "@/components/ui/fashion-analysis-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload as UploadIcon, Sparkles, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuthStore } from "@/stores/authStore";
import { fashionAPI } from "@/services/api";
import { FashionAnalysisResponse, ApiResponse } from "@/types";

export default function Upload() {
	const [analysisResult, setAnalysisResult] =
		useState<FashionAnalysisResponse | null>(null);
	const [isAnalyzing, setIsAnalyzing] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const { user } = useAuthStore();

	const handleAnalyze = async (file: File): Promise<void> => {
		console.log("🔍 Starting analysis...", {
			user: !!user,
			fileName: file.name,
			fileSize: file.size,
		});

		if (!user) {
			setError("Please log in to analyze your outfit");
			return;
		}

		setIsAnalyzing(true);
		setError(null);

		try {
			console.log("📤 Uploading file for analysis...");
			const response: ApiResponse<any> = await fashionAPI.uploadAnalyze(
				file
			);
			console.log("✅ Analysis completed:", response);

			// Transform the ApiResponse to FashionAnalysisResponse format
			const fashionAnalysisResponse: FashionAnalysisResponse = {
				success: response.success,
				message: response.message || "Analysis completed successfully",
				data: response.data,
			};

			setAnalysisResult(fashionAnalysisResponse);
		} catch (err: any) {
			console.error("❌ Analysis failed:", err);
			const errorMessage =
				err?.message ||
				err?.details?.message ||
				"Failed to analyze outfit";
			setError(errorMessage);
		} finally {
			setIsAnalyzing(false);
		}
	};

	return (
		<div className="min-h-screen bg-gradient-hero">
			<div className="container mx-auto px-4 py-8">
				<div className="max-w-4xl mx-auto">
					{/* Header */}
					<div className="text-center mb-8 animate-fade-up">
						<div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
							<UploadIcon className="w-8 h-8 text-primary" />
						</div>
						<h1 className="text-4xl font-bold mb-4">
							Upload & Analyze Your Outfit
						</h1>
						<p className="text-xl text-muted-foreground max-w-2xl mx-auto">
							Get instant AI-powered fashion analysis with
							personalized style recommendations
						</p>
					</div>

					<div className="grid lg:grid-cols-2 gap-8">
						{/* Upload Section */}
						<div className="space-y-6">
							{error && (
								<Alert variant="destructive">
									<AlertCircle className="h-4 w-4" />
									<AlertDescription>{error}</AlertDescription>
								</Alert>
							)}

							<Card className="card-fashion">
								<CardHeader>
									<CardTitle className="flex items-center gap-2">
										<Sparkles className="w-5 h-5 text-primary" />
										Upload Your Photo
									</CardTitle>
								</CardHeader>
								<CardContent>
									<ImageUpload onAnalyze={handleAnalyze} />
								</CardContent>
							</Card>

							{/* Tips Card */}
							<Card className="card-fashion">
								<CardHeader>
									<CardTitle className="text-lg">
										Tips for Best Results
									</CardTitle>
								</CardHeader>
								<CardContent>
									<ul className="space-y-2 text-sm text-muted-foreground">
										<li className="flex items-start gap-2">
											<span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
											Use good lighting and clear image
											quality
										</li>
										<li className="flex items-start gap-2">
											<span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
											Show the complete outfit from head
											to toe
										</li>
										<li className="flex items-start gap-2">
											<span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
											Avoid cluttered backgrounds
										</li>
										<li className="flex items-start gap-2">
											<span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
											Include accessories for
											comprehensive analysis
										</li>
									</ul>
								</CardContent>
							</Card>
						</div>

						{/* Results Section */}
						<div className="space-y-6">
							{isAnalyzing && (
								<Card className="card-fashion">
									<CardContent className="flex items-center justify-center py-12">
										<div className="text-center space-y-4">
											<div className="w-16 h-16 bg-gradient-primary rounded-full mx-auto animate-float flex items-center justify-center">
												<Sparkles className="w-8 h-8 text-white" />
											</div>
											<div>
												<h3 className="text-lg font-semibold">
													Analyzing Your Style...
												</h3>
												<p className="text-muted-foreground">
													Our AI is evaluating your
													outfit
												</p>
											</div>
										</div>
									</CardContent>
								</Card>
							)}

							{analysisResult && !isAnalyzing && (
								<FashionAnalysisCard result={analysisResult} />
							)}

							{!analysisResult && !isAnalyzing && (
								<Card className="card-fashion border-dashed">
									<CardContent className="flex items-center justify-center py-12">
										<div className="text-center space-y-2">
											<div className="w-12 h-12 bg-muted rounded-full mx-auto flex items-center justify-center">
												<Sparkles className="w-6 h-6 text-muted-foreground" />
											</div>
											<h3 className="text-lg font-medium text-muted-foreground">
												Upload a photo to see analysis
												results
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
