import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Sparkles, Heart, Palette, Star } from "lucide-react"

interface AnalysisResult {
  overall_score: number
  color_harmony: number
  style_coherence: number
  suggestions: string[]
  improvements: string[]
  analysis_text: string
}

interface AnalysisCardProps {
  result: AnalysisResult
  className?: string
}

export function AnalysisCard({ result, className }: AnalysisCardProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-success"
    if (score >= 60) return "text-warning"
    return "text-destructive"
  }

  const getScoreIcon = (score: number) => {
    if (score >= 80) return <Star className="w-5 h-5 text-success" />
    if (score >= 60) return <Heart className="w-5 h-5 text-warning" />
    return <Sparkles className="w-5 h-5 text-destructive" />
  }

  return (
    <Card className={`card-fashion ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="w-6 h-6 text-primary" />
          Fashion Analysis Results
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Score */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Overall Style Score</span>
            <div className="flex items-center gap-2">
              {getScoreIcon(result.overall_score)}
              <span className={`text-lg font-bold ${getScoreColor(result.overall_score)}`}>
                {result.overall_score}/100
              </span>
            </div>
          </div>
          <Progress value={result.overall_score} className="h-3" />
        </div>

        {/* Detailed Scores */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <span className="text-sm text-muted-foreground">Color Harmony</span>
            <div className="flex items-center gap-2">
              <Progress value={result.color_harmony} className="h-2 flex-1" />
              <span className={`text-sm font-medium ${getScoreColor(result.color_harmony)}`}>
                {result.color_harmony}%
              </span>
            </div>
          </div>
          <div className="space-y-2">
            <span className="text-sm text-muted-foreground">Style Coherence</span>
            <div className="flex items-center gap-2">
              <Progress value={result.style_coherence} className="h-2 flex-1" />
              <span className={`text-sm font-medium ${getScoreColor(result.style_coherence)}`}>
                {result.style_coherence}%
              </span>
            </div>
          </div>
        </div>

        {/* Analysis Text */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Analysis</h4>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {result.analysis_text}
          </p>
        </div>

        {/* Suggestions */}
        {result.suggestions.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              Suggestions
            </h4>
            <div className="flex flex-wrap gap-2">
              {result.suggestions.map((suggestion, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {suggestion}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Improvements */}
        {result.improvements.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <Heart className="w-4 h-4 text-accent" />
              Improvements
            </h4>
            <div className="flex flex-wrap gap-2">
              {result.improvements.map((improvement, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {improvement}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}