import React, { useState, useEffect } from 'react';
import { Complaint, ComplaintStatus, CurrentUser } from '../types/index.ts';
import { storage } from '../services/storage.ts';
import { EscalationBadge } from './EscalationBadge.tsx';
import { ZovaShieldIcon } from './ZovaLogo.tsx';
import {
  Search,
  CheckCircle2,
  Clock,
  Shield,
  AlertTriangle,
  Building2,
  Smartphone,
  Eye,
  FileText,
  Calendar,
  Lock,
  ArrowRight,
  ListFilter,
} from 'lucide-react';

interface StudentTrackingProps {
  currentUser: CurrentUser;
  initialReportId?: string;
  onOpenSubmitNew: () => void;
}

const STATUS_STEPS: { status: ComplaintStatus; label: string; desc: string }[] = [
  {
    status: 'Submitted',
    label: 'Submitted',
    desc: 'Incident logged & encrypted in ZOVA safety registry',
  },
  {
    status: 'Under Review',
    label: 'Under Review',
    desc: 'Inquiry officer reviewing statements & evidence',
  },
  {
    status: 'Action Taken',
    label: 'Action Taken',
    desc: 'Disciplinary warnings, hearings, or protective orders enforced',
  },
  {
    status: 'Closed',
    label: 'Closed',
    desc: 'Inquiry concluded with formal resolution',
  },
];

const SAMPLE_DEMO_IDS = ['SC-2026-0001', 'SC-2026-0002', 'SC-2026-0004', 'SC-2026-0006'];

export const StudentTracking: React.FC<StudentTrackingProps> = ({
  currentUser,
  initialReportId = '',
  onOpenSubmitNew,
}) => {
  const [searchInput, setSearchInput] = useState<string>(initialReportId);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [myReports, setMyReports] = useState<Complaint[]>([]);
  const [allReports, setAllReports] = useState<Complaint[]>([]);
  const [listTab, setListTab] = useState<'my' | 'all'>('my');
  const [searchError, setSearchError] = useState<string | null>(null);

  useEffect(() => {
    // Load student's own reports and all reports
    const my = storage.getComplaintsForStudent(currentUser.studentId || '');
    const all = storage.getComplaints();
    setMyReports(my);
    setAllReports(all);

    if (initialReportId) {
      const found = storage.getComplaintById(initialReportId);
      if (found) {
        setSelectedComplaint(found);
        setSearchInput(initialReportId);
      }
    } else if (my.length > 0) {
      setSelectedComplaint(my[0]);
      setSearchInput(my[0].id);
    } else if (all.length > 0) {
      // If student has no reports yet, default to first demo report
      setSelectedComplaint(all[0]);
      setSearchInput(all[0].id);
    }
  }, [currentUser, initialReportId]);

  const handleSearch = (e?: React.FormEvent, customId?: string) => {
    if (e) e.preventDefault();
    const idToSearch = (customId || searchInput).trim();
    if (!idToSearch) return;

    setSearchError(null);
    const found = storage.getComplaintById(idToSearch);
    if (found) {
      setSelectedComplaint(found);
      setSearchInput(found.id);
    } else {
      setSearchError(`No complaint found with Report ID "${idToSearch}". Please verify the ID.`);
      setSelectedComplaint(null);
    }
  };

  const getStepIndex = (status: ComplaintStatus): number => {
    return STATUS_STEPS.findIndex((s) => s.status === status);
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 space-y-8">
      {/* Top Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#064E3B]/70">
        <div className="flex items-center gap-3">
          <ZovaShieldIcon className="w-11 h-11" />
          <div>
            <h1 className="text-2xl font-bold text-[#F9FAFB] tracking-tight">
              ZOVA Report Tracking
            </h1>
            <p className="text-xs text-[#10B981] font-semibold flex items-center gap-1.5 mt-0.5">
              <span>Safer Campus. Stronger You.</span>
              <span className="text-[#064E3B]">·</span>
              <span className="text-slate-300 font-normal">Real-Time Investigation Status & Action Timeline</span>
            </p>
          </div>
        </div>

        <button
          onClick={onOpenSubmitNew}
          className="px-4 py-2 rounded-lg bg-[#10B981] hover:bg-[#059669] text-xs font-bold text-[#111827] transition-all shadow-md shadow-[#10B981]/20"
        >
          Submit New Complaint
        </button>
      </div>

      {/* Report ID Search Card */}
      <div className="p-5 rounded-2xl bg-[#111827] border border-[#064E3B] space-y-3.5 shadow-xl shadow-black/40">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-slate-200">
            Enter Report ID
          </label>
          <span className="text-[11px] text-slate-400">
            Format: <span className="font-mono text-[#10B981]">SC-2026-XXXX</span>
          </span>
        </div>

        <form onSubmit={(e) => handleSearch(e)} className="flex gap-2">
          <input
            type="text"
            placeholder="e.g. SC-2026-0001"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="flex-1 px-4 py-2.5 bg-[#111827] border border-[#064E3B] rounded-lg text-[#F9FAFB] placeholder-slate-500 font-mono text-xs uppercase focus:outline-none focus:border-[#10B981]"
          />
          <button
            type="submit"
            className="px-5 py-2.5 rounded-lg bg-[#10B981] hover:bg-[#059669] text-[#111827] font-bold text-xs transition-colors flex items-center gap-1.5 whitespace-nowrap shadow-sm"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Track Status</span>
          </button>
        </form>

        {/* Quick Demo ID Shortcut Chips */}
        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-slate-300">
          <span className="text-[11px] text-slate-400">Quick Test Samples:</span>
          {SAMPLE_DEMO_IDS.map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => handleSearch(undefined, id)}
              className="px-2 py-0.5 rounded bg-[#111827] hover:bg-[#064E3B] border border-[#064E3B] text-[#10B981] font-mono text-[11px] transition-colors"
            >
              {id}
            </button>
          ))}
        </div>

        {searchError && (
          <div className="p-3 rounded-lg bg-rose-950/70 border border-rose-800 text-rose-200 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{searchError}</span>
          </div>
        )}
      </div>

      {/* Main Grid: My Reports (Left Column) & Status Timeline & Details (Right Column) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: My Reports List */}
        <div className="lg:col-span-4 space-y-3">
          {/* Segmented Tab Switcher */}
          <div className="flex items-center gap-1 p-1 bg-[#111827] border border-[#064E3B] rounded-xl text-xs">
            <button
              type="button"
              onClick={() => setListTab('my')}
              className={`flex-1 py-1.5 px-2 rounded-lg font-bold transition-all ${
                listTab === 'my'
                  ? 'bg-[#10B981] text-[#111827] shadow-sm'
                  : 'text-slate-300 hover:text-[#F9FAFB]'
              }`}
            >
              My Reports ({myReports.length})
            </button>
            <button
              type="button"
              onClick={() => setListTab('all')}
              className={`flex-1 py-1.5 px-2 rounded-lg font-bold transition-all ${
                listTab === 'all'
                  ? 'bg-[#10B981] text-[#111827] shadow-sm'
                  : 'text-slate-300 hover:text-[#F9FAFB]'
              }`}
            >
              All Campus Cases ({allReports.length})
            </button>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
            <span>
              {listTab === 'my'
                ? `Logged as ID: ${currentUser.studentId || 'Anonymous'}`
                : 'Click any report to inspect timeline & escalation'}
            </span>
          </div>

          {(listTab === 'my' ? myReports : allReports).length === 0 ? (
            <div className="p-6 rounded-2xl bg-[#111827] border border-[#064E3B] text-center text-xs text-slate-300 space-y-2.5 shadow-lg">
              <FileText className="w-6 h-6 text-[#10B981] mx-auto" />
              <p>No complaints found under this tab.</p>
              <button
                onClick={onOpenSubmitNew}
                className="text-xs text-[#10B981] hover:underline font-bold"
              >
                File an Incident Report Now →
              </button>
            </div>
          ) : (
            <div className="space-y-2.5 max-h-[620px] overflow-y-auto pr-1">
              {(listTab === 'my' ? myReports : allReports).map((report) => {
                const isSelected = selectedComplaint?.id === report.id;
                return (
                  <button
                    key={report.id}
                    onClick={() => {
                      setSelectedComplaint(report);
                      setSearchInput(report.id);
                      setSearchError(null);
                    }}
                    className={`w-full text-left p-3.5 rounded-xl border transition-all ${
                      isSelected
                        ? 'bg-[#064E3B]/60 border-[#10B981] ring-1 ring-[#10B981] shadow-md'
                        : 'bg-[#111827] border-[#064E3B]/70 hover:border-[#10B981]/50'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-mono font-bold text-[#F9FAFB]">{report.id}</span>
                      <span className="text-[10px] font-mono text-slate-400">
                        {report.incidentDate}
                      </span>
                    </div>

                    <div className="text-xs font-semibold text-slate-200 line-clamp-1">
                      {report.category}
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5 mt-2 pt-1.5 border-t border-[#064E3B]/60 text-[11px] text-slate-400">
                      <span className="capitalize text-slate-300">{report.raggingType}</span>
                      <span aria-hidden="true">·</span>
                      <EscalationBadge level={report.currentEscalationLevel} size="xs" />
                      <span aria-hidden="true">·</span>
                      <span
                        className={`font-semibold ${
                          report.status === 'Closed'
                            ? 'text-[#10B981]'
                            : report.status === 'Action Taken'
                            ? 'text-emerald-300'
                            : 'text-amber-300'
                        }`}
                      >
                        {report.status}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Active Complaint Timeline & Comprehensive Details */}
        {/* Right Column: Active Complaint Timeline & Comprehensive Details */}
        <div className="lg:col-span-8">
          {selectedComplaint ? (
            <div className="p-6 rounded-2xl bg-[#111827] border border-[#064E3B] space-y-6 shadow-2xl shadow-black/50">
              {/* Header Box */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#064E3B]/70">
                <div>
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-2xl font-bold text-[#F9FAFB]">
                      {selectedComplaint.id}
                    </span>
                    {/* Severity Badge */}
                    <span
                      className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded border ${
                        selectedComplaint.severity === 'Critical'
                          ? 'bg-[#064E3B] text-[#10B981] border-[#10B981]'
                          : selectedComplaint.severity === 'High'
                          ? 'bg-[#064E3B]/80 text-[#F9FAFB] border-[#10B981]/70'
                          : selectedComplaint.severity === 'Medium'
                          ? 'bg-[#111827] text-emerald-200 border-[#064E3B]'
                          : 'bg-[#111827] text-slate-300 border-[#064E3B]'
                      }`}
                    >
                      {selectedComplaint.severity.toUpperCase()} SEVERITY
                    </span>
                  </div>

                  <div className="text-xs text-slate-300 mt-1">
                    Filed on {new Date(selectedComplaint.createdAt).toLocaleDateString()} · Category:{' '}
                    <strong className="text-[#F9FAFB]">{selectedComplaint.category}</strong> (
                    {selectedComplaint.raggingType} ragging)
                  </div>
                </div>

                {/* Escalation Badge */}
                <div className="flex flex-col items-end gap-1.5">
                  <EscalationBadge
                    level={selectedComplaint.currentEscalationLevel}
                    size="md"
                    department={selectedComplaint.suspect.department}
                  />
                  <div className="text-[11px] text-slate-400 font-mono">
                    {selectedComplaint.currentEscalationLevel === 1
                      ? `HOD Desk (${selectedComplaint.suspect.department})`
                      : selectedComplaint.currentEscalationLevel === 2
                      ? 'Dean of Student Welfare'
                      : 'Anti-Ragging Committee Tribunal'}
                  </div>
                </div>
              </div>

              {/* Status Timeline: Submitted, Under Review, Action Taken, Closed */}
              <div className="p-5 rounded-2xl bg-[#111827] border border-[#064E3B] space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#F9FAFB] uppercase tracking-wider flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-[#10B981]" />
                    Status Timeline
                  </span>
                  <span className="text-[11px] font-mono text-[#10B981] font-bold">
                    Current: {selectedComplaint.status}
                  </span>
                </div>

                <div className="relative pt-2 pb-2">
                  {/* Connecting track line */}
                  <div className="absolute left-6 right-6 top-6 h-0.5 bg-[#064E3B] -z-0 hidden sm:block" />

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 relative z-10">
                    {STATUS_STEPS.map((stepItem, idx) => {
                      const currentIdx = getStepIndex(selectedComplaint.status);
                      const isDone = idx <= currentIdx;
                      const isCurrent = idx === currentIdx;

                      return (
                        <div
                          key={stepItem.status}
                          className={`flex sm:flex-col items-center sm:items-center sm:text-center gap-3 sm:gap-2 p-2 sm:p-0 rounded-lg ${
                            isCurrent ? 'bg-[#064E3B]/40 sm:bg-transparent' : ''
                          }`}
                        >
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all shrink-0 ${
                              isCurrent
                                ? 'bg-[#10B981] text-[#111827] ring-4 ring-[#10B981]/25 shadow-md shadow-[#10B981]/40'
                                : isDone
                                ? 'bg-[#064E3B] text-[#10B981] border border-[#10B981]/50'
                                : 'bg-[#111827] text-slate-400 border border-[#064E3B]'
                            }`}
                          >
                            {isDone ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                          </div>

                          <div className="sm:text-center">
                            <span
                              className={`text-xs block font-semibold ${
                                isCurrent
                                  ? 'text-[#F9FAFB]'
                                  : isDone
                                  ? 'text-slate-200'
                                  : 'text-slate-500'
                              }`}
                            >
                              {stepItem.label}
                            </span>
                            <span className="text-[10px] text-slate-400 hidden sm:block mt-0.5 leading-snug">
                              {stepItem.desc}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Neutral One-Paragraph Summary */}
              {selectedComplaint.aiSummary && (
                <div className="p-4 rounded-xl bg-[#064E3B]/30 border border-[#064E3B] space-y-1.5">
                  <span className="text-[11px] font-bold text-[#10B981] uppercase tracking-wider flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5" />
                    Neutral Administrative Summary
                  </span>
                  <p className="text-xs text-[#F9FAFB] leading-relaxed italic">
                    "{selectedComplaint.aiSummary}"
                  </p>
                </div>
              )}

              {/* Incident Details Summary */}
              <div className="p-4 rounded-xl bg-[#111827] border border-[#064E3B] space-y-2 text-xs">
                <div className="font-semibold text-[#F9FAFB]">Full Incident Narrative</div>
                <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">
                  {selectedComplaint.description}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-[#064E3B]/60 text-slate-400">
                  <div>
                    Location / Platform:{' '}
                    <strong className="text-slate-200">{selectedComplaint.location}</strong>
                  </div>
                  <div>
                    Suspect:{' '}
                    <strong className="text-slate-200">
                      {selectedComplaint.suspect.name} ({selectedComplaint.suspect.department})
                    </strong>
                  </div>
                </div>
              </div>

              {/* Attached Evidence Preview */}
              {selectedComplaint.evidence && (
                <div className="space-y-2">
                  <span className="text-xs font-semibold text-slate-200">Attached Evidence Proof</span>
                  <div className="p-3 rounded-xl bg-[#111827] border border-[#064E3B] flex items-center gap-3">
                    <img
                      src={selectedComplaint.evidence.dataUrl}
                      alt="Evidence Thumbnail"
                      className="w-16 h-16 object-cover rounded-lg border border-[#064E3B]"
                    />
                    <div className="text-xs">
                      <div className="font-medium text-[#F9FAFB]">{selectedComplaint.evidence.name}</div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        {Math.round(selectedComplaint.evidence.size / 1024)} KB · {selectedComplaint.evidence.type}
                      </div>
                      <div className="text-[11px] text-[#10B981] font-semibold mt-0.5">
                        Encrypted in private evidence vault
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Automatic Escalation History */}
              <div className="space-y-2">
                <span className="text-xs font-semibold text-slate-200">
                  Automatic Escalation Audit History ({selectedComplaint.escalationHistory.length})
                </span>

                <div className="space-y-2">
                  {selectedComplaint.escalationHistory.map((esc) => (
                    <div
                      key={esc.id}
                      className="p-3 rounded-xl bg-[#111827] border border-[#064E3B] text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between text-slate-400 text-[11px]">
                        <EscalationBadge level={esc.level} size="xs" />
                        <span className="font-mono text-slate-400">
                          {new Date(esc.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-slate-300 leading-relaxed text-[11px]">{esc.reason}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 rounded-2xl bg-[#111827] border border-[#064E3B] text-center text-xs text-slate-300 space-y-3 shadow-xl">
              <Search className="w-8 h-8 text-[#10B981] mx-auto" />
              <div className="font-bold text-[#F9FAFB]">No Report Selected</div>
              <p>Enter a Report ID in the search box above or select any complaint from "My Reports".</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
