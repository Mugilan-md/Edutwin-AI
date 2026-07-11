import { useNavigate, Link } from "react-router-dom";
import { useState, useEffect } from "react";
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
  GraduationCap,
  Award,
  BrainCircuit,
  TrendingUp,
  BookOpen,
} from "lucide-react";

// ─── Knowledge Graph SVG Animation ──────────────────────────────────────────
function KnowledgeGraph() {
  const nodes = [
    { cx: 80,  cy: 80,  r: 5,  delay: 0 },
    { cx: 200, cy: 50,  r: 4,  delay: 0.4 },
    { cx: 340, cy: 120, r: 6,  delay: 0.8 },
    { cx: 120, cy: 200, r: 4,  delay: 1.2 },
    { cx: 280, cy: 240, r: 5,  delay: 0.6 },
    { cx: 400, cy: 60,  r: 3,  delay: 1.0 },
    { cx: 60,  cy: 300, r: 4,  delay: 0.2 },
    { cx: 380, cy: 300, r: 5,  delay: 1.4 },
    { cx: 230, cy: 160, r: 4,  delay: 0.3 },
    { cx: 150, cy: 360, r: 3,  delay: 0.9 },
    { cx: 320, cy: 380, r: 5,  delay: 0.5 },
    { cx: 450, cy: 200, r: 4,  delay: 1.1 },
  ];

  const edges = [
    [0,1],[1,2],[1,8],[2,5],[3,8],[3,6],[4,8],[4,10],[5,11],[6,9],[7,11],[9,10],[2,11],[0,3],[4,7]
  ];

  return (
    <svg
      viewBox="0 0 500 420"
      className="w-full h-full opacity-90"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="edgeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0.1" />
        </linearGradient>
        <radialGradient id="nodeGrad">
          <stop offset="0%" stopColor="#60a5fa" />
          <stop offset="100%" stopColor="#2563eb" />
        </radialGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
          <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>

      {/* Edges */}
      {edges.map(([a, b], i) => (
        <line
          key={i}
          x1={nodes[a].cx} y1={nodes[a].cy}
          x2={nodes[b].cx} y2={nodes[b].cy}
          stroke="url(#edgeGrad)"
          strokeWidth="1.2"
          strokeDasharray="200"
          strokeDashoffset="200"
          style={{
            animation: `line-flow ${2 + i * 0.3}s ease-in-out ${i * 0.25}s infinite`
          }}
        />
      ))}

      {/* Nodes */}
      {nodes.map((n, i) => (
        <circle
          key={i}
          cx={n.cx} cy={n.cy} r={n.r}
          fill="url(#nodeGrad)"
          filter="url(#glow)"
          style={{
            animation: `node-pulse 3s ease-in-out ${n.delay}s infinite`
          }}
        />
      ))}

      {/* Floating icons text */}
      <text x="72" y="74" fontSize="10" fill="#3b82f6" opacity="0.7" fontWeight="700">AI</text>
      <text x="192" y="44" fontSize="9"  fill="#0ea5e9" opacity="0.7" fontWeight="600">NLP</text>
      <text x="332" y="114" fontSize="9" fill="#3b82f6" opacity="0.7" fontWeight="600">ML</text>
      <text x="112" y="194" fontSize="9" fill="#0ea5e9" opacity="0.7" fontWeight="600">CV</text>
    </svg>
  );
}

// ─── Main Login ───────────────────────────────────────────────────────────────
function Login() {
  const navigate = useNavigate();

  const [email, setEmail]         = useState("");
  const [password, setPassword]   = useState("");
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState("");
  const [showPass, setShowPass]   = useState(false);
  const [showUI, setShowUI]       = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShowUI(true), 200);
    return () => clearTimeout(t);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { setError("Please fill in all fields."); return; }
    setLoading(true);
    setError("");
    try {
      const { error: authError } = await signInUser(email, password);
      if (authError) { setError(authError.message || "Invalid credentials."); setLoading(false); return; }

      let retries = 0;
      const tryGetProfile = async () => {
        const { data: prof } = await getProfile();
        if (prof?.role) {
          if (prof.role === "faculty") navigate("/faculty");
          else if (prof.role === "admin") navigate("/admin");
          else navigate("/student");
        } else if (retries < 8) {
          retries++;
          setTimeout(tryGetProfile, 300);
        } else {
          const { data: authData } = await supabase.auth.getUser();
          if (authData?.user) navigate("/student");
          else { setError("Login succeeded but profile not found. Try again."); setLoading(false); }
        }
      };
      await tryGetProfile();
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
      setLoading(false);
    }
  };

  const features = [
    { icon: GraduationCap, label: "NAAC Accreditation Forecaster", desc: "Real-time institutional score prediction" },
    { icon: BrainCircuit,  label: "Gemini AI Certificate OCR",     desc: "Extracts data directly from documents" },
    { icon: Award,         label: "Career Path Matcher",            desc: "Cosine similarity skill-to-role fit" },
    { icon: TrendingUp,    label: "ML Credit Projector",            desc: "Graduation credit linear regression" },
    { icon: BookOpen,      label: "Digital Academic Twin",          desc: "Evolving live student intelligence profile" },
  ];

  return (
    <div className="min-h-dvh bg-gradient-to-br from-[#eef4ff] via-[#f0f7ff] to-[#e8f0fe] flex flex-col md:flex-row overflow-hidden relative">

      {/* ── Background decorative blobs ── */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-200/40 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -right-24 w-80 h-80 bg-sky-200/35 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 left-1/3 w-72 h-72 bg-indigo-200/30 rounded-full blur-3xl" />
      </div>

      {/* ─── LEFT: Brand Panel ──────────────────────────────── */}
      <div className="hidden md:flex flex-col justify-between w-full md:w-[55%] p-12 lg:p-16 relative z-10">

        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 via-blue-500 to-sky-400 flex items-center justify-center shadow-lg shadow-blue-500/30">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-black text-lg text-slate-800">Edutwin AI</span>
            <span className="block text-[10px] text-blue-500 font-bold uppercase tracking-widest">Smart Education Platform</span>
          </div>
        </div>

        {/* Hero Text */}
        <div className={`space-y-6 transition-all duration-700 ${showUI ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          <div className="inline-flex items-center gap-2 bg-blue-100 border border-blue-200 rounded-full px-4 py-1.5">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
            <span className="text-xs font-bold text-blue-700">SIH 2024 · Smart India Hackathon</span>
          </div>

          <h1 className="text-4xl lg:text-5xl font-black text-slate-900 leading-tight">
            Centralised Digital Platform<br />
            <span className="bg-gradient-to-r from-blue-600 to-sky-500 bg-clip-text text-transparent">
              for Student Activity Records
            </span>
          </h1>

          <p className="text-slate-500 text-base leading-relaxed max-w-md">
            Automate certificate verification, track NAAC credits, and predict accreditation outcomes using real Gemini AI — all in one intelligent platform.
          </p>

          {/* Feature Highlights */}
          <div className="space-y-3 mt-4">
            {features.map((f, i) => (
              <div
                key={f.label}
                className="flex items-center gap-3 bg-white/70 border border-blue-100 rounded-xl px-4 py-3 backdrop-blur-sm transition-all duration-500"
                style={{ transitionDelay: `${i * 80}ms`, opacity: showUI ? 1 : 0, transform: showUI ? "translateX(0)" : "translateX(-12px)" }}
              >
                <div className="w-8 h-8 bg-gradient-to-tr from-blue-100 to-sky-100 border border-blue-200 rounded-lg flex items-center justify-center shrink-0">
                  <f.icon className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-800 block">{f.label}</span>
                  <span className="text-[10px] text-slate-500">{f.desc}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Knowledge Graph SVG */}
        <div className="w-full max-w-xs opacity-40 mt-6">
          <KnowledgeGraph />
        </div>
      </div>

      {/* ─── RIGHT: Login Card ──────────────────────────────── */}
      <div className="flex flex-col justify-center items-center w-full md:w-[45%] min-h-dvh p-6 md:p-10 relative z-10">

        {/* Mobile Logo */}
        <div className="flex items-center gap-2 mb-8 md:hidden">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-blue-600 to-sky-400 flex items-center justify-center shadow-lg shadow-blue-500/25">
            <Sparkles className="w-4.5 h-4.5 text-white" />
          </div>
          <span className="font-black text-lg text-slate-800">Edutwin AI</span>
        </div>

        <div
          className={`w-full max-w-md bg-white/90 backdrop-blur-xl border border-blue-100 rounded-3xl shadow-2xl shadow-blue-900/10 p-8 transition-all duration-700 ${
            showUI ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
        >
          {/* Card Header */}
          <div className="mb-7">
            <h2 className="text-2xl font-black text-slate-900">Sign in</h2>
            <p className="text-sm text-slate-500 mt-1">Access your institutional dashboard</p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-5 p-3.5 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-blue-500" />
                Email Address
              </label>
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@college.edu"
                className="saas-input"
                autoComplete="email"
                required
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-blue-500" />
                Password
              </label>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="saas-input pr-11"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Role Hint */}
            <div className="grid grid-cols-3 gap-2 pt-1">
              {[
                { role: "Student", color: "bg-blue-50 border-blue-200 text-blue-700" },
                { role: "Faculty", color: "bg-emerald-50 border-emerald-200 text-emerald-700" },
                { role: "Admin",   color: "bg-amber-50  border-amber-200  text-amber-700" },
              ].map((r) => (
                <div key={r.role} className={`text-center text-[10px] font-bold py-1.5 rounded-lg border ${r.color}`}>
                  {r.role}
                </div>
              ))}
            </div>
            <p className="text-[10px] text-slate-400 text-center -mt-1">Your role is auto-detected from your registered account</p>

            {/* Submit */}
            <button
              id="login-submit"
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 text-sm disabled:opacity-60"
            >
              {loading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Authenticating...</>
              ) : (
                <><Sparkles className="w-4 h-4" /> Sign In to Dashboard</>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 pt-6 border-t border-slate-100 text-center">
            <p className="text-sm text-slate-500">
              New to Edutwin?{" "}
              <Link to="/register" className="text-blue-600 font-bold hover:text-blue-700 transition-colors">
                Create account
              </Link>
            </p>
          </div>
        </div>

        {/* Bottom credibility */}
        <div className="mt-6 flex items-center gap-3 text-xs text-slate-400 font-medium">
          <span className="flex items-center gap-1"><div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />Supabase Encrypted</span>
          <span>·</span>
          <span>Role-Based Access</span>
          <span>·</span>
          <span>NAAC Compliant</span>
        </div>
      </div>
    </div>
  );
}

export default Login;