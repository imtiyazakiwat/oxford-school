"use client";

import { useState, useRef, useEffect } from "react";
import { Mail, Lock, User, Eye, EyeOff, Check, AlertCircle, CheckCircle, ArrowLeft, RefreshCw } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import GlobalPopup from "./GlobalPopup";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: "signin" | "register";
  onModeChange: (mode: "signin" | "register") => void;
  onLoginSuccess?: () => void;
}

export default function AuthModal({
  isOpen,
  onClose,
  mode,
  onModeChange,
  onLoginSuccess,
}: AuthModalProps) {
  const { signIn, signUp } = useAuth();
  const [userType, setUserType] = useState<"student" | "staff">("student");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Form fields
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // State
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showVerificationMessage, setShowVerificationMessage] = useState(false);
  
  // Forgot password states
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
  const [showOTPInput, setShowOTPInput] = useState(false);
  const [otpDigits, setOtpDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [showNewPasswordField, setShowNewPasswordField] = useState(false);
  const [showConfirmNewPasswordField, setShowConfirmNewPasswordField] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const passwordsMatch = password.length > 0 && password === confirmPassword;
  const isPasswordValid = password.length >= 8;

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  // Handle OTP input for individual boxes
  const handleOTPChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return; // Only allow digits

    const newOtpDigits = [...otpDigits];
    newOtpDigits[index] = value.slice(-1); // Only take last digit
    setOtpDigits(newOtpDigits);

    // Auto-focus next input
    if (value && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOTPKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleOTPPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    const newOtpDigits = [...otpDigits];
    for (let i = 0; i < pastedData.length; i++) {
      newOtpDigits[i] = pastedData[i];
    }
    setOtpDigits(newOtpDigits);
    // Focus last filled input or first empty
    const lastIndex = Math.min(pastedData.length, 5);
    otpInputRefs.current[lastIndex]?.focus();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (mode === "register") {
      // Validate password length
      if (!isPasswordValid) {
        setError("Password must be at least 8 characters long.");
        setIsLoading(false);
        return;
      }
      // Validate passwords match
      if (!passwordsMatch) {
        setError("Passwords do not match.");
        setIsLoading(false);
        return;
      }

      // Sign up with Supabase
      const { error: signUpError, needsVerification } = await signUp(email, password, fullName);
      if (signUpError) {
        setError(signUpError);
        setIsLoading(false);
        return;
      }
      if (needsVerification) {
        setShowVerificationMessage(true);
        setIsLoading(false);
        return;
      }
    } else {
      // Sign in with Supabase
      const { error: signInError } = await signIn(email, password);
      if (signInError) {
        setError(signInError);
        setIsLoading(false);
        return;
      }
      setIsLoading(false);
      onLoginSuccess?.();
    }
  };

  const newPasswordsMatch = newPassword.length > 0 && newPassword === confirmNewPassword;
  const isNewPasswordValid = newPassword.length >= 8;

  const resetForm = () => {
    setFullName("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setError("");
    setShowVerificationMessage(false);
    setShowForgotPassword(false);
    setForgotPasswordEmail("");
    setShowOTPInput(false);
    setOtpDigits(["", "", "", "", "", ""]);
    setNewPassword("");
    setConfirmNewPassword("");
    setResetSuccess(false);
    setResendCooldown(0);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleModeChange = (newMode: "signin" | "register") => {
    resetForm();
    onModeChange(newMode);
  };

  const handleSendResetOTP = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/send-reset-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotPasswordEmail }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to send reset code");
        setIsLoading(false);
        return;
      }

      setShowOTPInput(true);
      setResendCooldown(60); // 60 second cooldown
      setIsLoading(false);
    } catch {
      setError("Failed to send reset code. Please try again.");
      setIsLoading(false);
    }
  };

  const handleVerifyOTPAndReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const otp = otpDigits.join("");
    if (otp.length !== 6) {
      setError("Please enter the complete 6-digit code");
      return;
    }

    if (!isNewPasswordValid) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    if (!newPasswordsMatch) {
      setError("Passwords do not match.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: forgotPasswordEmail,
          otp,
          newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to reset password");
        setIsLoading(false);
        return;
      }

      setResetSuccess(true);
      setIsLoading(false);
    } catch {
      setError("Failed to reset password. Please try again.");
      setIsLoading(false);
    }
  };

  const handleBackToSignIn = () => {
    setShowForgotPassword(false);
    setForgotPasswordEmail("");
    setShowOTPInput(false);
    setOtpDigits(["", "", "", "", "", ""]);
    setNewPassword("");
    setConfirmNewPassword("");
    setResetSuccess(false);
    setResendCooldown(0);
    setError("");
  };

  // Email verification success message
  if (showVerificationMessage) {
    return (
      <GlobalPopup
        isOpen={isOpen}
        onClose={handleClose}
        size="sm"
        showCloseButton={false}
      >
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2" style={{ fontFamily: "var(--font-display)" }}>
            Check Your Email
          </h2>
          <p className="text-gray-600 mb-6">
            We&apos;ve sent a verification link to <strong>{email}</strong>. Please check your inbox and click the link to verify your account.
          </p>
          <button
            onClick={() => handleModeChange("signin")}
            className="btn-primary w-full"
          >
            Back to Sign In
          </button>
        </div>
      </GlobalPopup>
    );
  }

  // Password reset success message
  if (resetSuccess) {
    return (
      <GlobalPopup
        isOpen={isOpen}
        onClose={handleClose}
        size="sm"
        showCloseButton={false}
      >
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2" style={{ fontFamily: "var(--font-display)" }}>
            Password Reset Successful!
          </h2>
          <p className="text-gray-600 mb-6">
            Your password has been successfully updated. You can now sign in with your new password.
          </p>
          <button
            onClick={handleBackToSignIn}
            className="btn-primary w-full"
          >
            Sign In
          </button>
        </div>
      </GlobalPopup>
    );
  }

  // Forgot password flow - OTP verification and new password
  if (showForgotPassword) {
    return (
      <GlobalPopup
        isOpen={isOpen}
        onClose={handleClose}
        size="sm"
        showCloseButton={true}
      >
        {showOTPInput ? (
          // OTP Screen Header
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-[#c41e3a]/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-[#c41e3a]" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2" style={{ fontFamily: "var(--font-display)" }}>
              Reset Your Password
            </h2>
            <p className="text-gray-600 mb-1">
              We&apos;ve sent a 6-digit code to
            </p>
            <p className="text-[#c41e3a] font-medium">{forgotPasswordEmail}</p>
          </div>
        ) : (
          // Email Input Screen Header
          <>
            <div className="flex justify-center mb-6">
              <img
                src="/img/logo.png"
                alt="New Oxford Coaching Classes"                className="w-16 h-16 object-contain rounded-full"
              />
            </div>
            <h2
              className="text-2xl font-bold text-center text-gray-900 mb-2"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Reset Password
            </h2>
            <p className="text-gray-500 text-center text-sm mb-6">
              Enter your email address and we&apos;ll send you a verification code.
            </p>
          </>
        )}

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-600 text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        {!showOTPInput ? (
          // Step 1: Email input
          <form className="space-y-4" onSubmit={handleSendResetOTP}>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                placeholder="Email Address"
                value={forgotPasswordEmail}
                onChange={(e) => setForgotPasswordEmail(e.target.value)}
                required
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#c41e3a] transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Sending Code...
                </span>
              ) : (
                "Send Reset Code"
              )}
            </button>
          </form>
        ) : (
          // Step 2: OTP + New Password
          <form className="space-y-4" onSubmit={handleVerifyOTPAndReset}>
            {/* OTP Input Boxes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3 text-center">Enter Verification Code</label>
              <div className="flex justify-center gap-2 mb-2">
                {otpDigits.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => { otpInputRefs.current[index] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOTPChange(index, e.target.value)}
                    onKeyDown={(e) => handleOTPKeyDown(index, e)}
                    onPaste={index === 0 ? handleOTPPaste : undefined}
                    className="w-11 h-13 sm:w-12 sm:h-14 text-center text-xl sm:text-2xl font-bold border-2 border-gray-300 rounded-lg focus:outline-none focus:border-[#c41e3a] transition-colors bg-white"
                  />
                ))}
              </div>
            </div>

            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type={showNewPasswordField ? "text" : "password"}
                placeholder="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={8}
                className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#c41e3a] transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowNewPasswordField(!showNewPasswordField)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showNewPasswordField ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            {newPassword.length > 0 && !isNewPasswordValid && (
              <p className="text-xs text-red-500 -mt-2">Password must be at least 8 characters</p>
            )}

            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type={showConfirmNewPasswordField ? "text" : "password"}
                placeholder="Confirm New Password"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                required
                className={`w-full pl-12 pr-20 py-3 border rounded-lg focus:outline-none transition-colors ${
                  newPasswordsMatch
                    ? "border-green-500 focus:border-green-500"
                    : "border-gray-300 focus:border-[#c41e3a]"
                }`}
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                {newPasswordsMatch && <Check className="w-5 h-5 text-green-500" />}
                <button
                  type="button"
                  onClick={() => setShowConfirmNewPasswordField(!showConfirmNewPasswordField)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  {showConfirmNewPasswordField ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || otpDigits.join("").length !== 6 || !isNewPasswordValid || !newPasswordsMatch}
              className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Resetting Password...
                </span>
              ) : (
                "Reset Password"
              )}
            </button>

            {/* Resend Code Button with Cooldown */}
            <button
              type="button"
              onClick={() => handleSendResetOTP()}
              disabled={isLoading || resendCooldown > 0}
              className="w-full flex items-center justify-center gap-2 text-sm text-[#c41e3a] hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
              {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : "Resend Code"}
            </button>
          </form>
        )}

        <button
          onClick={handleBackToSignIn}
          className="flex items-center justify-center gap-2 w-full mt-4 text-sm text-gray-600 hover:text-[#c41e3a] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Sign In
        </button>
      </GlobalPopup>
    );
  }


  return (
    <GlobalPopup
      isOpen={isOpen}
      onClose={handleClose}
      size="sm"
      showCloseButton={true}
    >
      <div className="flex justify-center mb-6">
        <img
                src="/img/logo.png"
                alt="New Oxford Coaching Classes"
                className="w-16 h-16 object-contain rounded-full"
        />
      </div>

      <h2
        className="text-2xl font-bold text-center text-gray-900 mb-2"
        style={{ fontFamily: "var(--font-display)" }}
      >
        {mode === "signin" ? "Welcome Back" : "Create Account"}
      </h2>
      <p className="text-gray-500 text-center text-sm mb-6">
        {mode === "signin"
          ? "Sign in to access your student dashboard"
          : "Join New Oxford Coaching Classes today"}
      </p>

      <div className="flex gap-2 p-1 bg-gray-100 rounded-lg mb-6">
        {(["student", "staff"] as const).map((type) => (
          <button
            key={type}
            onClick={() => setUserType(type)}
            className={`flex-1 py-2.5 text-sm font-medium rounded-md transition-all ${
              userType === type
                ? "bg-[#c41e3a] text-white shadow"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </button>
        ))}
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-600 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      <form className="space-y-4" onSubmit={handleSubmit}>
        {mode === "register" && (
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Full Name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#c41e3a] transition-colors"
            />
          </div>
        )}

        <div className="relative">
          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#c41e3a] transition-colors"
          />
        </div>

        <div className="relative">
          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#c41e3a] transition-colors"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>

        {mode === "register" && (
          <>
            {password.length > 0 && !isPasswordValid && (
              <p className="text-xs text-red-500 -mt-2">Password must be at least 8 characters</p>
            )}
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className={`w-full pl-12 pr-20 py-3 border rounded-lg focus:outline-none transition-colors ${
                  passwordsMatch
                    ? "border-green-500 focus:border-green-500"
                    : "border-gray-300 focus:border-[#c41e3a]"
                }`}
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                {passwordsMatch && <Check className="w-5 h-5 text-green-500" />}
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </>
        )}

        {mode === "signin" && (
          <div className="text-right">
            <button 
              type="button" 
              onClick={() => {
                setShowForgotPassword(true);
                setForgotPasswordEmail(email);
              }}
              className="text-sm text-[#c41e3a] hover:underline"
            >
              Forgot Password?
            </button>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              {mode === "signin" ? "Signing In..." : "Creating Account..."}
            </span>
          ) : mode === "signin" ? (
            "Sign In"
          ) : (
            "Create Account"
          )}
        </button>
      </form>

      <p className="text-center text-sm text-gray-500 mt-6">
        {mode === "signin" ? "Don't have an account? " : "Already have an account? "}
        <button
          onClick={() => handleModeChange(mode === "signin" ? "register" : "signin")}
          className="text-[#c41e3a] font-medium hover:underline"
        >
          {mode === "signin" ? "Register" : "Sign In"}
        </button>
      </p>
    </GlobalPopup>
  );
}
