import React, { useState } from 'react';
import { CurrentUser, Role, Department } from '../types/index.ts';
import { DEPARTMENTS, DEFAULT_CAMPUS } from '../services/storage.ts';
import { apiClient } from '../services/apiClient.ts';
import { X, Check, ArrowRight, UserPlus, KeyRound, ShieldCheck, Lock, Building } from 'lucide-react';
import { ZovaLogo, ZovaShieldIcon } from './ZovaLogo.tsx';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: CurrentUser;
  onSelectUser: (user: CurrentUser) => void;
  onOpenFullRegistration?: () => void;
}

const PRESET_USERS: CurrentUser[] = [
  {
    role: 'Student',
    name: 'Ananya Roy',
    studentId: 'STU-2024-001',
    campus: DEFAULT_CAMPUS,
    isVerified: true,
    verificationMethod: 'student_portal',
  },
  {
    role: 'Faculty',
    name: 'Prof. Elena Vance',
    department: 'Computer Science & Engineering',
    campus: DEFAULT_CAMPUS,
    isVerified: true,
    verificationMethod: 'institutional_passkey',
  },
  {
    role: 'HOD',
    name: 'Dr. K. Sharma',
    department: 'Computer Science & Engineering',
    campus: DEFAULT_CAMPUS,
    isVerified: true,
    verificationMethod: 'institutional_passkey',
  },
  {
    role: 'HOD',
    name: 'Dr. V. Prasad',
    department: 'Mechanical Engineering',
    campus: DEFAULT_CAMPUS,
    isVerified: true,
    verificationMethod: 'institutional_passkey',
  },
  {
    role: 'HOD',
    name: 'Dr. S. Rao',
    department: 'Electronics & Communication',
    campus: DEFAULT_CAMPUS,
    isVerified: true,
    verificationMethod: 'institutional_passkey',
  },
  {
    role: 'Dean',
    name: 'Dean Robert Sterling',
    campus: DEFAULT_CAMPUS,
    isVerified: true,
    verificationMethod: 'institutional_passkey',
  },
  {
    role: 'Higher Authority',
    name: 'Prof. M. Sen (Anti-Ragging Committee)',
    campus: DEFAULT_CAMPUS,
    isVerified: true,
    verificationMethod: 'institutional_passkey',
  },
  {
    role: 'Other',
    customRoleTitle: 'Campus Counsellor',
    name: 'Dr. Priya Nair',
    campus: DEFAULT_CAMPUS,
    isVerified: true,
    verificationMethod: 'institutional_passkey',
  },
  {
    role: 'Other',
    customRoleTitle: 'Hostel Warden',
    name: 'Mr. Devendra Verma',
    campus: DEFAULT_CAMPUS,
    isVerified: true,
    verificationMethod: 'institutional_passkey',
  },
];

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onSelectUser,
  onOpenFullRegistration,
}) => {
  const [activeMode, setActiveMode] = useState<'signin' | 'register'>('signin');

  // Register specific fields
  const [regName, setRegName] = useState<string>('');
  const [regRole, setRegRole] = useState<Role>('Student');
  const [regCustomRoleTitle, setRegCustomRoleTitle] = useState<string>('');
  const [regStudentId, setRegStudentId] = useState<string>('');
  const [regDepartment, setRegDepartment] = useState<Department>('Computer Science & Engineering');
  const [regPasskey, setRegPasskey] = useState<string>('');
  const [regSuccess, setRegSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSelectPreset = (preset: CurrentUser) => {
    onSelectUser(preset);
    onClose();
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim()) return;

    let isVerified = false;
    let verificationMethod: any = 'unverified_pending';

    if (regRole === 'Student') {
      isVerified = true;
      verificationMethod = 'student_portal';
    } else if (regPasskey.trim()) {
      try {
        const verify = await apiClient.verifyRole(regPasskey, {
          role: regRole,
          name: regName,
          campus: currentUser.campus || DEFAULT_CAMPUS,
          isVerified: false,
        });
        if (verify.success) {
          isVerified = true;
          verificationMethod = 'institutional_passkey';
        }
      } catch {}
    }

    const newId =
      regRole === 'Student'
        ? regStudentId.trim() || `STU-2026-${Math.floor(100 + Math.random() * 900)}`
        : undefined;

    const newUser: CurrentUser = {
      role: regRole,
      customRoleTitle: regRole === 'Other' ? regCustomRoleTitle.trim() : undefined,
      name: regName.trim(),
      studentId: newId,
      department: ['HOD', 'Faculty'].includes(regRole) ? regDepartment : undefined,
      campus: currentUser.campus || DEFAULT_CAMPUS,
      isVerified,
      verificationMethod,
    };

    setRegSuccess(
      isVerified
        ? `Account registered and verified with institutional authority!`
        : `Account registered! Administrative access marked pending passkey verification.`
    );

    setTimeout(() => {
      onSelectUser(newUser);
      setRegSuccess(null);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#111827]/85 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-lg bg-[#111827] border border-[#064E3B] rounded-2xl shadow-2xl shadow-black/80 overflow-hidden my-8">
        {/* Official ZOVA Modal Header */}
        <div className="px-6 py-4 border-b border-[#064E3B] flex items-center justify-between bg-[#064E3B]/20">
          <div className="flex items-center gap-3">
            <ZovaShieldIcon className="w-10 h-10" />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-black tracking-wider text-[#F9FAFB]">ZOVA</span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#064E3B] text-[#10B981] border border-[#10B981]/30 uppercase">
                  RBAC ACCESS
                </span>
              </div>
              <p className="text-xs text-[#10B981] font-medium">Safer Campus. Stronger You.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-300 hover:text-[#F9FAFB] hover:bg-[#064E3B] rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher: Sign In / Persona Switcher vs Register */}
        <div className="px-6 pt-4 pb-2 border-b border-[#064E3B]/60 flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveMode('signin')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all ${
              activeMode === 'signin'
                ? 'bg-[#10B981] text-[#111827] shadow-md shadow-[#10B981]/25'
                : 'bg-[#111827] text-slate-300 border border-[#064E3B] hover:bg-[#064E3B]/40 hover:text-[#F9FAFB]'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Select Demo Persona</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveMode('register')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all ${
              activeMode === 'register'
                ? 'bg-[#10B981] text-[#111827] shadow-md shadow-[#10B981]/25'
                : 'bg-[#111827] text-slate-300 border border-[#064E3B] hover:bg-[#064E3B]/40 hover:text-[#F9FAFB]'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Register Profile</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto text-xs">
          {activeMode === 'signin' ? (
            <>
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-200">
                    Preloaded Verified Personas:
                  </span>
                  <span className="text-[10px] text-emerald-400 font-mono">
                    Instant 1-Click Access
                  </span>
                </div>
                <div className="grid grid-cols-1 gap-2">
                  {PRESET_USERS.map((preset, idx) => {
                    const isActive =
                      currentUser.role === preset.role &&
                      currentUser.name === preset.name &&
                      currentUser.department === preset.department &&
                      currentUser.customRoleTitle === preset.customRoleTitle;

                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSelectPreset(preset)}
                        className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                          isActive
                            ? 'bg-[#064E3B]/60 border-[#10B981] ring-1 ring-[#10B981]'
                            : 'bg-[#111827] border-[#064E3B]/70 hover:bg-[#064E3B]/30 hover:border-[#10B981]/40'
                        }`}
                      >
                        <div>
                          <div className="font-semibold text-[#F9FAFB] flex items-center gap-2">
                            <span>{preset.name}</span>
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#064E3B] border border-[#10B981]/40 text-[#10B981] font-semibold">
                              {preset.role === 'Other' ? preset.customRoleTitle : preset.role}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-400 mt-0.5">
                            {preset.role === 'Student' && `ID: ${preset.studentId} · Confidential Reporting`}
                            {preset.role === 'Faculty' && `${preset.department} · Advisory`}
                            {preset.role === 'HOD' && `${preset.department} · Level 1 Oversight`}
                            {preset.role === 'Dean' && 'Central Proctorial Board · Level 2 & Above'}
                            {preset.role === 'Higher Authority' && 'Supreme Tribunal Oversight · Level 3'}
                            {preset.role === 'Other' && `${preset.customRoleTitle} Desk · Safety Logs`}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {isActive ? (
                            <span className="text-[11px] font-bold text-[#10B981] flex items-center gap-1">
                              <Check className="w-3.5 h-3.5" />
                              Active
                            </span>
                          ) : (
                            <ArrowRight className="w-4 h-4 text-slate-500" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Comprehensive setup wizard trigger */}
              {onOpenFullRegistration && (
                <div className="pt-2 border-t border-[#064E3B]/50">
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenFullRegistration();
                    }}
                    className="w-full py-2.5 px-4 rounded-xl bg-[#064E3B]/40 hover:bg-[#064E3B] text-slate-200 hover:text-white border border-[#10B981]/40 font-bold flex items-center justify-center gap-2 transition-all"
                  >
                    <Building className="w-4 h-4 text-[#10B981]" />
                    <span>Launch Full Campus Onboarding Wizard</span>
                  </button>
                </div>
              )}
            </>
          ) : (
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              {regSuccess && (
                <div className="p-3 rounded-xl bg-[#064E3B] border border-[#10B981] text-[#F9FAFB] flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#34D399]" />
                  <span>{regSuccess}</span>
                </div>
              )}

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Full Name / Official Name *
                </label>
                <input
                  type="text"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="e.g. Maya Krishnan"
                  required
                  className="w-full px-3 py-2 rounded-lg bg-[#111827] border border-[#064E3B] focus:border-[#10B981] text-[#F9FAFB] outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Select Role *
                </label>
                <select
                  value={regRole}
                  onChange={(e) => setRegRole(e.target.value as Role)}
                  className="w-full px-3 py-2 rounded-lg bg-[#111827] border border-[#064E3B] focus:border-[#10B981] text-[#F9FAFB] outline-none"
                >
                  <option value="Student">Student (File & Track Complaints)</option>
                  <option value="Faculty">Faculty (Advisory & Directory)</option>
                  <option value="HOD">HOD (Level 1 Department Authority)</option>
                  <option value="Dean">Dean (Level 2 Central Oversight)</option>
                  <option value="Higher Authority">Higher Authority (Level 3 Tribunal)</option>
                  <option value="Other">Other (Custom Campus Role)</option>
                </select>
              </div>

              {regRole === 'Other' && (
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Custom Role Title *
                  </label>
                  <input
                    type="text"
                    value={regCustomRoleTitle}
                    onChange={(e) => setRegCustomRoleTitle(e.target.value)}
                    placeholder="e.g. Campus Counsellor, Hostel Warden, Lab In-Charge"
                    required
                    className="w-full px-3 py-2 rounded-lg bg-[#111827] border border-[#064E3B] focus:border-[#10B981] text-[#F9FAFB] outline-none"
                  />
                </div>
              )}

              {regRole === 'Student' && (
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Student ID / Roll Number
                  </label>
                  <input
                    type="text"
                    value={regStudentId}
                    onChange={(e) => setRegStudentId(e.target.value)}
                    placeholder="e.g. STU-2026-881"
                    className="w-full px-3 py-2 rounded-lg bg-[#111827] border border-[#064E3B] focus:border-[#10B981] text-xs font-mono text-[#F9FAFB] outline-none"
                  />
                </div>
              )}

              {['HOD', 'Faculty'].includes(regRole) && (
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Department</label>
                  <select
                    value={regDepartment}
                    onChange={(e) => setRegDepartment(e.target.value as Department)}
                    className="w-full px-3 py-2 rounded-lg bg-[#111827] border border-[#064E3B] focus:border-[#10B981] text-[#F9FAFB] outline-none"
                  >
                    {DEPARTMENTS.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Passkey input for officer roles */}
              {regRole !== 'Student' && (
                <div className="p-3.5 rounded-xl bg-[#064E3B]/20 border border-[#064E3B] space-y-2">
                  <div className="flex items-center gap-1.5 text-[#10B981] font-semibold">
                    <Lock className="w-3.5 h-3.5" />
                    <span>Institutional Passkey (For Verified Status)</span>
                  </div>
                  <input
                    type="password"
                    value={regPasskey}
                    onChange={(e) => setRegPasskey(e.target.value)}
                    placeholder="Optional during setup (e.g. ZOVA-DEAN-SECURE)"
                    className="w-full px-3 py-2 rounded-lg bg-[#111827] border border-[#064E3B] focus:border-[#10B981] text-xs font-mono text-[#F9FAFB] outline-none"
                  />
                  <p className="text-[10px] text-slate-400">
                    If left blank, account will be marked Unverified until passkey is entered.
                  </p>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-[#10B981] hover:bg-[#059669] text-xs font-bold text-[#111827] flex items-center justify-center gap-2 shadow-lg shadow-[#10B981]/25 transition-all"
              >
                <UserPlus className="w-4 h-4" />
                <span>Save & Sign In to ZOVA</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
