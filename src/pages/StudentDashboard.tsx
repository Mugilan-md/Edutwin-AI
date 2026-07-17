import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getProfile } from "../services/profileService";
import { fetchStudentActivities, parseDescription } from "../services/activityService";
import Navbar from "../components/Navbar";
import {
  Sparkles, TrendingUp, Clock, CheckCircle2, FileText,
  BrainCircuit, Award, ChevronRight, BookOpen, AlertTriangle,
  Lightbulb, Plus, ExternalLink,
} from "lucide-react";

function StudentDashboard() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [totalCredits, setTotalCredits] = useState(0);
  const [approvedCount, setApprovedCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [cgpa, setCgpa] = useState(8.5);
  const [attendance, setAttendance] = useState(85);

  const [projectedCredits, setProjectedCredits] = useState(0);
  const [skills, setSkills] = useState({ webDev: 20, competitiveCoding: 10, research: 10, leadership: 10 });
  const [careerFit, setCareerFit] = useState("Determining...");
  const [careerConfidence, setCareerConfidence] = useState(0);
  const [recommendations, setRecommendations] = useState<string[]>([]);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const { data: prof } = await getProfile();
        if (prof) {
          if (prof.role === "faculty") { navigate("/faculty"); return; }
          if (prof.role === "admin") { navigate("/admin"); return; }
          setProfile(prof);
          const cached = localStorage.getItem(`academic_profile_${prof.id}`);
          if (cached) {
            const p = JSON.parse(cached);
            setCgpa(parseFloat(p.cgpa) || 8.5);
            setAttendance(parseInt(p.attendance) || 85);
          }
        }

        const { data: acts } = await fetchStudentActivities();
        if (acts) {
          setActivities(acts);
          let sumCredits = 0, approved = 0, pending = 0;
          let web = 20, coding = 10, res = 10, lead = 10;

          acts.forEach((act) => {
            const meta = parseDescription(act.description);
            if (act.status === "approved") { approved++; sumCredits += meta.credits || 0; }
            else if (act.status === "pending") { pending++; }
            const t = `${act.title} ${act.category} ${meta.text}`.toLowerCase();
            if (t.includes("web") || t.includes("react") || t.includes("frontend") || t.includes("html") || t.includes("js")) web += 25;
            if (t.includes("hackathon") || t.includes("coding") || t.includes("dsa") || t.includes("competition")) coding += 25;
            if (t.includes("paper") || t.includes("research") || t.includes("journal") || t.includes("conference")) res += 20;
            if (t.includes("lead") || t.includes("volunteer") || t.includes("club") || t.includes("nss")) lead += 20;
          });

          setTotalCredits(sumCredits);
          setApprovedCount(approved);
          setPendingCount(pending);
          setSkills({ webDev: Math.min(100, web), competitiveCoding: Math.min(100, coding), research: Math.min(100, res), leadership: Math.min(100, lead) });

          const currentYear = profile?.year || 3;
          const semsDone = Math.max(1, (currentYear * 2) - 1);
          setProjectedCredits(Math.round(sumCredits + ((sumCredits / semsDone) * (8 - semsDone))) || 24);

          const pVec = [web, coding, res, lead];
          const roles = [
            { name: "Full Stack Engineer",  vector: [90, 80, 40, 50] },
            { name: "Data Scientist",        vector: [40, 90, 80, 30] },
            { name: "Product Manager",       vector: [50, 40, 50, 95] },
            { name: "Research Engineer",     vector: [30, 70, 95, 40] },
          ];
          let bestRole = "Software Developer", maxSim = 0;
          roles.forEach((r) => {
            const dot  = pVec.reduce((s, v, i) => s + v * r.vector[i], 0);
            const magA = Math.sqrt(pVec.reduce((s, v) => s + v * v, 0));
            const magB = Math.sqrt(r.vector.reduce((s, v) => s + v * v, 0));
            const sim  = dot / (magA * magB);
            if (sim > maxSim) { maxSim = sim; bestRole = r.name; }
          });
          setCareerFit(bestRole);
          setCareerConfidence(Math.round(maxSim * 100) || 75);

          const recs: string[] = [];
          if (web < 40) recs.push("Enroll in a Full-Stack development MOOC to build modern web skills.");
          if (coding < 40) recs.push("Participate in an upcoming coding hackathon to bolster algorithmic problem-solving.");
          if (res < 30) recs.push("Attend a research conference or workshop to boost academic credentials.");
          if (lead < 30) recs.push("Take on a leadership role in a college club or NSS community service drive.");
          if (recs.length === 0) {
            recs.push("Fantastic balance! Write a technical research paper to publish your work.");
            recs.push("Apply for a premium industry internship using your high career fit score.");
          }
          setRecommendations(recs);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFFCC7] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <BrainCircuit className="w-8 h-8 text-blue-500 animate-spin" />
          <span className="text-sm font-semibold text-slate-500">Generating AI Twin...</span>
        </div>
      </div>
    );
  }

  const getDominantSkill = () => {
    const { webDev, competitiveCoding, research, leadership } = skills;
    const maxVal = Math.max(webDev, competitiveCoding, research, leadership);
    if (maxVal === 0) return { name: "Awaiting Data", color: "#3b82f6", from: "#2563eb", to: "#0ea5e9" };
    if (maxVal === webDev) return { name: "Software Engineer", color: "#2563eb", from: "#2563eb", to: "#0ea5e9" };
    if (maxVal === competitiveCoding) return { name: "Algorithm Specialist", color: "#6366f1", from: "#6366f1", to: "#3b82f6" };
    if (maxVal === research) return { name: "Academic Researcher", color: "#0891b2", from: "#0891b2", to: "#06b6d4" };
    return { name: "Student Leader", color: "#059669", from: "#059669", to: "#10b981" };
  };
  const dominant = getDominantSkill();

  const statCards = [
    { label: "CGPA", value: cgpa.toFixed(2), sub: "Cumulative Grade Point", icon: BookOpen, badge: "badge-blue" },
    { label: "Attendance", value: `${attendance}%`, sub: "Excellent attendance", icon: Clock, badge: "badge-green" },
    { label: "Total Credits", value: `${totalCredits} pts`, sub: `${approvedCount} verified achievements`, icon: Award, badge: "badge-blue" },
    { label: "Pending Review", value: pendingCount, sub: "Awaiting faculty approval", icon: AlertTriangle, badge: "badge-amber" },
  ];

  return (
    <div className="min-h-screen bg-[#FFFCC7] pb-16">
      <Navbar />
      <div className="pt-24 px-4 max-w-6xl mx-auto space-y-6">

        {/* Hero Header */}
        <div className="glass-card-strong rounded-3xl p-6 md:p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-100/60 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-sky-100/40 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-100 border border-blue-200 rounded-full text-xs font-bold text-blue-700">
                <Sparkles className="w-3.5 h-3.5" />
                AI Digital Twin — Student View
              </div>
              <h1 className="text-2xl md:text-3xl font-black text-slate-900">
                Hello, {profile?.full_name || "Academic Student"} 👋
              </h1>
              <p className="text-slate-500 text-sm max-w-xl">
                Your AI profile is synced. View your predicted career fit, credit trajectory, and smart activity recommendations.
              </p>
            </div>
            <button
              onClick={() => navigate("/activities")}
              className="btn-primary self-start md:self-auto flex items-center gap-2 text-sm"
            >
              <Plus className="w-4 h-4" />
              Upload Achievement
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5">
          {statCards.map((stat) => (
            <div key={stat.label} className="glass-card-strong rounded-2xl p-5 stat-card flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">{stat.label}</span>
                <h3 className="text-2xl font-black text-slate-900">{stat.value}</h3>
                <p className="text-[11px] text-slate-500 font-medium">{stat.sub}</p>
              </div>
              <div className="w-11 h-11 bg-blue-50 border border-blue-100 rounded-xl flex items-center justify-center text-blue-600 shrink-0">
                <stat.icon className="w-5 h-5" />
              </div>
            </div>
          ))}
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left: Activities & ML */}
          <div className="lg:col-span-2 space-y-6">

            {/* ML Credit Projector */}
            <div className="glass-card-strong rounded-3xl p-7 relative overflow-hidden ml-projector-3d">
              <div className="absolute top-0 right-0 w-40 h-40 bg-red-50/50 rounded-full blur-2xl pointer-events-none" />
              <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5 ml-layer-1">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-[#FF0015]" />
                    ML Credit Projector
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">Linear regression model predicting graduation credits based on your trajectory</p>
                </div>
                <div className="badge-blue text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> AI Predictive
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-center">
                <div className="text-center md:text-left ml-layer-1">
                  <span className="text-xs font-bold text-slate-400 uppercase block mb-1">Current Credits</span>
                  <div className="text-4xl font-black text-slate-900">{totalCredits}</div>
                  <span className="text-xs text-slate-400">Faculty-verified</span>
                </div>
                <div className="flex flex-col items-center p-4 bg-gradient-to-br from-red-50 to-rose-50 border border-red-100 rounded-2xl ml-layer-2 shadow-sm">
                  <span className="text-[10px] font-black text-[#FF0015] uppercase tracking-wider mb-1">Graduation Projection</span>
                  <div className="text-4xl font-black text-[#CC0011]">{projectedCredits}</div>
                  <span className="text-[10px] text-[#FF0015] font-semibold mt-1">Expected Total Credits</span>
                </div>
                <div className="text-center md:text-left ml-layer-3">
                  <span className="text-xs font-bold text-slate-400 uppercase block mb-1">NAAC Level</span>
                  <div className="flex items-center gap-1.5 justify-center md:justify-start text-emerald-600 font-bold text-sm">
                    <CheckCircle2 className="w-4 h-4" />
                    A++ Eligible
                  </div>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Exceeds 20-credit threshold for maximum NAAC accreditation weight.
                  </p>
                </div>
              </div>
            </div>

            {/* Activity Timeline */}
            <div className="glass-card-strong rounded-3xl p-7">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-600" />
                    My Activity Records
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">Academic & co-curricular achievements verified by faculty</p>
                </div>
                <button
                  onClick={() => navigate("/profile")}
                  className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer transition-colors"
                >
                  View Resume <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {activities.length === 0 ? (
                <div className="py-12 text-center space-y-3">
                  <FileText className="w-12 h-12 text-blue-200 mx-auto" />
                  <p className="text-sm font-semibold text-slate-400">No achievements recorded yet.</p>
                  <button onClick={() => navigate("/activities")} className="text-xs font-bold text-blue-600 hover:underline cursor-pointer">
                    Click here to upload your first certificate →
                  </button>
                </div>
              ) : (
                <div className="relative timeline-line pl-6 ml-4 space-y-6 my-4">
                  {activities.slice(0, 5).map((act) => {
                    const meta = parseDescription(act.description);
                    const isApproved = act.status === "approved";
                    const isPending  = act.status === "pending";
                    return (
                      <div key={act.id} className="relative group">
                        <span className={`absolute -left-[33px] top-1 w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                          isApproved ? "bg-emerald-500 border-emerald-400 shadow-md shadow-emerald-200" :
                          isPending  ? "bg-amber-400  border-amber-300  shadow-md shadow-amber-100"  : "bg-red-400 border-red-300"
                        }`}>
                          <span className="w-1.5 h-1.5 bg-white rounded-full" />
                        </span>

                        <div className="bg-white border border-slate-100 group-hover:border-blue-200 group-hover:shadow-md p-4 rounded-2xl transition-all duration-300 space-y-2">
                          <div className="flex justify-between items-start gap-3">
                            <div>
                              <h4 className="font-bold text-sm text-slate-800 group-hover:text-blue-700 transition-colors">{act.title}</h4>
                              <p className="text-[10px] text-slate-400 mt-0.5">{meta.organization || "Independent Institution"} · {meta.date || "Recent"}</p>
                            </div>
                            <span className="text-[10px] font-bold text-blue-600 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-full uppercase tracking-wide shrink-0">{act.category}</span>
                          </div>

                          {meta.text && (
                            <p className="text-xs text-slate-500 leading-relaxed truncate max-w-lg">{meta.text}</p>
                          )}

                          {meta.feedback && (
                            <p className="text-[11px] text-blue-700 bg-blue-50 border border-blue-100 p-2.5 rounded-lg italic">
                              <strong>Feedback:</strong> "{meta.feedback}"
                            </p>
                          )}

                          <div className="flex items-center justify-between pt-1.5 border-t border-slate-50 mt-1.5">
                            {isApproved && (
                              <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Approved (+{meta.credits || 0} credits)
                              </span>
                            )}
                            {isPending && (
                              <span className="text-[10px] font-bold text-amber-600 flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5" /> Pending Faculty Verification
                              </span>
                            )}
                            {!isApproved && !isPending && (
                              <span className="text-[10px] font-bold text-red-500 flex items-center gap-1">
                                <AlertTriangle className="w-3.5 h-3.5" /> Declined Submission
                              </span>
                            )}
                            {act.certificate_url && (
                              <a href={act.certificate_url} target="_blank" rel="noreferrer"
                                className="text-[10px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-0.5 transition-colors">
                                View Certificate <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Right: AI Analytics */}
          <div className="space-y-6">

            {/* Digital Twin Core + Skills */}
            <div className="glass-card-strong rounded-3xl p-6 space-y-5">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-4">
                <BrainCircuit className="w-5 h-5 text-blue-600" />
                AI Skill Density
              </h2>

              {approvedCount === 0 ? (
                <div className="py-8 text-center space-y-2">
                  <BrainCircuit className="w-10 h-10 text-blue-200 mx-auto" />
                  <p className="text-sm font-semibold text-slate-400">No approved activities yet</p>
                  <p className="text-xs text-slate-300">Upload certificates and get them approved by faculty.</p>
                </div>
              ) : (
                <>
                  {/* Twin Core SVG */}
                  <div className="py-3 text-center border-b border-slate-100">
                    <div className="relative w-36 h-36 mx-auto flex items-center justify-center mb-3">
                      <svg className="w-full h-full absolute inset-0" viewBox="0 0 200 200">
                        <defs>
                          <radialGradient id="twin-glow-light" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" stopColor={dominant.color} stopOpacity="0.20" />
                            <stop offset="100%" stopColor={dominant.color} stopOpacity="0" />
                          </radialGradient>
                        </defs>
                        <circle cx="100" cy="100" r="72" fill="url(#twin-glow-light)" className="animate-pulse" />
                        <circle cx="100" cy="100" r="60" fill="none" stroke={dominant.color} strokeWidth="1" strokeDasharray="6 4"
                          className="animate-spin-slow" style={{ transformOrigin: "center" }} />
                        <circle cx="100" cy="100" r="44" fill="none" stroke={dominant.color} strokeWidth="1.5" strokeOpacity="0.35"
                          className="animate-spin-reverse" style={{ transformOrigin: "center" }} />
                      </svg>
                      <div className="w-20 h-20 rounded-full flex items-center justify-center relative z-10 transition-all duration-700 hover:scale-105 shadow-lg"
                        style={{ background: `linear-gradient(135deg, ${dominant.from}, ${dominant.to})` }}>
                        <BrainCircuit className="w-9 h-9 text-white" />
                      </div>
                    </div>
                    <span className="block text-[10px] text-slate-400 uppercase tracking-widest font-black">Digital Twin Focus</span>
                    <span className="text-sm font-extrabold text-slate-800 block mt-0.5">{dominant.name}</span>
                  </div>

                  <div className="space-y-4 pt-1">
                    {[
                      { label: "Software / Web Dev",       val: skills.webDev },
                      { label: "Competitive Programming",  val: skills.competitiveCoding },
                      { label: "Research & Academics",     val: skills.research },
                      { label: "Leadership & Volunteering",val: skills.leadership },
                    ].map((s) => (
                      <div key={s.label} className="space-y-1.5">
                        <div className="flex justify-between text-xs font-semibold">
                          <span className="text-slate-600">{s.label}</span>
                          <span className="text-blue-600">{s.val}%</span>
                        </div>
                        <div className="skill-bar"><div className="skill-bar-fill" style={{ width: `${s.val}%` }} /></div>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* Career Fit */}
              <div className="p-4 bg-gradient-to-br from-blue-50 to-sky-50 border border-blue-100 rounded-2xl space-y-1.5">
                <span className="text-[10px] font-black text-blue-600 uppercase tracking-wider">AI Career Fit Prediction</span>
                {approvedCount === 0 ? (
                  <div className="text-sm text-slate-400 italic">Awaiting approved certificates...</div>
                ) : (
                  <>
                    <div className="text-base font-black text-slate-900">{careerFit}</div>
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span>Cosine Similarity Score</span>
                      <span className="font-bold text-blue-600">{careerConfidence}% Confidence</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* AI Smart Actions */}
            <div className="glass-card-strong rounded-3xl p-6">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-4 mb-5">
                <Lightbulb className="w-5 h-5 text-amber-500" />
                AI Smart Recommendations
              </h2>
              <ul className="space-y-3">
                {recommendations.map((rec, idx) => (
                  <li key={idx} className="flex gap-3 text-xs leading-relaxed text-slate-600 p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <Sparkles className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StudentDashboard;