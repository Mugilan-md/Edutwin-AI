import { useState, useEffect } from "react";
import { fetchAllPendingActivities, updateActivityStatus, parseDescription } from "../services/activityService";
import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";
import { getProfile } from "../services/profileService";
import {
  CheckCircle2,
  XCircle,
  ExternalLink,
  GraduationCap,
  Award,
  MessageSquare,
  Loader2,
  BrainCircuit,
  Clock,
  AlertTriangle,
  RefreshCw,
  FileText,
} from "lucide-react";

function FacultyDashboard() {
  const navigate = useNavigate();
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedActivity, setSelectedActivity] = useState<any | null>(null);
  const [isApproveModal, setIsApproveModal] = useState(true);
  const [feedback, setFeedback] = useState("");
  const [credits, setCredits] = useState(2);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    async function init() {
      try {
        const { data: prof } = await getProfile();
        if (!prof || prof.role === "student") {
          navigate("/student");
          return;
        }
        await loadPendingActivities();
      } catch (e) {
        console.error(e);
        setLoading(false);
      }
    }
    init();
  }, []);

  async function loadPendingActivities() {
    setLoading(true);
    setErrorMsg("");
    try {
      const { data, error } = await fetchAllPendingActivities();
      if (error) setErrorMsg("Unable to fetch submissions. Check Supabase RLS policies.");
      else if (data) setActivities(data);
    } catch (err) {
      console.error(err);
      setErrorMsg("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  }

  const handleOpenReview = (act: any, isApprove: boolean) => {
    setSelectedActivity(act);
    setIsApproveModal(isApprove);
    const meta = parseDescription(act.description);
    setCredits(meta.aiSuggestedCredits || 2);
    setFeedback(
      isApprove
        ? `Excellent effort! Certificate verified. Great work on completing "${act.title}".`
        : `Rejection notice: The certificate for "${act.title}" could not be verified. Please re-upload with proper documentation.`
    );
  };

  const handleSubmitReview = async () => {
    if (!selectedActivity) return;
    setSubmitting(true);
    try {
      const finalStatus = isApproveModal ? "approved" : "rejected";
      const finalCredits = isApproveModal ? credits : null;
      const { error } = await updateActivityStatus(selectedActivity.id, finalStatus, finalCredits, feedback);
      if (error) alert("Failed to update: " + (error as any).message);
      else { setSelectedActivity(null); await loadPendingActivities(); }
    } catch (err: any) {
      alert(err.message || "An error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#080608] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
          <span className="text-sm font-semibold text-orange-300/60">Loading Student Submissions...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080608] pb-16">
      <Navbar forcedRole="faculty" />

      <div className="pt-24 px-4 max-w-6xl mx-auto space-y-6">

        {/* ── Header ── */}
        <div className="bg-gradient-to-r from-[#0f0a04] via-[#1a0d02] to-[#0a0505] border border-orange-500/20 text-white rounded-3xl p-6 md:p-8 shadow-2xl shadow-black/60 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-orange-500/8 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-orange-500/10 border border-orange-500/20 rounded-full text-xs font-semibold text-orange-300 mb-3">
              <GraduationCap className="w-3.5 h-3.5" />
              Faculty Review Panel
            </div>
            <h1 className="text-xl md:text-2xl font-extrabold mb-1">Activity Approval Dashboard</h1>
            <p className="text-orange-200/50 text-sm mb-5">
              Review student certificates → Verify → Approve (add NAAC credits) or Decline.
            </p>

            {/* 3 Stat Boxes */}
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-2.5 bg-orange-500/10 border border-orange-500/20 rounded-2xl px-4 py-2.5">
                <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                <div>
                  <span className="block text-lg font-black text-white leading-none">{activities.length}</span>
                  <span className="block text-[10px] text-orange-300/60">Awaiting Review</span>
                </div>
              </div>
              <div className="flex items-center gap-2.5 bg-emerald-950/40 border border-emerald-500/20 rounded-2xl px-4 py-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <div>
                  <span className="block text-xs font-bold text-emerald-300 leading-none">Approve</span>
                  <span className="block text-[10px] text-emerald-400/50">Assigns NAAC Credits</span>
                </div>
              </div>
              <div className="flex items-center gap-2.5 bg-red-950/40 border border-red-500/20 rounded-2xl px-4 py-2.5">
                <XCircle className="w-4 h-4 text-red-400 shrink-0" />
                <div>
                  <span className="block text-xs font-bold text-red-300 leading-none">Decline</span>
                  <span className="block text-[10px] text-red-400/50">No Credits Awarded</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Error ── */}
        {errorMsg && (
          <div className="p-4 bg-amber-950/40 border border-amber-500/30 rounded-2xl flex items-start gap-3 text-sm text-amber-300">
            <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-bold block">Note:</span>
              {errorMsg}
            </div>
            <button onClick={loadPendingActivities} className="shrink-0 flex items-center gap-1 text-xs font-bold text-orange-400 hover:text-orange-300 cursor-pointer">
              <RefreshCw className="w-3.5 h-3.5" /> Retry
            </button>
          </div>
        )}

        {/* ── Submissions Panel ── */}
        <div className="bg-[#0e0a04] border border-orange-500/15 rounded-3xl shadow-lg shadow-black/40 p-5 md:p-8">
          <div className="flex items-center justify-between border-b border-orange-500/10 pb-4 mb-6 gap-4">
            <div>
              <h2 className="text-base md:text-lg font-bold text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-orange-500" />
                Pending Submissions
              </h2>
              <p className="text-xs text-orange-300/40 mt-0.5 hidden sm:block">
                Tap Approve or Decline on each submission. AI credit values are pre-suggested.
              </p>
            </div>
            <button onClick={loadPendingActivities}
              className="flex items-center gap-1.5 text-xs text-orange-400 font-bold bg-orange-500/10 hover:bg-orange-500/20 px-3 py-2 rounded-xl border border-orange-500/20 cursor-pointer transition shrink-0">
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>

          {activities.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <CheckCircle2 className="w-14 h-14 text-orange-500/15 mx-auto" />
              <h3 className="text-base font-bold text-orange-300/50">All Caught Up!</h3>
              <p className="text-sm text-orange-300/30">No pending submissions. All activities have been reviewed.</p>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-orange-500/10">
                      {["Student", "Achievement", "Category", "AI Suggestion", "Certificate", "Actions"].map((h) => (
                        <th key={h} className="pb-3 pr-4 text-[11px] font-bold text-orange-300/40 uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-orange-500/5">
                    {activities.map((act) => {
                      const student = act.profiles;
                      const meta = parseDescription(act.description);
                      return (
                        <tr key={act.id} className="hover:bg-orange-500/4 transition duration-150">
                          <td className="py-4 pr-4">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 bg-gradient-to-tr from-[#D7263D] via-[#FF6A00] to-[#FFC247] rounded-lg flex items-center justify-center text-white font-black text-xs shrink-0">
                                {student?.full_name?.charAt(0)?.toUpperCase() || "S"}
                              </div>
                              <div>
                                <span className="block text-sm font-bold text-white whitespace-nowrap">{student?.full_name || "Unknown"}</span>
                                <span className="block text-[10px] text-orange-300/40">{student?.register_no || "—"} · {student?.department || "—"}</span>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 pr-4 max-w-[180px]">
                            <span className="block text-sm font-bold text-white truncate">{act.title}</span>
                            <span className="block text-[10px] text-orange-300/40 truncate">{meta.organization || "—"}</span>
                          </td>
                          <td className="py-4 pr-4">
                            <span className="text-[11px] bg-orange-500/10 border border-orange-500/20 text-orange-400 font-semibold px-2 py-1 rounded-full whitespace-nowrap">{act.category}</span>
                          </td>
                          <td className="py-4 pr-4">
                            <div className="flex items-center gap-1.5">
                              <BrainCircuit className="w-4 h-4 text-orange-500 shrink-0" />
                              <div>
                                <span className="block text-xs font-bold text-white">{meta.aiSuggestedCredits || 2} Credits</span>
                                <span className="block text-[10px] text-emerald-400">{meta.aiConfidence || 80}% Confidence</span>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 pr-4">
                            <a href={act.certificate_url} target="_blank" rel="noreferrer"
                              className="inline-flex items-center gap-1 text-[11px] text-orange-400 font-bold bg-orange-500/10 hover:bg-orange-500/20 px-2.5 py-1.5 rounded-lg transition whitespace-nowrap border border-orange-500/20">
                              <ExternalLink className="w-3 h-3" />View
                            </a>
                          </td>
                          <td className="py-4">
                            <div className="flex items-center gap-2">
                              <button onClick={() => handleOpenReview(act, true)}
                                className="flex items-center gap-1 bg-emerald-950/50 hover:bg-emerald-950 text-emerald-400 border border-emerald-500/30 px-2.5 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition">
                                <CheckCircle2 className="w-3.5 h-3.5" />Approve
                              </button>
                              <button onClick={() => handleOpenReview(act, false)}
                                className="flex items-center gap-1 bg-red-950/50 hover:bg-red-950 text-red-400 border border-red-500/30 px-2.5 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition">
                                <XCircle className="w-3.5 h-3.5" />Decline
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden space-y-4">
                {activities.map((act) => {
                  const student = act.profiles;
                  const meta = parseDescription(act.description);
                  return (
                    <div key={act.id} className="bg-black/30 border border-orange-500/15 rounded-2xl p-4 space-y-3">
                      {/* Student info */}
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-gradient-to-tr from-[#D7263D] via-[#FF6A00] to-[#FFC247] rounded-xl flex items-center justify-center text-white font-black text-sm shrink-0">
                          {student?.full_name?.charAt(0)?.toUpperCase() || "S"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="block text-sm font-bold text-white truncate">{student?.full_name || "Unknown"}</span>
                          <span className="block text-[10px] text-orange-300/40">{student?.register_no || "—"} · {student?.department || "—"}</span>
                        </div>
                        <a href={act.certificate_url} target="_blank" rel="noreferrer"
                          className="flex items-center gap-1 text-[11px] text-orange-400 font-bold bg-orange-500/10 border border-orange-500/20 px-2.5 py-1.5 rounded-lg transition shrink-0">
                          <ExternalLink className="w-3 h-3" />View
                        </a>
                      </div>

                      {/* Achievement */}
                      <div>
                        <p className="text-sm font-bold text-white truncate">{act.title}</p>
                        <p className="text-[10px] text-orange-300/40">{meta.organization || "—"}</p>
                      </div>

                      {/* Category + AI */}
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] bg-orange-500/10 border border-orange-500/20 text-orange-400 font-semibold px-2 py-1 rounded-full">{act.category}</span>
                        <div className="flex items-center gap-1.5 text-xs">
                          <BrainCircuit className="w-3.5 h-3.5 text-orange-500" />
                          <span className="font-bold text-white">{meta.aiSuggestedCredits || 2} Credits</span>
                          <span className="text-emerald-400">· {meta.aiConfidence || 80}%</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-3 pt-1">
                        <button onClick={() => handleOpenReview(act, true)}
                          className="flex-1 flex items-center justify-center gap-1.5 bg-emerald-950/50 hover:bg-emerald-950 text-emerald-400 border border-emerald-500/30 py-2.5 rounded-xl text-sm font-bold cursor-pointer transition">
                          <CheckCircle2 className="w-4 h-4" /> Approve
                        </button>
                        <button onClick={() => handleOpenReview(act, false)}
                          className="flex-1 flex items-center justify-center gap-1.5 bg-red-950/50 hover:bg-red-950 text-red-400 border border-red-500/30 py-2.5 rounded-xl text-sm font-bold cursor-pointer transition">
                          <XCircle className="w-4 h-4" /> Decline
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── Review Modal ── */}
      {selectedActivity && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-[#0e0a04] border border-orange-500/20 w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl shadow-black overflow-hidden max-h-[92vh] overflow-y-auto">

            {/* Modal Header */}
            <div className={`p-5 text-white sticky top-0 ${isApproveModal ? "bg-gradient-to-r from-emerald-900/90 to-teal-900/90 border-b border-emerald-500/20" : "bg-gradient-to-r from-red-900/90 to-rose-900/90 border-b border-red-500/20"}`}>
              <div className="flex items-center justify-between">
                <div>
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-white/50">Activity Verification</span>
                  <h3 className="text-base font-bold">{isApproveModal ? "✅ Approve Activity" : "❌ Decline Activity"}</h3>
                </div>
                <button onClick={() => setSelectedActivity(null)} className="text-white/50 hover:text-white text-xl cursor-pointer font-bold w-8 h-8 flex items-center justify-center">✕</button>
              </div>
            </div>

            <div className="p-5 space-y-4">
              {/* Activity detail */}
              <div className="bg-black/30 border border-orange-500/15 rounded-2xl p-4 space-y-2 text-xs">
                {[
                  { label: "Student", value: selectedActivity.profiles?.full_name || "Unknown" },
                  { label: "Register No.", value: selectedActivity.profiles?.register_no || "—" },
                  { label: "Department", value: selectedActivity.profiles?.department || "—" },
                  { label: "Achievement", value: selectedActivity.title },
                  { label: "Category", value: selectedActivity.category },
                ].map((row) => (
                  <div key={row.label} className="flex justify-between gap-2">
                    <span className="text-orange-300/40 font-medium shrink-0">{row.label}</span>
                    <span className="font-bold text-white text-right truncate">{row.value}</span>
                  </div>
                ))}
                <div className="mt-2 pt-2 border-t border-orange-500/10 flex items-start gap-2 text-orange-400">
                  <BrainCircuit className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  <span className="text-[10px] font-semibold">
                    AI suggests {parseDescription(selectedActivity.description).aiSuggestedCredits || 2} credits for "{selectedActivity.category}" per NAAC criteria.
                  </span>
                </div>
              </div>

              {/* Credits slider */}
              {isApproveModal && (
                <div className="space-y-2">
                  <label className="text-xs font-bold text-orange-300/50 uppercase tracking-wider flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-orange-500" /> Assign Credits (1–5)
                  </label>
                  <div className="flex items-center gap-3">
                    <input type="range" min="1" max="5" step="1" value={credits}
                      onChange={(e) => setCredits(parseInt(e.target.value))}
                      className="flex-1 accent-orange-500" />
                    <span className="text-xl font-black text-orange-400 w-8 text-center">{credits}</span>
                  </div>
                  <div className="flex justify-between text-[10px] text-orange-300/30 px-1">
                    {[1,2,3,4,5].map(n => <span key={n}>{n}</span>)}
                  </div>
                </div>
              )}

              {/* Feedback */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-orange-300/50 uppercase tracking-wider flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-orange-500" /> Feedback to Student
                </label>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 bg-black/30 border border-orange-500/15 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/40 text-white text-sm resize-none transition placeholder-orange-300/20"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="px-5 pb-5 flex gap-3">
              <button onClick={() => setSelectedActivity(null)}
                className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white rounded-xl text-sm font-bold cursor-pointer transition border border-white/8">
                Cancel
              </button>
              <button onClick={handleSubmitReview} disabled={submitting}
                className={`flex-1 py-3 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 transition ${isApproveModal ? "bg-emerald-700 hover:bg-emerald-600" : "bg-red-700 hover:bg-red-600"}`}>
                {submitting ? <><Loader2 className="w-4 h-4 animate-spin" />Saving...</> : <><CheckCircle2 className="w-4 h-4" />Confirm</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default FacultyDashboard;