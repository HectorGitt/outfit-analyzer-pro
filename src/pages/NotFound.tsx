import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import {
	Home,
	Search,
	Sparkles,
	ArrowRight,
	Shirt,
	Palette,
	TrendingUp,
	Heart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Navbar } from "@/components/navigation/navbar";

const NotFound = () => {
	const location = useLocation();

	useEffect(() => {
		console.error(
			"404 Error: User attempted to access non-existent route:",
			location.pathname
		);
	}, [location.pathname]);

	return (
		<div className="min-h-screen bg-background">
			<Navbar />

			{/* Hero Section */}
			<section className="relative min-h-screen flex items-center justify-center bg-gradient-hero overflow-hidden">
				<div className="container mx-auto px-4">
					<div className="max-w-4xl mx-auto text-center">
						{/* 404 Number with Gradient */}
						<div className="relative mb-8">
							<div className="text-8xl lg:text-9xl font-bold text-gradient opacity-20 absolute inset-0 blur-sm">
								404
							</div>
							<h1 className="text-8xl lg:text-9xl font-bold text-gradient relative z-10">
								404
							</h1>
						</div>

						{/* Badge */}
						<Badge className="bg-primary/10 text-primary border-primary/20 mb-6 text-sm px-4 py-2">
							<Search className="w-4 h-4 mr-2" />
							Page Not Found
						</Badge>

						{/* Main Content */}
						<div className="space-y-6 mb-12">
							<h2 className="text-4xl lg:text-5xl font-bold">
								Oops! This page doesn't exist
							</h2>
							<p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
								The page you're looking for seems to have gone
								out of style. Don't worry, let's get you back to
								looking fabulous!
							</p>
						</div>

						{/* CTA Buttons */}
						<div className="flex flex-col sm:flex-row gap-4 justify-center">
							<Button
								size="lg"
								className="btn-gradient text-lg px-8 py-4"
								asChild
							>
								<Link to="/">
									<Home className="mr-2 w-5 h-5" />
									Return Home
									<ArrowRight className="ml-2 w-5 h-5" />
								</Link>
							</Button>
							<Button
								size="lg"
								variant="outline"
								className="text-lg px-8 py-4"
								asChild
							>
								<Link to="/upload">
									<Sparkles className="mr-2 w-5 h-5" />
									Start Analysis
								</Link>
							</Button>
						</div>
					</div>
				</div>

				{/* Decorative Elements */}
				<div className="absolute top-20 left-10 opacity-10">
					<Shirt className="w-16 h-16 text-primary" />
				</div>
				<div className="absolute top-32 right-16 opacity-10">
					<Palette className="w-12 h-12 text-accent" />
				</div>
				<div className="absolute bottom-20 left-20 opacity-10">
					<TrendingUp className="w-14 h-14 text-primary" />
				</div>
				<div className="absolute bottom-32 right-10 opacity-10">
					<Heart className="w-10 h-10 text-accent" />
				</div>
			</section>
		</div>
	);
};

export default NotFound;
