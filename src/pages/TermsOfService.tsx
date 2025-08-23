import React from "react";
import { Navbar } from "../components/navigation/navbar";
import { Card, CardContent } from "../components/ui/card";

const sections = [
	{
		title: "AGREEMENT TO OUR LEGAL TERMS",
		content: [
			'We are Closetic AI ("Company", "we", "us", or "our"), a company registered in Nigeria at Lagos, Ikeja, Lagos State 200211.',
			'We operate the website http://www.closetic.com (the "Site"), as well as any other related products and services that refer or link to these legal terms (the "Legal Terms") (collectively, the "Services").',
			"Elevate Your Style with AI Fashion Intelligence. Get instant, personalized fashion analysis and style recommendations powered by advanced AI technology. Perfect your look, boost your confidence.",
			"You can contact us by phone at +2348134989522, email at admin@closetic.com, or by mail to Lagos, Ikeja, Lagos State 200211, Nigeria.",
			'These Legal Terms constitute a legally binding agreement made between you, whether personally or on behalf of an entity ("you"), and Closetic AI, concerning your access to and use of the Services. By accessing the Services, you agree that you have read, understood, and agreed to be bound by all of these Legal Terms. IF YOU DO NOT AGREE WITH ALL OF THESE LEGAL TERMS, THEN YOU ARE EXPRESSLY PROHIBITED FROM USING THE SERVICES AND YOU MUST DISCONTINUE USE IMMEDIATELY.',
			"We will provide you with prior notice of any scheduled changes to the Services you are using. The modified Legal Terms will become effective upon posting or notifying you by admin@closetic.com, as stated in the email message. By continuing to use the Services after the effective date of any changes, you agree to be bound by the modified terms.",
			"The Services are intended for users who are at least 13 years of age. All users who are minors in the jurisdiction in which they reside (generally under the age of 18) must have the permission of, and be directly supervised by, their parent or guardian to use the Services. If you are a minor, you must have your parent or guardian read and agree to these Legal Terms prior to you using the Services.",
			"We recommend that you print a copy of these Legal Terms for your records.",
		],
	},
	{
		title: "TABLE OF CONTENTS",
		content: [
			"1. OUR SERVICES",
			"2. INTELLECTUAL PROPERTY RIGHTS",
			"3. USER REPRESENTATIONS",
			"4. USER REGISTRATION",
			"5. PURCHASES AND PAYMENT",
			"6. SUBSCRIPTIONS",
			"7. PROHIBITED ACTIVITIES",
			"8. USER GENERATED CONTRIBUTIONS",
			"9. CONTRIBUTION LICENCE",
			"10. SOCIAL MEDIA",
			"11. SERVICES MANAGEMENT",
			"12. PRIVACY POLICY",
			"13. COPYRIGHT INFRINGEMENTS",
			"14. TERM AND TERMINATION",
			"15. MODIFICATIONS AND INTERRUPTIONS",
			"16. GOVERNING LAW",
			"17. DISPUTE RESOLUTION",
			"18. CORRECTIONS",
			"19. DISCLAIMER",
			"20. LIMITATIONS OF LIABILITY",
			"21. INDEMNIFICATION",
			"22. USER DATA",
			"23. ELECTRONIC COMMUNICATIONS, TRANSACTIONS, AND SIGNATURES",
			"24. CALIFORNIA USERS AND RESIDENTS",
			"25. MISCELLANEOUS",
			"26. CONTACT US",
		],
	},
	// ... You can continue adding more sections as needed, following the same structure ...
];

const TermsOfService: React.FC = () => {
	return (
		<>
			<Navbar />
			<div className="flex justify-center py-8 px-2 min-h-screen bg-gradient-to-b from-white to-gray-100">
				<Card className="w-full max-w-3xl shadow-lg border-0">
					<CardContent className="p-8">
						<h1 className="text-3xl font-bold text-center mb-2 bg-gradient-to-r from-blue-700 via-blue-400 to-blue-700 bg-clip-text text-transparent">
							TERMS OF SERVICE
						</h1>
						<p className="text-center text-gray-500 mb-8">
							Last updated August 21, 2025
						</p>
						{sections.map((section, idx) => (
							<div key={idx} className="mb-8">
								<h2 className="text-xl font-semibold mb-2 text-blue-800">
									{section.title}
								</h2>
								{Array.isArray(section.content) ? (
									<ul className="list-disc pl-6 space-y-1">
										{section.content.map((line, i) => (
											<li
												key={i}
												className="text-gray-700 leading-relaxed"
											>
												{line}
											</li>
										))}
									</ul>
								) : (
									<p className="text-gray-700 leading-relaxed">
										{section.content}
									</p>
								)}
							</div>
						))}
						{/* Add more sections below as needed, following the pattern above */}
					</CardContent>
				</Card>
			</div>
		</>
	);
};

export default TermsOfService;
