import React from 'react';
import { ZovaLogo } from './ZovaLogo.tsx';
import { ShieldCheck } from 'lucide-react';

interface LoadingScreenProps {
  message?: string;
  isInitial?: boolean;
}

/**
 * Official ZOVA Loading & Splash Screen
 * Featuring charcoal background, pulsing ZOVA shield symbol with
 * teal-to-emerald gradient, and official tagline "Safer Campus. Stronger You."
 */
export const LoadingScreen: React.FC<LoadingScreenProps> = ({
  message = 'Initializing encrypted campus safety protocols...',
  isInitial = false,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#111827] text-[#F9FAFB] p-6 selection:bg-[#10B981] selection:text-[#111827]">
      {/* Ambient Radial Background Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_40%,rgba(6,78,59,0.45),rgba(17,24,39,0.95))] pointer-events-none" />

      {/* Brand Hero Container */}
      <div className="relative z-10 flex flex-col items-center text-center max-w-md mx-auto space-y-6">
        {/* Pulsing Shield Crest */}
        <div className="relative animate-pulse">
          <div className="absolute -inset-4 bg-[#10B981]/20 rounded-full blur-xl" />
          <ZovaLogo variant="hero" showTagline={true} />
        </div>

        {/* Loading Progress Bar */}
        <div className="w-64 sm:w-72 space-y-2 pt-4">
          <div className="h-1.5 w-full bg-[#064E3B] rounded-full overflow-hidden p-0.5 border border-[#10B981]/30">
            <div className="h-full bg-gradient-to-r from-[#0D9488] via-[#10B981] to-[#34D399] rounded-full animate-[progress_1.8s_ease-in-out_infinite]" />
          </div>

          <div className="flex items-center justify-center gap-2 text-xs text-slate-300 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-[#10B981] animate-spin" />
            <span className="font-mono text-[11px] text-emerald-300">{message}</span>
          </div>
        </div>

        {/* Brand Assurance Badges */}
        <div className="pt-6 border-t border-[#064E3B]/60 flex items-center justify-center gap-4 text-[11px] text-slate-400">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
            Zero Retaliation Shield
          </span>
          <span className="text-[#064E3B]">·</span>
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
            Multi-Tier Escalation
          </span>
        </div>
      </div>
    </div>
  );
};
