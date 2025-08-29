import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import FashionChatbot from "@/components/ui/fashion-chatbot";
import ScrollToTop from "@/components/ScrollToTop";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Upload from "./pages/Upload";
import Camera from "./pages/Camera";
import Profile from "./pages/Profile";
import Dashboard from "./pages/Dashboard";
import Admin from "./pages/Admin";
import UserManagement from "./pages/UserManagement";
import CalendarConnect from "./pages/CalendarConnect";
import CalendarView from "./pages/CalendarView";
import Wardrobe from "./pages/Wardrobe";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import NotFound from "./pages/NotFound";
import Pricing from "./pages/Pricing";
import RefundPolicy from "./pages/RefundPolicy";

const queryClient = new QueryClient();

const App = () => (
	<QueryClientProvider client={queryClient}>
		<TooltipProvider>
			<Toaster />
			<Sonner />
			<BrowserRouter
				future={{
					v7_startTransition: true,
					v7_relativeSplatPath: true,
				}}
			>
				<ScrollToTop />
				<Routes>
					<Route path="/" element={<Index />} />
					<Route path="/login" element={<Login />} />
					<Route path="/register" element={<Register />} />
					<Route
						path="/upload"
						element={
							<ProtectedRoute>
								<Upload />
							</ProtectedRoute>
						}
					/>
					<Route
						path="/camera"
						element={
							<ProtectedRoute>
								<Camera />
							</ProtectedRoute>
						}
					/>
					<Route
						path="/profile"
						element={
							<ProtectedRoute>
								<Profile />
							</ProtectedRoute>
						}
					/>
					<Route
						path="/dashboard"
						element={
							<ProtectedRoute>
								<Dashboard />
							</ProtectedRoute>
						}
					/>
					<Route
						path="/admin"
						element={
							<ProtectedRoute requireAdmin>
								<Admin />
							</ProtectedRoute>
						}
					/>
					<Route
						path="/admin/users"
						element={
							<ProtectedRoute requireAdmin>
								<UserManagement />
							</ProtectedRoute>
						}
					/>
					<Route
						path="/calendar-connect"
						element={
							<ProtectedRoute>
								<CalendarConnect />
							</ProtectedRoute>
						}
					/>
					<Route
						path="/calendar-view"
						element={
							<ProtectedRoute>
								<CalendarView />
							</ProtectedRoute>
						}
					/>
					<Route
						path="/wardrobe"
						element={
							<ProtectedRoute>
								<Wardrobe />
							</ProtectedRoute>
						}
					/>
					<Route path="/privacy-policy" element={<PrivacyPolicy />} />
					<Route
						path="/terms-of-service"
						element={<TermsOfService />}
					/>
					<Route path="/pricing" element={<Pricing />} />
					<Route path="/refund-policy" element={<RefundPolicy />} />
					{/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
					<Route path="*" element={<NotFound />} />
				</Routes>
				<FashionChatbot />
			</BrowserRouter>
		</TooltipProvider>
	</QueryClientProvider>
);

export default App;
