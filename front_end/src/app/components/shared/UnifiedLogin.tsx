import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { Mail, Lock, User, ArrowRight, Briefcase, Users } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { toast } from 'react-toastify';
import { useGoogleLogin } from '@react-oauth/google';

export function UnifiedLogin() {
    const [searchParams] = useSearchParams();
    const requestedRole = searchParams.get('role');

    const [isLogin, setIsLogin] = useState(true);
    const [activeRole, setActiveRole] = useState<'volunteer' | 'organizer'>(
        (requestedRole as 'volunteer' | 'organizer') || 'volunteer'
    );
    const [roleSelected, setRoleSelected] = useState(!!requestedRole);

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate();
    const { login } = useAuth();

    // Ref to avoid stale closures in Google Login callback
    const stateRef = React.useRef({ isLogin, activeRole, roleSelected });
    useEffect(() => {
        stateRef.current = { isLogin, activeRole, roleSelected };
    }, [isLogin, activeRole, roleSelected]);

    const doGoogleLogin = useGoogleLogin({
        flow: 'auth-code',
        redirect_uri: 'http://localhost:5173',
        onSuccess: async (codeResponse) => {
            setIsLoading(true);
            try {
                const response = await fetch(`http://${window.location.hostname}:3000/api/auth/google`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        code: codeResponse.code,
                        role: stateRef.current.activeRole,
                        isLogin: stateRef.current.isLogin
                    }),
                });

                const data = await response.json();

                if (response.ok) {
                    toast.success(`Successfully authenticated with Google!`);
                    login(data.user, data.token);
                    navigate(`/${data.user.role}/dashboard`);
                } else {
                    if (data.requiresSignup) {
                        toast.info(data.message);
                        setIsLogin(false); // Switch the view to Sign Up automatically
                    } else {
                        toast.error(data.message || "Google authentication failed");
                    }
                }
            } catch (err) {
                toast.error("Network error. Ensure the backend server is running.");
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        },
        onError: errorResponse => {
            toast.error("Google Login Failed");
            console.error(errorResponse);
        },
    });

    // If URL changes, sync the active role
    useEffect(() => {
        if (requestedRole === 'organizer' || requestedRole === 'volunteer') {
            setActiveRole(requestedRole as 'volunteer' | 'organizer');
            setRoleSelected(true);
        }
    }, [requestedRole]);

    const handleGoogleLoginClick = () => {
        // Enforce explicit role selection during Sign Up AND if they are new, force them through Sign Up
        if (!isLogin && !roleSelected) {
            toast.warning("Please explicitly select a role (Volunteer or Organizer) before signing up with Google.");
            return;
        }

        doGoogleLogin();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
            const bodyPayload = isLogin
                ? JSON.stringify({ email, password })
                : JSON.stringify({ name, email, password, role: activeRole });

            const response = await fetch(`http://${window.location.hostname}:3000${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: bodyPayload,
            });

            const data = await response.json();

            if (response.ok) {
                if (isLogin) {
                    toast.success(`Welcome back!`);
                    login(data.user, data.token);
                    navigate(`/${data.user.role}/dashboard`);
                } else {
                    toast.info(`Please check your email (${email}) for the OTP code!`);
                    navigate(`/verify-otp?email=${email}&role=${activeRole}`);
                }
            } else {
                if (data.requiresOTP) {
                    toast.info('You need to verify your email first.');
                    navigate(`/verify-otp?email=${email}&role=${activeRole}`);
                } else {
                    toast.error(data.message || "Authentication failed");
                }
            }
        } catch (err) {
            toast.error("Network error. Ensure the backend server is running.");
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 relative overflow-hidden">

            {/* Ambient Background Orbs */}
            <motion.div
                animate={{
                    x: [0, 50, -50, 0],
                    y: [0, -50, 50, 0],
                }}
                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                className="absolute top-[10%] left-[20%] w-[500px] h-[500px] bg-violet-400/30 rounded-full blur-[100px] pointer-events-none"
            />
            <motion.div
                animate={{
                    x: [0, -70, 70, 0],
                    y: [0, 70, -70, 0],
                }}
                transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
                className="absolute bottom-[10%] right-[20%] w-[600px] h-[600px] bg-fuchsia-400/20 rounded-full blur-[100px] pointer-events-none"
            />
            <motion.div
                animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.3, 0.5, 0.3],
                }}
                transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-[40%] left-[50%] -translate-x-1/2 w-[800px] h-[400px] bg-blue-400/20 rounded-full blur-[120px] pointer-events-none"
            />

            {/* Dynamic Header Animation mapping dependent on Role Context */}
            <motion.div
                key={activeRole}
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.4 }}
                className="text-center mb-8 max-w-md relative z-10"
            >
                <div className={`w-20 h-20 rounded-[1.5rem] flex items-center justify-center mx-auto mb-6 shadow-xl transition-colors duration-500
          ${activeRole === 'volunteer'
                        ? 'bg-gradient-to-br from-violet-500 to-fuchsia-500 shadow-violet-500/20'
                        : 'bg-gradient-to-br from-blue-500 to-indigo-600 shadow-blue-500/20'}`}>
                    {activeRole === 'volunteer' ? <Users className="w-10 h-10 text-white" /> : <Briefcase className="w-10 h-10 text-white" />}
                </div>

                <h1 className="text-4xl font-extrabold mb-3 tracking-tight text-gray-900 drop-shadow-sm">
                    {isLogin ? "Welcome Back" : (activeRole === 'volunteer' ? "Join as Volunteer" : "Create Organization")}
                </h1>
                <p className="text-gray-500 font-medium text-lg">
                    {isLogin ? "Sign in to access your dashboard" : (activeRole === 'volunteer' ? "Start making an impact today" : "Manage events and recruit efficiently")}
                </p>
            </motion.div>

            <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-full max-w-md relative z-10"
            >
                <div className="bg-white/60 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-white p-8 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-b from-white/40 to-transparent pointer-events-none"></div>

                    <form onSubmit={handleSubmit} className="space-y-6">

                        {/* Dynamic Sign-Up Tabs (Only show during Creation mode) */}
                        <AnimatePresence>
                            {!isLogin && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="flex gap-2 p-1.5 bg-gray-100/50 rounded-2xl mb-6 overflow-hidden backdrop-blur-md border border-white/50"
                                >
                                    <button
                                        type="button"
                                        onClick={() => { setActiveRole('volunteer'); setRoleSelected(true); }}
                                        className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all duration-300 ${activeRole === 'volunteer' && roleSelected
                                            ? 'bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white shadow-lg'
                                            : 'text-gray-500 hover:text-gray-900 bg-white/50'
                                            }`}
                                    >
                                        🚀 Volunteer
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => { setActiveRole('organizer'); setRoleSelected(true); }}
                                        className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all duration-300 ${activeRole === 'organizer' && roleSelected
                                            ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg'
                                            : 'text-gray-500 hover:text-gray-900 bg-white/50'
                                            }`}
                                    >
                                        🏢 Organizer
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Form Fields */}
                        {!isLogin && (
                            <div className="relative z-10">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    {activeRole === 'volunteer' ? "Full Name" : "Organization Name"}
                                </label>
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full pl-12 pr-4 py-3.5 bg-white/50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-violet-500/50 text-gray-900 placeholder:text-gray-400 font-medium transition-all backdrop-blur-md"
                                        placeholder={`Enter ${activeRole === 'volunteer' ? 'your name' : 'organization name'}`}
                                        required={!isLogin}
                                    />
                                </div>
                            </div>
                        )}

                        <div className="relative z-10">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3.5 bg-white/50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-violet-500/50 text-gray-900 placeholder:text-gray-400 font-medium transition-all backdrop-blur-md"
                                    placeholder="your@email.com"
                                    required
                                />
                            </div>
                        </div>

                        <div className="relative z-10">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3.5 bg-white/50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-violet-500/50 text-gray-900 placeholder:text-gray-400 font-medium transition-all backdrop-blur-md"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`w-full text-white py-4 flex items-center justify-center gap-2 rounded-2xl font-bold text-lg transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100
                ${activeRole === 'volunteer'
                                    ? 'bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:shadow-[0_0_40px_-10px_rgba(139,92,246,0.6)]'
                                    : 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:shadow-[0_0_40px_-10px_rgba(59,130,246,0.6)]'}`}
                        >
                            {isLoading ? "Processing..." : isLogin ? "Sign In" : "Create Account"}
                            {!isLoading && <ArrowRight className="w-5 h-5" />}
                        </button>

                        <div className="relative flex items-center py-2 z-10">
                            <div className="flex-grow border-t border-gray-200"></div>
                            <span className="flex-shrink-0 mx-4 text-gray-500 text-sm font-medium">Or continue with</span>
                            <div className="flex-grow border-t border-gray-200"></div>
                        </div>

                        <button
                            type="button"
                            onClick={handleGoogleLoginClick}
                            disabled={isLoading}
                            className={`relative z-10 w-full bg-white text-gray-700 py-3.5 flex items-center justify-center gap-3 rounded-2xl font-bold text-lg border shadow-sm transition-all hover:bg-gray-50 hover:shadow-md disabled:opacity-50
                                ${!isLogin && !roleSelected ? 'border-amber-400 ring-2 ring-amber-400/20' : 'border-gray-200'}
                            `}
                        >
                            <svg className="w-6 h-6" viewBox="0 0 24 24">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                            </svg>
                            Google
                        </button>
                    </form>

                    <div className="mt-8 text-center pt-6 border-t border-gray-200 relative z-10">
                        <button
                            onClick={() => setIsLogin(!isLogin)}
                            className="text-gray-500 hover:text-gray-900 transition-colors font-medium text-[15px]"
                        >
                            {isLogin ? "Don't have an account? " : "Already have an account? "}
                            <span className={activeRole === 'volunteer' ? 'text-violet-600 font-bold' : 'text-blue-600 font-bold'}>
                                {isLogin ? "Sign Up" : "Sign In"}
                            </span>
                        </button>
                    </div>
                </div>

                <div className="mt-8 text-center">
                    <button
                        onClick={() => navigate("/")}
                        className="text-gray-500 hover:text-gray-900 transition-colors font-medium flex items-center justify-center gap-2 mx-auto"
                    >
                        <ArrowRight className="w-4 h-4 rotate-180" />
                        Back to Home
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
