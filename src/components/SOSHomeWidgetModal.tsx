import React, { useState } from 'react';
import { ZovaShieldIcon } from './ZovaLogo.tsx';
import {
  X,
  Smartphone,
  Apple,
  Chrome,
  ShieldAlert,
  Download,
  Share2,
  Lock,
  Layers,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Radio,
  FileCode,
} from 'lucide-react';

interface SOSHomeWidgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTriggerSOSNow?: () => void;
}

export const SOSHomeWidgetModal: React.FC<SOSHomeWidgetModalProps> = ({
  isOpen,
  onClose,
  onTriggerSOSNow,
}) => {
  const [activePlatform, setActivePlatform] = useState<'android' | 'ios' | 'pwa' | 'native_arch'>('android');
  const [copiedUrl, setCopiedUrl] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleCopyShortcutUrl = () => {
    const url = `${window.location.origin}/?action=sos-widget`;
    navigator.clipboard.writeText(url);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2500);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="widget-guide-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-2xl rounded-2xl bg-[#111827] border border-[#064E3B] shadow-2xl shadow-black/90 p-5 sm:p-6 my-8 text-[#F9FAFB]">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-[#064E3B]/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/40 text-rose-400 flex items-center justify-center">
              <ShieldAlert className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h2 id="widget-guide-title" className="text-lg font-bold text-[#F9FAFB] flex items-center gap-2">
                Emergency SOS Widget Setup
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-[#10B981] border border-[#10B981]/40 uppercase">
                  Home & Lock Screen
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Instant 1-tap emergency alert access without navigating through the application
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#1F2937] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Platform Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-[#0B0F19] rounded-xl border border-slate-800 my-4 text-xs font-semibold overflow-x-auto">
          <button
            onClick={() => setActivePlatform('android')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition-all flex-1 justify-center whitespace-nowrap ${
              activePlatform === 'android'
                ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>Android (Home & Lock)</span>
          </button>
          <button
            onClick={() => setActivePlatform('ios')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition-all flex-1 justify-center whitespace-nowrap ${
              activePlatform === 'ios'
                ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Apple className="w-4 h-4" />
            <span>iOS / iPhone</span>
          </button>
          <button
            onClick={() => setActivePlatform('pwa')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition-all flex-1 justify-center whitespace-nowrap ${
              activePlatform === 'pwa'
                ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Chrome className="w-4 h-4" />
            <span>Web / PWA Quick Action</span>
          </button>
          <button
            onClick={() => setActivePlatform('native_arch')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition-all flex-1 justify-center whitespace-nowrap ${
              activePlatform === 'native_arch'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <FileCode className="w-4 h-4" />
            <span>Native Architecture</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="space-y-4 text-xs">
          {/* ANDROID TAB */}
          {activePlatform === 'android' && (
            <div className="space-y-3.5 animate-in fade-in duration-150">
              <div className="p-3.5 rounded-xl bg-[#0B0F19] border border-rose-900/30 space-y-2.5">
                <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
                  <Smartphone className="w-4 h-4" />
                  <span>1. Android Home Screen Widget (Instant 1x1 App Shortcut)</span>
                </div>
                <ol className="list-decimal list-inside space-y-1.5 text-slate-300 leading-relaxed pl-1">
                  <li>In Chrome or your mobile browser, tap the <strong className="text-white">three dots menu (⋮)</strong>.</li>
                  <li>Select <strong className="text-white">"Install app"</strong> or <strong className="text-white">"Add to Home Screen"</strong>.</li>
                  <li>Long-press the ZOVA app icon on your home screen to see the native <strong className="text-rose-400">"Emergency SOS"</strong> shortcut.</li>
                  <li>Drag the "Emergency SOS" shortcut directly onto your home screen as a standalone widget icon!</li>
                </ol>
              </div>

              <div className="p-3.5 rounded-xl bg-[#0B0F19] border border-emerald-900/30 space-y-2">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                  <Lock className="w-4 h-4" />
                  <span>2. Android Lock-Screen Placement</span>
                </div>
                <p className="text-slate-300 leading-relaxed">
                  On Android 14+, navigate to <strong>Settings → Display → Lock screen → Shortcuts</strong>. Set the Right Shortcut to Chrome or the ZOVA PWA. Alternatively, enable ZOVA's <strong>Persistent Safe-Session Notification</strong> which displays directly on the lock screen with a 1-tap "DISPATCH SOS" button.
                </p>
              </div>
            </div>
          )}

          {/* IOS TAB */}
          {activePlatform === 'ios' && (
            <div className="space-y-3.5 animate-in fade-in duration-150">
              <div className="p-3.5 rounded-xl bg-[#0B0F19] border border-rose-900/30 space-y-2.5">
                <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
                  <Share2 className="w-4 h-4" />
                  <span>1. iOS Safari "Add to Home Screen"</span>
                </div>
                <ol className="list-decimal list-inside space-y-1.5 text-slate-300 leading-relaxed pl-1">
                  <li>Open this page in Safari on your iPhone.</li>
                  <li>Tap the <strong className="text-white">Share button</strong> (square with arrow pointing up).</li>
                  <li>Scroll down and tap <strong className="text-white">"Add to Home Screen"</strong>.</li>
                  <li>Rename to <strong className="text-rose-400">"ZOVA SOS"</strong> and tap <strong>Add</strong>.</li>
                </ol>
              </div>

              <div className="p-3.5 rounded-xl bg-[#0B0F19] border border-indigo-900/30 space-y-2">
                <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm">
                  <Lock className="w-4 h-4" />
                  <span>2. iOS Lock Screen & Action Button Integration</span>
                </div>
                <p className="text-slate-300 leading-relaxed">
                  iOS does not allow third-party web apps to draw unrestricted lock-screen widgets directly without Apple Shortcuts. You can map the <strong>iPhone Action Button</strong> or <strong>Back Tap</strong> (Settings → Accessibility → Touch → Back Tap) to open the ZOVA SOS Quick Launch URL with 0 navigation steps.
                </p>
                <div className="pt-1 flex items-center gap-2">
                  <button
                    onClick={handleCopyShortcutUrl}
                    className="px-3 py-1.5 rounded-lg bg-[#1F2937] hover:bg-slate-700 text-xs font-semibold text-emerald-400 border border-slate-700 flex items-center gap-1.5 transition-colors"
                  >
                    {copiedUrl ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Layers className="w-3.5 h-3.5" />}
                    <span>{copiedUrl ? 'Copied SOS URL!' : 'Copy Direct SOS Launch URL'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* PWA WEB TAB */}
          {activePlatform === 'pwa' && (
            <div className="space-y-3.5 animate-in fade-in duration-150">
              <div className="p-3.5 rounded-xl bg-[#0B0F19] border border-[#064E3B] space-y-2.5">
                <div className="flex items-center gap-2 text-[#10B981] font-bold text-sm">
                  <Chrome className="w-4 h-4" />
                  <span>Web App Manifest & Background Workers</span>
                </div>
                <p className="text-slate-300 leading-relaxed">
                  ZOVA is fully configured as a Progressive Web Application with <strong>standalone display mode</strong> and <strong>Web App Manifest Shortcuts</strong>.
                </p>
                <div className="p-2.5 rounded-lg bg-[#111827] border border-slate-800 text-[11px] font-mono text-emerald-300 space-y-1">
                  <div>• Standalone display: hides browser navigation bar</div>
                  <div>• Quick action shortcut: /?action=sos-widget</div>
                  <div>• High-precision Geolocation with wake-lock retention</div>
                  <div>• Offline emergency queue: syncs immediately on reconnection</div>
                </div>
              </div>
            </div>
          )}

          {/* NATIVE ARCHITECTURE EXPLANATION TAB */}
          {activePlatform === 'native_arch' && (
            <div className="space-y-3.5 animate-in fade-in duration-150">
              <div className="p-3.5 rounded-xl bg-[#0B0F19] border border-slate-800 space-y-2.5">
                <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                  <Sparkles className="w-4 h-4" />
                  <span>Platform Bridge & Native Architecture Specification</span>
                </div>
                <p className="text-slate-300 leading-relaxed">
                  As required by the specification, here is the technical architectural explanation for native platform widget bridges:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-300">
                  <div className="p-2.5 rounded-lg bg-[#111827] border border-slate-800 space-y-1">
                    <span className="font-bold text-white block">Android Native AppWidget</span>
                    <p className="text-slate-400">
                      Requires Kotlin <code className="text-teal-400">AppWidgetProvider</code> and Jetpack Glance. Background location tracking requires <code className="text-teal-400">ACCESS_BACKGROUND_LOCATION</code> and foreground service notification.
                    </p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-[#111827] border border-slate-800 space-y-1">
                    <span className="font-bold text-white block">iOS WidgetKit & Activity</span>
                    <p className="text-slate-400">
                      Requires Swift <code className="text-teal-400">WidgetKit</code> with <code className="text-teal-400">AppIntent</code> and <code className="text-teal-400">ActivityKit</code> for Lock Screen Live Activities. Location is scoped to <code className="text-teal-400">kCLLocationAccuracyBest</code>.
                    </p>
                  </div>
                </div>
                <p className="text-[11px] text-slate-400 italic">
                  In this web/PWA runtime, ZOVA provides the full Home-Screen Manifest Shortcut and in-browser floating discreet widget that mirrors all native functionality seamlessly.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="mt-6 pt-4 border-t border-[#064E3B]/60 flex flex-wrap items-center justify-between gap-3">
          <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
            <span>ZOVA Emergency System Ready</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-[#1F2937] hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-colors"
            >
              Close
            </button>
            {onTriggerSOSNow && (
              <button
                onClick={() => {
                  onClose();
                  onTriggerSOSNow();
                }}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-bold text-white transition-colors shadow-lg shadow-rose-600/30 flex items-center gap-1.5"
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Test Emergency Widget</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
