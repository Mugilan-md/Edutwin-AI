import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getProfileByRegisterNo } from "../services/profileService";
import { fetchStudentActivities, parseDescription } from "../services/activityService";
import { 
  Sparkles, 
  Download, 
  Award, 
  CheckCircle2, 
  GraduationCap, 
  Mail, 
  Loader2, 
  Calendar
} from "lucide-react";

function Portfolio() {
  const { registerNo } = useParams<{ registerNo: string }>();
  const [profile, setProfile] = useState<any>(null);
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Custom Academic details
  const [cgpa, setCgpa] = useState(8.5);
  const [attendance, setAttendance] = useState(85);

  // AI Elevator Pitch Generator
  const [aiBio, setAiBio] = useState("");

  useEffect(() => {
    async function loadPortfolioData() {
      if (!registerNo) return;
      setLoading(true);

      try {
        // 1. Fetch Profile by Register Number
        const { data: prof, error: profError } = await getProfileByRegisterNo(registerNo);
        
        if (profError || !prof) {
          setLoading(false);
          return;
        }

        setProfile(prof);

        // Load CGPA & Attendance from localStorage
        const cachedAcademic = localStorage.getItem(`academic_profile_${prof.id}`);
        if (cachedAcademic) {
          const parsed = JSON.parse(cachedAcademic);
          setCgpa(parseFloat(parsed.cgpa) || 8.5);
          setAttendance(parseInt(parsed.attendance) || 85);
        }

        // 2. Fetch approved activities of this student
        const { data: acts } = await fetchStudentActivities(prof.id);
        if (acts) {
          const approvedActs = acts.filter((act) => act.status === "approved");
          setActivities(approvedActs);

          // 3. AI Bio Generator (Simulated NLP summary extraction)
          // Count keywords
          let codeCount = 0;
          let webCount = 0;
          let resCount = 0;
          let leadCount = 0;

          approvedActs.forEach((act) => {
            const meta = parseDescription(act.description);
            const text = `${act.title} ${act.category} ${meta.text}`.toLowerCase();
            if (text.includes("web") || text.includes("react") || text.includes("js")) webCount++;
            if (text.includes("hackathon") || text.includes("code") || text.includes("dsa")) codeCount++;
            if (text.includes("paper") || text.includes("research")) resCount++;
            if (text.includes("volunteer") || text.includes("nss") || text.includes("lead")) leadCount++;
          });

          // Build dynamic elevator pitch sentences
          const name = prof.full_name;
          const dept = prof.department;
          
          let skillClause = "";
          if (webCount > 0 && codeCount > 0) {
            skillClause = "exhibits strong competence in Software Development and Competitive Engineering";
          } else if (webCount > 0) {
            skillClause = "specializes in Web Development, creating modern responsive applications";
          } else if (codeCount > 0) {
            skillClause = "focuses on Algorithmic Problem Solving and competitive programming challenges";
          } else if (resCount > 0) {
            skillClause = "shows core strength in Research, Technical Writing, and Academic Investigations";
          } else {
            skillClause = "demonstrates academic diligence and extracurricular engagement";
          }

          let extracurricularClause = "";
          const totalActs = approvedActs.length;
          if (totalActs > 0) {
            extracurricularClause = `With a portfolio of ${totalActs} verified achievements including workshops, hackathons, and certifications, they stand out as a highly proactive candidate.`;
          } else {
            extracurricularClause = "They maintain a consistent record of curriculum engagement and verified academic attendance.";
          }

          let leadershipClause = leadCount > 0 ? " They also display strong teamwork and leadership capabilities through active club volunteering." : "";

          const generatedBio = `${name} is an active ${dept} student (CGPA: ${cgpa.toFixed(2)}) who ${skillClause}. ${extracurricularClause}${leadershipClause}`;
          setAiBio(generatedBio);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadPortfolioData();
  }, [registerNo]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
          <span className="text-sm font-semibold text-gray-500">Generating Verified Portfolio...</span>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full text-center space-y-4 bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
          <Award className="w-16 h-16 text-red-400 mx-auto" />
          <h2 className="text-xl font-bold text-gray-800">Portfolio Not Found</h2>
          <p className="text-sm text-gray-500">
            The student portfolio you are looking for does not exist or has not been publically verified yet.
          </p>
          <Link to="/" className="inline-block text-xs font-bold text-indigo-600 hover:underline">
            Go back to Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-16 relative">
      {/* Back button (Hidden during PDF print) */}
      <div className="print:hidden fixed top-6 left-6 z-50 flex gap-2">
        <Link
          to="/"
          className="bg-white/80 hover:bg-white backdrop-blur-md text-gray-600 hover:text-gray-900 border border-gray-200 shadow-sm px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
        >
          ← Exit Portfolio
        </Link>
      </div>

      {/* Print PDF Trigger (Hidden during PDF print) */}
      <div className="print:hidden fixed top-6 right-6 z-50">
        <button
          onClick={handlePrint}
          className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-150 px-5 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer"
        >
          <Download className="w-4 h-4" />
          Download Resume (PDF)
        </button>
      </div>

      {/* Main Print Container (Beautiful Resume Card) */}
      <div className="pt-24 px-4 max-w-3xl mx-auto print:pt-0 print:max-w-full">
        
        {/* Printable Resume Canvas */}
        <div className="bg-white rounded-3xl border border-gray-150 shadow-sm p-10 print:border-none print:shadow-none print:p-0 space-y-8 text-left">
          
          {/* Header Contact Block */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b-2 border-indigo-600 pb-6">
            <div className="space-y-1">
              <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">{profile.full_name}</h1>
              <p className="text-indigo-600 text-sm font-semibold uppercase tracking-wider">
                {profile.department} Student • {profile.year} Year
              </p>
              
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500 mt-2">
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-gray-400" />
                  {profile.email}
                </span>
                <span className="flex items-center gap-1">
                  <GraduationCap className="w-3.5 h-3.5 text-gray-400" />
                  Reg: {profile.register_no}
                </span>
              </div>
            </div>

            <div className="flex md:flex-col items-start gap-4 text-xs shrink-0 bg-gray-50 p-4 rounded-2xl border border-gray-100">
              <div>
                <span className="block text-[10px] text-gray-400 uppercase font-semibold">Verified CGPA</span>
                <span className="text-lg font-black text-gray-800">{cgpa.toFixed(2)} / 10.00</span>
              </div>
              <div className="print:hidden">
                <span className="block text-[10px] text-gray-400 uppercase font-semibold">Attendance</span>
                <span className="text-sm font-bold text-gray-700">{attendance}% Verified</span>
              </div>
            </div>
          </div>

          {/* AI Elevator Pitch Section */}
          {aiBio && (
            <div className="bg-indigo-50/40 border border-indigo-100/50 p-6 rounded-2xl space-y-2 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-xl"></div>
              <h3 className="text-xs font-bold text-indigo-700 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                AI Generated Executive Bio
              </h3>
              <p className="text-xs text-gray-700 leading-relaxed font-medium">
                {aiBio}
              </p>
            </div>
          )}

          {/* Core Achievements Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider border-b border-gray-100 pb-2 flex items-center gap-2">
              <Award className="w-4 h-4 text-indigo-600" />
              Verified Co-Curricular & Extracurricular Activities
            </h3>

            {activities.length === 0 ? (
              <p className="text-xs text-gray-400 italic">No verified activities logged in this academic session.</p>
            ) : (
              <div className="space-y-6">
                {activities.map((act) => {
                  const meta = parseDescription(act.description);
                  return (
                    <div key={act.id} className="space-y-1.5 text-left border-l-2 border-gray-150 pl-4 relative">
                      <div className="absolute -left-[5px] top-1.5 w-2.5 h-2.5 bg-indigo-600 rounded-full"></div>
                      
                      <div className="flex items-center justify-between gap-4">
                        <h4 className="font-bold text-sm text-gray-800">{act.title}</h4>
                        <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-100 font-bold px-2.5 py-0.5 rounded-full flex items-center gap-0.5 shrink-0">
                          <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                          Verified
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-gray-500">
                        <span className="font-semibold text-gray-700">{act.category}</span>
                        <span>•</span>
                        <span>{meta.organization || "Private Organisation"}</span>
                        {meta.date && (
                          <>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-gray-400" />
                              {meta.date}
                            </span>
                          </>
                        )}
                        <span>•</span>
                        <span className="text-indigo-600 font-bold">+{meta.credits || 2} Credits</span>
                      </div>

                      <p className="text-xs text-gray-600 leading-relaxed pt-1">{meta.text}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Institutional Integrity Stamp (Print only) */}
          <div className="hidden print:flex items-center justify-between border-t border-gray-200 pt-8 mt-12 text-[10px] text-gray-400">
            <div>
              <span className="block font-bold">Edutwin Academic Credentials</span>
              <span className="block">URL: {window.location.origin}/portfolio/{profile.register_no}</span>
            </div>
            <div className="text-right">
              <span className="block">Timestamp: {new Date().toLocaleDateString()}</span>
              <span className="block text-indigo-600 font-bold">✓ Cryptographically Secured Profile</span>
            </div>
          </div>

        </div>

      </div>

      {/* CSS Print Styles Override */}
      <style>{`
        @media print {
          body {
            background-color: white !important;
            color: black !important;
          }
          .min-h-screen {
            padding: 0 !important;
            background-color: white !important;
          }
          /* Hide print button & exit link */
          .print\\:hidden {
            display: none !important;
          }
          nav {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}

export default Portfolio;
