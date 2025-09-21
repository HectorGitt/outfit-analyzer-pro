import React from "react";
import { useNavigate } from "react-router-dom";
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
	const recommendedTier = "elite";
	const { user, isAuthenticated } = useAuthStore();

	// Handle pricing tier selection
	const handlePricingSelect = (tierKey: string, tier: any) => {
		// Check if user is authenticated for paid plans
		if (tier.price_monthly > 0 && !isAuthenticated) {
			// Redirect to login with return URL
			const currentPath = window.location.pathname;
			const loginUrl = `/login?next=${encodeURIComponent(currentPath)}`;
			window.location.href = loginUrl;
			return;
		}

		if (tier.price_monthly === 0) {
			// Free tier - redirect to upload
			window.location.href = "/upload";
			return;
		}

		// Paid tier - redirect to billing page with plan parameter
		navigate(`/billing?plan=${tierKey.toLowerCase()}`);
	};

	const getTierIcon = (tierName: string) => {
		switch (tierName.toLowerCase()) {
			case "free":
				return <Star className="w-6 h-6" />;
			case "spotlight":
				return <TrendingUp className="w-6 h-6" />;
			case "elite":
				return <Crown className="w-6 h-6" />;
			case "icon":
				return <Sparkles className="w-6 h-6" />;
			default:
				return <Star className="w-6 h-6" />;
		}
	};

	const formatFeatureName = (key: string) => {
		return key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
	};

	const renderFeatureValue = (value: any) => {
		if (typeof value === "boolean") {
			return value ? (
				<Check className="w-4 h-4 text-green-500" />
			) : (
				<X className="w-4 h-4 text-red-500" />
			);
		}
		return <span className="font-semibold">{String(value)}</span>;
	};

	return (
		<div className="min-h-screen bg-background">
			<Navbar />

			{/* Hero Section */}
			<section className="relative py-20 bg-gradient-hero overflow-hidden">
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
			<section className="py-20 -mt-16 relative z-10">
				<div className="container mx-auto px-4">
					<div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
						{Object.entries(pricingTiers).map(
							([key, tier], index) => (
								<Card
									key={key}
									className={`card-fashion group hover:shadow-fashion transition-all duration-300 relative ${
										tier.name.toLowerCase() ===
										recommendedTier
											? "ring-2 ring-accent shadow-fashion scale-105"
											: ""
									}`}
								>
									{tier.name.toLowerCase() ===
										recommendedTier && (
										<div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
											<Badge className="bg-accent text-white px-4 py-1">
												Most Popular
											</Badge>
										</div>
									)}

									<CardHeader className="text-center pb-4">
										<div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center text-primary mb-4 mx-auto group-hover:scale-110 transition-transform duration-200">
											{getTierIcon(tier.name)}
										</div>
										<CardTitle className="text-2xl font-bold mb-2">
											{tier.name}
										</CardTitle>
										<div className="space-y-1">
											<div className="text-3xl font-bold text-primary">
												${tier.price_monthly.toFixed(2)}
											</div>
											<div className="text-sm text-muted-foreground">
												per month
											</div>
										</div>
									</CardHeader>

									<CardContent className="space-y-4">
										<div className="space-y-3">
											{Object.entries(tier)
												.filter(
													([k]) =>
														k !== "name" &&
														k !== "price_monthly"
												)
												.map(([key, value]) => (
													<div
														key={key}
														className="flex items-center justify-between py-2 border-b border-border/50 last:border-b-0"
													>
														<span className="text-sm text-muted-foreground">
															{formatFeatureName(
																key
															)}
														</span>
														{renderFeatureValue(
															value
														)}
													</div>
												))}
										</div>

										<Button
											className={`w-full mt-6 ${
												tier.name.toLowerCase() ===
												recommendedTier
													? "btn-gradient"
													: "bg-primary hover:bg-primary/90"
											}`}
											onClick={() =>
												handlePricingSelect(key, tier)
											}
										>
											{tier.price_monthly === 0 ? (
												<>
													Get Started Free
													<ArrowRight className="ml-2 w-4 h-4" />
												</>
											) : (
												<>
													{isAuthenticated
														? "Choose Plan"
														: "Sign In to Choose"}
													<ArrowRight className="ml-2 w-4 h-4" />
												</>
											)}
										</Button>
									</CardContent>
								</Card>
							)
						)}
					</div>
				</div>
			</section>

			{/* Features Comparison */}
			<section className="py-20 bg-gradient-secondary/30">
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

			{/* CTA Section */}
			<section className="py-20 bg-gradient-to-r from-primary to-accent text-white">
				<div className="container mx-auto px-4 text-center">
					<div className="max-w-3xl mx-auto space-y-8">
						<h2 className="text-4xl font-bold">
							Ready to Elevate Your Style?
						</h2>
						<p className="text-xl opacity-90">
							Start your fashion transformation journey today with
							our AI-powered analysis
						</p>
						<div className="flex flex-col sm:flex-row gap-4 justify-center">
							<Button
								size="lg"
								variant="secondary"
								className="text-lg px-8 py-4"
								onClick={() =>
									(window.location.href = "/upload")
								}
							>
								Get Started Free
								<ArrowRight className="ml-2 w-5 h-5" />
							</Button>
							<Button
								size="lg"
								variant="outline"
								className="text-lg px-8 py-4 border-white text-white bg-transparent hover:bg-primary hover:text-white transition-colors"
								onClick={() => {
									if (!isAuthenticated) {
										const currentPath =
											window.location.pathname;
										const loginUrl = `/login?next=${encodeURIComponent(
											currentPath
										)}`;
										window.location.href = loginUrl;
									} else {
										navigate("/billing?plan=elite");
									}
								}}
							>
								{isAuthenticated
									? "Choose Elite Plan"
									: "Sign In to Get Started"}
							</Button>
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
