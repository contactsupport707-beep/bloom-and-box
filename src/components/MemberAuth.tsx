/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { 
  Mail, 
  User, 
  Phone, 
  Lock, 
  Sparkles, 
  ArrowRight, 
  RotateCcw, 
  CheckCircle, 
  AlertCircle,
  Flower2,
  Bookmark
} from "lucide-react";
import { BoutiqueUser } from "../types";
import { RedFlowerHamperLogo } from "./RedFlowerHamperLogo";

interface MemberAuthProps {
  onAuthSuccess: (user: BoutiqueUser) => void;
  brandColorAccent: string;
  buttonRoundedness: "none" | "md" | "xl" | "full";
  buttonStyle: "gradient" | "gold-outline" | "solid-accent" | "minimalist";
}

// Particle details for animated flora
interface FloralPetal {
  id: number;
  x: number;
  y: number;
  size: number;
  speedY: number;
  speedX: number;
  rotation: number;
  rotSpeed: number;
  opacity: number;
  type: "rose" | "peony" | "sakura" | "gold";
}

export function MemberAuth({ 
  onAuthSuccess, 
  brandColorAccent = "#c5a059", 
  buttonRoundedness = "xl",
  buttonStyle = "gradient"
}: MemberAuthProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [mobile, setMobile] = useState("");
  
  // Verification states
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [countdown, setCountdown] = useState(0);
  const [canResend, setCanResend] = useState(false);
  
  // Status feedback states
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  
  // Dev assistance backdoor
  const [testingOtp, setTestingOtp] = useState<string | null>(null);

  // Animated flora canvas
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const petalsRef = useRef<FloralPetal[]>([]);
  const animationFrameRef = useRef<number | null>(null);

  // Countdown timer for OTP resend
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown((p) => p - 1);
      }, 1000);
    } else if (countdown === 0 && otpSent) {
      setCanResend(true);
    }
    return () => clearInterval(timer);
  }, [countdown, otpSent]);

  // Floral animated falling simulation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const handleResize = () => {
      canvas.width = canvas.parentElement?.clientWidth || window.innerWidth;
      canvas.height = canvas.parentElement?.clientHeight || 650;
    };
    handleResize();
    window.addEventListener("resize", handleResize);

    // Bootstrap petals list
    const initialCount = 28;
    const items: FloralPetal[] = [];
    const types: ("rose" | "peony" | "sakura" | "gold")[] = ["rose", "peony", "sakura", "gold"];
    for (let i = 0; i < initialCount; i++) {
      items.push({
        id: i,
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height - canvas.height,
        size: Math.random() * 12 + 6,
        speedY: Math.random() * 1.2 + 0.6,
        speedX: Math.random() * 0.8 - 0.4,
        rotation: Math.random() * 360,
        rotSpeed: Math.random() * 2 - 1,
        opacity: Math.random() * 0.6 + 0.3,
        type: types[Math.floor(Math.random() * types.length)]
      });
    }
    petalsRef.current = items;

    // Simulation Loop
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const petals = petalsRef.current;

      petals.forEach((p) => {
        p.y += p.speedY;
        p.x += p.speedX + Math.sin(p.y / 30) * 0.2;
        p.rotation += p.rotSpeed;

        // Reset if falling below viewport
        if (p.y > canvas.height) {
          p.y = -20;
          p.x = Math.random() * canvas.width;
          p.opacity = Math.random() * 0.6 + 0.3;
        }

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.globalAlpha = p.opacity;

        // Style based on petal classification (Luxury blush, lavender, ivory, gold scheme)
        if (p.type === "rose") {
          // Blush Pink Rose shape
          ctx.beginPath();
          ctx.fillStyle = "#fbcfe8"; // Blush Pink Tailwind light
          ctx.ellipse(0, 0, p.size, p.size / 1.5, 0, 0, 2 * Math.PI);
          ctx.fill();
          // Inner petal contour
          ctx.strokeStyle = "#f472b6";
          ctx.lineWidth = 0.5;
          ctx.stroke();
        } else if (p.type === "peony") {
          // Soft lavender Peony shape
          ctx.beginPath();
          ctx.fillStyle = "#e9d5ff"; // Lavender
          ctx.ellipse(0, 0, p.size * 1.1, p.size / 1.3, Math.PI / 4, 0, 2 * Math.PI);
          ctx.fill();
        } else if (p.type === "sakura") {
          // Heart-shaped cherry blossom
          ctx.beginPath();
          ctx.fillStyle = "#fff1f2"; // Rose-50 Ivory tint
          ctx.arc(-p.size / 3, 0, p.size / 2, 0, Math.PI * 2);
          ctx.arc(p.size / 3, 0, p.size / 2, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Luxury golden sparkle particle
          ctx.beginPath();
          ctx.fillStyle = "#f59e0b"; // Golden Amber
          ctx.arc(0, 0, p.size / 4, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowColor = "#f59e0b";
          ctx.shadowBlur = 8;
        }

        ctx.restore();
      });

      animationFrameRef.current = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      window.removeEventListener("resize", handleResize);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, []);

  const BUTTON_ROUNDEDNESS_MAP = {
    none: "rounded-none",
    md: "rounded-md",
    xl: "rounded-xl",
    full: "rounded-full"
  };

  // Trigger Send OTP Request
  const handleInitiateOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");
    setTestingOtp(null);

    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          action: isLogin ? "login" : "signup",
          name: isLogin ? "" : fullName,
          phone: isLogin ? "" : mobile
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "An unexpected error occurred sending OTP.");
      }

      setOtpSent(true);
      setCountdown(60);
      setCanResend(false);
      setSuccessMsg(`Exquisite OTP access key generated & routed successfully.`);

      if (data.testing && data.otp) {
        setTestingOtp(data.otp);
      }
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Verify code & authenticate
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otpCode.length < 6) {
      setErrorMsg("Please type the complete 6-digit passcode.");
      return;
    }

    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          otp: otpCode.trim(),
          action: isLogin ? "login" : "signup"
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Passcode verification failed.");
      }

      setSuccessMsg("Authentication established successfully!");
      setTimeout(() => {
        onAuthSuccess(data.user);
      }, 1000);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Reset flows back to inputting stage
  const handleGoBack = () => {
    setOtpSent(false);
    setOtpCode("");
    setTestingOtp(null);
    setErrorMsg("");
    setSuccessMsg("");
  };

  return (
    <div className="relative min-h-[620px] w-full flex items-center justify-center p-4 py-16 text-stone-200 overflow-hidden" id="luxury-auth-canvas-container">
      
      {/* Background Animated Floral simulation */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-0 opacity-80" />

      {/* Decorative ambient shadows, backdrops & blurs */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-pink-400/10 rounded-full blur-[100px] pointer-events-none z-0" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-400/10 rounded-full blur-[100px] pointer-events-none z-0" />

      {/* Main Glassmorphism verification card */}
      <div 
        id="member-auth-card" 
        className="relative z-10 w-full max-w-md backdrop-blur-xl bg-black/60 border border-white/10 p-8 sm:p-10 rounded-3xl shadow-2xl shadow-stone-950/40 relative overflow-hidden flex flex-col justify-between"
      >
        <div className="absolute inset-0 bg-gradient-to-tr from-pink-300/5 via-transparent to-purple-500/5 pointer-events-none" />
        
        <div className="space-y-6">
          {/* Brand Logo & Header */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center">
              {/* Custom Red Flower Hamper Logo */}
              <RedFlowerHamperLogo size={48} className="animate-pulse" />
            </div>
            
            <h2 className="text-3xl font-serif text-white tracking-widest uppercase font-light pt-2">
              BLOOM & BOX
            </h2>
            <div className="h-[1px] w-12 bg-[#c5a059] mx-auto mt-1" />

            <h3 className="text-xl font-serif font-light text-white pt-2 leading-tight">
              {otpSent ? "Member Access" : isLogin ? "Welcome Back" : "Create Your Account"}
            </h3>
            
            <p className="text-[11px] text-stone-400 max-w-xs mx-auto leading-relaxed">
              {otpSent 
                ? `An access pass was issued to ${email}.`
                : isLogin 
                  ? "Login to manage your premium orders, wishlist, and custom details." 
                  : "Begin your luxury gifting journey and gain registry loyalty points."
              }
            </p>
          </div>

          {/* Feedback alerts */}
          {errorMsg && (
            <div id="auth-error-alert" className="p-3.5 bg-red-950/40 border border-red-500/30 rounded-xl text-red-200 text-xs flex gap-2 items-start animate-fadeIn">
              <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div id="auth-success-alert" className="p-3.5 bg-emerald-950/40 border border-emerald-500/30 rounded-xl text-emerald-200 text-xs flex gap-2 items-start animate-fadeIn">
              <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Verification input panel (OTP code sent active screen) */}
          {otpSent ? (
            <form onSubmit={handleVerifyOtp} id="otp-verify-panel" className="space-y-5 animate-fadeIn">
              <div className="space-y-2">
                <label className="text-[10px] uppercase text-stone-400 tracking-wider font-extrabold flex justify-between items-center">
                  <span>Enter 6-Digit Secret Access Code</span>
                  <span className="text-[#c5a059] font-mono select-none">CODE INBOX</span>
                </label>
                
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Lock className="w-4 h-4 text-[#c5a059]" />
                  </div>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="Enter 6-digit key code"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                    className="w-full text-center font-mono letter-spacing-widest text-lg py-3.5 pl-10 pr-4 bg-stone-900/80 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#c5a059]/40"
                  />
                </div>
              </div>

              {/* Dev backdoor if credentials are empty to facilitate smooth preview testing */}
              {testingOtp && (
                <div id="testing-backdoor-hint" className="p-3 bg-[#c5a059]/10 border border-[#c5a059]/30 rounded-xl text-xs text-[#c5a059] text-center space-y-1">
                  <span className="block font-bold">✨ Dev Testing Mail Backdoor</span>
                  <p className="text-[10px] opacity-80">Mock Send active. Verification Code coordinate is: <strong>{testingOtp}</strong></p>
                </div>
              )}

              <div className="flex gap-2 items-center text-xs justify-between font-mono text-stone-400">
                {canResend ? (
                  <button
                    type="button"
                    onClick={handleInitiateOtp}
                    className="text-[#c5a059] hover:text-white transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Resend Access Code</span>
                  </button>
                ) : (
                  <span>Resend available in {countdown}s</span>
                )}

                <button
                  type="button"
                  onClick={handleGoBack}
                  className="hover:text-white transition-colors cursor-pointer font-bold uppercase tracking-widest text-[10px]"
                >
                  Edit Email Address
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3.5 font-bold uppercase tracking-widest text-xs transition-all shadow-xl hover:scale-101 flex items-center justify-center gap-2 cursor-pointer ${BUTTON_ROUNDEDNESS_MAP[buttonRoundedness]} ${
                  buttonStyle === "gradient" ? "gold-gradient text-black" :
                  buttonStyle === "solid-accent" ? "bg-[#c5a059] text-black" :
                  buttonStyle === "gold-outline" ? "border border-[#c5a059] text-[#c5a059] bg-transparent" :
                  "bg-stone-800 text-white hover:bg-stone-700"
                }`}
              >
                <span>{loading ? "Verifying coordinates..." : isLogin ? "Verify & Log In ✓" : "Verify & Create Account ✓"}</span>
              </button>
            </form>
          ) : (
            /* Email / Signup stage primary prompt panel */
            <form onSubmit={handleInitiateOtp} id="primary-form-panel" className="space-y-4 animate-fadeIn">
              
              {!isLogin && (
                <>
                  <div className="space-y-1.5 animate-fadeIn">
                    <label className="text-[10px] uppercase text-stone-400 tracking-wider font-extrabold flex items-center gap-1 font-mono">
                      <User className="w-3 h-3 text-[#c5a059]" />
                      <span>Full Guest Name</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Aditya Sharma"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full text-xs p-3.5 rounded-xl bg-stone-900/60 border border-white/5 text-white focus:outline-none focus:border-[#c5a059]/40"
                    />
                  </div>

                  <div className="space-y-1.5 animate-fadeIn">
                    <label className="text-[10px] uppercase text-stone-400 tracking-wider font-extrabold flex items-center gap-1 font-mono">
                      <Phone className="w-3 h-3 text-[#c5a059]" />
                      <span>Mobile Number (Optional)</span>
                    </label>
                    <input
                      type="tel"
                      placeholder="e.g. +91 91234 56789"
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                      className="w-full text-xs p-3.5 rounded-xl bg-stone-900/60 border border-white/5 text-white focus:outline-none focus:border-[#c5a059]/40"
                    />
                  </div>
                </>
              )}

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase text-stone-400 tracking-wider font-extrabold flex items-center gap-1 font-mono">
                  <Mail className="w-3 h-3 text-[#c5a059]" />
                  <span>Email Address coordinate</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. aditya@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full text-xs p-3.5 rounded-xl bg-stone-900/60 border border-white/5 text-white focus:outline-none focus:border-[#c5a059]/40"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-4 font-bold uppercase tracking-widest text-xs transition-all shadow-xl hover:scale-101 flex items-center justify-center gap-2 cursor-pointer ${BUTTON_ROUNDEDNESS_MAP[buttonRoundedness]} ${
                    buttonStyle === "gradient" ? "gold-gradient text-black animate-pulse" :
                    buttonStyle === "solid-accent" ? "bg-[#c5a059] text-black" :
                    buttonStyle === "gold-outline" ? "border border-[#c5a059] text-[#c5a059] bg-transparent" :
                    "bg-stone-800 text-white hover:bg-stone-700"
                  }`}
                >
                  <span>{loading ? "Generating secret keys..." : "Send Verification OTP"}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {/* Footer swap options */}
          {!otpSent && (
            <div className="text-center font-mono py-2 text-[11px] text-stone-400 border-t border-white/10 pt-4 mt-6">
              {isLogin ? (
                <span>
                  Don't have an account yet?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setIsLogin(false);
                      setErrorMsg("");
                    }}
                    className="text-[#c5a059] font-bold hover:underline cursor-pointer"
                  >
                    Create Account
                  </button>
                </span>
              ) : (
                <span>
                  Already a premium member?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setIsLogin(true);
                      setErrorMsg("");
                    }}
                    className="text-[#c5a059] font-bold hover:underline cursor-pointer"
                  >
                    Log In
                  </button>
                </span>
              )}
            </div>
          )}

        </div>
      </div>

    </div>
  );
}
