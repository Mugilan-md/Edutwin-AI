import { useNavigate, Link } from "react-router-dom";
import { useState } from "react";
import { signInUser } from "../services/authService";
import { getProfile } from "../services/profileService";
import { supabase } from "../lib/supabase";
import { Sparkles, Mail, Lock, Loader2, Eye, EyeOff, Brain, GraduationCap, Award, Briefcase, TrendingUp } from "lucide-react";

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);

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

  return (
    <div className="min-h-screen flex bg-[#0c0301] text-white relative overflow-hidden font-['Inter']">
      
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

      {/* Fiery animated background base layer */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,#f97316_0%,transparent_50%),radial-gradient(circle_at_70%_80%,#ef4444_0%,transparent_60%)] opacity-30 mix-blend-screen animate-[flamePulse_8s_ease-in-out_infinite] pointer-events-none"></div>
      
      {/* Moving Fire Flow overlay from left to right */}
      <div 
        className="absolute inset-0 bg-gradient-to-r from-red-600/10 via-amber-500/20 to-orange-600/10 bg-[length:300%_300%] animate-[fireMotion_12s_ease_infinite] pointer-events-none"
      ></div>

      {/* Floating Sparkles Layer */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute bottom-[-10px] left-[10%] w-1.5 h-1.5 rounded-full bg-amber-400 animate-[sparksUp_6s_infinite_linear]"></div>
        <div className="absolute bottom-[-10px] left-[35%] w-2 h-2 rounded-full bg-orange-400 animate-[sparksUp_8s_infinite_linear_1s]"></div>
        <div className="absolute bottom-[-10px] left-[65%] w-1 h-1 rounded-full bg-yellow-400 animate-[sparksUp_5s_infinite_linear_3s]"></div>
        <div className="absolute bottom-[-10px] left-[85%] w-2.5 h-2.5 rounded-full bg-red-400 animate-[sparksUp_7s_infinite_linear_2s]"></div>
      </div>

      {/* Main Content Grid */}
      <div className="w-full flex flex-col md:flex-row relative z-10">
        
        {/* Left Column: AI Pipeline and Fire Theme Diagram */}
        <div className="w-full md:w-1/2 p-8 md:p-16 flex flex-col justify-between relative overflow-hidden shrink-0 border-b md:border-b-0 md:border-r border-orange-500/10 bg-black/40">
          
          {/* Top Brand Info */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-red-500 to-amber-500 flex items-center justify-center text-white font-bold shadow-lg shadow-orange-500/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-black text-xl tracking-tight bg-gradient-to-r from-white to-orange-200 bg-clip-text text-transparent">Edutwin AI</span>
              <span className="block text-[10px] text-orange-400 font-bold uppercase tracking-widest -mt-1">Student Twin Hub</span>
            </div>
          </div>

          {/* Core Visual Diagram */}
          <div className="my-auto py-12 flex flex-col items-center justify-center">
            <h2 className="text-2xl md:text-3xl font-black text-center mb-1 text-white leading-tight">Shaping Future Careers with AI</h2>
            <p className="text-xs text-orange-300/80 mb-12 text-center max-w-sm">Holistic student activity records matching data to placements.</p>

            <div className="relative w-80 h-80 flex items-center justify-center">
              {/* Brain Center (Fiery Glow) */}
              <div className="w-28 h-28 rounded-full bg-gradient-to-tr from-red-600 via-orange-600 to-amber-500 flex flex-col items-center justify-center p-1 border-2 border-orange-400/40 shadow-[0_0_50px_rgba(249,115,22,0.5)] relative z-20 animate-[pulse_3s_ease-in-out_infinite]">
                <Brain className="w-10 h-10 text-white animate-[bounce_4s_infinite]" />
                <span className="text-[10px] font-black tracking-wider uppercase mt-1.5 text-orange-100">EDUTWIN AI</span>
              </div>

              {/* Connector lines (Orange styling) */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none z-10" viewBox="0 0 320 320">
                <line x1="60" y1="60" x2="160" y2="160" stroke="rgba(249,115,22,0.3)" strokeWidth="2" strokeDasharray="4 4" />
                <line x1="260" y1="60" x2="160" y2="160" stroke="rgba(239,68,68,0.3)" strokeWidth="2" strokeDasharray="4 4" />
                <line x1="40" y1="160" x2="160" y2="160" stroke="rgba(245,158,11,0.3)" strokeWidth="2" strokeDasharray="4 4" />
                <line x1="280" y1="160" x2="160" y2="160" stroke="rgba(249,115,22,0.3)" strokeWidth="2" strokeDasharray="4 4" />
                <line x1="160" y1="270" x2="160" y2="160" stroke="rgba(249,115,22,0.3)" strokeWidth="2" strokeDasharray="4 4" />
              </svg>

              {/* Node Icons (Fiery Red/Orange) */}
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

          </div>

          <div className="border-t border-orange-500/10 pt-5 text-center md:text-left">
            <p className="text-[10px] text-orange-300/40 leading-relaxed">
              Holistic Data · Intelligent Predictions · Better Placements. Deployed securely with Supabase RLS.
            </p>
          </div>
        </div>

        {/* Right Column: Glassmorphic Fiery Dark Login Card */}
        <div className="w-full md:w-1/2 flex items-center justify-center p-8 md:p-16 bg-black/20">
          <div className="w-full max-w-md space-y-8 bg-white/[0.02] backdrop-blur-xl p-8 md:p-10 rounded-3xl border border-orange-500/10 shadow-2xl shadow-black/80">
            
            <div>
              <h2 className="text-3xl font-black text-white leading-tight">Welcome Back!</h2>
              <p className="text-sm text-orange-200/50 mt-1">Login to continue your academic twin journey</p>
            </div>

            {errorMessage && (
              <div className="p-4 bg-red-950/40 border border-red-800/40 text-red-400 rounded-2xl text-xs font-semibold">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-5" autoComplete="off">
              <input type="text" name="dummy_username" style={{ display: "none" }} tabIndex={-1} aria-hidden="true" />
              <input type="password" name="dummy_password" style={{ display: "none" }} tabIndex={-1} aria-hidden="true" />

              <div className="space-y-1">
                <label className="text-[10px] font-black text-orange-300/60 uppercase tracking-widest pl-1">College Email Address</label>
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
                    placeholder="Enter email (e.g. admin@portal.com)"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                    className="w-full pl-11 pr-4 py-3 bg-white/[0.01] border border-orange-500/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-[#1a0802] text-white text-sm transition-all duration-300 font-medium"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-center pl-1 pr-1">
                  <label className="text-[10px] font-black text-orange-300/60 uppercase tracking-widest">Password</label>
                  <a href="#forgot" className="text-xs text-orange-400 hover:text-orange-300 font-bold">Forgot Password?</a>
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
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    className="w-full pl-11 pr-12 py-3 bg-white/[0.01] border border-orange-500/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-[#1a0802] text-white text-sm transition-all duration-300 font-medium"
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

              <div className="flex items-center gap-2 pl-0.5">
                <input
                  type="checkbox"
                  id="remember-me"
                  className="rounded text-orange-600 focus:ring-orange-500 w-4 h-4 border-orange-500/10 bg-transparent"
                />
                <label htmlFor="remember-me" className="text-xs text-orange-200/50 font-semibold cursor-pointer">
                  Remember this device
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-red-600 to-orange-600 text-white font-bold py-3.5 px-4 rounded-xl hover:from-red-700 hover:to-orange-700 shadow-lg shadow-orange-950/50 transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer text-sm"
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

            {/* Social Logins - Single Google Login Option */}
            <div className="space-y-4 pt-2">
              <div className="relative flex items-center justify-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-orange-500/10"></div>
                </div>
                <span className="relative bg-[#0c0301] px-4 text-[10px] font-black text-orange-300/40 uppercase tracking-widest">or continue with</span>
              </div>

              <button
                type="button"
                onClick={() => handleOAuthLogin("google")}
                title="Sign In with Google"
                className="w-full flex items-center justify-center gap-2.5 py-3 bg-white/[0.01] hover:bg-white/[0.04] rounded-xl border border-orange-500/10 transition cursor-pointer text-orange-200 font-bold text-xs"
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