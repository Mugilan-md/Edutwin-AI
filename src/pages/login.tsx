import { useNavigate, Link } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { signInUser } from "../services/authService";
import { getProfile } from "../services/profileService";
import { supabase } from "../lib/supabase";
import {
  Sparkles,
  Mail,
  Lock,
  Loader2,
  Eye,
  EyeOff,
  Brain,
  GraduationCap,
  Award,
  Briefcase,
  TrendingUp,
} from "lucide-react";

// ─── Lightweight ember particles ─────────────────────────────────────────────
class Ember {
  x: number; y: number; vx: number; vy: number;
  size: number; alpha: number; decay: number; hue: number;

  constructor(w: number, h: number) {
    if (Math.random() < 0.7) { this.x = Math.random() * w; this.y = h + 10; }
    else { this.x = Math.random() < 0.5 ? -5 : w + 5; this.y = h * 0.5 + Math.random() * h * 0.5; }
    this.vy = -(Math.random() * 1.8 + 0.6);
    this.vx = (Math.random() - 0.5) * 1.2;
    this.size = Math.random() * 2.5 + 0.8;
    this.alpha = Math.random() * 0.7 + 0.3;
    this.decay = Math.random() * 0.004 + 0.002;
    this.hue = Math.random() * 40 + 15;
  }

  update() {
    this.x += this.vx + Math.sin(Date.now() * 0.001 + this.y) * 0.4;
    this.y += this.vy;
    this.alpha -= this.decay;
  }

  draw(ctx: CanvasRenderingContext2D) {
    if (this.alpha <= 0) return;
    ctx.save();
    ctx.globalAlpha = this.alpha;
    ctx.shadowBlur = 10;
    ctx.shadowColor = `hsla(${this.hue},100%,65%,0.9)`;
    ctx.fillStyle = `hsla(${this.hue},100%,70%,1)`;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

// ─── Main Login Page ──────────────────────────────────────────────────────────
function Login() {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showUI, setShowUI] = useState(false);

  // Show UI 1.2s after mount
  useEffect(() => {
    const t = setTimeout(() => setShowUI(true), 1200);
    return () => clearTimeout(t);
  }, []);

  // Force video play on mobile (iOS requires user interaction workaround)
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Ensure the video plays even on low-power mode on iOS
    const tryPlay = () => {
      video.play().catch(() => {
        // If autoplay fails (strict mobile policy), retry on first touch
        const resumeOnTouch = () => {
          video.play().catch(() => {});
          document.removeEventListener("touchstart", resumeOnTouch);
          document.removeEventListener("click", resumeOnTouch);
        };
        document.addEventListener("touchstart", resumeOnTouch, { once: true });
        document.addEventListener("click", resumeOnTouch, { once: true });
      });
    };

    if (video.readyState >= 2) {
      tryPlay();
    } else {
      video.addEventListener("canplay", tryPlay, { once: true });
    }

    return () => video.removeEventListener("canplay", tryPlay);
  }, []);

  // ── Ember canvas overlay ──────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Cap DPR at 2 for performance on mobile
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const resize = () => {
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    // Fewer embers on mobile to preserve FPS
    const isMobile = window.innerWidth < 768;
    const MAX_EMBERS = isMobile ? 60 : 120;
    const SPAWN_RATE = isMobile ? 0.25 : 0.4;

    let embers: Ember[] = [];
    let raf: number;

    const loop = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      ctx.clearRect(0, 0, w, h);

      if (embers.length < MAX_EMBERS && Math.random() < SPAWN_RATE) {
        embers.push(new Ember(w, h));
      }

      ctx.globalCompositeOperation = "lighter";
      for (const e of embers) { e.update(); e.draw(ctx); }
      ctx.globalCompositeOperation = "source-over";

      embers = embers.filter((e) => e.alpha > 0 && e.y > -20);
      raf = requestAnimationFrame(loop);
    };

    loop();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  // ── Auth handlers ─────────────────────────────────────────────────────────
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { setErrorMessage("Please enter both email and password."); return; }
    setLoading(true);
    setErrorMessage("");

    try {
      const { data, error } = await signInUser(email, password);
      if (error) { setErrorMessage(error.message); setLoading(false); return; }

      if (data?.user) {
        const { data: profile, error: profileError } = await getProfile(data.user.id);
        if (profileError || !profile) {
          localStorage.setItem("user_role", "student");
          localStorage.setItem("user_name", email.split("@")[0]);
          navigate("/profile");
        } else {
          localStorage.setItem("user_role", profile.role || "student");
          localStorage.setItem("user_name", profile.full_name || "");
          if (profile.role === "faculty") navigate("/faculty");
          else if (profile.role === "admin") navigate("/admin");
          else navigate("/student");
        }
      }
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthLogin = async (provider: "google" | "azure") => {
    setLoading(true);
    setErrorMessage("");
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo: window.location.origin + "/student" },
      });
      if (error) setErrorMessage(error.message);
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "OAuth login failed.");
    } finally {
      setLoading(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen min-h-dvh relative flex items-center justify-center overflow-hidden bg-black select-none">

      {/* ── CINEMATIC VIDEO BACKGROUND ─────────────────────────────────────── */}
      <video
        ref={videoRef}
        src="/phoenix_bg.mp4"
        autoPlay
        loop
        muted
        playsInline
        // webkit-playsinline for older iOS
        {...{ "webkit-playsinline": "true" } as any}
        preload="auto"
        className="absolute inset-0 w-full h-full object-cover z-0"
        style={{
          filter: "brightness(0.82) saturate(1.15) contrast(1.05)",
          // GPU compositing hint — keeps video decode off the main thread
          willChange: "transform",
          transform: "translateZ(0)",
        }}
      />

      {/* Dark gradient overlay */}
      <div className="absolute inset-0 z-10 bg-gradient-to-br from-black/55 via-black/20 to-black/60 pointer-events-none" />

      {/* Cinematic letterbox bars */}
      <div className="absolute top-0 left-0 right-0 h-12 bg-gradient-to-b from-black/80 to-transparent z-10 pointer-events-none" />
      <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-black/80 to-transparent z-10 pointer-events-none" />

      {/* Ember canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full block z-20 pointer-events-none"
      />

      {/* ── MAIN UI ─────────────────────────────────────────────────────────── */}
      <div
        className={`w-full max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-center md:justify-between gap-6 md:gap-0 px-5 md:px-14 py-6 md:py-8 relative z-30 transition-all duration-[1200ms] ease-out min-h-dvh md:min-h-0 ${
          showUI ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10 pointer-events-none"
        }`}
      >

        {/* ── LEFT: Block Diagram (hidden on small mobile, visible md+) ────── */}
        <div className="hidden md:flex w-full md:w-1/2 flex-col pr-0 md:pr-14">
          {/* Brand */}
          <div className="flex items-center gap-3 mb-7">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-[#D7263D] via-[#FF6A00] to-[#FFC247] flex items-center justify-center shadow-xl shadow-orange-600/30">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-black text-xl tracking-tight bg-gradient-to-r from-white to-orange-200 bg-clip-text text-transparent drop-shadow-lg">
                Edutwin AI
              </span>
              <span className="block text-[10px] text-orange-400 font-bold uppercase tracking-widest -mt-0.5">
                Student Twin Hub
              </span>
            </div>
          </div>

          <h2 className="text-3xl md:text-4xl font-black text-white leading-tight mb-2 drop-shadow-xl">
            Shaping Future Careers<br />
            <span className="bg-gradient-to-r from-orange-300 to-amber-200 bg-clip-text text-transparent">
              with AI
            </span>
          </h2>
          <p className="text-xs text-orange-200/70 mb-9 font-medium drop-shadow">
            Holistic student activity records — data-driven placement predictions.
          </p>

          {/* 5-Node Block Diagram */}
          <div className="relative w-80 h-80 mx-auto flex items-center justify-center mb-6">
            {/* Center Hub */}
            <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-[#D7263D] via-[#FF6A00] to-[#FFC247] flex flex-col items-center justify-center border border-orange-300/30 shadow-[0_0_60px_rgba(255,106,0,0.6)] relative z-20 animate-pulse">
              <Brain className="w-9 h-9 text-white" />
              <span className="text-[8px] font-black tracking-wider uppercase mt-1 text-white/90">EDUTWIN AI</span>
            </div>

            {/* SVG lines */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-10" viewBox="0 0 320 320">
              <line x1="60"  y1="60"  x2="160" y2="160" stroke="rgba(255,140,0,0.45)" strokeWidth="1.5" strokeDasharray="6 4" />
              <line x1="260" y1="60"  x2="160" y2="160" stroke="rgba(220,60,30,0.45)"  strokeWidth="1.5" strokeDasharray="6 4" />
              <line x1="28"  y1="160" x2="160" y2="160" stroke="rgba(255,180,20,0.45)" strokeWidth="1.5" strokeDasharray="6 4" />
              <line x1="292" y1="160" x2="160" y2="160" stroke="rgba(255,140,0,0.45)" strokeWidth="1.5" strokeDasharray="6 4" />
              <line x1="160" y1="282" x2="160" y2="160" stroke="rgba(255,140,0,0.45)" strokeWidth="1.5" strokeDasharray="6 4" />
            </svg>

            {[
              { top: "28px", left: "16px", icon: GraduationCap, label: "Academic", color: "orange" },
              { top: "28px", right: "16px", icon: Award, label: "Co-Curricular", color: "red" },
              { top: "138px", left: "-14px", icon: Sparkles, label: "Skills", color: "amber" },
              { top: "138px", right: "-14px", icon: Briefcase, label: "Internships", color: "orange" },
            ].map(({ top, left, right, icon: Icon, label, color }) => (
              <div key={label} className="absolute z-20 flex flex-col items-center group cursor-pointer" style={{ top, left, right }}>
                <div className={`w-11 h-11 rounded-xl bg-black/50 backdrop-blur-md border border-${color}-500/30 flex items-center justify-center text-${color}-400 group-hover:bg-${color}-600 group-hover:scale-110 group-hover:text-white transition-all duration-300 shadow-lg shadow-black/50`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className={`text-[9px] font-bold mt-1 text-${color}-200/90 bg-black/60 border border-${color}-800/40 px-2 py-0.5 rounded-md whitespace-nowrap backdrop-blur-sm`}>{label}</span>
              </div>
            ))}

            <div className="absolute bottom-[8px] left-1/2 -translate-x-1/2 z-20 flex flex-col items-center group cursor-pointer">
              <div className="w-11 h-11 rounded-xl bg-black/50 backdrop-blur-md border border-orange-500/30 flex items-center justify-center text-orange-400 group-hover:bg-orange-600 group-hover:scale-110 group-hover:text-white transition-all duration-300 shadow-lg shadow-black/50">
                <TrendingUp className="w-5 h-5" />
              </div>
              <span className="text-[9px] font-bold mt-1 text-orange-200/90 bg-black/60 border border-orange-800/40 px-2 py-0.5 rounded-md whitespace-nowrap backdrop-blur-sm">Placement Prediction</span>
            </div>
          </div>

          <p className="text-[10px] text-white/30 text-center md:text-left font-medium">
            Holistic Data · AI Predictions · Better Placements
          </p>
        </div>

        {/* ── RIGHT: Login Card ────────────────────────────────────────────── */}
        <div className="w-full md:w-[420px] shrink-0 flex flex-col justify-center">

          {/* Mobile-only mini brand header */}
          <div className="flex md:hidden items-center gap-2.5 mb-5 justify-center">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#D7263D] via-[#FF6A00] to-[#FFC247] flex items-center justify-center shadow-lg shadow-orange-600/30">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="font-black text-base bg-gradient-to-r from-white to-orange-200 bg-clip-text text-transparent">Edutwin AI</span>
              <span className="block text-[9px] text-orange-400 font-bold uppercase tracking-widest -mt-0.5">Student Twin Hub</span>
            </div>
          </div>

          <div className="relative bg-black/35 border border-white/10 backdrop-blur-2xl p-6 md:p-10 rounded-3xl shadow-2xl shadow-black space-y-5 overflow-hidden">

            {/* Card glows */}
            <div className="absolute -top-16 -right-16 w-40 h-40 bg-orange-500/8 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-10 -left-10 w-28 h-28 bg-red-600/6 rounded-full blur-2xl pointer-events-none" />

            {/* Header */}
            <div>
              <h2 className="text-xl md:text-2xl font-black text-white tracking-tight drop-shadow-md">Welcome Back</h2>
              <p className="text-xs text-orange-200/40 mt-1 font-medium">Sign in to your digital student portfolio</p>
            </div>

            {/* Error */}
            {errorMessage && (
              <div className="p-3.5 bg-red-950/60 border border-red-700/40 text-red-400 rounded-xl text-xs font-semibold">
                {errorMessage}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleLogin} className="space-y-4" autoComplete="off">
              <input type="text" name="_dummy_u" style={{ display: "none" }} tabIndex={-1} aria-hidden="true" />
              <input type="password" name="_dummy_p" style={{ display: "none" }} tabIndex={-1} aria-hidden="true" />

              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-orange-300/55 uppercase tracking-widest pl-1">Email Address</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Mail className="w-4 h-4 text-orange-400/50" />
                  </span>
                  <input
                    type="email"
                    autoComplete="off"
                    readOnly
                    onFocus={(e) => e.target.removeAttribute("readOnly")}
                    placeholder="student@college.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                    className="w-full pl-10 pr-4 py-3 bg-white/[0.04] border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:bg-white/[0.07] text-white text-sm transition-all duration-300 font-medium placeholder-white/20"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center px-1">
                  <label className="text-[10px] font-black text-orange-300/55 uppercase tracking-widest">Password</label>
                  <a href="#" className="text-[10px] text-orange-400 hover:text-orange-300 font-bold transition-colors">Forgot?</a>
                </div>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Lock className="w-4 h-4 text-orange-400/50" />
                  </span>
                  <input
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    readOnly
                    onFocus={(e) => e.target.removeAttribute("readOnly")}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    className="w-full pl-10 pr-11 py-3 bg-white/[0.04] border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:bg-white/[0.07] text-white text-sm transition-all duration-300 font-medium placeholder-white/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-orange-400/50 hover:text-orange-300 transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-[#D7263D] via-[#FF6A00] to-[#FFC247] text-white font-black py-3.5 rounded-xl hover:brightness-110 shadow-lg shadow-orange-900/60 transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer text-sm tracking-wide"
              >
                {loading ? (
                  <><Loader2 className="w-4 h-4 animate-spin" />Authenticating…</>
                ) : "Log In"}
              </button>
            </form>

            {/* Divider */}
            <div className="relative flex items-center">
              <div className="flex-grow border-t border-white/8" />
              <span className="mx-4 text-[10px] font-black text-white/20 uppercase tracking-widest">or</span>
              <div className="flex-grow border-t border-white/8" />
            </div>

            {/* Google OAuth */}
            <button
              type="button"
              onClick={() => handleOAuthLogin("google")}
              className="w-full flex items-center justify-center gap-2.5 py-3 bg-white/[0.04] hover:bg-white/[0.09] rounded-xl border border-white/10 transition-all duration-200 cursor-pointer text-white/65 hover:text-white font-semibold text-xs"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path fill="#ea4335" d="M12 5.04c1.66 0 3.2.57 4.38 1.69l3.27-3.27C17.68 1.54 14.98 1 12 1 7.35 1 3.37 3.67 1.39 7.56l3.85 2.99c.9-2.7 3.4-4.51 6.76-4.51z" />
                <path fill="#4285f4" d="M23.49 12.27c0-.81-.07-1.59-.2-2.36H12v4.51h6.46c-.28 1.48-1.12 2.73-2.38 3.58l3.7 2.87c2.16-2 3.71-4.94 3.71-8.6z" />
                <path fill="#fbbc05" d="M5.24 14.56c-.24-.72-.38-1.5-.38-2.31s.14-1.59.38-2.31L1.39 6.95C.5 8.75 0 10.79 0 12.91s.5 4.16 1.39 5.96l3.85-2.95z" />
                <path fill="#34a853" d="M12 23c3.24 0 5.97-1.07 7.96-2.91l-3.7-2.87c-1.03.69-2.35 1.1-4.26 1.1-3.36 0-5.86-1.81-6.76-4.51l-3.85 2.99C3.37 20.33 7.35 23 12 23z" />
              </svg>
              Continue with Google — Edutwin AI
            </button>

            {/* Sign up */}
            <p className="text-center text-xs text-white/30 font-medium pt-1">
              Don't have an account?{" "}
              <Link to="/register" className="text-orange-400 hover:text-orange-300 font-black transition-colors">
                Sign Up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;