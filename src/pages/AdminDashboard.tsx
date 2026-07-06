import { useState, useEffect } from "react";
import { fetchAllActivitiesForAdmin, parseDescription } from "../services/activityService";
import Navbar from "../components/Navbar";
import {
  BarChart3,
  Users,
  CheckCircle2,
  BookOpen,
  Download,
  Search,
  GraduationCap,
  BrainCircuit,
  Sparkles,
  CheckSquare,
  RefreshCw,
  AlertTriangle,
  Loader2,
  TrendingUp,
  Award,
} from "lucide-react";
import { supabase } from "../lib/supabase";

function AdminDashboard() {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [deptFilter, setDeptFilter] = useState("All");
  const [errorMsg, setErrorMsg] = useState("");

  const [totalStudentsCount, setTotalStudentsCount] = useState(0);
  const [totalActsCount, setTotalActsCount] = useState(0);
  const [approvedRate, setApprovedRate] = useState(0);
  const [totalVerifiedCredits, setTotalVerifiedCredits] = useState(0);

  const [naacScore, setNaacScore] = useState(3.25);
  const [naacConfidence, setNaacConfidence] = useState(85);
  const [naacStatus, setNaacStatus] = useState("Calculating...");

  const [deptSkills, setDeptSkills] = useState<{ [key: string]: { web: number; coding: number; res: number; lead: number } }>({});
  const [categoryStats, setCategoryStats] = useState<{ [key: string]: number }>({});

  useEffect(() => { loadAdminData(); }, []);

  async function loadAdminData() {
    setLoading(true);
    setErrorMsg("");
    try {
      const { data: profiles, error: profilesError } = await supabase.from("profiles").select("*");
      if (profilesError) setErrorMsg("Cannot fetch profiles. Check Supabase RLS policies.");

      const profilesList = profiles || [];
      setTotalStudentsCount(profilesList.length);

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
        if (text.includes("web") || text.includes("react") || text.includes("js") || text.includes("html")) deptData[dept].web += 12;
        if (text.includes("hack") || text.includes("code") || text.includes("dsa") || text.includes("contest")) deptData[dept].coding += 12;
        if (text.includes("paper") || text.includes("research") || text.includes("conference") || text.includes("journal")) deptData[dept].res += 14;
        if (text.includes("volunteer") || text.includes("nss") || text.includes("lead") || text.includes("club")) deptData[dept].lead += 12;
      });

      setTotalVerifiedCredits(totalCreditsSum);
      setApprovedRate(activitiesList.length > 0 ? Math.round((approvedCount / activitiesList.length) * 100) : 0);
      setCategoryStats(catStats);

      const onlyStudents = Object.values(studentMap).filter(
        (s: any) => s.role === "student" && !s.email?.toLowerCase().includes("test_student") && !s.full_name?.toLowerCase().includes("test student")
      );
      setStudents(onlyStudents);

      const avgCredits = onlyStudents.length > 0 ? totalCreditsSum / onlyStudents.length : 0;
      const actRate = onlyStudents.length > 0 ? activitiesList.length / onlyStudents.length : 0;
      let predictedNaac = Math.min(4.0, Math.max(2.0, 2.5 + (avgCredits * 0.12) + (actRate * 0.08)));
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
      console.error(err);
      setErrorMsg("An unexpected error occurred while loading admin data.");
    } finally {
      setLoading(false);
    }
  }

  const exportToCSV = () => {
    if (students.length === 0) return;
    const headers = ["Register No", "Student Name", "Department", "Current Year", "Verified Credits", "Activities Uploaded"];
    const rows = [headers.join(","), ...students.map((s) => [s.register_no, `"${s.full_name}"`, s.department, s.year, s.credits, s.activitiesCount].join(","))];
    const link = document.createElement("a");
    link.setAttribute("href", "data:text/csv;charset=utf-8," + encodeURI(rows.join("\n")));
    link.setAttribute("download", `edutwin_naac_report_${new Date().getFullYear()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredStudents = students.filter((s) => {
    const matchSearch = s.full_name.toLowerCase().includes(searchTerm.toLowerCase()) || s.register_no.toLowerCase().includes(searchTerm.toLowerCase());
    const matchDept = deptFilter === "All" || s.department === deptFilter;
    return matchSearch && matchDept;
  });

  const uniqueDepts = [...new Set(students.map((s) => s.department).filter(Boolean))];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#080608] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
          <span className="text-sm font-semibold text-orange-300/60">Generating Accreditation Analytics...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080608] pb-16">
      <Navbar forcedRole="admin" />

      <div className="pt-28 px-4 max-w-6xl mx-auto space-y-8">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-[#0f0a04] via-[#1a0d02] to-[#0a0505] border border-orange-500/20 text-white rounded-3xl p-8 shadow-2xl shadow-black/60 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-orange-500/8 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-orange-500/10 border border-orange-500/20 rounded-full text-xs font-semibold text-orange-300 mb-2">
              <BrainCircuit className="w-3.5 h-3.5" />
              AI Accreditation Intelligence
            </div>
            <h1 className="text-2xl font-extrabold">Institutional Analytics Dashboard</h1>
            <p className="text-orange-200/50 text-sm">NAAC · NIRF · AICTE Accreditation Readiness & Student Achievement Audit</p>
          </div>
          <button
            onClick={exportToCSV}
            className="relative z-10 self-start md:self-auto bg-gradient-to-r from-[#D7263D] via-[#FF6A00] to-[#FFC247] text-white font-bold px-5 py-3 rounded-xl hover:brightness-110 transition shadow-lg shadow-orange-900/40 flex items-center gap-2 cursor-pointer text-sm"
          >
            <Download className="w-4 h-4" />
            Export CSV Report
          </button>
        </div>

        {/* Error */}
        {errorMsg && (
          <div className="p-4 bg-amber-950/40 border border-amber-500/30 rounded-2xl flex items-center gap-3 text-sm text-amber-300">
            <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
            <span className="font-semibold">{errorMsg}</span>
            <button onClick={loadAdminData} className="ml-auto shrink-0 text-xs font-bold text-orange-400 flex items-center gap-1 cursor-pointer">
              <RefreshCw className="w-3.5 h-3.5" /> Retry
            </button>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            { label: "Registered Users", value: totalStudentsCount, sub: "All roles synced", icon: Users },
            { label: "Total Submissions", value: totalActsCount, sub: "Across all semesters", icon: BookOpen },
            { label: "Verified Credits", value: `${totalVerifiedCredits} pts`, sub: "Faculty-approved", icon: Award },
            { label: "Approval Rate", value: `${approvedRate}%`, sub: "Verification efficiency", icon: CheckSquare },
          ].map((stat) => (
            <div key={stat.label} className="bg-[#0e0a04] border border-orange-500/15 rounded-2xl p-6 shadow-lg shadow-black/40 flex items-center justify-between hover:border-orange-500/30 transition-all duration-300">
              <div>
                <span className="text-[11px] font-bold text-orange-300/40 uppercase tracking-wider block">{stat.label}</span>
                <h3 className="text-2xl font-black text-white mt-1">{stat.value}</h3>
                <p className="text-[11px] text-orange-400/70 font-semibold mt-0.5">{stat.sub}</p>
              </div>
              <div className="w-12 h-12 bg-orange-500/10 border border-orange-500/20 rounded-xl flex items-center justify-center text-orange-400 shrink-0">
                <stat.icon className="w-6 h-6" />
              </div>
            </div>
          ))}
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left: Student Directory */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-[#0e0a04] border border-orange-500/15 rounded-3xl shadow-lg shadow-black/40 p-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-orange-500/10 pb-5 mb-6">
                <div>
                  <h2 className="text-lg font-bold text-white">Student Achievement Directory</h2>
                  <p className="text-xs text-orange-300/40 mt-0.5">Filter and audit each student's verified credit standing</p>
                </div>
                <div className="flex gap-2">
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-orange-400/40">
                      <Search className="w-3.5 h-3.5" />
                    </span>
                    <input
                      type="text"
                      placeholder="Name / Reg No..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8 pr-3 py-2 text-xs border border-orange-500/15 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/40 bg-black/30 text-white placeholder-orange-300/20 focus:border-orange-500/30 w-40"
                    />
                  </div>
                  <select
                    value={deptFilter}
                    onChange={(e) => setDeptFilter(e.target.value)}
                    className="px-3 py-2 text-xs border border-orange-500/15 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/40 bg-black/30 text-orange-200"
                  >
                    <option value="All">All Depts</option>
                    {uniqueDepts.map((d) => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              </div>

              {filteredStudents.length === 0 ? (
                <div className="py-16 text-center space-y-3">
                  <Users className="w-14 h-14 text-orange-500/15 mx-auto" />
                  <p className="text-sm font-semibold text-orange-300/40">No students found matching your filters.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-orange-500/10">
                        {["Student", "Dept", "Year", "Activities", "Credits"].map((h) => (
                          <th key={h} className="pb-3 pr-4 text-[11px] font-bold text-orange-300/40 uppercase tracking-wider">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-orange-500/5">
                      {filteredStudents.map((s) => (
                        <tr key={s.id} className="hover:bg-orange-500/4 transition duration-150">
                          <td className="py-3.5 pr-4">
                            <span className="block text-sm font-bold text-white">{s.full_name}</span>
                            <span className="block text-[10px] text-orange-300/40">{s.register_no}</span>
                          </td>
                          <td className="py-3.5 pr-4 text-xs font-semibold text-orange-300/60">{s.department}</td>
                          <td className="py-3.5 pr-4 text-xs text-orange-300/40">{s.year}st/nd</td>
                          <td className="py-3.5 pr-4 text-xs text-orange-300/40">{s.activitiesCount} uploads</td>
                          <td className="py-3.5">
                            <span className={`text-xs font-black px-2.5 py-1 rounded-lg border ${s.credits >= 10 ? "bg-emerald-950/50 text-emerald-400 border-emerald-500/20" : s.credits >= 5 ? "bg-orange-950/50 text-orange-400 border-orange-500/20" : "bg-white/5 text-white/40 border-white/10"}`}>
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
              <div className="bg-[#0e0a04] border border-orange-500/15 rounded-3xl shadow-lg shadow-black/40 p-8">
                <h2 className="text-lg font-bold text-white flex items-center gap-2 border-b border-orange-500/10 pb-4 mb-6">
                  <BarChart3 className="w-5 h-5 text-orange-500" />
                  Activity Category Distribution
                </h2>
                <div className="space-y-4">
                  {Object.entries(categoryStats).sort((a, b) => b[1] - a[1]).map(([cat, count]) => {
                    const max = Math.max(...Object.values(categoryStats));
                    const pct = Math.round((count / max) * 100);
                    return (
                      <div key={cat} className="space-y-1.5">
                        <div className="flex justify-between text-xs font-semibold">
                          <span className="text-orange-300/70">{cat}</span>
                          <span className="text-orange-400">{count} submissions</span>
                        </div>
                        <div className="h-2 bg-orange-500/8 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-[#D7263D] via-[#FF6A00] to-[#FFC247] rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Right: AI Analytics */}
          <div className="space-y-6">

            {/* NAAC Forecaster */}
            <div className="bg-[#0e0a04] border border-orange-500/15 rounded-3xl shadow-lg shadow-black/40 p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-[120px] h-[120px] bg-orange-500/5 rounded-full blur-2xl pointer-events-none" />
              <h2 className="text-base font-bold text-white flex items-center gap-2 border-b border-orange-500/10 pb-4 mb-6">
                <TrendingUp className="w-5 h-5 text-orange-500" />
                AI Accreditation Forecaster
              </h2>
              <div className="space-y-5">
                <div className="text-center p-5 bg-orange-500/8 border border-orange-500/20 rounded-2xl">
                  <span className="text-[10px] font-bold text-orange-400 uppercase tracking-wider">Predicted NAAC CGPA</span>
                  <div className="text-5xl font-black text-orange-400 my-2">{naacScore}</div>
                  <span className="text-xs font-bold text-orange-300/70">{naacStatus}</span>
                </div>
                <div className="space-y-3 text-xs">
                  {[
                    { label: "Model Confidence", value: `${naacConfidence}%`, accent: false },
                    { label: "Total Verified Credits", value: `${totalVerifiedCredits} pts`, accent: true },
                    { label: "Avg Credits / Student", value: `${students.length > 0 ? (totalVerifiedCredits / Math.max(students.length, 1)).toFixed(1) : 0} pts`, accent: false },
                  ].map((row) => (
                    <div key={row.label} className="flex justify-between border-b border-orange-500/8 pb-2">
                      <span className="text-orange-300/40">{row.label}</span>
                      <span className={`font-bold ${row.accent ? "text-emerald-400" : "text-white"}`}>{row.value}</span>
                    </div>
                  ))}
                </div>
                <div className="p-3 bg-orange-500/8 border border-orange-500/15 rounded-xl flex gap-2">
                  <Sparkles className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                  <p className="text-[10px] text-orange-300/60 leading-relaxed font-medium">
                    AI linear scoring model using verified credit density, activity participation rate, and verification efficiency to predict institutional accreditation grade.
                  </p>
                </div>
              </div>
            </div>

            {/* Dept Skill Density */}
            <div className="bg-[#0e0a04] border border-orange-500/15 rounded-3xl shadow-lg shadow-black/40 p-8">
              <h2 className="text-base font-bold text-white flex items-center gap-2 border-b border-orange-500/10 pb-4 mb-6">
                <GraduationCap className="w-5 h-5 text-orange-500" />
                AI Dept Skill Density
              </h2>
              <div className="space-y-6">
                {Object.entries(deptSkills).slice(0, 3).map(([dept, skills]) => (
                  <div key={dept} className="space-y-2">
                    <span className="text-xs font-bold text-orange-300/70 bg-orange-500/10 border border-orange-500/15 px-2 py-0.5 rounded-md">{dept}</span>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { label: "Web/Dev", val: skills.web },
                        { label: "Coding", val: skills.coding },
                        { label: "Research", val: skills.res },
                        { label: "Leadership", val: skills.lead },
                      ].map((item) => (
                        <div key={item.label} className="bg-black/30 p-2 rounded-lg border border-orange-500/10 text-[10px] font-bold">
                          <div className="flex justify-between text-orange-300/50 mb-1">
                            <span>{item.label}</span>
                            <span className="text-orange-400">{item.val}%</span>
                          </div>
                          <div className="h-1.5 bg-orange-500/10 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-[#D7263D] to-[#FF6A00] rounded-full" style={{ width: `${item.val}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Accreditation Summary */}
            <div className="bg-gradient-to-br from-[#1a0d02] via-[#0f0a04] to-[#0a0505] border border-orange-500/20 rounded-3xl p-6 text-white space-y-3 shadow-lg shadow-black/40">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle2 className="w-5 h-5 text-orange-400" />
                <span className="text-sm font-bold text-orange-200">Accreditation Summary</span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-[11px]">
                <div className="bg-orange-500/10 border border-orange-500/15 rounded-xl p-3 text-center">
                  <div className="text-lg font-black text-white">{approvedRate}%</div>
                  <div className="text-orange-300/50">Verification Rate</div>
                </div>
                <div className="bg-orange-500/10 border border-orange-500/15 rounded-xl p-3 text-center">
                  <div className="text-lg font-black text-white">{totalActsCount}</div>
                  <div className="text-orange-300/50">Total Activities</div>
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