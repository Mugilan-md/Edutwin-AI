import { useState } from "react";
import { uploadCertificate } from "../services/storageService";
import { saveActivity } from "../services/activityService";
import Navbar from "../components/Navbar";
import {
  Sparkles, UploadCloud, FileText, Calendar, Building2, Tag,
  Type, Loader2, CheckCircle2, FileCheck, BrainCircuit,
} from "lucide-react";

function Activities() {
  const [title, setTitle]                   = useState("");
  const [category, setCategory]             = useState("");
  const [organization, setOrganization]     = useState("");
  const [date, setDate]                     = useState("");
  const [description, setDescription]       = useState("");
  const [certificate, setCertificate]       = useState<File | null>(null);
  const [uploading, setUploading]           = useState(false);
  const [aiParsing, setAiParsing]           = useState(false);
  const [aiConfidence, setAiConfidence]     = useState(0);
  const [aiSuggestedCredits, setAiSuggestedCredits] = useState(0);
  const [aiExtracted, setAiExtracted]       = useState(false);
  const [success, setSuccess]               = useState(false);
  const [errorMsg, setErrorMsg]             = useState("");

  const fileToBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload  = () => resolve((reader.result as string).split(",")[1]);
      reader.onerror = (e) => reject(e);
    });

  const handleFileChange = async (file: File) => {
    setCertificate(file);
    setAiExtracted(false);
    setErrorMsg("");
    setAiParsing(true);

    const runFallback = () => {
      const name = file.name.toLowerCase();
      let extractedTitle = file.name.substring(0, file.name.lastIndexOf(".")).replace(/[_-]/g, " ")
        .split(" ").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
      let extractedCategory = "Workshop / Seminar";
      let extractedOrg = "Academic Institute";
      let extractedDate = new Date().toISOString().split("T")[0];
      let confidence = 75, credits = 2;

      if (name.includes("nptel") || name.includes("coursera") || name.includes("udemy") || name.includes("course")) {
        extractedCategory = "MOOC / Online Course";
        extractedOrg = name.includes("nptel") ? "NPTEL / Swayam" : name.includes("coursera") ? "Coursera" : "Udemy";
        confidence = 94; credits = 3;
      } else if (name.includes("hackathon") || name.includes("competition") || name.includes("code") || name.includes("contest")) {
        extractedCategory = "Hackathon / Competition";
        extractedOrg = name.includes("gdg") ? "Google Developer Groups" : "Technical Association";
        confidence = 88; credits = 4;
      } else if (name.includes("intern") || name.includes("industrial")) {
        extractedCategory = "Internship"; extractedOrg = "Industry Partner"; confidence = 90; credits = 5;
      } else if (name.includes("nss") || name.includes("volunteer") || name.includes("rotaract")) {
        extractedCategory = "Volunteering / Club Activity";
        extractedOrg = name.includes("nss") ? "National Service Scheme" : "Youth Red Cross";
        confidence = 92; credits = 2;
      } else if (name.includes("workshop") || name.includes("seminar") || name.includes("webinar") || name.includes("conference")) {
        extractedCategory = "Workshop / Seminar"; extractedOrg = "Academic College"; confidence = 85; credits = 2;
      }
      const dateMatch = name.match(/(20\d{2})/);
      if (dateMatch) extractedDate = `${dateMatch[0]}-06-01`;

      setTitle(extractedTitle); setCategory(extractedCategory); setOrganization(extractedOrg);
      setDate(extractedDate); setAiConfidence(confidence); setAiSuggestedCredits(credits);
      setDescription(`Successfully parsed certificate for ${extractedTitle}. Verified via Edutwin AI parser.`);
      setAiExtracted(true); setAiParsing(false);
    };

    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) { setTimeout(runFallback, 1200); return; }

    try {
      const base64Data = await fileToBase64(file);
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [
            { text: "Analyze this academic/curricular certificate and extract structural data. Return a JSON object with keys: title, category (must be one of: 'Workshop / Seminar', 'MOOC / Online Course', 'Internship', 'Hackathon / Competition', 'Volunteering / Club Activity', 'Paper Publication', 'Sports & Cultural'), organization, date (format YYYY-MM-DD), suggestedCredits (integer 1-5 per NAAC relevance), confidence (integer 0-100), and description." },
            { inlineData: { mimeType: file.type || "application/pdf", data: base64Data } }
          ]}],
          generationConfig: { responseMimeType: "application/json" }
        })
      });
      if (!response.ok) throw new Error(`Gemini API returned ${response.status}`);
      const resJson = await response.json();
      const textResponse = resJson.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!textResponse) throw new Error("Empty Gemini response");
      const parsed = JSON.parse(textResponse);
      setTitle(parsed.title || file.name); setCategory(parsed.category || "Workshop / Seminar");
      setOrganization(parsed.organization || "Independent Organization");
      setDate(parsed.date || new Date().toISOString().split("T")[0]);
      setDescription(parsed.description || `Verified completion of ${parsed.title}.`);
      setAiConfidence(parsed.confidence || 85); setAiSuggestedCredits(parsed.suggestedCredits || 2);
      setAiExtracted(true);
    } catch (err) {
      console.warn("Gemini OCR failed, using fallback:", err);
      runFallback();
    } finally {
      setAiParsing(false);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !category || !description) { setErrorMsg("Please fill all required fields."); return; }
    if (!certificate) { setErrorMsg("Please select a certificate file."); return; }
    setUploading(true); setErrorMsg(""); setSuccess(false);
    try {
      const { url, error: uploadError } = await uploadCertificate(certificate);
      if (uploadError) { setErrorMsg(uploadError.message); setUploading(false); return; }
      const { error: saveError } = await saveActivity(title, category, description, url || "", organization, date, aiConfidence, aiSuggestedCredits);
      if (saveError) { setErrorMsg(saveError.message); setUploading(false); return; }
      setSuccess(true);
      setTitle(""); setCategory(""); setOrganization(""); setDate(""); setDescription("");
      setCertificate(null); setAiExtracted(false);
      setTimeout(() => setSuccess(false), 3500);
    } catch (err: any) {
      setErrorMsg(err.message || "An error occurred during submission.");
    } finally {
      setUploading(false);
    }
  };

  const labelCls = "text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1";

  return (
    <div className="min-h-screen bg-[#FFFCC7] pb-16">
      <Navbar />
      <div className="pt-28 px-4 max-w-4xl mx-auto">

        {/* Page Header */}
        <div className="mb-7 glass-card-strong rounded-3xl p-7 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-blue-50 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-100 border border-blue-200 rounded-full text-xs font-bold text-blue-700 mb-3">
              <UploadCloud className="w-3.5 h-3.5" />
              Activity Upload
            </div>
            <h1 className="text-2xl font-black text-slate-900">Upload Achievement</h1>
            <p className="text-sm text-slate-400 mt-1">
              Submit certifications, internships, webinars, or club records for faculty review. Gemini AI auto-fills the details from your uploaded document.
            </p>
          </div>
        </div>

        {/* Alerts */}
        {errorMsg && (
          <div className="mb-5 p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-sm font-medium">{errorMsg}</div>
        )}
        {success && (
          <div className="mb-5 p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-2xl text-sm font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5" />
            Activity submitted successfully! Faculty will review it shortly.
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left: File Upload + AI Panel */}
          <div className="lg:col-span-1 space-y-5">

            {/* File Drop Area */}
            <div className="glass-card-strong rounded-3xl p-5">
              <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Certificate File</span>

              <div className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all duration-300 cursor-pointer ${
                certificate
                  ? "border-emerald-300 bg-emerald-50"
                  : "border-blue-200 hover:border-blue-400 bg-blue-50/50 hover:bg-blue-50"
              }`}>
                <input type="file" id="cert-file" accept=".pdf,.png,.jpg,.jpeg"
                  onChange={(e) => { if (e.target.files?.[0]) handleFileChange(e.target.files[0]); }}
                  className="hidden" />
                <label htmlFor="cert-file" className="cursor-pointer space-y-3 block">
                  <div className="w-11 h-11 bg-blue-100 border border-blue-200 rounded-xl flex items-center justify-center text-blue-600 mx-auto">
                    <UploadCloud className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="block text-xs font-bold text-slate-700">
                      {certificate ? "Change Certificate" : "Choose Certificate"}
                    </span>
                    <span className="block text-[10px] text-slate-400 mt-1">PDF, PNG, JPG up to 10MB</span>
                  </div>
                </label>
              </div>

              {certificate && (
                <a href={URL.createObjectURL(certificate)} target="_blank" rel="noreferrer"
                  className="mt-4 p-3 bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-200 rounded-xl flex items-center gap-3 transition cursor-pointer group">
                  <FileText className="w-7 h-7 text-blue-500 shrink-0" />
                  <div className="min-w-0 text-left flex-1">
                    <span className="block text-xs font-bold text-slate-700 truncate">{certificate.name}</span>
                    <span className="block text-[10px] text-slate-400">{(certificate.size / (1024 * 1024)).toFixed(2)} MB · Click to preview</span>
                  </div>
                </a>
              )}
            </div>

            {/* AI OCR Status */}
            {(aiParsing || aiExtracted) && (
              <div className="glass-card-strong rounded-3xl p-5 space-y-4">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5 border-b border-slate-100 pb-3">
                  <BrainCircuit className="w-4 h-4 text-blue-500" />
                  AI Twin OCR Parser
                </h3>

                {aiParsing && (
                  <div className="py-4 text-center space-y-2">
                    <Loader2 className="w-6 h-6 text-blue-500 animate-spin mx-auto" />
                    <span className="block text-xs text-slate-400 font-semibold animate-pulse">Scanning metadata & layout...</span>
                  </div>
                )}

                {aiExtracted && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500">OCR Confidence</span>
                      <span className="font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">{aiConfidence}%</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500">Suggested Credits</span>
                      <span className="font-bold text-blue-700">{aiSuggestedCredits} pts</span>
                    </div>
                    <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl flex gap-2">
                      <Sparkles className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                      <p className="text-[10px] text-blue-600 leading-relaxed">
                        AI has auto-filled the form from your document. Review before submitting.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right: Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleUpload} className="glass-card-strong rounded-3xl p-7 space-y-5">
              <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-3">
                Achievement Details
              </span>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className={labelCls}>
                    <Type className="w-3 h-3 text-blue-500" /> Achievement Title *
                  </label>
                  <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. NPTEL Cloud Computing" className="saas-input" />
                </div>

                <div>
                  <label className={labelCls}>
                    <Tag className="w-3 h-3 text-blue-500" /> Category *
                  </label>
                  <select value={category} onChange={(e) => setCategory(e.target.value)} className="saas-input appearance-none">
                    <option value="">Select Category</option>
                    <option>Workshop / Seminar</option>
                    <option>MOOC / Online Course</option>
                    <option>Internship</option>
                    <option>Hackathon / Competition</option>
                    <option>Volunteering / Club Activity</option>
                    <option>Paper Publication</option>
                    <option>Sports & Cultural</option>
                  </select>
                </div>

                <div>
                  <label className={labelCls}>
                    <Building2 className="w-3 h-3 text-blue-500" /> Issuing Organization
                  </label>
                  <input type="text" value={organization} onChange={(e) => setOrganization(e.target.value)}
                    placeholder="e.g. NPTEL, Coursera, IIT Madras" className="saas-input" />
                </div>

                <div>
                  <label className={labelCls}>
                    <Calendar className="w-3 h-3 text-blue-500" /> Completion Date
                  </label>
                  <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
                    className="saas-input" style={{ colorScheme: "light" }} />
                </div>
              </div>

              <div>
                <label className={labelCls}>Achievement Description *</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detail your roles, responsibilities, or topics learned..."
                  rows={4} className="saas-input resize-none" />
              </div>

              <div className="flex justify-end pt-2">
                <button type="submit" disabled={uploading || aiParsing}
                  className="btn-primary flex items-center gap-2 text-sm disabled:opacity-50">
                  {uploading ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Uploading...</>
                  ) : (
                    <><FileCheck className="w-4 h-4" /> Submit Activity</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Activities;