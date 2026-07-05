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
    <div className="min-h-screen flex bg-[#070716] text-white relative overflow-hidden font-['Inter']">
      
      {/* Dynamic Animated Matrix Grid Layer */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none"></div>
      
      {/* Tech Glowing Backdrops */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-violet-500/10 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Main Content Container - Split screen unified under same dark theme */}
      <div className="w-full flex flex-col md:flex-row relative z-10">
        
        {/* Left Column: AI Pipeline and Diagram */}
        <div className="w-full md:w-1/2 p-8 md:p-16 flex flex-col justify-between relative overflow-hidden shrink-0 border-b md:border-b-0 md:border-r border-white/5 bg-[#0c0d21]/30">
          
          {/* Top Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-500/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-black text-xl tracking-tight bg-gradient-to-r from-white to-indigo-200 bg-clip-text text-transparent">Edutwin AI</span>
              <span className="block text-[10px] text-indigo-400 font-bold uppercase tracking-widest -mt-1">Student Twin Hub</span>
            </div>
          </div>

          {/* Core Visual Diagram */}
          <div className="my-auto py-12 flex flex-col items-center justify-center">
            <h2 className="text-2xl md:text-3xl font-black text-center mb-1 text-white leading-tight">Shaping Future Careers with AI</h2>
            <p className="text-xs text-indigo-300/80 mb-12 text-center max-w-sm">Holistic student activity records matching data to placements.</p>

            <div className="relative w-80 h-80 flex items-center justify-center">
              {/* Brain Center */}
              <div className="w-28 h-28 rounded-full bg-gradient-to-tr from-indigo-600 via-indigo-700 to-violet-600 flex flex-col items-center justify-center p-1 border-2 border-indigo-400/40 shadow-[0_0_50px_rgba(99,102,241,0.4)] relative z-20 animate-[pulse_3s_ease-in-out_infinite]">
                <Brain className="w-10 h-10 text-white animate-[bounce_4s_infinite]" />
                <span className="text-[10px] font-black tracking-wider uppercase mt-1.5 text-indigo-100">EDUTWIN AI</span>
              </div>

              {/* Connector lines */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none z-10" viewBox="0 0 320 320">
                <line x1="60" y1="60" x2="160" y2="160" stroke="rgba(99,102,241,0.3)" strokeWidth="2" strokeDasharray="4 4" />
                <line x1="260" y1="60" x2="160" y2="160" stroke="rgba(139,92,246,0.3)" strokeWidth="2" strokeDasharray="4 4" />
                <line x1="40" y1="160" x2="160" y2="160" stroke="rgba(167,139,250,0.3)" strokeWidth="2" strokeDasharray="4 4" />
                <line x1="280" y1="160" x2="160" y2="160" stroke="rgba(99,102,241,0.3)" strokeWidth="2" strokeDasharray="4 4" />
                <line x1="160" y1="270" x2="160" y2="160" stroke="rgba(34,197,94,0.3)" strokeWidth="2" strokeDasharray="4 4" />
              </svg>

              {/* Node Icons */}
              <div className="absolute top-[30px] left-[20px] z-20 flex flex-col items-center group cursor-pointer">
                <div className="w-10 h-10 rounded-xl bg-[#14152b] border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <span className="text-[9px] font-bold mt-1 text-indigo-300 bg-[#0f1025] border border-indigo-950 px-2 py-0.5 rounded-md whitespace-nowrap">Academic Performance</span>
              </div>

              <div className="absolute top-[30px] right-[20px] z-20 flex flex-col items-center group cursor-pointer">
                <div className="w-10 h-10 rounded-xl bg-[#14152b] border border-violet-500/20 flex items-center justify-center text-violet-400 group-hover:bg-violet-600 group-hover:text-white transition-all duration-300">
                  <Award className="w-5 h-5" />
                </div>
                <span className="text-[9px] font-bold mt-1 text-violet-300 bg-[#0f1025] border border-indigo-950 px-2 py-0.5 rounded-md whitespace-nowrap">Co-Curricular Activities</span>
              </div>

              <div className="absolute left-[-10px] top-[140px] z-20 flex flex-col items-center group cursor-pointer">
                <div className="w-10 h-10 rounded-xl bg-[#14152b] border border-purple-500/20 flex items-center justify-center text-purple-400 group-hover:bg-purple-600 group-hover:text-white transition-all duration-300">
                  <Sparkles className="w-5 h-5" />
                </div>
                <span className="text-[9px] font-bold mt-1 text-purple-300 bg-[#0f1025] border border-indigo-950 px-2 py-0.5 rounded-md whitespace-nowrap">Skills & Certifications</span>
              </div>

              <div className="absolute right-[-10px] top-[140px] z-20 flex flex-col items-center group cursor-pointer">
                <div className="w-10 h-10 rounded-xl bg-[#14152b] border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                  <Briefcase className="w-5 h-5" />
                </div>
                <span className="text-[9px] font-bold mt-1 text-indigo-300 bg-[#0f1025] border border-indigo-950 px-2 py-0.5 rounded-md whitespace-nowrap">Internships & Projects</span>
              </div>

              <div className="absolute bottom-[10px] left-1/2 -translate-x-1/2 z-20 flex flex-col items-center group cursor-pointer">
                <div className="w-10 h-10 rounded-xl bg-[#14152b] border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <span className="text-[9px] font-bold mt-1 text-emerald-300 bg-[#0f1025] border border-indigo-950 px-2 py-0.5 rounded-md whitespace-nowrap">Placement Prediction</span>
              </div>
            </div>

          </div>

          <div className="border-t border-white/5 pt-5 text-center md:text-left">
            <p className="text-[10px] text-indigo-300/40 leading-relaxed">
              Holistic Data · Intelligent Predictions · Better Placements. Deployed securely with Supabase RLS.
            </p>
          </div>
        </div>

        {/* Right Column: Glassmorphic Dark Login Card */}
        <div className="w-full md:w-1/2 flex items-center justify-center p-8 md:p-16 bg-[#0a0a1f]/10">
          <div className="w-full max-w-md space-y-8 bg-white/[0.03] backdrop-blur-xl p-8 md:p-10 rounded-3xl border border-white/10 shadow-2xl shadow-black/40">
            
            <div>
              <h2 className="text-3xl font-black text-white leading-tight">Welcome Back!</h2>
              <p className="text-sm text-indigo-200/50 mt-1">Login to continue your academic twin journey</p>
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
                <label className="text-[10px] font-black text-indigo-300/60 uppercase tracking-widest pl-1">College Email Address</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-indigo-400/60">
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
                    className="w-full pl-11 pr-4 py-3 bg-white/[0.02] border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-[#0f1025] text-white text-sm transition-all duration-300 font-medium"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-center pl-1 pr-1">
                  <label className="text-[10px] font-black text-indigo-300/60 uppercase tracking-widest">Password</label>
                  <a href="#forgot" className="text-xs text-indigo-400 hover:text-indigo-300 font-bold">Forgot Password?</a>
                </div>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-indigo-400/60">
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
                    className="w-full pl-11 pr-12 py-3 bg-white/[0.02] border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-[#0f1025] text-white text-sm transition-all duration-300 font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-indigo-400/60 hover:text-indigo-400 transition duration-200 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2 pl-0.5">
                <input
                  type="checkbox"
                  id="remember-me"
                  className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4 border-white/10 bg-transparent"
                />
                <label htmlFor="remember-me" className="text-xs text-indigo-200/50 font-semibold cursor-pointer">
                  Remember this device
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold py-3.5 px-4 rounded-xl hover:from-indigo-700 hover:to-violet-700 shadow-lg shadow-indigo-950/50 transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer text-sm"
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
                  <div className="w-full border-t border-white/10"></div>
                </div>
                <span className="relative bg-[#070716] px-4 text-[10px] font-black text-indigo-300/40 uppercase tracking-widest">or continue with</span>
              </div>

              <button
                type="button"
                onClick={() => handleOAuthLogin("google")}
                title="Sign In with Google"
                className="w-full flex items-center justify-center gap-2.5 py-3 bg-white/[0.02] hover:bg-white/[0.06] rounded-xl border border-white/10 transition cursor-pointer text-indigo-200 font-bold text-xs"
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
              <p className="text-xs text-indigo-200/50 font-semibold">
                Don't have an account?{" "}
                <Link
                  to="/register"
                  className="text-indigo-400 hover:text-indigo-300 font-black transition-colors duration-300"
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