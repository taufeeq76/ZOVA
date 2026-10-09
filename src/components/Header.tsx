import React from 'react';
import { CurrentUser, Role } from '../types/index.ts';
import { UserCheck, FileText, Search, LayoutDashboard, Info } from 'lucide-react';
import { ZovaLogo } from './ZovaLogo.tsx';

interface HeaderProps {
  currentUser: CurrentUser;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenLoginModal: () => void;
  onResetDemoData: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  activeTab,
  setActiveTab,
  onOpenLoginModal,
  onResetDemoData,
}) => {
  const isStudent = currentUser.role === 'Student';

  return (
    <header className="bg-[#111827] border-b border-[#064E3B]/80 sticky top-0 z-30 shadow-xl shadow-black/40">
      {/* Top Banner with Official ZOVA Tagline */}
      <div className="bg-[#064E3B] border-b border-[#10B981]/30 px-4 py-1.5 text-center text-xs text-[#F9FAFB] font-semibold tracking-wide">
        <span className="text-[#34D399] font-bold">ZOVA</span>
        <span className="mx-2 text-[#10B981]">·</span>
        <span className="tracking-wider">Safer Campus. Stronger You.</span>
        <span className="mx-2 hidden sm:inline text-[#10B981]">·</span>
        <span className="hidden sm:inline text-slate-200">Confidential Reporting & Automatic Escalation</span>
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

        {/* Navigation Tabs (Role Protected) */}
        <nav className="flex items-center gap-1 sm:gap-2">
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
              <span>{currentUser.role} Dashboard</span>
            </button>
          )}

          <button
            onClick={() => setActiveTab('about')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'about'
                ? 'bg-[#10B981] text-[#111827] font-bold shadow-md shadow-[#10B981]/25'
                : 'text-slate-300 hover:text-[#F9FAFB] hover:bg-[#064E3B]/60'
            }`}
          >
            <Info className="w-3.5 h-3.5" />
            <span>About ZOVA</span>
          </button>
        </nav>

        {/* User Role Badge & Switch Role */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#111827] border border-[#064E3B] text-xs">
            <div className="flex flex-col text-right">
              <span className="font-semibold text-[#F9FAFB]">{currentUser.name}</span>
              <span className="text-[10px] text-[#10B981] font-semibold">
                {currentUser.role}
                {currentUser.role === 'HOD' && currentUser.department ? ` (${currentUser.department.split(' ')[0]})` : ''}
              </span>
            </div>
            <button
              onClick={onOpenLoginModal}
              className="ml-1 p-1 text-slate-300 hover:text-[#F9FAFB] rounded hover:bg-[#064E3B] transition-colors"
              title="Switch demo persona or role"
            >
              <UserCheck className="w-4 h-4 text-[#10B981]" />
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
