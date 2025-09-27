import React from "react";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
	BarChart3,
	Palette,
	Star,
	TrendingUp,
	Calendar,
	X,
} from "lucide-react";
import { FashionAnalysis } from "@/types";

interface AnalysisModalProps {
	analysis: FashionAnalysis | null;
	isOpen: boolean;
	onClose: () => void;
}

export const AnalysisModal: React.FC<AnalysisModalProps> = ({
	analysis,
	isOpen,
	onClose,
}) => {
	if (!analysis) return null;

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-3">
						<div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
							{analysis.image_url ? (
								<img
									src={analysis.image_url}
									alt="Analysis"
									className="w-full h-full object-cover rounded-lg"
								/>
							) : (
								<BarChart3 className="w-6 h-6 text-muted-foreground" />
							)}
						</div>
						<div>
							<h2 className="text-2xl font-bold">
								Style Analysis Details
							</h2>
						</div>
					</DialogTitle>
					<DialogDescription>
						Detailed breakdown of your outfit analysis
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-6">
					{/* Image Section */}
					{analysis.image_url && (
						<div className="flex justify-center">
							<div className="w-full max-w-md aspect-square bg-muted rounded-lg overflow-hidden">
								<img
									src={analysis.image_url}
									alt="Analyzed outfit"
									className="w-full h-full object-cover"
								/>
							</div>
						</div>
					)}

					{/* Scores Overview */}
					<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
						<div className="bg-muted/50 rounded-lg p-4 text-center">
							<div className="flex items-center justify-center mb-2">
								<Star className="w-5 h-5 text-yellow-500 mr-2" />
								<span className="text-sm font-medium">
									Overall Score
								</span>
							</div>
							<div className="text-3xl font-bold text-primary">
								{analysis.overall_score}/100
							</div>
						</div>
						<div className="bg-muted/50 rounded-lg p-4 text-center">
							<div className="flex items-center justify-center mb-2">
								<Palette className="w-5 h-5 text-blue-500 mr-2" />
								<span className="text-sm font-medium">
									Color Harmony
								</span>
							</div>
							<div className="text-3xl font-bold text-blue-600">
								{analysis.color_harmony}/100
							</div>
						</div>
						<div className="bg-muted/50 rounded-lg p-4 text-center">
							<div className="flex items-center justify-center mb-2">
								<TrendingUp className="w-5 h-5 text-green-500 mr-2" />
								<span className="text-sm font-medium">
									Style Coherence
								</span>
							</div>
							<div className="text-3xl font-bold text-green-600">
								{analysis.style_coherence}/100
							</div>
						</div>
					</div>

					{/* Analysis Text */}
					{analysis.analysis_text && (
						<div className="space-y-3">
							<h3 className="text-lg font-semibold flex items-center gap-2">
								<BarChart3 className="w-5 h-5 text-primary" />
								Analysis Summary
							</h3>
							<div className="bg-muted/30 rounded-lg p-4">
								<p className="text-sm leading-relaxed">
									{analysis.analysis_text}
								</p>
							</div>
						</div>
					)}

					{/* Suggestions */}
					{analysis.suggestions &&
						analysis.suggestions.length > 0 && (
							<div className="space-y-3">
								<h3 className="text-lg font-semibold flex items-center gap-2">
									<Star className="w-5 h-5 text-primary" />
									Suggestions
								</h3>
								<div className="grid gap-2">
									{analysis.suggestions.map(
										(suggestion, index) => (
											<div
												key={index}
												className="flex items-start gap-3 bg-primary/5 rounded-lg p-3"
											>
												<div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
													<span className="text-xs font-medium text-primary">
														{index + 1}
													</span>
												</div>
												<p className="text-sm">
													{suggestion}
												</p>
											</div>
										)
									)}
								</div>
							</div>
						)}

					{/* Improvements */}
					{analysis.improvements &&
						analysis.improvements.length > 0 && (
							<div className="space-y-3">
								<h3 className="text-lg font-semibold flex items-center gap-2">
									<TrendingUp className="w-5 h-5 text-primary" />
									Areas for Improvement
								</h3>
								<div className="grid gap-2">
									{analysis.improvements.map(
										(improvement, index) => (
											<div
												key={index}
												className="flex items-start gap-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg p-3"
											>
												<div className="w-6 h-6 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
													<span className="text-xs font-medium text-orange-700 dark:text-orange-300">
														{index + 1}
													</span>
												</div>
												<p className="text-sm text-orange-800 dark:text-orange-200">
													{improvement}
												</p>
											</div>
										)
									)}
								</div>
							</div>
						)}

					{/* Metadata */}
					<div className="flex items-center justify-between pt-4 border-t text-sm text-muted-foreground">
						<div className="flex items-center gap-2">
							<Calendar className="w-4 h-4" />
							<span>
								Analyzed on{" "}
								{new Date(
									analysis.created_at
								).toLocaleDateString("en-US", {
									year: "numeric",
									month: "long",
									day: "numeric",
									hour: "2-digit",
									minute: "2-digit",
								})}
							</span>
						</div>
					</div>

					{/* Close Button */}
					<div className="flex justify-end pt-4 border-t">
						<Button onClick={onClose} variant="outline">
							<X className="w-4 h-4 mr-2" />
							Close
						</Button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
};
