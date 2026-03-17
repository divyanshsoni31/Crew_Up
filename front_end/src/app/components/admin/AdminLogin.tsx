import { useState } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { Mail, Lock, ArrowRight, Shield } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

export function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(`http://${window.location.hostname}:3000/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Must be an admin
        if (data.user.role !== 'admin') {
          setError("Access denied. Admin privileges required.");
          return;
        }
        login(data.user, data.token);
        navigate("/admin/dashboard");
      } else {
        setError(data.message || "Authentication failed");
      }
    } catch (err) {
      setError("Network error. Checking backend server connection.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 relative overflow-hidden">

      {/* Ambient Animated Orbs */}
      <motion.div
        animate={{
          x: [0, 40, -40, 0],
          y: [0, -40, 40, 0],
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        className="absolute top-[15%] left-[15%] w-[500px] h-[500px] bg-red-400/20 rounded-full blur-[100px] pointer-events-none"
      />
      <motion.div
        animate={{
          x: [0, -60, 60, 0],
          y: [0, 60, -60, 0],
        }}
        transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
        className="absolute bottom-[10%] right-[15%] w-[600px] h-[600px] bg-purple-400/20 rounded-full blur-[100px] pointer-events-none"
      />

      <motion.div
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.3, 0.4, 0.3],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[40%] left-[50%] -translate-x-1/2 w-[600px] h-[300px] bg-indigo-400/20 rounded-full blur-[120px] pointer-events-none"
      />

      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-pink-500 rounded-[1.25rem] flex items-center justify-center mx-auto mb-4 shadow-lg shadow-red-500/20 border border-white/50">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-extrabold text-gray-900 mb-2 tracking-tight drop-shadow-sm">Admin Portal</h1>
          <p className="text-gray-500 font-medium">Secure access for crew administrators</p>
        </div>

        <div className="bg-white/60 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-white p-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-white/40 to-transparent pointer-events-none"></div>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative z-10">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Admin Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-white/50 border border-gray-200 text-gray-900 rounded-2xl focus:outline-none focus:ring-2 focus:ring-red-500/50 placeholder:text-gray-400 font-medium transition-all backdrop-blur-md"
                  placeholder="admin@crewup.com"
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
                  className="w-full pl-12 pr-4 py-3.5 bg-white/50 border border-gray-200 text-gray-900 rounded-2xl focus:outline-none focus:ring-2 focus:ring-red-500/50 placeholder:text-gray-400 font-medium transition-all backdrop-blur-md"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {error && (
              <p className="text-red-400 text-sm font-medium pt-2 text-center bg-red-500/10 py-2 rounded-lg border border-red-500/20">
                {error}
              </p>
            )}

            <div className="relative z-10 pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-red-500 to-pink-500 text-white py-4 rounded-2xl font-bold text-lg hover:shadow-[0_0_30px_-5px_rgba(239,68,68,0.4)] transition-all transform hover:scale-[1.02] flex items-center justify-center gap-2 disabled:opacity-50 border border-white/50"
              >
                {isLoading ? "Verifying..." : "Access Admin Panel"}
                {!isLoading && <ArrowRight className="w-5 h-5" />}
              </button>
            </div>
          </form>

          <div className="mt-6 p-4 bg-red-50/50 rounded-2xl border border-red-100 relative z-10 backdrop-blur-md">
            <p className="text-sm text-red-600 font-medium text-center">
              🔒 Restricted to authorized administrators only
            </p>
          </div>
        </div>

        <div className="mt-8 text-center">
          <button
            onClick={() => navigate("/")}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ← Back to Home
          </button>
        </div>
      </motion.div>
    </div>
  );
}
