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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Navbar } from "@/components/navigation/navbar";
import heroImage from "@/assets/hero-fashion.jpg";

import AOS from "aos";
import "aos/dist/aos.css";
import { useEffect } from "react";

const Index = () => {
	useEffect(() => {
		AOS.init({
			duration: 1000,
			once: true,
		});
	}, []);
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

			{/* How It Works */}
			<section className="py-20 bg-gradient-secondary">
				<div className="container mx-auto px-4">
					<div className="text-center mb-16">
						<h2 className="text-4xl font-bold mb-4">
							How FashCheck Works
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
							fashion game with FashCheck
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
								className="text-lg px-8 py-4 border-white text-white hover:bg-white hover:text-primary"
								asChild
							>
								<Link to="/upload">Try Demo</Link>
							</Button>
						</div>
					</div>
				</div>
			</section>

			{/* Footer */}
			<footer className="py-12 border-t border-border">
				<div className="container mx-auto px-4">
					<div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
						<div className="flex items-center space-x-2">
							<div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
								<span className="text-white font-bold text-sm">
									FC
								</span>
							</div>
							<span className="text-xl font-bold text-gradient">
								FashCheck
							</span>
						</div>
						<div className="flex items-center space-x-8 text-sm text-muted-foreground">
							<a
								href="#"
								className="hover:text-primary transition-colors"
							>
								Privacy
							</a>
							<a
								href="#"
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
