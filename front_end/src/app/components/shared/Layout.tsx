import { Outlet, useLocation } from "react-router";
import { useEffect, useState } from "react";
import { BottomNav } from "./BottomNav";
import { Header } from "./Header";
import { useAuth } from "../../contexts/AuthContext";

export function Layout() {
  const location = useLocation();
  const { user } = useAuth();

  // Track Global Sidebar state
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  // Hide bottom nav and header on landing and auth pages
  const isPublicPage = location.pathname === "/" || location.pathname.includes("/login") || location.pathname.includes("/onboarding");
  const showNavAndHeader = !isPublicPage && user !== null;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">

      <div className={`flex flex-1 w-full ${showNavAndHeader ? 'pt-16' : ''}`}>
        {/* Main Content Area */}
        <main className={`flex-1 w-full relative transition-all duration-300 ease-in-out ${showNavAndHeader ? (isSidebarOpen ? 'md:ml-64' : 'md:ml-20') + ' pb-16 md:pb-0' : ''}`}>
          <div className="h-full w-full">
            <Outlet />
          </div>
        </main>

        {/* Navigation */}
        {showNavAndHeader && <BottomNav isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />}
      </div>
    </div>
  );
}
