import { cn } from "@/lib/utils"
import { Check } from "lucide-react"

interface StyleChipProps {
  label: string
  selected?: boolean
  onClick?: () => void
  variant?: "default" | "color"
  color?: string
  className?: string
}

export function StyleChip({ 
  label, 
  selected = false, 
  onClick, 
  variant = "default",
  color,
  className 
}: StyleChipProps) {
  if (variant === "color" && color) {
    return (
      <button
        onClick={onClick}
        className={cn(
          "relative inline-flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-200",
          selected 
            ? "border-primary shadow-lg scale-110" 
            : "border-border hover:border-primary/50 hover:scale-105",
          className
        )}
        style={{ backgroundColor: color }}
      >
        {selected && (
          <Check className="w-6 h-6 text-white drop-shadow-sm" />
        )}
      </button>
    )
  }

  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex items-center px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
        selected
          ? "bg-primary text-primary-foreground shadow-md"
          : "bg-secondary text-secondary-foreground hover:bg-primary/10 hover:text-primary border border-border",
        className
      )}
    >
      {label}
      {selected && <Check className="ml-2 w-4 h-4" />}
    </button>
  )
}