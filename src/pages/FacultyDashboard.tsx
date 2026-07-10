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
  Loader2,
  BrainCircuit,
  Clock,
  AlertTriangle,
  RefreshCw,
  FileText,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";

function FacultyDashboard() {
  const navigate = useNavigate();
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedActivity, setSelectedActivity] = useState<any | null>(null);
  
  // Tab-based choice directly in split pane: "approve" or "reject"
  const [reviewAction, setReviewAction] = useState<"approve" | "reject">("approve");
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

  async function loadPendingActivities(selectId?: string) {
    setLoading(true);
    setErrorMsg("");
    try {
      const { data, error } = await fetchAllPendingActivities();
      if (error) {
        setErrorMsg("Unable to fetch submissions. Check Supabase RLS policies.");
      } else if (data) {
        setActivities(data);
        if (data.length > 0) {
          const nextSelect = data.find((a) => a.id === selectId) || data[0];
          setSelectedActivity(nextSelect);
          const meta = parseDescription(nextSelect.description);
          setCredits(meta.aiSuggestedCredits || 2);
          setFeedback(reviewAction === "approve"
            ? `Excellent effort! Certificate verified. Great work on completing "${nextSelect.title}".`
            : `Rejection notice: The certificate for "${nextSelect.title}" could not be verified. Please re-upload with proper documentation.`
          );
        } else {
          setSelectedActivity(null);
        }
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  }

  const handleSelectActivity = (act: any) => {
    setSelectedActivity(act);
    const meta = parseDescription(act.description);
    setCredits(meta.aiSuggestedCredits || 2);
    setFeedback(reviewAction === "approve"
      ? `Excellent effort! Certificate verified. Great work on completing "${act.title}".`
      : `Rejection notice: The certificate for "${act.title}" could not be verified. Please re-upload with proper documentation.`
    );
  };

  const handleActionToggle = (action: "approve" | "reject") => {
    setReviewAction(action);
    if (!selectedActivity) return;
    setFeedback(action === "approve"
      ? `Excellent effort! Certificate verified. Great work on completing "${selectedActivity.title}".`
      : `Rejection notice: The certificate for "${selectedActivity.title}" could not be verified. Please re-upload with proper documentation.`
    );
  };

  const handleSubmitReview = async () => {
    if (!selectedActivity) return;
    setSubmitting(true);
    try {
      const finalStatus = reviewAction === "approve" ? "approved" : "rejected";
      const finalCredits = reviewAction === "approve" ? credits : null;
      const { error } = await updateActivityStatus(selectedActivity.id, finalStatus, finalCredits, feedback);
      if (error) {
        alert("Failed to update: " + (error as any).message);
      } else {
        // Load fresh list and auto-select next
        const currentIdx = activities.findIndex((a) => a.id === selectedActivity.id);
        const nextId = activities[currentIdx + 1]?.id || activities[currentIdx - 1]?.id;
        await loadPendingActivities(nextId);
      }
    } catch (err: any) {
      alert(err.message || "An error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  const inputCls = "w-full px-4 py-3 bg-black/45 border border-orange-500/15 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500/30 text-white text-xs transition-all duration-300 placeholder-orange-300/25";
  const labelCls = "text-[10px] font-black text-orange-300/50 uppercase tracking-widest block mb-1";

  if (loading && activities.length === 0) {
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
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-orange-500/10 border border-orange-500/20 rounded-full text-xs font-semibold text-orange-300 mb-3">
                <GraduationCap className="w-3.5 h-3.5" />
                Faculty Review Panel (Faculty View)
              </div>
              <h1 className="text-xl md:text-2xl font-extrabold mb-1">Activity Approval Dashboard</h1>
              <p className="text-orange-200/50 text-sm">
                Verify student certificates in real-time. Review split-pane documents below.
              </p>
            </div>
            
            <button onClick={() => loadPendingActivities()}
              className="flex items-center gap-1.5 text-xs text-orange-400 font-bold bg-orange-500/10 hover:bg-orange-500/20 px-4 py-2.5 rounded-xl border border-orange-500/20 cursor-pointer transition shrink-0">
              <RefreshCw className="w-3.5 h-3.5" />
              Refresh Submissions
            </button>
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
          </div>
        )}

        {activities.length === 0 ? (
          <div className="bg-[#0e0a04] border border-orange-500/15 rounded-3xl p-20 text-center space-y-4 shadow-lg shadow-black/40">
            <CheckCircle2 className="w-16 h-16 text-orange-500/15 mx-auto animate-pulse" />
            <h3 className="text-lg font-bold text-orange-300/50">All Caught Up!</h3>
            <p className="text-sm text-orange-300/30 max-w-sm mx-auto">No pending student activities to review. Fresh uploads will appear here automatically.</p>
          </div>
        ) : (
          /* ── SPLIT-PANE VIEW ── */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            
            {/* LEFT COLUMN: Queue list (5 cols) */}
            <div className="lg:col-span-5 bg-[#0e0a04] border border-orange-500/15 rounded-3xl shadow-lg shadow-black/40 p-6 flex flex-col max-h-[640px]">
              <div className="flex items-center justify-between border-b border-orange-500/10 pb-4 mb-4">
                <div>
                  <h2 className="text-sm font-bold text-white uppercase tracking-wider">Submissions Queue</h2>
                  <span className="text-[10px] text-orange-300/40 font-semibold">{activities.length} pending review</span>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto space-y-3 pr-1 scrollbar-thin scrollbar-thumb-orange-500/20">
                {activities.map((act) => {
                  const student = act.profiles;
                  const isSelected = selectedActivity?.id === act.id;
                  return (
                    <div
                      key={act.id}
                      onClick={() => handleSelectActivity(act)}
                      className={`p-3.5 rounded-2xl border transition duration-300 cursor-pointer text-left ${
                        isSelected
                          ? "bg-orange-500/10 border-orange-500/40 shadow-lg shadow-orange-500/5"
                          : "bg-black/35 border-white/5 hover:border-orange-500/20"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-gradient-to-tr from-[#D7263D] via-[#FF6A00] to-[#FFC247] rounded-xl flex items-center justify-center text-white font-black text-xs shrink-0">
                          {student?.full_name?.charAt(0)?.toUpperCase() || "S"}
                        </div>
                        <div className="min-w-0 flex-1">
                          <span className="block text-xs font-bold text-white truncate">{student?.full_name || "Unknown"}</span>
                          <span className="block text-[9px] text-orange-300/40 truncate">{student?.register_no || "—"} · {student?.department || "—"}</span>
                          <span className="block text-xs font-semibold text-orange-300/70 truncate mt-1">{act.title}</span>
                        </div>
                        <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* RIGHT COLUMN: Active Review Console (7 cols) */}
            <div className="lg:col-span-7 bg-[#0e0a04] border border-orange-500/15 rounded-3xl shadow-lg shadow-black/40 p-6 flex flex-col justify-between max-h-[640px] overflow-y-auto">
              {selectedActivity ? (
                <div className="space-y-5 flex-1 flex flex-col justify-between">
                  <div className="space-y-4">
                    {/* User profile banner */}
                    <div className="flex items-center justify-between border-b border-orange-500/10 pb-4">
                      <div>
                        <span className="block text-[9px] text-orange-400 font-bold uppercase tracking-wider">Currently Reviewing</span>
                        <h2 className="text-base font-bold text-white mt-0.5">{selectedActivity.profiles?.full_name || "Unknown student"}</h2>
                        <span className="text-[10px] text-orange-300/40">{selectedActivity.profiles?.register_no} · {selectedActivity.profiles?.department} · Year {selectedActivity.profiles?.year}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 bg-orange-500/5 border border-orange-500/15 px-3 py-1.5 rounded-xl text-orange-400 text-xs font-bold">
                        <Award className="w-4 h-4" />
                        {selectedActivity.category}
                      </div>
                    </div>

                    {/* Certificate Preview Frame */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center">
                        <span className={labelCls}>Verified Document Attachment</span>
                        <a href={selectedActivity.certificate_url} target="_blank" rel="noreferrer"
                          className="text-[9px] font-bold text-orange-400 hover:underline flex items-center gap-0.5">
                          View full page <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                      <div className="w-full h-44 bg-black/40 border border-white/5 rounded-2xl overflow-hidden relative">
                        {selectedActivity.certificate_url?.toLowerCase().includes(".pdf") ? (
                          <iframe
                            src={`${selectedActivity.certificate_url}#toolbar=0&navpanes=0`}
                            className="w-full h-full border-none pointer-events-none"
                            title="Certificate PDF"
                          />
                        ) : (
                          <img
                            src={selectedActivity.certificate_url}
                            alt="Certificate attachment"
                            className="w-full h-full object-contain"
                          />
                        )}
                      </div>
                    </div>

                    {/* AI OCR parser analysis */}
                    {(() => {
                      const meta = parseDescription(selectedActivity.description);
                      return (
                        <div className="bg-orange-500/5 border border-orange-500/10 p-3.5 rounded-2xl flex gap-3 text-xs">
                          <BrainCircuit className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
                          <div className="space-y-1">
                            <div className="font-bold text-orange-300">AI Suggested Assessment</div>
                            <p className="text-[10px] text-orange-300/60 leading-relaxed">
                              Extracted from certificate: Completed <strong>"{selectedActivity.title}"</strong> at <strong>"{meta.organization || "Private Institution"}"</strong>.
                            </p>
                            <div className="flex gap-4 pt-1 text-[10px] font-semibold">
                              <span className="text-emerald-400">Confidence Score: {meta.aiConfidence || 85}%</span>
                              <span className="text-orange-400">Target Credit Weight: {meta.aiSuggestedCredits || 2} pts</span>
                            </div>
                          </div>
                        </div>
                      );
                    })()}

                    {/* Review Form Options */}
                    <div className="space-y-4">
                      {/* Action selector tabs */}
                      <div className="grid grid-cols-2 gap-2 bg-white/[0.02] p-1 rounded-xl border border-white/5">
                        <button
                          type="button"
                          onClick={() => handleActionToggle("approve")}
                          className={`py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all duration-300 cursor-pointer ${
                            reviewAction === "approve"
                              ? "bg-emerald-950/80 text-emerald-400 border border-emerald-500/20 shadow-md shadow-emerald-950/30"
                              : "text-orange-300/30 hover:text-orange-300/60"
                          }`}
                        >
                          <ThumbsUp className="w-3.5 h-3.5" />
                          Approve Submission
                        </button>
                        <button
                          type="button"
                          onClick={() => handleActionToggle("reject")}
                          className={`py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all duration-300 cursor-pointer ${
                            reviewAction === "reject"
                              ? "bg-red-950/80 text-red-400 border border-red-500/20 shadow-md shadow-red-950/30"
                              : "text-orange-300/30 hover:text-orange-300/60"
                          }`}
                        >
                          <ThumbsDown className="w-3.5 h-3.5" />
                          Decline Submission
                        </button>
                      </div>

                      {/* Credit form input */}
                      {reviewAction === "approve" && (
                        <div>
                          <label className={labelCls}>Award NAAC Credits (1 to 5) *</label>
                          <div className="flex items-center gap-3">
                            <input
                              type="number"
                              min="1"
                              max="5"
                              value={credits}
                              onChange={(e) => setCredits(parseInt(e.target.value) || 1)}
                              className={inputCls + " max-w-[80px] text-center font-bold"}
                            />
                            <span className="text-[10px] text-orange-300/30">Suggested credits based on university accreditation rules</span>
                          </div>
                        </div>
                      )}

                      {/* Feedback box */}
                      <div>
                        <label className={labelCls}>Remarks & Comments</label>
                        <textarea
                          rows={2}
                          value={feedback}
                          onChange={(e) => setFeedback(e.target.value)}
                          placeholder="Add feedback for the student..."
                          className={inputCls + " resize-none"}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Submission buttons */}
                  <div className="pt-4 border-t border-orange-500/10 flex justify-end">
                    <button
                      onClick={handleSubmitReview}
                      disabled={submitting}
                      className="px-6 py-2.5 bg-gradient-to-r from-[#D7263D] via-[#FF6A00] to-[#FFC247] text-white font-bold rounded-xl text-xs hover:brightness-110 shadow-lg shadow-orange-900/30 disabled:opacity-50 transition cursor-pointer flex items-center gap-1.5"
                    >
                      {submitting ? (
                        <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Submitting...</>
                      ) : reviewAction === "approve" ? (
                        <><CheckCircle2 className="w-3.5 h-3.5" /> Confirm Approval</>
                      ) : (
                        <><XCircle className="w-3.5 h-3.5" /> Decline Activity</>
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center py-20 space-y-2">
                  <FileText className="w-12 h-12 text-orange-500/20" />
                  <span className="text-xs font-bold text-orange-300/40">Select a submission from the queue to start review</span>
                </div>
              )}
            </div>

          </div>
        )}

      </div>
    </div>
  );
}

export default FacultyDashboard;