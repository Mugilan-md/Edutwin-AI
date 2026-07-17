import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { signUpUser } from "../services/authService";
import { saveProfile } from "../services/profileService";
import { supabase } from "../lib/supabase";
import {
  Sparkles, Mail, Lock, User, Briefcase, GraduationCap, Calendar, Hash, Loader2,
} from "lucide-react";

function Register() {
  const navigate = useNavigate();
  const [email, setEmail]         = useState("");
  const [password, setPassword]   = useState("");
  const [fullName, setFullName]   = useState("");
  const [department, setDepartment] = useState("");
  const [year, setYear]           = useState("1");
  const [registerNo, setRegisterNo] = useState("");
  const [role, setRole]           = useState("student"); // "student" or "faculty"

  const [loading, setLoading]       = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !fullName || !department || !registerNo) {
      setErrorMessage("Please fill in all fields.");
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

  const labelCls = "text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1 mb-1.5 block";
  const iconCls  = "absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-blue-500/70";
  const inputCls = "w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400/30 focus:border-blue-400 text-slate-800 text-xs font-semibold placeholder-slate-300 transition-all";

  return (
    <div className="min-h-screen bg-[#FFFCC7] flex items-center justify-center p-4 relative overflow-hidden py-12">
      {/* Background Blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-200/40 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-sky-200/30 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-lg bg-white/90 backdrop-blur-xl border border-blue-100 rounded-3xl shadow-2xl shadow-blue-900/10 p-8 relative z-10 space-y-6">
        <div className="flex flex-col items-center">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 via-blue-500 to-sky-400 flex items-center justify-center shadow-md shadow-blue-500/25 mb-3">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Create Account
          </h1>
          <p className="text-xs text-slate-400 mt-1 font-semibold text-center">
            Join Edutwin AI & Start Cataloguing Achievements
          </p>
        </div>

        {errorMessage && (
          <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-semibold">
            {errorMessage}
          </div>
        )}

        {successMessage && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs font-semibold">
            {successMessage}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4" autoComplete="off">
          {/* Role selector */}
          <div className="grid grid-cols-2 gap-2 bg-slate-50 p-1.5 rounded-xl border border-slate-200/60">
            <button
              type="button"
              onClick={() => setRole("student")}
              className={`py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all duration-200 cursor-pointer ${
                role === "student"
                  ? "bg-gradient-to-r from-blue-600 to-sky-500 text-white shadow-sm"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              Student
            </button>
            <button
              type="button"
              onClick={() => setRole("faculty")}
              className={`py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all duration-200 cursor-pointer ${
                role === "faculty"
                  ? "bg-gradient-to-r from-blue-600 to-sky-500 text-white shadow-sm"
                  : "text-slate-500 hover:text-slate-800"
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
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-400 text-xs cursor-not-allowed font-semibold"
                    />
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="border-t border-slate-100 my-4 pt-4 space-y-4">
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
            className="btn-primary w-full flex items-center justify-center gap-2 text-sm tracking-wide mt-2"
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
              <div className="w-full border-t border-slate-100"></div>
            </div>
            <span className="relative bg-white px-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">or register with</span>
          </div>

          <button
            type="button"
            onClick={handleOAuthSignUp}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2.5 py-2.5 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 transition-all duration-200 cursor-pointer text-slate-600 hover:text-slate-800 font-bold text-xs disabled:opacity-50"
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

        <div className="text-center border-t border-slate-100 pt-4">
          <p className="text-xs text-slate-400 font-semibold">
            Already have an account?{" "}
            <Link
              to="/"
              className="text-blue-600 hover:text-blue-700 font-bold transition-colors duration-300"
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