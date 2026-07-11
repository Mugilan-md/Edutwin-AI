import { useState, useEffect } from "react";
import { fetchAllPendingActivities, updateActivityStatus, parseDescription } from "../services/activityService";
import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";
import { getProfile } from "../services/profileService";
import {
  CheckCircle2, XCircle, ExternalLink, GraduationCap, Award, Loader2,
  BrainCircuit, Clock, AlertTriangle, RefreshCw, FileText,
  ThumbsUp, ThumbsDown,
} from "lucide-react";

function FacultyDashboard() {
  const navigate = useNavigate();
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedActivity, setSelectedActivity] = useState<any | null>(null);
  const [reviewAction, setReviewAction] = useState<"approve" | "reject">("approve");
  const [feedback, setFeedback] = useState("");
  const [credits, setCredits] = useState(2);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    async function init() {
      try {
        const { data: prof } = await getProfile();
        if (!prof || prof.role === "student") { navigate("/student"); return; }
        await loadPendingActivities();
      } catch (e) { console.error(e); setLoading(false); }
    }
    init();
  }, []);

  async function loadPendingActivities(selectId?: string) {
    setLoading(true);
    setErrorMsg("");
    try {
      const { data, error } = await fetchAllPendingActivities();
      if (error) { setErrorMsg("Unable to fetch submissions. Check Supabase RLS policies."); }
      else if (data) {
        setActivities(data);
        if (data.length > 0) {
          const next = data.find((a) => a.id === selectId) || data[0];
          setSelectedActivity(next);
          const meta = parseDescription(next.description);
          setCredits(meta.aiSuggestedCredits || 2);
          setFeedback(`Certificate verified. Great work on completing "${next.title}".`);
        } else { setSelectedActivity(null); }
      }
    } catch (err) { setErrorMsg("An unexpected error occurred."); } finally { setLoading(false); }
  }

  const handleSelectActivity = (act: any) => {
    setSelectedActivity(act);
    const meta = parseDescription(act.description);
    setCredits(meta.aiSuggestedCredits || 2);
    setFeedback(reviewAction === "approve"
      ? `Certificate verified. Great work on completing "${act.title}".`
      : `The certificate for "${act.title}" could not be verified. Please re-upload with proper documentation.`
    );
  };

  const handleActionToggle = (action: "approve" | "reject") => {
    setReviewAction(action);
    if (!selectedActivity) return;
    setFeedback(action === "approve"
      ? `Certificate verified. Great work on completing "${selectedActivity.title}".`
      : `The certificate for "${selectedActivity.title}" could not be verified. Please re-upload.`
    );
  };

  const handleSubmitReview = async () => {
    if (!selectedActivity) return;
    setSubmitting(true);
    try {
      const finalStatus = reviewAction === "approve" ? "approved" : "rejected";
      const finalCredits = reviewAction === "approve" ? credits : null;
      const { error } = await updateActivityStatus(selectedActivity.id, finalStatus, finalCredits, feedback);
      if (error) { alert("Failed to update: " + (error as any).message); }
      else {
        const currentIdx = activities.findIndex((a) => a.id === selectedActivity.id);
        const nextId = activities[currentIdx + 1]?.id || activities[currentIdx - 1]?.id;
        await loadPendingActivities(nextId);
      }
    } catch (err: any) { alert(err.message || "An error occurred"); } finally { setSubmitting(false); }
  };

  if (loading && activities.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#eef4ff] to-[#f0f7ff] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          <span className="text-sm font-semibold text-slate-500">Loading Student Submissions...</span>
        </div>
      </div>
    );
  }

  const inputCls = "w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400/30 focus:border-blue-400 text-slate-800 text-xs transition-all placeholder-slate-300";

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#eef4ff] via-[#f0f7ff] to-[#e8f0fe] pb-16">
      <Navbar forcedRole="faculty" />
      <div className="pt-24 px-4 max-w-6xl mx-auto space-y-6">

        {/* Header */}
        <div className="glass-card-strong rounded-3xl p-6 md:p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-50 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 border border-emerald-200 rounded-full text-xs font-bold text-emerald-700 mb-3">
                <GraduationCap className="w-3.5 h-3.5" />
                Faculty Review Panel
              </div>
              <h1 className="text-2xl font-black text-slate-900">Activity Approval Dashboard</h1>
              <p className="text-slate-500 text-sm mt-1">Verify student certificates in real-time using the split-pane console below.</p>
            </div>
            <button onClick={() => loadPendingActivities()}
              className="flex items-center gap-1.5 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 px-4 py-2.5 rounded-xl border border-blue-100 cursor-pointer transition shrink-0">
              <RefreshCw className="w-3.5 h-3.5" />
              Refresh Submissions
            </button>
          </div>
        </div>

        {/* Error */}
        {errorMsg && (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3 text-sm text-amber-700">
            <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div><span className="font-bold block">Note:</span>{errorMsg}</div>
          </div>
        )}

        {activities.length === 0 ? (
          <div className="glass-card-strong rounded-3xl p-20 text-center space-y-4">
            <CheckCircle2 className="w-14 h-14 text-emerald-300 mx-auto animate-pulse" />
            <h3 className="text-lg font-bold text-slate-600">All Caught Up!</h3>
            <p className="text-sm text-slate-400 max-w-sm mx-auto">No pending activities to review. New student uploads will appear here automatically.</p>
          </div>
        ) : (
          /* SPLIT-PANE */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">

            {/* Left: Queue */}
            <div className="lg:col-span-5 glass-card-strong rounded-3xl p-5 flex flex-col max-h-[640px]">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
                <div>
                  <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Submissions Queue</h2>
                  <span className="text-[10px] text-slate-400 font-semibold">{activities.length} pending review</span>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
                {activities.map((act) => {
                  const student = act.profiles;
                  const isSelected = selectedActivity?.id === act.id;
                  return (
                    <div key={act.id} onClick={() => handleSelectActivity(act)}
                      className={`p-3.5 rounded-2xl border transition-all duration-200 cursor-pointer ${
                        isSelected
                          ? "bg-blue-50 border-blue-200 shadow-md shadow-blue-100"
                          : "bg-white border-slate-100 hover:border-blue-100 hover:bg-blue-50/40"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-gradient-to-tr from-blue-600 to-sky-400 rounded-xl flex items-center justify-center text-white font-black text-xs shrink-0">
                          {student?.full_name?.charAt(0)?.toUpperCase() || "S"}
                        </div>
                        <div className="min-w-0 flex-1">
                          <span className="block text-xs font-bold text-slate-800 truncate">{student?.full_name || "Unknown"}</span>
                          <span className="block text-[9px] text-slate-400 truncate">{student?.register_no || "—"} · {student?.department || "—"}</span>
                          <span className="block text-xs font-semibold text-blue-700 truncate mt-0.5">{act.title}</span>
                        </div>
                        <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right: Review Console */}
            <div className="lg:col-span-7 glass-card-strong rounded-3xl p-6 flex flex-col justify-between max-h-[640px] overflow-y-auto">
              {selectedActivity ? (
                <div className="space-y-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                      <div>
                        <span className="block text-[9px] text-blue-600 font-bold uppercase tracking-wider">Currently Reviewing</span>
                        <h2 className="text-base font-bold text-slate-900 mt-0.5">{selectedActivity.profiles?.full_name || "Unknown student"}</h2>
                        <span className="text-[10px] text-slate-400">{selectedActivity.profiles?.register_no} · {selectedActivity.profiles?.department} · Year {selectedActivity.profiles?.year}</span>
                      </div>
                      <div className="flex items-center gap-2 bg-blue-50 border border-blue-100 px-3 py-1.5 rounded-xl text-blue-700 text-xs font-bold">
                        <Award className="w-4 h-4" />
                        {selectedActivity.category}
                      </div>
                    </div>

                    {/* Certificate Preview */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Document Attachment</span>
                        <a href={selectedActivity.certificate_url} target="_blank" rel="noreferrer"
                          className="text-[9px] font-bold text-blue-600 hover:underline flex items-center gap-0.5">
                          Full page <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                      <div className="w-full h-44 bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden">
                        {selectedActivity.certificate_url?.toLowerCase().includes(".pdf") ? (
                          <iframe src={`${selectedActivity.certificate_url}#toolbar=0&navpanes=0`} className="w-full h-full border-none pointer-events-none" title="Certificate PDF" />
                        ) : (
                          <img src={selectedActivity.certificate_url} alt="Certificate" className="w-full h-full object-contain" />
                        )}
                      </div>
                    </div>

                    {/* AI Analysis */}
                    {(() => {
                      const meta = parseDescription(selectedActivity.description);
                      return (
                        <div className="bg-blue-50 border border-blue-100 p-3.5 rounded-2xl flex gap-3 text-xs">
                          <BrainCircuit className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                          <div className="space-y-1">
                            <div className="font-bold text-blue-800">AI Assessment Analysis</div>
                            <p className="text-[10px] text-blue-600/80">
                              Extracted: <strong>"{selectedActivity.title}"</strong> at <strong>"{meta.organization || "Institution"}"</strong>.
                            </p>
                            <div className="flex gap-4 pt-0.5 text-[10px] font-semibold">
                              <span className="text-emerald-600">Confidence: {meta.aiConfidence || 85}%</span>
                              <span className="text-blue-600">Suggested Credits: {meta.aiSuggestedCredits || 2} pts</span>
                            </div>
                          </div>
                        </div>
                      );
                    })()}

                    {/* Action Tabs */}
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-xl">
                        <button type="button" onClick={() => handleActionToggle("approve")}
                          className={`py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                            reviewAction === "approve"
                              ? "bg-white text-emerald-700 shadow-sm border border-emerald-200"
                              : "text-slate-500 hover:text-slate-700"
                          }`}>
                          <ThumbsUp className="w-3.5 h-3.5" /> Approve
                        </button>
                        <button type="button" onClick={() => handleActionToggle("reject")}
                          className={`py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                            reviewAction === "reject"
                              ? "bg-white text-red-600 shadow-sm border border-red-200"
                              : "text-slate-500 hover:text-slate-700"
                          }`}>
                          <ThumbsDown className="w-3.5 h-3.5" /> Decline
                        </button>
                      </div>

                      {reviewAction === "approve" && (
                        <div>
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Award NAAC Credits (1-5)</label>
                          <input type="number" min="1" max="5" value={credits} onChange={(e) => setCredits(parseInt(e.target.value) || 1)}
                            className={inputCls + " max-w-[80px] text-center font-bold"} />
                        </div>
                      )}

                      <div>
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Faculty Remarks</label>
                        <textarea rows={2} value={feedback} onChange={(e) => setFeedback(e.target.value)}
                          placeholder="Add feedback for the student..." className={inputCls + " resize-none"} />
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex justify-end">
                    <button onClick={handleSubmitReview} disabled={submitting}
                      className="btn-primary text-xs flex items-center gap-1.5 disabled:opacity-50">
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
                  <FileText className="w-12 h-12 text-slate-200" />
                  <span className="text-xs font-bold text-slate-400">Select a submission from the queue to start reviewing</span>
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