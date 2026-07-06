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

// ─── Cinematic Fire Particle ─────────────────────────────────────────────────
// Uses HSLA color so each particle transitions from white-hot → yellow → orange → red
class FireParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;       // 0..1 normalized lifetime
  maxLife: number;
  size: number;
  hue: number;        // 0–60 for fire colours
  turbX: number;
  turbY: number;
  type: "core" | "ember" | "smoke" | "god_ray";

  constructor(
    x: number,
    y: number,
    type: "core" | "ember" | "smoke" | "god_ray" = "core"
  ) {
    this.x = x;
    this.y = y;
    this.type = type;
    this.life = 1;

    if (type === "core") {
      this.maxLife = Math.random() * 60 + 40;
      this.vx = (Math.random() - 0.5) * 3.5;
      this.vy = -(Math.random() * 4.5 + 2.5);
      this.size = Math.random() * 28 + 14;
      this.hue = Math.random() * 30;           // white-hot to yellow
      this.turbX = (Math.random() - 0.5) * 0.3;
      this.turbY = (Math.random() - 0.5) * 0.3;
    } else if (type === "ember") {
      this.maxLife = Math.random() * 120 + 80;
      this.vx = (Math.random() - 0.5) * 2;
      this.vy = -(Math.random() * 2 + 0.8);
      this.size = Math.random() * 3.5 + 1.2;
      this.hue = Math.random() * 40 + 20;
      this.turbX = (Math.random() - 0.5) * 0.15;
      this.turbY = 0;
    } else if (type === "smoke") {
      this.maxLife = Math.random() * 200 + 120;
      this.vx = (Math.random() - 0.5) * 1.2;
      this.vy = -(Math.random() * 1.2 + 0.3);
      this.size = Math.random() * 60 + 40;
      this.hue = 0;
      this.turbX = (Math.random() - 0.5) * 0.1;
      this.turbY = 0;
    } else {
      // god_ray
      this.maxLife = Math.random() * 60 + 30;
      const angle = (Math.random() - 0.5) * Math.PI * 0.6;
      const speed = Math.random() * 8 + 4;
      this.vx = Math.sin(angle) * speed;
      this.vy = -Math.cos(angle) * speed;
      this.size = Math.random() * 8 + 4;
      this.hue = Math.random() * 50 + 10;
      this.turbX = 0;
      this.turbY = 0;
    }
    this.life = this.maxLife;
  }

  update() {
    this.x += this.vx + this.turbX;
    this.y += this.vy + this.turbY;

    // Turbulence flicker
    this.turbX += (Math.random() - 0.5) * 0.4;
    this.turbX *= 0.9;

    if (this.type === "core") {
      // Fire rises and spreads
      this.vy *= 0.98;
      this.size *= 0.993;
    } else if (this.type === "ember") {
      this.vy += 0.03; // slight gravity
      this.vx *= 0.99;
    } else if (this.type === "smoke") {
      this.size *= 1.005;
      this.vy *= 0.97;
    }

    this.life -= 1;
  }

  draw(ctx: CanvasRenderingContext2D) {
    const t = this.life / this.maxLife;   // 1 (fresh) → 0 (dead)
    if (t <= 0) return;

    ctx.save();

    if (this.type === "core") {
      // White-hot → yellow → orange → red as particle ages
      const hue = this.hue + (1 - t) * 20;
      const sat = 100;
      const lit = 30 + t * 55;            // brighter when fresh
      const alpha = Math.pow(t, 0.5) * 0.85;

      const grad = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size);
      grad.addColorStop(0, `hsla(${hue}, ${sat}%, ${Math.min(lit + 30, 98)}%, ${alpha})`);
      grad.addColorStop(0.4, `hsla(${hue + 5}, ${sat}%, ${lit}%, ${alpha * 0.7})`);
      grad.addColorStop(1, `hsla(${hue + 15}, ${sat}%, 20%, 0)`);

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();

    } else if (this.type === "ember") {
      const alpha = t * 0.9;
      const hue = this.hue + (1 - t) * 30;
      ctx.fillStyle = `hsla(${hue}, 100%, ${50 + t * 40}%, ${alpha})`;
      ctx.shadowBlur = 8;
      ctx.shadowColor = `hsla(${hue}, 100%, 70%, 0.8)`;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();

    } else if (this.type === "smoke") {
      const alpha = t * 0.08;
      const grad = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size);
      grad.addColorStop(0, `rgba(80,60,50,${alpha})`);
      grad.addColorStop(1, `rgba(20,15,10,0)`);
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();

    } else {
      // god_ray — thin elongated streak
      const alpha = t * 0.6;
      ctx.globalAlpha = alpha;
      ctx.strokeStyle = `hsla(${this.hue}, 100%, 80%, ${alpha})`;
      ctx.lineWidth = this.size * t;
      ctx.shadowBlur = 20;
      ctx.shadowColor = `hsla(${this.hue}, 100%, 70%, 0.5)`;
      ctx.beginPath();
      ctx.moveTo(this.x, this.y);
      ctx.lineTo(this.x - this.vx * 8, this.y - this.vy * 8);
      ctx.stroke();
    }

    ctx.restore();
  }
}

// ─── Main Login Component ─────────────────────────────────────────────────────
function Login() {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showUI, setShowUI] = useState(false);
  const [introPhase, setIntroPhase] = useState(0); // 0=darkness 1=phoenix_enter 2=breathe 3=settle

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // ── 4K DPI-aware canvas sizing ───────────────────────────────────────────
    const dpr = Math.min(window.devicePixelRatio || 1, 3);
    const resize = () => {
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    let raf: number;
    let frame = 0;
    let particles: FireParticle[] = [];
    let beakParticles: FireParticle[] = [];

    // Phoenix position
    let px = -200;
    let py = 0;
    let wingPhase = 0;
    let currentPhase = 0;
    let phaseTimer = 0;

    // ── Noise helper (simple sin-based turbulence) ───────────────────────────
    const noise = (x: number, y: number, t: number) =>
      Math.sin(x * 0.02 + t * 0.8) *
      Math.cos(y * 0.015 + t * 0.6) *
      Math.sin(t * 0.4 + x * 0.01);

    // ── Draw cinematic sky / background glow ─────────────────────────────────
    const drawBackground = (w: number, h: number, phase: number) => {
      // Deep persistence — partial clear creates motion blur / smoke trails
      ctx.globalCompositeOperation = "source-over";
      const persistence = phase >= 2 ? 0.18 : 0.25;
      ctx.fillStyle = `rgba(4,3,8,${persistence})`;
      ctx.fillRect(0, 0, w, h);

      // Ambient light halo around phoenix position
      if (phase >= 1) {
        const intensity = Math.min(1, (phaseTimer - 60) / 120);
        const haloGrad = ctx.createRadialGradient(px, py, 0, px, py, 350);
        haloGrad.addColorStop(0, `rgba(255,160,20,${intensity * 0.18})`);
        haloGrad.addColorStop(0.4, `rgba(200,60,5,${intensity * 0.08})`);
        haloGrad.addColorStop(1, "rgba(4,3,8,0)");
        ctx.fillStyle = haloGrad;
        ctx.globalCompositeOperation = "lighter";
        ctx.fillRect(0, 0, w, h);
        ctx.globalCompositeOperation = "source-over";
      }

      // Dark vignette
      const vig = ctx.createRadialGradient(w / 2, h / 2, h * 0.25, w / 2, h / 2, h * 0.85);
      vig.addColorStop(0, "rgba(0,0,0,0)");
      vig.addColorStop(1, "rgba(0,0,0,0.65)");
      ctx.fillStyle = vig;
      ctx.fillRect(0, 0, w, h);
    };

    // ── Draw a single large feather plume ────────────────────────────────────
    const drawFeatherPlume = (
      ox: number, oy: number,
      angle: number, length: number,
      hue: number, alpha: number, t: number,
      wobble: number
    ) => {
      ctx.save();
      ctx.translate(ox, oy);
      ctx.rotate(angle + Math.sin(t * 0.9 + angle) * 0.04 * wobble);
      ctx.globalAlpha = alpha;

      // Primary feather shaft
      const grad = ctx.createLinearGradient(0, 0, 0, -length);
      grad.addColorStop(0, `hsla(${hue}, 100%, 55%, 0.9)`);
      grad.addColorStop(0.5, `hsla(${hue + 10}, 100%, 65%, 0.7)`);
      grad.addColorStop(1, `hsla(${hue + 25}, 90%, 75%, 0)`);

      const halfW = length * 0.18;
      ctx.fillStyle = grad;
      ctx.shadowBlur = 22;
      ctx.shadowColor = `hsla(${hue}, 100%, 60%, 0.6)`;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(-halfW * 0.6, -length * 0.3, -halfW, -length * 0.7, 0, -length);
      ctx.bezierCurveTo(halfW, -length * 0.7, halfW * 0.6, -length * 0.3, 0, 0);
      ctx.fill();

      ctx.restore();
    };

    // ── Draw the FULL cinematic phoenix ──────────────────────────────────────
    const drawPhoenix = (
      _w: number, _h: number, t: number,
      wingAmp: number, alpha: number
    ) => {
      ctx.save();
      ctx.globalAlpha = Math.max(0, alpha);

      const cx = px;
      const cy = py;
      const sc = 2.6;               // large, majestic scale
      wingPhase = t * 0.045;

      // ── Outer wing glow (additive bloom) ────────────────────────────────
      ctx.globalCompositeOperation = "lighter";
      const bloomR = 240 * sc * 0.5;
      const bloom = ctx.createRadialGradient(cx, cy - 10 * sc, 0, cx, cy - 10 * sc, bloomR);
      bloom.addColorStop(0, "rgba(255,200,50,0.12)");
      bloom.addColorStop(0.5, "rgba(255,80,0,0.06)");
      bloom.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = bloom;
      ctx.beginPath();
      ctx.ellipse(cx, cy, bloomR * 1.3, bloomR * 0.9, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalCompositeOperation = "source-over";
      ctx.globalAlpha = Math.max(0, alpha);

      // ── TAIL FEATHERS (long flowing) ────────────────────────────────────
      const tailFeathers = [
        { angle: Math.PI * 0.55, len: 200 * sc * 0.5, hue: 25 },
        { angle: Math.PI * 0.62, len: 180 * sc * 0.5, hue: 30 },
        { angle: Math.PI * 0.70, len: 160 * sc * 0.5, hue: 20 },
        { angle: Math.PI * 0.78, len: 145 * sc * 0.5, hue: 35 },
        { angle: Math.PI * 0.45, len: 175 * sc * 0.5, hue: 15 },
      ];
      for (const tf of tailFeathers) {
        drawFeatherPlume(
          cx + Math.cos(tf.angle) * 20 * sc * 0.5,
          cy + Math.sin(tf.angle) * 20 * sc * 0.5,
          tf.angle - Math.PI / 2,
          tf.len,
          tf.hue,
          alpha * 0.9,
          t,
          1.5
        );
      }

      // ── LEFT WING (layered feathers) ─────────────────────────────────────
      const wingLift = Math.sin(wingPhase) * wingAmp * 30;
      const wFeathers = [
        { dx: -0.22, dy: -0.12, len: 0.82, hue: 20 },
        { dx: -0.30, dy: -0.20, len: 0.70, hue: 15 },
        { dx: -0.38, dy: -0.28, len: 0.58, hue: 25 },
        { dx: -0.45, dy: -0.34, len: 0.45, hue: 10 },
        { dx: -0.48, dy: -0.38, len: 0.35, hue: 30 },
      ];
      for (let i = 0; i < wFeathers.length; i++) {
        const f = wFeathers[i];
        const fx = cx + f.dx * 280 * sc * 0.5;
        const fy = cy + f.dy * 280 * sc * 0.5 - wingLift * (1 - i / wFeathers.length);
        const angle = -Math.PI * 0.55 - i * 0.1 + Math.sin(wingPhase + i * 0.3) * 0.08 * wingAmp;
        drawFeatherPlume(fx, fy, angle, f.len * 170 * sc * 0.5, f.hue, alpha * 0.95, t, 0.8);
      }
      // Secondary left wing fan
      for (let i = 0; i < 6; i++) {
        const fan = (i - 2.5) / 5;
        const fanX = cx - 60 * sc * 0.5 + fan * 80 * sc * 0.5;
        const fanY = cy - 30 * sc * 0.5 - wingLift * 0.8;
        drawFeatherPlume(fanX, fanY, -Math.PI * 0.42 + fan * 0.35, 100 * sc * 0.5, 20 + i * 3, alpha * 0.7, t, 0.6);
      }

      // ── RIGHT WING (mirrored) ─────────────────────────────────────────────
      const rwFeathers = [
        { dx: 0.22, dy: -0.12, len: 0.82, hue: 20 },
        { dx: 0.30, dy: -0.20, len: 0.70, hue: 15 },
        { dx: 0.38, dy: -0.28, len: 0.58, hue: 25 },
        { dx: 0.45, dy: -0.34, len: 0.45, hue: 10 },
        { dx: 0.48, dy: -0.38, len: 0.35, hue: 30 },
      ];
      for (let i = 0; i < rwFeathers.length; i++) {
        const f = rwFeathers[i];
        const fx = cx + f.dx * 280 * sc * 0.5;
        const fy = cy + f.dy * 280 * sc * 0.5 - wingLift * (1 - i / rwFeathers.length);
        const angle = -Math.PI * 0.45 + i * 0.1 + Math.sin(wingPhase + i * 0.3) * 0.08 * wingAmp;
        drawFeatherPlume(fx, fy, angle, f.len * 170 * sc * 0.5, f.hue, alpha * 0.95, t, 0.8);
      }
      for (let i = 0; i < 6; i++) {
        const fan = (i - 2.5) / 5;
        const fanX = cx + 60 * sc * 0.5 + fan * 80 * sc * 0.5;
        const fanY = cy - 30 * sc * 0.5 - wingLift * 0.8;
        drawFeatherPlume(fanX, fanY, -Math.PI * 0.58 + fan * 0.35, 100 * sc * 0.5, 20 + i * 3, alpha * 0.7, t, 0.6);
      }

      // ── BODY ─────────────────────────────────────────────────────────────
      const bodyGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 50 * sc * 0.5);
      bodyGrad.addColorStop(0, "hsla(45,100%,80%,0.95)");
      bodyGrad.addColorStop(0.25, "hsla(30,100%,55%,0.85)");
      bodyGrad.addColorStop(0.7, "hsla(10,90%,35%,0.6)");
      bodyGrad.addColorStop(1, "hsla(5,80%,20%,0)");
      ctx.fillStyle = bodyGrad;
      ctx.shadowBlur = 40;
      ctx.shadowColor = "rgba(255,160,20,0.8)";
      ctx.beginPath();
      ctx.ellipse(cx, cy, 30 * sc * 0.5, 45 * sc * 0.5, 0, 0, Math.PI * 2);
      ctx.fill();

      // Feather scale texture on body
      ctx.shadowBlur = 0;
      for (let row = 0; row < 4; row++) {
        for (let col = -1; col <= 1; col++) {
          const sx = cx + col * 10 * sc * 0.5;
          const sy = cy - 15 * sc * 0.5 + row * 12 * sc * 0.5;
          const sGrad = ctx.createRadialGradient(sx, sy, 0, sx, sy, 8 * sc * 0.5);
          sGrad.addColorStop(0, "rgba(255,220,80,0.5)");
          sGrad.addColorStop(1, "rgba(200,80,0,0)");
          ctx.fillStyle = sGrad;
          ctx.beginPath();
          ctx.ellipse(sx, sy, 6 * sc * 0.5, 8 * sc * 0.5, 0.2, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // ── NECK & HEAD ───────────────────────────────────────────────────────
      const headY = cy - 55 * sc * 0.5;

      // Neck
      const neckGrad = ctx.createLinearGradient(cx - 8 * sc * 0.5, cy - 25 * sc * 0.5, cx + 8 * sc * 0.5, headY);
      neckGrad.addColorStop(0, "hsla(30,100%,50%,0.9)");
      neckGrad.addColorStop(1, "hsla(25,100%,55%,0.85)");
      ctx.fillStyle = neckGrad;
      ctx.beginPath();
      ctx.moveTo(cx - 8 * sc * 0.5, cy - 25 * sc * 0.5);
      ctx.bezierCurveTo(cx - 10 * sc * 0.5, headY + 15 * sc * 0.5, cx + 5 * sc * 0.5, headY + 10 * sc * 0.5, cx + 6 * sc * 0.5, cy - 25 * sc * 0.5);
      ctx.fill();

      // Head
      const headGrad = ctx.createRadialGradient(cx, headY, 0, cx, headY, 18 * sc * 0.5);
      headGrad.addColorStop(0, "hsla(45,100%,80%,0.95)");
      headGrad.addColorStop(0.5, "hsla(25,100%,55%,0.9)");
      headGrad.addColorStop(1, "hsla(15,90%,35%,0.6)");
      ctx.fillStyle = headGrad;
      ctx.shadowBlur = 20;
      ctx.shadowColor = "rgba(255,180,30,0.6)";
      ctx.beginPath();
      ctx.arc(cx, headY, 16 * sc * 0.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // ── CROWN FEATHERS (crest) ─────────────────────────────────────────────
      const crownFeathers = [-0.45, -0.25, -0.05, 0.15, 0.32];
      for (let i = 0; i < crownFeathers.length; i++) {
        const cf = crownFeathers[i];
        drawFeatherPlume(
          cx + cf * 20 * sc * 0.5,
          headY - 10 * sc * 0.5,
          -Math.PI * 0.85 + cf * 0.6 + Math.sin(t * 0.06 + i) * 0.06,
          45 * sc * 0.5,
          15 + i * 8,
          alpha * 0.9,
          t,
          1.2
        );
      }

      // Eyes
      ctx.shadowBlur = 15;
      ctx.shadowColor = "rgba(255,255,200,0.9)";
      ctx.fillStyle = "rgba(255,255,220,0.95)";
      ctx.beginPath();
      ctx.arc(cx - 5 * sc * 0.5, headY - 2 * sc * 0.5, 3 * sc * 0.5, 0, Math.PI * 2);
      ctx.arc(cx + 5 * sc * 0.5, headY - 2 * sc * 0.5, 3 * sc * 0.5, 0, Math.PI * 2);
      ctx.fill();
      // Pupils
      ctx.fillStyle = "rgba(20,10,5,0.9)";
      ctx.shadowBlur = 0;
      ctx.beginPath();
      ctx.arc(cx - 5 * sc * 0.5, headY - 2 * sc * 0.5, 1.5 * sc * 0.5, 0, Math.PI * 2);
      ctx.arc(cx + 5 * sc * 0.5, headY - 2 * sc * 0.5, 1.5 * sc * 0.5, 0, Math.PI * 2);
      ctx.fill();

      // Beak (curved, eagle-like)
      ctx.fillStyle = "hsla(45,100%,75%,0.9)";
      ctx.shadowBlur = 10;
      ctx.shadowColor = "rgba(255,200,50,0.8)";
      ctx.beginPath();
      ctx.moveTo(cx + 4 * sc * 0.5, headY + 2 * sc * 0.5);
      ctx.quadraticCurveTo(cx + 18 * sc * 0.5, headY + 5 * sc * 0.5, cx + 14 * sc * 0.5, headY + 12 * sc * 0.5);
      ctx.quadraticCurveTo(cx + 10 * sc * 0.5, headY + 8 * sc * 0.5, cx + 4 * sc * 0.5, headY + 2 * sc * 0.5);
      ctx.fill();

      // ── TALONS ────────────────────────────────────────────────────────────
      const talonY = cy + 50 * sc * 0.5;
      for (let side of [-1, 1]) {
        const tx = cx + side * 18 * sc * 0.5;
        ctx.strokeStyle = "hsla(30,100%,55%,0.75)";
        ctx.lineWidth = 2.5 * sc * 0.5;
        ctx.shadowBlur = 8;
        ctx.shadowColor = "rgba(255,140,0,0.6)";
        // Leg
        ctx.beginPath();
        ctx.moveTo(cx + side * 12 * sc * 0.5, cy + 38 * sc * 0.5);
        ctx.lineTo(tx, talonY);
        ctx.stroke();
        // Claws
        for (let c = -1; c <= 1; c++) {
          ctx.beginPath();
          ctx.moveTo(tx, talonY);
          ctx.quadraticCurveTo(tx + c * 12 * sc * 0.5, talonY + 8 * sc * 0.5, tx + c * 16 * sc * 0.5, talonY + 14 * sc * 0.5);
          ctx.stroke();
        }
      }
      ctx.shadowBlur = 0;

      ctx.restore();
    };

    // ── Emit volumetric beak flames ──────────────────────────────────────────
    const emitBeakFlames = (_t: number, intensity: number) => {
      // Beak tip in world coords
      const beakX = px + 16;
      const beakY = py - 55 * 2.6 * 0.5 + 9;

      for (let i = 0; i < Math.floor(intensity * 10); i++) {
        const p = new FireParticle(
          beakX + (Math.random() - 0.5) * 10,
          beakY + (Math.random() - 0.5) * 6,
          "core"
        );
        // Flames shoot right and slightly up
        p.vx = Math.random() * 7 + 3;
        p.vy = -(Math.random() * 3 + 0.5);
        p.size = Math.random() * 35 + 20;
        p.hue = Math.random() * 30;
        p.maxLife = Math.random() * 50 + 30;
        p.life = p.maxLife;
        beakParticles.push(p);
      }
      // God rays from beak
      if (Math.random() < intensity * 0.5) {
        const gr = new FireParticle(beakX, beakY, "god_ray");
        gr.vx = Math.random() * 12 + 5;
        gr.vy = -(Math.random() * 4 - 2);
        beakParticles.push(gr);
      }
      // Embers
      if (Math.random() < intensity * 0.8) {
        const em = new FireParticle(
          beakX + Math.random() * 40,
          beakY + (Math.random() - 0.5) * 20,
          "ember"
        );
        em.vx = Math.random() * 5 + 1;
        beakParticles.push(em);
      }
    };

    // ── Main animation loop ──────────────────────────────────────────────────
    const animate = () => {
      frame++;
      phaseTimer++;
      const w = window.innerWidth;
      const h = window.innerHeight;

      // Phase transitions
      if (currentPhase === 0 && phaseTimer > 100) {
        currentPhase = 1;
        phaseTimer = 0;
        px = -220;
        py = h / 2;
      } else if (currentPhase === 1 && phaseTimer > 260) {
        currentPhase = 2;
        phaseTimer = 0;
      } else if (currentPhase === 2 && phaseTimer > 200) {
        currentPhase = 3;
        phaseTimer = 0;
        setShowUI(true);
        setIntroPhase(3);
      }

      drawBackground(w, h, currentPhase);

      // ── Phase 0: darkness with very faint embers ───────────────────────
      if (currentPhase === 0) {
        if (Math.random() < 0.08) {
          const p = new FireParticle(
            Math.random() * w,
            h + 20,
            "ember"
          );
          p.vy = -(Math.random() * 1 + 0.3);
          particles.push(p);
        }
      }

      // ── Phase 1: phoenix sweeps in from left with fire trail ────────────
      if (currentPhase === 1) {
        const progress = Math.min(1, phaseTimer / 200);
        // Ease-out curve into center
        const eased = 1 - Math.pow(1 - progress, 3);
        px = -220 + (w / 2 - (-220)) * eased;
        py = h / 2 + Math.sin(progress * Math.PI * 1.5) * 80;

        const alpha = Math.min(1, phaseTimer / 60);
        drawPhoenix(w, h, frame, 1.0, alpha);

        // Trail fire particles from body
        for (let i = 0; i < 15; i++) {
          const p = new FireParticle(
            px - 30 + (Math.random() - 0.5) * 60,
            py + (Math.random() - 0.5) * 60,
            "core"
          );
          p.vx = -(Math.random() * 4 + 1);
          p.size = Math.random() * 40 + 20;
          particles.push(p);
        }
        for (let i = 0; i < 5; i++) {
          particles.push(
            new FireParticle(px + (Math.random() - 0.5) * 80, py + (Math.random() - 0.5) * 80, "ember")
          );
        }
        if (Math.random() < 0.3) {
          particles.push(
            new FireParticle(px + (Math.random() - 0.5) * 100, py + (Math.random() - 0.5) * 100, "smoke")
          );
        }

        // God-rays burst
        if (phaseTimer % 12 === 0) {
          for (let i = 0; i < 3; i++) {
            const gr = new FireParticle(px, py, "god_ray");
            particles.push(gr);
          }
        }
      }

      // ── Phase 2: hovering center, beak spews deadly fire ───────────────
      if (currentPhase === 2) {
        // Hover oscillation
        px += (w / 2 - px) * 0.04;
        py += (h / 2 - py) * 0.04;
        py += Math.sin(frame * 0.04) * 1.2;

        const breathIntensity = Math.min(1, phaseTimer / 80);
        drawPhoenix(w, h, frame, 1.2, 1.0);
        emitBeakFlames(frame, breathIntensity);

        // Body fire halo
        for (let i = 0; i < 8; i++) {
          const angle = Math.random() * Math.PI * 2;
          const r = Math.random() * 60 + 20;
          const p = new FireParticle(
            px + Math.cos(angle) * r,
            py + Math.sin(angle) * r,
            "core"
          );
          p.size = Math.random() * 25 + 10;
          p.vy = -(Math.random() * 4 + 2);
          particles.push(p);
        }
        for (let i = 0; i < 4; i++) {
          particles.push(
            new FireParticle(px + (Math.random() - 0.5) * 120, py + (Math.random() - 0.5) * 120, "ember")
          );
        }
        if (Math.random() < 0.2) {
          particles.push(
            new FireParticle(px + (Math.random() - 0.5) * 80, py + (Math.random() - 0.5) * 80, "smoke")
          );
        }
      }

      // ── Phase 3: settled, ambient hover with light beak flicker ─────────
      if (currentPhase === 3) {
        px += (w / 2 - px) * 0.02;
        py += (h / 2 - py) * 0.02;
        py += Math.sin(frame * 0.03) * 1.0;

        drawPhoenix(w, h, frame, 0.8, 0.85);
        // Gentle beak flicker
        if (frame % 4 === 0) emitBeakFlames(frame, 0.3);

        for (let i = 0; i < 4; i++) {
          const angle = Math.random() * Math.PI * 2;
          const r = Math.random() * 50 + 15;
          const p = new FireParticle(
            px + Math.cos(angle) * r,
            py + Math.sin(angle) * r,
            "core"
          );
          p.size = Math.random() * 18 + 8;
          p.vy = -(Math.random() * 3 + 1.5);
          particles.push(p);
        }
        if (Math.random() < 0.12) {
          particles.push(new FireParticle(Math.random() * w, h + 10, "ember"));
        }
        if (Math.random() < 0.05) {
          particles.push(new FireParticle(Math.random() * w, h + 10, "smoke"));
        }
      }

      // ── Draw all fire particles with additive blending ──────────────────
      ctx.globalCompositeOperation = "lighter";

      for (const p of particles) {
        const noiseOffset = noise(p.x, p.y, frame * 0.02);
        p.x += noiseOffset * 0.6;
        p.update();
        p.draw(ctx);
      }

      for (const p of beakParticles) {
        p.update();
        p.draw(ctx);
      }

      ctx.globalCompositeOperation = "source-over";

      particles = particles.filter((p) => p.life > 0 && p.size > 0.5);
      beakParticles = beakParticles.filter((p) => p.life > 0 && p.size > 0.3);

      raf = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  // ── Auth handlers ──────────────────────────────────────────────────────────
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
        options: { redirectTo: window.location.origin + "/student" },
      });
      if (error) setErrorMessage(error.message);
    } catch (err: any) {
      setErrorMessage(err.message || "OAuth login failed.");
    } finally {
      setLoading(false);
    }
  };

  const skipIntro = () => {
    setShowUI(true);
    setIntroPhase(3);
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen relative flex items-center justify-center bg-[#040308] overflow-hidden select-none">
      {/* 4K Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full block z-0 pointer-events-none"
      />

      {/* Cinematic letterbox vignette overlay */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-black/60 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/60 to-transparent" />
      </div>

      {/* Skip intro */}
      {introPhase < 3 && (
        <button
          onClick={skipIntro}
          className="absolute top-6 right-6 z-40 bg-black/30 hover:bg-black/50 text-white/60 hover:text-white/90 px-5 py-2 rounded-full border border-white/10 text-[11px] font-bold uppercase tracking-widest transition-all duration-300 backdrop-blur-md cursor-pointer"
        >
          Skip Intro
        </button>
      )}

      {/* Main UI container — fades in when showUI=true */}
      <div
        className={`w-full max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between px-6 md:px-12 py-8 relative z-30 transition-all duration-[1200ms] ease-out ${
          showUI ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8 pointer-events-none"
        }`}
      >
        {/* ── Left: Interactive Block Diagram ───────────────────────────── */}
        <div className="w-full md:w-1/2 flex flex-col pr-0 md:pr-12 mb-10 md:mb-0">

          {/* Brand */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#D7263D] via-[#FF6A00] to-[#FFC247] flex items-center justify-center shadow-lg shadow-orange-500/30">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-black text-xl tracking-tight bg-gradient-to-r from-white to-orange-200 bg-clip-text text-transparent">
                Edutwin AI
              </span>
              <span className="block text-[10px] text-orange-400 font-bold uppercase tracking-widest -mt-1">
                Student Twin Hub
              </span>
            </div>
          </div>

          <h2 className="text-3xl font-black text-white leading-tight mb-1">
            Shaping Future Careers with AI
          </h2>
          <p className="text-xs text-orange-300/70 mb-10">
            Holistic student activity records — data-driven placement predictions.
          </p>

          {/* 5-Node Block Diagram */}
          <div className="relative w-80 h-80 mx-auto flex items-center justify-center mb-6">

            {/* Center Hub */}
            <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-[#D7263D] via-[#FF6A00] to-[#FFC247] flex flex-col items-center justify-center border border-orange-400/40 shadow-[0_0_50px_rgba(249,115,22,0.5)] relative z-20 animate-pulse">
              <Brain className="w-9 h-9 text-white" />
              <span className="text-[9px] font-black tracking-wider uppercase mt-1 text-orange-100">
                EDUTWIN AI
              </span>
            </div>

            {/* Connecting lines SVG */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-10" viewBox="0 0 320 320">
              <line x1="60" y1="60" x2="160" y2="160" stroke="rgba(249,115,22,0.35)" strokeWidth="1.5" strokeDasharray="5 4" />
              <line x1="260" y1="60" x2="160" y2="160" stroke="rgba(239,68,68,0.35)" strokeWidth="1.5" strokeDasharray="5 4" />
              <line x1="30" y1="160" x2="160" y2="160" stroke="rgba(245,158,11,0.35)" strokeWidth="1.5" strokeDasharray="5 4" />
              <line x1="290" y1="160" x2="160" y2="160" stroke="rgba(249,115,22,0.35)" strokeWidth="1.5" strokeDasharray="5 4" />
              <line x1="160" y1="280" x2="160" y2="160" stroke="rgba(249,115,22,0.35)" strokeWidth="1.5" strokeDasharray="5 4" />
            </svg>

            {/* Node: Academic */}
            <div className="absolute top-[28px] left-[18px] z-20 flex flex-col items-center group cursor-pointer">
              <div className="w-10 h-10 rounded-xl bg-[#200a02] border border-orange-500/25 flex items-center justify-center text-orange-400 group-hover:bg-orange-600 group-hover:scale-110 group-hover:text-white transition-all duration-300 shadow-lg shadow-orange-950/50">
                <GraduationCap className="w-5 h-5" />
              </div>
              <span className="text-[9px] font-bold mt-1 text-orange-300/80 bg-black/50 border border-orange-900/40 px-1.5 py-0.5 rounded-md whitespace-nowrap backdrop-blur-sm">
                Academic
              </span>
            </div>

            {/* Node: Co-Curricular */}
            <div className="absolute top-[28px] right-[18px] z-20 flex flex-col items-center group cursor-pointer">
              <div className="w-10 h-10 rounded-xl bg-[#200a02] border border-red-500/25 flex items-center justify-center text-red-400 group-hover:bg-red-600 group-hover:scale-110 group-hover:text-white transition-all duration-300 shadow-lg shadow-red-950/50">
                <Award className="w-5 h-5" />
              </div>
              <span className="text-[9px] font-bold mt-1 text-red-300/80 bg-black/50 border border-red-900/40 px-1.5 py-0.5 rounded-md whitespace-nowrap backdrop-blur-sm">
                Co-Curricular
              </span>
            </div>

            {/* Node: Skills */}
            <div className="absolute left-[-12px] top-[140px] z-20 flex flex-col items-center group cursor-pointer">
              <div className="w-10 h-10 rounded-xl bg-[#200a02] border border-amber-500/25 flex items-center justify-center text-amber-400 group-hover:bg-amber-600 group-hover:scale-110 group-hover:text-white transition-all duration-300 shadow-lg shadow-amber-950/50">
                <Sparkles className="w-5 h-5" />
              </div>
              <span className="text-[9px] font-bold mt-1 text-amber-300/80 bg-black/50 border border-amber-900/40 px-1.5 py-0.5 rounded-md whitespace-nowrap backdrop-blur-sm">
                Skills
              </span>
            </div>

            {/* Node: Internships */}
            <div className="absolute right-[-12px] top-[140px] z-20 flex flex-col items-center group cursor-pointer">
              <div className="w-10 h-10 rounded-xl bg-[#200a02] border border-orange-500/25 flex items-center justify-center text-orange-400 group-hover:bg-orange-600 group-hover:scale-110 group-hover:text-white transition-all duration-300 shadow-lg shadow-orange-950/50">
                <Briefcase className="w-5 h-5" />
              </div>
              <span className="text-[9px] font-bold mt-1 text-orange-300/80 bg-black/50 border border-orange-900/40 px-1.5 py-0.5 rounded-md whitespace-nowrap backdrop-blur-sm">
                Internships
              </span>
            </div>

            {/* Node: Placement */}
            <div className="absolute bottom-[10px] left-1/2 -translate-x-1/2 z-20 flex flex-col items-center group cursor-pointer">
              <div className="w-10 h-10 rounded-xl bg-[#200a02] border border-orange-500/25 flex items-center justify-center text-orange-400 group-hover:bg-orange-600 group-hover:scale-110 group-hover:text-white transition-all duration-300 shadow-lg shadow-orange-950/50">
                <TrendingUp className="w-5 h-5" />
              </div>
              <span className="text-[9px] font-bold mt-1 text-orange-300/80 bg-black/50 border border-orange-900/40 px-1.5 py-0.5 rounded-md whitespace-nowrap backdrop-blur-sm">
                Placement Prediction
              </span>
            </div>
          </div>

          <p className="text-[9px] text-orange-200/30 text-center md:text-left">
            Holistic Data · Intelligent Predictions · Better Placements
          </p>
        </div>

        {/* ── Right: Glassmorphic Login Card ─────────────────────────────── */}
        <div className="w-full md:w-[420px] shrink-0">
          <div className="relative bg-black/25 border border-white/8 backdrop-blur-2xl p-8 md:p-10 rounded-3xl shadow-2xl shadow-black/90 space-y-6 overflow-hidden">

            {/* Card inner glow */}
            <div className="absolute -top-20 -right-20 w-48 h-48 bg-orange-600/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-red-700/8 rounded-full blur-2xl pointer-events-none" />

            <div>
              <h2 className="text-2xl font-black text-white tracking-tight">Welcome Back</h2>
              <p className="text-xs text-orange-200/45 mt-1 font-medium">
                Sign in to access your digital student portfolio
              </p>
            </div>

            {errorMessage && (
              <div className="p-3.5 bg-red-950/50 border border-red-700/40 text-red-400 rounded-xl text-xs font-semibold">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4" autoComplete="off">
              {/* Honeypot */}
              <input type="text" name="dummy_user" style={{ display: "none" }} tabIndex={-1} aria-hidden="true" />
              <input type="password" name="dummy_pass" style={{ display: "none" }} tabIndex={-1} aria-hidden="true" />

              {/* Email */}
              <div className="space-y-1">
                <label className="text-[10px] font-black text-orange-300/55 uppercase tracking-widest pl-1">
                  Email Address
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Mail className="w-4 h-4 text-orange-400/55" />
                  </span>
                  <input
                    type="email"
                    autoComplete="off"
                    readOnly
                    onFocus={(e) => e.target.removeAttribute("readOnly")}
                    placeholder="e.g. student@college.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                    className="w-full pl-10 pr-4 py-3 bg-white/[0.03] border border-white/8 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/60 focus:bg-white/[0.05] text-white text-sm transition-all duration-300 font-medium placeholder-white/20"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1">
                <div className="flex justify-between items-center pl-1 pr-1">
                  <label className="text-[10px] font-black text-orange-300/55 uppercase tracking-widest">
                    Password
                  </label>
                  <a href="#" className="text-[10px] text-orange-400 hover:text-orange-300 font-bold transition-colors">
                    Forgot?
                  </a>
                </div>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Lock className="w-4 h-4 text-orange-400/55" />
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
                    className="w-full pl-10 pr-11 py-3 bg-white/[0.03] border border-white/8 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/60 focus:bg-white/[0.05] text-white text-sm transition-all duration-300 font-medium placeholder-white/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-orange-400/55 hover:text-orange-300 transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-[#D7263D] via-[#FF6A00] to-[#FFC247] text-white font-black py-3.5 rounded-xl hover:brightness-110 shadow-lg shadow-orange-900/50 transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer text-sm tracking-wide"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Authenticating…
                  </>
                ) : (
                  "Log In"
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative flex items-center">
              <div className="flex-grow border-t border-white/6" />
              <span className="mx-4 text-[10px] font-black text-white/25 uppercase tracking-widest">or</span>
              <div className="flex-grow border-t border-white/6" />
            </div>

            {/* Google OAuth */}
            <button
              type="button"
              onClick={() => handleOAuthLogin("google")}
              className="w-full flex items-center justify-center gap-2.5 py-3 bg-white/[0.03] hover:bg-white/[0.07] rounded-xl border border-white/8 transition-all duration-200 cursor-pointer text-white/75 hover:text-white font-bold text-xs"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#ea4335" d="M12 5.04c1.66 0 3.2.57 4.38 1.69l3.27-3.27C17.68 1.54 14.98 1 12 1 7.35 1 3.37 3.67 1.39 7.56l3.85 2.99c.9-2.7 3.4-4.51 6.76-4.51z" />
                <path fill="#4285f4" d="M23.49 12.27c0-.81-.07-1.59-.2-2.36H12v4.51h6.46c-.28 1.48-1.12 2.73-2.38 3.58l3.7 2.87c2.16-2 3.71-4.94 3.71-8.6z" />
                <path fill="#fbbc05" d="M5.24 14.56c-.24-.72-.38-1.5-.38-2.31s.14-1.59.38-2.31L1.39 6.95C.5 8.75 0 10.79 0 12.91s.5 4.16 1.39 5.96l3.85-2.95z" />
                <path fill="#34a853" d="M12 23c3.24 0 5.97-1.07 7.96-2.91l-3.7-2.87c-1.03.69-2.35 1.1-4.26 1.1-3.36 0-5.86-1.81-6.76-4.51l-3.85 2.99C3.37 20.33 7.35 23 12 23z" />
              </svg>
              Continue with Google — Edutwin AI
            </button>

            {/* Sign up link */}
            <p className="text-center text-xs text-white/35 font-medium pt-1">
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