import { useNavigate, Link } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { signInUser } from "../services/authService";
import { getProfile } from "../services/profileService";
import { supabase } from "../lib/supabase";
import { Sparkles, Mail, Lock, Loader2, Eye, EyeOff, Brain, GraduationCap, Award, Briefcase, TrendingUp } from "lucide-react";

// Particle Class for 4K Embers & Smoke
class Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  decay: number;
  type: "ember" | "spark" | "fire" | "digital" | "smoke" | "flame_shape";
  targetX?: number;
  targetY?: number;

  constructor(
    x: number,
    y: number,
    type: "ember" | "spark" | "fire" | "digital" | "smoke" | "flame_shape",
    customColor?: string
  ) {
    this.x = x;
    this.y = y;
    this.type = type;
    this.alpha = 1;

    const colors = ["#FF6A00", "#FFC247", "#D7263D", "#F5F5F5"];
    this.color = customColor || colors[Math.floor(Math.random() * colors.length)];

    if (type === "ember") {
      this.vx = (Math.random() - 0.5) * 2;
      this.vy = -Math.random() * 2.2 - 0.6;
      this.size = Math.random() * 3.5 + 1.2;
      this.decay = Math.random() * 0.007 + 0.003;
    } else if (type === "spark") {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 6 + 3;
      this.vx = Math.cos(angle) * speed;
      this.vy = Math.sin(angle) * speed - 1.5;
      this.size = Math.random() * 2.5 + 1;
      this.decay = Math.random() * 0.025 + 0.012;
    } else if (type === "fire") {
      this.vx = (Math.random() - 0.5) * 4;
      this.vy = -Math.random() * 5 - 3;
      this.size = Math.random() * 35 + 20;
      this.decay = Math.random() * 0.018 + 0.008;
    } else if (type === "flame_shape") {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 5 + 2;
      this.vx = Math.cos(angle) * speed;
      this.vy = Math.sin(angle) * speed - 1;
      this.size = Math.random() * 50 + 30; // Large fire billows
      this.decay = Math.random() * 0.02 + 0.015;
    } else if (type === "digital") {
      this.vx = (Math.random() - 0.5) * 0.6;
      this.vy = (Math.random() - 0.5) * 0.6;
      this.size = Math.random() * 3 + 1;
      this.decay = Math.random() * 0.004 + 0.002;
    } else {
      this.vx = (Math.random() - 0.5) * 1.2;
      this.vy = -Math.random() * 1.6 - 0.3;
      this.size = Math.random() * 60 + 30;
      this.decay = Math.random() * 0.005 + 0.0025;
      this.alpha = 0.3;
    }
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;

    if (this.type === "digital" && this.targetX !== undefined && this.targetY !== undefined) {
      this.x += (this.targetX - this.x) * 0.07;
      this.y += (this.targetY - this.y) * 0.07;
    }

    this.alpha -= this.decay;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.globalAlpha = Math.max(0, this.alpha);
    if (this.type === "fire" || this.type === "smoke" || this.type === "flame_shape") {
      const grad = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size);
      if (this.type === "flame_shape") {
        grad.addColorStop(0, "rgba(255, 194, 71, 0.9)");
        grad.addColorStop(0.2, "rgba(255, 106, 0, 0.7)");
        grad.addColorStop(0.5, "rgba(215, 38, 61, 0.3)");
        grad.addColorStop(1, "rgba(8, 20, 38, 0)");
      } else if (this.type === "fire") {
        grad.addColorStop(0, this.color);
        grad.addColorStop(0.3, "rgba(215, 38, 61, 0.4)");
        grad.addColorStop(1, "rgba(8, 20, 38, 0)");
      } else {
        grad.addColorStop(0, "rgba(110, 110, 120, 0.12)");
        grad.addColorStop(1, "rgba(8, 20, 38, 0)");
      }
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.fillStyle = this.color;
      if (this.type === "digital") {
        ctx.shadowBlur = 10;
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

  // States: 'init' -> 'entrance' -> 'reveal' -> 'breath' -> 'transition' -> 'loop'
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
    
    // Set 4K Ultra Quality Resolution (Backing Store scaling method)
    const resizeCanvas = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      ctx.setTransform(1, 0, 0, 1, 0, 0); // reset scale
      ctx.scale(dpr, dpr);
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    let time = 0;
    let phoenixX = -150;
    let phoenixY = window.innerHeight / 2;
    let targetX = window.innerWidth / 2;
    let targetY = window.innerHeight / 2;
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
      const w = window.innerWidth;
      const h = window.innerHeight;

      // 1. Draw solid dark background
      ctx.fillStyle = "#050508";
      ctx.fillRect(0, 0, w, h);

      // 2. Volumetric central illumination
      const bgGrad = ctx.createRadialGradient(w / 2, h / 2, 10, w / 2, h / 2, Math.max(w, h));
      bgGrad.addColorStop(0, "#081426");
      bgGrad.addColorStop(0.65, "#050508");
      bgGrad.addColorStop(1, "#020203");
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      if (currentState === "init") {
        const glowGrad = ctx.createRadialGradient(0, h / 2, 50, 0, h / 2, w * 0.45);
        glowGrad.addColorStop(0, "rgba(255, 106, 0, 0.15)");
        glowGrad.addColorStop(1, "rgba(8, 20, 38, 0)");
        ctx.fillStyle = glowGrad;
        ctx.fillRect(0, 0, w, h);

        if (Math.random() < 0.2) {
          particles.push(new Particle(Math.random() * w, h + 10, "ember"));
        }

        if (elapsed > 2500) {
          changeState("entrance");
        }
      }

      else if (currentState === "entrance") {
        phoenixAngle += 0.05;
        const radius = Math.max(80, (1 - elapsed / 3500) * (w * 0.45));
        targetX = w / 2 + Math.cos(phoenixAngle) * radius;
        targetY = h / 2 + Math.sin(phoenixAngle) * radius * 0.7;

        phoenixX += (targetX - phoenixX) * 0.1;
        phoenixY += (targetY - phoenixY) * 0.1;

        // Produce wings, feathers, & sparks from phoenix position
        for (let i = 0; i < 6; i++) {
          particles.push(new Particle(phoenixX, phoenixY, "fire", "#FF6A00"));
          particles.push(new Particle(phoenixX, phoenixY, "spark", "#FFC247"));
        }
        if (Math.random() < 0.4) {
          particles.push(new Particle(phoenixX, phoenixY, "smoke"));
        }

        // Draw Majestic procedural phoenix (Scaled up to be large and detailed)
        drawProceduralPhoenix(ctx, phoenixX, phoenixY, phoenixAngle, Math.sin(time * 0.22), time);

        if (elapsed > 3500) {
          changeState("reveal");
        }
      }

      else if (currentState === "reveal") {
        phoenixX += (w / 2 - phoenixX) * 0.08;
        phoenixY += (h / 2 - phoenixY) * 0.08;

        const wingFlap = Math.sin(time * 0.25);
        for (let i = 0; i < 4; i++) {
          particles.push(new Particle(phoenixX, phoenixY, "spark", "#FFC247"));
          particles.push(new Particle(phoenixX, phoenixY, "ember", "#F5F5F5"));
        }

        const centerGlow = ctx.createRadialGradient(phoenixX, phoenixY, 10, phoenixX, phoenixY, 280);
        centerGlow.addColorStop(0, "rgba(255, 194, 71, 0.3)");
        centerGlow.addColorStop(1, "rgba(8, 20, 38, 0)");
        ctx.fillStyle = centerGlow;
        ctx.beginPath();
        ctx.arc(phoenixX, phoenixY, 280, 0, Math.PI * 2);
        ctx.fill();

        drawProceduralPhoenix(ctx, phoenixX, phoenixY, 0, wingFlap, time);

        if (elapsed > 2000) {
          changeState("breath");
        }
      }

      else if (currentState === "breath") {
        phoenixX = w / 2;
        phoenixY = h / 2;

        // Draw beak fire flames (flame shape billows emitting from mouth)
        const beakX = phoenixX;
        const beakY = phoenixY - 30; // approximate beak coordinate

        // Stream real fire billows
        const burstRate = Math.min(25, Math.floor(elapsed / 25));
        for (let i = 0; i < burstRate; i++) {
          particles.push(new Particle(beakX, beakY, "flame_shape"));
        }

        ctx.save();
        ctx.globalAlpha = Math.max(0, 1 - elapsed / 1200);
        drawProceduralPhoenix(ctx, phoenixX, phoenixY, time * 0.03, Math.sin(time * 0.4), time);
        ctx.restore();

        if (elapsed > 1800) {
          changeState("transition");
          setShowUI(true);
        }
      }

      else if (currentState === "transition") {
        if (particles.length < 90 && Math.random() < 0.35) {
          const px = Math.random() * w;
          const py = Math.random() * h;
          const p = new Particle(px, py, "digital", "#FF6A00");
          p.targetX = px + (Math.random() - 0.5) * 100;
          p.targetY = py + (Math.random() - 0.5) * 100;
          particles.push(p);
        }

        drawDigitalConnections(ctx, particles);

        if (elapsed > 2000) {
          changeState("loop");
        }
      }

      else {
        // loop background
        if (particles.length < 80 && Math.random() < 0.28) {
          particles.push(new Particle(Math.random() * w, h + 10, "ember"));
        }
        if (Math.random() < 0.05) {
          particles.push(new Particle(Math.random() * w, h + 10, "smoke"));
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
      window.removeEventListener("resize", resizeCanvas);
    };
  }, [introState]);

  // Renders a highly realistic, majestic phoenix
  const drawProceduralPhoenix = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    angle: number,
    wingOffset = 0,
    time = 0
  ) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);

    // Large Majestic Scale Factor
    const scale = 1.6;
    ctx.scale(scale, scale);

    // Dynamic glowing body aura
    const coreGlow = ctx.createRadialGradient(0, 0, 0, 0, 0, 90);
    coreGlow.addColorStop(0, "rgba(255, 210, 80, 0.95)");
    coreGlow.addColorStop(0.35, "rgba(255, 106, 0, 0.5)");
    coreGlow.addColorStop(1, "rgba(215, 38, 61, 0)");
    ctx.fillStyle = coreGlow;
    ctx.beginPath();
    ctx.arc(0, 0, 90, 0, Math.PI * 2);
    ctx.fill();

    // 1. Detailed Head Crown/Feathers
    ctx.fillStyle = "#FFC247";
    ctx.beginPath();
    ctx.moveTo(0, -32);
    ctx.quadraticCurveTo(-15, -45, -8, -55);
    ctx.quadraticCurveTo(0, -42, 0, -32);
    ctx.moveTo(0, -32);
    ctx.quadraticCurveTo(15, -45, 8, -55);
    ctx.quadraticCurveTo(0, -42, 0, -32);
    ctx.fill();

    // Head
    ctx.fillStyle = "#FF6A00";
    ctx.beginPath();
    ctx.arc(0, -25, 8, 0, Math.PI * 2);
    ctx.fill();

    // Beak (Majestic downward curve)
    ctx.fillStyle = "#FFC247";
    ctx.beginPath();
    ctx.moveTo(0, -28);
    ctx.lineTo(8, -25);
    ctx.lineTo(0, -22);
    ctx.fill();

    // 2. Flowing Wave Tail Feathers (Procedural Sine Waving)
    ctx.fillStyle = "#FF6A00";
    const tailWavelength = Math.sin(time * 0.15) * 12;
    ctx.beginPath();
    ctx.moveTo(-4, 25);
    ctx.bezierCurveTo(-12 + tailWavelength, 55, -20 - tailWavelength, 85, -5 + tailWavelength, 110);
    ctx.bezierCurveTo(-2, 85, -6, 55, -4, 25);
    ctx.fill();

    ctx.fillStyle = "#FFC247";
    ctx.beginPath();
    ctx.moveTo(4, 25);
    ctx.bezierCurveTo(12 - tailWavelength, 55, 20 + tailWavelength, 85, 5 - tailWavelength, 110);
    ctx.bezierCurveTo(2, 85, 6, 55, 4, 25);
    ctx.fill();

    // 3. Body
    ctx.fillStyle = "#D7263D";
    ctx.beginPath();
    ctx.moveTo(0, -25);
    ctx.quadraticCurveTo(12, 0, 0, 25);
    ctx.quadraticCurveTo(-12, 0, 0, -25);
    ctx.fill();

    // Body Feather Highlights
    ctx.fillStyle = "#FF6A00";
    ctx.beginPath();
    ctx.arc(0, -5, 5, 0, Math.PI * 2);
    ctx.arc(0, 8, 4, 0, Math.PI * 2);
    ctx.fill();

    // 4. Large Majestic Upward wings (Matches reference style)
    const flapWidth = 65 + wingOffset * 22;

    // Left Wing
    ctx.fillStyle = "#FF6A00";
    ctx.beginPath();
    ctx.moveTo(-5, -5);
    ctx.bezierCurveTo(-45, -50 - wingOffset * 15, -flapWidth, -95, -95, -25 + wingOffset * 10);
    ctx.bezierCurveTo(-55, 20, -25, 25, -5, 5);
    ctx.fill();

    // Wing secondary feathers
    ctx.fillStyle = "#D7263D";
    ctx.beginPath();
    ctx.moveTo(-5, -5);
    ctx.bezierCurveTo(-38, -42, -58, -75, -82, -20);
    ctx.bezierCurveTo(-45, 15, -22, 20, -5, 5);
    ctx.fill();

    // Right Wing
    ctx.fillStyle = "#FF6A00";
    ctx.beginPath();
    ctx.moveTo(5, -5);
    ctx.bezierCurveTo(45, -50 + wingOffset * 15, flapWidth, -95, 95, -25 + wingOffset * 10);
    ctx.bezierCurveTo(55, 20, 25, 25, 5, 5);
    ctx.fill();

    // Wing secondary feathers
    ctx.fillStyle = "#D7263D";
    ctx.beginPath();
    ctx.moveTo(5, -5);
    ctx.bezierCurveTo(38, -42, 58, -75, 82, -20);
    ctx.bezierCurveTo(45, 15, 22, 20, 5, 5);
    ctx.fill();

    // White glowing eyes
    ctx.fillStyle = "#FFF";
    ctx.shadowBlur = 8;
    ctx.shadowColor = "#FFF";
    ctx.beginPath();
    ctx.arc(-3, -25, 1.8, 0, Math.PI * 2);
    ctx.arc(3, -25, 1.8, 0, Math.PI * 2);
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
          ctx.strokeStyle = `rgba(255, 106, 0, ${0.12 * (1 - dist / 120)})`;
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
      
      {/* Dynamic Style tags */}
      <style>{`
        @keyframes sparksUp {
          0% { transform: translateY(10%) translateX(0px); opacity: 0; }
          50% { opacity: 0.6; }
          100% { transform: translateY(-110%) translateX(20px); opacity: 0; }
        }
      `}</style>

      {/* 4K Render Canvas */}
      <canvas 
        ref={canvasRef} 
        data-state={introState}
        className="absolute inset-0 w-full h-full block z-0 pointer-events-none"
      />

      {/* Ambient depth filter */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(215,38,61,0.04)_0%,transparent_50%),radial-gradient(ellipse_at_top_right,rgba(255,194,71,0.04)_0%,transparent_60%)] pointer-events-none z-10"></div>

      {introState !== "loop" && (
        <button
          onClick={skipIntro}
          className="absolute top-6 right-6 z-40 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white px-4 py-2 rounded-lg border border-white/10 text-xs font-black uppercase tracking-widest transition-all duration-300 backdrop-blur-sm cursor-pointer"
        >
          Skip Intro
        </button>
      )}

      {/* Main Container: Features restored block diagram and login card */}
      <div className={`w-full max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between p-6 md:p-12 relative z-30 transition-all duration-1000 ${showUI ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"}`}>
        
        {/* Left Side: Restored Interactive 5-Node Block Diagram */}
        <div className="w-full md:w-1/2 flex flex-col justify-between pr-0 md:pr-12 mb-10 md:mb-0">
          
          {/* Top Brand */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#D7263D] via-[#FF6A00] to-[#FFC247] flex items-center justify-center text-white font-bold shadow-lg shadow-orange-500/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-black text-xl tracking-tight bg-gradient-to-r from-white to-orange-200 bg-clip-text text-transparent">Edutwin AI</span>
              <span className="block text-[10px] text-orange-400 font-bold uppercase tracking-widest -mt-1">Student Twin Hub</span>
            </div>
          </div>

          {/* Heading */}
          <h2 className="text-3xl font-black text-white leading-tight mb-2">Shaping Future Careers with AI</h2>
          <p className="text-xs text-orange-300/80 mb-10">Holistic student activity records matching data to placements.</p>

          {/* Restored Network Block Diagram */}
          <div className="relative w-80 h-80 mx-auto flex items-center justify-center mb-8">
            
            {/* Center Brain Hub */}
            <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-[#D7263D] via-[#FF6A00] to-[#FFC247] flex flex-col items-center justify-center p-1 border border-orange-400/40 shadow-[0_0_40px_rgba(249,115,22,0.4)] relative z-20 animate-[pulse_3s_ease-in-out_infinite]">
              <Brain className="w-9 h-9 text-white animate-[bounce_4s_infinite]" />
              <span className="text-[9px] font-black tracking-wider uppercase mt-1 text-orange-100">EDUTWIN AI</span>
            </div>

            {/* Connecting paths */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-10" viewBox="0 0 320 320">
              <line x1="60" y1="60" x2="160" y2="160" stroke="rgba(249,115,22,0.3)" strokeWidth="2" strokeDasharray="4 4" />
              <line x1="260" y1="60" x2="160" y2="160" stroke="rgba(239,68,68,0.3)" strokeWidth="2" strokeDasharray="4 4" />
              <line x1="40" y1="160" x2="160" y2="160" stroke="rgba(245,158,11,0.3)" strokeWidth="2" strokeDasharray="4 4" />
              <line x1="280" y1="160" x2="160" y2="160" stroke="rgba(249,115,22,0.3)" strokeWidth="2" strokeDasharray="4 4" />
              <line x1="160" y1="270" x2="160" y2="160" stroke="rgba(249,115,22,0.3)" strokeWidth="2" strokeDasharray="4 4" />
            </svg>

            {/* 5 Nodes */}
            <div className="absolute top-[30px] left-[20px] z-20 flex flex-col items-center group cursor-pointer">
              <div className="w-10 h-10 rounded-xl bg-[#2a0c04] border border-orange-500/20 flex items-center justify-center text-orange-400 group-hover:bg-orange-600 group-hover:text-white transition-all duration-300">
                <GraduationCap className="w-5 h-5" />
              </div>
              <span className="text-[9px] font-bold mt-1 text-orange-300 bg-[#1f0702] border border-orange-950 px-2 py-0.5 rounded-md whitespace-nowrap">Academic Performance</span>
            </div>

            <div className="absolute top-[30px] right-[20px] z-20 flex flex-col items-center group cursor-pointer">
              <div className="w-10 h-10 rounded-xl bg-[#2a0c04] border border-red-500/20 flex items-center justify-center text-red-400 group-hover:bg-red-600 group-hover:text-white transition-all duration-300">
                <Award className="w-5 h-5" />
              </div>
              <span className="text-[9px] font-bold mt-1 text-red-300 bg-[#1f0702] border border-orange-950 px-2 py-0.5 rounded-md whitespace-nowrap">Co-Curricular Activities</span>
            </div>

            <div className="absolute left-[-10px] top-[140px] z-20 flex flex-col items-center group cursor-pointer">
              <div className="w-10 h-10 rounded-xl bg-[#2a0c04] border border-amber-500/20 flex items-center justify-center text-amber-400 group-hover:bg-amber-600 group-hover:text-white transition-all duration-300">
                <Sparkles className="w-5 h-5" />
              </div>
              <span className="text-[9px] font-bold mt-1 text-amber-300 bg-[#1f0702] border border-orange-950 px-2 py-0.5 rounded-md whitespace-nowrap">Skills & Certifications</span>
            </div>

            <div className="absolute right-[-10px] top-[140px] z-20 flex flex-col items-center group cursor-pointer">
              <div className="w-10 h-10 rounded-xl bg-[#2a0c04] border border-orange-500/20 flex items-center justify-center text-orange-400 group-hover:bg-orange-600 group-hover:text-white transition-all duration-300">
                <Briefcase className="w-5 h-5" />
              </div>
              <span className="text-[9px] font-bold mt-1 text-orange-300 bg-[#1f0702] border border-orange-950 px-2 py-0.5 rounded-md whitespace-nowrap">Internships & Projects</span>
            </div>

            <div className="absolute bottom-[10px] left-1/2 -translate-x-1/2 z-20 flex flex-col items-center group cursor-pointer">
              <div className="w-10 h-10 rounded-xl bg-[#2a0c04] border border-orange-500/20 flex items-center justify-center text-orange-400 group-hover:bg-orange-600 group-hover:text-white transition-all duration-300">
                <TrendingUp className="w-5 h-5" />
              </div>
              <span className="text-[9px] font-bold mt-1 text-orange-300 bg-[#1f0702] border border-orange-950 px-2 py-0.5 rounded-md whitespace-nowrap">Placement Prediction</span>
            </div>

          </div>

          <div className="border-t border-orange-500/10 pt-4">
            <p className="text-[9px] text-orange-300/40 leading-relaxed text-center md:text-left">
              Holistic Data · Intelligent Predictions · Better Placements. Deployed securely with Supabase RLS.
            </p>
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