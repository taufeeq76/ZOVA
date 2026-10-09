import React, { useState } from 'react';
import { CurrentUser, Role, Department } from '../types/index.ts';
import { DEPARTMENTS } from '../services/storage.ts';
import { X, Check, ArrowRight, UserPlus, KeyRound, ShieldCheck } from 'lucide-react';
import { ZovaLogo, ZovaShieldIcon } from './ZovaLogo.tsx';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: CurrentUser;
  onSelectUser: (user: CurrentUser) => void;
}

const PRESET_USERS: CurrentUser[] = [
  {
    role: 'Student',
    name: 'Ananya Roy',
    studentId: 'STU-2024-001',
  },
  {
    role: 'HOD',
    name: 'Dr. K. Sharma',
    department: 'Computer Science & Engineering',
  },
  {
    role: 'HOD',
    name: 'Dr. V. Prasad',
    department: 'Mechanical Engineering',
  },
  {
    role: 'HOD',
    name: 'Dr. S. Rao',
    department: 'Electronics & Communication',
  },
  {
    role: 'Dean',
    name: 'Dean Robert Sterling',
  },
  {
    role: 'Higher Authority',
    name: 'Prof. M. Sen (Anti-Ragging Committee)',
  },
];

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onSelectUser,
}) => {
  const [activeMode, setActiveMode] = useState<'signin' | 'register'>('signin');
  const [role, setRole] = useState<Role>(currentUser.role);
  const [name, setName] = useState<string>(currentUser.name);
  const [department, setDepartment] = useState<Department>(
    currentUser.department || 'Computer Science & Engineering'
  );
  const [studentId, setStudentId] = useState<string>(currentUser.studentId || 'STU-2024-001');

  // Register specific fields
  const [regName, setRegName] = useState<string>('');
  const [regRole, setRegRole] = useState<Role>('Student');
  const [regStudentId, setRegStudentId] = useState<string>('');
  const [regDepartment, setRegDepartment] = useState<Department>('Computer Science & Engineering');
  const [regPassword, setRegPassword] = useState<string>('');
  const [regSuccess, setRegSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSelectUser({
      role,
      name: name.trim(),
      studentId: role === 'Student' ? studentId.trim() || 'STU-2024-099' : undefined,
      department: role === 'HOD' ? department : undefined,
    });
    onClose();
  };

  const handleSelectPreset = (preset: CurrentUser) => {
    onSelectUser(preset);
    onClose();
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim()) return;

    const newId = regRole === 'Student'
      ? (regStudentId.trim() || `STU-2026-${Math.floor(100 + Math.random() * 900)}`)
      : undefined;

    const newUser: CurrentUser = {
      role: regRole,
      name: regName.trim(),
      studentId: newId,
      department: regRole === 'HOD' ? regDepartment : undefined,
    };

    setRegSuccess(`Account for ${newUser.name} successfully registered in the ZOVA security registry!`);
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
                  AUTH ACCESS
                </span>
              </div>
              <p className="text-xs text-[#10B981] font-medium">
                Safer Campus. Stronger You.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-300 hover:text-[#F9FAFB] hover:bg-[#064E3B] rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher: Sign In / Demo Switcher vs Register */}
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
            <span>Sign In / Switch Role</span>
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
            <span>Register Account</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto text-xs">
          {activeMode === 'signin' ? (
            <>
              {/* Quick Presets */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-200">
                    1-Click Verified Personas:
                  </span>
                  <span className="text-[10px] text-emerald-400 font-mono">
                    Enforced RBAC
                  </span>
                </div>
                <div className="grid grid-cols-1 gap-2">
                  {PRESET_USERS.map((preset, idx) => {
                    const isActive =
                      currentUser.role === preset.role &&
                      currentUser.name === preset.name &&
                      currentUser.department === preset.department;

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
                              {preset.role}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-300 mt-0.5">
                            {preset.role === 'Student'
                              ? `Student ID: ${preset.studentId}`
                              : preset.role === 'HOD'
                              ? `Department: ${preset.department}`
                              : preset.role === 'Dean'
                              ? 'Central University Welfare'
                              : 'Apex Anti-Ragging Committee'}
                          </div>
                        </div>

                        {isActive ? (
                          <Check className="w-4 h-4 text-[#10B981]" />
                        ) : (
                          <ArrowRight className="w-4 h-4 text-slate-400" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Custom Role Picker Form */}
              <div className="pt-4 border-t border-[#064E3B]/60 space-y-3">
                <span className="font-semibold text-slate-200 block">
                  Or Quick Switch Any Persona:
                </span>

                <form onSubmit={handleCustomSubmit} className="space-y-3.5">
                  <div>
                    <label className="block text-slate-200 mb-1 font-medium">Select Role</label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {(['Student', 'HOD', 'Dean', 'Higher Authority'] as Role[]).map((r) => (
                        <button
                          key={r}
                          type="button"
                          onClick={() => setRole(r)}
                          className={`py-2 px-2.5 rounded-lg font-bold text-center border transition-all ${
                            role === r
                              ? 'bg-[#10B981] text-[#111827] border-[#10B981] shadow-sm'
                              : 'bg-[#111827] text-slate-300 border-[#064E3B] hover:bg-[#064E3B]/50 hover:text-[#F9FAFB]'
                          }`}
                        >
                          {r === 'Higher Authority' ? 'Higher Auth' : r}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-200 mb-1 font-medium">Full Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter name"
                      className="w-full px-3 py-2 bg-[#111827] border border-[#064E3B] rounded-lg text-[#F9FAFB] placeholder-slate-500 text-xs focus:outline-none focus:border-[#10B981]"
                    />
                  </div>

                  {role === 'HOD' && (
                    <div>
                      <label className="block text-slate-200 mb-1 font-medium">
                        Department (HOD sees complaints for their department only)
                      </label>
                      <select
                        value={department}
                        onChange={(e) => setDepartment(e.target.value as Department)}
                        className="w-full px-3 py-2 bg-[#111827] border border-[#064E3B] rounded-lg text-[#F9FAFB] text-xs focus:outline-none focus:border-[#10B981]"
                      >
                        {DEPARTMENTS.map((dept) => (
                          <option key={dept} value={dept} className="bg-[#111827] text-[#F9FAFB]">
                            {dept}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {role === 'Student' && (
                    <div>
                      <label className="block text-slate-200 mb-1 font-medium">Student ID</label>
                      <input
                        type="text"
                        value={studentId}
                        onChange={(e) => setStudentId(e.target.value)}
                        placeholder="e.g. STU-2024-001"
                        className="w-full px-3 py-2 bg-[#111827] border border-[#064E3B] rounded-lg text-[#F9FAFB] placeholder-slate-500 text-xs font-mono focus:outline-none focus:border-[#10B981]"
                      />
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-lg bg-[#10B981] hover:bg-[#059669] font-bold text-[#111827] transition-all flex items-center justify-center gap-1.5 shadow-md shadow-[#10B981]/20"
                  >
                    <span>Authenticate into ZOVA</span>
                  </button>
                </form>
              </div>
            </>
          ) : (
            /* Register Screen */
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              {regSuccess && (
                <div className="p-3 rounded-xl bg-[#064E3B] border border-[#10B981] text-emerald-100 flex items-center gap-2 font-semibold">
                  <ShieldCheck className="w-5 h-5 text-[#10B981]" />
                  <span>{regSuccess}</span>
                </div>
              )}

              <div>
                <span className="font-semibold text-slate-200 block mb-1">Account Role</span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(['Student', 'HOD', 'Dean', 'Higher Authority'] as Role[]).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRegRole(r)}
                      className={`py-2 px-2 rounded-lg font-bold text-center border transition-all ${
                        regRole === r
                          ? 'bg-[#10B981] text-[#111827] border-[#10B981]'
                          : 'bg-[#111827] text-slate-300 border-[#064E3B] hover:bg-[#064E3B]/50 hover:text-[#F9FAFB]'
                      }`}
                    >
                      {r === 'Higher Authority' ? 'Higher Auth' : r}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-slate-200 mb-1 font-medium">Full Name *</label>
                <input
                  type="text"
                  required
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="e.g. Maya Chen"
                  className="w-full px-3 py-2 bg-[#111827] border border-[#064E3B] rounded-lg text-[#F9FAFB] placeholder-slate-500 text-xs focus:outline-none focus:border-[#10B981]"
                />
              </div>

              {regRole === 'Student' && (
                <div>
                  <label className="block text-slate-200 mb-1 font-medium">Campus Student ID</label>
                  <input
                    type="text"
                    value={regStudentId}
                    onChange={(e) => setRegStudentId(e.target.value)}
                    placeholder="e.g. STU-2026-088 (optional, auto-generated if blank)"
                    className="w-full px-3 py-2 bg-[#111827] border border-[#064E3B] rounded-lg text-[#F9FAFB] placeholder-slate-500 text-xs font-mono focus:outline-none focus:border-[#10B981]"
                  />
                </div>
              )}

              {regRole === 'HOD' && (
                <div>
                  <label className="block text-slate-200 mb-1 font-medium">Academic Department</label>
                  <select
                    value={regDepartment}
                    onChange={(e) => setRegDepartment(e.target.value as Department)}
                    className="w-full px-3 py-2 bg-[#111827] border border-[#064E3B] rounded-lg text-[#F9FAFB] text-xs focus:outline-none focus:border-[#10B981]"
                  >
                    {DEPARTMENTS.map((dept) => (
                      <option key={dept} value={dept} className="bg-[#111827] text-[#F9FAFB]">
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-slate-200 mb-1 font-medium">Security Password / PIN</label>
                <input
                  type="password"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 bg-[#111827] border border-[#064E3B] rounded-lg text-[#F9FAFB] placeholder-slate-500 text-xs focus:outline-none focus:border-[#10B981]"
                />
              </div>

              <div className="p-3 rounded-lg bg-[#064E3B]/20 border border-[#064E3B] text-[11px] text-slate-300">
                <strong className="text-[#10B981]">ZOVA Confidentiality Guarantee:</strong> All registered accounts operate under zero-retaliation protocols. Student identity remains strictly anonymous on all filed complaints.
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-lg bg-[#10B981] hover:bg-[#059669] font-bold text-[#111827] transition-all flex items-center justify-center gap-1.5 shadow-md shadow-[#10B981]/20"
              >
                <UserPlus className="w-4 h-4" />
                <span>Create Account & Sign In</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
