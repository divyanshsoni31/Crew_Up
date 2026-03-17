import { useNavigate, useLocation } from "react-router";
import { Home, Search, ClipboardList, User, Award, LogOut } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

export function VolunteerNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const navItems = [
    { icon: Home, label: "Home", path: "/volunteer/dashboard" },
    { icon: Search, label: "Find Events", path: "/volunteer/events" },
    { icon: ClipboardList, label: "Applications", path: "/volunteer/applications" },
    { icon: Award, label: "Certificates", path: "/volunteer/certificates" },
    { icon: User, label: "Profile", path: "/volunteer/profile" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 md:hidden">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`flex flex-col items-center gap-1 p-2 rounded-[1rem] transition-all ${
              location.pathname === item.path
                ? "text-fuchsia-600 font-bold"
                : "text-muted-foreground hover:text-gray-900"
            }`}
          >
            <item.icon className="w-6 h-6" />
            <span className="text-xs">{item.label}</span>
          </button>
        ))}
        <button
          onClick={handleLogout}
          className="flex flex-col items-center gap-1 p-2 rounded-[1rem] text-muted-foreground hover:text-red-500 transition-colors"
        >
          <LogOut className="w-6 h-6" />
          <span className="text-xs">Logout</span>
        </button>
      </div>
    </nav>
  );
}
