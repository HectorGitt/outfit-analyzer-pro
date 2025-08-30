import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Wrench, Home, RefreshCw } from "lucide-react";

export default function Maintenance() {
	const handleRefresh = () => {
		window.location.reload();
	};

	return (
		<div className="min-h-screen bg-gradient-hero flex items-center justify-center px-4">
			<div className="w-full max-w-md space-y-8">
				<Card className="glass-card">
					<CardHeader className="text-center">
						<div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
							<Wrench className="w-8 h-8 text-orange-600" />
						</div>
						<CardTitle className="text-2xl">
							Under Maintenance
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-6">
						<Alert>
							<Wrench className="h-4 w-4" />
							<AlertDescription>
								We're currently performing scheduled maintenance
								to improve your experience. Please check back in
								a few minutes.
							</AlertDescription>
						</Alert>

						<div className="space-y-4">
							<Button
								onClick={handleRefresh}
								className="w-full"
								variant="outline"
							>
								<RefreshCw className="w-4 h-4 mr-2" />
								Try Again
							</Button>

							<Button asChild className="w-full">
								<Link to="/">
									<Home className="w-4 h-4 mr-2" />
									Go Home
								</Link>
							</Button>
						</div>

						<div className="text-center text-sm text-muted-foreground">
							<p>Expected downtime: 5-10 minutes</p>
							<p className="mt-2">
								For urgent support, contact{" "}
								<a
									href="mailto:support@closetic.ai"
									className="text-primary hover:underline"
								>
									support@closetic.ai
								</a>
							</p>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
