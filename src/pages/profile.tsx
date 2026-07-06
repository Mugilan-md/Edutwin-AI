import { useState, useEffect } from "react";
import { saveProfile, getProfile } from "../services/profileService";
import Navbar from "../components/Navbar";
import {
  User,
  BookOpen,
  GraduationCap,
  Calendar,
  Award,
  Percent,
  Hash,
  Mail,
  Shield,
  CheckCircle2,
  Loader2,
  Phone,
  MapPin,
  Link2,
  Code2,
} from "lucide-react";

function Profile() {
  const [fullName, setFullName] = useState("");
  const [department, setDepartment] = useState("");
  const [year, setYear] = useState("1");
  const [registerNo, setRegisterNo] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("student");

  // Student-specific academic details (stored in localStorage)
  const [cgpa, setCgpa] = useState("8.5");
  const [attendance, setAttendance] = useState("85");

  // Extra profile fields
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [github, setGithub] = useState("");
  const [section, setSection] = useState("");
  const [batch, setBatch] = useState("");

  const [userId, setUserId] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    getProfile()
      .then(({ data, error }) => {
        if (error) {
          setErrorMsg(`Could not load profile: ${error.message || JSON.stringify(error)}`);
        } else if (data) {
          setUserId(data.id);
          setFullName(data.full_name || "");
          setDepartment(data.department || "");
          setYear(String(data.year || 1));
          setRegisterNo(data.register_no || "");
          setEmail(data.email || "");
          setRole(data.role || "student");

          const cached = localStorage.getItem(`academic_profile_${data.id}`);
          if (cached) {
            try {
              const p = JSON.parse(cached);
              setCgpa(p.cgpa || "8.5");
              setAttendance(p.attendance || "85");
              setPhone(p.phone || "");
              setCity(p.city || "");
              setLinkedin(p.linkedin || "");
              setGithub(p.github || "");
              setSection(p.section || "");
              setBatch(p.batch || "");
            } catch (e) { console.error(e); }
          }
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !department || !registerNo) {
      setErrorMsg("Please fill all required fields (Name, Department, ID).");
      return;
    }
    setSaving(true);
    setErrorMsg("");
    setSuccess(false);

    try {
      const { error } = await saveProfile(fullName, department, year, registerNo, role);
      if (error) { setErrorMsg(error.message); setSaving(false); return; }

      if (userId) {
        localStorage.setItem(`academic_profile_${userId}`, JSON.stringify({
          cgpa, attendance, phone, city, linkedin, github, section, batch,
        }));
      }

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
      <div className="min-h-screen bg-[#080608] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
          <span className="text-sm font-medium text-orange-300/60">Loading Profile...</span>
        </div>
      </div>
    );
  }

  // Shared input class
  const inputCls = "w-full pl-10 pr-4 py-3 bg-black/30 border border-orange-500/15 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500/30 text-white text-sm transition-all duration-300 placeholder-orange-300/20";
  const disabledCls = "w-full pl-10 pr-4 py-3 bg-black/50 border border-orange-500/10 rounded-xl text-orange-300/30 text-sm cursor-not-allowed";
  const labelCls = "text-xs font-bold text-orange-300/50 uppercase tracking-wider block mb-1.5";
  const iconCls = "absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-orange-400/40";

  return (
    <div className="min-h-screen bg-[#080608] pb-16">
      <Navbar />

      <div className="pt-28 px-4 max-w-4xl mx-auto">

        {/* Page header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-[#0f0a04] via-[#1a0d02] to-[#0a0505] border border-orange-500/20 rounded-3xl p-7 shadow-2xl shadow-black/60 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-orange-500/6 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-orange-500/10 border border-orange-500/20 rounded-full text-xs font-semibold text-orange-300 mb-2">
              <User className="w-3.5 h-3.5" />
              {role.charAt(0).toUpperCase() + role.slice(1)} Profile
            </div>
            <h1 className="text-2xl font-extrabold text-white">My Profile</h1>
            <p className="text-sm text-orange-200/40 mt-1">
              Maintain your academic, personal, and contact information.
            </p>
          </div>
        </div>

        {/* Alerts */}
        {errorMsg && (
          <div className="mb-6 p-4 bg-red-950/50 border border-red-500/30 text-red-400 rounded-2xl text-sm font-medium">
            {errorMsg}
          </div>
        )}
        {success && (
          <div className="mb-6 p-4 bg-emerald-950/50 border border-emerald-500/30 text-emerald-400 rounded-2xl text-sm font-medium flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5" />
            Profile saved successfully!
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">

          {/* ── Card 1: Personal Information ── */}
          <div className="bg-[#0e0a04] border border-orange-500/15 rounded-3xl shadow-lg shadow-black/40 p-8">
            <h2 className="text-lg font-bold text-white flex items-center gap-2 border-b border-orange-500/10 pb-4 mb-6">
              <User className="w-5 h-5 text-orange-500" />
              Personal Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* Full Name */}
              <div>
                <label className={labelCls}>Full Name *</label>
                <div className="relative">
                  <span className={iconCls}><User className="w-4 h-4" /></span>
                  <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="e.g. Mugilan R" className={inputCls} />
                </div>
              </div>

              {/* Email (read-only) */}
              <div>
                <label className={labelCls}>Email Address (Verified)</label>
                <div className="relative">
                  <span className={iconCls}><Mail className="w-4 h-4" /></span>
                  <input type="email" value={email} disabled className={disabledCls} />
                </div>
              </div>

              {/* Account Role (read-only) */}
              <div>
                <label className={labelCls}>Account Role</label>
                <div className="relative">
                  <span className={iconCls}><Shield className="w-4 h-4" /></span>
                  <input type="text" value={role.charAt(0).toUpperCase() + role.slice(1)} disabled className={disabledCls} />
                </div>
              </div>

              {/* Register No / Employee ID */}
              <div>
                <label className={labelCls}>{role === "student" ? "Register Number *" : "Faculty / Employee ID *"}</label>
                <div className="relative">
                  <span className={iconCls}><Hash className="w-4 h-4" /></span>
                  <input type="text" value={registerNo} onChange={(e) => setRegisterNo(e.target.value)} placeholder="e.g. 22CSEB140" className={inputCls} />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className={labelCls}>Phone Number</label>
                <div className="relative">
                  <span className={iconCls}><Phone className="w-4 h-4" /></span>
                  <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="e.g. +91 98765 43210" className={inputCls} />
                </div>
              </div>

              {/* City */}
              <div>
                <label className={labelCls}>City / Location</label>
                <div className="relative">
                  <span className={iconCls}><MapPin className="w-4 h-4" /></span>
                  <input type="text" value={city} onChange={(e) => setCity(e.target.value)} placeholder="e.g. Chennai, Tamil Nadu" className={inputCls} />
                </div>
              </div>

            </div>
          </div>

          {/* ── Card 2: Academic & Department Details ── */}
          <div className="bg-[#0e0a04] border border-orange-500/15 rounded-3xl shadow-lg shadow-black/40 p-8">
            <h2 className="text-lg font-bold text-white flex items-center gap-2 border-b border-orange-500/10 pb-4 mb-6">
              <BookOpen className="w-5 h-5 text-orange-500" />
              Academic & Department Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* Department */}
              <div>
                <label className={labelCls}>Department *</label>
                <div className="relative">
                  <span className={iconCls}><GraduationCap className="w-4 h-4" /></span>
                  <input type="text" value={department} onChange={(e) => setDepartment(e.target.value)} placeholder="e.g. CSE, ECE, MECH" className={inputCls} />
                </div>
              </div>

              {/* Year (students only) */}
              {role === "student" && (
                <div>
                  <label className={labelCls}>Current Year</label>
                  <div className="relative">
                    <span className={iconCls}><Calendar className="w-4 h-4" /></span>
                    <select value={year} onChange={(e) => setYear(e.target.value)} className={inputCls + " appearance-none"}>
                      <option value="1">1st Year</option>
                      <option value="2">2nd Year</option>
                      <option value="3">3rd Year</option>
                      <option value="4">4th Year</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Section (students only) */}
              {role === "student" && (
                <div>
                  <label className={labelCls}>Section / Class</label>
                  <div className="relative">
                    <span className={iconCls}><Hash className="w-4 h-4" /></span>
                    <input type="text" value={section} onChange={(e) => setSection(e.target.value)} placeholder="e.g. Section A, B" className={inputCls} />
                  </div>
                </div>
              )}

              {/* Batch Year */}
              <div>
                <label className={labelCls}>Batch / Joining Year</label>
                <div className="relative">
                  <span className={iconCls}><Calendar className="w-4 h-4" /></span>
                  <input type="text" value={batch} onChange={(e) => setBatch(e.target.value)} placeholder="e.g. 2022–2026" className={inputCls} />
                </div>
              </div>

            </div>

            {/* Students-only: CGPA & Attendance */}
            {role === "student" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 pt-6 border-t border-orange-500/10">
                <div>
                  <label className={labelCls}>Cumulative GPA (CGPA)</label>
                  <div className="relative">
                    <span className={iconCls}><Award className="w-4 h-4" /></span>
                    <input type="number" step="0.01" min="0" max="10" placeholder="e.g. 8.50" value={cgpa} onChange={(e) => setCgpa(e.target.value)} className={inputCls} />
                  </div>
                  <span className="text-[10px] text-orange-300/30 mt-1 block">Between 0.00 and 10.00</span>
                </div>
                <div>
                  <label className={labelCls}>Average Attendance %</label>
                  <div className="relative">
                    <span className={iconCls}><Percent className="w-4 h-4" /></span>
                    <input type="number" min="0" max="100" placeholder="e.g. 85" value={attendance} onChange={(e) => setAttendance(e.target.value)} className={inputCls} />
                  </div>
                  <span className="text-[10px] text-orange-300/30 mt-1 block">Between 0% and 100%</span>
                </div>
              </div>
            )}
          </div>

          {/* ── Card 3: Social & Online Presence ── */}
          <div className="bg-[#0e0a04] border border-orange-500/15 rounded-3xl shadow-lg shadow-black/40 p-8">
            <h2 className="text-lg font-bold text-white flex items-center gap-2 border-b border-orange-500/10 pb-4 mb-6">
              <Link2 className="w-5 h-5 text-orange-500" />
              Online Presence & Portfolio
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={labelCls}>LinkedIn Profile URL</label>
                <div className="relative">
                  <span className={iconCls}><Link2 className="w-4 h-4" /></span>
                  <input type="url" value={linkedin} onChange={(e) => setLinkedin(e.target.value)} placeholder="https://linkedin.com/in/yourname" className={inputCls} />
                </div>
              </div>
              <div>
                <label className={labelCls}>GitHub Profile URL</label>
                <div className="relative">
                  <span className={iconCls}><Code2 className="w-4 h-4" /></span>
                  <input type="url" value={github} onChange={(e) => setGithub(e.target.value)} placeholder="https://github.com/yourname" className={inputCls} />
                </div>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={saving}
              className="px-8 py-3.5 bg-gradient-to-r from-[#D7263D] via-[#FF6A00] to-[#FFC247] text-white font-bold rounded-xl shadow-lg shadow-orange-900/40 hover:brightness-110 transition-all duration-300 disabled:opacity-50 flex items-center gap-2 cursor-pointer"
            >
              {saving ? (
                <><Loader2 className="w-4 h-4 animate-spin" />Saving...</>
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