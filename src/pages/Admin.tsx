import { useState } from "react"
import { Shield, Users, TrendingUp, MessageCircle, Filter, Download, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Navbar } from "@/components/navigation/navbar"

export default function Admin() {
  const adminStats = [
    { label: "Total Users", value: "52,431", change: "+12.5%", trend: "up" },
    { label: "Analyses Today", value: "1,247", change: "+8.2%", trend: "up" },
    { label: "Active Sessions", value: "892", change: "-2.1%", trend: "down" },
    { label: "System Health", value: "99.9%", change: "+0.1%", trend: "up" }
  ]

  const userInsights = [
    { metric: "Daily Active Users", value: 15420, target: 20000, percentage: 77 },
    { metric: "Monthly Retention", value: 8950, target: 10000, percentage: 89 },
    { metric: "Premium Subscribers", value: 3200, target: 5000, percentage: 64 },
    { metric: "API Usage", value: 145000, target: 200000, percentage: 72 }
  ]

  const fashionTrends = [
    {
      trend: "Minimalist Aesthetics",
      growth: "+45%",
      users: "12.5K",
      description: "Clean lines and neutral colors dominating user preferences"
    },
    {
      trend: "Sustainable Fashion",
      growth: "+32%",
      users: "8.3K",
      description: "Increased interest in eco-friendly and ethical brands"
    },
    {
      trend: "Y2K Revival",
      growth: "+28%",
      users: "6.7K",
      description: "Early 2000s fashion making a strong comeback"
    },
    {
      trend: "Gender-Neutral Styles",
      growth: "+25%",
      users: "5.9K",
      description: "Growing demand for unisex fashion recommendations"
    }
  ]

  const recentFeedback = [
    {
      id: 1,
      user: "Sarah M.",
      rating: 5,
      comment: "Love the AI recommendations! Very accurate style analysis.",
      date: "2024-01-15",
      category: "positive"
    },
    {
      id: 2,
      user: "Alex K.",
      rating: 4,
      comment: "Great app but could use more diverse style options.",
      date: "2024-01-14",
      category: "suggestion"
    },
    {
      id: 3,
      user: "Maria L.",
      rating: 5,
      comment: "The camera feature is amazing! Quick and convenient.",
      date: "2024-01-13",
      category: "positive"
    },
    {
      id: 4,
      user: "Jordan P.",
      rating: 3,
      comment: "Sometimes the color analysis seems off for darker skin tones.",
      date: "2024-01-12",
      category: "issue"
    }
  ]

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "positive": return "bg-success text-success-foreground"
      case "suggestion": return "bg-primary text-primary-foreground"
      case "issue": return "bg-warning text-warning-foreground"
      default: return "bg-secondary text-secondary-foreground"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-hero">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 animate-fade-up">
            <div>
              <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
                <Shield className="w-8 h-8 text-primary" />
                Admin Dashboard
              </h1>
              <p className="text-muted-foreground">Monitor platform performance and user insights</p>
            </div>
            <div className="flex items-center gap-4 mt-4 md:mt-0">
              <Button variant="outline" className="gap-2">
                <Calendar className="w-4 h-4" />
                This Month
              </Button>
              <Button variant="outline" className="gap-2">
                <Download className="w-4 h-4" />
                Export Report
              </Button>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {adminStats.map((stat, index) => (
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
                    <TrendingUp className={`w-8 h-8 ${stat.trend === "up" ? "text-success" : "text-warning"}`} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Tabs defaultValue="analytics" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="users">Users</TabsTrigger>
              <TabsTrigger value="trends">Trends</TabsTrigger>
              <TabsTrigger value="feedback">Feedback</TabsTrigger>
            </TabsList>

            <TabsContent value="analytics" className="space-y-6">
              <div className="grid lg:grid-cols-2 gap-6">
                {/* User Metrics */}
                <Card className="card-fashion">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="w-5 h-5 text-primary" />
                      User Metrics
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {userInsights.map((insight, index) => (
                        <div key={index} className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="font-medium">{insight.metric}</span>
                            <span className="text-muted-foreground">
                              {insight.value.toLocaleString()} / {insight.target.toLocaleString()}
                            </span>
                          </div>
                          <Progress value={insight.percentage} className="h-2" />
                          <div className="text-xs text-muted-foreground">
                            {insight.percentage}% of target
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* System Performance */}
                <Card className="card-fashion">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-primary" />
                      System Performance
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium">API Response Time</span>
                          <span className="text-success">125ms avg</span>
                        </div>
                        <Progress value={95} className="h-2" />
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium">Database Performance</span>
                          <span className="text-success">98.5%</span>
                        </div>
                        <Progress value={98} className="h-2" />
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium">AI Model Accuracy</span>
                          <span className="text-success">94.2%</span>
                        </div>
                        <Progress value={94} className="h-2" />
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium">Uptime</span>
                          <span className="text-success">99.9%</span>
                        </div>
                        <Progress value={99} className="h-2" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="users" className="space-y-6">
              <Card className="card-fashion">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-primary" />
                    User Management
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">User management interface coming soon</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="trends" className="space-y-6">
              <Card className="card-fashion">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    Fashion Trends & Insights
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    {fashionTrends.map((trend, index) => (
                      <div key={index} className="p-4 rounded-lg bg-muted/50 space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold">{trend.trend}</h4>
                          <Badge className="bg-success text-success-foreground">
                            {trend.growth}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{trend.description}</p>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Interested Users:</span>
                          <span className="font-medium">{trend.users}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="feedback" className="space-y-6">
              <Card className="card-fashion">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageCircle className="w-5 h-5 text-primary" />
                    User Feedback
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentFeedback.map((feedback) => (
                      <div key={feedback.id} className="p-4 rounded-lg bg-muted/50 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="font-medium">{feedback.user}</span>
                            <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                <span 
                                  key={i} 
                                  className={`text-sm ${i < feedback.rating ? "text-yellow-500" : "text-muted-foreground"}`}
                                >
                                  ★
                                </span>
                              ))}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={getCategoryColor(feedback.category)}>
                              {feedback.category}
                            </Badge>
                            <span className="text-xs text-muted-foreground">{feedback.date}</span>
                          </div>
                        </div>
                        <p className="text-sm">{feedback.comment}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}