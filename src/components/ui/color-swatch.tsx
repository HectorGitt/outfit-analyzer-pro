import React from "react";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface ColorSwatchProps {
	color: string;
	name?: string;
	selected?: boolean;
	onClick?: () => void;
	size?: "sm" | "md" | "lg";
	className?: string;
	disabled?: boolean;
}

export const ColorSwatch: React.FC<ColorSwatchProps> = ({
	color,
	name,
	selected = false,
	onClick,
	size = "md",
	className,
	disabled = false,
}) => {
	const sizeClasses = {
		sm: "w-8 h-8",
		md: "w-12 h-12",
		lg: "w-16 h-16",
	};

	const checkSizeClasses = {
		sm: "w-3 h-3",
		md: "w-4 h-4",
		lg: "w-6 h-6",
	};

	return (
		<div className={cn("flex flex-col items-center gap-2", className)}>
			<button
				onClick={disabled ? undefined : onClick}
				disabled={disabled}
				className={cn(
					"relative rounded-full border-2 transition-all duration-200 shadow-sm",
					sizeClasses[size],
					selected
						? "border-primary shadow-lg scale-110 ring-2 ring-primary/20"
						: "border-border hover:border-primary/50 hover:scale-105",
					disabled && "opacity-50 cursor-not-allowed",
					!disabled && "cursor-pointer"
				)}
				style={{ backgroundColor: color }}
				title={name || color}
			>
				{selected && (
					<div className="absolute inset-0 flex items-center justify-center">
						<Check
							className={cn(
								"text-white drop-shadow-md",
								checkSizeClasses[size]
							)}
						/>
					</div>
				)}
			</button>
			{name && (
				<span className="text-xs text-muted-foreground text-center max-w-[60px] truncate">
					{name}
				</span>
			)}
		</div>
	);
};
