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

import { authAPI } from "@/services/api";

const pricingTiers = {
	free: {
		name: "Free",
		max_upload_analyze: 1,
		max_outfit_plans_per_month: 5,
		max_wardrobe_items: 10,
		ai_calls_per_day: 1,
		calendar_integration: false,
		ai_styling_advice: false,
		weather_integration: false,
		outfit_alternatives: false,
		monthly_style_reports: false,
		priority_support: false,
		price_monthly: 0,
	},
	spotlight: {
		name: "Spotlight",
		max_upload_analyze: 5,
		max_outfit_plans_per_month: 30,
		max_wardrobe_items: 30,
		ai_calls_per_day: 10,
		calendar_integration: true,
		ai_styling_advice: true,
		weather_integration: false,
		outfit_alternatives: true,
		monthly_style_reports: false,
		priority_support: false,
		price_monthly: 9.99,
	},
	elite: {
		name: "Elite",
		max_upload_analyze: 100,
		max_outfit_plans_per_month: 100,
		max_wardrobe_items: 50,
		ai_calls_per_day: 50,
		calendar_integration: true,
		ai_styling_advice: true,
		weather_integration: true,
		outfit_alternatives: true,
		monthly_style_reports: true,
		priority_support: false,
		price_monthly: 19.99,
	},
	icon: {
		name: "Icon",
		max_upload_analyze: 300,
		max_outfit_plans_per_month: 300,
		max_wardrobe_items: 300,
		ai_calls_per_day: 200,
		calendar_integration: true,
		ai_styling_advice: true,
		weather_integration: true,
		outfit_alternatives: true,
		monthly_style_reports: true,
		priority_support: true,
		price_monthly: 39.99,
	},
};

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

	const stats = [
		{
			icon: <Users className="w-5 h-5" />,
			label: "Active Users",
			value: "50K+",
		},
		{
			icon: <Star className="w-5 h-5" />,
			label: "Accuracy Rate",
			value: "95%",
		},
		{
			icon: <Zap className="w-5 h-5" />,
			label: "Analyses Done",
			value: "1M+",
		},
		{
			icon: <Globe className="w-5 h-5" />,
			label: "Countries",
			value: "120+",
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
		<div className="min-h-screen bg-background" data-aos="fade-in">
			<Navbar />

			{/* Hero Section */}
			<section
				className="relative py-20 bg-gradient-hero overflow-hidden"
				data-aos="fade-up"
			>
				<div className="container mx-auto px-4">
					<div className="grid lg:grid-cols-2 gap-12 items-center">
						<div className="space-y-8" data-aos="fade-right">
							<div className="space-y-4">
								<Badge className="bg-primary/10 text-primary border-primary/20">
									<Sparkles className="w-3 h-3 mr-1" />
									AI-Powered Fashion Analysis
								</Badge>
								<h1 className="text-5xl lg:text-6xl font-bold leading-tight">
									Elevate Your Style with{" "}
									<span className="text-gradient">
										AI Fashion Intelligence
									</span>
								</h1>
								<p className="text-xl text-muted-foreground leading-relaxed">
									Get instant, personalized fashion analysis
									and style recommendations powered by
									advanced AI technology. Perfect your look,
									boost your confidence.
								</p>
							</div>

							<div className="flex flex-col sm:flex-row gap-4">
								<Button
									className="btn-gradient text-lg px-8 py-4"
									asChild
								>
									<Link to="/upload">
										Start Analysis
										<ArrowRight className="ml-2 w-5 h-5" />
									</Link>
								</Button>
								<Button
									variant="outline"
									className="text-lg px-8 py-4"
									asChild
								>
									<Link to="/camera">
										<Camera className="mr-2 w-5 h-5" />
										Try Live Camera
									</Link>
								</Button>
							</div>

							{/* Stats */}
							<div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-8">
								{stats.map((stat, index) => (
									<div
										key={index}
										className="text-center space-y-2"
									>
										<div className="flex items-center justify-center text-primary">
											{stat.icon}
										</div>
										<div className="text-2xl font-bold">
											{stat.value}
										</div>
										<div className="text-sm text-muted-foreground">
											{stat.label}
										</div>
									</div>
								))}
							</div>
						</div>

						<div className="relative lg:block hidden">
							<div className="relative animate-float">
								<img
									src={heroImage}
									alt="Fashion Analysis Demo"
									className="w-full h-auto rounded-2xl shadow-fashion"
								/>
								<div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-2xl" />
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Fashion Bot Feature Showcase */}
			<section className="py-16 bg-gradient-secondary/30">
				<div className="container mx-auto px-4">
					<div className="max-w-4xl mx-auto text-center">
						<div className="mb-8">
							<h2 className="text-3xl font-bold mb-4">
								Meet Your Fashion Assistant
							</h2>
							<p className="text-lg text-muted-foreground">
								Get instant style advice and fashion tips from
								our AI assistant
							</p>
						</div>

						<Card className="card-fashion max-w-2xl mx-auto">
							<CardContent className="p-8">
								<div className="flex items-center justify-center mb-6">
									<div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
										<Bot className="w-8 h-8 text-primary" />
									</div>
								</div>
								<h3 className="text-xl font-semibold mb-4">
									Always Ready to Help
								</h3>
								<p className="text-muted-foreground mb-6 leading-relaxed">
									Our fashion bot is available 24/7 to answer
									your style questions, provide outfit
									suggestions, and help you make confident
									fashion choices. Look for the bot icon in
									the bottom right corner!
								</p>
								<div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
									<div className="flex items-center gap-2">
										<Sparkles className="w-4 h-4 text-accent" />
										<span>Style Tips</span>
									</div>
									<div className="flex items-center gap-2">
										<Palette className="w-4 h-4 text-accent" />
										<span>Color Advice</span>
									</div>
									<div className="flex items-center gap-2">
										<TrendingUp className="w-4 h-4 text-accent" />
										<span>Trend Updates</span>
									</div>
								</div>
							</CardContent>
						</Card>
					</div>
				</div>
			</section>

			{/* Features Section */}
			<section className="py-20">
				<div className="container mx-auto px-4">
					<div className="text-center mb-16 animate-fade-up">
						<h2 className="text-4xl font-bold mb-4">
							Powerful Features for Perfect Style
						</h2>
						<p className="text-xl text-muted-foreground max-w-2xl mx-auto">
							Everything you need to analyze, understand, and
							improve your fashion choices
						</p>
					</div>

					<div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
						{features.map((feature, index) => (
							<Card
								key={index}
								className="card-fashion group hover:shadow-fashion transition-all duration-300"
							>
								<CardHeader>
									<div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center text-primary mb-4 group-hover:scale-110 transition-transform duration-200">
										{feature.icon}
									</div>
									<CardTitle className="text-xl">
										{feature.title}
									</CardTitle>
								</CardHeader>
								<CardContent>
									<p className="text-muted-foreground mb-4">
										{feature.description}
									</p>
									<Button
										variant="ghost"
										className="group-hover:text-primary"
										asChild
									>
										<Link to={feature.href}>
											Try Now{" "}
											<ArrowRight className="ml-2 w-4 h-4" />
										</Link>
									</Button>
								</CardContent>
							</Card>
						))}
					</div>
				</div>
			</section>

			{/* Wardrobe Analysis Section */}
			<section className="py-20 bg-gradient-secondary/50">
				<div className="container mx-auto px-4">
					<div className="text-center mb-16">
						<h2 className="text-4xl font-bold mb-4">
							Full Wardrobe Analysis
						</h2>
						<p className="text-xl text-muted-foreground max-w-2xl mx-auto">
							Comprehensive analysis of your entire wardrobe based
							on current trends and personal preferences
						</p>
					</div>

					<div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
						<Card className="card-fashion group hover:shadow-fashion transition-all duration-300">
							<CardHeader>
								<div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center text-primary mb-4 group-hover:scale-110 transition-transform duration-200">
									<Shirt className="w-6 h-6" />
								</div>
								<CardTitle className="text-lg">
									Wardrobe Insights
								</CardTitle>
							</CardHeader>
							<CardContent>
								<p className="text-muted-foreground">
									AI-powered analysis of your clothing
									collection with trend alignment and style
									coherence scores
								</p>
							</CardContent>
						</Card>

						<Card className="card-fashion group hover:shadow-fashion transition-all duration-300">
							<CardHeader>
								<div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center text-primary mb-4 group-hover:scale-110 transition-transform duration-200">
									<Palette className="w-6 h-6" />
								</div>
								<CardTitle className="text-lg">
									Style Preferences
								</CardTitle>
							</CardHeader>
							<CardContent>
								<p className="text-muted-foreground">
									Personalized recommendations based on your
									unique style preferences and color palette
								</p>
							</CardContent>
						</Card>

						<Card className="card-fashion group hover:shadow-fashion transition-all duration-300">
							<CardHeader>
								<div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center text-primary mb-4 group-hover:scale-110 transition-transform duration-200">
									<BarChart3 className="w-6 h-6" />
								</div>
								<CardTitle className="text-lg">
									Trend Analysis
								</CardTitle>
							</CardHeader>
							<CardContent>
								<p className="text-muted-foreground">
									Stay ahead with real-time fashion trend
									analysis and wardrobe optimization
									suggestions
								</p>
							</CardContent>
						</Card>
					</div>
				</div>
			</section>

			{/* Fashion Scheduling Section */}
			<section className="py-20">
				<div className="container mx-auto px-4">
					<div className="text-center mb-16">
						<h2 className="text-4xl font-bold mb-4">
							Smart Fashion Scheduling
						</h2>
						<p className="text-xl text-muted-foreground max-w-2xl mx-auto">
							Get personalized outfit recommendations for
							different events based on your wardrobe items
						</p>
					</div>

					<div className="grid lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
						<div className="space-y-6">
							<div className="flex items-start space-x-4">
								<div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary flex-shrink-0">
									<Target className="w-5 h-5" />
								</div>
								<div>
									<h3 className="text-lg font-semibold mb-2">
										Event-Based Styling
									</h3>
									<p className="text-muted-foreground">
										Get outfit suggestions tailored for work
										meetings, casual outings, formal events,
										and special occasions
									</p>
								</div>
							</div>

							<div className="flex items-start space-x-4">
								<div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary flex-shrink-0">
									<Clock className="w-5 h-5" />
								</div>
								<div>
									<h3 className="text-lg font-semibold mb-2">
										Weekly Planning
									</h3>
									<p className="text-muted-foreground">
										Plan your outfits for the entire week
										with smart recommendations that avoid
										repetition
									</p>
								</div>
							</div>

							<div className="flex items-start space-x-4">
								<div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary flex-shrink-0">
									<Sparkles className="w-5 h-5" />
								</div>
								<div>
									<h3 className="text-lg font-semibold mb-2">
										Smart Combinations
									</h3>
									<p className="text-muted-foreground">
										Discover new outfit combinations from
										your existing wardrobe items
									</p>
								</div>
							</div>
						</div>

						<div className="grid grid-cols-2 gap-4">
							<Card className="p-4 text-center">
								<div className="text-2xl font-bold text-primary">
									85%
								</div>
								<div className="text-sm text-muted-foreground">
									Outfit Satisfaction
								</div>
							</Card>
							<Card className="p-4 text-center">
								<div className="text-2xl font-bold text-primary">
									7+
								</div>
								<div className="text-sm text-muted-foreground">
									Days Planned
								</div>
							</Card>
							<Card className="p-4 text-center">
								<div className="text-2xl font-bold text-primary">
									50+
								</div>
								<div className="text-sm text-muted-foreground">
									New Combinations
								</div>
							</Card>
							<Card className="p-4 text-center">
								<div className="text-2xl font-bold text-primary">
									100%
								</div>
								<div className="text-sm text-muted-foreground">
									Event Matched
								</div>
							</Card>
						</div>
					</div>
				</div>
			</section>

			{/* Calendar Integration Section */}
			<section className="py-20 bg-gradient-secondary/30">
				<div className="container mx-auto px-4">
					<div className="text-center mb-16">
						<h2 className="text-4xl font-bold mb-4">
							Calendar Integration
						</h2>
						<p className="text-xl text-muted-foreground max-w-2xl mx-auto">
							Seamlessly sync with your calendar to plan perfect
							outfits for every scheduled event
						</p>
					</div>

					<div className="max-w-4xl mx-auto">
						<Card className="p-8 card-fashion">
							<div className="grid md:grid-cols-2 gap-8 items-center">
								<div className="space-y-6">
									<div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center">
										<Calendar className="w-8 h-8 text-white" />
									</div>
									<div>
										<h3 className="text-2xl font-bold mb-4">
											Never Miss a Style Beat
										</h3>
										<p className="text-muted-foreground mb-6">
											Connect your calendar and let AI
											automatically suggest appropriate
											outfits for each event, meeting, or
											occasion.
										</p>
										<Button
											className="btn-gradient"
											asChild
										>
											<Link to="/calendar-connect">
												Connect Calendar
												<ArrowRight className="ml-2 w-4 h-4" />
											</Link>
										</Button>
									</div>
								</div>

								<div className="space-y-4">
									<Card className="p-4 border-l-4 border-l-primary/50">
										<div className="flex items-center justify-between">
											<div>
												<h4 className="font-semibold">
													Team Meeting
												</h4>
												<p className="text-sm text-muted-foreground">
													Today, 2:00 PM
												</p>
											</div>
											<Badge variant="secondary">
												Business Casual
											</Badge>
										</div>
									</Card>

									<Card className="p-4 border-l-4 border-l-accent/50">
										<div className="flex items-center justify-between">
											<div>
												<h4 className="font-semibold">
													Dinner Date
												</h4>
												<p className="text-sm text-muted-foreground">
													Friday, 7:00 PM
												</p>
											</div>
											<Badge variant="secondary">
												Smart Casual
											</Badge>
										</div>
									</Card>

									<Card className="p-4 border-l-4 border-l-primary/30">
										<div className="flex items-center justify-between">
											<div>
												<h4 className="font-semibold">
													Weekend Brunch
												</h4>
												<p className="text-sm text-muted-foreground">
													Saturday, 11:00 AM
												</p>
											</div>
											<Badge variant="secondary">
												Casual
											</Badge>
										</div>
									</Card>
								</div>
							</div>
						</Card>
					</div>
				</div>
			</section>

			{/* Leaderboards Section */}
			<section className="py-20 bg-gradient-secondary">
				<div className="container mx-auto px-4">
					<div className="text-center mb-16">
						<h2 className="text-4xl font-bold mb-4">
							Community Champions
						</h2>
						<p className="text-xl text-muted-foreground">
							Celebrate our top fashion enthusiasts and style
							icons
						</p>
					</div>

					<div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
						{/* Analysis Leaderboard */}
						<div>
							{leaderboardData?.success && (
								<Leaderboard
									users={leaderboardData.data.leaderboard.slice(
										0,
										5
									)}
									title="Top Analyzers"
								/>
							)}
						</div>

						{/* Fashion Icon */}
						<div>
							{fashionIconData?.success && (
								<FashionIconCard
									icon={fashionIconData.data.fashion_icon}
								/>
							)}
						</div>
					</div>
				</div>
			</section>

			{/* How It Works */}
			<section className="py-20">
				<div className="container mx-auto px-4">
					<div className="text-center mb-16">
						<h2 className="text-4xl font-bold mb-4">
							How Closetic AI Works
						</h2>
						<p className="text-xl text-muted-foreground">
							Simple steps to perfect style
						</p>
					</div>

					<div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
						{[
							{
								step: "1",
								title: "Upload or Capture",
								description:
									"Take a photo or upload an image of your outfit",
							},
							{
								step: "2",
								title: "AI Analysis",
								description:
									"Our AI analyzes colors, style, and overall coherence",
							},
							{
								step: "3",
								title: "Get Insights",
								description:
									"Receive personalized recommendations and style tips",
							},
						].map((step, index) => (
							<div key={index} className="text-center space-y-4">
								<div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center text-white text-xl font-bold mx-auto">
									{step.step}
								</div>
								<h3 className="text-xl font-semibold">
									{step.title}
								</h3>
								<p className="text-muted-foreground">
									{step.description}
								</p>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* CTA Section */}
			<section className="py-20 bg-gradient-to-r from-primary to-accent text-white">
				<div className="container mx-auto px-4 text-center">
					<div className="max-w-3xl mx-auto space-y-8">
						<h2 className="text-4xl font-bold">
							Ready to Transform Your Style?
						</h2>
						<p className="text-xl opacity-90">
							Join thousands of users who have elevated their
							fashion game with Closetic AI
						</p>
						<div className="flex flex-col sm:flex-row gap-4 justify-center">
							<Button
								size="lg"
								variant="secondary"
								className="text-lg px-8 py-4"
								asChild
							>
								<Link to="/register">
									Get Started Free
									<ArrowRight className="ml-2 w-5 h-5" />
								</Link>
							</Button>
							<Button
								size="lg"
								variant="outline"
								className="text-lg px-8 py-4 border-white text-white bg-transparent hover:bg-primary hover:text-white transition-colors"
								asChild
							>
								<Link to="/upload">Try Demo</Link>
							</Button>
						</div>

						{/* Pricing summary, feature cards, and sales contact for all tiers */}
						<div className="mt-6 flex flex-col items-center justify-center gap-6 text-sm text-white">
							{Object.keys(pricingTiers).length > 0 ? (
								<>
									<div className="text-center">
										<div className="font-semibold text-lg mb-2">
											Our Plans
										</div>
										{recommendedTier && (
											<div className="text-sm opacity-90 mb-2">
												<span className="font-bold">
													Recommended:
												</span>{" "}
												{recommendedTier
													.charAt(0)
													.toUpperCase() +
													recommendedTier.slice(1)}
											</div>
										)}
									</div>
									<div className="w-full flex flex-wrap justify-center gap-6">
										{Object.entries(pricingTiers).map(
											([key, tier], idx) => (
												<Card
													key={tier.name}
													className={`bg-white/10 border-white/20 text-white w-80 ${
														tier.name ===
														recommendedTier
															? "ring-2 ring-accent"
															: ""
													}`}
												>
													<CardHeader>
														<CardTitle className="flex items-center gap-2 text-2xl">
															{tier.name
																.charAt(0)
																.toUpperCase() +
																tier.name.slice(
																	1
																)}
															{tier.name ===
																recommendedTier && (
																<Badge className="ml-2 bg-accent/20 text-accent border-accent/30 uppercase tracking-wide">
																	Recommended
																</Badge>
															)}
														</CardTitle>
														<div className="mt-2 text-3xl font-bold">
															$
															{tier.price_monthly.toFixed(
																2
															)}
															<span className="text-base font-normal opacity-80 ml-1">
																/mo
															</span>
														</div>
													</CardHeader>
													<CardContent>
														<ul className="space-y-2 text-left">
															{Object.entries(
																tier
															).map(
																([
																	key,
																	value,
																]) => {
																	// Format key for display
																	const label =
																		key
																			.replace(
																				/_/g,
																				" "
																			)
																			.replace(
																				/\b\w/g,
																				(
																					l
																				) =>
																					l.toUpperCase()
																			);
																	let display: React.ReactNode;
																	if (
																		typeof value ===
																		"boolean"
																	) {
																		display =
																			value ? (
																				<span className="text-green-400 font-bold ml-2">
																					✔
																				</span>
																			) : (
																				<span className="text-red-400 font-bold ml-2">
																					✖
																				</span>
																			);
																	} else if (
																		typeof value ===
																			"number" ||
																		typeof value ===
																			"string"
																	) {
																		display =
																			(
																				<span className="ml-2 font-semibold">
																					{String(
																						value
																					)}
																				</span>
																			);
																	} else {
																		display =
																			null;
																	}
																	return (
																		<li
																			key={
																				key
																			}
																			className="flex items-center justify-between border-b border-white/10 py-1 last:border-b-0"
																		>
																			<span>
																				{
																					label
																				}
																			</span>
																			{
																				display
																			}
																		</li>
																	);
																}
															)}
														</ul>
													</CardContent>
												</Card>
											)
										)}
									</div>
									<Button
										size="lg"
										variant="outline"
										className="text-lg px-6 py-3 mt-2 border-white text-white bg-transparent hover:bg-primary hover:text-white transition-colors"
										asChild
									>
										<a
											href={`mailto:sales@closetic.ai?subject=${encodeURIComponent(
												"Closetic AI - Pricing Inquiry"
											)}&body=${encodeURIComponent(
												`Hello Sales Team,%0D%0A%0D%0AI'd like to discuss pricing and features. Please provide more details about your plans and onboarding.%0D%0A%0D%0AThanks.`
											)}`}
										>
											Talk to Sales
										</a>
									</Button>
								</>
							) : (
								<div className="text-center opacity-90">
									Pricing information unavailable
								</div>
							)}
						</div>
					</div>
				</div>
			</section>

			{/* Footer */}
			<footer className="py-12 border-t border-border">
				<div className="container mx-auto px-4">
					<div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
						<div className="flex items-center space-x-2">
							<div className="w-8 h-8 rounded-lg overflow-hidden">
								<img
									src={logoImage}
									alt="Closetic AI Logo"
									className="w-full h-full object-cover"
								/>
							</div>
							<span className="text-xl font-bold text-gradient">
								Closetic AI
							</span>
						</div>
						<div className="flex items-center space-x-8 text-sm text-muted-foreground">
							<a
								href="/privacy-policy"
								className="hover:text-primary transition-colors"
							>
								Privacy
							</a>
							<a
								href="/terms-of-service"
								className="hover:text-primary transition-colors"
							>
								Terms
							</a>
							<a
								href="#"
								className="hover:text-primary transition-colors"
							>
								Support
							</a>
						</div>
						<div className="flex items-center space-x-4">
							<Shield className="w-4 h-4 text-muted-foreground" />
							<span className="text-sm text-muted-foreground">
								Secure & Private
							</span>
						</div>
					</div>
				</div>
			</footer>
		</div>
	);
};

export default Index;
