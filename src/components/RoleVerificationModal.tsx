import React, { useState } from 'react';
import { CurrentUser, Role } from '../types/index.ts';
import { apiClient } from '../services/apiClient.ts';
import { ZovaShieldIcon } from './ZovaLogo.tsx';
import {
  X,
  KeyRound,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  Lock,
  ExternalLink,
} from 'lucide-react';

interface RoleVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: CurrentUser;
  onVerificationSuccess: (updatedUser: CurrentUser) => void;
}

export const RoleVerificationModal: React.FC<RoleVerificationModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onVerificationSuccess,
}) => {
  const [passkey, setPasskey] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passkey.trim()) {
      setErrorMsg('Please enter your institutional authorization passkey.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await apiClient.verifyRole(passkey, currentUser);
      if (res.success) {
        setSuccessMsg(res.message || 'Institutional authorization confirmed!');
        setTimeout(() => {
          const verifiedUser: CurrentUser = {
            ...currentUser,
            isVerified: true,
            verificationMethod: 'institutional_passkey',
          };
          onVerificationSuccess(verifiedUser);
          onClose();
        }, 1000);
      } else {
        setErrorMsg(res.message || 'Passkey verification failed.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Server authorization rejected this passkey.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#111827]/85 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-[#111827] border border-[#064E3B] rounded-2xl shadow-2xl p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-[#064E3B] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#064E3B] text-[#10B981] border border-[#10B981]/30">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-[#F9FAFB]">
                Institutional Role Verification
              </h3>
              <p className="text-xs text-[#10B981]">
                {currentUser.role} Account: {currentUser.name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white rounded-lg p-1 hover:bg-[#064E3B]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          In compliance with campus anti-ragging security protocols, administrative oversight and student disciplinary records are strictly restricted to verified officials. Never trust an unverified role alone.
        </p>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-[#10B981]" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleVerify} className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-[#F9FAFB] mb-1">
              Enter Campus Passkey / Security Key
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-[#10B981] absolute left-3 top-3" />
              <input
                type="password"
                value={passkey}
                onChange={(e) => {
                  setPasskey(e.target.value);
                  setErrorMsg(null);
                }}
                placeholder="e.g. ZOVA-DEAN-SECURE"
                className="w-full pl-9 pr-3 py-2 rounded-lg bg-[#111827] border border-[#064E3B] focus:border-[#10B981] text-xs font-mono text-[#F9FAFB] outline-none"
              />
            </div>
          </div>

          {/* Quick-fill hints */}
          <div className="pt-2 border-t border-[#064E3B]/60">
            <p className="text-[11px] font-semibold text-slate-400 mb-1.5">
              Available Test Passkeys (Click to apply):
            </p>
            <div className="flex flex-wrap gap-1.5">
              {currentUser.role === 'Dean' && (
                <button
                  type="button"
                  onClick={() => setPasskey('ZOVA-DEAN-SECURE')}
                  className="px-2 py-1 rounded bg-[#064E3B]/60 hover:bg-[#064E3B] border border-[#10B981]/40 text-[10px] font-mono text-[#34D399]"
                >
                  Dean: ZOVA-DEAN-SECURE
                </button>
              )}
              {currentUser.role === 'HOD' && (
                <button
                  type="button"
                  onClick={() => setPasskey('ZOVA-HOD-AUTH')}
                  className="px-2 py-1 rounded bg-[#064E3B]/60 hover:bg-[#064E3B] border border-[#10B981]/40 text-[10px] font-mono text-[#34D399]"
                >
                  HOD: ZOVA-HOD-AUTH
                </button>
              )}
              {currentUser.role === 'Higher Authority' && (
                <button
                  type="button"
                  onClick={() => setPasskey('ZOVA-AUTHORITY-ROOT')}
                  className="px-2 py-1 rounded bg-[#064E3B]/60 hover:bg-[#064E3B] border border-[#10B981]/40 text-[10px] font-mono text-[#34D399]"
                >
                  Authority: ZOVA-AUTHORITY-ROOT
                </button>
              )}
              {currentUser.role === 'Faculty' && (
                <button
                  type="button"
                  onClick={() => setPasskey('ZOVA-FACULTY-2026')}
                  className="px-2 py-1 rounded bg-[#064E3B]/60 hover:bg-[#064E3B] border border-[#10B981]/40 text-[10px] font-mono text-[#34D399]"
                >
                  Faculty: ZOVA-FACULTY-2026
                </button>
              )}
              <button
                type="button"
                onClick={() => setPasskey('ZOVA-CAMPUS-ADMIN')}
                className="px-2 py-1 rounded bg-[#111827] hover:bg-[#064E3B] border border-[#064E3B] text-[10px] font-mono text-slate-300"
              >
                Master: ZOVA-CAMPUS-ADMIN
              </button>
            </div>
          </div>

          <div className="pt-3 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-[#111827] hover:bg-[#064E3B] border border-[#064E3B] text-xs font-semibold text-slate-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-lg bg-[#10B981] hover:bg-[#059669] text-[#111827] text-xs font-bold transition-all shadow-md shadow-[#10B981]/25 disabled:opacity-50"
            >
              {loading ? 'Verifying...' : 'Verify Passkey'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
