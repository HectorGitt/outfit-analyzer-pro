import { Link } from "react-router-dom";
import {
	Camera,
	Upload,
	Sparkles,
	Star,
	Users,
	TrendingUp,
	ArrowRight,
	Zap,
	Shield,
	Globe,
	Calendar,
	Shirt,
	Clock,
	Target,
	Palette,
	BarChart3,
	Bot,
	MessageCircle,
	Mic,
	Volume2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Navbar } from "@/components/navigation/navbar";
import { Leaderboard, FashionIconCard } from "@/components/ui/leaderboard";
import { fashionAPI } from "@/services/api";
import { useQuery } from "@tanstack/react-query";
import heroImage from "@/assets/hero-fashion.jpg";
import logoImage from "@/assets/logo.png";

import AOS from "aos";
import "aos/dist/aos.css";
import { useEffect } from "react";
import { pricingTiers } from "@/lib/pricingTiers";
import Footer from "@/components/ui/Footer";

const Index = () => {
	useEffect(() => {
		AOS.init({
			duration: 1000,
			once: true,
		});
	}, []);

	// Fetch leaderboard data
	const { data: leaderboardData } = useQuery({
		queryKey: ["leaderboard"],
		queryFn: fashionAPI.getLeaderboard,
		staleTime: 5 * 60 * 1000, // 5 minutes
	});

	// Fetch fashion icon data
	const { data: fashionIconData } = useQuery({
		queryKey: ["fashionIcon"],
		queryFn: fashionAPI.getFashionIcon,
		staleTime: 5 * 60 * 1000, // 5 minutes
	});
	const features = [
		{
			icon: <Upload className="w-6 h-6" />,
			title: "Upload Analysis",
			description:
				"Upload your outfit photos for instant AI-powered fashion analysis",
			href: "/upload",
		},
		{
			icon: <Camera className="w-6 h-6" />,
			title: "Live Camera",
			description: "Real-time outfit analysis using your device camera",
			href: "/camera",
		},
		{
			icon: <Sparkles className="w-6 h-6" />,
			title: "Style Recommendations",
			description:
				"Get personalized suggestions based on your preferences",
			href: "/profile",
		},
		{
			icon: <TrendingUp className="w-6 h-6" />,
			title: "Trend Insights",
			description:
				"Stay updated with the latest fashion trends and insights",
			href: "/dashboard",
		},
	];

	// Types for pricing tiers
	type PricingTier = {
		name: string;
		price_monthly: number;
		features: Record<string, string | number | boolean>;
	};

	const recommendedTier = "elite";

	return (
		<div className="min-h-screen bg-background overflow-x-hidden" data-aos="fade-in">
			<Navbar />

			{/* Hero Section - Enhanced with better value proposition */}
			<section
				className="relative py-24 bg-gradient-hero overflow-hidden"
				data-aos="fade-up"
			>
				<div className="container mx-auto px-4 max-w-full overflow-hidden">
					<div className="grid lg:grid-cols-2 gap-12 items-center">
						<div className="space-y-8" data-aos="fade-right">
							<div className="space-y-6">
								<Badge className="bg-primary/10 text-primary border-primary/20 px-4 py-2">
									<Sparkles className="w-4 h-4 mr-2" />
									AI-Powered Fashion Intelligence
								</Badge>
								<h1 className="text-5xl lg:text-7xl font-bold leading-tight">
									Transform Your Style with{" "}
									<span className="text-gradient block">
										AI Fashion Analysis
									</span>
								</h1>
								<p className="text-xl text-muted-foreground leading-relaxed max-w-lg">
									Get instant, personalized fashion analysis
									and expert recommendations powered by
									advanced AI. Elevate your wardrobe game with
									intelligent insights.
								</p>
							</div>

							<div className="flex flex-col sm:flex-row gap-4">
								<Button
									className="btn-gradient text-lg px-8 py-6 shadow-fashion hover:shadow-xl transition-all duration-300"
									asChild
								>
									<Link to="/upload">
										Start Free Analysis
										<ArrowRight className="ml-2 w-5 h-5" />
									</Link>
								</Button>
								<Button
									variant="outline"
									className="text-lg px-8 py-6 border-2 hover:bg-primary hover:text-white transition-all duration-300"
									asChild
								>
									<Link to="/camera">
										<Camera className="mr-2 w-5 h-5" />
										Try Live Camera
									</Link>
								</Button>
							</div>
						</div>

						<div
							className="relative lg:block hidden"
							data-aos="fade-left"
						>
							<div className="relative animate-float">
								<img
									src={heroImage}
									alt="Fashion Analysis Demo"
									className="w-full h-auto rounded-3xl shadow-2xl"
								/>
								<div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent rounded-3xl" />
								<div className="absolute -bottom-6 -right-6 w-32 h-32 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full blur-xl" />
							</div>
						</div>
					</div>
				</div>

				{/* Floating elements for visual interest */}
				<div className="absolute top-20 left-10 w-20 h-20 bg-primary/10 rounded-full blur-xl animate-pulse" />
				<div className="absolute bottom-20 right-10 w-32 h-32 bg-accent/10 rounded-full blur-xl animate-pulse" />
			</section>

			{/* Core Features - Enhanced Design */}
			<section className="py-32 bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-gray-900 dark:via-gray-800 dark:to-blue-950/20 relative overflow-hidden">
				{/* Background Pattern */}
				<div className="absolute inset-0 opacity-5">
					<div className="absolute top-20 left-10 w-72 h-72 bg-primary rounded-full blur-3xl"></div>
					<div className="absolute bottom-20 right-10 w-96 h-96 bg-accent rounded-full blur-3xl"></div>
					<div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-purple-500 rounded-full blur-3xl"></div>
				</div>

				<div className="container mx-auto px-4 relative z-10 max-w-full overflow-hidden">
					<div className="text-center mb-24">
						<div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-6 py-3 rounded-full text-sm font-semibold mb-8 border border-primary/20">
							<Sparkles className="w-4 h-4" />
							Complete Fashion Solution
						</div>
						<h2 className="text-5xl lg:text-7xl font-bold mb-8 leading-tight">
							Everything You Need for{" "}
							<span className="text-gradient bg-gradient-to-r from-primary via-purple-500 to-accent bg-clip-text text-transparent">
								Perfect Style
							</span>
						</h2>
						<p className="text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
							From instant AI analysis to personalized
							recommendations, discover the complete fashion
							toolkit that transforms how you dress, shop, and
							express your unique style
						</p>
					</div>

					<div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
						{features.map((feature, index) => (
							<Card
								key={index}
								className="group relative card-fashion hover:shadow-2xl hover:-translate-y-3 transition-all duration-700 border-0 shadow-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm overflow-hidden"
								data-aos="fade-up"
								data-aos-delay={index * 150}
							>
								{/* Gradient overlay on hover */}
								<div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

								{/* Animated border */}
								<div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary via-purple-500 to-accent opacity-0 group-hover:opacity-20 transition-opacity duration-500 blur-sm"></div>

								<CardHeader className="pb-6 relative z-10">
									<div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl flex items-center justify-center text-primary mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-lg group-hover:shadow-primary/25">
										{feature.icon}
									</div>
									<CardTitle className="text-2xl font-bold group-hover:text-primary transition-colors duration-300">
										{feature.title}
									</CardTitle>
								</CardHeader>

								<CardContent className="relative z-10">
									<p className="text-muted-foreground mb-8 leading-relaxed group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors duration-300">
										{feature.description}
									</p>

									{/* Enhanced CTA Button */}
									<div className="relative">
										<Button
											variant="ghost"
											className="group/btn relative overflow-hidden bg-gradient-to-r from-primary/10 to-accent/10 hover:from-primary/20 hover:to-accent/20 text-primary hover:text-primary font-semibold py-4 px-6 rounded-xl transition-all duration-300 border border-primary/20 hover:border-primary/40"
											asChild
										>
											<Link
												to={feature.href}
												className="flex items-center justify-between w-full"
											>
												<span>Explore Feature</span>
												<div className="flex items-center gap-2">
													<span className="group-hover/btn:translate-x-1 transition-transform duration-300">
														<ArrowRight className="w-4 h-4" />
													</span>
												</div>
											</Link>
										</Button>

										{/* Animated underline */}
										<div className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-primary to-accent group-hover:w-full transition-all duration-500"></div>
									</div>
								</CardContent>

								{/* Floating elements */}
								<div className="absolute -top-2 -right-2 w-4 h-4 bg-primary rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-pulse"></div>
								<div className="absolute -bottom-2 -left-2 w-3 h-3 bg-accent rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700 animate-pulse"></div>
							</Card>
						))}
					</div>

					{/* Enhanced Stats Section */}
					<div className="mt-24 text-center">
						<div className="inline-flex items-center gap-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm px-8 py-4 rounded-2xl shadow-xl border border-white/20">
							<div className="flex items-center gap-6">
								<div className="text-center">
									<div className="text-3xl font-bold text-primary mb-1">
										10K+
									</div>
									<div className="text-sm text-muted-foreground">
										Happy Users
									</div>
								</div>
								<div className="w-px h-12 bg-gradient-to-b from-transparent via-primary/30 to-transparent"></div>
								<div className="text-center">
									<div className="text-3xl font-bold text-primary mb-1">
										500+
									</div>
									<div className="text-sm text-muted-foreground">
										Style Combinations
									</div>
								</div>
								<div className="w-px h-12 bg-gradient-to-b from-transparent via-primary/30 to-transparent"></div>
								<div className="text-center">
									<div className="text-3xl font-bold text-primary mb-1">
										24/7
									</div>
									<div className="text-sm text-muted-foreground">
										AI Support
									</div>
								</div>
							</div>
						</div>
					</div>

					{/* Call to Action */}
					<div className="mt-16 text-center">
						<div className="max-w-2xl mx-auto">
							<h3 className="text-2xl font-bold mb-4">
								Ready to Transform Your Wardrobe?
							</h3>
							<p className="text-muted-foreground mb-8">
								Join thousands of fashion enthusiasts who have
								discovered their perfect style
							</p>
							<div className="flex flex-col sm:flex-row gap-4 justify-center">
								<Button
									className="btn-gradient text-lg px-8 py-4 shadow-xl hover:shadow-2xl transition-all duration-300"
									asChild
								>
									<Link to="/upload">
										Start Your Style Journey
										<ArrowRight className="ml-2 w-5 h-5" />
									</Link>
								</Button>
								<Button
									variant="outline"
									className="text-lg px-8 py-4 border-2 hover:bg-primary hover:text-white transition-all duration-300"
									asChild
								>
									<Link to="/camera">
										<Camera className="mr-2 w-5 h-5" />
										Try Live Analysis
									</Link>
								</Button>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Smart Fashion Scheduling Section */}
			<section className="py-24 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950/20 dark:via-indigo-950/20 dark:to-purple-950/20">
				<div className="container mx-auto px-4">
					<div className="text-center mb-20">
						<Badge className="bg-gradient-to-r from-blue-500 to-purple-500 text-white border-0 px-6 py-3 text-lg font-semibold shadow-lg mb-6">
							<Calendar className="w-5 h-5 mr-2" />
							Smart Fashion Scheduling
						</Badge>
						<h2 className="text-4xl lg:text-6xl font-bold mb-6">
							Get personalized outfit recommendations for{" "}
							<span className="text-gradient">
								different events
							</span>
						</h2>
						<p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
							Transform your wardrobe planning with AI-powered
							scheduling that understands your style preferences,
							occasions, and creates perfect outfit combinations
							tailored to your calendar events.
						</p>
					</div>

					{/* Main Features Grid */}
					<div className="grid lg:grid-cols-2 gap-16 items-center max-w-7xl mx-auto mb-20">
						{/* Left Side - Features */}
						<div className="space-y-12">
							{/* Event-Based Styling */}
							<div className="flex items-start space-x-6 group">
								<div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center text-white flex-shrink-0 shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
									<Calendar className="w-8 h-8" />
								</div>
								<div className="space-y-3">
									<h3 className="text-3xl font-bold text-gray-900 dark:text-white">
										Event-Based Styling
									</h3>
									<p className="text-lg text-muted-foreground leading-relaxed">
										Get outfit suggestions tailored for work
										meetings, casual outings, formal events,
										and special occasions. Our AI analyzes
										the event type, time, and your personal
										style to recommend the perfect ensemble.
									</p>
									<div className="flex flex-wrap gap-2">
										<Badge
											variant="secondary"
											className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
										>
											Work Meetings
										</Badge>
										<Badge
											variant="secondary"
											className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
										>
											Casual Outings
										</Badge>
										<Badge
											variant="secondary"
											className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
										>
											Formal Events
										</Badge>
										<Badge
											variant="secondary"
											className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
										>
											Special Occasions
										</Badge>
									</div>
								</div>
							</div>

							{/* Weekly Planning */}
							<div className="flex items-start space-x-6 group">
								<div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center text-white flex-shrink-0 shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
									<Clock className="w-8 h-8" />
								</div>
								<div className="space-y-3">
									<h3 className="text-3xl font-bold text-gray-900 dark:text-white">
										Weekly Planning
									</h3>
									<p className="text-lg text-muted-foreground leading-relaxed">
										Plan your outfits for the entire week
										with smart recommendations that avoid
										repetition and ensure variety. Get
										weather-aware suggestions and never wear
										the same outfit twice in a week.
									</p>
									<div className="grid grid-cols-2 gap-3">
										<div className="bg-white/60 dark:bg-gray-800/60 p-4 rounded-xl border border-white/20">
											<div className="text-2xl font-bold text-green-600 mb-1">
												7
											</div>
											<div className="text-sm text-muted-foreground">
												Days Planned
											</div>
										</div>
										<div className="bg-white/60 dark:bg-gray-800/60 p-4 rounded-xl border border-white/20">
											<div className="text-2xl font-bold text-blue-600 mb-1">
												0
											</div>
											<div className="text-sm text-muted-foreground">
												Repeats
											</div>
										</div>
									</div>
								</div>
							</div>

							{/* Smart Combinations */}
							<div className="flex items-start space-x-6 group">
								<div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center text-white flex-shrink-0 shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
									<Sparkles className="w-8 h-8" />
								</div>
								<div className="space-y-3">
									<h3 className="text-3xl font-bold text-gray-900 dark:text-white">
										Smart Combinations
									</h3>
									<p className="text-lg text-muted-foreground leading-relaxed">
										Discover new outfit combinations from
										your existing wardrobe items. Our AI
										analyzes your clothing colors, patterns,
										and styles to create fresh looks you
										never considered.
									</p>
									<div className="bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20 p-4 rounded-xl border border-purple-200 dark:border-purple-800">
										<p className="text-sm font-medium text-purple-800 dark:text-purple-200">
											🎨 "Mix your blue jeans with that
											floral blouse for a stunning casual
											look!"
										</p>
									</div>
								</div>
							</div>
						</div>

						{/* Right Side - Interactive Demo */}
						<div className="space-y-8">
							<Card className="card-fashion p-8 bg-gradient-to-br from-white to-blue-50/50 dark:from-gray-800 dark:to-blue-950/20 border-0 shadow-2xl">
								<div className="text-center mb-8">
									<div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
										<Calendar className="w-10 h-10 text-white" />
									</div>
									<h3 className="text-3xl font-bold mb-3">
										Your Smart Calendar
									</h3>
									<p className="text-muted-foreground text-lg">
										AI-powered outfit planning
									</p>
								</div>

								{/* Calendar Events */}
								<div className="space-y-4">
									{/* Monday */}
									<Card className="p-4 border-l-4 border-l-blue-500 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
										<div className="flex items-center justify-between">
											<div className="flex items-center gap-3">
												<div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center text-white font-bold">
													M
												</div>
												<div>
													<h4 className="font-semibold">
														Team Meeting
													</h4>
													<p className="text-sm text-muted-foreground">
														9:00 AM - 10:00 AM
													</p>
												</div>
											</div>
											<Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
												Business Casual
											</Badge>
										</div>
									</Card>

									{/* Wednesday */}
									<Card className="p-4 border-l-4 border-l-green-500 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
										<div className="flex items-center justify-between">
											<div className="flex items-center gap-3">
												<div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center text-white font-bold">
													W
												</div>
												<div>
													<h4 className="font-semibold">
														Dinner Date
													</h4>
													<p className="text-sm text-muted-foreground">
														7:00 PM - 9:00 PM
													</p>
												</div>
											</div>
											<Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
												Smart Casual
											</Badge>
										</div>
									</Card>

									{/* Friday */}
									<Card className="p-4 border-l-4 border-l-purple-500 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20">
										<div className="flex items-center justify-between">
											<div className="flex items-center gap-3">
												<div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center text-white font-bold">
													F
												</div>
												<div>
													<h4 className="font-semibold">
														Wedding Reception
													</h4>
													<p className="text-sm text-muted-foreground">
														6:00 PM - 11:00 PM
													</p>
												</div>
											</div>
											<Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
												Formal
											</Badge>
										</div>
									</Card>

									{/* Saturday */}
									<Card className="p-4 border-l-4 border-l-orange-500 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20">
										<div className="flex items-center justify-between">
											<div className="flex items-center gap-3">
												<div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center text-white font-bold">
													S
												</div>
												<div>
													<h4 className="font-semibold">
														Weekend Brunch
													</h4>
													<p className="text-sm text-muted-foreground">
														11:00 AM - 1:00 PM
													</p>
												</div>
											</div>
											<Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
												Casual
											</Badge>
										</div>
									</Card>
								</div>

								{/* AI Suggestions */}
								<div className="mt-8 p-4 bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl border border-indigo-200 dark:border-indigo-800">
									<div className="flex items-center gap-3 mb-3">
										<Bot className="w-5 h-5 text-indigo-600" />
										<span className="font-semibold text-indigo-800 dark:text-indigo-200">
											AI Suggestion
										</span>
									</div>
									<p className="text-sm text-indigo-700 dark:text-indigo-300">
										"For your wedding reception, I recommend
										your navy blazer with the white dress
										shirt and black trousers. This
										combination is elegant yet comfortable
										and perfectly matches the formal
										occasion."
									</p>
								</div>
							</Card>

							{/* Stats Cards */}
							<div className="grid grid-cols-3 gap-4">
								<Card className="p-6 text-center bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-0 shadow-lg">
									<div className="text-3xl font-bold text-blue-600 mb-2">
										500+
									</div>
									<div className="text-sm text-muted-foreground font-medium">
										Outfit Combinations
									</div>
								</Card>
								<Card className="p-6 text-center bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-0 shadow-lg">
									<div className="text-3xl font-bold text-green-600 mb-2">
										24/7
									</div>
									<div className="text-sm text-muted-foreground font-medium">
										Smart Planning
									</div>
								</Card>
								<Card className="p-6 text-center bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border-0 shadow-lg">
									<div className="text-3xl font-bold text-purple-600 mb-2">
										95%
									</div>
									<div className="text-sm text-muted-foreground font-medium">
										Accuracy Rate
									</div>
								</Card>
							</div>
						</div>
					</div>

					{/* CTA Section */}
					<div className="text-center">
						<div className="max-w-3xl mx-auto space-y-8">
							<div className="space-y-4">
								<h3 className="text-3xl lg:text-4xl font-bold">
									Ready to Revolutionize Your Wardrobe
									Planning?
								</h3>
								<p className="text-xl text-muted-foreground">
									Connect your calendar and let AI handle your
									outfit planning with personalized,
									event-specific recommendations that match
									your style perfectly.
								</p>
							</div>

							<div className="flex flex-col sm:flex-row gap-6 justify-center">
								<Button
									className="btn-gradient text-lg px-10 py-6 shadow-xl hover:shadow-2xl transition-all duration-300"
									size="lg"
									asChild
								>
									<Link to="/calendar-connect">
										Connect Calendar
										<ArrowRight className="ml-3 w-5 h-5" />
									</Link>
								</Button>
								<Button
									variant="outline"
									className="text-lg px-10 py-6 border-2 hover:bg-primary hover:text-white transition-all duration-300"
									size="lg"
									asChild
								>
									<Link to="/upload">
										<Camera className="mr-3 w-5 h-5" />
										Try Free Analysis
									</Link>
								</Button>
							</div>

							<div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
								<p className="text-muted-foreground">
									✨ Sync with Google Calendar • Outlook •
									Apple Calendar • Smart AI Planning
								</p>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* AI Chatbot Features - Enhanced */}
			<section className="py-24 bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-blue-950/20 dark:via-gray-900 dark:to-purple-950/20">
				<div className="container mx-auto px-4">
					<div className="text-center mb-20">
						<h2 className="text-4xl lg:text-5xl font-bold mb-6">
							Your Personal Fashion Assistant
						</h2>
						<p className="text-xl text-muted-foreground max-w-3xl mx-auto">
							Meet your AI fashion expert - available 24/7 to
							answer questions, provide styling advice, and help
							you make confident fashion choices
						</p>
					</div>

					<div className="grid lg:grid-cols-2 gap-16 items-center max-w-7xl mx-auto">
						<div className="space-y-8">
							<div className="space-y-8">
								<div className="flex items-start space-x-6">
									<div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center text-white flex-shrink-0 shadow-lg">
										<MessageCircle className="w-7 h-7" />
									</div>
									<div className="space-y-2">
										<h3 className="text-2xl font-bold">
											Intelligent Conversations
										</h3>
										<p className="text-muted-foreground text-lg leading-relaxed">
											Ask natural questions about fashion,
											style, and outfit combinations. Our
											AI understands context and provides
											relevant, personalized advice
											tailored to your wardrobe.
										</p>
									</div>
								</div>

								<div className="flex items-start space-x-6">
									<div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center text-white flex-shrink-0 shadow-lg">
										<Shirt className="w-7 h-7" />
									</div>
									<div className="space-y-2">
										<h3 className="text-2xl font-bold">
											Wardrobe Integration
										</h3>
										<p className="text-muted-foreground text-lg leading-relaxed">
											The chatbot knows your wardrobe
											items and suggests outfits based on
											what you actually own, avoiding
											generic recommendations and ensuring
											practicality.
										</p>
									</div>
								</div>

								<div className="flex items-start space-x-6">
									<div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center text-white flex-shrink-0 shadow-lg">
										<TrendingUp className="w-7 h-7" />
									</div>
									<div className="space-y-2">
										<h3 className="text-2xl font-bold">
											Trend Awareness
										</h3>
										<p className="text-muted-foreground text-lg leading-relaxed">
											Stay updated with current fashion
											trends, seasonal colors, and styling
											tips that perfectly match your
											personal style preferences and body
											type.
										</p>
									</div>
								</div>
							</div>

							{/* Enhanced sample conversation */}
							<div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/20">
								<h4 className="font-bold text-xl mb-6 flex items-center">
									<Bot className="w-6 h-6 mr-3 text-primary" />
									Sample Conversation
								</h4>
								<div className="space-y-4">
									<div className="flex gap-4">
										<div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
											<span className="text-white text-sm font-bold">
												Y
											</span>
										</div>
										<div className="bg-primary/10 rounded-2xl rounded-tl-md px-4 py-3 max-w-md">
											<p className="text-sm">
												"What should I wear to a wedding
												this weekend?"
											</p>
										</div>
									</div>
									<div className="flex gap-4 justify-end">
										<div className="bg-gradient-to-r from-primary to-accent rounded-2xl rounded-tr-md px-4 py-3 max-w-lg">
											<p className="text-sm text-white">
												"Based on your navy blazer,
												white dress shirt, and chinos in
												your wardrobe, I'd recommend
												that combination with your brown
												leather shoes. It's elegant yet
												comfortable for a wedding
												reception!"
											</p>
										</div>
										<div className="w-8 h-8 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center flex-shrink-0">
											<Bot className="w-4 h-4 text-white" />
										</div>
									</div>
								</div>
							</div>
						</div>

						<div className="space-y-8">
							<Card className="card-fashion p-8 bg-gradient-to-br from-white to-blue-50/50 dark:from-gray-800 dark:to-blue-950/20 border-0 shadow-2xl">
								<div className="flex items-center gap-6 mb-6">
									<div className="w-16 h-16 bg-gradient-to-r from-primary to-accent rounded-2xl flex items-center justify-center shadow-lg">
										<Bot className="w-8 h-8 text-white" />
									</div>
									<div>
										<h3 className="text-2xl font-bold">
											24/7 Fashion Support
										</h3>
										<p className="text-muted-foreground">
											Always available for style advice
										</p>
									</div>
								</div>
								<div className="space-y-4 mb-8">
									<div className="flex justify-between items-center p-4 bg-white/50 dark:bg-gray-700/50 rounded-xl">
										<span className="font-semibold">
											Response Time
										</span>
										<span className="text-primary font-bold">
											&lt; 2 seconds
										</span>
									</div>
									<div className="flex justify-between items-center p-4 bg-white/50 dark:bg-gray-700/50 rounded-xl">
										<span className="font-semibold">
											Style Questions
										</span>
										<span className="text-primary font-bold">
											Unlimited
										</span>
									</div>
									<div className="flex justify-between items-center p-4 bg-white/50 dark:bg-gray-700/50 rounded-xl">
										<span className="font-semibold">
											Personalization
										</span>
										<span className="text-primary font-bold">
											100%
										</span>
									</div>
								</div>
							</Card>

							{/* Performance metrics */}
							<div className="grid grid-cols-2 gap-6">
								<Card className="p-6 text-center bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-0 shadow-lg">
									<div className="text-3xl font-bold text-green-600 mb-2">
										50+
									</div>
									<div className="text-sm text-muted-foreground font-medium">
										Style Topics
									</div>
								</Card>
								<Card className="p-6 text-center bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 border-0 shadow-lg">
									<div className="text-3xl font-bold text-blue-600 mb-2">
										1000+
									</div>
									<div className="text-sm text-muted-foreground font-medium">
										Outfit Combinations
									</div>
								</Card>
								<Card className="p-6 text-center bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border-0 shadow-lg">
									<div className="text-3xl font-bold text-purple-600 mb-2">
										24/7
									</div>
									<div className="text-sm text-muted-foreground font-medium">
										Availability
									</div>
								</Card>
								<Card className="p-6 text-center bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20 border-0 shadow-lg">
									<div className="text-3xl font-bold text-orange-600 mb-2">
										95%
									</div>
									<div className="text-sm text-muted-foreground font-medium">
										Accuracy Rate
									</div>
								</Card>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Voice Agent Section */}
			<section className="py-24 bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-purple-950/20 dark:via-gray-900 dark:to-blue-950/20">
				<div className="container mx-auto px-4 max-w-full overflow-hidden">
					<div className="text-center mb-20">
						<h2 className="text-4xl lg:text-5xl font-bold mb-6">
							Conversational Fashion Intelligence
						</h2>
						<p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
							Experience the future of fashion advice with natural
							voice conversations. Speak to your AI stylist just
							like you would to a friend.
						</p>
						<Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 px-6 py-3 text-lg font-semibold shadow-lg">
							<Mic className="w-5 h-5 mr-2" />
							Pro Feature
						</Badge>
					</div>

					<div className="max-w-7xl mx-auto">
						<div className="grid lg:grid-cols-2 gap-16 items-center">
							<div className="space-y-8">
								<div className="flex items-start space-x-6">
									<div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center text-white flex-shrink-0 shadow-lg">
										<Mic className="w-7 h-7" />
									</div>
									<div className="space-y-2">
										<h3 className="text-2xl font-bold">
											Natural Voice Conversations
										</h3>
										<p className="text-muted-foreground text-lg leading-relaxed">
											Speak naturally about fashion,
											style, and outfits. Our AI
											understands context, remembers your
											preferences, and provides
											conversational responses powered by
											OpenAI's Realtime API for fluid,
											human-like interactions.
										</p>
									</div>
								</div>

								<div className="flex items-start space-x-6">
									<div className="w-14 h-14 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-xl flex items-center justify-center text-white flex-shrink-0 shadow-lg">
										<Zap className="w-7 h-7" />
									</div>
									<div className="space-y-2">
										<h3 className="text-2xl font-bold">
											Smart API Integration
										</h3>
										<p className="text-muted-foreground text-lg leading-relaxed">
											Powered by advanced API tools that
											seamlessly interact with your data
											to provide intelligent fashion
											assistance. The voice agent uses 7
											specialized tools to access and
											analyze your fashion information in
											real-time.
										</p>
										<div className="bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-950/20 dark:to-blue-950/20 p-4 rounded-xl border border-indigo-200 dark:border-indigo-800 mt-4">
											<h4 className="font-semibold text-indigo-800 dark:text-indigo-200 mb-3 flex items-center">
												<Bot className="w-4 h-4 mr-2" />
												7 Powerful API Tools
											</h4>
											<div className="grid grid-cols-1 gap-3">
												<div className="flex items-center gap-3 p-2 bg-white/60 dark:bg-gray-800/60 rounded-lg">
													<div className="w-3 h-3 bg-indigo-500 rounded-full flex-shrink-0"></div>
													<div className="flex-1">
														<span className="font-medium text-indigo-700 dark:text-indigo-300">
															getCalendarEvents
														</span>
														<span className="text-sm text-indigo-600 dark:text-indigo-400 ml-2">
															Accesses your
															calendar to suggest
															outfits for upcoming
															events
														</span>
													</div>
												</div>
												<div className="flex items-center gap-3 p-2 bg-white/60 dark:bg-gray-800/60 rounded-lg">
													<div className="w-3 h-3 bg-blue-500 rounded-full flex-shrink-0"></div>
													<div className="flex-1">
														<span className="font-medium text-blue-700 dark:text-blue-300">
															getWardrobeItems
														</span>
														<span className="text-sm text-blue-600 dark:text-blue-400 ml-2">
															Retrieves your
															wardrobe items for
															personalized
															recommendations
														</span>
													</div>
												</div>
												<div className="flex items-center gap-3 p-2 bg-white/60 dark:bg-gray-800/60 rounded-lg">
													<div className="w-3 h-3 bg-purple-500 rounded-full flex-shrink-0"></div>
													<div className="flex-1">
														<span className="font-medium text-purple-700 dark:text-purple-300">
															addWardrobeItem
														</span>
														<span className="text-sm text-purple-600 dark:text-purple-400 ml-2">
															Adds new clothing
															items to your
															digital wardrobe
														</span>
													</div>
												</div>
												<div className="flex items-center gap-3 p-2 bg-white/60 dark:bg-gray-800/60 rounded-lg">
													<div className="w-3 h-3 bg-green-500 rounded-full flex-shrink-0"></div>
													<div className="flex-1">
														<span className="font-medium text-green-700 dark:text-green-300">
															getUserPreferences
														</span>
														<span className="text-sm text-green-600 dark:text-green-400 ml-2">
															Accesses your style
															preferences and
															fashion profile
														</span>
													</div>
												</div>
												<div className="flex items-center gap-3 p-2 bg-white/60 dark:bg-gray-800/60 rounded-lg">
													<div className="w-3 h-3 bg-orange-500 rounded-full flex-shrink-0"></div>
													<div className="flex-1">
														<span className="font-medium text-orange-700 dark:text-orange-300">
															generateOutfitSuggestion
														</span>
														<span className="text-sm text-orange-600 dark:text-orange-400 ml-2">
															Creates AI-powered
															outfit combinations
															based on your
															criteria
														</span>
													</div>
												</div>
												<div className="flex items-center gap-3 p-2 bg-white/60 dark:bg-gray-800/60 rounded-lg">
													<div className="w-3 h-3 bg-red-500 rounded-full flex-shrink-0"></div>
													<div className="flex-1">
														<span className="font-medium text-red-700 dark:text-red-300">
															getOutfitPlans
														</span>
														<span className="text-sm text-red-600 dark:text-red-400 ml-2">
															Retrieves your saved
															outfit plans and
															schedules
														</span>
													</div>
												</div>
												<div className="flex items-center gap-3 p-2 bg-white/60 dark:bg-gray-800/60 rounded-lg">
													<div className="w-3 h-3 bg-teal-500 rounded-full flex-shrink-0"></div>
													<div className="flex-1">
														<span className="font-medium text-teal-700 dark:text-teal-300">
															createOutfitPlan
														</span>
														<span className="text-sm text-teal-600 dark:text-teal-400 ml-2">
															Creates and saves
															new outfit plans for
															future events
														</span>
													</div>
												</div>
											</div>
											<p className="text-xs text-indigo-600 dark:text-indigo-400 mt-3 font-medium">
												These tools work together to
												provide comprehensive,
												data-driven fashion assistance
												that adapts to your unique style
												and needs.
											</p>
										</div>
									</div>
								</div>
							</div>

							<div className="space-y-8">
								<Card className="card-fashion p-8 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 border-0 shadow-2xl">
									<div className="text-center mb-8">
										<div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
											<Mic className="w-10 h-10 text-white" />
										</div>
										<h3 className="text-3xl font-bold mb-3">
											Voice Agent Pro
										</h3>
										<p className="text-muted-foreground text-lg">
											Experience fashion advice like never
											before
										</p>
									</div>

									<div className="space-y-4 mb-8">
										<div className="flex items-center justify-between p-4 bg-white/60 dark:bg-gray-800/60 rounded-xl backdrop-blur-sm">
											<span className="font-semibold text-lg">
												Natural Conversations
											</span>
											<div className="flex items-center gap-3">
												<div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
												<span className="text-green-600 font-bold">
													Active
												</span>
											</div>
										</div>

										<div className="flex items-center justify-between p-4 bg-white/60 dark:bg-gray-800/60 rounded-xl backdrop-blur-sm">
											<span className="font-semibold text-lg">
												Real-Time Responses
											</span>
											<div className="flex items-center gap-3">
												<div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
												<span className="text-green-600 font-bold">
													&lt; 1s
												</span>
											</div>
										</div>

										<div className="flex items-center justify-between p-4 bg-white/60 dark:bg-gray-800/60 rounded-xl backdrop-blur-sm">
											<span className="font-semibold text-lg">
												Personalization
											</span>
											<div className="flex items-center gap-3">
												<div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
												<span className="text-green-600 font-bold">
													100%
												</span>
											</div>
										</div>
									</div>

									<div className="text-center">
										<Button
											className="btn-gradient text-lg px-8 py-6 w-full shadow-xl hover:shadow-2xl transition-all duration-300"
											size="lg"
										>
											Upgrade to Pro
											<ArrowRight className="ml-2 w-5 h-5" />
										</Button>
										<p className="text-sm text-muted-foreground mt-4">
											Unlock voice conversations and
											premium features
										</p>
									</div>
								</Card>

								{/* Enhanced stats grid */}
								<div className="grid grid-cols-3 gap-6">
									<Card className="p-6 text-center bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-0 shadow-lg hover:shadow-xl transition-all duration-300">
										<div className="text-3xl font-bold text-green-600 mb-2">
											99%
										</div>
										<div className="text-sm text-muted-foreground font-medium">
											User Satisfaction
										</div>
									</Card>
									<Card className="p-6 text-center bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 border-0 shadow-lg hover:shadow-xl transition-all duration-300">
										<div className="text-3xl font-bold text-blue-600 mb-2">
											50+
										</div>
										<div className="text-sm text-muted-foreground font-medium">
											Languages Supported
										</div>
									</Card>
									<Card className="p-6 text-center bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border-0 shadow-lg hover:shadow-xl transition-all duration-300">
										<div className="text-3xl font-bold text-purple-600 mb-2">
											24/7
										</div>
										<div className="text-sm text-muted-foreground font-medium">
											Voice Availability
										</div>
									</Card>
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* How It Works - Simplified and more visual */}
			<section className="py-24 bg-white dark:bg-gray-900">
				<div className="container mx-auto px-4 max-w-full overflow-hidden">
					<div className="text-center mb-20">
						<h2 className="text-4xl lg:text-5xl font-bold mb-6">
							How It Works
						</h2>
						<p className="text-xl text-muted-foreground max-w-3xl mx-auto">
							Transform your fashion experience in three simple
							steps
						</p>
					</div>

					<div className="grid md:grid-cols-3 gap-12 max-w-6xl mx-auto">
						{[
							{
								step: "1",
								title: "Capture or Upload",
								description:
									"Take a photo with your camera or upload an existing image of your outfit",
								icon: <Camera className="w-8 h-8" />,
								color: "from-blue-500 to-cyan-500",
							},
							{
								step: "2",
								title: "AI Analysis",
								description:
									"Our advanced AI analyzes colors, style, fit, and overall fashion coherence",
								icon: <Sparkles className="w-8 h-8" />,
								color: "from-purple-500 to-pink-500",
							},
							{
								step: "3",
								title: "Get Expert Insights",
								description:
									"Receive personalized recommendations and professional styling advice",
								icon: <Bot className="w-8 h-8" />,
								color: "from-green-500 to-emerald-500",
							},
						].map((step, index) => (
							<div
								key={index}
								className="text-center space-y-6 group"
								data-aos="fade-up"
								data-aos-delay={index * 200}
							>
								<div
									className={`w-20 h-20 bg-gradient-to-r ${step.color} rounded-2xl flex items-center justify-center text-white text-2xl font-bold mx-auto shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}
								>
									{step.step}
								</div>
								<div className="space-y-4">
									<h3 className="text-2xl font-bold">
										{step.title}
									</h3>
									<p className="text-muted-foreground text-lg leading-relaxed max-w-sm mx-auto">
										{step.description}
									</p>
								</div>
								<div
									className={`w-16 h-16 bg-gradient-to-r ${step.color} rounded-xl flex items-center justify-center text-white mx-auto shadow-md group-hover:shadow-lg transition-all duration-300`}
								>
									{step.icon}
								</div>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* Pricing Section - Professional and comprehensive */}
			<section className="py-24 bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-950/20">
				<div className="container mx-auto px-4 max-w-full overflow-hidden">
					<div className="text-center mb-20">
						<h2 className="text-4xl lg:text-5xl font-bold mb-6">
							Choose Your Style Journey
						</h2>
						<p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
							Select the perfect plan for your fashion needs.
							Start free and upgrade as you grow.
						</p>
						<Button
							variant="outline"
							className="text-lg px-8 py-4 border-2 border-primary text-primary hover:bg-primary hover:text-white transition-all duration-300"
							asChild
						>
							<Link to="/pricing">
								View Full Pricing Details
								<ArrowRight className="ml-2 w-5 h-5" />
							</Link>
						</Button>
					</div>

					{/* Free Tier - Prominent First */}
					<div className="flex justify-center mb-12">
						<Card className="relative card-fashion border-0 shadow-2xl hover:shadow-3xl transition-all duration-500 group max-w-md w-full">
							<CardHeader className="text-center pb-8">
								<div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-all duration-300">
									<Star className="w-8 h-8 text-white" />
								</div>
								<CardTitle className="text-3xl font-bold mb-2">
									{pricingTiers.free.name}
								</CardTitle>
								<div className="text-5xl font-bold text-primary mb-4">
									${pricingTiers.free.price_monthly}
									<span className="text-lg font-normal text-muted-foreground">
										/month
									</span>
								</div>
								<p className="text-muted-foreground">
									Perfect for getting started
								</p>
							</CardHeader>
							<CardContent className="space-y-6">
								<ul className="space-y-4">
									<li className="flex items-center gap-3">
										<div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
											<svg
												className="w-3 h-3 text-white"
												fill="currentColor"
												viewBox="0 0 20 20"
											>
												<path
													fillRule="evenodd"
													d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
													clipRule="evenodd"
												/>
											</svg>
										</div>
										<span className="text-muted-foreground">
											{
												pricingTiers.free
													.max_upload_analyze
											}{" "}
											outfit analyses per month
										</span>
									</li>
									<li className="flex items-center gap-3">
										<div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
											<svg
												className="w-3 h-3 text-white"
												fill="currentColor"
												viewBox="0 0 20 20"
											>
												<path
													fillRule="evenodd"
													d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
													clipRule="evenodd"
												/>
											</svg>
										</div>
										<span className="text-muted-foreground">
											{
												pricingTiers.free
													.max_wardrobe_items
											}{" "}
											wardrobe items
										</span>
									</li>
									<li className="flex items-center gap-3">
										<div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
											<svg
												className="w-3 h-3 text-white"
												fill="currentColor"
												viewBox="0 0 20 20"
											>
												<path
													fillRule="evenodd"
													d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
													clipRule="evenodd"
												/>
											</svg>
										</div>
										<span className="text-muted-foreground">
											{pricingTiers.free.ai_calls_per_day}{" "}
											AI calls per day
										</span>
									</li>
									<li className="flex items-center gap-3">
										<div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
											<svg
												className="w-3 h-3 text-white"
												fill="currentColor"
												viewBox="0 0 20 20"
											>
												<path
													fillRule="evenodd"
													d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
													clipRule="evenodd"
												/>
											</svg>
										</div>
										<span className="text-muted-foreground">
											Basic dashboard access
										</span>
									</li>
								</ul>
								<Button
									className="w-full py-6 text-lg font-semibold bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg hover:shadow-xl transition-all duration-300"
									asChild
								>
									<Link to="/register">
										Get Started Free
										<ArrowRight className="ml-2 w-5 h-5" />
									</Link>
								</Button>
							</CardContent>
						</Card>
					</div>

					{/* Pro Plans - 3 Column Layout */}
					<div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto justify-items-center">
						{/* Spotlight Tier - Recommended */}
						<Card className="relative card-fashion border-0 shadow-2xl hover:shadow-3xl transition-all duration-500 group max-w-md w-full">
							<div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
								<Badge className="bg-gradient-to-r from-primary to-accent text-white px-6 py-2 text-sm font-bold shadow-lg">
									Most Popular
								</Badge>
							</div>
							<CardHeader className="text-center pb-8">
								<div className="w-16 h-16 bg-gradient-to-r from-primary to-accent rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-all duration-300">
									<Zap className="w-8 h-8 text-white" />
								</div>
								<CardTitle className="text-3xl font-bold mb-2">
									{pricingTiers.spotlight.name}
								</CardTitle>
								<div className="text-5xl font-bold text-primary mb-4">
									${pricingTiers.spotlight.price_monthly}
									<span className="text-lg font-normal text-muted-foreground">
										/month
									</span>
								</div>
								<p className="text-muted-foreground">
									For fashion enthusiasts
								</p>
							</CardHeader>
							<CardContent className="space-y-6">
								<ul className="space-y-4">
									<li className="flex items-center gap-3">
										<div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
											<svg
												className="w-3 h-3 text-white"
												fill="currentColor"
												viewBox="0 0 20 20"
											>
												<path
													fillRule="evenodd"
													d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
													clipRule="evenodd"
												/>
											</svg>
										</div>
										<span className="text-muted-foreground">
											{
												pricingTiers.spotlight
													.max_upload_analyze
											}{" "}
											outfit analyses per month
										</span>
									</li>
									<li className="flex items-center gap-3">
										<div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
											<svg
												className="w-3 h-3 text-white"
												fill="currentColor"
												viewBox="0 0 20 20"
											>
												<path
													fillRule="evenodd"
													d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
													clipRule="evenodd"
												/>
											</svg>
										</div>
										<span className="text-muted-foreground">
											{
												pricingTiers.spotlight
													.max_wardrobe_items
											}{" "}
											wardrobe items
										</span>
									</li>
									<li className="flex items-center gap-3">
										<div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
											<svg
												className="w-3 h-3 text-white"
												fill="currentColor"
												viewBox="0 0 20 20"
											>
												<path
													fillRule="evenodd"
													d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
													clipRule="evenodd"
												/>
											</svg>
										</div>
										<span className="text-muted-foreground">
											{
												pricingTiers.spotlight
													.ai_calls_per_day
											}{" "}
											AI calls per day
										</span>
									</li>
									<li className="flex items-center gap-3">
										<div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
											<svg
												className="w-3 h-3 text-white"
												fill="currentColor"
												viewBox="0 0 20 20"
											>
												<path
													fillRule="evenodd"
													d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
													clipRule="evenodd"
												/>
											</svg>
										</div>
										<span className="text-muted-foreground">
											{pricingTiers.spotlight
												.ai_styling_advice
												? "AI styling advice"
												: "Basic recommendations"}
										</span>
									</li>
									<li className="flex items-center gap-3">
										<div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
											<svg
												className="w-3 h-3 text-white"
												fill="currentColor"
												viewBox="0 0 20 20"
											>
												<path
													fillRule="evenodd"
													d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
													clipRule="evenodd"
												/>
											</svg>
										</div>
										<span className="text-muted-foreground">
											{pricingTiers.spotlight
												.calendar_integration
												? "Calendar integration"
												: "No calendar sync"}
										</span>
									</li>
								</ul>
								<Button
									className="w-full py-6 text-lg font-semibold bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white shadow-lg hover:shadow-xl transition-all duration-300"
									asChild
								>
									<Link to="/register">
										Start {pricingTiers.spotlight.name}{" "}
										Trial
										<ArrowRight className="ml-2 w-5 h-5" />
									</Link>
								</Button>
							</CardContent>
						</Card>

						{/* Elite Tier */}
						<Card className="relative card-fashion border-0 shadow-2xl hover:shadow-3xl transition-all duration-500 group max-w-md w-full">
							<CardHeader className="text-center pb-8">
								<div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-all duration-300">
									<Star className="w-8 h-8 text-white" />
								</div>
								<CardTitle className="text-3xl font-bold mb-2">
									{pricingTiers.elite.name}
								</CardTitle>
								<div className="text-5xl font-bold text-primary mb-4">
									${pricingTiers.elite.price_monthly}
									<span className="text-lg font-normal text-muted-foreground">
										/month
									</span>
								</div>
								<p className="text-muted-foreground">
									For style professionals
								</p>
							</CardHeader>
							<CardContent className="space-y-6">
								<ul className="space-y-4">
									<li className="flex items-center gap-3">
										<div className="w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
											<svg
												className="w-3 h-3 text-white"
												fill="currentColor"
												viewBox="0 0 20 20"
											>
												<path
													fillRule="evenodd"
													d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
													clipRule="evenodd"
												/>
											</svg>
										</div>
										<span className="text-muted-foreground">
											{
												pricingTiers.elite
													.max_upload_analyze
											}{" "}
											outfit analyses per month
										</span>
									</li>
									<li className="flex items-center gap-3">
										<div className="w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
											<svg
												className="w-3 h-3 text-white"
												fill="currentColor"
												viewBox="0 0 20 20"
											>
												<path
													fillRule="evenodd"
													d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
													clipRule="evenodd"
												/>
											</svg>
										</div>
										<span className="text-muted-foreground">
											{
												pricingTiers.elite
													.max_wardrobe_items
											}{" "}
											wardrobe items
										</span>
									</li>
									<li className="flex items-center gap-3">
										<div className="w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
											<svg
												className="w-3 h-3 text-white"
												fill="currentColor"
												viewBox="0 0 20 20"
											>
												<path
													fillRule="evenodd"
													d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
													clipRule="evenodd"
												/>
											</svg>
										</div>
										<span className="text-muted-foreground">
											{
												pricingTiers.elite
													.ai_calls_per_day
											}{" "}
											AI calls per day
										</span>
									</li>
									<li className="flex items-center gap-3">
										<div className="w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
											<svg
												className="w-3 h-3 text-white"
												fill="currentColor"
												viewBox="0 0 20 20"
											>
												<path
													fillRule="evenodd"
													d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
													clipRule="evenodd"
												/>
											</svg>
										</div>
										<span className="text-muted-foreground">
											{pricingTiers.elite
												.weather_integration
												? "Weather integration"
												: "No weather sync"}
										</span>
									</li>
									<li className="flex items-center gap-3">
										<div className="w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
											<svg
												className="w-3 h-3 text-white"
												fill="currentColor"
												viewBox="0 0 20 20"
											>
												<path
													fillRule="evenodd"
													d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
													clipRule="evenodd"
												/>
											</svg>
										</div>
										<span className="text-muted-foreground">
											{pricingTiers.elite
												.monthly_style_reports
												? "Monthly style reports"
												: "No reports"}
										</span>
									</li>
								</ul>
								<Button
									className="w-full py-6 text-lg font-semibold bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg hover:shadow-xl transition-all duration-300"
									asChild
								>
									<Link to="/register">
										Go {pricingTiers.elite.name}
										<ArrowRight className="ml-2 w-5 h-5" />
									</Link>
								</Button>
							</CardContent>
						</Card>

						{/* Icon Tier */}
						<Card className="relative card-fashion border-0 shadow-2xl hover:shadow-3xl transition-all duration-500 group max-w-md w-full">
							<CardHeader className="text-center pb-8">
								<div className="w-16 h-16 bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-all duration-300">
									<TrendingUp className="w-8 h-8 text-white" />
								</div>
								<CardTitle className="text-3xl font-bold mb-2">
									{pricingTiers.icon.name}
								</CardTitle>
								<div className="text-5xl font-bold text-primary mb-4">
									${pricingTiers.icon.price_monthly}
									<span className="text-lg font-normal text-muted-foreground">
										/month
									</span>
								</div>
								<p className="text-muted-foreground">
									For fashion influencers
								</p>
							</CardHeader>
							<CardContent className="space-y-6">
								<ul className="space-y-4">
									<li className="flex items-center gap-3">
										<div className="w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center flex-shrink-0">
											<svg
												className="w-3 h-3 text-white"
												fill="currentColor"
												viewBox="0 0 20 20"
											>
												<path
													fillRule="evenodd"
													d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
													clipRule="evenodd"
												/>
											</svg>
										</div>
										<span className="text-muted-foreground">
											{
												pricingTiers.icon
													.max_upload_analyze
											}{" "}
											outfit analyses per month
										</span>
									</li>
									<li className="flex items-center gap-3">
										<div className="w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center flex-shrink-0">
											<svg
												className="w-3 h-3 text-white"
												fill="currentColor"
												viewBox="0 0 20 20"
											>
												<path
													fillRule="evenodd"
													d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
													clipRule="evenodd"
												/>
											</svg>
										</div>
										<span className="text-muted-foreground">
											{
												pricingTiers.icon
													.max_wardrobe_items
											}{" "}
											wardrobe items
										</span>
									</li>
									<li className="flex items-center gap-3">
										<div className="w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center flex-shrink-0">
											<svg
												className="w-3 h-3 text-white"
												fill="currentColor"
												viewBox="0 0 20 20"
											>
												<path
													fillRule="evenodd"
													d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
													clipRule="evenodd"
												/>
											</svg>
										</div>
										<span className="text-muted-foreground">
											{pricingTiers.icon.ai_calls_per_day}{" "}
											AI calls per day
										</span>
									</li>
									<li className="flex items-center gap-3">
										<div className="w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center flex-shrink-0">
											<svg
												className="w-3 h-3 text-white"
												fill="currentColor"
												viewBox="0 0 20 20"
											>
												<path
													fillRule="evenodd"
													d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
													clipRule="evenodd"
												/>
											</svg>
										</div>
										<span className="text-muted-foreground">
											{pricingTiers.icon.priority_support
												? "Priority support"
												: "Standard support"}
										</span>
									</li>
									<li className="flex items-center gap-3">
										<div className="w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center flex-shrink-0">
											<svg
												className="w-3 h-3 text-white"
												fill="currentColor"
												viewBox="0 0 20 20"
											>
												<path
													fillRule="evenodd"
													d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
													clipRule="evenodd"
												/>
											</svg>
										</div>
										<span className="text-muted-foreground">
											Everything in Elite
										</span>
									</li>
								</ul>
								<Button
									className="w-full py-6 text-lg font-semibold bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg hover:shadow-xl transition-all duration-300"
									asChild
								>
									<Link to="/register">
										Become an {pricingTiers.icon.name}
										<ArrowRight className="ml-2 w-5 h-5" />
									</Link>
								</Button>
							</CardContent>
						</Card>
					</div>

					{/* FAQ Section */}
					<div className="mt-20 max-w-4xl mx-auto">
						<h3 className="text-3xl font-bold text-center mb-12">
							Frequently Asked Questions
						</h3>
						<div className="grid md:grid-cols-2 gap-8">
							<div className="space-y-6">
								<div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20">
									<h4 className="font-bold text-lg mb-3">
										Can I change plans anytime?
									</h4>
									<p className="text-muted-foreground">
										Yes! You can upgrade or downgrade your
										plan at any time. Changes take effect
										immediately.
									</p>
								</div>
								<div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20">
									<h4 className="font-bold text-lg mb-3">
										Is there a free trial?
									</h4>
									<p className="text-muted-foreground">
										Absolutely! Start with our free plan and
										upgrade when you're ready. No credit
										card required to begin.
									</p>
								</div>
							</div>
							<div className="space-y-6">
								<div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20">
									<h4 className="font-bold text-lg mb-3">
										What payment methods do you accept?
									</h4>
									<p className="text-muted-foreground">
										We accept all major credit cards,
										PayPal, and other popular payment
										methods for your convenience.
									</p>
								</div>
								<div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20">
									<h4 className="font-bold text-lg mb-3">
										Can I cancel anytime?
									</h4>
									<p className="text-muted-foreground">
										Yes, you can cancel your subscription at
										any time. No long-term contracts or
										cancellation fees.
									</p>
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Community & Social Proof */}
			<section className="py-24 bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5">
				<div className="container mx-auto px-4 max-w-full overflow-hidden">
					<div className="text-center mb-20">
						<h2 className="text-4xl lg:text-5xl font-bold mb-6">
							Join Our Fashion Community
						</h2>
						<p className="text-xl text-muted-foreground max-w-3xl mx-auto">
							Connect with fellow fashion enthusiasts, share your
							style journey, and get inspired by top performers
						</p>
					</div>

					<div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
						{/* Analysis Leaderboard */}
						<div data-aos="fade-right">
							{fashionAPI && leaderboardData?.success && (
								<Card className="p-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-2xl">
									<div className="flex items-center gap-4 mb-6">
										<div className="w-12 h-12 bg-gradient-to-r from-primary to-accent rounded-xl flex items-center justify-center">
											<TrendingUp className="w-6 h-6 text-white" />
										</div>
										<div>
											<h3 className="text-2xl font-bold">
												Top Fashion Analysts
											</h3>
											<p className="text-muted-foreground">
												Our most active style explorers
											</p>
										</div>
									</div>
									<Leaderboard
										users={leaderboardData.data.leaderboard.slice(
											0,
											5
										)}
										title=""
									/>
								</Card>
							)}
						</div>

						{/* Fashion Icon */}
						<div data-aos="fade-left">
							{fashionAPI && fashionIconData?.success && (
								<Card className="p-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-2xl">
									<div className="flex items-center gap-4 mb-6">
										<div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
											<Star className="w-6 h-6 text-white" />
										</div>
										<div>
											<h3 className="text-2xl font-bold">
												Fashion Icon of the Month
											</h3>
											<p className="text-muted-foreground">
												Celebrating exceptional style
											</p>
										</div>
									</div>
									<FashionIconCard
										icon={fashionIconData.data.fashion_icon}
									/>
								</Card>
							)}
						</div>
					</div>
				</div>
			</section>

			{/* CTA Section - Simplified and focused */}
			<section className="py-24 bg-gradient-to-r from-primary via-accent to-primary text-white relative overflow-hidden">
				<div className="absolute inset-0 bg-black/20"></div>
				<div className="container mx-auto px-4 text-center relative z-10 max-w-full overflow-hidden">
					<div className="max-w-4xl mx-auto space-y-8">
						<div className="space-y-4">
							<h2 className="text-4xl lg:text-6xl font-bold mb-6">
								Ready to Transform Your Style?
							</h2>
							<p className="text-xl opacity-90 max-w-2xl mx-auto leading-relaxed">
								Join thousands of users who have elevated their
								fashion game with AI-powered style analysis.
								Start your journey to better style today.
							</p>
						</div>

						<div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
							<Button
								size="lg"
								variant="secondary"
								className="text-lg px-10 py-6 shadow-2xl hover:shadow-3xl transition-all duration-300 bg-white text-primary hover:bg-gray-50 font-semibold"
								asChild
							>
								<Link to="/register">
									Start Free Analysis
									<ArrowRight className="ml-3 w-5 h-5" />
								</Link>
							</Button>
							<Button
								size="lg"
								variant="outline"
								className="text-lg px-10 py-6 border-2 border-white text-white bg-transparent hover:bg-white hover:text-primary transition-all duration-300 shadow-xl"
								asChild
							>
								<Link to="/upload">
									<Camera className="mr-3 w-5 h-5" />
									Try Demo Now
								</Link>
							</Button>
						</div>

						<div className="mt-12 pt-8 border-t border-white/20">
							<p className="text-white/80 text-lg">
								✨ No credit card required • Instant access •
								Cancel anytime
							</p>
						</div>
					</div>
				</div>

				{/* Background decorative elements */}
				<div className="absolute top-0 left-0 w-full h-full">
					<div className="absolute top-20 left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl animate-pulse"></div>
					<div className="absolute bottom-20 right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl animate-pulse"></div>
					<div className="absolute top-1/2 left-1/4 w-24 h-24 bg-white/10 rounded-full blur-xl animate-pulse"></div>
				</div>
			</section>

			{/* Footer - Enhanced and organized */}
			<Footer />
		</div>
	);
};

export default Index;
