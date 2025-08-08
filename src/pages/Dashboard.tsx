import { useState } from "react"
import { BarChart3, TrendingUp, Calendar, Star, Filter, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Navbar } from "@/components/navigation/navbar"

export default function Dashboard() {
  const [timeRange, setTimeRange] = useState("30d")

  const stats = [
    { label: "Analyses This Month", value: "47", change: "+12%", trend: "up" },
    { label: "Average Style Score", value: "85", change: "+5%", trend: "up" },
    { label: "Wardrobe Items", value: "156", change: "+8%", trend: "up" },
    { label: "Style Achievements", value: "12", change: "+3", trend: "up" }
  ]

  const recentAnalyses = [
    {
      id: 1,
      date: "2024-01-15",
      image: "/api/placeholder/150/200",
      score: 88,
      title: "Business Casual Look",
      suggestions: ["Add statement jewelry", "Try a belt"]
    },
    {
      id: 2,
      date: "2024-01-14",
      image: "/api/placeholder/150/200",
      score: 92,
      title: "Weekend Casual",
      suggestions: ["Perfect color harmony", "Great fit"]
    },
    {
      id: 3,
      date: "2024-01-13",
      image: "/api/placeholder/150/200",
      score: 76,
      title: "Evening Outfit",
      suggestions: ["Consider different shoes", "Add layering"]
    }
  ]

  const wardrobeRecommendations = [
    {
      category: "Blazers",
      items: 3,
      recommendation: "Add navy blazer for versatility",
      priority: "high"
    },
    {
      category: "Accessories",
      items: 8,
      recommendation: "Statement necklaces to elevate looks",
      priority: "medium"
    },
    {
      category: "Shoes",
      items: 12,
      recommendation: "Nude heels for formal occasions",
      priority: "low"
    }
  ]

  const styleInsights = [
    { style: "Minimalist", percentage: 45, color: "hsl(213, 94%, 68%)" },
    { style: "Casual", percentage: 30, color: "hsl(262, 83%, 58%)" },
    { style: "Business", percentage: 20, color: "hsl(142, 76%, 36%)" },
    { style: "Formal", percentage: 5, color: "hsl(38, 92%, 50%)" }
  ]

  return (
    <div className="min-h-screen bg-gradient-hero">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 animate-fade-up">
            <div>
              <h1 className="text-4xl font-bold mb-2">Your Style Dashboard</h1>
              <p className="text-muted-foreground">Track your fashion journey and discoveries</p>
            </div>
            <div className="flex items-center gap-4 mt-4 md:mt-0">
              <Button variant="outline" className="gap-2">
                <Filter className="w-4 h-4" />
                Filter
              </Button>
              <Button variant="outline" className="gap-2">
                <Download className="w-4 h-4" />
                Export
              </Button>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
              <Card key={index} className="card-fashion">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold">{stat.value}</span>
                        <Badge 
                          variant={stat.trend === "up" ? "default" : "secondary"}
                          className="text-xs"
                        >
                          {stat.change}
                        </Badge>
                      </div>
                    </div>
                    <TrendingUp className="w-8 h-8 text-primary" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
              <TabsTrigger value="wardrobe">Wardrobe</TabsTrigger>
              <TabsTrigger value="insights">Insights</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid lg:grid-cols-2 gap-6">
                {/* Recent Analyses */}
                <Card className="card-fashion">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-primary" />
                      Recent Analyses
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {recentAnalyses.map((analysis) => (
                        <div key={analysis.id} className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
                          <div className="w-16 h-20 bg-muted rounded-lg flex items-center justify-center">
                            <span className="text-xs text-muted-foreground">IMG</span>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <h4 className="font-medium">{analysis.title}</h4>
                              <Badge variant="outline">{analysis.score}/100</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">{analysis.date}</p>
                            <div className="flex flex-wrap gap-1">
                              {analysis.suggestions.slice(0, 2).map((suggestion, idx) => (
                                <span key={idx} className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                                  {suggestion}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Style Breakdown */}
                <Card className="card-fashion">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Star className="w-5 h-5 text-primary" />
                      Style Breakdown
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {styleInsights.map((style, index) => (
                        <div key={index} className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="font-medium">{style.style}</span>
                            <span className="text-muted-foreground">{style.percentage}%</span>
                          </div>
                          <Progress value={style.percentage} className="h-2" />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="history" className="space-y-6">
              <Card className="card-fashion">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-primary" />
                    Analysis History
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {recentAnalyses.concat(recentAnalyses).map((analysis, index) => (
                      <div key={index} className="bg-muted/50 rounded-lg p-4 space-y-3">
                        <div className="aspect-[3/4] bg-muted rounded-lg flex items-center justify-center">
                          <span className="text-muted-foreground">IMG</span>
                        </div>
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium">{analysis.title}</h4>
                            <Badge variant="outline">{analysis.score}/100</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{analysis.date}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="wardrobe" className="space-y-6">
              <Card className="card-fashion">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-primary" />
                    Wardrobe Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {wardrobeRecommendations.map((rec, index) => (
                      <div key={index} className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                        <div>
                          <h4 className="font-medium">{rec.category}</h4>
                          <p className="text-sm text-muted-foreground">{rec.items} items currently</p>
                          <p className="text-sm mt-1">{rec.recommendation}</p>
                        </div>
                        <Badge 
                          variant={
                            rec.priority === "high" ? "destructive" : 
                            rec.priority === "medium" ? "default" : "secondary"
                          }
                        >
                          {rec.priority} priority
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="insights" className="space-y-6">
              <div className="grid lg:grid-cols-2 gap-6">
                <Card className="card-fashion">
                  <CardHeader>
                    <CardTitle>Style Evolution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <TrendingUp className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">Style evolution chart coming soon</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="card-fashion">
                  <CardHeader>
                    <CardTitle>Color Analysis</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <BarChart3 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">Color analysis coming soon</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}