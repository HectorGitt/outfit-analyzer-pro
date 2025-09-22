import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	ArrowLeft,
	CreditCard,
	Shield,
	CheckCircle,
	Receipt,
	Calendar,
	DollarSign,
	X,
	AlertTriangle,
	User,
	Settings,
} from "lucide-react";
import { pricingTiers } from "@/lib/pricingTiers";
import Footer from "@/components/ui/Footer";
import { useAuthStore } from "@/stores/authStore";
import { useToast } from "@/hooks/use-toast";
import { paymentAPI, authAPI } from "@/services/api";
import { Navbar } from "@/components/navigation/navbar";

// Declare Paystack on window object
declare global {
	interface Window {
		PaystackPop: new (config: {
			key: string;
			email: string;
			planCode?: string;
			onSuccess: (transaction: any) => void;
			onLoad: (response: any) => void;
			onCancel: () => void;
			onError: (error: any) => void;
		}) => {
			openIframe: () => void;
			newTransaction: (config: {
				key: string;
				email: string;
				planCode?: string;
				onSuccess: (transaction: any) => void;
				onLoad: (response: any) => void;
				onCancel: () => void;
				onError: (error: any) => void;
			}) => () => void;
		};
	}
}

const Billing = () => {
	const navigate = useNavigate();
	const [searchParams] = useSearchParams();
	const { user, isAuthenticated, pricingTier, updatePricingTier } =
		useAuthStore();
	const [isPaystackLoaded, setIsPaystackLoaded] = useState(false);
	const [isProcessing, setIsProcessing] = useState(false);
	const [preloadedPayment, setPreloadedPayment] = useState<
		(() => void) | null
	>(null);
	const { toast } = useToast();

	// Transaction history state
	const [transactions, setTransactions] = useState<any[]>([]);
	const [transactionsLoading, setTransactionsLoading] = useState(true);
	const [transactionsError, setTransactionsError] = useState<string | null>(
		null
	);
	const [totalTransactions, setTotalTransactions] = useState(0);

	// Subscription management state - defaults based on pricing tier
	const [subscriptionStatus, setSubscriptionStatus] = useState<string>(
		pricingTier === "free" ? "inactive" : "active"
	);
	const [isCancelling, setIsCancelling] = useState(false);
	const [showCancelDialog, setShowCancelDialog] = useState(false);
	const [subscriptionEndDate, setSubscriptionEndDate] = useState<
		string | null
	>(
		pricingTier === "free"
			? null
			: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
	);

	// Selected tier for upgrade (for free users) - default from URL param or spotlight
	const getDefaultSelectedTier = () => {
		const tierParam = searchParams.get("plan");
		const validTiers: (keyof typeof pricingTiers)[] = [
			"spotlight",
			"elite",
			"icon",
		];
		return validTiers.includes(tierParam as keyof typeof pricingTiers)
			? (tierParam as keyof typeof pricingTiers)
			: "spotlight";
	};

	const [selectedTier, setSelectedTier] = useState<keyof typeof pricingTiers>(
		getDefaultSelectedTier()
	);

	// Get plan from auth store instead of URL params
	const tier = pricingTiers[pricingTier] || pricingTiers.free;

	// Validate Paystack key
	const paystackKey = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;
	const ngnToUsdRate = parseFloat(
		import.meta.env.VITE_NGN_TO_USD_RATE || "1500"
	);
	if (!paystackKey) {
		console.error(
			"VITE_PAYSTACK_PUBLIC_KEY environment variable is not set"
		);
	}

	// Redirect if not authenticated
	useEffect(() => {
		if (!isAuthenticated) {
			const loginUrl = `/login?next=${encodeURIComponent(
				window.location.pathname + window.location.search
			)}`;
			window.location.href = loginUrl;
			return;
		}
	}, [isAuthenticated]);

	// Load Paystack script
	useEffect(() => {
		const paystackScript = document.createElement("script");
		paystackScript.src = "https://js.paystack.co/v2/inline.js";
		paystackScript.async = true;
		document.head.appendChild(paystackScript);

		paystackScript.onerror = () => {
			console.error("Failed to load Paystack script");
		};

		// Cleanup function to remove script when component unmounts
		return () => {
			if (document.head.contains(paystackScript)) {
				document.head.removeChild(paystackScript);
			}
		};
	}, []);

	// Preload payment transaction for better performance
	const loadPaymentTransaction = () => {
		if (!window.PaystackPop || !user?.email || !paystackKey) return;

		try {
			// Map pricing tiers to Paystack plan codes
			const planCodeMap: Record<string, string> = {
				free: import.meta.env.VITE_PAYSTACK_SPOTLIGHT_PLAN_ID, // Free tier upgrades to Spotlight plan
				spotlight: import.meta.env.VITE_PAYSTACK_SPOTLIGHT_PLAN_ID, // $9.99
				elite: import.meta.env.VITE_PAYSTACK_ELITE_PLAN_ID, // $19.99
				icon: import.meta.env.VITE_PAYSTACK_ICON_PLAN_ID, // $39.99
			};

			// For free tier users, use selected tier; for paid users, use current tier
			const targetTier =
				pricingTier === "free" ? selectedTier : pricingTier;
			const planCode = planCodeMap[targetTier];

			const popup = new window.PaystackPop({} as any);

			// Preload the transaction
			const loadPopup = popup.newTransaction({
				key: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY,
				email: user.email,
				planCode: planCode,
				onSuccess: (transaction) => {
					// Handle successful payment
					setIsProcessing(false);
					toast({
						title: "Payment Successful!",
						description:
							"Thank you for your subscription. Your account has been upgraded.",
						variant: "default",
					});
					// Redirect to profile after successful payment
					setTimeout(() => {
						navigate("/profile");
					}, 2000);
				},
				onLoad: (response) => {
					// Payment iframe loaded
					setIsProcessing(false);
				},
				onCancel: () => {
					// Payment cancelled by user
					setIsProcessing(false);
					toast({
						title: "Payment Cancelled",
						description:
							"Your payment was cancelled. No charges have been made.",
						variant: "destructive",
					});
				},
				onError: (error) => {
					console.error("Payment error:", error.message);
					setIsProcessing(false);
					toast({
						title: "Payment Failed",
						description:
							"There was an error processing your payment. Please try again.",
						variant: "destructive",
					});
				},
			});

			setPreloadedPayment(() => loadPopup);
		} catch (error) {
			console.error("Failed to preload Paystack transaction:", error);
		}
	};

	// Fetch subscription status from API
	useEffect(() => {
		const fetchSubscriptionStatus = async () => {
			try {
				const response = await authAPI.getPricingTier();

				if (response.success && response.data) {
					// Update auth store with real API data
					const apiPricingTier = response.data.pricing_tier || "free";
					updatePricingTier(
						apiPricingTier as keyof typeof pricingTiers
					);

					// Update local state with real subscription data
					setSubscriptionStatus(
						response.data.subscription_status || "active"
					);
					setSubscriptionEndDate(
						response.data.subscription_end_date || null
					);
				}
			} catch (error) {
				console.error("Failed to fetch subscription status:", error);
				// Fallback to auth store data if API fails
				if (pricingTier === "free") {
					setSubscriptionStatus("inactive");
					setSubscriptionEndDate(null);
				} else {
					setSubscriptionStatus("active");
					setSubscriptionEndDate(
						new Date(
							Date.now() + 30 * 24 * 60 * 60 * 1000
						).toISOString()
					);
				}
			}
		};

		if (isAuthenticated) {
			fetchSubscriptionStatus();
		}
	}, [isAuthenticated, updatePricingTier]);

	// Update selectedTier when URL parameter changes
	useEffect(() => {
		const tierParam = searchParams.get("tier");
		const validTiers: (keyof typeof pricingTiers)[] = [
			"spotlight",
			"elite",
			"icon",
		];
		if (
			tierParam &&
			validTiers.includes(tierParam as keyof typeof pricingTiers)
		) {
			setSelectedTier(tierParam as keyof typeof pricingTiers);
		}
	}, [searchParams]);

	// Fetch transaction history
	useEffect(() => {
		const fetchTransactionHistory = async () => {
			try {
				setTransactionsLoading(true);
				setTransactionsError(null);

				const response = await paymentAPI.getTransactionHistory({
					page: 1,
					limit: 10,
				});

				if (response.success && response.data) {
					setTransactions(response.data.history || []);
					setTotalTransactions(response.data.total_count || 0);
				} else {
					setTransactionsError("Failed to load transaction history");
				}
			} catch (error) {
				console.error("Failed to fetch transaction history:", error);
				setTransactionsError("Failed to load transaction history");
			} finally {
				setTransactionsLoading(false);
			}
		};

		if (isAuthenticated) {
			fetchTransactionHistory();
		}
	}, [isAuthenticated]);

	// Handle subscription cancellation
	const handleCancelSubscription = async () => {
		if (!user?.email) {
			toast({
				title: "Email Required",
				description: "Please update your email address to proceed.",
				variant: "destructive",
			});
			return;
		}

		setIsCancelling(true);
		try {
			// Here you would call your API to cancel the subscription
			// For now, we'll simulate the cancellation
			await new Promise((resolve) => setTimeout(resolve, 2000)); // Simulate API call

			setSubscriptionStatus("cancelled");
			setSubscriptionEndDate(
				new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
			); // 30 days from now

			toast({
				title: "Subscription Cancelled",
				description:
					"Your subscription will remain active until the end of your current billing period.",
				variant: "default",
			});

			setShowCancelDialog(false);
		} catch (error) {
			console.error("Failed to cancel subscription:", error);
			toast({
				title: "Cancellation Failed",
				description:
					"There was an error cancelling your subscription. Please try again.",
				variant: "destructive",
			});
		} finally {
			setIsCancelling(false);
		}
	};

	// Handle payment management redirect
	const handleManagePayment = async () => {
		try {
			// Call the /payment/manage endpoint
			const response = await paymentAPI.managePayment();

			if (response.success && response?.management_link) {
				// Redirect to the payment management portal
				window.location.href = response.management_link;
			} else {
				toast({
					title: "Unable to Access Payment Management",
					description:
						"Please try again or contact support if the issue persists.",
					variant: "destructive",
				});
			}
		} catch (error) {
			console.error("Failed to access payment management:", error);
			toast({
				title: "Payment Management Unavailable",
				description:
					"We're unable to redirect you to payment management at this time.",
				variant: "destructive",
			});
		}
	};

	// Handle payment for upgrading from free tier
	const handlePayment = () => {
		if (isAuthenticated) {
			loadPaymentTransaction();
		}

		if (isProcessing) {
			toast({
				title: "Payment In Progress",
				description: "Please wait for the current payment to complete.",
				variant: "destructive",
			});
			return;
		}
	};

	const getTierIcon = (tierName: string) => {
		switch (tierName.toLowerCase()) {
			case "free":
				return <CheckCircle className="w-6 h-6" />;
			case "spotlight":
				return <CreditCard className="w-6 h-6" />;
			case "elite":
				return <Shield className="w-6 h-6" />;
			case "icon":
				return <CheckCircle className="w-6 h-6" />;
			default:
				return <CheckCircle className="w-6 h-6" />;
		}
	};

	if (!isAuthenticated) {
		return null; // Will redirect in useEffect
	}

	return (
		<div className="min-h-screen bg-background">
			<Navbar />

			{/* Header */}
			<section className="py-12 bg-gradient-to-r from-primary/5 to-accent/5">
				<div className="container mx-auto px-4">
					<div className="max-w-4xl mx-auto">
						<Button
							variant="ghost"
							onClick={() => navigate("/pricing")}
							className="mb-6"
						>
							<ArrowLeft className="w-4 h-4 mr-2" />
							Back to Pricing
						</Button>

						<div className="text-center">
							<div className="flex items-center justify-center space-x-2 mb-4">
								<h1 className="text-4xl font-bold">
									Billing & Subscription
								</h1>
								<Badge
									variant={
										subscriptionStatus === "active"
											? "default"
											: subscriptionStatus === "cancelled"
											? "secondary"
											: "destructive"
									}
									className="text-sm"
								>
									{subscriptionStatus
										.charAt(0)
										.toUpperCase() +
										subscriptionStatus.slice(1)}
								</Badge>
							</div>
							<p className="text-xl text-muted-foreground mb-4">
								{pricingTier === "free"
									? "Upgrade your plan to unlock premium features"
									: "Manage your subscription and payment methods"}
							</p>
							{subscriptionStatus === "active" && (
								<p className="text-sm text-muted-foreground">
									{subscriptionEndDate
										? `Next billing date: ${new Date(
												subscriptionEndDate
										  ).toLocaleDateString()}`
										: "Monthly subscription active"}
								</p>
							)}
							{subscriptionStatus === "cancelled" &&
								subscriptionEndDate && (
									<p className="text-sm text-amber-600">
										Access until:{" "}
										{new Date(
											subscriptionEndDate
										).toLocaleDateString()}
									</p>
								)}
						</div>
					</div>
				</div>
			</section>

			{/* Billing Content */}
			<section className="py-12">
				<div className="container mx-auto px-4">
					<div className="max-w-6xl mx-auto">
						<div className="space-y-12">
							{/* Plan Summary */}
							<div className="bg-card border border-border rounded-lg p-8 card-fashion">
								<div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
									<div className="flex items-start space-x-4">
										<div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center text-primary flex-shrink-0">
											{getTierIcon(tier.name)}
										</div>
										<div className="min-w-0 flex-1">
											<h2 className="text-2xl font-bold mb-2">
												{tier.name} Plan
											</h2>
											<p className="text-muted-foreground mb-4">
												{pricingTier === "free"
													? "Free plan - Upgrade for premium features"
													: subscriptionStatus ===
													  "active"
													? "Active subscription"
													: "Subscription management"}
											</p>
											{subscriptionStatus ===
												"active" && (
												<div className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
													<CheckCircle className="w-4 h-4 mr-2" />
													Active
												</div>
											)}
										</div>
									</div>

									<div className="lg:text-right">
										<div className="text-sm font-medium text-muted-foreground mb-1">
											{pricingTier === "free"
												? "Current Plan"
												: "Monthly Price"}
										</div>
										<div className="text-3xl font-bold text-primary">
											{pricingTier === "free" ? (
												"Free"
											) : (
												<>
													$
													{tier.price_monthly?.toFixed(
														2
													) || "0.00"}
													<span className="text-lg font-normal text-muted-foreground">
														/month
													</span>
												</>
											)}
										</div>
									</div>
								</div>

								{subscriptionStatus === "active" && (
									<div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
										<div className="flex items-center space-x-2 text-green-800 mb-2">
											<CheckCircle className="w-5 h-5" />
											<span className="font-medium">
												Subscription Active
											</span>
										</div>
										<p className="text-sm text-green-700">
											{subscriptionEndDate
												? `Renews on ${new Date(
														subscriptionEndDate
												  ).toLocaleDateString()}`
												: "Monthly billing active"}
										</p>
									</div>
								)}

								<div className="mt-8 border-t pt-6">
									<h3 className="text-xl font-semibold mb-4">
										Plan Features
									</h3>
									<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
										{Object.entries(tier)
											.filter(
												([k]) =>
													k !== "name" &&
													k !== "price_monthly"
											)
											.slice(0, 6) // Show first 6 features
											.map(([key, value]) => (
												<div
													key={key}
													className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
												>
													<span className="text-sm text-muted-foreground capitalize">
														{key.replace(/_/g, " ")}
													</span>
													<span className="font-medium">
														{typeof value ===
														"boolean"
															? value
																? "✓"
																: "✗"
															: String(value)}
													</span>
												</div>
											))}
									</div>
								</div>
							</div>

							{/* Payment & Subscription Management */}
							<div className="grid lg:grid-cols-2 gap-8">
								{/* Payment Section */}
								<div className="bg-card border border-border rounded-lg p-8 card-fashion">
									<div className="flex items-center space-x-3 mb-6">
										<CreditCard className="w-6 h-6 text-primary" />
										<h3 className="text-xl font-semibold">
											Payment Details
										</h3>
									</div>

									<div className="space-y-6">
										<div>
											<label className="text-sm font-medium mb-2 block">
												Email Address
											</label>
											<div className="p-3 bg-muted rounded-md">
												{user?.email}
											</div>
										</div>

										<div className="flex items-center space-x-2 text-sm text-muted-foreground">
											<Shield className="w-4 h-4" />
											<span>
												Your payment is secured by
												Paystack
											</span>
										</div>

										{pricingTier === "free" && (
											<div className="space-y-2">
												<label className="text-sm font-medium">
													Choose Your Plan
												</label>
												<Select
													value={selectedTier}
													onValueChange={(
														value: keyof typeof pricingTiers
													) => setSelectedTier(value)}
												>
													<SelectTrigger className="w-full">
														<SelectValue placeholder="Select a plan" />
													</SelectTrigger>
													<SelectContent>
														<SelectItem value="spotlight">
															<div className="flex items-center justify-between w-full">
																<span>
																	Spotlight
																	Plan
																</span>
																<span className="text-muted-foreground">
																	$9.99/month
																</span>
															</div>
														</SelectItem>
														<SelectItem value="elite">
															<div className="flex items-center justify-between w-full">
																<span>
																	Elite Plan
																</span>
																<span className="text-muted-foreground">
																	$19.99/month
																</span>
															</div>
														</SelectItem>
														<SelectItem value="icon">
															<div className="flex items-center justify-between w-full">
																<span>
																	Icon Plan
																</span>
																<span className="text-muted-foreground">
																	$39.99/month
																</span>
															</div>
														</SelectItem>
													</SelectContent>
												</Select>
											</div>
										)}

										<Button
											className="w-full btn-gradient"
											size="lg"
											onClick={handlePayment}
											disabled={
												isProcessing ||
												!paystackKey ||
												pricingTier !== "free"
											}
										>
											{pricingTier === "free" ? (
												<>
													Upgrade to{" "}
													{
														pricingTiers[
															selectedTier
														].name
													}{" "}
													Plan - $
													{pricingTiers[
														selectedTier
													].price_monthly.toFixed(2)}
													/month
													<CreditCard className="ml-2 w-4 h-4" />
												</>
											) : !paystackKey ? (
												"Payment Configuration Error"
											) : isProcessing ? (
												"Processing..."
											) : (
												<>
													Pay $
													{tier.price_monthly.toFixed(
														2
													)}
													/month
													<CreditCard className="ml-2 w-4 h-4" />
												</>
											)}
										</Button>

										{pricingTier !== "free" && (
											<Button
												variant="outline"
												className="w-full"
												onClick={handleManagePayment}
												disabled={!paystackKey}
											>
												<Settings className="w-4 h-4 mr-2" />
												Manage Payment Method
											</Button>
										)}

										{!paystackKey && (
											<div className="text-center text-sm text-red-500">
												Payment system is not properly
												configured. Please contact
												support.
											</div>
										)}

										<div className="text-center text-sm text-muted-foreground">
											<p>
												By proceeding, you agree to our
												Terms of Service and Privacy
												Policy
											</p>
										</div>
									</div>
								</div>

								{/* Subscription Management */}
								<div className="bg-card border border-border rounded-lg p-8 card-fashion">
									<div className="flex items-center space-x-3 mb-6">
										<User className="w-6 h-6 text-primary" />
										<h3 className="text-xl font-semibold">
											Subscription Management
										</h3>
									</div>

									<div className="space-y-6">
										<div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
											<div className="flex-1">
												<h4 className="font-semibold mb-2">
													Current Status
												</h4>
												<p className="text-sm text-muted-foreground mb-2">
													{pricingTier === "free"
														? "You're on the free plan. Upgrade for premium features."
														: subscriptionStatus ===
														  "active"
														? "Your subscription is active"
														: subscriptionStatus ===
														  "cancelled"
														? "Your subscription is cancelled"
														: subscriptionStatus ===
														  "expired"
														? "Your subscription has expired"
														: "Subscription status unknown"}
												</p>
												{subscriptionEndDate && (
													<p className="text-xs text-muted-foreground">
														{subscriptionStatus ===
														"cancelled"
															? `Access until: ${new Date(
																	subscriptionEndDate
															  ).toLocaleDateString()}`
															: `Next billing: ${new Date(
																	subscriptionEndDate
															  ).toLocaleDateString()}`}
													</p>
												)}
											</div>
											<div className="flex-shrink-0">
												<Badge
													variant={
														subscriptionStatus ===
														"active"
															? "default"
															: subscriptionStatus ===
															  "cancelled"
															? "secondary"
															: "destructive"
													}
													className="text-sm px-3 py-1"
												>
													{subscriptionStatus
														.charAt(0)
														.toUpperCase() +
														subscriptionStatus.slice(
															1
														)}
												</Badge>
											</div>
										</div>

										{pricingTier !== "free" &&
											subscriptionStatus === "active" && (
												<Dialog
													open={showCancelDialog}
													onOpenChange={
														setShowCancelDialog
													}
												>
													<DialogTrigger asChild>
														<Button
															variant="outline"
															className="w-full border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
														>
															<X className="w-4 h-4 mr-2" />
															Cancel Subscription
														</Button>
													</DialogTrigger>
													<DialogContent>
														<DialogHeader>
															<DialogTitle className="flex items-center space-x-2">
																<AlertTriangle className="w-5 h-5 text-red-500" />
																<span>
																	Cancel
																	Subscription
																</span>
															</DialogTitle>
															<DialogDescription>
																Are you sure you
																want to cancel
																your
																subscription?
																You'll still
																have access to
																your account
																until the end of
																your current
																billing period.
															</DialogDescription>
														</DialogHeader>

														<div className="space-y-4">
															<div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
																<h4 className="font-semibold text-yellow-800 mb-2">
																	What happens
																	when you
																	cancel:
																</h4>
																<ul className="text-sm text-yellow-700 space-y-1">
																	<li>
																		• You'll
																		keep
																		access
																		until{" "}
																		{subscriptionEndDate
																			? new Date(
																					subscriptionEndDate
																			  ).toLocaleDateString()
																			: "your billing period ends"}
																	</li>
																	<li>
																		• No
																		more
																		charges
																		will be
																		made to
																		your
																		account
																	</li>
																	<li>
																		• You
																		can
																		reactivate
																		anytime
																		before
																		the
																		period
																		ends
																	</li>
																	<li>
																		• Your
																		data and
																		preferences
																		will be
																		preserved
																	</li>
																</ul>
															</div>
														</div>

														<DialogFooter>
															<Button
																variant="outline"
																onClick={() =>
																	setShowCancelDialog(
																		false
																	)
																}
																disabled={
																	isCancelling
																}
															>
																Keep
																Subscription
															</Button>
															<Button
																variant="destructive"
																onClick={
																	handleCancelSubscription
																}
																disabled={
																	isCancelling
																}
															>
																{isCancelling
																	? "Cancelling..."
																	: "Cancel Subscription"}
															</Button>
														</DialogFooter>
													</DialogContent>
												</Dialog>
											)}

										{pricingTier !== "free" &&
											subscriptionStatus ===
												"cancelled" && (
												<div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
													<h4 className="font-semibold text-blue-800 mb-3">
														Subscription Cancelled
													</h4>
													<p className="text-sm text-blue-700 mb-4">
														Your subscription will
														remain active until{" "}
														{subscriptionEndDate
															? new Date(
																	subscriptionEndDate
															  ).toLocaleDateString()
															: "the end of your billing period"}
														. You can reactivate it
														anytime before then.
													</p>
													<Button
														variant="outline"
														size="sm"
														className="border-blue-300 text-blue-600 hover:bg-blue-50"
													>
														Reactivate Subscription
													</Button>
												</div>
											)}
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Transaction History Section */}
			<section className="py-12 bg-muted/30">
				<div className="container mx-auto px-4">
					<div className="max-w-6xl mx-auto">
						<div className="text-center mb-8">
							<h2 className="text-3xl font-bold mb-4">
								Payment History
							</h2>
							<p className="text-muted-foreground">
								Track your subscription payments and billing
								activity
							</p>
						</div>

						{/* Quick Stats */}
						{transactions.length > 0 && (
							<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
								<div className="bg-card border border-border rounded-lg p-4 card-fashion">
									<div className="flex items-center space-x-2">
										<Receipt className="w-5 h-5 text-primary" />
										<div>
											<p className="text-sm text-muted-foreground">
												Total Payments
											</p>
											<p className="text-2xl font-bold">
												{transactions.length}
											</p>
										</div>
									</div>
								</div>
								<div className="bg-card border border-border rounded-lg p-4 card-fashion">
									<div className="flex items-center space-x-2">
										<DollarSign className="w-5 h-5 text-green-600" />
										<div>
											<p className="text-sm text-muted-foreground">
												Last Payment
											</p>
											<p className="text-2xl font-bold">
												₦
												{transactions[0]?.amount?.toLocaleString() ||
													"0"}
											</p>
										</div>
									</div>
								</div>
								<div className="bg-card border border-border rounded-lg p-4 card-fashion">
									<div className="flex items-center space-x-2">
										<Calendar className="w-5 h-5 text-blue-600" />
										<div>
											<p className="text-sm text-muted-foreground">
												Next Billing
											</p>
											<p className="text-lg font-bold">
												{subscriptionEndDate
													? new Date(
															subscriptionEndDate
													  ).toLocaleDateString()
													: "N/A"}
											</p>
										</div>
									</div>
								</div>
							</div>
						)}

						<div className="bg-card border border-border rounded-lg card-fashion">
							<div className="p-6 border-b border-border">
								<div className="flex items-center space-x-3">
									<Receipt className="w-6 h-6 text-primary" />
									<h3 className="text-xl font-semibold">
										Recent Transactions
									</h3>
								</div>
							</div>

							<div className="p-6">
								{transactionsLoading ? (
									<div className="text-center py-8">
										<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
										<p className="text-muted-foreground">
											Loading transactions...
										</p>
									</div>
								) : transactionsError ? (
									<div className="text-center py-8">
										<p className="text-red-500">
											{transactionsError}
										</p>
									</div>
								) : transactions.length === 0 ? (
									<div className="text-center py-12">
										<div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
											<Receipt className="w-8 h-8 text-muted-foreground" />
										</div>
										<h3 className="text-lg font-semibold mb-2">
											No transactions yet
										</h3>
										<p className="text-muted-foreground mb-6 max-w-md mx-auto">
											Your payment history will appear
											here once you make your first
											subscription payment.
											{subscriptionStatus === "active" &&
												" Your current subscription is active and will appear in your history soon."}
										</p>
										{subscriptionStatus !== "active" && (
											<Button
												onClick={() =>
													navigate("/pricing")
												}
												className="btn-gradient"
											>
												Choose a Plan
											</Button>
										)}
									</div>
								) : (
									<div className="space-y-4">
										{transactions.map((transaction) => (
											<div
												key={transaction.id}
												className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
											>
												<div className="flex items-center space-x-4">
													<div
														className={`w-10 h-10 rounded-full flex items-center justify-center ${
															transaction.status ===
															"success"
																? "bg-green-100 text-green-600"
																: transaction.status ===
																  "pending"
																? "bg-yellow-100 text-yellow-600"
																: transaction.status ===
																  "failed"
																? "bg-red-100 text-red-600"
																: "bg-gray-100 text-gray-600"
														}`}
													>
														{transaction.status ===
														"success" ? (
															<CheckCircle className="w-5 h-5" />
														) : transaction.status ===
														  "pending" ? (
															<Calendar className="w-5 h-5" />
														) : (
															<DollarSign className="w-5 h-5" />
														)}
													</div>

													<div>
														<h4 className="font-semibold">
															{transaction.tier
																.charAt(0)
																.toUpperCase() +
																transaction.tier.slice(
																	1
																)}{" "}
															Plan
														</h4>
														<p className="text-sm text-muted-foreground">
															{
																transaction.plan_type
															}{" "}
															subscription •{" "}
															{
																transaction.payment_method
															}
														</p>
														<p className="text-xs text-muted-foreground">
															Ref:{" "}
															{
																transaction.reference
															}
														</p>
													</div>
												</div>

												<div className="text-right">
													<div className="font-semibold">
														₦
														{transaction.amount.toLocaleString()}
														<div className="text-xs text-muted-foreground">
															(~$
															{(
																transaction.amount /
																ngnToUsdRate
															).toFixed(2)}{" "}
															USD)
														</div>
													</div>
													<div className="text-sm text-muted-foreground">
														{new Date(
															transaction.created_at
														).toLocaleDateString()}
													</div>
													<Badge
														variant={
															transaction.status ===
															"success"
																? "default"
																: transaction.status ===
																  "pending"
																? "secondary"
																: "destructive"
														}
														className="mt-1"
													>
														{transaction.status
															.charAt(0)
															.toUpperCase() +
															transaction.status.slice(
																1
															)}
													</Badge>
												</div>
											</div>
										))}

										{transactions.length >= 10 &&
											totalTransactions >
												transactions.length && (
												<div className="text-center pt-4">
													<Button
														variant="outline"
														size="sm"
													>
														Load More Transactions (
														{totalTransactions -
															transactions.length}{" "}
														remaining)
													</Button>
												</div>
											)}
									</div>
								)}
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Billing FAQ/Help Section */}
			<section className="py-12">
				<div className="container mx-auto px-4">
					<div className="max-w-4xl mx-auto">
						<div className="text-center mb-8">
							<h2 className="text-3xl font-bold mb-4">
								Billing Information
							</h2>
							<p className="text-muted-foreground">
								Everything you need to know about your
								subscription
							</p>
						</div>

						<div className="grid md:grid-cols-2 gap-6">
							<div className="bg-card border border-border rounded-lg p-6 card-fashion">
								<div className="flex items-center space-x-3 mb-4">
									<Shield className="w-6 h-6 text-primary" />
									<h3 className="text-lg font-semibold">
										Payment Security
									</h3>
								</div>
								<ul className="space-y-2 text-sm text-muted-foreground">
									<li>
										• All payments are processed securely
										through Paystack
									</li>
									<li>
										• Your payment information is never
										stored on our servers
									</li>
									<li>
										• SSL encryption protects all
										transactions
									</li>
									<li>
										• PCI DSS compliant payment processing
									</li>
								</ul>
							</div>

							<div className="bg-card border border-border rounded-lg p-6 card-fashion">
								<div className="flex items-center space-x-3 mb-4">
									<CreditCard className="w-6 h-6 text-primary" />
									<h3 className="text-lg font-semibold">
										Subscription Details
									</h3>
								</div>
								<ul className="space-y-2 text-sm text-muted-foreground">
									<li>• Monthly billing cycle</li>
									<li>• Cancel anytime with no penalties</li>
									<li>
										• Access remains until billing period
										ends
									</li>
									<li>
										• Reactivate anytime before expiration
									</li>
								</ul>
							</div>
						</div>

						<div className="text-center mt-8">
							<p className="text-sm text-muted-foreground">
								Need help? Contact our support team at{" "}
								<a
									href="mailto:support@closetic.com"
									className="text-primary hover:underline"
								>
									support@closetic.com
								</a>
							</p>
						</div>
					</div>
				</div>
			</section>
		</div>
	);
};

export default Billing;
