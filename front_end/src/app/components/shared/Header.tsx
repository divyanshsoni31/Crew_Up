import { Bell, Search, LogOut, User as UserIcon } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { Link, useNavigate } from "react-router";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import BlackLogo from "../../assets/Black_Logo.png";

export function Header() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    if (!user) return null;

    const handleLogout = () => {
        logout();
        navigate("/");
    };

    const handleProfileClick = () => {
        navigate(`/${user.role === 'admin' ? 'admin' : user.role === 'organizer' ? 'organizer' : 'volunteer'}/profile`);
    };

    return (
        <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 z-50 flex items-center justify-between px-4 md:px-6 shadow-sm">
            {/* Logo & Branding */}
            <div className="flex items-center gap-2 gap-y-2">
                <Link to="/" className="flex items-center">
                    <img
                        src={BlackLogo}
                        alt="CrewUp Logo"
                        className="w-10 h-10 sm:w-15 sm:h-15 mx-auto mt-2"
                    />
                    {/* <span className="font-bold text-xl md:text-2xl tracking-tight hidden sm:block">
                        Crew<span className="text-primary">Up</span>
                    </span> */}
                </Link>
            </div>

            {/* Actions & Profile */}
            <div className="flex items-center gap-3 md:gap-5">
                <button className="p-2 text-gray-500 hover:text-gray-900 transition-colors hidden sm:block">
                    <Search className="w-5 h-5" />
                </button>
                <button className="p-2 text-gray-500 hover:text-gray-900 transition-colors relative">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                </button>

                <div className="h-6 w-px bg-gray-200 mx-1 hidden sm:block"></div>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button className="flex items-center gap-2 p-1 pr-3 rounded-full hover:bg-gray-100/50 transition-all border border-transparent hover:border-gray-200 outline-none focus:ring-4 focus:ring-primary/20">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-white font-bold shadow-sm ring-2 ring-white">
                                {user.name.charAt(0)}
                            </div>
                            <div className="hidden md:flex flex-col text-left">
                                <span className="text-sm font-semibold text-gray-900 leading-tight">{user.name}</span>
                                <span className="text-xs text-gray-500 capitalize leading-tight">{user.role}</span>
                            </div>
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 mt-2 rounded-xl border border-gray-100 shadow-xl bg-white p-2">
                        <DropdownMenuLabel className="font-normal">
                            <div className="flex flex-col space-y-1">
                                <p className="text-sm font-medium leading-none">{user.name}</p>
                                <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator className="bg-gray-100 my-2" />
                        <DropdownMenuItem onClick={handleProfileClick} className="cursor-pointer rounded-lg hover:bg-gray-50 focus:bg-gray-50">
                            <UserIcon className="mr-2 h-4 w-4" />
                            <span>My Profile</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-gray-100 my-2" />
                        <DropdownMenuItem onClick={handleLogout} className="cursor-pointer rounded-lg text-red-600 hover:bg-red-50 focus:bg-red-50 hover:text-red-700 focus:text-red-700">
                            <LogOut className="mr-2 h-4 w-4" />
                            <span>Log out</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}
