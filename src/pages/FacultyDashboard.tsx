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

  useEffect(() => {
    loadPendingActivities();
  }, []);

  async function loadPendingActivities() {
    setLoading(true);
    setErrorMsg("");
    try {
      const { data, error } = await fetchAllPendingActivities();
      if (error) {
        setErrorMsg("Unable to fetch submissions. Check Supabase RLS policies.");
      } else if (data) {
        setActivities(data);
      }
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

      const { error } = await updateActivityStatus(
        selectedActivity.id,
        finalStatus,
        finalCredits,
        feedback
      );

      if (error) {
        alert("Failed to update: " + (error as any).message);
      } else {
        setSelectedActivity(null);
        await loadPendingActivities();
      }
    } catch (err: any) {
      alert(err.message || "An error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
          <span className="text-sm font-semibold text-gray-500">Loading Student Submissions...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <Navbar forcedRole="faculty" />

      <div className="pt-28 px-4 max-w-6xl mx-auto space-y-8">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-indigo-950 via-indigo-900 to-violet-950 text-white rounded-3xl p-8 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[250px] h-[250px] bg-indigo-500/10 rounded-full blur-3xl"></div>
          <div className="relative z-10 space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 rounded-full text-xs font-semibold text-indigo-200 mb-2">
              <GraduationCap className="w-3.5 h-3.5" />
              Faculty Review Panel
            </div>
            <h1 className="text-2xl font-extrabold">Activity Approval Dashboard</h1>
            <p className="text-indigo-200 text-sm">
              Review, verify, and assign academic credits to student achievement submissions.
            </p>
          </div>
          <div className="relative z-10 flex items-center gap-3 bg-white/10 border border-white/20 rounded-2xl px-5 py-3">
            <Clock className="w-6 h-6 text-amber-300" />
            <div>
              <span className="block text-2xl font-black">{activities.length}</span>
              <span className="block text-xs text-indigo-200">Pending Reviews</span>
            </div>
          </div>
        </div>

        {errorMsg && (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center gap-3 text-sm text-amber-800">
            <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
            <div>
              <span className="font-bold block">Note:</span>
              {errorMsg} — Make sure the Supabase RLS policy allows faculty to read all activities.
            </div>
            <button onClick={loadPendingActivities} className="ml-auto shrink-0 flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer">
              <RefreshCw className="w-3.5 h-3.5" /> Retry
            </button>
          </div>
        )}

        {/* Pending Activities Table */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
          <div className="flex items-center justify-between border-b border-gray-100 pb-5 mb-6">
            <div>
              <h2 className="text-lg font-bold text-gray-800">Pending Submissions</h2>
              <p className="text-xs text-gray-400 mt-0.5">Click Approve or Decline to review each submission. AI credit values are pre-suggested.</p>
            </div>
            <button
              onClick={loadPendingActivities}
              className="flex items-center gap-1.5 text-xs text-indigo-600 font-bold bg-indigo-50 hover:bg-indigo-100 px-3 py-2 rounded-xl border border-indigo-100 cursor-pointer transition"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Refresh
            </button>
          </div>

          {activities.length === 0 ? (
            <div className="py-20 text-center space-y-3">
              <CheckCircle2 className="w-16 h-16 text-emerald-100 mx-auto" />
              <h3 className="text-lg font-bold text-gray-600">All Caught Up!</h3>
              <p className="text-sm text-gray-400">No pending submissions. All student activities have been reviewed.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-100">
                    {["Student", "Achievement", "Category", "AI Recommendation", "Certificate", "Actions"].map((h) => (
                      <th key={h} className="pb-3 pr-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {activities.map((act) => {
                    const student = act.profiles;
                    const meta = parseDescription(act.description);
                    return (
                      <tr key={act.id} className="hover:bg-gray-50/50 transition duration-150">
                        <td className="py-4 pr-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-gradient-to-tr from-indigo-100 to-violet-100 rounded-xl flex items-center justify-center text-indigo-700 font-black text-sm shrink-0">
                              {student?.full_name?.charAt(0)?.toUpperCase() || "S"}
                            </div>
                            <div>
                              <span className="block text-sm font-bold text-gray-800 whitespace-nowrap">{student?.full_name || "Unknown Student"}</span>
                              <span className="block text-[10px] text-gray-400">{student?.register_no || "—"} · {student?.department || "—"}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 pr-4 max-w-[200px]">
                          <span className="block text-sm font-bold text-gray-800 truncate">{act.title}</span>
                          <span className="block text-[10px] text-gray-400 truncate">{meta.organization || "—"}</span>
                        </td>
                        <td className="py-4 pr-4">
                          <span className="text-[11px] bg-indigo-50 text-indigo-700 font-semibold px-2.5 py-1 rounded-full whitespace-nowrap">{act.category}</span>
                        </td>
                        <td className="py-4 pr-4">
                          <div className="flex items-center gap-1.5">
                            <BrainCircuit className="w-4 h-4 text-violet-500 shrink-0" />
                            <div>
                              <span className="block text-xs font-bold text-gray-700">{meta.aiSuggestedCredits || 2} Credits</span>
                              <span className="block text-[10px] text-emerald-600 font-semibold">{meta.aiConfidence || 80}% AI Confidence</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 pr-4">
                          <a
                            href={act.certificate_url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] text-indigo-600 hover:text-indigo-800 font-bold bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1.5 rounded-lg transition whitespace-nowrap"
                          >
                            <ExternalLink className="w-3 h-3" />
                            View
                          </a>
                        </td>
                        <td className="py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleOpenReview(act, true)}
                              className="flex items-center gap-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Approve
                            </button>
                            <button
                              onClick={() => handleOpenReview(act, false)}
                              className="flex items-center gap-1 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              Decline
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
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">

            {/* Modal Header */}
            <div className={`p-6 text-white ${isApproveModal ? "bg-gradient-to-r from-emerald-600 to-teal-600" : "bg-gradient-to-r from-red-600 to-rose-600"}`}>
              <div className="flex items-center justify-between">
                <div>
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-white/70">Activity Verification</span>
                  <h3 className="text-lg font-bold">{isApproveModal ? "✅ Approve Activity" : "❌ Decline Activity"}</h3>
                </div>
                <button onClick={() => setSelectedActivity(null)} className="text-white/70 hover:text-white text-xl cursor-pointer font-bold">✕</button>
              </div>
            </div>

            <div className="p-6 space-y-5">
              {/* Activity Detail */}
              <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-500 font-medium">Student</span>
                  <span className="font-bold text-gray-800">{selectedActivity.profiles?.full_name || "Unknown"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 font-medium">Register No.</span>
                  <span className="font-bold text-gray-800">{selectedActivity.profiles?.register_no || "—"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 font-medium">Achievement</span>
                  <span className="font-bold text-gray-800 max-w-[60%] text-right truncate">{selectedActivity.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 font-medium">Category</span>
                  <span className="font-semibold text-indigo-700">{selectedActivity.category}</span>
                </div>
                {/* AI Rec box */}
                <div className="mt-2 pt-2 border-t border-gray-200 flex items-start gap-2 text-violet-700">
                  <BrainCircuit className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  <span className="text-[10px] font-semibold">
                    AI suggests {parseDescription(selectedActivity.description).aiSuggestedCredits || 2} credits based on category "{selectedActivity.category}" and institutional NAAC criteria.
                  </span>
                </div>
              </div>

              {/* Credits (approve only) */}
              {isApproveModal && (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-indigo-500" />
                    Assign Credits (1 – 5)
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range" min="1" max="5" step="1"
                      value={credits}
                      onChange={(e) => setCredits(parseInt(e.target.value))}
                      className="flex-1 accent-indigo-600"
                    />
                    <span className="text-xl font-black text-indigo-600 w-8 text-center">{credits}</span>
                  </div>
                  <div className="flex justify-between text-[10px] text-gray-400 font-medium px-1">
                    {[1,2,3,4,5].map(n => <span key={n}>{n}</span>)}
                  </div>
                </div>
              )}

              {/* Feedback */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-indigo-500" />
                  Feedback / Comments (Sent to Student)
                </label>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  rows={3}
                  placeholder="Write feedback for the student..."
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-800 text-sm resize-none transition"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 pb-6 flex justify-end gap-3">
              <button onClick={() => setSelectedActivity(null)} className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl text-xs font-bold cursor-pointer transition">
                Cancel
              </button>
              <button
                onClick={handleSubmitReview}
                disabled={submitting}
                className={`px-6 py-2.5 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50 transition ${isApproveModal ? "bg-emerald-600 hover:bg-emerald-700" : "bg-red-600 hover:bg-red-700"}`}
              >
                {submitting ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Submitting...</> : <><CheckCircle2 className="w-3.5 h-3.5" /> Confirm Decision</>}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

export default FacultyDashboard;