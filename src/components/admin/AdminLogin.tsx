"use client";

import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Mail, Lock, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import AdminDashboard from "./AdminDashboard";

export default function AdminLogin() {
  const { user, signIn, signOut, loading, fetchUserRole } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [checkingRole, setCheckingRole] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);

  // Check if already logged in as admin
  useEffect(() => {
    const checkAdminAccess = async () => {
      if (user && !loading) {
        setCheckingRole(true);
        const role = await fetchUserRole();
        if (role === "admin" || user?.email === "admin@oxfordschool.com") {
          setIsAuthorized(true);
        } else if (role) {
          // User is logged in but not admin
          setError("Access denied. You don't have admin privileges.");
          await signOut();
        }
        setCheckingRole(false);
      }
    };
    checkAdminAccess();
  }, [user, loading]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const { error: signInError, user: signedInUser } = await signIn(email, password);

    if (signInError) {
      setError(signInError);
      setIsLoading(false);
      return;
    }

    if (!signedInUser) {
      setError("Login failed. Please try again.");
      setIsLoading(false);
      return;
    }

    // Check if user has admin role using the user ID from sign-in response
    setCheckingRole(true);

    const role = await fetchUserRole(signedInUser.uid);
    console.log("Admin login - role check:", { userId: signedInUser.uid, role });

    if (role !== "admin" && signedInUser.email !== "admin@oxfordschool.com") {
      setError("Access denied. You don't have admin privileges.");
      await signOut();
      setCheckingRole(false);
      setIsLoading(false);
      return;
    }

    setIsAuthorized(true);
    setCheckingRole(false);
    setIsLoading(false);
  };


  const handleLogout = async () => {
    await signOut();
    setIsAuthorized(false);
    setEmail("");
    setPassword("");
  };

  // Show loading while checking initial auth state
  if (loading || checkingRole) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#c41e3a] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Verifying access...</p>
        </div>
      </div>
    );
  }

  // Show dashboard if authorized
  if (isAuthorized && user) {
    return <AdminDashboard onLogout={handleLogout} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-md"
      >
        {/* Login Card */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl p-8">
          {/* Logo & Title */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-[#c41e3a] to-[#8b1528] mb-4">
              <ShieldCheck className="w-8 h-8 text-white" />
            </div>
            <h1
              className="text-2xl font-bold text-white mb-2"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Admin Portal
            </h1>
            <p className="text-gray-400 text-sm">
              New Oxford Coaching Classes College Management System
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@New Oxford Coaching Classes.edu"
                  className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-[#c41e3a] focus:ring-1 focus:ring-[#c41e3a] transition-all"
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-12 pr-12 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-[#c41e3a] focus:ring-1 focus:ring-[#c41e3a] transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-red-400 text-sm text-center"
              >
                {error}
              </motion.div>
            )}

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-gradient-to-r from-[#c41e3a] to-[#9b1830] text-white font-semibold rounded-xl hover:from-[#a81832] hover:to-[#7d1326] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In to Dashboard"
              )}
            </button>
          </form>

          {/* Security Notice */}
          <div className="mt-6 p-4 bg-white/5 rounded-xl border border-white/10">
            <p className="text-xs text-gray-400 text-center">
              🔒 This portal is restricted to authorized administrators only.
              Unauthorized access attempts are logged and monitored.
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-gray-500 text-sm mt-6">
          © 2025 New Oxford Coaching Classes Institutions. All rights reserved.
        </p>
      </motion.div>
    </div>
  );
}
