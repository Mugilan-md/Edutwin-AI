import { useState, useEffect } from "react";
import { fetchAllPendingActivities, updateActivityStatus, parseDescription } from "../services/activityService";
import Navbar from "../components/Navbar";
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
} from "lucide-react";

function FacultyDashboard() {
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedActivity, setSelectedActivity] = useState<any | null>(null);
  const [isApproveModal, setIsApproveModal] = useState(true);
  const [feedback, setFeedback] = useState("");
  const [credits, setCredits] = useState(2);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => { loadPendingActivities(); }, []);

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

      <div className="pt-28 px-4 max-w-6xl mx-auto space-y-8">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-[#0f0a04] via-[#1a0d02] to-[#0a0505] border border-orange-500/20 text-white rounded-3xl p-8 shadow-2xl shadow-black/60 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[250px] h-[250px] bg-orange-500/8 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-orange-500/10 border border-orange-500/20 rounded-full text-xs font-semibold text-orange-300 mb-2">
              <GraduationCap className="w-3.5 h-3.5" />
              Faculty Review Panel
            </div>
            <h1 className="text-2xl font-extrabold">Activity Approval Dashboard</h1>
            <p className="text-orange-200/50 text-sm">
              Review, verify, and assign academic credits to student achievement submissions.
            </p>
          </div>
          <div className="relative z-10 flex items-center gap-3 bg-orange-500/10 border border-orange-500/20 rounded-2xl px-5 py-3">
            <Clock className="w-6 h-6 text-amber-400" />
            <div>
              <span className="block text-2xl font-black text-white">{activities.length}</span>
              <span className="block text-xs text-orange-300/60">Pending Reviews</span>
            </div>
          </div>
        </div>

        {/* Error */}
        {errorMsg && (
          <div className="p-4 bg-amber-950/40 border border-amber-500/30 rounded-2xl flex items-center gap-3 text-sm text-amber-300">
            <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
            <div>
              <span className="font-bold block">Note:</span>
              {errorMsg} — Make sure the Supabase RLS policy allows faculty to read all activities.
            </div>
            <button onClick={loadPendingActivities} className="ml-auto shrink-0 flex items-center gap-1 text-xs font-bold text-orange-400 hover:text-orange-300 cursor-pointer">
              <RefreshCw className="w-3.5 h-3.5" /> Retry
            </button>
          </div>
        )}

        {/* Pending Activities Table */}
        <div className="bg-[#0e0a04] border border-orange-500/15 rounded-3xl shadow-lg shadow-black/40 p-8">
          <div className="flex items-center justify-between border-b border-orange-500/10 pb-5 mb-6">
            <div>
              <h2 className="text-lg font-bold text-white">Pending Submissions</h2>
              <p className="text-xs text-orange-300/40 mt-0.5">Click Approve or Decline to review each submission. AI credit values are pre-suggested.</p>
            </div>
            <button
              onClick={loadPendingActivities}
              className="flex items-center gap-1.5 text-xs text-orange-400 font-bold bg-orange-500/10 hover:bg-orange-500/20 px-3 py-2 rounded-xl border border-orange-500/20 cursor-pointer transition"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Refresh
            </button>
          </div>

          {activities.length === 0 ? (
            <div className="py-20 text-center space-y-3">
              <CheckCircle2 className="w-16 h-16 text-orange-500/15 mx-auto" />
              <h3 className="text-lg font-bold text-orange-300/50">All Caught Up!</h3>
              <p className="text-sm text-orange-300/30">No pending submissions. All student activities have been reviewed.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-orange-500/10">
                    {["Student", "Achievement", "Category", "AI Recommendation", "Certificate", "Actions"].map((h) => (
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
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-gradient-to-tr from-[#D7263D] via-[#FF6A00] to-[#FFC247] rounded-xl flex items-center justify-center text-white font-black text-sm shrink-0">
                              {student?.full_name?.charAt(0)?.toUpperCase() || "S"}
                            </div>
                            <div>
                              <span className="block text-sm font-bold text-white whitespace-nowrap">{student?.full_name || "Unknown Student"}</span>
                              <span className="block text-[10px] text-orange-300/40">{student?.register_no || "—"} · {student?.department || "—"}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 pr-4 max-w-[200px]">
                          <span className="block text-sm font-bold text-white truncate">{act.title}</span>
                          <span className="block text-[10px] text-orange-300/40 truncate">{meta.organization || "—"}</span>
                        </td>
                        <td className="py-4 pr-4">
                          <span className="text-[11px] bg-orange-500/10 border border-orange-500/20 text-orange-400 font-semibold px-2.5 py-1 rounded-full whitespace-nowrap">{act.category}</span>
                        </td>
                        <td className="py-4 pr-4">
                          <div className="flex items-center gap-1.5">
                            <BrainCircuit className="w-4 h-4 text-orange-500 shrink-0" />
                            <div>
                              <span className="block text-xs font-bold text-white">{meta.aiSuggestedCredits || 2} Credits</span>
                              <span className="block text-[10px] text-emerald-400 font-semibold">{meta.aiConfidence || 80}% AI Confidence</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 pr-4">
                          <a href={act.certificate_url} target="_blank" rel="noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] text-orange-400 hover:text-orange-300 font-bold bg-orange-500/10 hover:bg-orange-500/20 px-2.5 py-1.5 rounded-lg transition whitespace-nowrap border border-orange-500/20">
                            <ExternalLink className="w-3 h-3" />View
                          </a>
                        </td>
                        <td className="py-4">
                          <div className="flex items-center gap-2">
                            <button onClick={() => handleOpenReview(act, true)}
                              className="flex items-center gap-1 bg-emerald-950/50 hover:bg-emerald-950 text-emerald-400 border border-emerald-500/30 px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition">
                              <CheckCircle2 className="w-3.5 h-3.5" />Approve
                            </button>
                            <button onClick={() => handleOpenReview(act, false)}
                              className="flex items-center gap-1 bg-red-950/50 hover:bg-red-950 text-red-400 border border-red-500/30 px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition">
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
          )}
        </div>
      </div>

      {/* Review Modal */}
      {selectedActivity && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0e0a04] border border-orange-500/20 w-full max-w-lg rounded-3xl shadow-2xl shadow-black overflow-hidden">

            {/* Modal Header */}
            <div className={`p-6 text-white ${isApproveModal ? "bg-gradient-to-r from-emerald-900/80 to-teal-900/80 border-b border-emerald-500/20" : "bg-gradient-to-r from-red-900/80 to-rose-900/80 border-b border-red-500/20"}`}>
              <div className="flex items-center justify-between">
                <div>
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-white/50">Activity Verification</span>
                  <h3 className="text-lg font-bold">{isApproveModal ? "✅ Approve Activity" : "❌ Decline Activity"}</h3>
                </div>
                <button onClick={() => setSelectedActivity(null)} className="text-white/50 hover:text-white text-xl cursor-pointer font-bold">✕</button>
              </div>
            </div>

            <div className="p-6 space-y-5">
              {/* Activity detail */}
              <div className="bg-black/30 border border-orange-500/15 rounded-2xl p-4 space-y-2 text-xs">
                {[
                  { label: "Student", value: selectedActivity.profiles?.full_name || "Unknown" },
                  { label: "Register No.", value: selectedActivity.profiles?.register_no || "—" },
                  { label: "Achievement", value: selectedActivity.title },
                  { label: "Category", value: selectedActivity.category },
                ].map((row) => (
                  <div key={row.label} className="flex justify-between">
                    <span className="text-orange-300/40 font-medium">{row.label}</span>
                    <span className="font-bold text-white text-right max-w-[60%] truncate">{row.value}</span>
                  </div>
                ))}
                <div className="mt-2 pt-2 border-t border-orange-500/10 flex items-start gap-2 text-orange-400">
                  <BrainCircuit className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  <span className="text-[10px] font-semibold">
                    AI suggests {parseDescription(selectedActivity.description).aiSuggestedCredits || 2} credits based on category "{selectedActivity.category}" and institutional NAAC criteria.
                  </span>
                </div>
              </div>

              {/* Credits slider */}
              {isApproveModal && (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-orange-300/50 uppercase tracking-wider flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-orange-500" />
                    Assign Credits (1 – 5)
                  </label>
                  <div className="flex items-center gap-3">
                    <input type="range" min="1" max="5" step="1" value={credits}
                      onChange={(e) => setCredits(parseInt(e.target.value))}
                      className="flex-1 accent-orange-500" />
                    <span className="text-xl font-black text-orange-400 w-8 text-center">{credits}</span>
                  </div>
                  <div className="flex justify-between text-[10px] text-orange-300/30 font-medium px-1">
                    {[1,2,3,4,5].map(n => <span key={n}>{n}</span>)}
                  </div>
                </div>
              )}

              {/* Feedback */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-orange-300/50 uppercase tracking-wider flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-orange-500" />
                  Feedback / Comments (Sent to Student)
                </label>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  rows={3}
                  placeholder="Write feedback for the student..."
                  className="w-full px-4 py-3 bg-black/30 border border-orange-500/15 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/40 text-white text-sm resize-none transition placeholder-orange-300/20"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 pb-6 flex justify-end gap-3">
              <button onClick={() => setSelectedActivity(null)}
                className="px-5 py-2.5 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white rounded-xl text-xs font-bold cursor-pointer transition border border-white/8">
                Cancel
              </button>
              <button onClick={handleSubmitReview} disabled={submitting}
                className={`px-6 py-2.5 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50 transition ${isApproveModal ? "bg-emerald-700 hover:bg-emerald-600" : "bg-red-700 hover:bg-red-600"}`}>
                {submitting ? <><Loader2 className="w-3.5 h-3.5 animate-spin" />Submitting...</> : <><CheckCircle2 className="w-3.5 h-3.5" />Confirm Decision</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default FacultyDashboard;