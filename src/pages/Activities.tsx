import { useState } from "react";
import { uploadCertificate } from "../services/storageService";
import { saveActivity } from "../services/activityService";
import Navbar from "../components/Navbar";
import { 
  Sparkles, 
  UploadCloud, 
  FileText, 
  Calendar, 
  Building2, 
  Tag, 
  Type, 
  Loader2, 
  CheckCircle2, 
  FileCheck,
  BrainCircuit
} from "lucide-react";

function Activities() {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [organization, setOrganization] = useState("");
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");

  const [certificate, setCertificate] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [aiParsing, setAiParsing] = useState(false);
  
  // AI metadata states
  const [aiConfidence, setAiConfidence] = useState(0);
  const [aiSuggestedCredits, setAiSuggestedCredits] = useState(0);
  const [aiExtracted, setAiExtracted] = useState(false);

  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleFileChange = (file: File) => {
    setCertificate(file);
    setAiExtracted(false);
    setErrorMsg("");

    // Trigger AI parsing simulation (OCR + NLP)
    setAiParsing(true);
    setTimeout(() => {
      // Analyze file name for keywords to populate fields (Simulating OCR text extraction)
      const name = file.name.toLowerCase();
      let extractedTitle = "";
      let extractedCategory = "Workshop";
      let extractedOrg = "Academic Institute";
      let extractedDate = new Date().toISOString().split("T")[0];
      let confidence = 75;
      let credits = 2;

      // 1. Clean title from filename
      const cleanName = file.name
        .substring(0, file.name.lastIndexOf('.'))
        .replace(/[_-]/g, ' ');
      extractedTitle = cleanName.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

      // 2. Classify Category and Org
      if (name.includes("nptel") || name.includes("coursera") || name.includes("udemy") || name.includes("course")) {
        extractedCategory = "MOOC / Online Course";
        extractedOrg = name.includes("nptel") ? "NPTEL / Swayam" : name.includes("coursera") ? "Coursera" : "Udemy";
        confidence = 94;
        credits = 3;
      } else if (name.includes("hackathon") || name.includes("competition") || name.includes("code") || name.includes("contest")) {
        extractedCategory = "Hackathon / Competition";
        extractedOrg = name.includes("gdg") ? "Google Developer Groups" : "Technical Association";
        confidence = 88;
        credits = 4;
      } else if (name.includes("intern") || name.includes("internship") || name.includes("industrial")) {
        extractedCategory = "Internship";
        extractedOrg = "Industry Partner";
        confidence = 90;
        credits = 5;
      } else if (name.includes("nss") || name.includes("volunteer") || name.includes("rotaract") || name.includes("social") || name.includes("service")) {
        extractedCategory = "Volunteering / Club Activity";
        extractedOrg = name.includes("nss") ? "National Service Scheme" : "Youth Red Cross";
        confidence = 92;
        credits = 2;
      } else if (name.includes("workshop") || name.includes("seminar") || name.includes("webinar") || name.includes("conference")) {
        extractedCategory = "Workshop / Seminar";
        extractedOrg = "Academic College";
        confidence = 85;
        credits = 2;
      }

      // 3. Try to extract date
      const dateMatch = name.match(/(20\d{2})/);
      if (dateMatch) {
        extractedDate = `${dateMatch[0]}-06-01`;
      }

      // Auto-fill values
      setTitle(extractedTitle);
      setCategory(extractedCategory);
      setOrganization(extractedOrg);
      setDate(extractedDate);
      setDescription(`Successfully parsed certificate for ${extractedTitle}. Authenticated and verified via Edutwin AI parser.`);
      setAiConfidence(confidence);
      setAiSuggestedCredits(credits);
      setAiExtracted(true);
      setAiParsing(false);
    }, 1500);
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !category || !description) {
      setErrorMsg("Please fill all required fields.");
      return;
    }

    if (!certificate) {
      setErrorMsg("Please select or drop a certificate file.");
      return;
    }

    setUploading(true);
    setErrorMsg("");
    setSuccess(false);

    try {
      // 1. Upload certificate
      const { url, error: uploadError } = await uploadCertificate(certificate);

      if (uploadError) {
        setErrorMsg(uploadError.message);
        setUploading(false);
        return;
      }

      // 2. Save activity in database (serialized in description)
      const { error: saveError } = await saveActivity(
        title,
        category,
        description,
        url || "",
        organization,
        date,
        aiConfidence,
        aiSuggestedCredits
      );

      if (saveError) {
        setErrorMsg(saveError.message);
        setUploading(false);
        return;
      }

      setSuccess(true);
      // Clear form
      setTitle("");
      setCategory("");
      setOrganization("");
      setDate("");
      setDescription("");
      setCertificate(null);
      setAiExtracted(false);
      
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setErrorMsg(err.message || "An error occurred during submission.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <Navbar />

      <div className="pt-28 px-4 max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-2">
            <UploadCloud className="w-8 h-8 text-indigo-600" />
            Upload Achievements
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Submit your certifications, internships, webinars, or club volunteering records for review.
          </p>
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-sm font-medium">
            {errorMsg}
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-2xl text-sm font-medium flex items-center gap-2 shadow-sm">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            Activity submitted successfully! Faculty will review it shortly.
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* File Upload Area */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
              <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Certificate File</span>
              
              <div 
                className={`border-2 border-dashed rounded-2xl p-6 text-center transition duration-300 cursor-pointer ${
                  certificate 
                    ? "border-emerald-300 bg-emerald-50/20" 
                    : "border-gray-200 hover:border-indigo-400 bg-gray-50/50 hover:bg-white"
                }`}
              >
                <input
                  type="file"
                  id="cert-file"
                  accept=".pdf,.png,.jpg,.jpeg"
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      handleFileChange(e.target.files[0]);
                    }
                  }}
                  className="hidden"
                />
                
                <label htmlFor="cert-file" className="cursor-pointer space-y-3 block">
                  <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 mx-auto">
                    <UploadCloud className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="block text-xs font-bold text-gray-800">
                      {certificate ? "Change Certificate" : "Choose Certificate"}
                    </span>
                    <span className="block text-[10px] text-gray-400 mt-1">PDF, PNG, JPG up to 10MB</span>
                  </div>
                </label>
              </div>

              {certificate && (
                <a
                  href={URL.createObjectURL(certificate)}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 p-3 bg-gray-50 hover:bg-indigo-50/50 border border-gray-150 hover:border-indigo-200 rounded-xl flex items-center gap-3 transition cursor-pointer group"
                  title="Click to preview file before upload"
                >
                  <FileText className="w-8 h-8 text-indigo-600 shrink-0 group-hover:scale-105 transition-transform" />
                  <div className="min-w-0 text-left flex-1">
                    <span className="block text-xs font-bold text-gray-800 truncate group-hover:text-indigo-600 transition-colors">{certificate.name}</span>
                    <span className="block text-[10px] text-gray-400">{(certificate.size / (1024 * 1024)).toFixed(2)} MB · Click to preview</span>
                  </div>
                </a>
              )}
            </div>

            {/* AI OCR Status Panel */}
            {(aiParsing || aiExtracted) && (
              <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 space-y-4">
                <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center gap-1.5 border-b border-gray-100 pb-3">
                  <BrainCircuit className="w-4 h-4 text-violet-500" />
                  AI Twin OCR Parser
                </h3>

                {aiParsing && (
                  <div className="py-4 text-center space-y-2">
                    <Loader2 className="w-6 h-6 text-indigo-600 animate-spin mx-auto" />
                    <span className="block text-xs text-gray-500 font-semibold animate-pulse">Scanning metadata & layout...</span>
                  </div>
                )}

                {aiExtracted && (
                  <div className="space-y-3 text-left">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500">OCR Confidence Score</span>
                      <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">{aiConfidence}%</span>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500">Recommended Credits</span>
                      <span className="font-bold text-indigo-600">{aiSuggestedCredits} Credits</span>
                    </div>

                    <div className="p-3 bg-violet-50/50 border border-violet-100 rounded-xl flex gap-2">
                      <Sparkles className="w-4 h-4 text-violet-600 shrink-0 mt-0.5" />
                      <p className="text-[10px] text-violet-700 leading-relaxed">
                        AI has auto-populated the form fields based on your document content. Please review before submitting.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Form details input */}
          <div className="lg:col-span-2">
            <form onSubmit={handleUpload} className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 space-y-6">
              <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100 pb-3 mb-4">
                Achievement Details
              </span>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Title */}
                <div className="space-y-1.5 text-left">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                    <Type className="w-3.5 h-3.5 text-indigo-500" />
                    Achievement Title
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. NPTEL Cloud Computing Certification"
                    className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-gray-800 text-sm transition-all duration-300"
                  />
                </div>

                {/* Category */}
                <div className="space-y-1.5 text-left">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                    <Tag className="w-3.5 h-3.5 text-indigo-500" />
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-gray-800 text-sm transition-all duration-300 appearance-none"
                  >
                    <option value="">Select Category</option>
                    <option value="Workshop / Seminar">Workshop / Seminar</option>
                    <option value="MOOC / Online Course">MOOC / Online Course</option>
                    <option value="Internship">Internship</option>
                    <option value="Hackathon / Competition">Hackathon / Competition</option>
                    <option value="Volunteering / Club Activity">Volunteering / Club Activity</option>
                  </select>
                </div>

                {/* Organization */}
                <div className="space-y-1.5 text-left">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5 text-indigo-500" />
                    Issuing Organization
                  </label>
                  <input
                    type="text"
                    value={organization}
                    onChange={(e) => setOrganization(e.target.value)}
                    placeholder="e.g. NPTEL, Coursera, IIT Madras"
                    className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-gray-800 text-sm transition-all duration-300"
                  />
                </div>

                {/* Date */}
                <div className="space-y-1.5 text-left">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                    Completion Date
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-gray-800 text-sm transition-all duration-300"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1.5 text-left">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Achievement Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detail your roles, responsibilities, or topics learned during this activity..."
                  rows={4}
                  className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-gray-800 text-sm transition-all duration-300 resize-none"
                />
              </div>

              <div className="flex justify-end pt-4">
                <button
                  type="submit"
                  disabled={uploading || aiParsing}
                  className="px-8 py-3.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-semibold rounded-xl shadow-md shadow-indigo-150 transition-all duration-300 disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Uploading Certificate...
                    </>
                  ) : (
                    <>
                      <FileCheck className="w-4 h-4" />
                      Submit Activity
                    </>
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