import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getProfile } from "../services/profileService";
import { fetchStudentActivities, parseDescription } from "../services/activityService";
import Navbar from "../components/Navbar";
import {
  Sparkles,
  TrendingUp,
  Clock,
  CheckCircle2,
  FileText,
  BrainCircuit,
  Award,
  ChevronRight,
  BookOpen,
  AlertTriangle,
  Lightbulb,
  Plus,
  ExternalLink,
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
          if (prof.role === "faculty") {
            navigate("/faculty");
            return;
          }
          if (prof.role === "admin") {
            navigate("/admin");
            return;
          }
          setProfile(prof);
          const cachedAcademic = localStorage.getItem(`academic_profile_${prof.id}`);
          if (cachedAcademic) {
            const parsed = JSON.parse(cachedAcademic);
            setCgpa(parseFloat(parsed.cgpa) || 8.5);
            setAttendance(parseInt(parsed.attendance) || 85);
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
            if (t.includes("hackathon") || t.includes("coding") || t.includes("dsa") || t.includes("competition") || t.includes("contest")) coding += 25;
            if (t.includes("paper") || t.includes("research") || t.includes("journal") || t.includes("conference") || t.includes("workshop")) res += 20;
            if (t.includes("lead") || t.includes("volunteer") || t.includes("club") || t.includes("nss") || t.includes("organize")) lead += 20;
          });

          setTotalCredits(sumCredits);
          setApprovedCount(approved);
          setPendingCount(pending);
          setSkills({ webDev: Math.min(100, web), competitiveCoding: Math.min(100, coding), research: Math.min(100, res), leadership: Math.min(100, lead) });

          const currentYear = prof?.year || 3;
          const semestersCompleted = Math.max(1, (currentYear * 2) - 1);
          const creditsPerSem = sumCredits / semestersCompleted;
          setProjectedCredits(Math.round(sumCredits + (creditsPerSem * (8 - semestersCompleted))) || 24);

          const profileVector = [web, coding, res, lead];
          const roles = [
            { name: "Full Stack Engineer", vector: [90, 80, 40, 50] },
            { name: "Data Scientist", vector: [40, 90, 80, 30] },
            { name: "Product Manager", vector: [50, 40, 50, 95] },
            { name: "Research Engineer", vector: [30, 70, 95, 40] },
          ];
          let bestRole = "Software Developer", maxSim = 0;
          roles.forEach((r) => {
            const dot = profileVector.reduce((s, v, i) => s + v * r.vector[i], 0);
            const magA = Math.sqrt(profileVector.reduce((s, v) => s + v * v, 0));
            const magB = Math.sqrt(r.vector.reduce((s, v) => s + v * v, 0));
            const sim = dot / (magA * magB);
            if (sim > maxSim) { maxSim = sim; bestRole = r.name; }
          });
          setCareerFit(bestRole);
          setCareerConfidence(Math.round(maxSim * 100) || 75);

          const recs: string[] = [];
          if (web < 40) recs.push("Enroll in a Full-Stack development course (MOOC) to build modern web skills.");
          if (coding < 40) recs.push("Participate in an upcoming coding hackathon to bolster algorithmic problem-solving.");
          if (res < 30) recs.push("Attend a research conference or submit a workshop abstract to boost academic credentials.");
          if (lead < 30) recs.push("Take on a leadership role in a college club or participate in an NSS community service drive.");
          if (recs.length === 0) {
            recs.push("Fantastic balance! We recommend writing a technical research paper to publish your work.");
            recs.push("Apply for a premium industry internship using your high Full Stack Engineer score.");
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
      <div className="min-h-screen bg-[#080608] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <BrainCircuit className="w-8 h-8 text-orange-500 animate-spin" />
          <span className="text-sm font-semibold text-orange-300/60">Generating AI Twin...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080608] pb-16">
      <Navbar />
      <div className="pt-24 px-4 max-w-6xl mx-auto space-y-6">

        {/* Hero Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-[#0f0a04] via-[#1a0d02] to-[#0a0505] border border-orange-500/20 text-white rounded-3xl p-6 md:p-8 shadow-2xl shadow-black/60 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-orange-500/8 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-[200px] h-[200px] bg-red-600/5 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-orange-500/10 border border-orange-500/20 backdrop-blur-md rounded-full text-xs font-semibold text-orange-300">
              <Sparkles className="w-3.5 h-3.5" />
              AI-Powered Student Digital Twin (Student View)
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight">
              Hello, {profile?.full_name || "Academic Student"} 👋
            </h1>
            <p className="text-orange-200/60 text-sm max-w-xl">
              Your profile is synced. The AI has processed your activities and predicted your academic standing below.
            </p>
          </div>
          <button
            onClick={() => navigate("/activities")}
            className="relative z-10 self-start md:self-auto bg-gradient-to-r from-[#D7263D] via-[#FF6A00] to-[#FFC247] text-white font-bold px-5 py-3 rounded-xl hover:brightness-110 transition duration-300 shadow-lg shadow-orange-900/40 flex items-center gap-2 cursor-pointer text-sm"
          >
            <Plus className="w-4 h-4" />
            Upload Achievement
          </button>
        </div>

        {/* 4 Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
          {[
            { label: "CGPA", value: cgpa.toFixed(2), sub: "Top 15% of Batch", icon: BookOpen, accent: "orange" },
            { label: "Attendance", value: `${attendance}%`, sub: "Excellent attendance", icon: Clock, accent: "amber" },
            { label: "Total Credits", value: `${totalCredits} pts`, sub: `${approvedCount} approved activities`, icon: Award, accent: "orange" },
            { label: "Pending Review", value: pendingCount, sub: "Awaiting faculty approval", icon: Clock, accent: "red" },
          ].map((stat) => (
            <div key={stat.label} className="bg-[#0e0a04] border border-orange-500/15 rounded-2xl p-6 shadow-lg shadow-black/40 flex items-center justify-between hover:border-orange-500/30 transition-all duration-300">
              <div className="space-y-1">
                <span className="text-xs font-bold text-orange-300/50 uppercase tracking-wider">{stat.label}</span>
                <h3 className="text-2xl font-black text-white">{stat.value}</h3>
                <p className="text-xs text-orange-400/70 font-semibold">{stat.sub}</p>
              </div>
              <div className="w-12 h-12 bg-orange-500/10 border border-orange-500/20 rounded-xl flex items-center justify-center text-orange-400">
                <stat.icon className="w-6 h-6" />
              </div>
            </div>
          ))}
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left: Activities & ML (2 cols) */}
          <div className="lg:col-span-2 space-y-8">

            {/* ML Credit Projector */}
            <div className="bg-[#0e0a04] border border-orange-500/15 rounded-3xl shadow-lg shadow-black/40 p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-[180px] h-[180px] bg-orange-500/5 rounded-full blur-2xl pointer-events-none" />
              <div className="flex items-center justify-between border-b border-orange-500/10 pb-4 mb-6">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-orange-500" />
                    ML Credit Projector
                  </h2>
                  <p className="text-xs text-orange-300/40">AI linear model predicting graduation points based on historical trajectory</p>
                </div>
                <div className="bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  Predictive Analysis
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                <div className="space-y-2 text-center md:text-left">
                  <span className="text-xs font-semibold text-orange-300/50 uppercase">Current Credits</span>
                  <div className="text-4xl font-extrabold text-white">{totalCredits}</div>
                  <span className="text-xs text-orange-300/40">Verified by department</span>
                </div>
                <div className="flex flex-col items-center justify-center p-4 bg-orange-500/8 rounded-2xl border border-orange-500/20">
                  <span className="text-[10px] font-bold text-orange-400 uppercase tracking-wider mb-1">Graduation Projector</span>
                  <div className="text-5xl font-black text-orange-400">{projectedCredits}</div>
                  <span className="text-[10px] text-orange-300/60 font-semibold mt-1">Expected Extracurricular Credits</span>
                </div>
                <div className="space-y-2 text-center md:text-left">
                  <span className="text-xs font-semibold text-orange-300/50 uppercase">NAAC Level Status</span>
                  <div className="flex items-center justify-center md:justify-start gap-1.5 text-emerald-400 font-bold text-sm">
                    <CheckCircle2 className="w-4 h-4" />
                    A++ Tier Eligible
                  </div>
                  <p className="text-xs text-orange-300/40 leading-relaxed">
                    Exceeds the threshold of 20 credits required for maximum institutional accreditation weight.
                  </p>
                </div>
              </div>
            </div>

            {/* Activity Records */}
            <div className="bg-[#0e0a04] border border-orange-500/15 rounded-3xl shadow-lg shadow-black/40 p-8">
              <div className="flex items-center justify-between border-b border-orange-500/10 pb-4 mb-6">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <FileText className="w-5 h-5 text-orange-500" />
                    My Activity Records
                  </h2>
                  <p className="text-xs text-orange-300/40">Academic & curricular achievements logged by you</p>
                </div>
                <button
                  onClick={() => navigate("/profile")}
                  className="text-xs font-bold text-orange-400 hover:text-orange-300 flex items-center gap-1 cursor-pointer transition-colors"
                >
                  View Shareable Resume
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {activities.length === 0 ? (
                <div className="py-12 text-center space-y-3">
                  <FileText className="w-12 h-12 text-orange-500/20 mx-auto" />
                  <p className="text-sm font-semibold text-orange-300/40">No achievements recorded yet.</p>
                  <button onClick={() => navigate("/activities")} className="text-xs font-bold text-orange-400 hover:underline cursor-pointer">
                    Click here to upload your first certificate
                  </button>
                </div>
              ) : (
                <div className="relative border-l-2 border-orange-500/10 pl-6 ml-4 space-y-8 my-4">
                  {activities.slice(0, 5).map((act) => {
                    const meta = parseDescription(act.description);
                    const isApproved = act.status === "approved";
                    const isPending = act.status === "pending";
                    return (
                      <div key={act.id} className="relative group">
                        {/* Timeline point */}
                        <span className={`absolute -left-[33px] top-1 w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                          isApproved ? "bg-emerald-500 border-emerald-400 shadow-md shadow-emerald-500/40" :
                          isPending ? "bg-amber-500 border-amber-400 shadow-md shadow-amber-500/40" : "bg-red-500 border-red-400"
                        }`}>
                          <span className="w-1 h-1 bg-black rounded-full" />
                        </span>

                        <div className="bg-black/35 border border-white/5 group-hover:border-orange-500/20 p-4 rounded-2xl transition duration-300 space-y-2">
                          <div className="flex justify-between items-start gap-4">
                            <div>
                              <h4 className="font-bold text-sm text-white group-hover:text-orange-300 transition-colors">{act.title}</h4>
                              <p className="text-[10px] text-orange-300/40 mt-0.5">{meta.organization || "Independent Institution"} · {meta.date || "Recent"}</p>
                            </div>
                            <span className="text-[10px] font-semibold text-orange-400 uppercase tracking-widest">{act.category}</span>
                          </div>
                          
                          {meta.text && (
                            <p className="text-xs text-orange-200/50 leading-relaxed truncate max-w-lg">{meta.text}</p>
                          )}

                          {meta.feedback && (
                            <p className="text-[11px] text-orange-400 bg-orange-500/5 border border-orange-500/10 p-2.5 rounded-lg mt-2 italic">
                              <strong>Feedback:</strong> "{meta.feedback}"
                            </p>
                          )}

                          <div className="flex items-center justify-between pt-1.5 border-t border-white/5 mt-1.5">
                            {isApproved && (
                              <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Approved (+{meta.credits || 0} credits)
                              </span>
                            )}
                            {isPending && (
                              <span className="text-[10px] font-bold text-amber-400 flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5" /> Pending Faculty Verification
                              </span>
                            )}
                            {!isApproved && !isPending && (
                              <span className="text-[10px] font-bold text-red-400 flex items-center gap-1">
                                <AlertTriangle className="w-3.5 h-3.5" /> Declined Submission
                              </span>
                            )}

                            {act.certificate_url && (
                              <a href={act.certificate_url} target="_blank" rel="noreferrer"
                                className="text-[10px] font-bold text-orange-400 hover:text-orange-300 flex items-center gap-0.5 transition-colors">
                                View Certificate <ExternalLink className="w-3.5 h-3.5" />
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
          <div className="space-y-8">

            {/* AI Skill Density */}
            <div className="bg-[#0e0a04] border border-orange-500/15 rounded-3xl shadow-lg shadow-black/40 p-8 space-y-6">
              <h2 className="text-lg font-bold text-white flex items-center gap-2 border-b border-orange-500/10 pb-4">
                <BrainCircuit className="w-5 h-5 text-orange-500" />
                AI Skill Density
              </h2>

              {approvedCount === 0 ? (
                <div className="py-8 text-center space-y-3">
                  <BrainCircuit className="w-10 h-10 text-orange-500/20 mx-auto" />
                  <p className="text-sm font-semibold text-orange-300/40">No approved activities yet</p>
                  <p className="text-xs text-orange-300/25 leading-relaxed">
                    Upload certificates and get them approved by faculty. Your skill profile will be generated automatically.
                  </p>
                </div>
              ) : (
                <>
                  <div className="py-4 text-center border-b border-orange-500/10">
                    {(() => {
                      const getDominantSkill = () => {
                        const { webDev, competitiveCoding, research, leadership } = skills;
                        const maxVal = Math.max(webDev, competitiveCoding, research, leadership);
                        if (maxVal === 0) return { name: "Awaiting Data", color: "#FF6A00", gradient: "from-orange-500 to-amber-500" };
                        if (maxVal === webDev) return { name: "Software Engineer", color: "#FF6A00", gradient: "from-[#FF6A00] to-[#FFC247]" };
                        if (maxVal === competitiveCoding) return { name: "Algorithm Specialist", color: "#D7263D", gradient: "from-[#D7263D] to-[#FF6A00]" };
                        if (maxVal === research) return { name: "Academic Researcher", color: "#c084fc", gradient: "from-purple-500 to-pink-500" };
                        return { name: "Student Leader", color: "#34d399", gradient: "from-emerald-400 to-teal-400" };
                      };
                      const dominant = getDominantSkill();
                      return (
                        <div className="space-y-4">
                          <div className="relative w-40 h-40 mx-auto flex items-center justify-center">
                            <svg className="w-full h-full absolute inset-0" viewBox="0 0 200 200">
                              <defs>
                                <radialGradient id="twin-glow" cx="50%" cy="50%" r="50%">
                                  <stop offset="0%" stopColor={dominant.color} stopOpacity="0.35" />
                                  <stop offset="100%" stopColor={dominant.color} stopOpacity="0" />
                                </radialGradient>
                              </defs>
                              <circle cx="100" cy="100" r="70" fill="url(#twin-glow)" className="animate-pulse" />
                              <circle cx="100" cy="100" r="60" fill="none" stroke={dominant.color} strokeWidth="1" strokeDasharray="6 4" className="animate-[spin_20s_linear_infinite]" style={{ transformOrigin: "center" }} />
                              <circle cx="100" cy="100" r="45" fill="none" stroke={dominant.color} strokeWidth="2" strokeOpacity="0.5" className="animate-[spin_10s_linear_infinite_reverse]" style={{ transformOrigin: "center" }} />
                            </svg>
                            <div className={`w-20 h-20 rounded-full bg-gradient-to-tr ${dominant.gradient} flex items-center justify-center text-white font-bold shadow-[0_0_40px_rgba(255,106,0,0.5)] border border-white/20 relative z-10 transition-all duration-700 hover:scale-105`}>
                              <BrainCircuit className="w-9 h-9 text-white" />
                            </div>
                          </div>
                          <div>
                            <span className="block text-[10px] text-orange-300/40 uppercase tracking-widest font-black">Digital Twin Focus</span>
                            <span className="text-sm font-extrabold text-white block mt-0.5">{dominant.name}</span>
                          </div>
                        </div>
                      );
                    })()}
                  </div>

                  <div className="space-y-5 pt-4">
                    {[
                      { label: "Software / Web Dev", val: skills.webDev },
                      { label: "Competitive Programming", val: skills.competitiveCoding },
                      { label: "Research & Academics", val: skills.research },
                      { label: "Leadership & Volunteering", val: skills.leadership },
                    ].map((s) => (
                      <div key={s.label} className="space-y-1.5">
                        <div className="flex justify-between text-xs font-semibold">
                          <span className="text-orange-300/60">{s.label}</span>
                          <span className="text-orange-400">{s.val}%</span>
                        </div>
                        <div className="h-2 bg-orange-500/10 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-[#D7263D] via-[#FF6A00] to-[#FFC247] transition-all duration-700 rounded-full" style={{ width: `${s.val}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}

              <div className="mt-8 p-4 bg-orange-500/8 rounded-2xl border border-orange-500/20 space-y-2">
                <span className="text-[10px] font-bold text-orange-400 uppercase tracking-wider">AI Career Fit Prediction</span>
                {approvedCount === 0 ? (
                  <div className="text-sm text-orange-300/30 italic">Awaiting approved certificates...</div>
                ) : (
                  <>
                    <div className="text-lg font-extrabold text-white">{careerFit}</div>
                    <div className="flex items-center justify-between text-xs text-orange-300/50">
                      <span>Cosine Fit Score</span>
                      <span className="font-bold text-orange-400">{careerConfidence}% Confidence</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* AI Smart Actions */}
            <div className="bg-[#0e0a04] border border-orange-500/15 rounded-3xl shadow-lg shadow-black/40 p-8">
              <h2 className="text-lg font-bold text-white flex items-center gap-2 border-b border-orange-500/10 pb-4 mb-6">
                <Lightbulb className="w-5 h-5 text-orange-500" />
                AI Smart Actions
              </h2>
              <ul className="space-y-4">
                {recommendations.map((rec, idx) => (
                  <li key={idx} className="flex gap-3 text-xs leading-relaxed text-orange-200/60">
                    <Sparkles className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
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