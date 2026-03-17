import { Navigate, useLocation } from "react-router";
import { useAuth, UserRole } from "../../contexts/AuthContext";
import { ReactNode } from "react";

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles: UserRole[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, isAuthenticated } = useAuth();

  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // Mandatory Profile Setup Lock for Volunteers
  if (user?.role === "volunteer" && !user.hasCompletedProfile) {
    if (location.pathname !== "/volunteer/setup") {
      return <Navigate to="/volunteer/setup" replace />;
    }
  }

  if (!allowedRoles.includes(user?.role || null)) {
    // Redirect to appropriate dashboard based on role
    if (user?.role === "volunteer") {
      return <Navigate to="/volunteer/dashboard" replace />;
    } else if (user?.role === "organizer") {
      return <Navigate to="/organizer/dashboard" replace />;
    } else if (user?.role === "admin") {
      return <Navigate to="/admin/dashboard" replace />;
    }
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
