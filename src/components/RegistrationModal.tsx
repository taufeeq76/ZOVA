import React, { useState, useEffect } from 'react';
import { CurrentUser, Role, Department, CampusDetails, College } from '../types/index.ts';
import { DEPARTMENTS, DEFAULT_CAMPUS } from '../services/storage.ts';
import { apiClient } from '../services/apiClient.ts';
import { ZovaLogo, ZovaShieldIcon } from './ZovaLogo.tsx';
import {
  X,
  CheckCircle2,
  Building,
  User,
  Shield,
  KeyRound,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  Check,
  Lock,
  Sparkles,
} from 'lucide-react';

interface RegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: CurrentUser;
  onSaveUser: (user: CurrentUser) => void;
  isFirstLaunch?: boolean;
}

export const RegistrationModal: React.FC<RegistrationModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onSaveUser,
  isFirstLaunch = false,
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Campus Details State
  const [collegeName, setCollegeName] = useState<string>(
    currentUser.campus?.collegeName || DEFAULT_CAMPUS.collegeName
  );
  const [campusCode, setCampusCode] = useState<string>(
    currentUser.campus?.campusCode || DEFAULT_CAMPUS.campusCode
  );
  const [city, setCity] = useState<string>(currentUser.campus?.city || DEFAULT_CAMPUS.city);
  const [state, setState] = useState<string>(currentUser.campus?.state || DEFAULT_CAMPUS.state);
  const [securityHelpline, setSecurityHelpline] = useState<string>(
    currentUser.campus?.securityHelpline || DEFAULT_CAMPUS.securityHelpline
  );
  const [antiRaggingEmail, setAntiRaggingEmail] = useState<string>(
    currentUser.campus?.antiRaggingEmail || DEFAULT_CAMPUS.antiRaggingEmail
  );

  // User Details State
  const [name, setName] = useState<string>(currentUser.name || '');
  const [email, setEmail] = useState<string>(currentUser.email || '');
  const [phone, setPhone] = useState<string>(currentUser.phone || '');
  const [role, setRole] = useState<Role>(currentUser.role || 'Student');
  const [customRoleTitle, setCustomRoleTitle] = useState<string>(currentUser.customRoleTitle || '');
  const [department, setDepartment] = useState<Department>(
    currentUser.department || 'Computer Science & Engineering'
  );
  const [studentId, setStudentId] = useState<string>(
    currentUser.studentId || `STU-2026-${Math.floor(100 + Math.random() * 900)}`
  );
  const [employeeId, setEmployeeId] = useState<string>(
    currentUser.employeeId || `EMP-2026-${Math.floor(100 + Math.random() * 900)}`
  );

  // Passkey Verification State
  const [passkey, setPasskey] = useState<string>('');
  const [isPasskeyVerified, setIsPasskeyVerified] = useState<boolean>(currentUser.isVerified || false);
  const [passkeyError, setPasskeyError] = useState<string | null>(null);
  const [passkeySuccess, setPasskeySuccess] = useState<string | null>(null);

  // Feedback states
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [collegesList, setCollegesList] = useState<College[]>([]);

  useEffect(() => {
    if (isOpen) {
      apiClient.getColleges().then((data) => {
        if (data && data.length > 0) setCollegesList(data);
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSelectPredefinedCollege = (col: College) => {
    setCollegeName(col.name);
    setCampusCode(col.code);
    setCity(col.city);
    setState(col.state);
    setSecurityHelpline(col.securityHelpline);
    setAntiRaggingEmail(col.antiRaggingEmail);
  };

  const validateStep1 = () => {
    const errs: Record<string, string> = {};
    if (!collegeName.trim()) errs.collegeName = 'College name is required';
    if (!campusCode.trim()) errs.campusCode = 'Campus code is required';
    if (!city.trim()) errs.city = 'City is required';
    if (!securityHelpline.trim()) errs.securityHelpline = 'Security helpline is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateStep2 = () => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = 'Full name is required';
    if (!email.trim()) {
      errs.email = 'Official email is required';
    } else if (!email.includes('@')) {
      errs.email = 'Enter a valid email address';
    }
    if (role === 'Other' && !customRoleTitle.trim()) {
      errs.customRole = 'Please enter your custom role title';
    }
    if (role === 'Student' && !studentId.trim()) {
      errs.studentId = 'Student ID / Roll number is required';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleVerifyPasskey = async () => {
    setPasskeyError(null);
    setPasskeySuccess(null);

    if (!passkey.trim()) {
      setPasskeyError('Please enter an institutional passkey');
      return;
    }

    try {
      const res = await apiClient.verifyRole(passkey, {
        role,
        name,
        campus: {
          collegeName,
          campusCode,
          city,
          state,
          securityHelpline,
          antiRaggingEmail,
        },
        isVerified: false,
      });

      if (res.success) {
        setIsPasskeyVerified(true);
        setPasskeySuccess(res.message || 'Passkey verified successfully!');
      } else {
        setPasskeyError(res.message || 'Invalid institutional passkey');
      }
    } catch (err: any) {
      setPasskeyError(err.message || 'Invalid institutional passkey');
    }
  };

  const handleFinishRegistration = async () => {
    const isAuthority = ['HOD', 'Dean', 'Higher Authority', 'Faculty'].includes(role);
    const finalVerified = role === 'Student' ? true : isPasskeyVerified;

    const campusData: CampusDetails = {
      collegeName: collegeName.trim(),
      campusCode: campusCode.trim().toUpperCase(),
      city: city.trim(),
      state: state.trim(),
      securityHelpline: securityHelpline.trim(),
      antiRaggingEmail: antiRaggingEmail.trim(),
    };

    const updatedUser: CurrentUser = {
      id: currentUser.id || `usr-${Date.now()}`,
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim() || undefined,
      role,
      customRoleTitle: role === 'Other' ? customRoleTitle.trim() : undefined,
      department: ['HOD', 'Faculty'].includes(role) ? department : undefined,
      studentId: role === 'Student' ? studentId.trim() : undefined,
      employeeId: role !== 'Student' ? employeeId.trim() : undefined,
      campus: campusData,
      isVerified: finalVerified,
      verificationMethod:
        role === 'Student'
          ? 'student_portal'
          : finalVerified
          ? 'institutional_passkey'
          : 'unverified_pending',
    };

    try {
      await apiClient.register(updatedUser, passkey);
    } catch {}

    onSaveUser(updatedUser);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#111827]/90 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#111827] border border-[#064E3B] rounded-2xl shadow-2xl shadow-black/90 overflow-hidden my-6">
        {/* Top Header */}
        <div className="px-6 py-4 bg-[#064E3B]/30 border-b border-[#064E3B] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ZovaShieldIcon className="w-10 h-10" />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-black tracking-wider text-[#F9FAFB]">ZOVA</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#064E3B] text-[#10B981] border border-[#10B981]/40 uppercase font-bold">
                  {isFirstLaunch ? 'Campus Onboarding' : 'Campus & Profile Setup'}
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Safer Campus. Stronger You. · Confidential Institutional Security
              </p>
            </div>
          </div>
          {!isFirstLaunch && (
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-[#064E3B]/50 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Step Indicator */}
        <div className="px-6 py-3 bg-[#111827] border-b border-[#064E3B]/60 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span
              className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                step === 1
                  ? 'bg-[#10B981] text-[#111827]'
                  : 'bg-[#064E3B] text-[#34D399] border border-[#10B981]/40'
              }`}
            >
              1
            </span>
            <span className={step === 1 ? 'font-bold text-[#F9FAFB]' : 'text-slate-400'}>
              Campus & College
            </span>
          </div>

          <div className="h-0.5 w-12 bg-[#064E3B]" />

          <div className="flex items-center gap-2">
            <span
              className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                step === 2
                  ? 'bg-[#10B981] text-[#111827]'
                  : step > 2
                  ? 'bg-[#064E3B] text-[#34D399] border border-[#10B981]/40'
                  : 'bg-[#1F2937] text-slate-500'
              }`}
            >
              2
            </span>
            <span className={step === 2 ? 'font-bold text-[#F9FAFB]' : 'text-slate-400'}>
              User & Role
            </span>
          </div>

          <div className="h-0.5 w-12 bg-[#064E3B]" />

          <div className="flex items-center gap-2">
            <span
              className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                step === 3
                  ? 'bg-[#10B981] text-[#111827]'
                  : 'bg-[#1F2937] text-slate-500'
              }`}
            >
              3
            </span>
            <span className={step === 3 ? 'font-bold text-[#F9FAFB]' : 'text-slate-400'}>
              Authorization Check
            </span>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* STEP 1: CAMPUS & COLLEGE DETAILS */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-[#064E3B]/20 border border-[#10B981]/30 flex items-start gap-3">
                <Building className="w-5 h-5 text-[#10B981] shrink-0 mt-0.5" />
                <div className="text-xs">
                  <p className="font-bold text-[#F9FAFB]">Institutional Campus Context</p>
                  <p className="text-slate-300 mt-0.5">
                    ZOVA connects students and faculty to their campus-specific directory, emergency lines, and confidential escalation proctors.
                  </p>
                </div>
              </div>

              {/* Preset College Selector */}
              {collegesList.length > 0 && (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Quick Select Demo Campus:
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {collegesList.map((col) => (
                      <button
                        key={col.id}
                        type="button"
                        onClick={() => handleSelectPredefinedCollege(col)}
                        className={`p-2.5 rounded-lg border text-left transition-all text-xs ${
                          campusCode === col.code
                            ? 'bg-[#064E3B] border-[#10B981] text-[#F9FAFB] shadow-md shadow-[#10B981]/20'
                            : 'bg-[#111827] border-[#064E3B]/70 text-slate-300 hover:border-[#10B981]/50'
                        }`}
                      >
                        <p className="font-bold truncate">{col.name}</p>
                        <p className="text-[10px] text-[#10B981] mt-0.5">{col.city}, {col.state}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* College Name & Campus Code */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    College / University Name *
                  </label>
                  <input
                    type="text"
                    value={collegeName}
                    onChange={(e) => setCollegeName(e.target.value)}
                    placeholder="e.g. Apex Institute of Science & Technology"
                    className="w-full px-3 py-2 rounded-lg bg-[#111827] border border-[#064E3B] focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981] text-xs text-[#F9FAFB] outline-none"
                  />
                  {errors.collegeName && (
                    <p className="text-[11px] text-red-400 mt-1">{errors.collegeName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Campus Code *
                  </label>
                  <input
                    type="text"
                    value={campusCode}
                    onChange={(e) => setCampusCode(e.target.value)}
                    placeholder="e.g. AIST-BLR"
                    className="w-full px-3 py-2 rounded-lg bg-[#111827] border border-[#064E3B] focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981] text-xs font-mono text-[#F9FAFB] outline-none uppercase"
                  />
                  {errors.campusCode && (
                    <p className="text-[11px] text-red-400 mt-1">{errors.campusCode}</p>
                  )}
                </div>
              </div>

              {/* City and State */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Campus City *
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Bangalore"
                    className="w-full px-3 py-2 rounded-lg bg-[#111827] border border-[#064E3B] focus:border-[#10B981] text-xs text-[#F9FAFB] outline-none"
                  />
                  {errors.city && <p className="text-[11px] text-red-400 mt-1">{errors.city}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    State / Region
                  </label>
                  <input
                    type="text"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="e.g. Karnataka"
                    className="w-full px-3 py-2 rounded-lg bg-[#111827] border border-[#064E3B] focus:border-[#10B981] text-xs text-[#F9FAFB] outline-none"
                  />
                </div>
              </div>

              {/* Campus Emergency Helplines */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-[#064E3B]/40">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Campus 24/7 Security Helpline *
                  </label>
                  <input
                    type="text"
                    value={securityHelpline}
                    onChange={(e) => setSecurityHelpline(e.target.value)}
                    placeholder="+91 80 2839 0100"
                    className="w-full px-3 py-2 rounded-lg bg-[#111827] border border-[#064E3B] focus:border-[#10B981] text-xs font-mono text-[#F9FAFB] outline-none"
                  />
                  {errors.securityHelpline && (
                    <p className="text-[11px] text-red-400 mt-1">{errors.securityHelpline}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Anti-Ragging Cell Email
                  </label>
                  <input
                    type="email"
                    value={antiRaggingEmail}
                    onChange={(e) => setAntiRaggingEmail(e.target.value)}
                    placeholder="antiragging-cell@aist.edu.in"
                    className="w-full px-3 py-2 rounded-lg bg-[#111827] border border-[#064E3B] focus:border-[#10B981] text-xs text-[#F9FAFB] outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: USER DETAILS & ROLE SELECTION */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-[#064E3B]/20 border border-[#10B981]/30 flex items-start gap-3">
                <User className="w-5 h-5 text-[#10B981] shrink-0 mt-0.5" />
                <div className="text-xs">
                  <p className="font-bold text-[#F9FAFB]">User Profile & Role Definition</p>
                  <p className="text-slate-300 mt-0.5">
                    Select your official campus role. Administrative privileges require verification with your campus master key.
                  </p>
                </div>
              </div>

              {/* Name & Official Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Full Legal Name *
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Dr. Robert Sterling or Ananya Roy"
                    className="w-full px-3 py-2 rounded-lg bg-[#111827] border border-[#064E3B] focus:border-[#10B981] text-xs text-[#F9FAFB] outline-none"
                  />
                  {errors.name && <p className="text-[11px] text-red-400 mt-1">{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Official Campus Email *
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. user@campus.edu.in"
                    className="w-full px-3 py-2 rounded-lg bg-[#111827] border border-[#064E3B] focus:border-[#10B981] text-xs text-[#F9FAFB] outline-none"
                  />
                  {errors.email && <p className="text-[11px] text-red-400 mt-1">{errors.email}</p>}
                </div>
              </div>

              {/* Role Selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  Select Official Campus Role *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {(
                    ['Student', 'Faculty', 'HOD', 'Dean', 'Higher Authority', 'Other'] as Role[]
                  ).map((r) => {
                    const isSelected = role === r;
                    return (
                      <button
                        key={r}
                        type="button"
                        onClick={() => {
                          setRole(r);
                          setIsPasskeyVerified(r === 'Student');
                        }}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          isSelected
                            ? 'bg-[#064E3B] border-[#10B981] text-[#F9FAFB] shadow-md shadow-[#10B981]/25 ring-1 ring-[#10B981]'
                            : 'bg-[#111827] border-[#064E3B]/70 text-slate-300 hover:border-[#10B981]/50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs">{r}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-[#10B981]" />}
                        </div>
                        <p className="text-[10px] text-slate-400 mt-1">
                          {r === 'Student' && 'File & track reports'}
                          {r === 'Faculty' && 'Student advisory & directory'}
                          {r === 'HOD' && 'Level 1 dept review'}
                          {r === 'Dean' && 'Level 2 cross-dept oversight'}
                          {r === 'Higher Authority' && 'Level 3 tribunal actions'}
                          {r === 'Other' && 'Custom staff or warden'}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* If "Other" is selected */}
              {role === 'Other' && (
                <div className="p-3 rounded-xl bg-[#064E3B]/30 border border-[#10B981]/40">
                  <label className="block text-xs font-semibold text-[#F9FAFB] mb-1">
                    Enter Custom Role Title *
                  </label>
                  <input
                    type="text"
                    value={customRoleTitle}
                    onChange={(e) => setCustomRoleTitle(e.target.value)}
                    placeholder="e.g. Campus Counsellor, Hostel Warden, Lab In-Charge, Security Officer"
                    className="w-full px-3 py-2 rounded-lg bg-[#111827] border border-[#064E3B] focus:border-[#10B981] text-xs text-[#F9FAFB] outline-none"
                  />
                  {errors.customRole && (
                    <p className="text-[11px] text-red-400 mt-1">{errors.customRole}</p>
                  )}
                </div>
              )}

              {/* Department (if HOD or Faculty or Other) */}
              {['HOD', 'Faculty', 'Other'].includes(role) && (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Department / Division *
                  </label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value as Department)}
                    className="w-full px-3 py-2 rounded-lg bg-[#111827] border border-[#064E3B] focus:border-[#10B981] text-xs text-[#F9FAFB] outline-none"
                  >
                    {DEPARTMENTS.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Student ID / Employee ID */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {role === 'Student' ? (
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Student ID / Roll Number *
                    </label>
                    <input
                      type="text"
                      value={studentId}
                      onChange={(e) => setStudentId(e.target.value)}
                      placeholder="e.g. STU-2026-001"
                      className="w-full px-3 py-2 rounded-lg bg-[#111827] border border-[#064E3B] focus:border-[#10B981] text-xs font-mono text-[#F9FAFB] outline-none uppercase"
                    />
                    {errors.studentId && (
                      <p className="text-[11px] text-red-400 mt-1">{errors.studentId}</p>
                    )}
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Faculty / Employee ID
                    </label>
                    <input
                      type="text"
                      value={employeeId}
                      onChange={(e) => setEmployeeId(e.target.value)}
                      placeholder="e.g. FAC-2026-012"
                      className="w-full px-3 py-2 rounded-lg bg-[#111827] border border-[#064E3B] focus:border-[#10B981] text-xs font-mono text-[#F9FAFB] outline-none uppercase"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Phone Number (Optional)
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full px-3 py-2 rounded-lg bg-[#111827] border border-[#064E3B] focus:border-[#10B981] text-xs font-mono text-[#F9FAFB] outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: ROLE AUTHORIZATION & PASSKEY CHECK */}
          {step === 3 && (
            <div className="space-y-4">
              {role === 'Student' ? (
                <div className="p-5 rounded-2xl bg-[#064E3B]/30 border border-[#10B981]/50 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-[#10B981]/20 border border-[#10B981] text-[#10B981] flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-[#F9FAFB]">
                    Student Portal Ready for {name}
                  </h3>
                  <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
                    Student accounts are automatically authenticated for confidential reporting, anonymous case tracking, campus directory access, and 24/7 emergency helplines.
                  </p>
                  <div className="pt-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#10B981]/20 text-[#34D399] border border-[#10B981]/40 text-xs font-bold font-mono">
                      <Shield className="w-3.5 h-3.5" /> ID: {studentId} · Verified Student
                    </span>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Warning / Explanation regarding verification */}
                  <div className="p-4 rounded-xl bg-[#111827] border border-amber-500/40 space-y-2">
                    <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      <span>Server-Side Authorization Enforced</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      To preserve student privacy and prevent unauthorized access, administrative consoles and disciplinary files require an official campus authorization passkey. Accounts without verification will be marked as <strong className="text-amber-400">Unverified / Pending</strong>.
                    </p>
                  </div>

                  {/* Verification Input Form */}
                  <div className="p-5 rounded-2xl bg-[#064E3B]/20 border border-[#064E3B] space-y-3">
                    <label className="block text-xs font-bold text-[#F9FAFB]">
                      Enter Institutional Passkey for {role === 'Other' ? customRoleTitle : role}:
                    </label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <KeyRound className="w-4 h-4 text-[#10B981] absolute left-3 top-3" />
                        <input
                          type="password"
                          value={passkey}
                          onChange={(e) => {
                            setPasskey(e.target.value);
                            setPasskeyError(null);
                          }}
                          placeholder="e.g. Enter campus passkey"
                          className="w-full pl-9 pr-3 py-2 rounded-lg bg-[#111827] border border-[#064E3B] focus:border-[#10B981] text-xs font-mono text-[#F9FAFB] outline-none"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleVerifyPasskey}
                        className="px-4 py-2 rounded-lg bg-[#10B981] hover:bg-[#059669] text-xs font-bold text-[#111827] transition-all shadow-md shadow-[#10B981]/20"
                      >
                        Verify Key
                      </button>
                    </div>

                    {passkeyError && (
                      <p className="text-xs text-red-400 flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>{passkeyError}</span>
                      </p>
                    )}

                    {passkeySuccess && (
                      <p className="text-xs text-[#34D399] flex items-center gap-1.5 font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{passkeySuccess}</span>
                      </p>
                    )}

                    {/* Test passkeys quick-fill for testing/evaluation */}
                    <div className="pt-3 border-t border-[#064E3B]/50">
                      <p className="text-[11px] font-semibold text-slate-400 mb-2">
                        Institutional Testing Keys (Click to autofill):
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        <button
                          type="button"
                          onClick={() => setPasskey('ZOVA-DEAN-SECURE')}
                          className="px-2 py-1 rounded bg-[#111827] hover:bg-[#064E3B] border border-[#064E3B] text-[10px] font-mono text-[#10B981]"
                        >
                          Dean: ZOVA-DEAN-SECURE
                        </button>
                        <button
                          type="button"
                          onClick={() => setPasskey('ZOVA-HOD-AUTH')}
                          className="px-2 py-1 rounded bg-[#111827] hover:bg-[#064E3B] border border-[#064E3B] text-[10px] font-mono text-[#10B981]"
                        >
                          HOD: ZOVA-HOD-AUTH
                        </button>
                        <button
                          type="button"
                          onClick={() => setPasskey('ZOVA-AUTHORITY-ROOT')}
                          className="px-2 py-1 rounded bg-[#111827] hover:bg-[#064E3B] border border-[#064E3B] text-[10px] font-mono text-[#10B981]"
                        >
                          Higher Authority: ZOVA-AUTHORITY-ROOT
                        </button>
                        <button
                          type="button"
                          onClick={() => setPasskey('ZOVA-FACULTY-2026')}
                          className="px-2 py-1 rounded bg-[#111827] hover:bg-[#064E3B] border border-[#064E3B] text-[10px] font-mono text-[#10B981]"
                        >
                          Faculty: ZOVA-FACULTY-2026
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="text-center">
                    <p className="text-[11px] text-slate-400">
                      Don't have a passkey yet? You can still finish setup; your account will remain unverified until verified by the registrar.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="px-6 py-4 bg-[#064E3B]/20 border-t border-[#064E3B] flex items-center justify-between">
          <div>
            {step > 1 && (
              <button
                type="button"
                onClick={() => setStep((s) => (s - 1) as any)}
                className="px-3.5 py-2 rounded-lg bg-[#111827] hover:bg-[#064E3B] border border-[#064E3B] text-xs font-semibold text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {step < 3 ? (
              <button
                type="button"
                onClick={() => {
                  if (step === 1 && validateStep1()) setStep(2);
                  if (step === 2 && validateStep2()) setStep(3);
                }}
                className="px-5 py-2 rounded-lg bg-[#10B981] hover:bg-[#059669] text-xs font-bold text-[#111827] flex items-center gap-1.5 transition-all shadow-md shadow-[#10B981]/25"
              >
                <span>Continue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleFinishRegistration}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#10B981] to-[#059669] hover:opacity-95 text-xs font-bold text-[#111827] flex items-center gap-2 transition-all shadow-lg shadow-[#10B981]/30"
              >
                <CheckCircle2 className="w-4 h-4 text-[#111827]" />
                <span>Save Profile & Enter ZOVA</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
