import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, CheckCircle, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const CalendarConnect = () => {
  const [connectedServices, setConnectedServices] = useState<string[]>([]);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleConnect = (service: string) => {
    // TODO: Implement OAuth flow with Supabase edge function
    toast({
      title: "Coming Soon",
      description: `${service} integration will be available once backend is set up.`,
    });
    
    // Simulate connection for UI demo
    setConnectedServices(prev => [...prev, service]);
  };

  const isConnected = (service: string) => connectedServices.includes(service);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Connect Your Calendar
            </h1>
            <p className="text-muted-foreground">
              Sync your calendar to get outfit suggestions for your events
            </p>
          </div>

          <div className="space-y-6">
            {/* Google Calendar Card */}
            <Card className="border-border">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                      <Calendar className="w-6 h-6 text-red-600" />
                    </div>
                    <div>
                      <CardTitle className="text-foreground">Google Calendar</CardTitle>
                      <CardDescription>
                        Connect to sync your Google Calendar events
                      </CardDescription>
                    </div>
                  </div>
                  {isConnected("google") && (
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Connected
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    Access your events and get outfit recommendations
                  </div>
                  <Button
                    onClick={() => handleConnect("google")}
                    disabled={isConnected("google")}
                    className="flex items-center gap-2"
                  >
                    {isConnected("google") ? (
                      "Connected"
                    ) : (
                      <>
                        <ExternalLink className="w-4 h-4" />
                        Connect
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Microsoft Outlook Card */}
            <Card className="border-border">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Calendar className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-foreground">Microsoft Outlook</CardTitle>
                      <CardDescription>
                        Connect to sync your Outlook Calendar events
                      </CardDescription>
                    </div>
                  </div>
                  {isConnected("outlook") && (
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Connected
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    Access your Outlook events and get outfit recommendations
                  </div>
                  <Button
                    onClick={() => handleConnect("outlook")}
                    disabled={isConnected("outlook")}
                    className="flex items-center gap-2"
                  >
                    {isConnected("outlook") ? (
                      "Connected"
                    ) : (
                      <>
                        <ExternalLink className="w-4 h-4" />
                        Connect
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Continue Button */}
            <div className="text-center pt-6">
              <Button
                onClick={() => navigate("/calendar-view")}
                size="lg"
                disabled={connectedServices.length === 0}
                className="px-8"
              >
                Continue to Calendar View
              </Button>
              {connectedServices.length === 0 && (
                <p className="text-sm text-muted-foreground mt-2">
                  Connect at least one calendar service to continue
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarConnect;