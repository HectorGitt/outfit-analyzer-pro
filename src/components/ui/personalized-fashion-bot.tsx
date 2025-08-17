import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bot, Sparkles, Palette, Calendar, TrendingUp, ArrowRight } from 'lucide-react';
import { userAPI } from '@/services/api';
import { useAuthStore } from '@/stores/authStore';
import { Link } from 'react-router-dom';

const PersonalizedFashionBot = () => {
  const { isAuthenticated, user } = useAuthStore();

  // Fetch user preferences
  const { data: preferences, isLoading } = useQuery({
    queryKey: ['userPreferences', user?.id],
    queryFn: userAPI.getPreferences,
    enabled: isAuthenticated,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  const getPersonalizedTips = () => {
    if (!preferences?.data) return [];

    const { style_preference, color_preferences, occasion_types } = preferences.data;
    const tips = [];

    // Style-based tips
    if (style_preference?.includes('casual')) {
      tips.push("Mix textures in casual wear - try denim with knits or cotton with leather accents");
    }
    if (style_preference?.includes('formal')) {
      tips.push("Invest in quality tailoring - it makes all the difference in formal wear");
    }
    if (style_preference?.includes('bohemian')) {
      tips.push("Layer different patterns and textures for that perfect boho-chic look");
    }

    // Color-based tips
    if (color_preferences?.includes('neutral')) {
      tips.push("Add a pop of color with accessories to elevate your neutral palette");
    }
    if (color_preferences?.includes('bold')) {
      tips.push("Balance bold colors with neutral pieces to avoid overwhelming your look");
    }

    // Occasion-based tips
    if (occasion_types?.includes('work')) {
      tips.push("Build a capsule work wardrobe with mix-and-match pieces in coordinated colors");
    }
    if (occasion_types?.includes('social')) {
      tips.push("Statement accessories can transform basic outfits for social events");
    }

    return tips.slice(0, 3); // Return max 3 tips
  };

  const getPersonalizedActions = () => {
    if (!preferences?.data) return [];

    const actions = [
      {
        icon: <Calendar className="w-4 h-4" />,
        label: "Plan Weekly Outfits",
        description: "Based on your calendar",
        href: "/calendar-view"
      },
      {
        icon: <Palette className="w-4 h-4" />,
        label: "Color Palette Analysis",
        description: "Discover your best colors",
        href: "/upload"
      },
      {
        icon: <TrendingUp className="w-4 h-4" />,
        label: "Trend Insights",
        description: "Curated for your style",
        href: "/dashboard"
      }
    ];

    return actions;
  };

  if (!isAuthenticated) {
    return (
      <Card className="card-fashion">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Personal Fashion Assistant</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Sign in to get personalized fashion recommendations tailored to your style preferences.
          </p>
          <Button className="btn-gradient" asChild>
            <Link to="/login">
              Get Started
              <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className="card-fashion">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-primary animate-pulse" />
            <CardTitle className="text-lg">Personal Fashion Assistant</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="h-4 bg-muted rounded animate-pulse" />
            <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
            <div className="h-4 bg-muted rounded animate-pulse w-1/2" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const personalizedTips = getPersonalizedTips();
  const personalizedActions = getPersonalizedActions();

  return (
    <Card className="card-fashion">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg">Personal Fashion Assistant</CardTitle>
        </div>
        {preferences?.data && (
          <div className="flex flex-wrap gap-2 mt-2">
            {preferences.data.style_preference?.slice(0, 3).map((style, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {style}
              </Badge>
            ))}
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Personalized Tips */}
        {personalizedTips.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="h-4 w-4 text-accent" />
              <h4 className="font-semibold text-sm">Tips for You</h4>
            </div>
            <div className="space-y-2">
              {personalizedTips.map((tip, index) => (
                <p key={index} className="text-sm text-muted-foreground leading-relaxed">
                  • {tip}
                </p>
              ))}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div>
          <h4 className="font-semibold text-sm mb-3">Quick Actions</h4>
          <div className="grid gap-2">
            {personalizedActions.map((action, index) => (
              <Button
                key={index}
                variant="ghost"
                className="justify-start h-auto p-3 hover:bg-primary/5"
                asChild
              >
                <Link to={action.href}>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                      {action.icon}
                    </div>
                    <div className="text-left">
                      <div className="font-medium text-sm">{action.label}</div>
                      <div className="text-xs text-muted-foreground">
                        {action.description}
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 ml-auto text-muted-foreground" />
                  </div>
                </Link>
              </Button>
            ))}
          </div>
        </div>

        {/* No preferences fallback */}
        {!preferences?.data && (
          <div className="text-center py-4">
            <p className="text-muted-foreground mb-3">
              Complete your style profile to get personalized recommendations
            </p>
            <Button variant="outline" asChild>
              <Link to="/profile">
                Set Preferences
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PersonalizedFashionBot;