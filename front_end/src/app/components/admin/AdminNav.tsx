import { useNavigate, useLocation } from "react-router";
import { Home, Users, Calendar, Shield, BarChart3, LogOut } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

export function AdminNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const navItems = [
    { icon: Home, label: "Dashboard", path: "/admin/dashboard" },
    { icon: Users, label: "Users", path: "/admin/users" },
    { icon: Calendar, label: "Events", path: "/admin/events" },
    { icon: Shield, label: "Verifications", path: "/admin/verifications" },
    { icon: BarChart3, label: "Reports", path: "/admin/reports" },
  ];

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden md:block bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <div className="font-bold text-xl">
                CrewUp <span className="text-red-600">Admin</span>
              </div>
              <div className="flex gap-2">
                {navItems.map((item) => (
                  <button
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                      location.pathname === item.path
                        ? "bg-red-100 text-red-600 font-medium"
                        : "text-muted-foreground hover:bg-gray-100"
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-xl transition-all"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
        <div className="flex items-center justify-around py-2">
          {navItems.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${
                location.pathname === item.path
                  ? "text-red-600"
                  : "text-muted-foreground"
              }`}
            >
              <item.icon className="w-6 h-6" />
              <span className="text-xs">{item.label}</span>
            </button>
          ))}
          <button
            onClick={handleLogout}
            className="flex flex-col items-center gap-1 p-2 rounded-xl text-red-600"
          >
            <LogOut className="w-6 h-6" />
            <span className="text-xs">Logout</span>
          </button>
        </div>
      </nav>
    </>
  );
}
