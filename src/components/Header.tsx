import React from 'react';
import { CurrentUser } from '../types/index.ts';
import {
  UserCheck,
  FileText,
  Search,
  LayoutDashboard,
  Info,
  Users,
  PhoneCall,
  Building,
  CheckCircle2,
  Lock,
  ShieldAlert,
} from 'lucide-react';
import { ZovaLogo } from './ZovaLogo.tsx';

interface HeaderProps {
  currentUser: CurrentUser;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenLoginModal: () => void;
  onOpenRegistration: () => void;
  onResetDemoData: () => void;
  onOpenSOSWidget?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  activeTab,
  setActiveTab,
  onOpenLoginModal,
  onOpenRegistration,
  onResetDemoData,
  onOpenSOSWidget,
}) => {
  const isStudent = currentUser.role === 'Student';
  const campusCode = currentUser.campus?.campusCode || 'AIST-BLR';

  return (
    <header className="bg-[#111827] border-b border-[#064E3B]/80 sticky top-0 z-30 shadow-xl shadow-black/40">
      {/* Top Banner with Official ZOVA Tagline & Active Campus */}
      <div className="bg-[#064E3B] border-b border-[#10B981]/30 px-4 py-1.5 text-center text-xs text-[#F9FAFB] font-semibold tracking-wide flex items-center justify-between">
        <div className="hidden sm:flex items-center gap-2 text-[11px] text-slate-300">
          <Building className="w-3.5 h-3.5 text-[#10B981]" />
          <span>{currentUser.campus?.collegeName || 'Campus'}</span>
          <span className="px-1.5 py-0.2 rounded bg-[#064E3B]/80 text-[#34D399] border border-[#10B981]/40 font-mono text-[10px]">
            {campusCode}
          </span>
        </div>

        <div className="mx-auto sm:mx-0">
          <span className="text-[#34D399] font-bold">ZOVA</span>
          <span className="mx-2 text-[#10B981]">·</span>
          <span className="tracking-wider">Safer Campus. Stronger You.</span>
          <span className="mx-2 hidden md:inline text-[#10B981]">·</span>
          <span className="hidden md:inline text-slate-200">Zero-Tolerance Anti-Ragging Network</span>
        </div>

        <div className="flex items-center gap-2">
          {onOpenSOSWidget && (
            <button
              onClick={onOpenSOSWidget}
              className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-600 hover:bg-rose-500 text-[11px] text-white font-extrabold transition-all shadow-md shadow-rose-950 animate-pulse"
              title="Launch Live Emergency SOS"
            >
              <ShieldAlert className="w-3 h-3" />
              <span>SOS ACTIVE</span>
            </button>
          )}

          <button
            onClick={() => setActiveTab('emergency')}
            className="hidden sm:flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-rose-950/80 hover:bg-rose-900 border border-rose-500/50 text-[11px] text-rose-300 font-bold transition-all shadow-sm"
          >
            <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping" />
            <span>24/7 Helplines</span>
          </button>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-4">
        {/* Brand with Official ZOVA Shield & Tagline */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab(isStudent ? 'report' : 'dashboard')}
            className="flex items-center text-left group focus:outline-none"
            title="ZOVA - Safer Campus. Stronger You."
          >
            <ZovaLogo variant="navbar" showTagline={true} />
          </button>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 sm:gap-1.5 flex-wrap">
          {isStudent ? (
            <>
              <button
                onClick={() => setActiveTab('report')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  activeTab === 'report'
                    ? 'bg-[#10B981] text-[#111827] font-bold shadow-md shadow-[#10B981]/25'
                    : 'text-slate-300 hover:text-[#F9FAFB] hover:bg-[#064E3B]/60'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Submit Complaint</span>
              </button>
              <button
                onClick={() => setActiveTab('track')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  activeTab === 'track'
                    ? 'bg-[#10B981] text-[#111827] font-bold shadow-md shadow-[#10B981]/25'
                    : 'text-slate-300 hover:text-[#F9FAFB] hover:bg-[#064E3B]/60'
                }`}
              >
                <Search className="w-3.5 h-3.5" />
                <span>Track Report</span>
              </button>
            </>
          ) : (
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-[#10B981] text-[#111827] font-bold shadow-md shadow-[#10B981]/25'
                  : 'text-slate-300 hover:text-[#F9FAFB] hover:bg-[#064E3B]/60'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>{currentUser.role === 'Other' ? (currentUser.customRoleTitle || 'Custom Role') : currentUser.role} Dashboard</span>
            </button>
          )}

          {/* Campus Directory Tab */}
          <button
            onClick={() => setActiveTab('directory')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'directory'
                ? 'bg-[#10B981] text-[#111827] font-bold shadow-md shadow-[#10B981]/25'
                : 'text-slate-300 hover:text-[#F9FAFB] hover:bg-[#064E3B]/60'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Campus Directory</span>
          </button>

          {/* Emergency Helplines Tab */}
          <button
            onClick={() => setActiveTab('emergency')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'emergency'
                ? 'bg-rose-600 text-white font-bold shadow-md shadow-rose-600/30'
                : 'text-slate-300 hover:text-white hover:bg-rose-950/60'
            }`}
          >
            <PhoneCall className="w-3.5 h-3.5 text-rose-400" />
            <span>Emergency Contacts</span>
          </button>

          {/* Emergency Campus SOS Widget */}
          <button
            onClick={() => {
              if (onOpenSOSWidget) onOpenSOSWidget();
              else setActiveTab('sos');
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-extrabold flex items-center gap-1.5 transition-all ${
              activeTab === 'sos'
                ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/50 ring-2 ring-rose-400'
                : 'bg-rose-600/90 hover:bg-rose-600 text-white shadow-md shadow-rose-950/80 ring-1 ring-rose-500/40'
            }`}
            title="Emergency Campus SOS Widget"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-white animate-pulse" />
            <span>SOS Widget</span>
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping ml-0.5" />
          </button>

          {/* About ZOVA */}
          <button
            onClick={() => setActiveTab('about')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'about'
                ? 'bg-[#10B981] text-[#111827] font-bold shadow-md shadow-[#10B981]/25'
                : 'text-slate-300 hover:text-[#F9FAFB] hover:bg-[#064E3B]/60'
            }`}
          >
            <Info className="w-3.5 h-3.5" />
            <span>About</span>
          </button>
        </nav>

        {/* User Role Badge, Campus Setup & Switch Role */}
        <div className="flex items-center gap-2">
          {/* User Profile Capsule */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#111827] border border-[#064E3B] text-xs">
            <div className="flex flex-col text-right">
              <div className="flex items-center justify-end gap-1">
                <span className="font-bold text-[#F9FAFB]">{currentUser.name}</span>
                {currentUser.isVerified ? (
                  <span title="Verified Role">
                    <CheckCircle2 className="w-3 h-3 text-[#10B981]" />
                  </span>
                ) : (
                  <span title="Unverified Role (Pending Passkey)">
                    <Lock className="w-3 h-3 text-amber-400" />
                  </span>
                )}
              </div>
              <span className="text-[10px] text-[#10B981] font-semibold">
                {currentUser.role === 'Other' ? (currentUser.customRoleTitle || 'Staff') : currentUser.role}
                {currentUser.role === 'HOD' && currentUser.department ? ` (${currentUser.department.split(' ')[0]})` : ''}
              </span>
            </div>

            {/* Persona Switcher Button */}
            <button
              onClick={onOpenLoginModal}
              className="ml-1 p-1 text-slate-300 hover:text-[#F9FAFB] rounded-lg hover:bg-[#064E3B] transition-colors"
              title="Switch demo persona or user account"
            >
              <UserCheck className="w-4 h-4 text-[#10B981]" />
            </button>

            {/* Campus Registration / Profile Settings Button */}
            <button
              onClick={onOpenRegistration}
              className="p-1 text-slate-300 hover:text-[#F9FAFB] rounded-lg hover:bg-[#064E3B] transition-colors"
              title="Campus & Profile Settings (Edit College/Role)"
            >
              <Building className="w-4 h-4 text-[#34D399]" />
            </button>
          </div>

          <button
            onClick={onResetDemoData}
            className="hidden lg:inline-block px-2.5 py-1 text-[11px] rounded bg-[#111827] hover:bg-[#064E3B] text-slate-300 hover:text-[#F9FAFB] border border-[#064E3B] transition-colors"
            title="Reset data to sample complaints"
          >
            Reset Demo Data
          </button>
        </div>
      </div>
    </header>
  );
};
