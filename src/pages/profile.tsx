import { useState, useEffect } from "react";
import { saveProfile, getProfile } from "../services/profileService";
import Navbar from "../components/Navbar";
import { User, BookOpen, GraduationCap, Calendar, Award, Percent, Hash, Mail, Shield, CheckCircle2, Loader2 } from "lucide-react";

function Profile() {
  const [fullName, setFullName] = useState("");
  const [department, setDepartment] = useState("");
  const [year, setYear] = useState("1");
  const [registerNo, setRegisterNo] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("student");
  
  // Custom Academic details stored in localStorage
  const [cgpa, setCgpa] = useState("8.5");
  const [attendance, setAttendance] = useState("85");
  const [userId, setUserId] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    // Fetch profile on load
    getProfile()
      .then(({ data, error }) => {
        if (error) {
          console.error("Error loading profile:", error);
          setErrorMsg(`Could not load profile: ${error.message || JSON.stringify(error)}`);
        } else if (data) {
          setUserId(data.id);
          setFullName(data.full_name || "");
          setDepartment(data.department || "");
          setYear(String(data.year || 3));
          setRegisterNo(data.register_no || "");
          setEmail(data.email || "");
          setRole(data.role || "student");

          // Load local storage academic details
          const cachedAcademic = localStorage.getItem(`academic_profile_${data.id}`);
          if (cachedAcademic) {
            try {
              const parsed = JSON.parse(cachedAcademic);
              setCgpa(parsed.cgpa || "8.5");
              setAttendance(parsed.attendance || "85");
            } catch (e) {
              console.error(e);
            }
          }
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !department || !registerNo) {
      setErrorMsg("Please fill all required profile fields.");
      return;
    }

    setSaving(true);
    setErrorMsg("");
    setSuccess(false);

    try {
      // 1. Save profile to Supabase
      const { error } = await saveProfile(
        fullName,
        department,
        year,
        registerNo,
        role
      );

      if (error) {
        setErrorMsg(error.message);
        setSaving(false);
        return;
      }

      // 2. Save academic details to localStorage
      if (userId) {
        localStorage.setItem(
          `academic_profile_${userId}`,
          JSON.stringify({ cgpa, attendance })
        );
      }

      // Update navbar details cached values
      localStorage.setItem("user_name", fullName);
      localStorage.setItem("user_role", role);

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setErrorMsg(err.message || "An error occurred while saving profile.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
          <span className="text-sm font-medium text-gray-500">Loading Profile...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <Navbar />

      <div className="pt-28 px-4 max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-2">
            <User className="w-8 h-8 text-indigo-600" />
            My Profile
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Maintain your academic, personal, and administrative information.
          </p>
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-sm font-medium">
            {errorMsg}
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-2xl text-sm font-medium flex items-center gap-2 shadow-sm">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            Profile changes saved successfully!
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-8">
          {/* Card: Personal Details */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2 border-b border-gray-100 pb-4 mb-6">
              <User className="w-5 h-5 text-indigo-500" />
              Personal Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Full Name
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <User className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-gray-800 text-sm transition-all duration-300"
                  />
                </div>
              </div>

              {/* Email (Read-Only) */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Email Address (Verified)
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <Mail className="w-4 h-4" />
                  </span>
                  <input
                    type="email"
                    value={email}
                    disabled
                    className="w-full pl-10 pr-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-500 text-sm cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Role Indicator */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Account Type / Role
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <Shield className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    value={role.charAt(0).toUpperCase() + role.slice(1)}
                    disabled
                    className="w-full pl-10 pr-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-500 text-sm cursor-not-allowed capitalize"
                  />
                </div>
              </div>

              {/* Reg No */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {role === "student" ? "Register Number" : "Faculty ID / Employee ID"}
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <Hash className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    value={registerNo}
                    onChange={(e) => setRegisterNo(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-gray-800 text-sm transition-all duration-300"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Card: Academic Information (Dynamic based on role) */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2 border-b border-gray-100 pb-4 mb-6">
              <BookOpen className="w-5 h-5 text-indigo-500" />
              Academic & Department Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Department */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Department
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <GraduationCap className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="e.g. CSE, ECE"
                    className="w-full pl-10 pr-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-gray-800 text-sm transition-all duration-300"
                  />
                </div>
              </div>

              {/* Year Selector */}
              {role === "student" && (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Current Year
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                      <Calendar className="w-4 h-4" />
                    </span>
                    <select
                      value={year}
                      onChange={(e) => setYear(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-gray-800 text-sm transition-all duration-300 appearance-none"
                    >
                      <option value="1">1st Year</option>
                      <option value="2">2nd Year</option>
                      <option value="3">3rd Year</option>
                      <option value="4">4th Year</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* Custom academic variables for students */}
            {role === "student" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 pt-6 border-t border-gray-100">
                {/* CGPA */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Cumulative GPA (CGPA)
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                      <Award className="w-4 h-4" />
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="10"
                      placeholder="e.g. 8.50"
                      value={cgpa}
                      onChange={(e) => setCgpa(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-gray-800 text-sm transition-all duration-300"
                    />
                  </div>
                  <span className="text-[10px] text-gray-400">Values are between 0.00 and 10.00</span>
                </div>

                {/* Attendance */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Average Attendance %
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                      <Percent className="w-4 h-4" />
                    </span>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      placeholder="e.g. 85"
                      value={attendance}
                      onChange={(e) => setAttendance(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-gray-800 text-sm transition-all duration-300"
                    />
                  </div>
                  <span className="text-[10px] text-gray-400">Values are between 0% and 100%</span>
                </div>
              </div>
            )}
          </div>

          {/* Action button */}
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={saving}
              className="px-8 py-3.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-semibold rounded-xl shadow-md shadow-indigo-150 transition-all duration-300 disabled:opacity-50 flex items-center gap-2 cursor-pointer"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Profile Changes"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Profile;