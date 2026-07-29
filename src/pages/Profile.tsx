import { useState, useEffect } from "react";
import { saveProfile, getProfile } from "../services/profileService";
import Navbar from "../components/Navbar";
import {
  User, BookOpen, GraduationCap, Calendar, Award, Percent, Hash, Mail, Shield,
  CheckCircle2, Loader2, Phone, MapPin, Link2, Code2,
} from "lucide-react";

function Profile() {
  const [fullName, setFullName]     = useState("");
  const [department, setDepartment] = useState("");
  const [year, setYear]             = useState("1");
  const [registerNo, setRegisterNo] = useState("");
  const [email, setEmail]           = useState("");
  const [role, setRole]             = useState("student");

  // Student-specific academic details (stored in localStorage)
  const [cgpa, setCgpa]             = useState("8.5");
  const [attendance, setAttendance] = useState("85");

  // Extra profile fields
  const [phone, setPhone]           = useState("");
  const [city, setCity]             = useState("");
  const [linkedin, setLinkedin]     = useState("");
  const [github, setGithub]         = useState("");
  const [section, setSection]       = useState("");
  const [batch, setBatch]           = useState("");

  const [userId, setUserId]   = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
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
      <div className="min-h-screen bg-[#FFFCC7] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          <span className="text-sm font-medium text-slate-500">Loading Profile...</span>
        </div>
      </div>
    );
  }

  const labelCls = "text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1 mb-1.5 block";
  const iconCls  = "absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-blue-500/70";
  const inputCls = "w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400/30 focus:border-blue-400 text-slate-800 text-xs font-semibold placeholder-slate-300 transition-all";
  const disabledCls = "w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-400 text-xs cursor-not-allowed font-semibold";

  return (
    <div className="min-h-screen bg-[#FFFCC7] pb-16">
      <Navbar />
      <div className="pt-28 px-4 max-w-4xl mx-auto">

        {/* Page header */}
        <div className="mb-7 glass-card-strong rounded-3xl p-7 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-blue-50 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-100 border border-blue-200 rounded-full text-xs font-bold text-blue-700 mb-3">
              <User className="w-3.5 h-3.5" />
              {role.charAt(0).toUpperCase() + role.slice(1)} Profile
            </div>
            <h1 className="text-2xl font-black text-slate-900">My Profile</h1>
            <p className="text-sm text-slate-400 mt-1">
              Maintain your academic, personal, and contact information. Updates will sync automatically across dashboards.
            </p>
          </div>
        </div>

        {/* Alerts */}
        {errorMsg && (
          <div className="mb-5 p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-sm font-medium">{errorMsg}</div>
        )}
        {success && (
          <div className="mb-5 p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-2xl text-sm font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5" />
            Profile saved successfully!
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">

          {/* Personal info */}
          <div className="glass-card-strong rounded-3xl p-7">
            <h2 className="text-base font-bold text-slate-950 flex items-center gap-2 border-b border-slate-100 pb-4 mb-5">
              <User className="w-5 h-5 text-blue-600" />
              Personal Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className={labelCls}>Full Name *</label>
                <div className="relative">
                  <span className={iconCls}><User className="w-4 h-4" /></span>
                  <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="e.g. Mugilan R" className={inputCls} />
                </div>
              </div>

              <div>
                <label className={labelCls}>Email Address (Verified)</label>
                <div className="relative">
                  <span className={iconCls}><Mail className="w-4 h-4" /></span>
                  <input type="email" value={email} disabled className={disabledCls} />
                </div>
              </div>

              <div>
                <label className={labelCls}>Account Role</label>
                <div className="relative">
                  <span className={iconCls}><Shield className="w-4 h-4" /></span>
                  <select value={role} onChange={(e) => setRole(e.target.value)} className={inputCls + " appearance-none"}>
                    <option value="student">Student</option>
                    <option value="faculty">Faculty Member</option>
                    <option value="admin">System Administrator</option>
                  </select>
                </div>
              </div>

              <div>
                <label className={labelCls}>{role === "student" ? "Register Number *" : "Faculty / Employee ID *"}</label>
                <div className="relative">
                  <span className={iconCls}><Hash className="w-4 h-4" /></span>
                  <input type="text" value={registerNo} onChange={(e) => setRegisterNo(e.target.value)} placeholder="e.g. 22CSEB140" className={inputCls} />
                </div>
              </div>

              <div>
                <label className={labelCls}>Phone Number</label>
                <div className="relative">
                  <span className={iconCls}><Phone className="w-4 h-4" /></span>
                  <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="e.g. +91 98765 43210" className={inputCls} />
                </div>
              </div>

              <div>
                <label className={labelCls}>City / Location</label>
                <div className="relative">
                  <span className={iconCls}><MapPin className="w-4 h-4" /></span>
                  <input type="text" value={city} onChange={(e) => setCity(e.target.value)} placeholder="e.g. Chennai, Tamil Nadu" className={inputCls} />
                </div>
              </div>
            </div>
          </div>

          {/* Academic details */}
          <div className="glass-card-strong rounded-3xl p-7">
            <h2 className="text-base font-bold text-slate-950 flex items-center gap-2 border-b border-slate-100 pb-4 mb-5">
              <BookOpen className="w-5 h-5 text-blue-600" />
              Academic & Department Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className={labelCls}>Department *</label>
                <div className="relative">
                  <span className={iconCls}><GraduationCap className="w-4 h-4" /></span>
                  <input type="text" value={department} onChange={(e) => setDepartment(e.target.value)} placeholder="e.g. CSE, ECE, MECH" className={inputCls} />
                </div>
              </div>

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

              {role === "student" && (
                <div>
                  <label className={labelCls}>Section / Class</label>
                  <div className="relative">
                    <span className={iconCls}><Hash className="w-4 h-4" /></span>
                    <input type="text" value={section} onChange={(e) => setSection(e.target.value)} placeholder="e.g. Section A, B" className={inputCls} />
                  </div>
                </div>
              )}

              <div>
                <label className={labelCls}>Batch / Joining Year</label>
                <div className="relative">
                  <span className={iconCls}><Calendar className="w-4 h-4" /></span>
                  <input type="text" value={batch} onChange={(e) => setBatch(e.target.value)} placeholder="e.g. 2022–2026" className={inputCls} />
                </div>
              </div>
            </div>

            {role === "student" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5 pt-5 border-t border-slate-100">
                <div>
                  <label className={labelCls}>Cumulative GPA (CGPA)</label>
                  <div className="relative">
                    <span className={iconCls}><Award className="w-4 h-4" /></span>
                    <input type="number" step="0.01" min="0" max="10" placeholder="e.g. 8.50" value={cgpa} onChange={(e) => setCgpa(e.target.value)} className={inputCls} />
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 block">Between 0.00 and 10.00</span>
                </div>
                <div>
                  <label className={labelCls}>Average Attendance %</label>
                  <div className="relative">
                    <span className={iconCls}><Percent className="w-4 h-4" /></span>
                    <input type="number" min="0" max="100" placeholder="e.g. 85" value={attendance} onChange={(e) => setAttendance(e.target.value)} className={inputCls} />
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 block">Between 0% and 100%</span>
                </div>
              </div>
            )}
          </div>

          {/* Social Presence */}
          <div className="glass-card-strong rounded-3xl p-7">
            <h2 className="text-base font-bold text-slate-950 flex items-center gap-2 border-b border-slate-100 pb-4 mb-5">
              <Link2 className="w-5 h-5 text-blue-600" />
              Online Presence & Portfolio
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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
            <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2 text-sm">
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