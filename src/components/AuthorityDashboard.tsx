import React, { useState, useEffect } from 'react';
import { Complaint, ComplaintStatus, CurrentUser, RaggingType } from '../types/index.ts';
import { storage } from '../services/storage.ts';
import { EscalationBadge } from './EscalationBadge.tsx';
import { ZovaShieldIcon } from './ZovaLogo.tsx';
import {
  Shield,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileText,
  Lock,
  UserX,
  History,
  Eye,
  Send,
  MessageSquare,
  AlertOctagon,
  Pin,
  KeyRound,
} from 'lucide-react';
import { apiClient } from '../services/apiClient.ts';

interface AuthorityDashboardProps {
  currentUser: CurrentUser;
  onVerifyUser?: (updatedUser: CurrentUser) => void;
}

export const AuthorityDashboard: React.FC<AuthorityDashboardProps> = ({
  currentUser,
  onVerifyUser,
}) => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [selectedCase, setSelectedCase] = useState<Complaint | null>(null);

  // Passkey verification state for unverified officers
  const [passkeyInput, setPasskeyInput] = useState<string>('');
  const [passkeyError, setPasskeyError] = useState<string | null>(null);
  const [passkeyLoading, setPasskeyLoading] = useState<boolean>(false);
  const [passkeySuccess, setPasskeySuccess] = useState<string | null>(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [dateSort, setDateSort] = useState<'newest' | 'oldest'>('newest');

  // Action Form States
  const [newStatus, setNewStatus] = useState<ComplaintStatus>('Under Review');
  const [statusNote, setStatusNoteVal] = useState<string>('');
  const [privateNoteInput, setPrivateNoteInput] = useState<string>('');
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const handleVerifyPasskeySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passkeyInput.trim()) {
      setPasskeyError('Please enter an institutional passkey.');
      return;
    }
    setPasskeyLoading(true);
    setPasskeyError(null);
    try {
      const res = await apiClient.verifyRole(passkeyInput, currentUser);
      if (res.success) {
        setPasskeySuccess(res.message || 'Passkey verified successfully!');
        const updated: CurrentUser = {
          ...currentUser,
          isVerified: true,
          verificationMethod: 'institutional_passkey',
        };
        storage.setCurrentUser(updated);
        if (onVerifyUser) onVerifyUser(updated);
      } else {
        setPasskeyError(res.message || 'Invalid institutional passkey');
      }
    } catch (err: any) {
      setPasskeyError(err.message || 'Passkey verification failed');
    } finally {
      setPasskeyLoading(false);
    }
  };

  const loadData = () => {
    if (!currentUser.isVerified) return;
    const all = storage.getComplaints();

    // Enforce role-based scoping:
    let scoped: Complaint[] = [];
    if (currentUser.role === 'HOD') {
      // HOD: sees level-1 complaints for their own department only
      scoped = all.filter(
        (c) => c.currentEscalationLevel === 1 && c.suspect.department === currentUser.department
      );
    } else if (currentUser.role === 'Dean') {
      // Dean: sees level-2 and above, all departments
      scoped = all.filter((c) => c.currentEscalationLevel >= 2);
    } else if (currentUser.role === 'Higher Authority') {
      // Higher Authority: sees level-3 and above, all departments
      scoped = all.filter((c) => c.currentEscalationLevel >= 3);
    }

    setComplaints(scoped);
    if (scoped.length > 0 && !selectedCase) {
      setSelectedCase(scoped[0]);
    } else if (selectedCase) {
      const refreshed = scoped.find((c) => c.id === selectedCase.id);
      setSelectedCase(refreshed || scoped[0] || null);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentUser]);

  // Handle status update
  const handleUpdateStatus = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCase) return;

    storage.updateComplaintStatus(
      selectedCase.id,
      newStatus,
      statusNote,
      currentUser.role,
      currentUser.name
    );

    setStatusNoteVal('');
    setActionSuccess(`Status updated to "${newStatus}".`);
    setTimeout(() => setActionSuccess(null), 3000);
    loadData();
  };

  // Handle adding private note
  const handleAddPrivateNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCase || !privateNoteInput.trim()) return;

    storage.addPrivateNote(
      selectedCase.id,
      privateNoteInput.trim(),
      currentUser.role,
      currentUser.name
    );

    setPrivateNoteInput('');
    setActionSuccess('Confidential internal note added to case file.');
    setTimeout(() => setActionSuccess(null), 3000);
    loadData();
  };

  // Filter and Sort: Pin Critical cases to the top!
  const filteredComplaints = complaints
    .filter((c) => {
      if (statusFilter !== 'all' && c.status !== statusFilter) return false;
      if (typeFilter !== 'all' && c.raggingType !== typeFilter) return false;
      return true;
    })
    .sort((a, b) => {
      // Pin Critical to the top
      if (a.severity === 'Critical' && b.severity !== 'Critical') return -1;
      if (b.severity === 'Critical' && a.severity !== 'Critical') return 1;

      // Date sorting
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return dateSort === 'newest' ? dateB - dateA : dateA - dateB;
    });

  // Summary Metrics
  const totalCount = complaints.length;
  const pendingCount = complaints.filter(
    (c) => c.status === 'Submitted' || c.status === 'Under Review'
  ).length;
  const escalatedCount = complaints.filter((c) => c.currentEscalationLevel > 1).length;
  const resolvedCount = complaints.filter((c) => c.status === 'Closed').length;

  if (!currentUser.isVerified) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 space-y-6">
        <div className="p-8 rounded-3xl bg-[#111827] border-2 border-amber-500/50 shadow-2xl text-center space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-amber-950/60 border border-amber-500/50 text-amber-400 flex items-center justify-center mx-auto shadow-xl">
            <Lock className="w-8 h-8" />
          </div>

          <div>
            <span className="px-3 py-1 rounded-full bg-amber-950 text-amber-400 border border-amber-700/50 text-[11px] font-bold uppercase tracking-wider">
              Server-Side Authorization Required
            </span>
            <h1 className="text-2xl font-black text-[#F9FAFB] tracking-tight mt-3">
              Administrative Access Restricted
            </h1>
            <p className="text-xs text-slate-300 mt-2 max-w-lg mx-auto leading-relaxed">
              You are signed in as <strong>{currentUser.name}</strong> claiming the role of <strong className="text-amber-400">{currentUser.role}</strong>. In compliance with ZOVA security policy, administrative authority is never granted based on an unverified role claim alone.
            </p>
          </div>

          {passkeyError && (
            <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-center justify-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{passkeyError}</span>
            </div>
          )}

          {passkeySuccess && (
            <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0" />
              <span>{passkeySuccess}</span>
            </div>
          )}

          <form onSubmit={handleVerifyPasskeySubmit} className="p-5 rounded-2xl bg-[#064E3B]/20 border border-[#064E3B] space-y-3 text-left">
            <label className="block text-xs font-bold text-[#F9FAFB]">
              Enter Official Institutional Passkey:
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <KeyRound className="w-4 h-4 text-[#10B981] absolute left-3 top-3" />
                <input
                  type="password"
                  value={passkeyInput}
                  onChange={(e) => {
                    setPasskeyInput(e.target.value);
                    setPasskeyError(null);
                  }}
                  placeholder="Enter passkey to unlock dashboard"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#111827] border border-[#064E3B] focus:border-[#10B981] text-xs font-mono text-[#F9FAFB] outline-none"
                />
              </div>
              <button
                type="submit"
                disabled={passkeyLoading}
                className="px-5 py-2.5 rounded-xl bg-[#10B981] hover:bg-[#059669] text-xs font-bold text-[#111827] transition-all shadow-md shadow-[#10B981]/20 disabled:opacity-50"
              >
                {passkeyLoading ? 'Verifying...' : 'Unlock Console'}
              </button>
            </div>

            {/* Quick Testing Passkeys */}
            <div className="pt-2 border-t border-[#064E3B]/40">
              <p className="text-[11px] font-semibold text-slate-400 mb-1.5">
                Quick Test Institutional Keys:
              </p>
              <div className="flex flex-wrap gap-1.5">
                {currentUser.role === 'HOD' && (
                  <button
                    type="button"
                    onClick={() => setPasskeyInput('ZOVA-HOD-AUTH')}
                    className="px-2.5 py-1 rounded-lg bg-[#111827] hover:bg-[#064E3B] border border-[#064E3B] text-[10px] font-mono text-[#10B981]"
                  >
                    HOD: ZOVA-HOD-AUTH
                  </button>
                )}
                {currentUser.role === 'Dean' && (
                  <button
                    type="button"
                    onClick={() => setPasskeyInput('ZOVA-DEAN-SECURE')}
                    className="px-2.5 py-1 rounded-lg bg-[#111827] hover:bg-[#064E3B] border border-[#064E3B] text-[10px] font-mono text-[#10B981]"
                  >
                    Dean: ZOVA-DEAN-SECURE
                  </button>
                )}
                {currentUser.role === 'Higher Authority' && (
                  <button
                    type="button"
                    onClick={() => setPasskeyInput('ZOVA-AUTHORITY-ROOT')}
                    className="px-2.5 py-1 rounded-lg bg-[#111827] hover:bg-[#064E3B] border border-[#064E3B] text-[10px] font-mono text-[#10B981]"
                  >
                    Authority: ZOVA-AUTHORITY-ROOT
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setPasskeyInput('ZOVA-CAMPUS-ADMIN')}
                  className="px-2.5 py-1 rounded-lg bg-[#111827] hover:bg-[#064E3B] border border-[#064E3B] text-[10px] font-mono text-slate-300"
                >
                  Master: ZOVA-CAMPUS-ADMIN
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 space-y-8">
      {/* Role Scoped Banner */}
      <div className="p-6 rounded-2xl bg-[#111827] border border-[#064E3B] space-y-3 shadow-xl shadow-black/40">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <ZovaShieldIcon className="w-12 h-12 shrink-0 mt-0.5" />
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-[#10B981]">
                <span>ZOVA Institutional Oversight Console</span>
                <span className="text-[#064E3B]">·</span>
                <span className="text-[#34D399] font-medium">Safer Campus. Stronger You.</span>
              </div>
              <h1 className="text-2xl font-bold text-[#F9FAFB] tracking-tight mt-1">
                {currentUser.role === 'HOD'
                  ? `HOD Desk: ${currentUser.department || 'Department'}`
                  : currentUser.role === 'Dean'
                  ? 'Dean of Student Welfare: Central Casework Console'
                  : 'Higher Authority: Anti-Ragging Committee Tribunal'}
              </h1>
              <p className="text-xs text-slate-300 mt-0.5">
                {currentUser.role === 'HOD'
                  ? 'Level 1 complaints scoped strictly to your department.'
                  : currentUser.role === 'Dean'
                  ? 'Level 2 & escalated complaints across all campus faculties.'
                  : 'Level 3 complaints, repeat offenders, and apex disciplinary audit log.'}
              </p>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#064E3B]/40 border border-[#10B981]/40 text-right text-xs">
            <span className="text-slate-300 text-[11px] block">Reviewing Authority</span>
            <span className="font-bold text-[#F9FAFB] text-sm">{currentUser.name}</span>
            <span className="text-[#10B981] block font-mono text-[11px] font-semibold">{currentUser.role}</span>
            <span className="text-[#34D399] font-bold flex items-center justify-end gap-1 text-[10px] mt-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981]" />
              <span>Verified Officer</span>
            </span>
          </div>
        </div>

        {/* Confidentiality Warning: Anonymous Reporter */}
        <div className="p-2.5 rounded-lg bg-[#064E3B]/30 border border-[#064E3B] text-emerald-200 text-xs flex items-center gap-2">
          <UserX className="w-4 h-4 text-[#10B981] shrink-0" />
          <span>
            <strong className="text-[#F9FAFB]">Privacy Enforcement:</strong> To protect student safety and guarantee immunity from retaliation, student identities and contact details are permanently withheld from authorities. All reporters appear as "Anonymous Reporter".
          </span>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-[#111827] border border-[#064E3B] shadow-md shadow-black/20">
          <div className="text-xs text-slate-400 font-medium">Total Assigned</div>
          <div className="text-2xl font-bold text-[#F9FAFB] font-mono tabular-nums mt-1">{totalCount}</div>
          <div className="text-[11px] text-slate-500 mt-1">Authorized cases</div>
        </div>

        <div className="p-4 rounded-xl bg-[#111827] border border-[#064E3B] shadow-md shadow-black/20">
          <div className="text-xs text-slate-400 font-medium">Pending Review</div>
          <div className="text-2xl font-bold text-amber-400 font-mono tabular-nums mt-1">{pendingCount}</div>
          <div className="text-[11px] text-slate-500 mt-1">Submitted & In Review</div>
        </div>

        <div className="p-4 rounded-xl bg-[#111827] border border-[#064E3B] shadow-md shadow-black/20">
          <div className="text-xs text-slate-400 font-medium">Auto-Escalated</div>
          <div className="text-2xl font-bold text-[#10B981] font-mono tabular-nums mt-1">{escalatedCount}</div>
          <div className="text-[11px] text-slate-500 mt-1">Level 2 & Level 3</div>
        </div>

        <div className="p-4 rounded-xl bg-[#111827] border border-[#064E3B] shadow-md shadow-black/20">
          <div className="text-xs text-slate-400 font-medium">Resolved / Closed</div>
          <div className="text-2xl font-bold text-emerald-400 font-mono tabular-nums mt-1">{resolvedCount}</div>
          <div className="text-[11px] text-slate-500 mt-1">Concluded actions</div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-[#111827] border border-[#064E3B] text-xs shadow-md">
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="w-4 h-4 text-[#10B981]" />
          <span className="text-slate-300">Filters:</span>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-[#111827] border border-[#064E3B] rounded-lg text-[#F9FAFB] text-xs focus:outline-none focus:border-[#10B981]"
          >
            <option value="all" className="bg-[#111827]">All Statuses</option>
            <option value="Submitted" className="bg-[#111827]">Submitted</option>
            <option value="Under Review" className="bg-[#111827]">Under Review</option>
            <option value="Action Taken" className="bg-[#111827]">Action Taken</option>
            <option value="Closed" className="bg-[#111827]">Closed</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-[#111827] border border-[#064E3B] rounded-lg text-[#F9FAFB] text-xs focus:outline-none focus:border-[#10B981]"
          >
            <option value="all" className="bg-[#111827]">All Types</option>
            <option value="offline" className="bg-[#111827]">Offline Ragging</option>
            <option value="online" className="bg-[#111827]">Online Ragging</option>
          </select>

          <select
            value={dateSort}
            onChange={(e) => setDateSort(e.target.value as any)}
            className="px-2.5 py-1.5 bg-[#111827] border border-[#064E3B] rounded-lg text-[#F9FAFB] text-xs focus:outline-none focus:border-[#10B981]"
          >
            <option value="newest" className="bg-[#111827]">Sort: Newest First</option>
            <option value="oldest" className="bg-[#111827]">Sort: Oldest First</option>
          </select>
        </div>

        <div className="text-xs text-slate-300">
          Showing <span className="text-[#10B981] font-bold">{filteredComplaints.length}</span> complaints (Critical pinned)
        </div>
      </div>

      {/* Main Grid: Case List (Left) & Case Details with Actions (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Complaint Queue */}
        <div className="lg:col-span-5 space-y-2.5">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
            <span>Case Docket</span>
            <span className="text-[#10B981]">Critical Pinned to Top 📌</span>
          </div>

          {filteredComplaints.length === 0 ? (
            <div className="p-8 rounded-xl bg-[#111827] border border-[#064E3B] text-center text-xs text-slate-400">
              No complaints in your docket matching these filters.
            </div>
          ) : (
            <div className="space-y-2.5 max-h-[640px] overflow-y-auto pr-1">
              {filteredComplaints.map((c) => {
                const isSelected = selectedCase?.id === c.id;
                const totalAgainstSuspect = storage.countComplaintsForSuspect(c.suspect);
                const isCritical = c.severity === 'Critical';

                return (
                  <button
                    key={c.id}
                    onClick={() => {
                      setSelectedCase(c);
                      setNewStatus(c.status);
                      setActionSuccess(null);
                    }}
                    className={`w-full text-left p-4 rounded-xl border transition-all ${
                      isSelected
                        ? 'bg-[#064E3B]/60 border-[#10B981] ring-1 ring-[#10B981] shadow-md'
                        : isCritical
                        ? 'bg-[#064E3B]/25 border-emerald-700/60 hover:border-[#10B981]'
                        : 'bg-[#111827] border-[#064E3B]/70 hover:border-[#10B981]/50'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs mb-1">
                      <div className="flex items-center gap-1.5">
                        {isCritical && <Pin className="w-3 h-3 text-[#10B981] fill-[#10B981]" />}
                        <span className="font-mono font-bold text-[#F9FAFB]">{c.id}</span>
                      </div>

                      {/* Severity Tag */}
                      <span
                        className={`text-[10px] font-bold font-mono px-1.5 py-0.2 rounded border ${
                          c.severity === 'Critical'
                            ? 'bg-[#064E3B] text-[#10B981] border-[#10B981]'
                            : c.severity === 'High'
                            ? 'bg-[#064E3B]/80 text-[#F9FAFB] border-[#10B981]/70'
                            : c.severity === 'Medium'
                            ? 'bg-[#111827] text-emerald-200 border-[#064E3B]'
                            : 'bg-[#111827] text-slate-300 border-[#064E3B]'
                        }`}
                      >
                        {c.severity.toUpperCase()}
                      </span>
                    </div>

                    <div className="text-xs font-semibold text-slate-200 line-clamp-1">
                      {c.category}
                    </div>

                    {/* Repeat Offender Badge Indicator */}
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <span className="text-[11px] text-slate-300">
                        Suspect: <strong>{c.suspect.name}</strong>
                      </span>
                      {totalAgainstSuspect >= 2 && (
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-[#064E3B] text-amber-300 border border-amber-600/60 flex items-center gap-1 font-mono">
                          <AlertTriangle className="w-3 h-3 text-amber-400" />
                          <span>{totalAgainstSuspect} complaints</span>
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5 mt-2 pt-2 border-t border-[#064E3B]/60 text-[11px] text-slate-400">
                      <span className="capitalize text-slate-300">{c.raggingType}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono">{c.incidentDate}</span>
                      <span aria-hidden="true">·</span>
                      <EscalationBadge level={c.currentEscalationLevel} size="xs" />
                      <span aria-hidden="true">·</span>
                      <span
                        className={`font-semibold ${
                          c.status === 'Closed'
                            ? 'text-[#10B981]'
                            : c.status === 'Action Taken'
                            ? 'text-emerald-300'
                            : 'text-amber-300'
                        }`}
                      >
                        {c.status}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Case Deep Dive, Status Update, Notes & Evidence */}
        <div className="lg:col-span-7">
          {selectedCase ? (
            <div className="p-6 rounded-2xl bg-[#111827] border border-[#064E3B] space-y-6 shadow-2xl shadow-black/50">
              {/* Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#064E3B]/70">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-2xl font-bold text-[#F9FAFB]">
                      {selectedCase.id}
                    </span>
                    <EscalationBadge
                      level={selectedCase.currentEscalationLevel}
                      size="sm"
                      department={selectedCase.suspect.department}
                    />
                  </div>

                  <div className="text-xs text-slate-300 mt-1 flex items-center gap-2">
                    <span className="text-[#10B981] font-semibold flex items-center gap-1">
                      <UserX className="w-3.5 h-3.5" />
                      Anonymous Reporter
                    </span>
                    <span>·</span>
                    <span>Filed: {new Date(selectedCase.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-slate-400 uppercase font-mono">Current Status</span>
                  <div className="text-sm font-bold text-[#10B981] mt-0.5">{selectedCase.status}</div>
                </div>
              </div>

              {actionSuccess && (
                <div className="p-3 rounded-lg bg-[#064E3B] border border-[#10B981]/60 text-[#F9FAFB] text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0" />
                  <span>{actionSuccess}</span>
                </div>
              )}

              {/* Neutral One-Paragraph Summary */}
              {selectedCase.aiSummary && (
                <div className="p-4 rounded-xl bg-[#064E3B]/30 border border-[#064E3B] space-y-1.5">
                  <div className="text-[11px] font-bold text-[#10B981] uppercase tracking-wider flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5" />
                    Neutral Executive Incident Summary
                  </div>
                  <p className="text-xs text-[#F9FAFB] leading-relaxed italic">
                    "{selectedCase.aiSummary}"
                  </p>
                </div>
              )}

              {/* Suspect & Repeat Offender Box */}
              <div className="p-4 rounded-xl bg-[#111827] border border-[#064E3B] space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#F9FAFB]">Suspect Investigation Record</span>
                  {storage.countComplaintsForSuspect(selectedCase.suspect) >= 2 && (
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-[#064E3B] text-amber-300 border border-amber-600/70 flex items-center gap-1 font-mono">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                      REPEAT OFFENDER: {storage.countComplaintsForSuspect(selectedCase.suspect)} ON FILE
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-slate-300 pt-1">
                  <div>
                    <span className="text-slate-400">Name:</span> <strong className="text-white">{selectedCase.suspect.name}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400">Department:</span>{' '}
                    <strong className="text-white">{selectedCase.suspect.department}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400">Phone Record:</span>{' '}
                    <strong className="font-mono text-[#10B981]">{selectedCase.suspect.phone}</strong>
                  </div>
                </div>
              </div>

              {/* Full Description & Location */}
              <div className="space-y-2 text-xs">
                <div className="font-semibold text-[#F9FAFB]">Full Incident Statement</div>
                <div className="p-3.5 rounded-xl bg-[#111827] border border-[#064E3B] text-slate-300 leading-relaxed whitespace-pre-wrap">
                  {selectedCase.description}
                </div>
                <div className="text-[11px] text-slate-400">
                  Location / Platform: <strong className="text-slate-200">{selectedCase.location}</strong> · Occurrence: {selectedCase.incidentDate} at {selectedCase.incidentTime}
                </div>
              </div>

              {/* Evidence Review */}
              {selectedCase.evidence && (
                <div className="space-y-2 text-xs">
                  <span className="font-semibold text-[#F9FAFB]">Permitted Evidence Attachment</span>
                  <div className="p-3 rounded-xl bg-[#111827] border border-[#064E3B] flex items-center gap-3">
                    <img
                      src={selectedCase.evidence.dataUrl}
                      alt="Evidence"
                      className="w-20 h-20 object-cover rounded-lg border border-[#064E3B] cursor-pointer"
                      onClick={() => {
                        const w = window.open('');
                        w?.document.write(`<img src="${selectedCase.evidence?.dataUrl}" style="max-width:100%;" />`);
                      }}
                    />
                    <div>
                      <div className="font-medium text-[#F9FAFB]">{selectedCase.evidence.name}</div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        {Math.round(selectedCase.evidence.size / 1024)} KB · {selectedCase.evidence.type}
                      </div>
                      <div className="text-[11px] text-[#10B981] mt-1 font-semibold">
                        Click image to view high-resolution photo
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Authority Action Panel: Update Status */}
              <div className="p-4 rounded-xl bg-[#064E3B]/20 border border-[#064E3B] space-y-3 text-xs shadow-md">
                <div className="font-bold text-[#F9FAFB] flex items-center justify-between">
                  <span>Take Official Action & Update Status</span>
                  <span className="text-[11px] text-[#10B981] font-mono">AUTHORIZED: {currentUser.role}</span>
                </div>

                <form onSubmit={handleUpdateStatus} className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-200 mb-1">New Workflow Status</label>
                      <select
                        value={newStatus}
                        onChange={(e) => setNewStatus(e.target.value as ComplaintStatus)}
                        className="w-full px-3 py-2 bg-[#111827] border border-[#064E3B] rounded-lg text-[#F9FAFB] text-xs focus:outline-none focus:border-[#10B981]"
                      >
                        <option value="Submitted" className="bg-[#111827]">Submitted</option>
                        <option value="Under Review" className="bg-[#111827]">Under Review</option>
                        <option value="Action Taken" className="bg-[#111827]">Action Taken</option>
                        <option value="Closed" className="bg-[#111827]">Closed</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-200 mb-1">Status Note (Reason / Action Taken)</label>
                      <input
                        type="text"
                        placeholder="e.g. Disciplinary notice served; witnesses summoned"
                        value={statusNote}
                        onChange={(e) => setStatusNoteVal(e.target.value)}
                        className="w-full px-3 py-2 bg-[#111827] border border-[#064E3B] rounded-lg text-[#F9FAFB] placeholder-slate-500 text-xs focus:outline-none focus:border-[#10B981]"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-[#10B981] hover:bg-[#059669] font-bold text-[#111827] transition-all shadow-md shadow-[#10B981]/20"
                  >
                    Commit Status Change
                  </button>
                </form>
              </div>

              {/* Private Notes Section */}
              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-[#F9FAFB] flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-[#10B981]" />
                    <span>Confidential Internal Notes ({selectedCase.privateNotes.length})</span>
                  </span>
                  <span className="text-[10px] text-slate-400">Visible to authorities only</span>
                </div>

                {selectedCase.privateNotes.length > 0 && (
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {selectedCase.privateNotes.map((note) => (
                      <div
                        key={note.id}
                        className="p-3 rounded-lg bg-[#111827] border border-[#064E3B] space-y-1"
                      >
                        <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                          <span className="text-[#10B981] font-semibold font-sans">
                            {note.authorName} ({note.authorRole})
                          </span>
                          <span>{new Date(note.timestamp).toLocaleString()}</span>
                        </div>
                        <p className="text-slate-300 leading-relaxed text-xs">{note.text}</p>
                      </div>
                    ))}
                  </div>
                )}

                <form onSubmit={handleAddPrivateNote} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Add confidential officer note or inquiry finding..."
                    value={privateNoteInput}
                    onChange={(e) => setPrivateNoteInput(e.target.value)}
                    className="flex-1 px-3 py-2 bg-[#111827] border border-[#064E3B] rounded-lg text-[#F9FAFB] placeholder-slate-500 text-xs focus:outline-none focus:border-[#10B981]"
                  />
                  <button
                    type="submit"
                    disabled={!privateNoteInput.trim()}
                    className="px-4 py-2 rounded-lg bg-[#064E3B] hover:bg-[#10B981] hover:text-[#111827] border border-[#10B981]/40 disabled:opacity-50 text-[#10B981] font-bold transition-colors"
                  >
                    Add Note
                  </button>
                </form>
              </div>

              {/* Automatic Escalation History Trail */}
              <div className="space-y-2 pt-2 border-t border-[#064E3B]/70 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-[#F9FAFB] flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-[#10B981]" />
                    <span>Automatic Escalation Chain ({selectedCase.escalationHistory.length})</span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    HOD → Dean → Higher Authority
                  </span>
                </div>

                <div className="space-y-1.5 max-h-36 overflow-y-auto">
                  {selectedCase.escalationHistory.map((esc) => (
                    <div
                      key={esc.id}
                      className="p-2.5 rounded-lg bg-[#111827] border border-[#064E3B] text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between text-slate-400 text-[11px]">
                        <EscalationBadge level={esc.level} size="xs" />
                        <span className="font-mono text-[10px] text-slate-400">
                          {new Date(esc.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <div className="text-slate-300 font-sans text-[11px] leading-relaxed">
                        {esc.reason}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Full Audit Log (Mandatory for Higher Authority, visible on case) */}
              <div className="space-y-2 pt-2 border-t border-[#064E3B]/70 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-[#F9FAFB] flex items-center gap-1.5">
                    <History className="w-3.5 h-3.5 text-[#10B981]" />
                    <span>Immutable Escalation & Audit Log ({selectedCase.auditLogs.length})</span>
                  </span>
                  {currentUser.role === 'Higher Authority' && (
                    <span className="text-[10px] font-mono text-[#10B981] font-bold">TRIBUNAL AUDIT MODE</span>
                  )}
                </div>

                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                  {selectedCase.auditLogs.map((log) => (
                    <div
                      key={log.id}
                      className="p-2.5 rounded-lg bg-[#111827] border border-[#064E3B] font-mono text-[11px] space-y-0.5"
                    >
                      <div className="flex items-center justify-between text-slate-400">
                        <span className="text-[#10B981] font-bold">{log.action}</span>
                        <span>{new Date(log.timestamp).toLocaleString()}</span>
                      </div>
                      <div className="text-slate-300 font-sans text-xs">{log.details}</div>
                      <div className="text-[10px] text-slate-500">
                        Actor: {log.actorName} ({log.actorRole})
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 rounded-2xl bg-[#111827] border border-[#064E3B] text-center text-xs text-slate-400">
              Select a complaint from your docket to view details, evidence, and take action.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
