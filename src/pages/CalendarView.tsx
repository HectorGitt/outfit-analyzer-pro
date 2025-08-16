import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin, RefreshCw, Save, Shirt, CalendarDays } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { FullCalendarModal } from "@/components/ui/full-calendar-modal";

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  location?: string;
  type: "work" | "casual" | "formal" | "social";
  hasOutfit: boolean;
}

const CalendarView = () => {
  const { toast } = useToast();
  const [events] = useState<CalendarEvent[]>([
    {
      id: "1",
      title: "Team Meeting",
      date: "2024-01-15",
      time: "09:00 AM",
      location: "Conference Room A",
      type: "work",
      hasOutfit: false
    },
    {
      id: "2",
      title: "Lunch with Sarah",
      date: "2024-01-15",
      time: "12:30 PM",
      location: "Downtown Cafe",
      type: "casual",
      hasOutfit: true
    },
    {
      id: "3",
      title: "Client Presentation",
      date: "2024-01-16",
      time: "02:00 PM",
      location: "Client Office",
      type: "formal",
      hasOutfit: false
    },
    {
      id: "4",
      title: "Movie Night",
      date: "2024-01-16",
      time: "07:00 PM",
      location: "AMC Theater",
      type: "social",
      hasOutfit: false
    }
  ]);

  const handlePopulateOutfit = (eventId: string, eventTitle: string) => {
    // TODO: Implement AI outfit generation based on event type
    toast({
      title: "Generating Outfit",
      description: `Creating outfit suggestion for "${eventTitle}"...`,
    });
  };

  const handleSaveOutfit = (eventId: string, eventTitle: string) => {
    // TODO: Implement outfit saving to user's wardrobe
    toast({
      title: "Outfit Saved",
      description: `Outfit for "${eventTitle}" saved to your wardrobe.`,
    });
  };

  const handleRetryOutfit = (eventId: string, eventTitle: string) => {
    // TODO: Implement outfit regeneration
    toast({
      title: "Regenerating Outfit",
      description: `Creating new outfit suggestion for "${eventTitle}"...`,
    });
  };

  const getEventTypeColor = (type: string) => {
    const colors = {
      work: "bg-blue-100 text-blue-800",
      casual: "bg-green-100 text-green-800", 
      formal: "bg-purple-100 text-purple-800",
      social: "bg-orange-100 text-orange-800"
    };
    return colors[type as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { 
      weekday: "short", 
      month: "short", 
      day: "numeric" 
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Your Calendar & Outfits
            </h1>
            <p className="text-muted-foreground">
              Manage your events and get AI-powered outfit suggestions
            </p>
          </div>

          <div className="flex justify-center mb-6">
            <FullCalendarModal
              events={events}
              onPopulateOutfit={handlePopulateOutfit}
              onSaveOutfit={handleSaveOutfit}
              onRetryOutfit={handleRetryOutfit}
            >
              <Button variant="outline" className="flex items-center gap-2">
                <CalendarDays className="w-4 h-4" />
                Open Calendar View
              </Button>
            </FullCalendarModal>
          </div>

          <div className="space-y-4">
            {events.map((event) => (
              <Card key={event.id} className="border-border">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mt-1">
                        <Calendar className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-foreground mb-1">
                          {event.title}
                        </CardTitle>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDate(event.date)}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {event.time}
                          </div>
                          {event.location && (
                            <div className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {event.location}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getEventTypeColor(event.type)}>
                        {event.type}
                      </Badge>
                      {event.hasOutfit && (
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          <Shirt className="w-3 h-3 mr-1" />
                          Outfit Ready
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3">
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => handlePopulateOutfit(event.id, event.title)}
                      className="flex items-center gap-2"
                    >
                      <Shirt className="w-4 h-4" />
                      {event.hasOutfit ? "View Outfit" : "Generate Outfit"}
                    </Button>
                    
                    {event.hasOutfit && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSaveOutfit(event.id, event.title)}
                          className="flex items-center gap-2"
                        >
                          <Save className="w-4 h-4" />
                          Save Outfit
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRetryOutfit(event.id, event.title)}
                          className="flex items-center gap-2"
                        >
                          <RefreshCw className="w-4 h-4" />
                          Retry Outfit
                        </Button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {events.length === 0 && (
            <Card className="border-border">
              <CardContent className="text-center py-12">
                <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <CardTitle className="text-foreground mb-2">No Events Found</CardTitle>
                <CardDescription>
                  Connect your calendar or add events to get outfit suggestions
                </CardDescription>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default CalendarView;