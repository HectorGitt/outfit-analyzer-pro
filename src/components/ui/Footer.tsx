import { Link } from "react-router-dom";
import logoImage from "@/assets/logo.png";

const Footer = () => {
	return (
		<footer className="bg-gray-900 text-white py-16">
			<div className="container mx-auto px-4">
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
					{/* Brand Section */}
					<div className="space-y-4">
						<div className="flex items-center space-x-2">
							<div className="w-8 h-8 rounded-lg overflow-hidden">
								<img
									src={logoImage}
									alt="Closetic AI Logo"
									className="w-full h-full object-cover"
								/>
							</div>
							<span className="text-2xl font-bold text-gradient">
								Closetic AI
							</span>
						</div>
						<p className="text-gray-400 leading-relaxed">
							Transform your style with AI-powered fashion
							analysis. Get personalized recommendations and
							elevate your wardrobe game.
						</p>
					</div>

					{/* Product Links */}
					<div className="space-y-4">
						<h3 className="text-lg font-semibold">Product</h3>
						<ul className="space-y-2">
							<li>
								<Link
									to="/upload"
									className="text-gray-400 hover:text-accent transition-colors"
								>
									Upload & Analyze
								</Link>
							</li>
							<li>
								<Link
									to="/dashboard"
									className="text-gray-400 hover:text-accent transition-colors"
								>
									Dashboard
								</Link>
							</li>
							<li>
								<Link
									to="/camera"
									className="text-gray-400 hover:text-accent transition-colors"
								>
									Camera Analysis
								</Link>
							</li>
						</ul>
					</div>

					{/* Company Links */}
					<div className="space-y-4">
						<h3 className="text-lg font-semibold">Company</h3>
						<ul className="space-y-2">
							<li>
								<a
									href="#"
									className="text-gray-400 hover:text-accent transition-colors"
								>
									About Us
								</a>
							</li>
							<li>
								<a
									href="#"
									className="text-gray-400 hover:text-accent transition-colors"
								>
									Careers
								</a>
							</li>
						</ul>
					</div>

					{/* Support Links */}
					<div className="space-y-4">
						<h3 className="text-lg font-semibold">Support</h3>
						<ul className="space-y-2">
							<li>
								<a
									href="mailto:support@closetic.com?subject=Support%20Request"
									className="text-gray-400 hover:text-accent transition-colors"
								>
									Contact Us
								</a>
							</li>
							<li>
								<Link
									to="/privacy-policy"
									className="text-gray-400 hover:text-accent transition-colors"
								>
									Privacy Policy
								</Link>
							</li>
							<li>
								<Link
									to="/terms-of-service"
									className="text-gray-400 hover:text-accent transition-colors"
								>
									Terms of Service
								</Link>
							</li>
						</ul>
					</div>
				</div>

				{/* Bottom Section */}
				<div className="border-t border-gray-800 mt-12 pt-8">
					<div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
						<p className="text-gray-400 text-sm">
							© {new Date().getFullYear()} Closetic AI. All rights
							reserved.
						</p>
					</div>
				</div>
			</div>
		</footer>
	);
};

export default Footer;
