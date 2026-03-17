import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { toast } from "react-toastify";

export type UserRole = "volunteer" | "organizer" | "admin" | null;

interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  isVerified?: boolean;
  hasCompletedProfile?: boolean;
  rating?: number;
}

interface AuthContextType {
  user: User | null;
  login: (userData: User, token: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    // Check sessionStorage for existing user on init (Tab Isolated)
    const savedUser = sessionStorage.getItem("crewup_user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const login = (userData: User, token: string) => {
    setUser(userData);

    // Set sessionStorage for Tab Isolation
    sessionStorage.setItem("crewup_token", token);
    sessionStorage.setItem("crewup_user", JSON.stringify(userData));

    // Purge old LocalStorage and Cookies to finalize migration
    localStorage.removeItem("crewup_token");
    localStorage.removeItem("crewup_user");
  };

  const logout = () => {
    setUser(null);
    sessionStorage.removeItem("crewup_token");
    sessionStorage.removeItem("crewup_user");

    // Fallback purge for migrated users
    localStorage.removeItem("crewup_token");
    localStorage.removeItem("crewup_user");
  };

  // Global HTTP Fetch Interceptor for 401 Unauthorized
  useEffect(() => {
    const originalFetch = window.fetch;

    window.fetch = async (...args) => {
      const response = await originalFetch(...args);

      // If the backend actively rejects the JWT due to expiration or hijacking
      if (response.status === 401) {

        // Prevent infinite loops if already on a public page
        const isAuthRoute = window.location.pathname.includes('/login') || window.location.pathname === '/';

        if (!isAuthRoute && sessionStorage.getItem("crewup_token")) {
          toast.error("Your session has expired. Please log in again.");
          logout();
          window.location.href = '/login'; // Force hard browser redirect back to safety
        }
      }
      return response;
    };

    return () => {
      window.fetch = originalFetch; // Safely restore native fetch on unmount
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
