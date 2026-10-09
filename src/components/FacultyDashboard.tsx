import React, { useState } from 'react';
import { CurrentUser } from '../types/index.ts';
import { ZovaShieldIcon } from './ZovaLogo.tsx';
import {
  Shield,
  CheckCircle2,
  AlertTriangle,
  BookOpen,
  Users,
  Send,
  LifeBuoy,
  FileCheck,
  PhoneCall,
  Lock,
} from 'lucide-react';

interface FacultyDashboardProps {
  currentUser: CurrentUser;
  onOpenDirectory?: () => void;
  onOpenEmergency?: () => void;
  onOpenVerification?: () => void;
}

export const FacultyDashboard: React.FC<FacultyDashboardProps> = ({
  currentUser,
  onOpenDirectory,
  onOpenEmergency,
  onOpenVerification,
}) => {
  const [concernDesc, setConcernDesc] = useState('');
  const [studentRef, setStudentRef] = useState('');
  const [submittedToast, setSubmittedToast] = useState(false);

  const handleEscalateConcern = (e: React.FormEvent) => {
    e.preventDefault();
    if (!concernDesc.trim()) return;
    setSubmittedToast(true);
    setConcernDesc('');
    setStudentRef('');
    setTimeout(() => setSubmittedToast(false), 3500);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      {/* Role Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-[#111827] via-[#064E3B]/60 to-[#111827] border border-[#064E3B] shadow-2xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <ZovaShieldIcon className="w-12 h-12" />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-[#F9FAFB] tracking-tight">
                  Faculty Advisory & Proctorial Console
                </h1>
                {currentUser.isVerified ? (
                  <span className="px-2.5 py-0.5 rounded-full bg-[#10B981]/20 border border-[#10B981]/40 text-[#34D399] text-[10px] font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-[#10B981]" />
                    <span>Verified Faculty Officer</span>
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-900/30 border border-amber-600/40 text-amber-300 text-[10px] font-bold flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3 text-amber-400" />
                    <span>Unverified Role</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                {currentUser.name} · Department of {currentUser.department || 'Academic Affairs'}
              </p>
            </div>
          </div>

          {!currentUser.isVerified && onOpenVerification && (
            <button
              onClick={onOpenVerification}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-xs font-bold text-[#111827] flex items-center gap-2 shadow-lg transition-all"
            >
              <Lock className="w-4 h-4" />
              <span>Verify Faculty Credentials</span>
            </button>
          )}
        </div>
      </div>

      {submittedToast && (
        <div className="p-4 rounded-xl bg-emerald-950 border border-emerald-700 text-emerald-200 text-xs flex items-center gap-2 shadow-lg animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
          <span>Student advisory referral dispatched securely to HOD & Student Counselling Cell.</span>
        </div>
      )}

      {/* Grid: Mandates & Pastoral Action */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Anti-Ragging Mandate Card */}
        <div className="p-6 rounded-2xl bg-[#111827] border border-[#064E3B] shadow-xl space-y-4">
          <div className="flex items-center gap-3 text-[#10B981]">
            <BookOpen className="w-6 h-6" />
            <h2 className="font-bold text-base text-[#F9FAFB]">Faculty Anti-Ragging Mandate</h2>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            As a faculty mentor, statutory UGC guidelines require active surveillance in labs, lecture halls, and common corridors.
          </p>
          <ul className="space-y-2 text-xs text-slate-300 list-disc list-inside">
            <li>Zero-tolerance policy on coercive junior chores or intimidation.</li>
            <li>Mandatory reporting of distress indicators or unexplained absenteeism.</li>
            <li>Maintain confidentiality of student disclosures to protect victims.</li>
            <li>Emergency liaison with HOD and Campus Proctorial Board.</li>
          </ul>

          <div className="pt-2 flex items-center gap-3">
            {onOpenDirectory && (
              <button
                onClick={onOpenDirectory}
                className="py-2 px-3.5 rounded-xl bg-[#064E3B] hover:bg-[#10B981] hover:text-[#111827] text-xs font-bold text-[#F9FAFB] transition-all flex items-center gap-1.5 border border-[#10B981]/40"
              >
                <Users className="w-3.5 h-3.5" />
                <span>Open Campus Directory</span>
              </button>
            )}
            {onOpenEmergency && (
              <button
                onClick={onOpenEmergency}
                className="py-2 px-3.5 rounded-xl bg-[#111827] hover:bg-[#064E3B] text-xs font-bold text-slate-300 hover:text-white transition-all flex items-center gap-1.5 border border-[#064E3B]"
              >
                <PhoneCall className="w-3.5 h-3.5 text-[#10B981]" />
                <span>Emergency Helplines</span>
              </button>
            )}
          </div>
        </div>

        {/* Confidential Faculty Student Welfare Referral */}
        <div className="p-6 rounded-2xl bg-[#111827] border border-[#064E3B] shadow-xl space-y-4">
          <div className="flex items-center gap-3 text-[#10B981]">
            <LifeBuoy className="w-6 h-6" />
            <h2 className="font-bold text-base text-[#F9FAFB]">Flag Confidential Pastoral Welfare</h2>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Observed a student in distress or suspected bullying? Flag an anonymous pastoral referral to the HOD and Campus Counsellor.
          </p>

          <form onSubmit={handleEscalateConcern} className="space-y-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Student Name / Roll Number (Optional)
              </label>
              <input
                type="text"
                value={studentRef}
                onChange={(e) => setStudentRef(e.target.value)}
                placeholder="e.g. 2nd Year CSE Student or Roll ID"
                className="w-full px-3 py-2 rounded-lg bg-[#111827] border border-[#064E3B] focus:border-[#10B981] text-xs text-[#F9FAFB] outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Observations & Pastoral Notes *
              </label>
              <textarea
                rows={3}
                value={concernDesc}
                onChange={(e) => setConcernDesc(e.target.value)}
                placeholder="Describe behavioral distress or incidents observed in department..."
                className="w-full px-3 py-2 rounded-lg bg-[#111827] border border-[#064E3B] focus:border-[#10B981] text-xs text-[#F9FAFB] outline-none resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-[#10B981] hover:bg-[#059669] text-xs font-bold text-[#111827] flex items-center justify-center gap-2 shadow-md shadow-[#10B981]/25 transition-all"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Dispatch Pastoral Advisory Note</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
