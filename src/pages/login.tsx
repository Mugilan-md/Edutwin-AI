import { useNavigate, Link } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { signInUser } from "../services/authService";
import { getProfile } from "../services/profileService";
import { supabase } from "../lib/supabase";
import { Sparkles, Mail, Lock, Loader2, Eye, EyeOff, Brain, TrendingUp } from "lucide-react";

// Particle Class for the Fire & Digital elements
class Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  decay: number;
  type: "ember" | "spark" | "fire" | "digital" | "smoke";
  targetX?: number;
  targetY?: number;

  constructor(
    x: number,
    y: number,
    type: "ember" | "spark" | "fire" | "digital" | "smoke",
    customColor?: string
  ) {
    this.x = x;
    this.y = y;
    this.type = type;
    this.alpha = 1;

    const colors = ["#FF6A00", "#FFC247", "#D7263D", "#F5F5F5"];
    this.color = customColor || colors[Math.floor(Math.random() * colors.length)];

    if (type === "ember") {
      this.vx = (Math.random() - 0.5) * 1.5;
      this.vy = -Math.random() * 1.8 - 0.4;
      this.size = Math.random() * 3 + 1;
      this.decay = Math.random() * 0.008 + 0.003;
    } else if (type === "spark") {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 4 + 2;
      this.vx = Math.cos(angle) * speed;
      this.vy = Math.sin(angle) * speed - 1;
      this.size = Math.random() * 2 + 0.8;
      this.decay = Math.random() * 0.03 + 0.015;
    } else if (type === "fire") {
      this.vx = (Math.random() - 0.5) * 3;
      this.vy = -Math.random() * 4 - 2;
      this.size = Math.random() * 25 + 15;
      this.decay = Math.random() * 0.02 + 0.01;
    } else if (type === "digital") {
      this.vx = (Math.random() - 0.5) * 0.8;
      this.vy = (Math.random() - 0.5) * 0.8;
      this.size = Math.random() * 2.5 + 1;
      this.decay = Math.random() * 0.005 + 0.002;
    } else {
      // smoke
      this.vx = (Math.random() - 0.5) * 0.8;
      this.vy = -Math.random() * 1.2 - 0.2;
      this.size = Math.random() * 40 + 20;
      this.decay = Math.random() * 0.006 + 0.003;
      this.alpha = 0.35;
    }
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;

    if (this.type === "digital" && this.targetX !== undefined && this.targetY !== undefined) {
      this.x += (this.targetX - this.x) * 0.08;
      this.y += (this.targetY - this.y) * 0.08;
    }

    this.alpha -= this.decay;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.globalAlpha = Math.max(0, this.alpha);
    if (this.type === "fire" || this.type === "smoke") {
      const grad = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size);
      if (this.type === "fire") {
        grad.addColorStop(0, this.color);
        grad.addColorStop(0.3, "rgba(215, 38, 61, 0.4)");
        grad.addColorStop(1, "rgba(8, 20, 38, 0)");
      } else {
        grad.addColorStop(0, "rgba(100, 100, 110, 0.15)");
        grad.addColorStop(1, "rgba(8, 20, 38, 0)");
      }
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.fillStyle = this.color;
      if (this.type === "digital") {
        ctx.shadowBlur = 8;
        ctx.shadowColor = "#FF6A00";
      }
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
}

function Login() {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Intro states: 'init' -> 'entrance' -> 'reveal' -> 'breath' -> 'transition' -> 'loop'
  const [introState, setIntroState] = useState<"init" | "entrance" | "reveal" | "breath" | "transition" | "loop">("init");
  const [showUI, setShowUI] = useState(false);

  useEffect(() => {
    const hasVisited = localStorage.getItem("edutwin_visited");
    if (hasVisited === "true") {
      setIntroState("loop");
      setShowUI(true);
    } else {
      localStorage.setItem("edutwin_visited", "true");
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let particles: Particle[] = [];
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    let time = 0;
    let phoenixX = -100;
    let phoenixY = height / 2;
    let targetX = width / 2;
    let targetY = height / 2;
    let phoenixAngle = 0;
    let stateStartTime = Date.now();

    const changeState = (newState: typeof introState) => {
      setIntroState(newState);
      stateStartTime = Date.now();
    };

    const loop = () => {
      time++;
      const elapsed = Date.now() - stateStartTime;
      const currentState = canvas.getAttribute("data-state") || "init";

      // 1. Clear background
      ctx.fillStyle = "#050508";
      ctx.fillRect(0, 0, width, height);

      // Radial Ambient Lighting
      const bgGrad = ctx.createRadialGradient(width / 2, height / 2, 10, width / 2, height / 2, Math.max(width, height));
      bgGrad.addColorStop(0, "#081426");
      bgGrad.addColorStop(0.6, "#050508");
      bgGrad.addColorStop(1, "#020203");
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      if (currentState === "init") {
        const glowGrad = ctx.createRadialGradient(0, height / 2, 50, 0, height / 2, width * 0.4);
        glowGrad.addColorStop(0, "rgba(255, 106, 0, 0.12)");
        glowGrad.addColorStop(1, "rgba(8, 20, 38, 0)");
        ctx.fillStyle = glowGrad;
        ctx.fillRect(0, 0, width, height);

        if (Math.random() < 0.15) {
          particles.push(new Particle(Math.random() * width, height + 10, "ember"));
        }

        if (elapsed > 2500) {
          changeState("entrance");
        }
      }

      else if (currentState === "entrance") {
        phoenixAngle += 0.055;
        const radius = Math.max(50, (1 - elapsed / 3000) * (width * 0.45));
        targetX = width / 2 + Math.cos(phoenixAngle) * radius;
        targetY = height / 2 + Math.sin(phoenixAngle) * radius * 0.7;

        phoenixX += (targetX - phoenixX) * 0.12;
        phoenixY += (targetY - phoenixY) * 0.12;

        for (let i = 0; i < 4; i++) {
          particles.push(new Particle(phoenixX, phoenixY, "fire", "#FF6A00"));
          particles.push(new Particle(phoenixX, phoenixY, "spark", "#FFC247"));
        }
        if (Math.random() < 0.3) {
          particles.push(new Particle(phoenixX, phoenixY, "smoke"));
        }

        drawProceduralPhoenix(ctx, phoenixX, phoenixY, phoenixAngle, Math.sin(time * 0.2));

        if (elapsed > 3200) {
          changeState("reveal");
        }
      }

      else if (currentState === "reveal") {
        phoenixX += (width / 2 - phoenixX) * 0.1;
        phoenixY += (height / 2 - phoenixY) * 0.1;

        const wingFlap = Math.sin(time * 0.2);
        for (let i = 0; i < 3; i++) {
          particles.push(new Particle(phoenixX, phoenixY, "spark", "#FFC247"));
          particles.push(new Particle(phoenixX, phoenixY, "ember", "#F5F5F5"));
        }

        const centerGlow = ctx.createRadialGradient(phoenixX, phoenixY, 10, phoenixX, phoenixY, 220);
        centerGlow.addColorStop(0, "rgba(255, 194, 71, 0.25)");
        centerGlow.addColorStop(1, "rgba(8, 20, 38, 0)");
        ctx.fillStyle = centerGlow;
        ctx.beginPath();
        ctx.arc(phoenixX, phoenixY, 220, 0, Math.PI * 2);
        ctx.fill();

        drawProceduralPhoenix(ctx, phoenixX, phoenixY, 0, wingFlap);

        if (elapsed > 2000) {
          changeState("breath");
        }
      }

      else if (currentState === "breath") {
        phoenixX = width / 2;
        phoenixY = height / 2;

        const burstRate = Math.min(30, Math.floor(elapsed / 20));
        for (let i = 0; i < burstRate; i++) {
          const p = new Particle(phoenixX, phoenixY, "fire");
          const angle = Math.random() * Math.PI * 2;
          const force = Math.random() * 8 + 3;
          p.vx = Math.cos(angle) * force;
          p.vy = Math.sin(angle) * force;
          particles.push(p);
        }

        ctx.save();
        ctx.globalAlpha = Math.max(0, 1 - elapsed / 1000);
        drawProceduralPhoenix(ctx, phoenixX, phoenixY, time * 0.05, Math.sin(time * 0.4));
        ctx.restore();

        if (elapsed > 1500) {
          changeState("transition");
          setShowUI(true);
        }
      }

      else if (currentState === "transition") {
        if (particles.length < 80 && Math.random() < 0.3) {
          const px = Math.random() * width;
          const py = Math.random() * height;
          const p = new Particle(px, py, "digital", "#FF6A00");
          p.targetX = px + (Math.random() - 0.5) * 80;
          p.targetY = py + (Math.random() - 0.5) * 80;
          particles.push(p);
        }

        drawDigitalConnections(ctx, particles);

        if (elapsed > 2000) {
          changeState("loop");
        }
      }

      else {
        // loop
        if (particles.length < 60 && Math.random() < 0.25) {
          particles.push(new Particle(Math.random() * width, height + 10, "ember"));
        }
        if (Math.random() < 0.04) {
          particles.push(new Particle(Math.random() * width, height + 10, "smoke"));
        }

        drawDigitalConnections(ctx, particles);
      }

      particles.forEach((p) => {
        p.update();
        p.draw(ctx);
      });

      particles = particles.filter((p) => p.alpha > 0);
      animationId = requestAnimationFrame(loop);
    };

    loop();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", handleResize);
    };
  }, [introState]);

  const drawProceduralPhoenix = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    angle: number,
    wingOffset = 0
  ) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);

    const coreGlow = ctx.createRadialGradient(0, 0, 0, 0, 0, 80);
    coreGlow.addColorStop(0, "rgba(255, 194, 71, 0.8)");
    coreGlow.addColorStop(0.3, "rgba(255, 106, 0, 0.4)");
    coreGlow.addColorStop(1, "rgba(215, 38, 61, 0)");
    ctx.fillStyle = coreGlow;
    ctx.beginPath();
    ctx.arc(0, 0, 80, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#FF6A00";
    ctx.shadowBlur = 20;
    ctx.shadowColor = "#FFC247";
    ctx.beginPath();
    ctx.moveTo(0, -25);
    ctx.quadraticCurveTo(8, 0, 0, 25);
    ctx.quadraticCurveTo(-8, 0, 0, -25);
    ctx.fill();

    ctx.fillStyle = "#D7263D";
    const flapWidth = 55 + wingOffset * 20;

    // Left Wing
    ctx.beginPath();
    ctx.moveTo(-5, -5);
    ctx.bezierCurveTo(-35, -45 - wingOffset * 15, -flapWidth, -80, -80, -10 + wingOffset * 10);
    ctx.bezierCurveTo(-45, 15, -20, 20, -5, 5);
    ctx.fill();

    // Right Wing
    ctx.beginPath();
    ctx.moveTo(5, -5);
    ctx.bezierCurveTo(35, -45 + wingOffset * 15, flapWidth, -80, 80, -10 + wingOffset * 10);
    ctx.bezierCurveTo(45, 15, 20, 20, 5, 5);
    ctx.fill();

    // Eyes
    ctx.fillStyle = "#FFF";
    ctx.shadowBlur = 10;
    ctx.shadowColor = "#FFF";
    ctx.beginPath();
    ctx.arc(-3, -15, 1.8, 0, Math.PI * 2);
    ctx.arc(3, -15, 1.8, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  };

  const drawDigitalConnections = (ctx: CanvasRenderingContext2D, pList: Particle[]) => {
    const digitals = pList.filter((p) => p.type === "digital" || p.type === "ember");
    ctx.save();
    ctx.lineWidth = 0.5;
    for (let i = 0; i < digitals.length; i++) {
      for (let j = i + 1; j < digitals.length; j++) {
        const dist = Math.hypot(digitals[i].x - digitals[j].x, digitals[i].y - digitals[j].y);
        if (dist < 120) {
          ctx.strokeStyle = `rgba(255, 106, 0, ${0.15 * (1 - dist / 120)})`;
          ctx.beginPath();
          ctx.moveTo(digitals[i].x, digitals[i].y);
          ctx.lineTo(digitals[j].x, digitals[j].y);
          ctx.stroke();
        }
      }
    }
    ctx.restore();
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMessage("Please enter both email and password.");
      return;
    }

    setLoading(true);
    setErrorMessage("");

    try {
      const { data, error } = await signInUser(email, password);

      if (error) {
        setErrorMessage(error.message);
        setLoading(false);
        return;
      }

      if (data?.user) {
        const { data: profile, error: profileError } = await getProfile(data.user.id);
        
        if (profileError || !profile) {
          localStorage.setItem("user_role", "student");
          localStorage.setItem("user_name", email.split("@")[0]);
          navigate("/profile");
        } else {
          localStorage.setItem("user_role", profile.role || "student");
          localStorage.setItem("user_name", profile.full_name || "");
          
          if (profile.role === "faculty") {
            navigate("/faculty");
          } else if (profile.role === "admin") {
            navigate("/admin");
          } else {
            navigate("/student");
          }
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || "An unexpected error occurred.");
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
        options: {
          redirectTo: window.location.origin + "/student",
        },
      });

      if (error) {
        setErrorMessage(error.message);
      }
    } catch (err: any) {
      setErrorMessage(err.message || "OAuth login failed.");
    } finally {
      setLoading(false);
    }
  };

  const skipIntro = () => {
    setIntroState("loop");
    setShowUI(true);
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center bg-[#050508] overflow-hidden select-none font-['Inter']">
      
      {/* CSS Injection for moving fire & fluid flame animations */}
      <style>{`
        @keyframes fireMotion {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes flamePulse {
          0%, 100% { opacity: 0.15; transform: scale(1); }
          50% { opacity: 0.35; transform: scale(1.15); }
        }
        @keyframes sparksUp {
          0% { transform: translateY(10%) translateX(0px); opacity: 0; }
          50% { opacity: 0.6; }
          100% { transform: translateY(-110%) translateX(20px); opacity: 0; }
        }
      `}</style>

      {/* 60FPS High Performance Particle Canvas */}
      <canvas 
        ref={canvasRef} 
        data-state={introState}
        className="absolute inset-0 w-full h-full block z-0 pointer-events-none"
      />

      {/* Volumetric smoke & cinematic lighting mesh */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(215,38,61,0.05)_0%,transparent_50%),radial-gradient(ellipse_at_top_right,rgba(255,194,71,0.05)_0%,transparent_60%)] pointer-events-none z-10"></div>

      {/* Skip Button during Intro */}
      {introState !== "loop" && (
        <button
          onClick={skipIntro}
          className="absolute top-6 right-6 z-40 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white px-4 py-2 rounded-lg border border-white/10 text-xs font-black uppercase tracking-widest transition-all duration-300 backdrop-blur-sm cursor-pointer"
        >
          Skip Intro
        </button>
      )}

      {/* Interactive Forms & Info Modules */}
      <div className={`w-full max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between p-6 md:p-12 relative z-30 transition-all duration-1000 ${showUI ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"}`}>
        
        {/* Left Side: Brand presentation */}
        <div className="w-full md:w-1/2 text-left mb-10 md:mb-0 pr-0 md:pr-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#D7263D] via-[#FF6A00] to-[#FFC247] flex items-center justify-center text-white font-bold shadow-lg shadow-orange-500/20">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="font-black text-2xl tracking-tight bg-gradient-to-r from-white via-orange-100 to-amber-200 bg-clip-text text-transparent">Edutwin AI</span>
              <span className="block text-xs text-orange-400 font-bold uppercase tracking-widest -mt-1">Student Twin Hub</span>
            </div>
          </div>

          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight mb-4">
            Shaping Future <br/>
            <span className="bg-gradient-to-r from-[#FF6A00] via-[#FFC247] to-amber-200 bg-clip-text text-transparent">Careers with AI</span>
          </h1>
          <p className="text-sm text-indigo-200/60 max-w-md leading-relaxed mb-8">
            Rebirth of campus records. Centralize achievements, run automated credit audits, and project accuracy metrics on student graduation profiles.
          </p>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-3 bg-white/[0.02] border border-white/5 rounded-2xl">
              <div className="w-8 h-8 rounded-lg bg-[#2a0c04] border border-orange-500/20 flex items-center justify-center text-orange-400">
                <Brain className="w-4.5 h-4.5" />
              </div>
              <span className="text-xs font-semibold text-indigo-100/80">ML Twin Analysis</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-white/[0.02] border border-white/5 rounded-2xl">
              <div className="w-8 h-8 rounded-lg bg-[#2a0c04] border border-red-500/20 flex items-center justify-center text-red-400">
                <TrendingUp className="w-4.5 h-4.5" />
              </div>
              <span className="text-xs font-semibold text-indigo-100/80">Accreditation Forecast</span>
            </div>
          </div>
        </div>

        {/* Right Side: Ultra Glassmorphism Login Card */}
        <div className="w-full md:w-[420px] shrink-0">
          <div className="bg-white/[0.02] border border-white/10 backdrop-blur-2xl p-8 md:p-10 rounded-3xl shadow-2xl shadow-black/80 space-y-6 relative overflow-hidden">
            
            <div className="absolute top-[-10%] right-[-10%] w-36 h-36 bg-[#FF6A00]/5 rounded-full blur-3xl pointer-events-none"></div>

            <div>
              <h2 className="text-2xl font-black text-white">Welcome Back</h2>
              <p className="text-xs text-orange-200/50 mt-1">Sign in to access your digital student portfolio</p>
            </div>

            {errorMessage && (
              <div className="p-3.5 bg-red-950/40 border border-red-800/40 text-red-400 rounded-xl text-xs font-semibold">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4" autoComplete="off">
              <input type="text" name="dummy_username" style={{ display: "none" }} tabIndex={-1} aria-hidden="true" />
              <input type="password" name="dummy_password" style={{ display: "none" }} tabIndex={-1} aria-hidden="true" />

              <div className="space-y-1">
                <label className="text-[10px] font-black text-orange-300/60 uppercase tracking-widest pl-1">Email Address</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-orange-400/60">
                    <Mail className="w-4.5 h-4.5" />
                  </span>
                  <input
                    type="email"
                    id="login-email-field"
                    name="college_email_field"
                    autoComplete="off"
                    readOnly
                    onFocus={(e) => e.target.removeAttribute("readOnly")}
                    placeholder="e.g. admin@portal.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                    className="w-full pl-11 pr-4 py-3 bg-white/[0.01] border border-white/5 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF6A00] focus:bg-[#150702] text-white text-sm transition-all duration-300 font-medium"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-center pl-1 pr-1">
                  <label className="text-[10px] font-black text-orange-300/60 uppercase tracking-widest">Password</label>
                  <a href="#forgot" className="text-xs text-orange-400 hover:text-orange-300 font-bold">Forgot?</a>
                </div>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-orange-400/60">
                    <Lock className="w-4.5 h-4.5" />
                  </span>
                  <input
                    type={showPassword ? "text" : "password"}
                    id="login-password-field"
                    name="college_password_field"
                    autoComplete="new-password"
                    readOnly
                    onFocus={(e) => e.target.removeAttribute("readOnly")}
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    className="w-full pl-11 pr-12 py-3 bg-white/[0.01] border border-white/5 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF6A00] focus:bg-[#150702] text-white text-sm transition-all duration-300 font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-orange-400/60 hover:text-orange-400 transition duration-200 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-[#D7263D] via-[#FF6A00] to-[#FFC247] text-white font-bold py-3.5 px-4 rounded-xl hover:opacity-95 shadow-lg shadow-orange-950/50 transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer text-sm"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4.5 h-4.5 animate-spin" />
                    Authenticating...
                  </>
                ) : (
                  "Log In"
                )}
              </button>
            </form>

            <div className="space-y-4 pt-2">
              <div className="relative flex items-center justify-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/5"></div>
                </div>
                <span className="relative bg-[#0c0301]/10 px-4 text-[10px] font-black text-orange-300/40 uppercase tracking-widest">or</span>
              </div>

              <button
                type="button"
                onClick={() => handleOAuthLogin("google")}
                title="Sign In with Google"
                className="w-full flex items-center justify-center gap-2.5 py-3 bg-white/[0.01] hover:bg-white/[0.04] rounded-xl border border-white/5 transition cursor-pointer text-orange-200 font-bold text-xs"
              >
                <svg className="w-4.5 h-4.5" viewBox="0 0 24 24">
                  <path fill="#ea4335" d="M12 5.04c1.66 0 3.2.57 4.38 1.69l3.27-3.27C17.68 1.54 14.98 1 12 1 7.35 1 3.37 3.67 1.39 7.56l3.85 2.99c.9-2.7 3.4-4.51 6.76-4.51z" />
                  <path fill="#4285f4" d="M23.49 12.27c0-.81-.07-1.59-.2-2.36H12v4.51h6.46c-.28 1.48-1.12 2.73-2.38 3.58l3.7 2.87c2.16-2 3.71-4.94 3.71-8.6z" />
                  <path fill="#fbbc05" d="M5.24 14.56c-.24-.72-.38-1.5-.38-2.31s.14-1.59.38-2.31L1.39 6.95C.5 8.75 0 10.79 0 12.91s.5 4.16 1.39 5.96l3.85-2.95z" />
                  <path fill="#34a853" d="M12 23c3.24 0 5.97-1.07 7.96-2.91l-3.7-2.87c-1.03.69-2.35 1.1-4.26 1.1-3.36 0-5.86-1.81-6.76-4.51l-3.85 2.99C3.37 20.33 7.35 23 12 23z" />
                </svg>
                Sign In with Google
              </button>
            </div>

            <div className="pt-2 text-center">
              <p className="text-xs text-orange-200/50 font-semibold">
                Don't have an account?{" "}
                <Link
                  to="/register"
                  className="text-orange-400 hover:text-orange-300 font-black transition-colors duration-300"
                >
                  Sign Up
                </Link>
              </p>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}

export default Login;