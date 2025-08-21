import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";

interface ProtectedRouteProps {
	children: ReactNode;
	requireAdmin?: boolean;
}

export const ProtectedRoute = ({
	children,
	requireAdmin = false,
}: ProtectedRouteProps) => {
	const { isAuthenticated, user } = useAuthStore();
	const location = useLocation();

	if (!isAuthenticated) {
		// Redirect to login with return URL
		return <Navigate to="/login" state={{ from: location }} replace />;
	}

	if (requireAdmin && user?.email !== "admin@closetic.com") {
		// Redirect to dashboard if not admin
		return <Navigate to="/dashboard" replace />;
	}

	return <>{children}</>;
};
