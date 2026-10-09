/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { CurrentUser, Role } from './types/index.ts';
import { storage } from './services/storage.ts';
import { Header } from './components/Header.tsx';
import { LoginModal } from './components/LoginModal.tsx';
import { RegistrationModal } from './components/RegistrationModal.tsx';
import { RoleVerificationModal } from './components/RoleVerificationModal.tsx';
import { StudentComplaintForm } from './components/StudentComplaintForm.tsx';
import { StudentTracking } from './components/StudentTracking.tsx';
import { AuthorityDashboard } from './components/AuthorityDashboard.tsx';
import { FacultyDashboard } from './components/FacultyDashboard.tsx';
import { OtherRoleDashboard } from './components/OtherRoleDashboard.tsx';
import { CampusDirectoryView } from './components/CampusDirectoryView.tsx';
import { EmergencyContactsView } from './components/EmergencyContactsView.tsx';
import { AboutSection } from './components/AboutSection.tsx';
import { LoadingScreen } from './components/LoadingScreen.tsx';
import { ZovaShieldIcon } from './components/ZovaLogo.tsx';
import { Shield, Lock, ShieldAlert } from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState<CurrentUser>(storage.getCurrentUser());
  const [activeTab, setActiveTab] = useState<string>('report');
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);
  const [isRegistrationModalOpen, setIsRegistrationModalOpen] = useState<boolean>(false);
  const [isRoleVerificationModalOpen, setIsRoleVerificationModalOpen] = useState<boolean>(false);
  const [trackReportId, setTrackReportId] = useState<string>('');
  const [notificationMsg, setNotificationMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initial loading splash screen & First launch onboarding check
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
      // Trigger first launch registration setup if not yet registered
      if (!storage.hasRegistered()) {
        setIsRegistrationModalOpen(true);
      }
    }, 850);
    return () => clearTimeout(timer);
  }, []);

  // Sync active tab with role permissions
  useEffect(() => {
    if (currentUser.role === 'Student') {
      if (activeTab === 'dashboard') {
        setActiveTab('report');
      }
    } else {
      if (activeTab === 'report' || activeTab === 'track') {
        setActiveTab('dashboard');
      }
    }
  }, [currentUser.role]);

  const handleSelectUser = (user: CurrentUser) => {
    storage.setCurrentUser(user);
    setCurrentUser(user);
    if (user.role === 'Student') {
      setActiveTab('report');
    } else {
      setActiveTab('dashboard');
    }
    showToast(`Switched active persona to ${user.name} (${user.role})`);
  };

  const handleSaveRegistrationUser = (user: CurrentUser) => {
    storage.setRegistered(true);
    storage.setCurrentUser(user);
    setCurrentUser(user);
    if (user.role === 'Student') {
      setActiveTab('report');
    } else {
      setActiveTab('dashboard');
    }
    showToast(`Profile & Campus saved for ${user.name} at ${user.campus.collegeName}`);
  };

  const handleResetDemoData = () => {
    storage.resetToDemoData();
    showToast('Demo data reloaded: 3 departments and repeat offenders seeded!');
    window.location.reload();
  };

  const showToast = (msg: string) => {
    setNotificationMsg(msg);
    setTimeout(() => setNotificationMsg(null), 3500);
  };

  const handleTrackReport = (reportId: string) => {
    setTrackReportId(reportId);
    setActiveTab('track');
  };

  const isStudent = currentUser.role === 'Student';
  const isAuthority = ['HOD', 'Dean', 'Higher Authority'].includes(currentUser.role);
  const isFaculty = currentUser.role === 'Faculty';
  const isOther = currentUser.role === 'Other';

  if (isLoading) {
    return <LoadingScreen message="Initializing ZOVA anti-ragging security protocols..." />;
  }

  return (
    <div className="min-h-screen bg-[#111827] text-[#F9FAFB] flex flex-col font-sans selection:bg-[#10B981] selection:text-[#111827]">
      {/* Toast Notification */}
      {notificationMsg && (
        <aside
          aria-label="Status notifications"
          className="fixed bottom-4 right-4 z-50 p-3.5 rounded-xl bg-[#064E3B] text-[#F9FAFB] border border-[#10B981]/70 text-xs font-semibold shadow-2xl shadow-black/80 flex items-center gap-2 animate-bounce"
        >
          <ZovaShieldIcon className="w-5 h-5 !p-0.5" />
          <span>{notificationMsg}</span>
        </aside>
      )}

      {/* Header */}
      <Header
        currentUser={currentUser}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenLoginModal={() => setIsLoginModalOpen(true)}
        onOpenRegistration={() => setIsRegistrationModalOpen(true)}
        onResetDemoData={handleResetDemoData}
      />

      {/* Main Content View */}
      <main className="flex-1 bg-[#111827]">
        {/* STUDENT VIEWS */}
        {isStudent && activeTab === 'report' && (
          <StudentComplaintForm
            currentUser={currentUser}
            onTrackReport={handleTrackReport}
            onOpenEmergencyHelplines={() => setActiveTab('emergency')}
          />
        )}

        {isStudent && activeTab === 'track' && (
          <StudentTracking
            currentUser={currentUser}
            initialReportId={trackReportId}
            onOpenSubmitNew={() => setActiveTab('report')}
          />
        )}

        {/* ROLE BASED DASHBOARDS */}
        {/* 1. Authority View (HOD, Dean, Higher Authority) */}
        {isAuthority && activeTab === 'dashboard' && (
          <AuthorityDashboard
            currentUser={currentUser}
            onVerifyUser={(updated) => {
              storage.setCurrentUser(updated);
              setCurrentUser(updated);
              showToast(`Officer role verified: ${updated.role}`);
            }}
          />
        )}

        {/* 2. Faculty View */}
        {isFaculty && activeTab === 'dashboard' && (
          <FacultyDashboard
            currentUser={currentUser}
            onOpenDirectory={() => setActiveTab('directory')}
            onOpenEmergency={() => setActiveTab('emergency')}
            onOpenVerification={() => setIsRoleVerificationModalOpen(true)}
          />
        )}

        {/* 3. Custom Other Role View (Counsellor, Warden, Staff) */}
        {isOther && activeTab === 'dashboard' && (
          <OtherRoleDashboard
            currentUser={currentUser}
            onOpenDirectory={() => setActiveTab('directory')}
            onOpenEmergency={() => setActiveTab('emergency')}
            onOpenVerification={() => setIsRoleVerificationModalOpen(true)}
          />
        )}

        {/* CAMPUS DIRECTORY VIEW (All Roles) */}
        {activeTab === 'directory' && (
          <CampusDirectoryView currentUser={currentUser} />
        )}

        {/* EMERGENCY HELPLINES VIEW (All Roles) */}
        {activeTab === 'emergency' && (
          <EmergencyContactsView
            currentUser={currentUser}
            onOpenReportForm={() => setActiveTab('report')}
          />
        )}

        {/* Role Guard: If Student accidentally targets dashboard or Authority targets report */}
        {!isStudent && (activeTab === 'report' || activeTab === 'track') && (
          <div className="max-w-md mx-auto my-16 p-8 rounded-2xl bg-[#111827] border border-[#064E3B] shadow-2xl text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-[#064E3B]/80 border border-[#10B981]/40 text-[#10B981] flex items-center justify-center mx-auto">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold text-[#F9FAFB]">Access Scoped to Student Role</h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              As an authorized campus officer ({currentUser.role}), complaint filing is disabled. Please use your officer dashboard or switch to a Student persona.
            </p>
            <button
              onClick={() => setActiveTab('dashboard')}
              className="px-4 py-2 rounded-lg bg-[#10B981] hover:bg-[#059669] text-xs font-bold text-[#111827] transition-colors shadow-md shadow-[#10B981]/20"
            >
              Go to {currentUser.role} Dashboard
            </button>
          </div>
        )}

        {isStudent && activeTab === 'dashboard' && (
          <div className="max-w-md mx-auto my-16 p-8 rounded-2xl bg-[#111827] border border-[#064E3B] shadow-2xl text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-[#064E3B]/80 border border-[#10B981]/40 text-[#10B981] flex items-center justify-center mx-auto">
              <Lock className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold text-[#F9FAFB]">Access Denied: Officer Authorization Required</h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              Students cannot access administrative authority consoles. To test officer features, switch to HOD, Dean, or Higher Authority persona using the persona switcher above.
            </p>
            <button
              onClick={() => setActiveTab('report')}
              className="px-4 py-2 rounded-lg bg-[#10B981] hover:bg-[#059669] text-xs font-bold text-[#111827] transition-colors shadow-md shadow-[#10B981]/20"
            >
              Return to Student Portal
            </button>
          </div>
        )}

        {/* ABOUT VIEW (Visible to all roles) */}
        {activeTab === 'about' && <AboutSection />}
      </main>

      {/* Footer */}
      <footer className="border-t border-[#064E3B]/50 bg-[#111827] py-8 px-4 sm:px-6 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <ZovaShieldIcon className="w-6 h-6 !p-0.5" />
            <span className="font-extrabold tracking-wider text-[#F9FAFB] text-sm">ZOVA</span>
            <span className="text-[#064E3B]">·</span>
            <span className="text-emerald-400 font-semibold">Safer Campus. Stronger You.</span>
            <span className="text-[#064E3B] hidden md:inline">·</span>
            <span className="text-slate-400 hidden md:inline">Zero-Tolerance Anti-Ragging Network</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <button
              onClick={() => setActiveTab('directory')}
              className="hover:text-[#10B981] transition-colors"
            >
              Campus Directory
            </button>
            <button
              onClick={() => setActiveTab('emergency')}
              className="hover:text-rose-400 transition-colors"
            >
              Emergency Helplines
            </button>
            <button
              onClick={() => setActiveTab('about')}
              className="hover:text-[#10B981] transition-colors"
            >
              Escalation Matrix
            </button>
            <span className="font-mono text-slate-400 text-[11px]">ZOVA-2026-PRO</span>
          </div>
        </div>
      </footer>

      {/* Login Role Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        currentUser={currentUser}
        onSelectUser={handleSelectUser}
        onOpenFullRegistration={() => setIsRegistrationModalOpen(true)}
      />

      {/* Registration & Campus Profile Setup Wizard */}
      <RegistrationModal
        isOpen={isRegistrationModalOpen}
        onClose={() => setIsRegistrationModalOpen(false)}
        currentUser={currentUser}
        onSaveUser={handleSaveRegistrationUser}
        isFirstLaunch={!storage.hasRegistered()}
      />

      {/* Role Verification Passkey Modal */}
      <RoleVerificationModal
        isOpen={isRoleVerificationModalOpen}
        onClose={() => setIsRoleVerificationModalOpen(false)}
        currentUser={currentUser}
        onVerificationSuccess={(updated) => {
          storage.setCurrentUser(updated);
          setCurrentUser(updated);
          showToast(`Role verification successful: ${updated.role}`);
        }}
      />
    </div>
  );
}
