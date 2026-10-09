import React, { useState } from 'react';
import {
  RaggingType,
  OfflineCategory,
  OnlineCategory,
  Department,
  EvidenceFile,
  Complaint,
  CurrentUser,
} from '../types/index.ts';
import { DEPARTMENTS, storage } from '../services/storage.ts';
import { geminiClient } from '../services/geminiClient.ts';
import { EscalationBadge } from './EscalationBadge.tsx';
import { ZovaShieldIcon } from './ZovaLogo.tsx';
import {
  Shield,
  Building2,
  Smartphone,
  Upload,
  Sparkles,
  AlertTriangle,
  Lock,
  Copy,
  CheckCircle,
  FileText,
  User,
  Clock,
  MapPin,
  X,
  Phone,
  Eye,
  Search,
} from 'lucide-react';

interface StudentComplaintFormProps {
  currentUser: CurrentUser;
  onTrackReport: (reportId: string) => void;
}

const OFFLINE_CATEGORIES: OfflineCategory[] = [
  'Stalking',
  'Unwanted behaviour',
  'Threats',
  'Other',
];

const ONLINE_CATEGORIES: OnlineCategory[] = [
  'Fake accounts',
  'Obscene content',
  'Online threats',
  'Other',
];

export const StudentComplaintForm: React.FC<StudentComplaintFormProps> = ({
  currentUser,
  onTrackReport,
}) => {
  // Form State
  const [raggingType, setRaggingType] = useState<RaggingType>('offline');
  const [category, setCategory] = useState<OfflineCategory | OnlineCategory>(OFFLINE_CATEGORIES[0]);
  const [incidentDate, setIncidentDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [incidentTime, setIncidentTime] = useState<string>('20:00');
  const [location, setLocation] = useState<string>('');
  const [description, setDescription] = useState<string>('');

  // Suspect State
  const [suspectName, setSuspectName] = useState<string>('');
  const [suspectDepartment, setSuspectDepartment] = useState<Department>(DEPARTMENTS[0]);
  const [suspectPhone, setSuspectPhone] = useState<string>('');

  // Evidence
  const [evidence, setEvidence] = useState<EvidenceFile | undefined>(undefined);

  // AI & Submission States
  const [isRewriting, setIsRewriting] = useState<boolean>(false);
  const [rewriteSuggestion, setRewriteSuggestion] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Confirmation State
  const [submittedComplaint, setSubmittedComplaint] = useState<Complaint | null>(null);
  const [copiedId, setCopiedId] = useState<boolean>(false);

  // Toggle ragging type and reset default category
  const handleTypeChange = (type: RaggingType) => {
    setRaggingType(type);
    setCategory(type === 'offline' ? OFFLINE_CATEGORIES[0] : ONLINE_CATEGORIES[0]);
  };

  // Demo Mode Autofill
  const handleAutofillDemo = () => {
    setRaggingType('online');
    setCategory('Online threats');
    setIncidentDate(new Date().toISOString().split('T')[0]);
    setIncidentTime('22:15');
    setLocation('Campus Discord Server #academic-discussion');
    setDescription(
      'Senior student sent direct threatening messages demanding withdrawal of complaint, stating I will not be allowed inside the CAD laboratory.'
    );
    // Use Vikram Singhania who already has complaints to demonstrate instant auto-escalation!
    setSuspectName('Vikram Singhania');
    setSuspectDepartment('Computer Science & Engineering');
    setSuspectPhone('9876543210');
    setErrors({});
  };

  // File Upload Handling
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      setErrors((prev) => ({ ...prev, evidence: 'Only JPG and PNG images are supported.' }));
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, evidence: 'File size exceeds maximum limit of 5 MB.' }));
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setEvidence({
        name: file.name,
        size: file.size,
        type: file.type,
        dataUrl: reader.result as string,
      });
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy.evidence;
        return copy;
      });
    };
    reader.readAsDataURL(file);
  };

  // "Help me describe it" Gemini Feature
  const handleHelpDescribe = async () => {
    if (!description.trim() || description.trim().length < 5) {
      setErrors((prev) => ({
        ...prev,
        description: 'Please write a few rough notes or bullet points first.',
      }));
      return;
    }

    setIsRewriting(true);
    setRewriteSuggestion(null);
    try {
      const enhanced = await geminiClient.rewriteDescription(description);
      setRewriteSuggestion(enhanced);
    } catch (err) {
      console.error(err);
    } finally {
      setIsRewriting(false);
    }
  };

  const applyRewrite = () => {
    if (rewriteSuggestion) {
      setDescription(rewriteSuggestion);
      setRewriteSuggestion(null);
    }
  };

  // Validation
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!location.trim()) {
      newErrors.location = 'Please provide the incident location or platform.';
    }
    if (!description.trim() || description.trim().length < 10) {
      newErrors.description = 'Please provide an incident description (at least 10 characters).';
    }
    if (!suspectName.trim()) {
      newErrors.suspectName = 'Suspect name is required.';
    }

    // Phone validation (digits only, at least 10 digits)
    const cleanPhone = suspectPhone.replace(/\D/g, '');
    if (!cleanPhone || cleanPhone.length < 10) {
      newErrors.suspectPhone = 'Please provide a valid 10-digit phone number for suspect identification.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      // 1. Smart classification & summary using server Gemini endpoints
      const severity = await geminiClient.classifySeverity(description, category, raggingType);
      const aiSummary = await geminiClient.summarize(description, category, location, incidentDate);

      // 2. Submit to storage service (which invokes pure automatic escalation logic)
      const { complaint } = storage.submitComplaint({
        reporterRole: 'Student',
        reporterStudentId: currentUser.studentId || 'STU-2024-001',
        reporterName: currentUser.name,
        raggingType,
        category,
        incidentDate,
        incidentTime,
        location: location.trim(),
        description: description.trim(),
        severity,
        aiSummary,
        evidence,
        suspect: {
          name: suspectName.trim(),
          department: suspectDepartment,
          phone: suspectPhone.replace(/\D/g, ''),
        },
      });

      setSubmittedComplaint(complaint);
    } catch (err: any) {
      console.error(err);
      setErrors({ form: err.message || 'Submission failed. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2500);
  };

  // Render Confirmation Screen
  if (submittedComplaint) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 sm:px-6">
        <div className="p-8 rounded-2xl bg-[#111827] border border-[#064E3B] shadow-2xl shadow-black/80 text-center space-y-6">
          <div className="w-14 h-14 rounded-full bg-[#064E3B] border border-[#10B981]/50 text-[#10B981] flex items-center justify-center mx-auto shadow-lg shadow-[#10B981]/20">
            <CheckCircle className="w-8 h-8" />
          </div>

          <div>
            <h2 className="text-2xl font-bold text-[#F9FAFB] tracking-tight">
              Complaint Registered Confidentially
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-md mx-auto">
              Your report has been securely registered in the <strong className="text-[#10B981]">ZOVA</strong> safety registry. Your personal identity is completely shielded from authorities.
            </p>
            <p className="text-[11px] text-[#10B981] font-semibold mt-1">
              Safer Campus. Stronger You.
            </p>
          </div>

          {/* Unique Report ID Card */}
          <div className="p-5 rounded-xl bg-[#111827] border border-[#064E3B] max-w-md mx-auto space-y-3">
            <div className="text-xs text-slate-300">Your Unique Report ID:</div>
            <div className="flex items-center justify-center gap-3">
              <span className="font-mono text-2xl font-extrabold text-[#10B981] tracking-wider">
                {submittedComplaint.id}
              </span>
              <button
                onClick={() => copyId(submittedComplaint.id)}
                className="p-1.5 rounded bg-[#064E3B] hover:bg-[#10B981] text-[#10B981] hover:text-[#111827] border border-[#10B981]/40 transition-colors"
                title="Copy Report ID"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
            {copiedId && (
              <div className="text-xs text-[#10B981] font-semibold">Copied to clipboard!</div>
            )}
            <div className="p-2.5 rounded bg-[#064E3B]/40 border border-[#10B981]/30 text-emerald-200 text-[11px] leading-relaxed">
              ⚠️ <strong className="text-[#F9FAFB]">Important:</strong> Please save this Report ID. Because your identity is anonymous to officers, this ID is required to track investigation status and official actions.
            </div>
          </div>

          {/* Escalation Notification Badge */}
          <div className="p-4 rounded-xl bg-[#111827] border border-[#064E3B] text-left max-w-md mx-auto space-y-2.5">
            <div className="flex items-center justify-between text-xs font-semibold text-[#F9FAFB]">
              <span>Automatic Escalation Status:</span>
              <EscalationBadge
                level={submittedComplaint.currentEscalationLevel}
                size="sm"
                department={submittedComplaint.suspect.department}
              />
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed font-mono">
              {submittedComplaint.escalationHistory[submittedComplaint.escalationHistory.length - 1]?.reason}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={() => onTrackReport(submittedComplaint.id)}
              className="px-5 py-2.5 rounded-lg bg-[#10B981] hover:bg-[#059669] font-bold text-xs text-[#111827] transition-all flex items-center gap-1.5 shadow-md shadow-[#10B981]/20"
            >
              <Eye className="w-4 h-4" />
              <span>Track This Report Now</span>
            </button>
            <button
              onClick={() => {
                setSubmittedComplaint(null);
                setDescription('');
                setLocation('');
                setSuspectName('');
                setSuspectPhone('');
                setEvidence(undefined);
              }}
              className="px-4 py-2.5 rounded-lg bg-[#111827] hover:bg-[#064E3B] border border-[#064E3B] text-xs font-medium text-slate-300 hover:text-[#F9FAFB] transition-colors"
            >
              Submit Another Report
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6 space-y-6">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#064E3B]/70">
        <div className="flex items-center gap-3">
          <ZovaShieldIcon className="w-11 h-11" />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-[#F9FAFB] tracking-tight">
                ZOVA Confidential Incident Report
              </h1>
            </div>
            <p className="text-xs text-[#10B981] font-semibold flex items-center gap-1.5 mt-0.5">
              <span>Safer Campus. Stronger You.</span>
              <span className="text-[#064E3B]">·</span>
              <span className="text-slate-300 font-normal">Identity Permanently Shielded</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onTrackReport('')}
            className="px-3 py-1.5 rounded-lg bg-[#111827] hover:bg-[#064E3B] border border-[#064E3B] text-slate-300 hover:text-[#F9FAFB] text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Search className="w-3.5 h-3.5 text-[#10B981]" />
            <span>Track Existing Report</span>
          </button>
          <button
            type="button"
            onClick={handleAutofillDemo}
            className="px-3 py-1.5 rounded-lg bg-[#064E3B] hover:bg-[#064E3B]/80 border border-[#10B981]/50 text-[#10B981] text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
            title="Auto-fill sample data for demo evaluation"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#10B981]" />
            <span>Demo Mode: Auto-Fill</span>
          </button>
        </div>
      </div>

      {errors.form && (
        <div className="p-3 rounded-lg bg-rose-950/70 border border-rose-800 text-rose-200 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{errors.form}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* SECTION 1: COMPLAINT TYPE TOGGLE */}
        <div className="p-5 rounded-2xl bg-[#111827] border border-[#064E3B] space-y-4 shadow-xl shadow-black/40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              1. Harassment Medium & Type
            </span>
            <span className="text-[11px] text-[#10B981] font-mono">STEP 1 OF 4</span>
          </div>

          {/* Toggle Button Group */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleTypeChange('offline')}
              className={`p-3.5 rounded-xl border text-left transition-all flex items-start gap-3 ${
                raggingType === 'offline'
                  ? 'bg-[#064E3B]/60 border-[#10B981] ring-1 ring-[#10B981]'
                  : 'bg-[#111827] border-[#064E3B]/70 hover:border-[#10B981]/50'
              }`}
            >
              <div
                className={`p-2 rounded-lg ${
                  raggingType === 'offline'
                    ? 'bg-[#10B981] text-[#111827]'
                    : 'bg-[#064E3B] text-[#10B981]'
                }`}
              >
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <div className="font-semibold text-sm text-[#F9FAFB]">Offline Ragging</div>
                <p className="text-[11px] text-slate-300 mt-0.5">
                  Hostels, campus grounds, corridors, labs, or physical harassment
                </p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleTypeChange('online')}
              className={`p-3.5 rounded-xl border text-left transition-all flex items-start gap-3 ${
                raggingType === 'online'
                  ? 'bg-[#064E3B]/60 border-[#10B981] ring-1 ring-[#10B981]'
                  : 'bg-[#111827] border-[#064E3B]/70 hover:border-[#10B981]/50'
              }`}
            >
              <div
                className={`p-2 rounded-lg ${
                  raggingType === 'online'
                    ? 'bg-[#10B981] text-[#111827]'
                    : 'bg-[#064E3B] text-[#10B981]'
                }`}
              >
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <div className="font-semibold text-sm text-[#F9FAFB]">Online Ragging</div>
                <p className="text-[11px] text-slate-300 mt-0.5">
                  Fake accounts, cyber threats, WhatsApp/Discord, obscene posts
                </p>
              </div>
            </button>
          </div>

          {/* Category Dropdown */}
          <div>
            <label className="block text-slate-200 text-xs font-medium mb-1.5">
              Specific Category
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(raggingType === 'offline' ? OFFLINE_CATEGORIES : ONLINE_CATEGORIES).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`p-2.5 rounded-lg text-xs font-semibold border text-center transition-all ${
                    category === cat
                      ? 'bg-[#10B981] text-[#111827] border-[#10B981] shadow-sm'
                      : 'bg-[#111827] text-slate-300 border-[#064E3B] hover:bg-[#064E3B]/50 hover:text-[#F9FAFB]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* SECTION 2: INCIDENT DETAILS */}
        <div className="p-5 rounded-2xl bg-[#111827] border border-[#064E3B] space-y-4 shadow-xl shadow-black/40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              2. Incident Particulars
            </span>
            <span className="text-[11px] text-[#10B981] font-mono">STEP 2 OF 4</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-200 text-xs font-medium mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-[#10B981]" />
                <span>Incident Date</span>
              </label>
              <input
                type="date"
                value={incidentDate}
                onChange={(e) => setIncidentDate(e.target.value)}
                className="w-full px-3 py-2 bg-[#111827] border border-[#064E3B] rounded-lg text-[#F9FAFB] text-xs font-mono focus:outline-none focus:border-[#10B981]"
              />
            </div>

            <div>
              <label className="block text-slate-200 text-xs font-medium mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-[#10B981]" />
                <span>Approximate Time</span>
              </label>
              <input
                type="time"
                value={incidentTime}
                onChange={(e) => setIncidentTime(e.target.value)}
                className="w-full px-3 py-2 bg-[#111827] border border-[#064E3B] rounded-lg text-[#F9FAFB] text-xs font-mono focus:outline-none focus:border-[#10B981]"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-200 text-xs font-medium mb-1 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-[#10B981]" />
              <span>{raggingType === 'offline' ? 'Campus Location / Venue' : 'Online Platform / Group / Profile'}</span>
            </label>
            <input
              type="text"
              placeholder={
                raggingType === 'offline'
                  ? 'e.g. Senior Hostel Block A, 1st Floor Common Area'
                  : 'e.g. Campus Confessions Instagram page or Batch Discord server'
              }
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className={`w-full px-3 py-2 bg-[#111827] border rounded-lg text-[#F9FAFB] placeholder-slate-500 text-xs focus:outline-none ${
                errors.location ? 'border-rose-500' : 'border-[#064E3B] focus:border-[#10B981]'
              }`}
            />
            {errors.location && <p className="text-[11px] text-rose-400 mt-1">{errors.location}</p>}
          </div>

          {/* Description & AI Assistant */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-slate-200 text-xs font-medium">
                Detailed Incident Narrative
              </label>
              <button
                type="button"
                onClick={handleHelpDescribe}
                disabled={isRewriting}
                className="text-xs text-[#10B981] hover:text-[#F9FAFB] font-semibold flex items-center gap-1 px-2.5 py-1 rounded bg-[#064E3B]/70 border border-[#10B981]/40 transition-colors disabled:opacity-50"
                title="Rewrites your rough notes into a clear factual narrative using Gemini"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#10B981]" />
                <span>{isRewriting ? 'Organizing Facts...' : 'Help Me Describe It'}</span>
              </button>
            </div>

            <textarea
              rows={4}
              placeholder="State what occurred, who was present, what was said or forced, and relevant context. (You can type rough bullet points and click 'Help Me Describe It' above!)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={`w-full px-3 py-2 bg-[#111827] border rounded-lg text-[#F9FAFB] placeholder-slate-500 text-xs leading-relaxed resize-none focus:outline-none ${
                errors.description ? 'border-rose-500' : 'border-[#064E3B] focus:border-[#10B981]'
              }`}
            />
            {errors.description && (
              <p className="text-[11px] text-rose-400 mt-1">{errors.description}</p>
            )}

            {/* AI Suggestion Preview Box */}
            {rewriteSuggestion && (
              <div className="mt-3 p-3.5 rounded-xl bg-[#064E3B]/50 border border-[#10B981]/50 text-xs space-y-2">
                <div className="flex items-center justify-between text-[#10B981] font-semibold text-[11px]">
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#10B981]" />
                    Objective Rewrite (No facts invented)
                  </span>
                  <button
                    type="button"
                    onClick={() => setRewriteSuggestion(null)}
                    className="text-slate-300 hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-[#F9FAFB] text-xs leading-relaxed italic">
                  "{rewriteSuggestion}"
                </p>
                <button
                  type="button"
                  onClick={applyRewrite}
                  className="px-3 py-1.5 text-xs font-bold text-[#111827] bg-[#10B981] hover:bg-[#059669] rounded-lg transition-colors shadow-sm"
                >
                  Accept & Use This Description
                </button>
              </div>
            )}
          </div>

          {/* Evidence Upload */}
          <div className="pt-2">
            <label className="block text-slate-200 text-xs font-medium mb-1">
              Optional Evidence Upload (JPG or PNG, max 5 MB)
            </label>

            {raggingType === 'online' && (
              <div className="p-3 mb-2 rounded-lg bg-[#064E3B]/40 border border-[#10B981]/30 text-emerald-200 text-xs flex items-center gap-2">
                <Smartphone className="w-4 h-4 shrink-0 text-[#10B981]" />
                <span>Attach screenshot proof if available</span>
              </div>
            )}

            {evidence ? (
              <div className="p-3 rounded-xl bg-[#111827] border border-[#064E3B] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={evidence.dataUrl}
                    alt="Preview"
                    className="w-12 h-12 object-cover rounded-lg border border-[#064E3B]"
                  />
                  <div>
                    <div className="text-xs font-medium text-[#F9FAFB] truncate max-w-xs">
                      {evidence.name}
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono">
                      {Math.round(evidence.size / 1024)} KB · {evidence.type}
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setEvidence(undefined)}
                  className="p-1 text-slate-400 hover:text-rose-400 rounded"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="border-2 border-dashed border-[#064E3B] hover:border-[#10B981] rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer transition-colors bg-[#064E3B]/10">
                <Upload className="w-5 h-5 text-[#10B981] mb-1" />
                <span className="text-xs text-slate-200 font-medium">
                  Click to select screenshot or photo evidence
                </span>
                <span className="text-[11px] text-slate-400">JPG or PNG up to 5 MB</span>
                <input
                  type="file"
                  accept="image/jpeg,image/png"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            )}
            {errors.evidence && <p className="text-[11px] text-rose-400 mt-1">{errors.evidence}</p>}
          </div>
        </div>

        {/* SECTION 3: SUSPECT DETAILS (CRUCIAL FOR AUTOMATIC ESCALATION) */}
        <div className="p-5 rounded-2xl bg-[#111827] border border-[#064E3B] space-y-4 shadow-xl shadow-black/40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              3. Suspect Information
            </span>
            <span className="text-[11px] text-[#10B981] font-mono">STEP 3 OF 4</span>
          </div>

          <div className="p-3.5 rounded-xl bg-[#064E3B]/30 border border-[#064E3B] text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-[#F9FAFB] flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-[#10B981]" />
                <span>Automatic Escalation Policy</span>
              </span>
              <span className="text-[10px] text-[#10B981] font-mono">Phone Matched</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Reports match suspect by phone number (digits only). When repeat complaints are filed, all prior complaints against this suspect are automatically updated and escalated:
            </p>
            <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px]">
              <span className="flex items-center gap-1">
                <span className="font-mono text-slate-400 font-semibold">1st:</span>
                <EscalationBadge level={1} size="xs" />
              </span>
              <span className="text-slate-600">→</span>
              <span className="flex items-center gap-1">
                <span className="font-mono text-slate-400 font-semibold">2nd:</span>
                <EscalationBadge level={2} size="xs" />
              </span>
              <span className="text-slate-600">→</span>
              <span className="flex items-center gap-1">
                <span className="font-mono text-slate-400 font-semibold">3rd+:</span>
                <EscalationBadge level={3} size="xs" />
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-200 text-xs font-medium mb-1">
                Suspect Full Name <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Vikram Singhania"
                value={suspectName}
                onChange={(e) => setSuspectName(e.target.value)}
                className={`w-full px-3 py-2 bg-[#111827] border rounded-lg text-[#F9FAFB] placeholder-slate-500 text-xs focus:outline-none ${
                  errors.suspectName ? 'border-rose-500' : 'border-[#064E3B] focus:border-[#10B981]'
                }`}
              />
              {errors.suspectName && (
                <p className="text-[11px] text-rose-400 mt-1">{errors.suspectName}</p>
              )}
            </div>

            <div>
              <label className="block text-slate-200 text-xs font-medium mb-1">
                Suspect Department <span className="text-rose-400">*</span>
              </label>
              <select
                value={suspectDepartment}
                onChange={(e) => setSuspectDepartment(e.target.value as Department)}
                className="w-full px-3 py-2 bg-[#111827] border border-[#064E3B] rounded-lg text-[#F9FAFB] text-xs focus:outline-none focus:border-[#10B981]"
              >
                {DEPARTMENTS.map((dept) => (
                  <option key={dept} value={dept} className="bg-[#111827] text-[#F9FAFB]">
                    {dept}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-200 text-xs font-medium mb-1">
                Phone Number (10 digits) <span className="text-rose-400">*</span>
              </label>
              <input
                type="tel"
                placeholder="e.g. 9876543210"
                value={suspectPhone}
                onChange={(e) => setSuspectPhone(e.target.value)}
                className={`w-full px-3 py-2 bg-[#111827] border rounded-lg text-[#F9FAFB] placeholder-slate-500 text-xs font-mono focus:outline-none ${
                  errors.suspectPhone ? 'border-rose-500' : 'border-[#064E3B] focus:border-[#10B981]'
                }`}
              />
              {errors.suspectPhone && (
                <p className="text-[11px] text-rose-400 mt-1">{errors.suspectPhone}</p>
              )}
            </div>
          </div>
        </div>

        {/* SECTION 4: CONFIDENTIALITY NOTICE */}
        <div className="p-4 rounded-xl bg-[#064E3B]/40 border border-[#10B981]/40 text-xs text-slate-200 space-y-2 shadow-sm">
          <div className="font-semibold text-[#10B981] flex items-center gap-2">
            <Lock className="w-4 h-4 text-[#10B981]" />
            <span>Strict Confidentiality & Retaliation Immunity Notice</span>
          </div>
          <p className="text-[11px] text-slate-300 leading-relaxed">
            This report will be securely reviewed by the authorized departmental HOD, Dean, or Higher Authority based on automatic escalation rules. <strong className="text-[#F9FAFB]">Your name, student ID, and personal contact details are NEVER shown to authorities.</strong> Authorities will only see "Anonymous Reporter" and your Report ID.
          </p>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-3 rounded-xl bg-[#10B981] hover:bg-[#059669] disabled:opacity-50 text-[#111827] font-bold text-xs transition-all flex items-center gap-2 shadow-lg shadow-[#10B981]/25 cursor-pointer"
          >
            <Shield className="w-4 h-4" />
            <span>{isSubmitting ? 'Encrypting & Routing...' : 'Submit Incident Report'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
