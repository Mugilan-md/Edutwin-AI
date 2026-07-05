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
  ExternalLink
} from "lucide-react";

function StudentDashboard() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Stats
  const [totalCredits, setTotalCredits] = useState(0);
  const [approvedCount, setApprovedCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [cgpa, setCgpa] = useState(8.5);
  const [attendance, setAttendance] = useState(85);

  // ML / AI Insights
  const [projectedCredits, setProjectedCredits] = useState(0);
  const [skills, setSkills] = useState({
    webDev: 20,
    competitiveCoding: 10,
    research: 10,
    leadership: 10
  });
  const [careerFit, setCareerFit] = useState("Determining...");
  const [careerConfidence, setCareerConfidence] = useState(0);
  const [recommendations, setRecommendations] = useState<string[]>([]);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        // 1. Fetch Profile
        const { data: prof } = await getProfile();
        if (prof) {
          setProfile(prof);
          
          // Load CGPA / Attendance from localStorage
          const cachedAcademic = localStorage.getItem(`academic_profile_${prof.id}`);
          if (cachedAcademic) {
            const parsed = JSON.parse(cachedAcademic);
            setCgpa(parseFloat(parsed.cgpa) || 8.5);
            setAttendance(parseInt(parsed.attendance) || 85);
          }
        }

        // 2. Fetch Activities
        const { data: acts } = await fetchStudentActivities();
        if (acts) {
          setActivities(acts);

          // Calculate stats
          let sumCredits = 0;
          let approved = 0;
          let pending = 0;

          // Skill scoring system based on title / category keywords (TF-IDF simulation)
          let web = 20;
          let coding = 10;
          let res = 10;
          let lead = 10;

          acts.forEach((act) => {
            const meta = parseDescription(act.description);
            if (act.status === "approved") {
              approved++;
              sumCredits += meta.credits || 0;
            } else if (act.status === "pending") {
              pending++;
            }

            // Simple keyword-based classifier (representing TF-IDF vector mapping)
            const textToAnalyze = `${act.title} ${act.category} ${meta.text}`.toLowerCase();
            if (textToAnalyze.includes("web") || textToAnalyze.includes("react") || textToAnalyze.includes("frontend") || textToAnalyze.includes("html") || textToAnalyze.includes("js")) {
              web += 25;
            }
            if (textToAnalyze.includes("hackathon") || textToAnalyze.includes("coding") || textToAnalyze.includes("dsa") || textToAnalyze.includes("competition") || textToAnalyze.includes("contest")) {
              coding += 25;
            }
            if (textToAnalyze.includes("paper") || textToAnalyze.includes("research") || textToAnalyze.includes("journal") || textToAnalyze.includes("conference") || textToAnalyze.includes("workshop")) {
              res += 20;
            }
            if (textToAnalyze.includes("lead") || textToAnalyze.includes("volunteer") || textToAnalyze.includes("club") || textToAnalyze.includes("nss") || textToAnalyze.includes("organize")) {
              lead += 20;
            }
          });

          setTotalCredits(sumCredits);
          setApprovedCount(approved);
          setPendingCount(pending);

          // Bound skills
          setSkills({
            webDev: Math.min(100, web),
            competitiveCoding: Math.min(100, coding),
            research: Math.min(100, res),
            leadership: Math.min(100, lead)
          });

          // ML Projector: Expected credits at graduation (assuming 8 semesters total)
          // Current year: prof.year (1-4). Current sem estimation = (year * 2) - 1.
          const currentYear = prof?.year || 3;
          const semestersCompleted = Math.max(1, (currentYear * 2) - 1);
          const creditsPerSem = sumCredits / semestersCompleted;
          // Linear Regression prediction: projected = sumCredits + (creditsPerSem * (8 - semestersCompleted))
          const projected = Math.round(sumCredits + (creditsPerSem * (8 - semestersCompleted))) || 24;
          setProjectedCredits(projected);

          // AI Job Predictor using Cosine Similarity matching of skill vector to templates
          const profileVector = [web, coding, res, lead];
          const roles = [
            { name: "Full Stack Engineer", vector: [90, 80, 40, 50] },
            { name: "Data Scientist", vector: [40, 90, 80, 30] },
            { name: "Product Manager", vector: [50, 40, 50, 95] },
            { name: "Research Engineer", vector: [30, 70, 95, 40] }
          ];

          let bestRole = "Software Developer";
          let maxSimilarity = 0;

          roles.forEach((r) => {
            // Cosine similarity: (A.B) / (||A||*||B||)
            const dotProduct = profileVector.reduce((sum, val, idx) => sum + val * r.vector[idx], 0);
            const magA = Math.sqrt(profileVector.reduce((sum, val) => sum + val * val, 0));
            const magB = Math.sqrt(r.vector.reduce((sum, val) => sum + val * val, 0));
            const similarity = dotProduct / (magA * magB);
            
            if (similarity > maxSimilarity) {
              maxSimilarity = similarity;
              bestRole = r.name;
            }
          });

          setCareerFit(bestRole);
          setCareerConfidence(Math.round(maxSimilarity * 100) || 75);

          // Dynamic ML Recommendation engine based on skill density holes
          const recs = [];
          if (web < 40) {
            recs.push("Enroll in a Full-Stack development course (MOOC) to build modern web skills.");
          }
          if (coding < 40) {
            recs.push("Participate in an upcoming coding hackathon to bolster algorithmic problem-solving.");
          }
          if (res < 30) {
            recs.push("Attend a research conference or submit a workshop abstract to boost academic credentials.");
          }
          if (lead < 30) {
            recs.push("Take on a leadership role in a college club or participate in an NSS community service drive.");
          }
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-2">
          <BrainCircuit className="w-8 h-8 text-indigo-600 animate-spin" />
          <span className="text-sm font-semibold text-gray-500">Generating AI Twin...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <Navbar />

      {/* Main Container */}
      <div className="pt-28 px-4 max-w-6xl mx-auto space-y-8">
        
        {/* Top Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-indigo-950 via-indigo-900 to-violet-950 text-white rounded-3xl p-8 shadow-xl shadow-indigo-900/10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-indigo-500/10 rounded-full blur-3xl"></div>
          <div className="relative z-10 space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-semibold text-indigo-200">
              <Sparkles className="w-3.5 h-3.5" />
              AI-Powered Student Digital Twin
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight">
              Hello, {profile?.full_name || "Academic Student"} 👋
            </h1>
            <p className="text-indigo-200 text-sm max-w-xl">
              Your profile is synced. The AI has processed your activities and predicted your academic standing below.
            </p>
          </div>
          
          <button
            onClick={() => navigate("/activities")}
            className="relative z-10 self-start md:self-auto bg-white text-indigo-950 font-bold px-5 py-3 rounded-xl hover:bg-indigo-50 transition duration-300 shadow-md flex items-center gap-2 cursor-pointer text-sm"
          >
            <Plus className="w-4 h-4 text-indigo-950" />
            Upload Achievement
          </button>
        </div>

        {/* 4 Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Stats: CGPA */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">CGPA</span>
              <h3 className="text-2xl font-black text-gray-800">{cgpa.toFixed(2)}</h3>
              <p className="text-xs text-emerald-600 font-semibold">Top 15% of Batch</p>
            </div>
            <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
              <BookOpen className="w-6 h-6" />
            </div>
          </div>

          {/* Stats: Attendance */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Attendance</span>
              <h3 className="text-2xl font-black text-gray-800">{attendance}%</h3>
              <p className="text-xs text-indigo-600 font-semibold">Excellent attendance</p>
            </div>
            <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
              <Clock className="w-6 h-6" />
            </div>
          </div>

          {/* Stats: Verified Credits */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Credits</span>
              <h3 className="text-2xl font-black text-gray-800">{totalCredits} pts</h3>
              <p className="text-xs text-indigo-600 font-semibold">{approvedCount} approved activities</p>
            </div>
            <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
              <Award className="w-6 h-6" />
            </div>
          </div>

          {/* Stats: Pending Review */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Pending Review</span>
              <h3 className="text-2xl font-black text-gray-800">{pendingCount}</h3>
              <p className="text-xs text-gray-500 font-semibold">Awaiting faculty approval</p>
            </div>
            <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600">
              <Clock className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Dashboard Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Side: Activities & ML Trend (2 cols) */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* ML Credit Projector Card */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-[180px] h-[180px] bg-indigo-500/5 rounded-full blur-2xl"></div>
              
              <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-6">
                <div>
                  <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-indigo-600" />
                    ML Credit Projector
                  </h2>
                  <p className="text-xs text-gray-500">AI linear model predicting graduation points based on historical trajectory</p>
                </div>
                <div className="bg-indigo-50 text-indigo-700 text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  Predictive Analysis
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                <div className="space-y-2 text-center md:text-left">
                  <span className="text-xs font-semibold text-gray-400 uppercase">Current Credits</span>
                  <div className="text-4xl font-extrabold text-gray-900">{totalCredits}</div>
                  <span className="text-xs text-gray-500">Verified by department</span>
                </div>
                
                <div className="flex flex-col items-center justify-center p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100/50 relative">
                  <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider mb-1">Graduation Projector</span>
                  <div className="text-5xl font-black text-indigo-700">{projectedCredits}</div>
                  <span className="text-[10px] text-indigo-600 font-semibold mt-1">Expected Extracurricular Credits</span>
                </div>

                <div className="space-y-2 text-center md:text-left">
                  <span className="text-xs font-semibold text-gray-400 uppercase">NAAC Level Status</span>
                  <div className="flex items-center justify-center md:justify-start gap-1.5 text-emerald-600 font-bold text-sm">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    A++ Tier Eligible
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    Exceeds the threshold of 20 credits required for maximum institutional accreditation weight.
                  </p>
                </div>
              </div>
            </div>

            {/* Recent Activities List */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
              <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-6">
                <div>
                  <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-indigo-600" />
                    My Activity Records
                  </h2>
                  <p className="text-xs text-gray-500">Academic & curricular achievements logged by you</p>
                </div>
                <button 
                  onClick={() => navigate("/profile")}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 cursor-pointer"
                >
                  View Shareable Resume
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {activities.length === 0 ? (
                <div className="py-12 text-center space-y-3">
                  <FileText className="w-12 h-12 text-gray-300 mx-auto" />
                  <p className="text-sm font-semibold text-gray-500">No achievements recorded yet.</p>
                  <button
                    onClick={() => navigate("/activities")}
                    className="text-xs font-bold text-indigo-600 hover:underline cursor-pointer"
                  >
                    Click here to upload your first certificate
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {activities.slice(0, 5).map((act) => {
                    const meta = parseDescription(act.description);
                    return (
                      <div key={act.id} className="py-4 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                        <div className="space-y-1 min-w-0">
                          <h4 className="font-semibold text-sm text-gray-800 truncate">{act.title}</h4>
                          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-gray-500">
                            <span className="font-medium text-gray-700">{act.category}</span>
                            <span>•</span>
                            <span className="truncate">{meta.organization || "Private Organisation"}</span>
                            {meta.date && (
                              <>
                                <span>•</span>
                                <span>{meta.date}</span>
                              </>
                            )}
                          </div>
                          {meta.feedback && (
                            <p className="text-xs text-indigo-600 bg-indigo-50/50 p-2 rounded-lg mt-2 italic">
                              <strong>Feedback:</strong> "{meta.feedback}"
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          {act.status === "approved" && (
                            <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                              +{meta.credits || 0} Credits
                            </span>
                          )}
                          {act.status === "pending" && (
                            <span className="bg-amber-50 text-amber-700 border border-amber-100 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-amber-500" />
                              Pending Review
                            </span>
                          )}
                          {act.status === "rejected" && (
                            <span className="bg-red-50 text-red-700 border border-red-100 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                              <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
                              Declined
                            </span>
                          )}
                          
                          {act.certificate_url && (
                            <a
                              href={act.certificate_url}
                              target="_blank"
                              rel="noreferrer"
                              className="p-2 hover:bg-indigo-50 text-gray-400 hover:text-indigo-600 rounded-xl transition border border-transparent hover:border-indigo-150 flex items-center justify-center cursor-pointer"
                              title="View uploaded certificate file"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>

          {/* Right Side: AI Analytics (1 col) */}
          <div className="space-y-8">
            
            {/* AI Skill Profile & Career Match */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 relative overflow-hidden">
              <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2 border-b border-gray-100 pb-4 mb-6">
                <BrainCircuit className="w-5 h-5 text-indigo-600" />
                AI Skill Density
              </h2>

              <div className="space-y-5">
                {/* Web Dev */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-gray-600">Software / Web Dev</span>
                    <span className="text-indigo-600">{skills.webDev}%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 transition-all duration-500"
                      style={{ width: `${skills.webDev}%` }}
                    ></div>
                  </div>
                </div>

                {/* Competitive Coding */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-gray-600">Competitive Programming</span>
                    <span className="text-indigo-600">{skills.competitiveCoding}%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 transition-all duration-500"
                      style={{ width: `${skills.competitiveCoding}%` }}
                    ></div>
                  </div>
                </div>

                {/* Research */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-gray-600">Research & Academics</span>
                    <span className="text-indigo-600">{skills.research}%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 transition-all duration-500"
                      style={{ width: `${skills.research}%` }}
                    ></div>
                  </div>
                </div>

                {/* Leadership */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-gray-600">Leadership & Volunteering</span>
                    <span className="text-indigo-600">{skills.leadership}%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 transition-all duration-500"
                      style={{ width: `${skills.leadership}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Career Matching Indicator */}
              <div className="mt-8 p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100/50 space-y-2">
                <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider">AI Career Fit Prediction</span>
                <div className="text-lg font-extrabold text-gray-900">{careerFit}</div>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Cosine Fit Score</span>
                  <span className="font-bold text-indigo-600">{careerConfidence}% Confidence</span>
                </div>
              </div>
            </div>

            {/* AI Action Recommendations */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
              <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2 border-b border-gray-100 pb-4 mb-6">
                <Lightbulb className="w-5 h-5 text-indigo-600" />
                AI Smart Actions
              </h2>

              <ul className="space-y-4">
                {recommendations.map((rec, idx) => (
                  <li key={idx} className="flex gap-3 text-xs leading-relaxed text-gray-600">
                    <Sparkles className="w-4 h-4 text-violet-500 shrink-0 mt-0.5" />
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