import { useState } from "react"
import { User, Palette, Heart, ShoppingBag, Save, Camera } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StyleChip } from "@/components/ui/style-chip"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Navbar } from "@/components/navigation/navbar"
import { Badge } from "@/components/ui/badge"

export default function Profile() {
  const [selectedStyles, setSelectedStyles] = useState<string[]>(["casual", "minimalist"])
  const [selectedColors, setSelectedColors] = useState<string[]>(["#000000", "#FFFFFF", "#4F46E5"])
  const [selectedOccasions, setSelectedOccasions] = useState<string[]>(["work", "casual"])

  const styleOptions = [
    "Casual", "Formal", "Minimalist", "Bohemian", "Classic", "Trendy", 
    "Vintage", "Sporty", "Elegant", "Edgy", "Romantic", "Preppy"
  ]

  const colorOptions = [
    "#000000", "#FFFFFF", "#FF0000", "#00FF00", "#0000FF", "#FFFF00",
    "#FF00FF", "#00FFFF", "#FFA500", "#800080", "#FFC0CB", "#A52A2A",
    "#808080", "#000080", "#008000", "#800000", "#4F46E5", "#7C3AED"
  ]

  const occasionOptions = [
    "Work", "Casual", "Formal Events", "Date Night", "Travel", "Sports",
    "Party", "Wedding", "Business", "Weekend", "Vacation", "Shopping"
  ]

  const bodyTypes = [
    "Apple", "Pear", "Hourglass", "Rectangle", "Inverted Triangle", "Prefer not to say"
  ]

  const budgetRanges = [
    "Under $50", "$50 - $100", "$100 - $200", "$200 - $500", "$500+", "No budget limit"
  ]

  const toggleStyle = (style: string) => {
    setSelectedStyles(prev => 
      prev.includes(style.toLowerCase()) 
        ? prev.filter(s => s !== style.toLowerCase())
        : [...prev, style.toLowerCase()]
    )
  }

  const toggleColor = (color: string) => {
    setSelectedColors(prev => 
      prev.includes(color) 
        ? prev.filter(c => c !== color)
        : [...prev, color]
    )
  }

  const toggleOccasion = (occasion: string) => {
    setSelectedOccasions(prev => 
      prev.includes(occasion.toLowerCase()) 
        ? prev.filter(o => o !== occasion.toLowerCase())
        : [...prev, occasion.toLowerCase()]
    )
  }

  const handleSave = () => {
    // Save preferences logic
    console.log({
      styles: selectedStyles,
      colors: selectedColors,
      occasions: selectedOccasions
    })
  }

  return (
    <div className="min-h-screen bg-gradient-hero">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8 animate-fade-up">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
              <User className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-4xl font-bold mb-4">
              Your Style Profile
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Customize your preferences to get personalized fashion recommendations
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Profile Picture & Basic Info */}
            <div className="lg:col-span-1">
              <Card className="card-fashion">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Camera className="w-5 h-5 text-primary" />
                    Profile Photo
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center space-y-4">
                  <div className="w-32 h-32 bg-gradient-primary rounded-full mx-auto flex items-center justify-center text-white text-3xl font-bold">
                    JD
                  </div>
                  <Button variant="outline" className="w-full">
                    Upload Photo
                  </Button>
                  <div className="space-y-4 pt-4">
                    <div>
                      <Label htmlFor="name">Display Name</Label>
                      <Input id="name" defaultValue="Jane Doe" className="input-fashion" />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" defaultValue="jane@example.com" className="input-fashion" disabled />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Preferences */}
            <div className="lg:col-span-2 space-y-8">
              {/* Style Preferences */}
              <Card className="card-fashion">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="w-5 h-5 text-primary" />
                    Style Preferences
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-base font-medium mb-3 block">
                      What styles do you love? 
                      <Badge variant="secondary" className="ml-2">{selectedStyles.length} selected</Badge>
                    </Label>
                    <div className="flex flex-wrap gap-2">
                      {styleOptions.map((style) => (
                        <StyleChip
                          key={style}
                          label={style}
                          selected={selectedStyles.includes(style.toLowerCase())}
                          onClick={() => toggleStyle(style)}
                        />
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Color Preferences */}
              <Card className="card-fashion">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Palette className="w-5 h-5 text-primary" />
                    Color Palette
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-base font-medium mb-3 block">
                      Your favorite colors 
                      <Badge variant="secondary" className="ml-2">{selectedColors.length} selected</Badge>
                    </Label>
                    <div className="grid grid-cols-9 gap-3">
                      {colorOptions.map((color) => (
                        <StyleChip
                          key={color}
                          label=""
                          variant="color"
                          color={color}
                          selected={selectedColors.includes(color)}
                          onClick={() => toggleColor(color)}
                        />
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Occasion Preferences */}
              <Card className="card-fashion">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShoppingBag className="w-5 h-5 text-primary" />
                    Occasion Types
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-base font-medium mb-3 block">
                      What occasions do you dress for?
                      <Badge variant="secondary" className="ml-2">{selectedOccasions.length} selected</Badge>
                    </Label>
                    <div className="flex flex-wrap gap-2">
                      {occasionOptions.map((occasion) => (
                        <StyleChip
                          key={occasion}
                          label={occasion}
                          selected={selectedOccasions.includes(occasion.toLowerCase())}
                          onClick={() => toggleOccasion(occasion)}
                        />
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Additional Preferences */}
              <Card className="card-fashion">
                <CardHeader>
                  <CardTitle>Additional Preferences</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="bodyType">Body Type</Label>
                      <Select>
                        <SelectTrigger className="input-fashion">
                          <SelectValue placeholder="Select body type" />
                        </SelectTrigger>
                        <SelectContent>
                          {bodyTypes.map((type) => (
                            <SelectItem key={type} value={type.toLowerCase()}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="budget">Budget Range</Label>
                      <Select>
                        <SelectTrigger className="input-fashion">
                          <SelectValue placeholder="Select budget range" />
                        </SelectTrigger>
                        <SelectContent>
                          {budgetRanges.map((range) => (
                            <SelectItem key={range} value={range.toLowerCase()}>
                              {range}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="notes">Style Notes</Label>
                    <Textarea 
                      id="notes"
                      placeholder="Tell us more about your style preferences, favorite brands, or specific requirements..."
                      className="input-fashion min-h-[100px]"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Save Button */}
              <div className="flex justify-end">
                <Button onClick={handleSave} className="btn-gradient">
                  <Save className="w-4 h-4 mr-2" />
                  Save Preferences
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}