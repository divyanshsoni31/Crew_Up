import { useNavigate, useLocation } from "react-router";
import { LayoutDashboard, PlusCircle, Calendar, Users, Star, LogOut } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

export function OrganizerNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const navItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/organizer/dashboard" },
    { icon: PlusCircle, label: "Create", path: "/organizer/create-event" },
    { icon: Calendar, label: "Events", path: "/organizer/events" },
    { icon: Users, label: "Applications", path: "/organizer/applications" },
    { icon: Star, label: "Ratings", path: "/organizer/ratings" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 md:hidden">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${
              location.pathname === item.path
                ? "text-purple-600"
                : "text-muted-foreground"
            }`}
          >
            <item.icon className="w-6 h-6" />
            <span className="text-xs">{item.label}</span>
          </button>
        ))}
        <button
          onClick={handleLogout}
          className="flex flex-col items-center gap-1 p-2 rounded-xl text-muted-foreground"
        >
          <LogOut className="w-6 h-6" />
          <span className="text-xs">Logout</span>
        </button>
      </div>
    </nav>
  );
}