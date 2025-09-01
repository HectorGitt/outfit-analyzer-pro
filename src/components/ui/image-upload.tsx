import { useState, useCallback } from "react";
import { Upload, X, Image as ImageIcon, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImageUploadProps {
	onUpload?: (files: File[]) => void;
	onAnalyze?: (file: File) => Promise<void>;
	maxSize?: number;
	maxFiles?: number;
	accept?: string;
	multiple?: boolean;
	className?: string;
}

export function ImageUpload({
	onUpload,
	onAnalyze,
	maxSize = 10 * 1024 * 1024, // 10MB
	maxFiles = 1,
	accept = "image/*",
	multiple = false,
	className,
}: ImageUploadProps) {
	const [dragActive, setDragActive] = useState(false);
	const [files, setFiles] = useState<File[]>([]);
	const [previews, setPreviews] = useState<string[]>([]);
	const [analyzing, setAnalyzing] = useState(false);

	const validateAndProcessFiles = useCallback(
		(selectedFiles: File[]) => {
			const validFiles = selectedFiles.filter((file) => {
				if (file.size > maxSize) {
					alert(
						`File "${file.name}" is too large. Maximum size is ${
							maxSize / 1024 / 1024
						}MB`
					);
					return false;
				}
				return true;
			});

			if (files.length + validFiles.length > maxFiles) {
				alert(`You can only upload up to ${maxFiles} files at once`);
				return;
			}

			// Create previews for valid files
			validFiles.forEach((file) => {
				const reader = new FileReader();
				reader.onload = (e) => {
					const preview = e.target?.result as string;
					setPreviews((prev) => [...prev, preview]);
				};
				reader.readAsDataURL(file);
			});

			const newFiles = [...files, ...validFiles];
			setFiles(newFiles);
			onUpload?.(validFiles);
		},
		[maxSize, maxFiles, files, onUpload]
	);

	const handleDrag = useCallback((e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		if (e.type === "dragenter" || e.type === "dragover") {
			setDragActive(true);
		} else if (e.type === "dragleave") {
			setDragActive(false);
		}
	}, []);

	const handleDrop = useCallback(
		(e: React.DragEvent) => {
			e.preventDefault();
			e.stopPropagation();
			setDragActive(false);

			if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
				const droppedFiles = Array.from(e.dataTransfer.files).filter(
					(file) => file.type.startsWith("image/")
				);
				if (droppedFiles.length > 0) {
					validateAndProcessFiles(droppedFiles);
				}
			}
		},
		[validateAndProcessFiles]
	);

	const handleInputChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			if (e.target.files && e.target.files.length > 0) {
				const selectedFiles = Array.from(e.target.files);
				validateAndProcessFiles(selectedFiles);
			}
		},
		[validateAndProcessFiles]
	);

	const removeFile = (index: number) => {
		setFiles((prev) => prev.filter((_, i) => i !== index));
		setPreviews((prev) => prev.filter((_, i) => i !== index));
	};

	const analyzeAllFiles = async () => {
		if (!files.length || !onAnalyze) return;

		setAnalyzing(true);
		try {
			for (const file of files) {
				await onAnalyze(file);
			}
		} catch (error) {
			console.error("Analysis failed:", error);
		} finally {
			setAnalyzing(false);
		}
	};

	const clearAll = () => {
		setFiles([]);
		setPreviews([]);
	};

	return (
		<div className={cn("w-full", className)}>
			{files.length === 0 ? (
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
						multiple={multiple}
						onChange={handleInputChange}
						className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
					/>

					<div className="space-y-4">
						<div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
							<Upload className="w-8 h-8 text-primary" />
						</div>

						<div className="space-y-2">
							<h3 className="text-lg font-semibold">
								{multiple
									? "Upload Your Outfit Photos"
									: "Upload Your Outfit Photo"}
							</h3>
							<p className="text-muted-foreground">
								Drag and drop your{" "}
								{multiple ? "images" : "image"} here, or click
								to select
							</p>
							<p className="text-sm text-muted-foreground">
								Supports: JPG, PNG, WebP (max{" "}
								{maxSize / 1024 / 1024}MB each)
								{multiple && ` • Up to ${maxFiles} files`}
							</p>
						</div>

						<button className="btn-primary">
							Choose {multiple ? "Files" : "File"}
						</button>
					</div>
				</div>
			) : (
				<div className="space-y-4">
					{/* File Previews Grid */}
					<div className="grid grid-cols-2 md:grid-cols-3 gap-4">
						{files.map((file, index) => (
							<div key={index} className="relative group">
								<img
									src={previews[index]}
									alt={`Upload preview ${index + 1}`}
									className="w-full h-32 object-cover rounded-lg shadow-md"
								/>
								<button
									onClick={() => removeFile(index)}
									className="absolute top-2 right-2 bg-destructive text-destructive-foreground rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:scale-110"
								>
									<X className="w-4 h-4" />
								</button>
								<div className="absolute bottom-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
									{file.name.length > 15
										? `${file.name.substring(0, 15)}...`
										: file.name}
								</div>
							</div>
						))}
					</div>

					{/* Action Buttons */}
					<div className="flex flex-col sm:flex-row gap-3">
						{onAnalyze && (
							<button
								onClick={analyzeAllFiles}
								disabled={analyzing}
								className="flex-1 btn-gradient disabled:opacity-50 disabled:cursor-not-allowed"
							>
								{analyzing ? (
									<>
										<Loader2 className="w-5 h-5 mr-2 animate-spin" />
										Analyzing {files.length}{" "}
										{files.length === 1
											? "Image"
											: "Images"}
										...
									</>
								) : (
									<>
										<ImageIcon className="w-5 h-5 mr-2" />
										Analyze {files.length}{" "}
										{files.length === 1
											? "Image"
											: "Images"}
									</>
								)}
							</button>
						)}

						<button
							onClick={clearAll}
							className="px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors"
						>
							Clear All
						</button>

						<div
							className={cn(
								"relative border-2 border-dashed rounded-lg p-4 text-center transition-all duration-200 cursor-pointer",
								dragActive
									? "border-primary bg-primary/5"
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
								multiple={multiple}
								onChange={handleInputChange}
								className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
							/>
							<div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
								<Upload className="w-4 h-4" />
								Add More
							</div>
						</div>
					</div>

					<div className="text-sm text-muted-foreground text-center">
						{files.length} of {maxFiles} files uploaded
					</div>
				</div>
			)}
		</div>
	);
}
