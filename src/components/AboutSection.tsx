import React from 'react';
import { GitPullRequest, Lock, AlertOctagon, HeartHandshake, ShieldCheck } from 'lucide-react';
import { EscalationBadge } from './EscalationBadge.tsx';
import { ZovaLogo, ZovaShieldIcon } from './ZovaLogo.tsx';

export const AboutSection: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto py-12 px-4 sm:px-6 space-y-12">
      {/* Intro with ZOVA Logo & Official Tagline */}
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <ZovaLogo variant="hero" showTagline={false} />
        </div>

        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#064E3B] border border-[#10B981]/40 text-[#10B981] text-xs font-semibold shadow-sm">
          <ShieldCheck className="w-3.5 h-3.5 text-[#10B981]" />
          <span>The Official ZOVA Mission</span>
        </div>

        <h1 className="text-3xl font-extrabold text-[#F9FAFB] tracking-tight sm:text-4xl">
          Safer Campus. Stronger You.
        </h1>

        <p className="text-sm text-slate-300 max-w-2xl mx-auto leading-relaxed">
          <strong className="text-[#F9FAFB]">ZOVA</strong> was engineered to dismantle the barriers preventing students from reporting intimidation, coercion, hazing, and cyber harassment with an unyielding shield of privacy and automated escalation.
        </p>
      </div>

      {/* 3 Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Pillar 1: The Problem */}
        <div className="p-6 rounded-2xl bg-[#111827] border border-[#064E3B] space-y-3 shadow-lg shadow-black/40 hover:border-[#10B981]/40 transition-all">
          <div className="w-10 h-10 rounded-xl bg-[#064E3B] border border-[#10B981]/40 text-[#10B981] flex items-center justify-center">
            <AlertOctagon className="w-5 h-5" />
          </div>
          <h2 className="text-base font-bold text-[#F9FAFB]">The Problem</h2>
          <p className="text-xs text-slate-300 leading-relaxed">
            Victims frequently fear academic retribution, hostel isolation, or physical retaliation when reporting seniors or influential campus cliques. Traditional physical complaint boxes often lead to swept-under-the-rug allegations or compromised student identities.
          </p>
        </div>

        {/* Pillar 2: Pure Escalation Engine */}
        <div className="p-6 rounded-2xl bg-[#111827] border border-[#064E3B] space-y-3 shadow-lg shadow-black/40 hover:border-[#10B981]/40 transition-all">
          <div className="w-10 h-10 rounded-xl bg-[#064E3B] border border-[#10B981]/40 text-[#10B981] flex items-center justify-center">
            <GitPullRequest className="w-5 h-5" />
          </div>
          <h2 className="text-base font-bold text-[#F9FAFB]">How ZOVA Escalation Works</h2>
          <p className="text-xs text-slate-300 leading-relaxed">
            The ZOVA backend automatically matches repeat offenders across reports using verified phone numbers or names:
          </p>
          <ul className="text-xs text-slate-300 space-y-2 pt-1">
            <li className="flex flex-col gap-1">
              <div className="flex items-center gap-1.5">
                <span className="font-mono text-[#10B981] font-bold">1st Complaint:</span>
                <EscalationBadge level={1} size="xs" />
              </div>
              <span className="text-[11px] text-slate-400">Assigned to HOD of suspect's department for initial inquiry.</span>
            </li>
            <li className="flex flex-col gap-1">
              <div className="flex items-center gap-1.5">
                <span className="font-mono text-[#10B981] font-bold">2nd Complaint:</span>
                <EscalationBadge level={2} size="xs" />
              </div>
              <span className="text-[11px] text-slate-400">All complaints against suspect elevated to Dean of Student Welfare.</span>
            </li>
            <li className="flex flex-col gap-1">
              <div className="flex items-center gap-1.5">
                <span className="font-mono text-[#10B981] font-bold">3rd+ Complaint:</span>
                <EscalationBadge level={3} size="xs" />
              </div>
              <span className="text-[11px] text-slate-400">Apex elevation to Higher Authority & Anti-Ragging Committee Tribunal.</span>
            </li>
          </ul>
        </div>

        {/* Pillar 3: Complete Privacy Shield */}
        <div className="p-6 rounded-2xl bg-[#111827] border border-[#064E3B] space-y-3 shadow-lg shadow-black/40 hover:border-[#10B981]/40 transition-all">
          <div className="w-10 h-10 rounded-xl bg-[#064E3B] border border-[#10B981]/40 text-[#10B981] flex items-center justify-center">
            <Lock className="w-5 h-5" />
          </div>
          <h2 className="text-base font-bold text-[#F9FAFB]">How Privacy is Protected</h2>
          <p className="text-xs text-slate-300 leading-relaxed">
            <strong className="text-[#F9FAFB]">Authorities NEVER see student identities.</strong> Reviewers only see "Anonymous Reporter" and the unique ZOVA Report ID. Students can track full status and actions using their confidential ID without risking exposure or retaliation.
          </p>
        </div>
      </div>

      {/* Smart AI Section */}
      <div className="p-6 rounded-2xl bg-[#064E3B]/30 border border-[#064E3B] flex flex-col sm:flex-row items-center gap-6 shadow-xl shadow-black/40">
        <div className="w-12 h-12 rounded-xl bg-[#064E3B] border border-[#10B981]/50 text-[#10B981] flex items-center justify-center shrink-0">
          <HeartHandshake className="w-6 h-6" />
        </div>
        <div className="space-y-1 text-xs">
          <h3 className="text-sm font-bold text-[#F9FAFB]">
            AI-Powered Objective Processing with Gemini 3.8 Flash
          </h3>
          <p className="text-slate-300 leading-relaxed">
            ZOVA integrates Google Gemini to objectively classify severity levels (Low, Medium, High, Critical), provide neutral non-prejudicial summaries for inquiry officers, and help distressed students rewrite rough notes into structured, factual incident statements without altering any facts.
          </p>
        </div>
      </div>
    </div>
  );
};
