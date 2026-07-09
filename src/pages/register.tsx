import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { signUpUser } from "../services/authService";
import { saveProfile } from "../services/profileService";
import { supabase } from "../lib/supabase";
import {
  Sparkles,
  Mail,
  Lock,
  User,
  Briefcase,
  GraduationCap,
  Calendar,
  Hash,
  Loader2,
} from "lucide-react";

function Register() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [department, setDepartment] = useState("");
  const [year, setYear] = useState("1");
  const [registerNo, setRegisterNo] = useState("");
  const [role, setRole] = useState("student"); // "student" or "faculty"

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !fullName || !department || !registerNo) {
      setErrorMessage("Please fill all fields.");
      return;
    }

    setLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const { data, error } = await signUpUser(email, password);

      if (error) {
        setErrorMessage(error.message);
        setLoading(false);
        return;
      }

      if (data?.user) {
        const { error: profileError } = await saveProfile(
          fullName,
          department,
          year,
          registerNo,
          role
        );

        if (profileError) {
          console.error("Profile creation error:", profileError);
          setSuccessMessage("Account created! Please check your email to verify and set up your profile.");
        } else {
          localStorage.setItem("user_role", role);
          localStorage.setItem("user_name", fullName);
          setSuccessMessage("Account and Profile created successfully! Redirecting...");
          setTimeout(() => {
            navigate(role === "faculty" ? "/faculty" : "/student");
          }, 2000);
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthSignUp = async () => {
    setLoading(true);
    setErrorMessage("");
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: window.location.origin + "/student",
        },
      });
      if (error) {
        setErrorMessage(error.message);
      }
    } catch (err: any) {
      setErrorMessage(err.message || "OAuth registration failed.");
    } finally {
      setLoading(false);
    }
  };

  // Styled classes matching the login template
  const containerCls = "min-h-screen bg-[#080608] flex items-center justify-center p-4 relative overflow-hidden py-12";
  const glowTopCls = "absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-orange-500/5 rounded-full blur-[120px] pointer-events-none";
  const glowBottomCls = "absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-red-600/5 rounded-full blur-[120px] pointer-events-none";

  const cardCls = "w-full max-w-lg bg-black/40 border border-white/10 backdrop-blur-2xl rounded-3xl shadow-2xl shadow-black p-8 relative z-10 space-y-6";
  const inputCls = "w-full pl-10 pr-4 py-3 bg-white/[0.04] border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:bg-white/[0.07] text-white text-sm transition-all duration-300 font-medium placeholder-white/20";
  const labelCls = "text-[10px] font-black text-orange-300/55 uppercase tracking-widest pl-1 mb-1.5 block";
  const iconCls = "absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-orange-400/50";

  return (
    <div className={containerCls}>
      <div className={glowTopCls}></div>
      <div className={glowBottomCls}></div>

      <div className={cardCls}>
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#D7263D] via-[#FF6A00] to-[#FFC247] flex items-center justify-center text-white font-bold shadow-lg shadow-orange-600/30 mb-3">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight drop-shadow-md">
            Create Account
          </h1>
          <p className="text-xs text-orange-200/40 mt-1 font-medium text-center">
            Join Edutwin AI & Start Cataloguing Achievements
          </p>
        </div>

        {errorMessage && (
          <div className="p-3.5 bg-red-950/60 border border-red-700/40 text-red-400 rounded-xl text-xs font-semibold">
            {errorMessage}
          </div>
        )}

        {successMessage && (
          <div className="p-3.5 bg-emerald-950/60 border border-emerald-700/40 text-emerald-400 rounded-xl text-xs font-semibold">
            {successMessage}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4" autoComplete="off">
          {/* Role Toggle Selector */}
          <div className="grid grid-cols-2 gap-2 bg-white/[0.03] p-1.5 rounded-xl border border-white/10">
            <button
              type="button"
              onClick={() => setRole("student")}
              className={`py-2.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all duration-300 cursor-pointer ${
                role === "student"
                  ? "bg-gradient-to-r from-[#D7263D]/80 via-[#FF6A00]/70 to-[#FFC247]/60 text-white shadow-md shadow-orange-950/40"
                  : "text-orange-300/40 hover:text-orange-200"
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              Student
            </button>
            <button
              type="button"
              onClick={() => setRole("faculty")}
              className={`py-2.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all duration-300 cursor-pointer ${
                role === "faculty"
                  ? "bg-gradient-to-r from-[#D7263D]/80 via-[#FF6A00]/70 to-[#FFC247]/60 text-white shadow-md shadow-orange-950/40"
                  : "text-orange-300/40 hover:text-orange-200"
              }`}
            >
              <Briefcase className="w-4 h-4" />
              Faculty Member
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Full Name</label>
              <div className="relative">
                <span className={iconCls}><User className="w-4 h-4" /></span>
                <input
                  type="text"
                  placeholder="e.g. Mugilan R"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  disabled={loading}
                  className={inputCls}
                />
              </div>
            </div>

            <div>
              <label className={labelCls}>
                {role === "student" ? "Register Number" : "Faculty ID"}
              </label>
              <div className="relative">
                <span className={iconCls}><Hash className="w-4 h-4" /></span>
                <input
                  type="text"
                  placeholder="e.g. 22CSEB140"
                  value={registerNo}
                  onChange={(e) => setRegisterNo(e.target.value)}
                  disabled={loading}
                  className={inputCls}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Department</label>
              <div className="relative">
                <span className={iconCls}><GraduationCap className="w-4 h-4" /></span>
                <input
                  type="text"
                  placeholder="e.g. CSE, ECE"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  disabled={loading}
                  className={inputCls}
                />
              </div>
            </div>

            <div>
              {role === "student" ? (
                <>
                  <label className={labelCls}>Current Year</label>
                  <div className="relative">
                    <span className={iconCls}><Calendar className="w-4 h-4" /></span>
                    <select
                      value={year}
                      onChange={(e) => setYear(e.target.value)}
                      disabled={loading}
                      className={inputCls + " appearance-none"}
                    >
                      <option value="1">1st Year</option>
                      <option value="2">2nd Year</option>
                      <option value="3">3rd Year</option>
                      <option value="4">4th Year</option>
                    </select>
                  </div>
                </>
              ) : (
                <>
                  <label className={labelCls}>Designation</label>
                  <div className="relative">
                    <span className={iconCls}><GraduationCap className="w-4 h-4" /></span>
                    <input
                      type="text"
                      value="Faculty Member"
                      disabled
                      className="w-full pl-10 pr-4 py-3 bg-white/[0.02] border border-white/5 rounded-xl text-white/30 text-sm cursor-not-allowed font-medium"
                    />
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="border-t border-white/10 my-4 pt-4 space-y-4">
            <div>
              <label className={labelCls}>College Email Address</label>
              <div className="relative">
                <span className={iconCls}><Mail className="w-4 h-4" /></span>
                <input
                  type="email"
                  placeholder="e.g. name@college.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  className={inputCls}
                />
              </div>
            </div>

            <div>
              <label className={labelCls}>Password (min 6 chars)</label>
              <div className="relative">
                <span className={iconCls}><Lock className="w-4 h-4" /></span>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  className={inputCls}
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-[#D7263D] via-[#FF6A00] to-[#FFC247] text-white font-black py-3.5 rounded-xl hover:brightness-110 shadow-lg shadow-orange-900/60 transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer text-sm tracking-wide mt-2"
          >
            {loading ? (
              <><Loader2 className="w-4 h-4 animate-spin" />Creating Account...</>
            ) : (
              "Sign Up & Setup Profile"
            )}
          </button>
        </form>

        <div className="space-y-4">
          <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/8"></div>
            </div>
            <span className="relative bg-[#0d070d] px-4 text-[10px] font-black text-white/20 uppercase tracking-widest">or register with</span>
          </div>

          <button
            type="button"
            onClick={handleOAuthSignUp}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2.5 py-3 bg-white/[0.04] hover:bg-white/[0.09] rounded-xl border border-white/10 transition-all duration-200 cursor-pointer text-white/65 hover:text-white font-semibold text-xs disabled:opacity-50"
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path fill="#ea4335" d="M12 5.04c1.66 0 3.2.57 4.38 1.69l3.27-3.27C17.68 1.54 14.98 1 12 1 7.35 1 3.37 3.67 1.39 7.56l3.85 2.99c.9-2.7 3.4-4.51 6.76-4.51z" />
              <path fill="#4285f4" d="M23.49 12.27c0-.81-.07-1.59-.2-2.36H12v4.51h6.46c-.28 1.48-1.12 2.73-2.38 3.58l3.7 2.87c2.16-2 3.71-4.94 3.71-8.6z" />
              <path fill="#fbbc05" d="M5.24 14.56c-.24-.72-.38-1.5-.38-2.31s.14-1.59.38-2.31L1.39 6.95C.5 8.75 0 10.79 0 12.91s.5 4.16 1.39 5.96l3.85-2.95z" />
              <path fill="#34a853" d="M12 23c3.24 0 5.97-1.07 7.96-2.91l-3.7-2.87c-1.03.69-2.35 1.1-4.26 1.1-3.36 0-5.86-1.81-6.76-4.51l-3.85 2.99C3.37 20.33 7.35 23 12 23z" />
            </svg>
            Sign Up with Google
          </button>
        </div>

        <div className="text-center border-t border-white/10 pt-4">
          <p className="text-xs text-white/30 font-medium">
            Already have an account?{" "}
            <Link
              to="/"
              className="text-orange-400 hover:text-orange-300 font-black transition-colors duration-300"
            >
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;