import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { signUpUser } from "../services/authService";
import { saveProfile } from "../services/profileService";
import { supabase } from "../lib/supabase";
import { Sparkles, Mail, Lock, User, Briefcase, GraduationCap, Calendar, Hash, Loader2 } from "lucide-react";

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
      // 1. Sign up the user
      const { data, error } = await signUpUser(email, password);

      if (error) {
        setErrorMessage(error.message);
        setLoading(false);
        return;
      }

      if (data?.user) {
        // 2. Save profile details directly (using the newly created session)
        // Wait! In Supabase, signUp might log the user in automatically or require email confirmation.
        // If email confirmation is enabled, upserting profile immediately might fail if session is null.
        // Let's call saveProfile. If it fails, we notify the user. But typically signUp is configured to auto-login on local setups or return the user context.
        // Let's write the profile entry.
        const { error: profileError } = await saveProfile(
          fullName,
          department,
          year,
          registerNo,
          role
        );

        if (profileError) {
          console.error("Profile creation error:", profileError);
          // If we fail to create profile, it's usually because session is not yet active (requires confirmation)
          // We can show a success message asking them to check email, or inform them.
          setSuccessMessage("Account created! Please check your email to verify and set up your profile.");
        } else {
          // Success! Save details to local storage
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

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 relative overflow-hidden py-12">
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-indigo-100 rounded-full blur-3xl opacity-60"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-violet-100 rounded-full blur-3xl opacity-60"></div>

      <div className="w-full max-w-lg bg-white rounded-3xl border border-gray-100 shadow-xl p-8 relative z-10">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-200 mb-3">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-gray-900 via-indigo-950 to-gray-800 bg-clip-text text-transparent">
            Create Account
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Join Edutwin AI & Start Cataloguing Achievements
          </p>
        </div>

        {errorMessage && (
          <div className="mb-5 p-3.5 bg-red-50 border border-red-100 text-red-600 rounded-xl text-xs font-medium">
            {errorMessage}
          </div>
        )}

        {successMessage && (
          <div className="mb-5 p-3.5 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-xl text-xs font-medium">
            {successMessage}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          {/* Role Toggle Selector */}
          <div className="grid grid-cols-2 gap-2 bg-gray-100/80 p-1 rounded-xl border border-gray-200/50 mb-4">
            <button
              type="button"
              onClick={() => setRole("student")}
              className={`py-2.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all duration-300 cursor-pointer ${
                role === "student"
                  ? "bg-white text-indigo-600 shadow-sm"
                  : "text-gray-500 hover:text-gray-800"
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
                  ? "bg-white text-indigo-600 shadow-sm"
                  : "text-gray-500 hover:text-gray-800"
              }`}
            >
              <Briefcase className="w-4 h-4" />
              Faculty Member
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <User className="w-4 h-4" />
              </span>
              <input
                type="text"
                placeholder="Full Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                disabled={loading}
                className="w-full pl-10 pr-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-gray-800 text-sm transition-all duration-300"
              />
            </div>

            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <Hash className="w-4 h-4" />
              </span>
              <input
                type="text"
                placeholder={role === "student" ? "Register Number" : "Faculty ID / Employee ID"}
                value={registerNo}
                onChange={(e) => setRegisterNo(e.target.value)}
                disabled={loading}
                className="w-full pl-10 pr-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-gray-800 text-sm transition-all duration-300"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <GraduationCap className="w-4 h-4" />
              </span>
              <input
                type="text"
                placeholder="Department (e.g. CSE, ECE)"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                disabled={loading}
                className="w-full pl-10 pr-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-gray-800 text-sm transition-all duration-300"
              />
            </div>

            {role === "student" ? (
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Calendar className="w-4 h-4" />
                </span>
                <select
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  disabled={loading}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-gray-800 text-sm transition-all duration-300 appearance-none"
                >
                  <option value="1">1st Year</option>
                  <option value="2">2nd Year</option>
                  <option value="3">3rd Year</option>
                  <option value="4">4th Year</option>
                </select>
              </div>
            ) : (
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <GraduationCap className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  placeholder="Designation (e.g. Professor)"
                  value="Faculty"
                  disabled
                  className="w-full pl-10 pr-4 py-3 bg-gray-100 border border-gray-250 rounded-xl text-gray-500 text-sm cursor-not-allowed"
                />
              </div>
            )}
          </div>

          <div className="border-t border-gray-100 my-4 pt-4 space-y-4">
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <Mail className="w-4 h-4" />
              </span>
              <input
                type="email"
                placeholder="College Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                className="w-full pl-10 pr-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-gray-800 text-sm transition-all duration-300"
              />
            </div>

            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <Lock className="w-4 h-4" />
              </span>
              <input
                type="password"
                placeholder="Password (min 6 chars)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                className="w-full pl-10 pr-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-gray-800 text-sm transition-all duration-300"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-semibold py-3 px-4 rounded-xl hover:from-indigo-700 hover:to-violet-700 shadow-md shadow-indigo-150 transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer mt-4"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Creating Account...
              </>
            ) : (
              "Sign Up & Setup Profile"
            )}
          </button>
        </form>

        <div className="space-y-4 mt-6">
          <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-150"></div>
            </div>
            <span className="relative bg-white px-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">or register with</span>
          </div>

          <button
            type="button"
            onClick={handleOAuthSignUp}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 bg-gray-50 hover:bg-gray-100 rounded-xl border border-gray-200 transition cursor-pointer font-bold text-xs text-gray-700 disabled:opacity-50"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#ea4335" d="M12 5.04c1.66 0 3.2.57 4.38 1.69l3.27-3.27C17.68 1.54 14.98 1 12 1 7.35 1 3.37 3.67 1.39 7.56l3.85 2.99c.9-2.7 3.4-4.51 6.76-4.51z" />
              <path fill="#4285f4" d="M23.49 12.27c0-.81-.07-1.59-.2-2.36H12v4.51h6.46c-.28 1.48-1.12 2.73-2.38 3.58l3.7 2.87c2.16-2 3.71-4.94 3.71-8.6z" />
              <path fill="#fbbc05" d="M5.24 14.56c-.24-.72-.38-1.5-.38-2.31s.14-1.59.38-2.31L1.39 6.95C.5 8.75 0 10.79 0 12.91s.5 4.16 1.39 5.96l3.85-2.95z" />
              <path fill="#34a853" d="M12 23c3.24 0 5.97-1.07 7.96-2.91l-3.7-2.87c-1.03.69-2.35 1.1-4.26 1.1-3.36 0-5.86-1.81-6.76-4.51l-3.85 2.99C3.37 20.33 7.35 23 12 23z" />
            </svg>
            Sign Up with Google
          </button>
        </div>

        <div className="mt-8 text-center border-t border-gray-100 pt-6">
          <p className="text-xs text-gray-500 font-semibold">
            Already have an account?{" "}
            <Link
              to="/"
              className="text-indigo-600 hover:text-indigo-700 font-bold transition-colors duration-300"
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