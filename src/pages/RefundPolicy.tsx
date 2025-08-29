import React from "react";
import { Link } from "react-router-dom";
import { Navbar } from "@/components/navigation/navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
	ArrowLeft,
	Shield,
	Clock,
	CreditCard,
	AlertTriangle,
	Info,
} from "lucide-react";

const RefundPolicy = () => {
	return (
		<div className="min-h-screen bg-background">
			<Navbar />

			{/* Header */}
			<section className="py-16 bg-gradient-hero">
				<div className="container mx-auto px-4">
					<div className="max-w-4xl mx-auto text-center">
						<Button variant="ghost" className="mb-6" asChild>
							<Link to="/pricing">
								<ArrowLeft className="w-4 h-4 mr-2" />
								Back to Pricing
							</Link>
						</Button>
						<Badge className="bg-primary/10 text-primary border-primary/20 mb-4">
							<Shield className="w-3 h-3 mr-1" />
							Refund Policy
						</Badge>
						<h1 className="text-4xl lg:text-5xl font-bold mb-4">
							Your Right to Cancel
						</h1>
						<p className="text-xl text-muted-foreground">
							We want you to be completely satisfied with your
							Closetic experience
						</p>
					</div>
				</div>
			</section>

			{/* Main Content */}
			<section className="py-16">
				<div className="container mx-auto px-4">
					<div className="max-w-4xl mx-auto space-y-8">
						{/* Consumer Right to Cancel */}
						<Card className="card-fashion">
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<Clock className="w-5 h-5 text-primary" />
									Consumer Right to Cancel
								</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								<p className="text-muted-foreground leading-relaxed">
									If you are a Consumer, you have the right to
									cancel your subscription or purchase from
									Closetic within <strong>14 days</strong>{" "}
									without giving any reason, unless the
									exception below applies. The cancellation
									period will expire after 14 days from the
									day following completion of the transaction.
								</p>
								<p className="text-muted-foreground leading-relaxed">
									To meet the cancellation deadline, it is
									sufficient that you notify us of your
									decision to cancel before the expiration of
									the 14-day period.
								</p>
								<div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
									<p className="text-sm text-blue-800 dark:text-blue-200">
										<strong>How to cancel:</strong> Contact
										Closetic Support through our official
										support channels. For subscription
										services, the right to cancel applies
										only to the initial subscription and not
										to subsequent automatic renewals.
									</p>
								</div>
							</CardContent>
						</Card>

						{/* Model Cancellation Form */}
						<Card className="card-fashion">
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<CreditCard className="w-5 h-5 text-primary" />
									Cancellation Form
								</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-lg border">
									<p className="font-semibold mb-4">
										To Closetic Support Team:
									</p>
									<p className="mb-4">
										I hereby give notice that I cancel my
										contract of sale/subscription for the
										following product(s):
									</p>

									<div className="space-y-3 text-sm">
										<div className="flex justify-between">
											<span>Ordered on:</span>
											<span className="text-muted-foreground">
												[Date]
											</span>
										</div>
										<div className="flex justify-between">
											<span>Name of consumer(s):</span>
											<span className="text-muted-foreground">
												[Your Name]
											</span>
										</div>
										<div className="flex justify-between">
											<span>Address of consumer(s):</span>
											<span className="text-muted-foreground">
												[Your Address]
											</span>
										</div>
										<div className="flex justify-between">
											<span>
												Signature of consumer(s):
											</span>
											<span className="text-muted-foreground">
												[Only if sent on paper]
											</span>
										</div>
										<div className="flex justify-between">
											<span>Date:</span>
											<span className="text-muted-foreground">
												[Today's Date]
											</span>
										</div>
									</div>
								</div>
								<p className="text-sm text-muted-foreground mt-4">
									You may also cancel by making a clear and
									unambiguous statement through our
									communication channels. If you cancel
									online, we will confirm receipt of your
									request without delay.
								</p>
							</CardContent>
						</Card>

						{/* Effect of Cancellation */}
						<Card className="card-fashion">
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<Info className="w-5 h-5 text-primary" />
									What Happens After Cancellation
								</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								<p className="text-muted-foreground leading-relaxed">
									If you cancel this Agreement within the
									permitted period, Closetic will reimburse
									all payments received from you.
								</p>
								<p className="text-muted-foreground leading-relaxed">
									Reimbursement will be made without undue
									delay, and no later than{" "}
									<strong>14 days</strong> after we are
									informed of your decision to cancel. Refunds
									will be processed using the same payment
									method you used for the initial transaction,
									unless you expressly agree otherwise, and
									you will not incur any fees as a result.
								</p>
							</CardContent>
						</Card>

						{/* Exceptions */}
						<Card className="card-fashion">
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<AlertTriangle className="w-5 h-5 text-orange-500" />
									Important Exceptions
								</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								<p className="text-muted-foreground leading-relaxed">
									Your right to cancel does not apply to:
								</p>
								<ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
									<li>
										Digital content you have already
										accessed, downloaded, or used through
										Closetic
									</li>
									<li>
										Services you have already benefited from
										within the 14-day cancellation window
									</li>
								</ul>
							</CardContent>
						</Card>

						{/* Refund Policy */}
						<Card className="card-fashion">
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<CreditCard className="w-5 h-5 text-primary" />
									Additional Refund Policy
								</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								<p className="text-muted-foreground leading-relaxed">
									Refunds outside the 14-day cancellation
									window are provided at the sole discretion
									of Closetic and reviewed on a case-by-case
									basis. Refund requests may be refused if
									evidence of fraud, abuse, or other
									manipulative behaviour is found.
								</p>
								<p className="text-muted-foreground leading-relaxed">
									This does not affect your statutory rights
									regarding products or services that are
									faulty, not as described, or not fit for
									purpose.
								</p>
							</CardContent>
						</Card>

						{/* Payment by Wire Transfer */}
						<Card className="card-fashion">
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<CreditCard className="w-5 h-5 text-primary" />
									Payment by Wire Transfer
								</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								<p className="text-muted-foreground leading-relaxed">
									It is your responsibility to provide
									accurate payment details, including any
									required reference numbers or tax
									information, to avoid delays. Orders paid
									via wire transfer are not protected under
									the Consumer Credit Act and may not be
									eligible for refunds.
								</p>
								<p className="text-muted-foreground leading-relaxed">
									However, Closetic may issue refunds,
									including applicable sales taxes, at its
									discretion where the total transaction
									amount exceeds $100 / £100 / €100.
								</p>
							</CardContent>
						</Card>

						{/* Sales Tax Refund */}
						<Card className="card-fashion">
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<CreditCard className="w-5 h-5 text-primary" />
									Sales Tax Refund Policy
								</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								<p className="text-muted-foreground leading-relaxed">
									If sales tax (such as VAT, GST, or
									equivalent) was charged and you are
									registered for sales tax in your
									jurisdiction, you may be entitled to a
									refund of the tax amount where permitted by
									law.
								</p>
								<p className="text-muted-foreground leading-relaxed">
									You must contact Closetic within{" "}
									<strong>60 days</strong> of purchase and
									provide a valid tax registration code.
									Requests submitted after 60 days will not be
									processed.
								</p>
							</CardContent>
						</Card>

						{/* Contact Section */}
						<Card className="card-fashion bg-gradient-to-r from-primary/5 to-accent/5">
							<CardContent className="text-center py-8">
								<h3 className="text-xl font-semibold mb-4">
									Need Help with a Refund?
								</h3>
								<p className="text-muted-foreground mb-6">
									Our support team is here to help you with
									any questions about cancellations or
									refunds.
								</p>
								<div className="flex flex-col sm:flex-row gap-4 justify-center">
									<Button asChild>
										<a href="mailto:support@closetic.ai?subject=Refund Request">
											Contact Support
										</a>
									</Button>
									<Button variant="outline" asChild>
										<Link to="/pricing">View Pricing</Link>
									</Button>
								</div>
							</CardContent>
						</Card>
					</div>
				</div>
			</section>
		</div>
	);
};

export default RefundPolicy;
