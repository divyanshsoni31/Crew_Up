import { Home, Calendar, User, MessageCircle, Settings, FileText, ClipboardList, Shield, ChevronLeft, ChevronRight, Menu } from "lucide-react";
import { Link, useLocation } from "react-router";
import { useAuth } from "../../contexts/AuthContext";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";

interface BottomNavProps {
  isSidebarOpen?: boolean;
  setIsSidebarOpen?: (val: boolean | ((prev: boolean) => boolean)) => void;
}

export function BottomNav({ isSidebarOpen = true, setIsSidebarOpen }: BottomNavProps) {
  const location = useLocation();
  const { user } = useAuth();

  // Return early if no user is logged in
  if (!user) return null;

  // Base navigation items for different roles
  const getNavItems = () => {
    const role = user.role;

    if (role === "admin") {
      return [
        { icon: Home, label: "Dashboard", path: "/admin/dashboard" },
        { icon: User, label: "Users", path: "/admin/users" },
        { icon: Calendar, label: "Events", path: "/admin/events" },
        { icon: ClipboardList, label: "Reports", path: "/admin/reports" },
      ];
    }

    if (role === "organizer") {
      return [
        { icon: Home, label: "Dashboard", path: "/organizer/dashboard" },
        { icon: Calendar, label: "Events", path: "/organizer/events" },
        { icon: FileText, label: "Applications", path: "/organizer/applications" },
        { icon: User, label: "Profile", path: "/organizer/profile" },
      ];
    }

    // Default to volunteer
    return [
      { icon: Home, label: "Dashboard", path: "/volunteer/dashboard" },
      { icon: Calendar, label: "Events", path: "/volunteer/events" },
      { icon: FileText, label: "Applications", path: "/volunteer/applications" },
      { icon: User, label: "Profile", path: "/volunteer/profile" },
    ];
  };

  const navItems = getNavItems();

  return (
    <>
      {/* Mobile Bottom Navigation - visible only on small screens */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 pb-safe">
        <div className="flex justify-around items-center h-16 px-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
            const Icon = item.icon;

            return (
              <Link
                key={item.label}
                to={item.path}
                className="flex flex-col items-center justify-center flex-1 h-full gap-1"
              >
                <div className={`p-1.5 rounded-full transition-colors ${isActive ? "bg-primary/10 text-primary" : "text-gray-500 hover:text-gray-900 duration-200"}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className={`text-[10px] font-medium transition-colors ${isActive ? "text-primary" : "text-gray-500"}`}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Desktop Side Navigation - visible only on medium and larger screens */}
      <nav
        className={`hidden md:flex flex-col fixed left-0 top-0 bottom-0 bg-white border-r border-gray-200 z-40 pt-16 transition-all duration-300 ease-in-out ${isSidebarOpen ? 'w-64' : 'w-20'}`}
      >
        {/* Toggle Button explicitly injected inside Sidebar for tight control */}
        {setIsSidebarOpen && (
          <div className={`pt-6 px-4 flex items-center ${isSidebarOpen ? 'justify-end' : 'justify-center'} border-b border-transparent`}>
            <button
              onClick={() => setIsSidebarOpen(prev => !prev)}
              className="text-gray-500 hover:text-violet-600 bg-gray-50 hover:bg-violet-50 w-10 h-10 rounded-xl flex items-center justify-center transition-all"
              title="Toggle Menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        )}

        <div className="flex flex-col flex-grow px-2 py-6 overflow-y-auto scrollbar-none">
          <div className="space-y-2">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
              const Icon = item.icon;

              return (
                <Link
                  key={item.label}
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 relative group overflow-hidden ${isActive
                    ? "bg-primary text-white shadow-md shadow-primary/20"
                    : "text-gray-600 hover:bg-gray-100/80 hover:text-gray-900"
                    } ${!isSidebarOpen ? "justify-center" : ""}`}
                >
                  <Icon className={`w-5 h-5 shrink-0 transition-colors ${isActive ? "text-white" : "text-gray-500 group-hover:text-violet-600"} ${!isSidebarOpen && 'mx-auto'}`} />

                  {isSidebarOpen && (
                    <span className={`font-medium whitespace-nowrap origin-left transition-all duration-300 translate-x-0 opacity-100`}>
                      {item.label}
                    </span>
                  )}

                  {/* Tooltip for collapsed state */}
                  {!isSidebarOpen && (
                    <div className="absolute left-full ml-4 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50 pointer-events-none">
                      {item.label}
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        </div>

        {/* User Info & Settings in Sidebar */}
        <div className="p-3 border-t border-gray-100/50 bg-gray-50/30">
          <div className={`flex items-center py-3 rounded-2xl hover:bg-white transition-all cursor-pointer overflow-hidden ${isSidebarOpen ? 'px-3 gap-3' : 'justify-center px-0'}`}>
            <div className={`w-10 h-10 shrink-0 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 shadow-sm flex items-center justify-center text-white font-bold ring-2 ring-white ${!isSidebarOpen && 'mx-auto'}`}>
              {user.name.charAt(0)}
            </div>

            {isSidebarOpen && (
              <div className={`flex flex-col origin-left transition-all duration-300 translate-x-0 opacity-100`}>
                <span className="text-sm font-semibold text-gray-900 truncate">{user.name}</span>
                <span className="text-xs text-violet-500 font-bold capitalize">{user.role}</span>
              </div>
            )}
          </div>
        </div>
      </nav>
    </>
  );
}
