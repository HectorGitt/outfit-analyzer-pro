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
	User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Navbar } from "@/components/navigation/navbar";
import Footer from "@/components/ui/Footer";

import AOS from "aos";
import "aos/dist/aos.css";
import { useEffect } from "react";

const PersonalizedAI = () => {
	useEffect(() => {
		AOS.init({
			duration: 1000,
			once: true,
		});
	}, []);

	return (
		<div
			className="min-h-screen bg-background overflow-x-hidden"
			data-aos="fade-in"
		>
			<Navbar />

			{/* AI Model Marketplace Section */}
			<section className="py-24 bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-emerald-950/20 dark:via-teal-950/20 dark:to-cyan-950/20">
				<div className="container mx-auto px-4">
					<div className="text-center mb-20">
						<Badge className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-0 px-6 py-3 text-lg font-semibold shadow-lg mb-6">
							<TrendingUp className="w-5 h-5 mr-2" />
							AI Model Marketplace
						</Badge>
						<h2 className="text-4xl lg:text-6xl font-bold mb-6">
							Share Your Style Expertise & Earn
						</h2>
						<p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
							Transform your unique fashion sense into a
							subscription-based AI model. Share your trained AI
							with fashion enthusiasts worldwide and earn from
							your style expertise.
						</p>
					</div>

					<div className="grid lg:grid-cols-2 gap-16 items-center max-w-7xl mx-auto mb-20">
						{/* Left Side - Creator Journey */}
						<div className="space-y-12">
							{/* Become a Creator */}
							<div className="flex items-start space-x-6 group">
								<div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center text-white flex-shrink-0 shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
									<Star className="w-8 h-8" />
								</div>
								<div className="space-y-3">
									<h3 className="text-3xl font-bold text-gray-900 dark:text-white">
										Become a Style Creator
									</h3>
									<p className="text-lg text-muted-foreground leading-relaxed">
										Creators register for the marketplace
										program and receive a dedicated AI model
										to train with their unique style
										preferences. Submit your favorite
										outfits, provide detailed feedback on
										the model's recommendations, and watch
										your AI learn your fashion sense. Once
										your model achieves expert-level
										accuracy, share it with the community
										and start earning from subscriptions.
									</p>
									<div className="flex flex-wrap gap-2">
										<Badge
											variant="secondary"
											className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200"
										>
											Expert Models Only
										</Badge>
										<Badge
											variant="secondary"
											className="bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200"
										>
											Quality Verified
										</Badge>
										<Badge
											variant="secondary"
											className="bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200"
										>
											Community Voted
										</Badge>
									</div>
								</div>
							</div>

							{/* Subscription Model */}
							<div className="flex items-start space-x-6 group">
								<div className="w-16 h-16 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-2xl flex items-center justify-center text-white flex-shrink-0 shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
									<Users className="w-8 h-8" />
								</div>
								<div className="space-y-3">
									<h3 className="text-3xl font-bold text-gray-900 dark:text-white">
										Subscription-Based Access
									</h3>
									<p className="text-lg text-muted-foreground leading-relaxed">
										Subscribers pay a monthly fee to access
										your AI model's recommendations. Set
										your own pricing based on your style's
										popularity and uniqueness. Earn passive
										income from your fashion expertise.
									</p>
									<div className="bg-gradient-to-r from-teal-100 to-cyan-100 dark:from-teal-900/20 dark:to-cyan-900/20 p-4 rounded-xl border border-teal-200 dark:border-teal-800">
										<p className="text-sm font-medium text-teal-800 dark:text-teal-200">
											💰 "Top creators can earn
											$5000-15000/month from style
											subscriptions"
										</p>
									</div>
								</div>
							</div>

							{/* Revenue Sharing */}
							<div className="flex items-start space-x-6 group">
								<div className="w-16 h-16 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl flex items-center justify-center text-white flex-shrink-0 shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
									<BarChart3 className="w-8 h-8" />
								</div>
								<div className="space-y-3">
									<h3 className="text-3xl font-bold text-gray-900 dark:text-white">
										Fair Revenue Sharing
									</h3>
									<p className="text-lg text-muted-foreground leading-relaxed">
										We take a small platform fee (25%) and
										you keep 75% of all subscription
										revenue. Creators also earn bonuses for
										high subscriber retention and model
										performance ratings.
									</p>
									<div className="grid grid-cols-2 gap-3">
										<div className="bg-white/60 dark:bg-gray-800/60 p-4 rounded-xl border border-white/20">
											<div className="text-2xl font-bold text-cyan-600 mb-1">
												75%
											</div>
											<div className="text-sm text-muted-foreground">
												Creator Earnings
											</div>
										</div>
										<div className="bg-white/60 dark:bg-gray-800/60 p-4 rounded-xl border border-white/20">
											<div className="text-2xl font-bold text-teal-600 mb-1">
												25%
											</div>
											<div className="text-sm text-muted-foreground">
												Platform Fee
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>

						{/* Right Side - Marketplace Demo */}
						<div className="space-y-8">
							<Card className="card-fashion p-8 bg-gradient-to-br from-white to-emerald-50/50 dark:from-gray-800 dark:to-emerald-950/20 border-0 shadow-2xl">
								<div className="text-center mb-8">
									<div className="w-20 h-20 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
										<TrendingUp className="w-10 h-10 text-white" />
									</div>
									<h3 className="text-3xl font-bold mb-3">
										Style Creator Dashboard
									</h3>
									<p className="text-muted-foreground text-lg">
										Track your model's performance and
										earnings
									</p>
								</div>

								{/* Creator Stats */}
								<div className="space-y-4 mb-8">
									{/* Subscribers */}
									<Card className="p-4 border-l-4 border-l-emerald-500 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20">
										<div className="flex items-center justify-between">
											<div className="flex items-center gap-3">
												<div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center text-white font-bold">
													S
												</div>
												<div>
													<h4 className="font-semibold">
														Active Subscribers
													</h4>
													<p className="text-sm text-muted-foreground">
														Monthly recurring
													</p>
												</div>
											</div>
											<div className="text-right">
												<div className="text-lg font-bold text-emerald-600">
													247
												</div>
												<div className="text-sm text-muted-foreground">
													+12% this month
												</div>
											</div>
										</div>
									</Card>

									{/* Monthly Revenue */}
									<Card className="p-4 border-l-4 border-l-teal-500 bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-950/20 dark:to-cyan-950/20">
										<div className="flex items-center justify-between">
											<div className="flex items-center gap-3">
												<div className="w-10 h-10 bg-teal-500 rounded-lg flex items-center justify-center text-white font-bold">
													$
												</div>
												<div>
													<h4 className="font-semibold">
														Monthly Revenue
													</h4>
													<p className="text-sm text-muted-foreground">
														After platform fees
													</p>
												</div>
											</div>
											<div className="text-right">
												<div className="text-lg font-bold text-teal-600">
													$1,847
												</div>
												<div className="text-sm text-muted-foreground">
													+8% from last month
												</div>
											</div>
										</div>
									</Card>

									{/* Model Rating */}
									<Card className="p-4 border-l-4 border-l-cyan-500 bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-950/20 dark:to-blue-950/20">
										<div className="flex items-center justify-between">
											<div className="flex items-center gap-3">
												<div className="w-10 h-10 bg-cyan-500 rounded-lg flex items-center justify-center text-white font-bold">
													★
												</div>
												<div>
													<h4 className="font-semibold">
														Model Rating
													</h4>
													<p className="text-sm text-muted-foreground">
														User satisfaction
													</p>
												</div>
											</div>
											<div className="text-right">
												<div className="text-lg font-bold text-cyan-600">
													4.9/5
												</div>
												<div className="text-sm text-muted-foreground">
													From 1,203 reviews
												</div>
											</div>
										</div>
									</Card>
								</div>

								{/* Creator Insights */}
								<div className="bg-gradient-to-r from-emerald-100 to-teal-100 dark:from-emerald-900/20 dark:to-teal-900/20 p-4 rounded-xl border border-emerald-200 dark:border-emerald-800">
									<div className="flex items-center gap-3 mb-3">
										<TrendingUp className="w-5 h-5 text-emerald-600" />
										<span className="font-semibold text-emerald-800 dark:text-emerald-200">
											Creator Performance Insights
										</span>
									</div>
									<p className="text-sm text-emerald-700 dark:text-emerald-300">
										"Your 'Urban Minimalist' style model is
										trending! 47 new subscribers this week.
										Subscribers love your consistent
										recommendations for professional
										attire."
									</p>
								</div>
							</Card>
						</div>
					</div>

					{/* CTA Section */}
					<div className="text-center">
						<div className="max-w-3xl mx-auto space-y-8">
							<div className="space-y-4">
								<h3 className="text-3xl lg:text-4xl font-bold">
									Turn Your Style Into Income
								</h3>
								<p className="text-xl text-muted-foreground">
									Join our creator community and start earning
									from your fashion expertise. Build your
									personal brand while helping others discover
									their perfect style.
								</p>
							</div>

							<div className="flex flex-col sm:flex-row gap-6 justify-center">
								<Button
									className="btn-gradient text-lg px-10 py-6 shadow-xl hover:shadow-2xl transition-all duration-300"
									size="lg"
									asChild
								>
									<Link to="/profile">
										Become a Creator
										<ArrowRight className="ml-3 w-5 h-5" />
									</Link>
								</Button>
								<Button
									variant="outline"
									className="text-lg px-10 py-6 border-2 hover:bg-primary hover:text-white transition-all duration-300"
									size="lg"
									asChild
								>
									<Link to="/personalized-ai">
										<TrendingUp className="mr-3 w-5 h-5" />
										Explore Marketplace
									</Link>
								</Button>
							</div>

							<div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
								<p className="text-muted-foreground">
									💎 Expert models only • 85% revenue share •
									No upfront costs • Start earning immediately
								</p>
							</div>
						</div>
					</div>
				</div>
			</section>

			<Footer />
		</div>
	);
};

export default PersonalizedAI;
