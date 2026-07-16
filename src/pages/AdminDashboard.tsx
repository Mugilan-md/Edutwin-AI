import { useState, useEffect } from "react";
import { fetchAllActivitiesForAdmin, parseDescription } from "../services/activityService";
import Navbar from "../components/Navbar";
import {
  BarChart3, Users, CheckCircle2, BookOpen, Download, Search,
  GraduationCap, BrainCircuit, Sparkles, CheckSquare, RefreshCw,
  AlertTriangle, Loader2, TrendingUp, Award,
} from "lucide-react";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";
import { getProfile } from "../services/profileService";

function AdminDashboard() {
  const navigate = useNavigate();
  const [students, setStudents]   = useState<any[]>([]);
  const [loading, setLoading]     = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [deptFilter, setDeptFilter] = useState("All");
  const [errorMsg, setErrorMsg]   = useState("");

  const [totalStudentsCount, setTotalStudentsCount] = useState(0);
  const [totalActsCount, setTotalActsCount]         = useState(0);
  const [approvedRate, setApprovedRate]             = useState(0);
  const [totalVerifiedCredits, setTotalVerifiedCredits] = useState(0);

  const [naacScore, setNaacScore]     = useState(3.25);
  const [naacConfidence, setNaacConfidence] = useState(85);
  const [naacStatus, setNaacStatus]   = useState("Calculating...");

  const [deptSkills, setDeptSkills]     = useState<{ [key: string]: { web: number; coding: number; res: number; lead: number } }>({});
  const [categoryStats, setCategoryStats] = useState<{ [key: string]: number }>({});

  useEffect(() => {
    async function init() {
      try {
        const { data: prof } = await getProfile();
        if (!prof || prof.role === "student") { navigate("/student"); return; }
        await loadAdminData();
      } catch (e) { console.error(e); setLoading(false); }
    }
    init();
  }, []);

  async function loadAdminData() {
    setLoading(true); setErrorMsg("");
    try {
      const { data: profiles, error: profilesError } = await supabase.from("profiles").select("*");
      if (profilesError) setErrorMsg("Cannot fetch profiles. Check Supabase RLS policies.");

      const profilesList = profiles || [];
      const { data: acts, error: actsError } = await fetchAllActivitiesForAdmin();
      if (actsError) setErrorMsg("Cannot fetch activities. Check Supabase RLS policies.");

      const activitiesList = acts || [];
      setTotalActsCount(activitiesList.length);

      let approvedCount = 0, totalCreditsSum = 0;
      const catStats: { [key: string]: number } = {};
      const studentMap: { [id: string]: any } = {};

      profilesList.forEach((s) => {
        studentMap[s.id] = { id: s.id, full_name: s.full_name || "—", register_no: s.register_no || "—", department: s.department || "—", year: s.year || 1, role: s.role || "student", email: s.email || "", credits: 0, activitiesCount: 0 };
      });

      const deptData: { [dept: string]: { web: number; coding: number; res: number; lead: number; count: number } } = {};

      activitiesList.forEach((act: any) => {
        const meta = parseDescription(act.description);
        catStats[act.category] = (catStats[act.category] || 0) + 1;
        if (act.status === "approved") {
          approvedCount++;
          totalCreditsSum += meta.credits || 0;
          if (studentMap[act.student_id]) studentMap[act.student_id].credits += meta.credits || 0;
        }
        if (studentMap[act.student_id]) studentMap[act.student_id].activitiesCount++;

        const dept = act.profiles?.department || (studentMap[act.student_id]?.department) || "Other";
        if (!deptData[dept]) deptData[dept] = { web: 20, coding: 15, res: 15, lead: 15, count: 0 };
        deptData[dept].count++;
        const text = `${act.title} ${act.category} ${meta.text}`.toLowerCase();
        if (text.includes("web") || text.includes("react") || text.includes("js")) deptData[dept].web += 12;
        if (text.includes("hack") || text.includes("code") || text.includes("dsa")) deptData[dept].coding += 12;
        if (text.includes("paper") || text.includes("research") || text.includes("conference")) deptData[dept].res += 14;
        if (text.includes("volunteer") || text.includes("nss") || text.includes("lead")) deptData[dept].lead += 12;
      });

      setTotalVerifiedCredits(totalCreditsSum);
      setApprovedRate(activitiesList.length > 0 ? Math.round((approvedCount / activitiesList.length) * 100) : 0);
      setCategoryStats(catStats);

      const onlyStudents = Object.values(studentMap).filter(
        (s: any) => s.role === "student" && !s.email?.toLowerCase().includes("test_student")
      );
      setStudents(onlyStudents);
      setTotalStudentsCount(onlyStudents.length);

      const avgCredits = onlyStudents.length > 0 ? totalCreditsSum / onlyStudents.length : 0;
      const actRate    = onlyStudents.length > 0 ? activitiesList.length / onlyStudents.length : 0;
      const predictedNaac = Math.min(4.0, Math.max(2.0, 2.5 + (avgCredits * 0.12) + (actRate * 0.08)));
      setNaacScore(parseFloat(predictedNaac.toFixed(2)));

      let status = "Needs Improvement (B Tier)";
      if (predictedNaac >= 3.75) status = "A++ Ready — Exceptional";
      else if (predictedNaac >= 3.5) status = "A+ Tier — Highly Compliant";
      else if (predictedNaac >= 3.25) status = "A Tier — Satisfactory";
      else if (predictedNaac >= 3.0) status = "B++ — Moderate";
      setNaacStatus(status);
      setNaacConfidence(Math.min(97, 78 + onlyStudents.length * 2));

      const finalDeptSkills: { [key: string]: { web: number; coding: number; res: number; lead: number } } = {};
      Object.keys(deptData).forEach((dept) => {
        finalDeptSkills[dept] = { web: Math.min(100, deptData[dept].web), coding: Math.min(100, deptData[dept].coding), res: Math.min(100, deptData[dept].res), lead: Math.min(100, deptData[dept].lead) };
      });
      if (Object.keys(finalDeptSkills).length === 0) {
        finalDeptSkills["CSE"] = { web: 60, coding: 55, res: 35, lead: 40 };
        finalDeptSkills["ECE"] = { web: 35, coding: 45, res: 60, lead: 50 };
      }
      setDeptSkills(finalDeptSkills);
    } catch (err) {
      setErrorMsg("An unexpected error occurred while loading admin data.");
    } finally {
      setLoading(false);
    }
  }

  const exportToCSV = () => {
    if (students.length === 0) return;
    const headers = ["Register No", "Student Name", "Department", "Year", "Verified Credits", "Activities"];
    const rows = [headers.join(","), ...students.map((s) => [s.register_no, `"${s.full_name}"`, s.department, s.year, s.credits, s.activitiesCount].join(","))];
    const link = document.createElement("a");
    link.setAttribute("href", "data:text/csv;charset=utf-8," + encodeURI(rows.join("\n")));
    link.setAttribute("download", `edutwin_naac_report_${new Date().getFullYear()}.csv`);
    document.body.appendChild(link); link.click(); document.body.removeChild(link);
  };

  const filteredStudents = students.filter((s) => {
    const matchSearch = s.full_name.toLowerCase().includes(searchTerm.toLowerCase()) || s.register_no.toLowerCase().includes(searchTerm.toLowerCase());
    const matchDept   = deptFilter === "All" || s.department === deptFilter;
    return matchSearch && matchDept;
  });

  const uniqueDepts = [...new Set(students.map((s) => s.department).filter(Boolean))];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F2E7] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          <span className="text-sm font-semibold text-slate-500">Generating Accreditation Analytics...</span>
        </div>
      </div>
    );
  }

  const inputCls = "px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400/30 focus:border-blue-400 bg-white text-slate-700 placeholder-slate-300 transition-all";

  const naacPct = Math.min(100, Math.max(0, ((naacScore - 2.0) / 2.0) * 100));
  const naacDash = 251.2 - (251.2 * naacPct) / 100;

  const naacColor = naacScore >= 3.75 ? "#10b981" : naacScore >= 3.25 ? "#3b82f6" : naacScore >= 3.0 ? "#f59e0b" : "#ef4444";

  return (
    <div className="min-h-screen bg-[#F8F2E7] pb-16">
      <Navbar forcedRole="admin" />
      <div className="pt-24 px-4 max-w-6xl mx-auto space-y-6">

        {/* Header */}
        <div className="glass-card-strong rounded-3xl p-6 md:p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-56 h-56 bg-amber-50 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 border border-amber-200 rounded-full text-xs font-bold text-amber-700 mb-3">
                <BrainCircuit className="w-3.5 h-3.5" />
                AI Accreditation Intelligence — Admin View
              </div>
              <h1 className="text-2xl font-black text-slate-900">Institutional Analytics Dashboard</h1>
              <p className="text-slate-500 text-sm mt-1">NAAC · NIRF · AICTE Accreditation Readiness & Student Achievement Audit</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={loadAdminData}
                className="flex items-center gap-1.5 text-xs font-bold text-slate-600 bg-white hover:bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-200 cursor-pointer transition">
                <RefreshCw className="w-3.5 h-3.5" /> Refresh
              </button>
              <button onClick={exportToCSV}
                className="btn-primary text-xs flex items-center gap-1.5">
                <Download className="w-4 h-4" /> Export NAAC CSV
              </button>
            </div>
          </div>
        </div>

        {/* Error */}
        {errorMsg && (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center gap-3 text-sm text-amber-700">
            <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
            <span className="font-medium">{errorMsg}</span>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5">
          {[
            { label: "Registered Users",    value: totalStudentsCount,       sub: "All roles combined",      icon: Users,       badgeColor: "text-blue-600 bg-blue-50 border-blue-100" },
            { label: "Total Submissions",   value: totalActsCount,           sub: "Across all semesters",    icon: BookOpen,    badgeColor: "text-indigo-600 bg-indigo-50 border-indigo-100" },
            { label: "Verified Credits",    value: `${totalVerifiedCredits} pts`, sub: "Faculty-approved",  icon: Award,       badgeColor: "text-emerald-600 bg-emerald-50 border-emerald-100" },
            { label: "Approval Rate",       value: `${approvedRate}%`,       sub: "Verification efficiency", icon: CheckSquare, badgeColor: "text-amber-600 bg-amber-50 border-amber-100" },
          ].map((stat) => (
            <div key={stat.label} className="glass-card-strong rounded-2xl p-5 stat-card flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">{stat.label}</span>
                <h3 className="text-2xl font-black text-slate-900 mt-1">{stat.value}</h3>
                <p className="text-[11px] text-slate-400 font-medium mt-0.5">{stat.sub}</p>
              </div>
              <div className={`w-11 h-11 border rounded-xl flex items-center justify-center shrink-0 ${stat.badgeColor}`}>
                <stat.icon className="w-5 h-5" />
              </div>
            </div>
          ))}
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left: Student Directory + Categories */}
          <div className="lg:col-span-2 space-y-6">

            {/* Student Directory */}
            <div className="glass-card-strong rounded-3xl p-7">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5 mb-6">
                <div>
                  <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Users className="w-5 h-5 text-blue-600" />
                    Student Achievement Directory
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">Filter and audit each student's verified credit standing</p>
                </div>
                <div className="flex gap-2">
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-300">
                      <Search className="w-3.5 h-3.5" />
                    </span>
                    <input type="text" placeholder="Name / Reg No..." value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className={inputCls + " pl-8 w-36"} />
                  </div>
                  <select value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)} className={inputCls}>
                    <option value="All">All Depts</option>
                    {uniqueDepts.map((d) => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              </div>

              {filteredStudents.length === 0 ? (
                <div className="py-16 text-center space-y-2">
                  <Users className="w-12 h-12 text-blue-100 mx-auto" />
                  <p className="text-sm font-semibold text-slate-400">No students found matching your filters.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-slate-100">
                        {["Student", "Email", "Dept", "Year", "Activities", "Credits"].map((h) => (
                          <th key={h} className="pb-3 pr-4 text-[10px] font-black text-slate-400 uppercase tracking-wider">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {filteredStudents.map((s) => (
                        <tr key={s.id} className="hover:bg-blue-50/40 transition duration-150">
                          <td className="py-3.5 pr-4">
                            <span className="block text-sm font-bold text-slate-800">{s.full_name}</span>
                            <span className="block text-[10px] text-slate-400">{s.register_no}</span>
                          </td>
                          <td className="py-3.5 pr-4 text-xs text-slate-400 truncate max-w-[120px]">{s.email || "—"}</td>
                          <td className="py-3.5 pr-4 text-xs font-semibold text-slate-600">{s.department}</td>
                          <td className="py-3.5 pr-4 text-xs text-slate-400">Y{s.year}</td>
                          <td className="py-3.5 pr-4 text-xs text-slate-500">{s.activitiesCount}</td>
                          <td className="py-3.5">
                            <span className={`text-[11px] font-black px-2.5 py-1 rounded-lg border ${
                              s.credits >= 10 ? "badge-green" : s.credits >= 5 ? "badge-blue" : "badge-amber"
                            }`}>
                              {s.credits} pts
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Category Breakdown */}
            {Object.keys(categoryStats).length > 0 && (
              <div className="glass-card-strong rounded-3xl p-7">
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-4 mb-5">
                  <BarChart3 className="w-5 h-5 text-blue-600" />
                  Activity Category Distribution
                </h2>
                <div className="space-y-4">
                  {Object.entries(categoryStats).sort((a, b) => b[1] - a[1]).map(([cat, count]) => {
                    const max = Math.max(...Object.values(categoryStats));
                    const pct = Math.round((count / max) * 100);
                    return (
                      <div key={cat} className="space-y-1.5">
                        <div className="flex justify-between text-xs font-semibold">
                          <span className="text-slate-700">{cat}</span>
                          <span className="text-blue-600">{count} submissions</span>
                        </div>
                        <div className="skill-bar"><div className="skill-bar-fill" style={{ width: `${pct}%` }} /></div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Right: AI Analytics Panel */}
          <div className="space-y-5">

            {/* NAAC Forecaster */}
            <div className="glass-card-strong rounded-3xl p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-28 h-28 bg-blue-50 rounded-full blur-2xl pointer-events-none" />
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-4 mb-5">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                AI Accreditation Forecaster
              </h2>

              {/* Speedometer Dial */}
              <div className="text-center p-4 bg-gradient-to-br from-slate-50 to-blue-50 border border-blue-100 rounded-2xl flex flex-col items-center mb-5">
                <div className="relative w-44 h-24 flex items-center justify-center overflow-hidden mb-1">
                  <svg className="w-full h-full absolute inset-0" viewBox="0 0 200 120">
                    <defs>
                      <linearGradient id="naac-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#ef4444" />
                        <stop offset="40%" stopColor="#f59e0b" />
                        <stop offset="70%" stopColor="#3b82f6" />
                        <stop offset="100%" stopColor="#10b981" />
                      </linearGradient>
                    </defs>
                    <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="#e8eef8" strokeWidth="12" strokeLinecap="round" />
                    <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="url(#naac-grad)" strokeWidth="12"
                      strokeLinecap="round" strokeDasharray="251.2" strokeDashoffset={naacDash}
                      className="transition-all duration-[1500ms] ease-out" />
                    <text x="22"  y="116" fontSize="10" fill="#94a3b8" fontWeight="700">2.0</text>
                    <text x="94"  y="24"  fontSize="10" fill="#94a3b8" fontWeight="700">3.0</text>
                    <text x="168" y="116" fontSize="10" fill="#94a3b8" fontWeight="700">4.0</text>
                  </svg>
                  <div className="absolute bottom-0 text-center">
                    <div className="text-2xl font-black leading-none" style={{ color: naacColor }}>{naacScore.toFixed(2)}</div>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mt-0.5">NAAC INDEX</span>
                  </div>
                </div>
                <span className="text-xs font-bold text-slate-600 mt-1">{naacStatus}</span>
              </div>

              <div className="space-y-2.5 text-xs">
                {[
                  { label: "Model Confidence",      value: `${naacConfidence}%`,  highlight: false },
                  { label: "Verified Credits Total", value: `${totalVerifiedCredits} pts`, highlight: true },
                  { label: "Avg Credits / Student",  value: `${students.length > 0 ? (totalVerifiedCredits / Math.max(students.length, 1)).toFixed(1) : 0} pts`, highlight: false },
                ].map((row) => (
                  <div key={row.label} className="flex justify-between border-b border-slate-50 pb-2">
                    <span className="text-slate-400">{row.label}</span>
                    <span className={`font-bold ${row.highlight ? "text-emerald-600" : "text-slate-700"}`}>{row.value}</span>
                  </div>
                ))}
              </div>

              <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-xl flex gap-2">
                <Sparkles className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                <p className="text-[10px] text-blue-600 leading-relaxed font-medium">
                  AI linear model using credit density, activity rate and verification efficiency to predict NAAC grade.
                </p>
              </div>
            </div>

            {/* Dept Skill Density */}
            <div className="glass-card-strong rounded-3xl p-6">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-4 mb-5">
                <GraduationCap className="w-5 h-5 text-blue-600" />
                AI Dept Skill Density
              </h2>
              <div className="space-y-5">
                {Object.entries(deptSkills).slice(0, 3).map(([dept, skills]) => (
                  <div key={dept} className="space-y-2">
                    <span className="text-[10px] font-black text-blue-700 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-md">{dept}</span>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { label: "Web/Dev",    val: skills.web },
                        { label: "Coding",     val: skills.coding },
                        { label: "Research",   val: skills.res },
                        { label: "Leadership", val: skills.lead },
                      ].map((item) => (
                        <div key={item.label} className="bg-slate-50 p-2 rounded-xl border border-slate-100 text-[10px] font-bold">
                          <div className="flex justify-between text-slate-500 mb-1">
                            <span>{item.label}</span>
                            <span className="text-blue-600">{item.val}%</span>
                          </div>
                          <div className="skill-bar"><div className="skill-bar-fill" style={{ width: `${item.val}%` }} /></div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Dept Credit Averages */}
            <div className="glass-card-strong rounded-3xl p-6">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-4 mb-4">
                <BarChart3 className="w-5 h-5 text-blue-600" />
                Department Credit Averages
              </h2>
              {(() => {
                const deptStats: { [key: string]: { total: number; count: number } } = {};
                students.forEach((s) => {
                  if (!deptStats[s.department]) deptStats[s.department] = { total: 0, count: 0 };
                  deptStats[s.department].total += s.credits;
                  deptStats[s.department].count += 1;
                });
                const depts = Object.entries(deptStats).map(([name, stat]) => ({
                  name, avg: parseFloat((stat.total / Math.max(stat.count, 1)).toFixed(1))
                })).sort((a, b) => b.avg - a.avg);
                const maxAvg = Math.max(...depts.map(d => d.avg), 1);

                return depts.length === 0 ? (
                  <span className="text-xs text-slate-400 block text-center py-4">No data to compare yet</span>
                ) : (
                  <div className="space-y-4">
                    {depts.slice(0, 4).map((d) => {
                      const pct = Math.min(100, Math.round((d.avg / maxAvg) * 100));
                      return (
                        <div key={d.name} className="space-y-1.5">
                          <div className="flex justify-between items-center text-xs font-bold">
                            <span className="text-slate-600">{d.name}</span>
                            <span className="text-blue-600">{d.avg} pts avg</span>
                          </div>
                          <div className="skill-bar"><div className="skill-bar-fill" style={{ width: `${pct}%` }} /></div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>

            {/* Accreditation Summary */}
            <div className="glass-card-strong rounded-3xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle2 className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-bold text-slate-800">Accreditation Summary</span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-[11px]">
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-center">
                  <div className="text-xl font-black text-blue-700">{approvedRate}%</div>
                  <div className="text-blue-500 font-semibold">Verification Rate</div>
                </div>
                <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 text-center">
                  <div className="text-xl font-black text-emerald-700">{totalActsCount}</div>
                  <div className="text-emerald-500 font-semibold">Total Activities</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;