import React, { useState } from 'react';
import { CurrentUser } from '../types/index.ts';
import { ZovaShieldIcon } from './ZovaLogo.tsx';
import {
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  Lock,
  HeartHandshake,
  ClipboardList,
  PhoneCall,
  Users,
} from 'lucide-react';

interface OtherRoleDashboardProps {
  currentUser: CurrentUser;
  onOpenDirectory?: () => void;
  onOpenEmergency?: () => void;
  onOpenVerification?: () => void;
}

export const OtherRoleDashboard: React.FC<OtherRoleDashboardProps> = ({
  currentUser,
  onOpenDirectory,
  onOpenEmergency,
  onOpenVerification,
}) => {
  const roleTitle = currentUser.customRoleTitle || 'Specialized Campus Staff';
  const [logNotes, setLogNotes] = useState('');
  const [loggedToast, setLoggedToast] = useState(false);

  const handleSaveLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!logNotes.trim()) return;
    setLoggedToast(true);
    setLogNotes('');
    setTimeout(() => setLoggedToast(false), 3000);
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
                  {roleTitle} Console
                </h1>
                {currentUser.isVerified ? (
                  <span className="px-2.5 py-0.5 rounded-full bg-[#10B981]/20 border border-[#10B981]/40 text-[#34D399] text-[10px] font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-[#10B981]" />
                    <span>Verified Official</span>
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-900/30 border border-amber-600/40 text-amber-300 text-[10px] font-bold flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3 text-amber-400" />
                    <span>Unverified Role</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                {currentUser.name} · {currentUser.campus?.collegeName || 'Campus Operations'}
              </p>
            </div>
          </div>

          {!currentUser.isVerified && onOpenVerification && (
            <button
              onClick={onOpenVerification}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-xs font-bold text-[#111827] flex items-center gap-2 shadow-lg transition-all"
            >
              <Lock className="w-4 h-4" />
              <span>Verify Official Credentials</span>
            </button>
          )}
        </div>
      </div>

      {loggedToast && (
        <div className="p-4 rounded-xl bg-emerald-950 border border-emerald-700 text-emerald-200 text-xs flex items-center gap-2 shadow-lg">
          <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
          <span>Operational duty log recorded and timestamped.</span>
        </div>
      )}

      {/* Grid: Staff Duties & Logs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-[#111827] border border-[#064E3B] shadow-xl space-y-4">
          <div className="flex items-center gap-3 text-[#10B981]">
            <HeartHandshake className="w-6 h-6" />
            <h2 className="font-bold text-base text-[#F9FAFB]">{roleTitle} Safety Protocol</h2>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Specialized campus staff play a frontline role in early hazard mitigation, student psychological well-being, and rapid proctorial escalation.
          </p>
          <ul className="space-y-2 text-xs text-slate-300 list-disc list-inside">
            <li>Immediate dispatch coordination with Campus Security Desk.</li>
            <li>Direct escalation pipeline to Dean of Student Welfare.</li>
            <li>Strict non-disclosure of student identities under protection.</li>
          </ul>

          <div className="pt-2 flex items-center gap-3">
            {onOpenDirectory && (
              <button
                onClick={onOpenDirectory}
                className="py-2 px-3.5 rounded-xl bg-[#064E3B] hover:bg-[#10B981] hover:text-[#111827] text-xs font-bold text-[#F9FAFB] transition-all flex items-center gap-1.5 border border-[#10B981]/40"
              >
                <Users className="w-3.5 h-3.5" />
                <span>Campus Directory</span>
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

        {/* Operational Shift Log */}
        <div className="p-6 rounded-2xl bg-[#111827] border border-[#064E3B] shadow-xl space-y-4">
          <div className="flex items-center gap-3 text-[#10B981]">
            <ClipboardList className="w-6 h-6" />
            <h2 className="font-bold text-base text-[#F9FAFB]">Record Daily Duty Log</h2>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Record confidential shift observations, night rounds, or student wellness interactions.
          </p>

          <form onSubmit={handleSaveLog} className="space-y-3">
            <textarea
              rows={4}
              value={logNotes}
              onChange={(e) => setLogNotes(e.target.value)}
              placeholder="Enter duty notes, round observations, or security check results..."
              className="w-full px-3 py-2 rounded-lg bg-[#111827] border border-[#064E3B] focus:border-[#10B981] text-xs text-[#F9FAFB] outline-none resize-none"
            />

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-[#10B981] hover:bg-[#059669] text-xs font-bold text-[#111827] flex items-center justify-center gap-2 shadow-md shadow-[#10B981]/25 transition-all"
            >
              <span>Record Shift Log Entry</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
