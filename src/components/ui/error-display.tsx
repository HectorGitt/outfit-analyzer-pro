import { AlertCircle, ChevronDown, ChevronUp, Info } from "lucide-react";
import { useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface ErrorDisplayProps {
	error?: string | null;
	errorDetails?: {
		message: string;
		statusCode?: number;
		validationErrors?: Record<string, string[]>;
		timestamp?: string;
		details?: any;
	} | null;
	className?: string;
}

export function ErrorDisplay({
	error,
	errorDetails,
	className,
}: ErrorDisplayProps) {
	const [isExpanded, setIsExpanded] = useState(false);

	if (!error && !errorDetails) return null;

	const hasValidationErrors =
		errorDetails?.validationErrors &&
		Object.keys(errorDetails.validationErrors).length > 0;

	const hasAdditionalDetails =
		errorDetails?.statusCode ||
		errorDetails?.timestamp ||
		errorDetails?.details;

	return (
		<div className={`space-y-2 ${className}`}>
			{/* Main Error */}
			<Alert variant="destructive" className="animate-fade-up">
				<AlertCircle className="h-4 w-4" />
				<AlertDescription className="flex items-center justify-between">
					<span>{error || errorDetails?.message}</span>
					{(hasValidationErrors || hasAdditionalDetails) && (
						<Collapsible
							open={isExpanded}
							onOpenChange={setIsExpanded}
						>
							<CollapsibleTrigger asChild>
								<Button
									variant="ghost"
									size="sm"
									className="h-auto p-1 text-destructive-foreground hover:text-destructive-foreground/80"
								>
									{isExpanded ? (
										<ChevronUp className="h-4 w-4" />
									) : (
										<ChevronDown className="h-4 w-4" />
									)}
								</Button>
							</CollapsibleTrigger>
						</Collapsible>
					)}
				</AlertDescription>
			</Alert>

			{/* Expandable Details */}
			{(hasValidationErrors || hasAdditionalDetails) && (
				<Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
					<CollapsibleContent className="space-y-2">
						{/* Validation Errors */}
						{hasValidationErrors && (
							<Alert
								variant="destructive"
								className="border-destructive/30"
							>
								<Info className="h-4 w-4" />
								<AlertDescription>
									<div className="font-medium mb-2">
										Validation Errors:
									</div>
									<ul className="space-y-1">
										{Object.entries(
											errorDetails.validationErrors!
										).map(([field, errors]) => (
											<li key={field} className="text-sm">
												<span className="font-medium capitalize">
													{field}:
												</span>
												<ul className="ml-4 list-disc">
													{errors.map(
														(error, index) => (
															<li key={index}>
																{error}
															</li>
														)
													)}
												</ul>
											</li>
										))}
									</ul>
								</AlertDescription>
							</Alert>
						)}

						{/* Technical Details */}
						{hasAdditionalDetails && (
							<Alert
								variant="destructive"
								className="border-destructive/30"
							>
								<Info className="h-4 w-4" />
								<AlertDescription>
									<div className="font-medium mb-2">
										Technical Details:
									</div>
									<div className="text-sm space-y-1">
										{errorDetails?.statusCode && (
											<div>
												<span className="font-medium">
													Status Code:
												</span>{" "}
												{errorDetails.statusCode}
											</div>
										)}
										{errorDetails?.timestamp && (
											<div>
												<span className="font-medium">
													Time:
												</span>{" "}
												{new Date(
													errorDetails.timestamp
												).toLocaleString()}
											</div>
										)}
										{errorDetails?.details && (
											<div>
												<span className="font-medium">
													Details:
												</span>
												<pre className="mt-1 p-2 bg-muted rounded text-xs overflow-auto max-h-32">
													{JSON.stringify(
														errorDetails.details,
														null,
														2
													)}
												</pre>
											</div>
										)}
									</div>
								</AlertDescription>
							</Alert>
						)}
					</CollapsibleContent>
				</Collapsible>
			)}
		</div>
	);
}
