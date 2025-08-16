import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import FashionChatbot from "@/components/ui/fashion-chatbot";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Upload from "./pages/Upload";
import Camera from "./pages/Camera";
import Profile from "./pages/Profile";
import Dashboard from "./pages/Dashboard";
import Admin from "./pages/Admin";
import CalendarConnect from "./pages/CalendarConnect";
import CalendarView from "./pages/CalendarView";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
	<QueryClientProvider client={queryClient}>
		<TooltipProvider>
			<Toaster />
			<Sonner />
			<BrowserRouter>
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
					{/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
					<Route path="*" element={<NotFound />} />
				</Routes>
				<FashionChatbot />
			</BrowserRouter>
		</TooltipProvider>
	</QueryClientProvider>
);

export default App;
