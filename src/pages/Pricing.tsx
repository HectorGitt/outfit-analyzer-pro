import React from "react";
import { useNavigate, Link } from "react-router-dom";
import { Navbar } from "@/components/navigation/navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
	Camera,
	Upload,
	Sparkles,
	Star,
	Zap,
	Shield,
	Check,
	X,
	ArrowRight,
	Crown,
	TrendingUp,
} from "lucide-react";
import { pricingTiers } from "@/lib/pricingTiers";
import Footer from "@/components/ui/Footer";
import { useAuthStore } from "@/stores/authStore";

const Pricing = () => {
	const navigate = useNavigate();
	const { user, isAuthenticated } = useAuthStore();

	return (
		<div className="min-h-screen bg-background pt-16">
			<Navbar />

			{/* Hero Section */}
			<section className="relative py-20 bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-950/20 overflow-hidden">
				<div className="container mx-auto px-4">
					<div className="text-center max-w-4xl mx-auto">
						<div className="space-y-6">
							<Badge className="bg-primary/10 text-primary border-primary/20">
								<Sparkles className="w-3 h-3 mr-1" />
								Choose Your Plan
							</Badge>
							<h1 className="text-5xl lg:text-6xl font-bold leading-tight">
								Pricing Plans for{" "}
								<span className="text-gradient">
									Every Fashionista
								</span>
							</h1>
							<p className="text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
								Unlock your style potential with our AI-powered
								fashion analysis. Choose the perfect plan for
								your fashion journey.
							</p>
						</div>
					</div>
				</div>
			</section>

			{/* Pricing Cards */}
			<section className="py-20 -mt-16 relative z-10 bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-950/20">
				<div className="container mx-auto px-4 max-w-full overflow-hidden">
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
											{pricingTiers.calendar_integration}{" "}
											Calendar integration
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
											AI Styling Advice
										</span>
									</li>
								</ul>
								<Button
									className="w-full py-6 text-lg font-semibold bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg hover:shadow-xl transition-all duration-300"
									asChild
								>
									<Link to="/upload">
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
													.agent_calls_minutes
											}{" "}
											Agent calls minutes
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
									<Link
										to={`/billing?plan=${pricingTiers.spotlight.name}`}
									>
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
									<Crown className="w-8 h-8 text-white" />
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
													.agent_calls_minutes
											}{" "}
											Agent calls minutes
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
									<Link
										to={`/billing?plan=${pricingTiers.elite.name}`}
									>
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
									<Sparkles className="w-8 h-8 text-white" />
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
											{
												pricingTiers.icon
													.agent_calls_minutes
											}{" "}
											Agent calls minutes
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
									<Link
										to={`/billing?plan=${pricingTiers.icon.name}`}
									>
										Become an {pricingTiers.icon.name}
										<ArrowRight className="ml-2 w-5 h-5" />
									</Link>
								</Button>
							</CardContent>
						</Card>
					</div>
				</div>
			</section>

			{/* Features Comparison */}
			<section className="py-20 bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-950/20">
				<div className="container mx-auto px-4">
					<div className="text-center mb-16">
						<h2 className="text-4xl font-bold mb-4">
							Why Choose Our Plans?
						</h2>
						<p className="text-xl text-muted-foreground max-w-2xl mx-auto">
							Get the most out of your fashion analysis with our
							comprehensive features
						</p>
					</div>

					<div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
						<div className="text-center space-y-4">
							<div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary mx-auto">
								<Camera className="w-8 h-8" />
							</div>
							<h3 className="text-xl font-semibold">
								Advanced AI Analysis
							</h3>
							<p className="text-muted-foreground">
								State-of-the-art AI technology for accurate
								fashion insights and recommendations
							</p>
						</div>

						<div className="text-center space-y-4">
							<div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary mx-auto">
								<Shield className="w-8 h-8" />
							</div>
							<h3 className="text-xl font-semibold">
								Secure & Private
							</h3>
							<p className="text-muted-foreground">
								Your fashion data is protected with
								enterprise-grade security and privacy measures
							</p>
						</div>

						<div className="text-center space-y-4">
							<div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary mx-auto">
								<Zap className="w-8 h-8" />
							</div>
							<h3 className="text-xl font-semibold">
								Lightning Fast
							</h3>
							<p className="text-muted-foreground">
								Get instant results with our optimized AI
								processing and real-time analysis
							</p>
						</div>
					</div>
				</div>
			</section>
			{/* Footer */}
			<Footer />
		</div>
	);
};

export default Pricing;
