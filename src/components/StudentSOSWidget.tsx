import React, { useState, useEffect, useRef } from 'react';
import {
  CurrentUser,
  SOSIncident,
  SOSLocation,
  SOSWidgetPreferences,
  SOSIncidentStatus,
} from '../types/index.ts';
import { storage } from '../services/storage.ts';
import { apiClient } from '../services/apiClient.ts';
import { InteractiveCampusMap } from './InteractiveCampusMap.tsx';
import { SOSHomeWidgetModal } from './SOSHomeWidgetModal.tsx';
import { ZovaShieldIcon } from './ZovaLogo.tsx';
import {
  ShieldAlert,
  MapPin,
  Compass,
  PhoneCall,
  Volume2,
  VolumeX,
  Vibrate,
  Eye,
  EyeOff,
  X,
  CheckCircle2,
  AlertTriangle,
  Radio,
  Clock,
  Navigation,
  RefreshCw,
  Sliders,
  Smartphone,
  BookOpen,
  Calculator,
  RotateCcw,
} from 'lucide-react';

interface StudentSOSWidgetProps {
  currentUser: CurrentUser;
  onClose?: () => void;
  isFloating?: boolean;
}

export const StudentSOSWidget: React.FC<StudentSOSWidgetProps> = ({
  currentUser,
  onClose,
  isFloating = false,
}) => {
  const [preferences, setPreferences] = useState<SOSWidgetPreferences>(storage.getSOSPreferences());
  const [activeIncident, setActiveIncident] = useState<SOSIncident | null>(null);
  const [isPressing, setIsPressing] = useState<boolean>(false);
  const [pressProgress, setPressProgress] = useState<number>(0);
  const [countdownRemaining, setCountdownRemaining] = useState<number | null>(null);
  const [isTriggering, setIsTriggering] = useState<boolean>(false);
  const [isStealthMode, setIsStealthMode] = useState<boolean>(preferences.stealthDisguiseMode);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [showWidgetGuide, setShowWidgetGuide] = useState<boolean>(false);
  const [showCancelModal, setShowCancelModal] = useState<boolean>(false);
  const [cancelReason, setCancelReason] = useState<string>('Accidental tap / False alarm');
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [offlineQueued, setOfflineQueued] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [watchId, setWatchId] = useState<number | null>(null);

  const pressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // Flush offline queue if any
      const queue = storage.getOfflineSOSQueue();
      if (queue.length > 0) {
        queue.forEach(async (queued) => {
          try {
            const res = await apiClient.triggerSOS(queued.student, queued.location, queued.triggerMode, queued.locationError);
            setActiveIncident(res.incident);
            storage.setActiveSOSId(res.incident.id);
          } catch {}
        });
        storage.clearOfflineSOSQueue();
        setOfflineQueued(false);
      }
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Check if there's already an active SOS in progress
  useEffect(() => {
    const activeId = storage.getActiveSOSId();
    if (activeId) {
      apiClient.getSOSDetails(activeId).then((incident) => {
        if (incident && incident.status !== 'Resolved' && incident.status !== 'Cancelled') {
          setActiveIncident(incident);
        } else {
          storage.setActiveSOSId(null);
        }
      });
    }
  }, []);

  // Poll for active SOS updates every 2.5 seconds when an incident is active
  useEffect(() => {
    if (!activeIncident || activeIncident.status === 'Resolved' || activeIncident.status === 'Cancelled') {
      return;
    }

    const interval = setInterval(async () => {
      try {
        const updated = await apiClient.getSOSDetails(activeIncident.id);
        if (updated) {
          setActiveIncident(updated);
          if (updated.status === 'Resolved' || updated.status === 'Cancelled') {
            storage.setActiveSOSId(null);
          }
        }
      } catch {}
    }, 2500);

    return () => clearInterval(interval);
  }, [activeIncident?.id, activeIncident?.status]);

  // Real-time location tracking stream when incident is active
  useEffect(() => {
    if (!activeIncident || activeIncident.status === 'Resolved' || activeIncident.status === 'Cancelled') {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
        setWatchId(null);
      }
      return;
    }

    if (navigator.geolocation && preferences.autoShareLocation) {
      const id = navigator.geolocation.watchPosition(
        (pos) => {
          const loc: SOSLocation = {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
            timestamp: new Date().toISOString(),
            campusZone: 'Hostel Quad & Academic Way',
          };
          apiClient.updateSOSLocation(activeIncident.id, loc);
        },
        () => {},
        { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
      );
      setWatchId(id);
    }

    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [activeIncident?.id, activeIncident?.status, preferences.autoShareLocation]);

  // Haptic Feedback Helper
  const triggerHaptics = (pattern: number | number[]) => {
    if (preferences.enableHaptics && typeof navigator !== 'undefined' && navigator.vibrate) {
      try {
        navigator.vibrate(pattern);
      } catch {}
    }
  };

  // Audio Feedback Helper (Synthesized emergency chime)
  const triggerAudioFeedback = () => {
    if (!preferences.enableAudioFeedback) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime); // A5 tone
      osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.25);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } catch {}
  };

  // Execute SOS Trigger
  const executeSOSTrigger = async (
    mode: 'hold_press' | 'instant_tap' | 'discreet_stealth' | 'widget_shortcut'
  ) => {
    setIsTriggering(true);
    setStatusMessage('Acquiring high-accuracy campus location...');
    triggerHaptics([100, 50, 150, 50, 300]);
    triggerAudioFeedback();

    let locationData: SOSLocation | null = null;
    let locationErrorString: string | undefined = undefined;

    // Acquire GPS location
    if (navigator.geolocation && preferences.autoShareLocation) {
      try {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 6000,
            maximumAge: 0,
          });
        });

        locationData = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: new Date().toISOString(),
          campusZone: 'Central Campus Quad / Academic Sector',
          addressHint: `${currentUser.campus.collegeName} Grounds`,
        };
      } catch (err: any) {
        locationErrorString = err.message || 'GPS permission denied or timeout';
      }
    } else {
      locationErrorString = 'Location auto-share disabled in preferences';
    }

    // Network check
    if (!navigator.onLine) {
      storage.enqueueOfflineSOS({
        student: currentUser,
        location: locationData,
        triggerMode: mode,
        locationError: locationErrorString,
      });
      setOfflineQueued(true);
      setIsTriggering(false);
      setStatusMessage('Network offline. SOS queued locally & retrying continuous sync.');
      return;
    }

    try {
      setStatusMessage('Broadcasting emergency alert to Campus Security & Dean...');
      const response = await apiClient.triggerSOS(
        currentUser,
        locationData,
        mode,
        locationErrorString
      );

      setActiveIncident(response.incident);
      storage.setActiveSOSId(response.incident.id);
      setIsTriggering(false);
      setStatusMessage('Alert acknowledged by server. First responders notified.');
      triggerHaptics([200, 100, 200]);
    } catch (err: any) {
      setIsTriggering(false);
      setStatusMessage(`Transmission error: ${err.message}. Retrying via background channel...`);
      // Fallback save to offline queue
      storage.enqueueOfflineSOS({
        student: currentUser,
        location: locationData,
        triggerMode: mode,
        locationError: locationErrorString,
      });
      setOfflineQueued(true);
    }
  };

  // Hold-to-activate Handlers
  const handlePressStart = () => {
    if (activeIncident && activeIncident.status !== 'Resolved' && activeIncident.status !== 'Cancelled') {
      return;
    }

    if (preferences.activationGesture === 'instant_countdown') {
      startCountdownGracePeriod();
      return;
    }

    setIsPressing(true);
    setPressProgress(0);
    triggerHaptics(60);

    const startTime = Date.now();
    const duration = preferences.holdDurationSeconds * 1000;

    progressIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(100, (elapsed / duration) * 100);
      setPressProgress(progress);

      if (progress >= 100) {
        clearInterval(progressIntervalRef.current!);
        setIsPressing(false);
        setPressProgress(100);
        executeSOSTrigger('hold_press');
      }
    }, 30);
  };

  const handlePressEnd = () => {
    if (preferences.activationGesture === 'hold_to_activate') {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      if (pressTimerRef.current) clearTimeout(pressTimerRef.current);
      setIsPressing(false);
      setPressProgress(0);
    }
  };

  // Grace Period Countdown (Instant Tap mode)
  const startCountdownGracePeriod = () => {
    const totalSeconds = preferences.countdownGracePeriodSeconds;
    setCountdownRemaining(totalSeconds);
    triggerHaptics(80);

    countdownIntervalRef.current = setInterval(() => {
      setCountdownRemaining((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(countdownIntervalRef.current!);
          executeSOSTrigger('instant_tap');
          return null;
        }
        triggerHaptics(50);
        return prev - 1;
      });
    }, 1000);
  };

  const cancelCountdown = () => {
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    setCountdownRemaining(null);
    triggerHaptics([80, 50, 80]);
  };

  // Cancel Active SOS
  const handleConfirmCancelSOS = async () => {
    if (!activeIncident) return;
    try {
      const updated = await apiClient.cancelSOS(activeIncident.id, cancelReason, currentUser);
      setActiveIncident(updated);
      storage.setActiveSOSId(null);
      setShowCancelModal(false);
      triggerHaptics(100);
    } catch (err: any) {
      alert(`Could not cancel alert: ${err.message}`);
    }
  };

  // Save Preferences
  const handleUpdatePreferences = (newPrefs: SOSWidgetPreferences) => {
    setPreferences(newPrefs);
    storage.saveSOSPreferences(newPrefs);
    setShowSettings(false);
  };

  // ==========================================
  // STEALTH / DISGUISE COVER SCREEN
  // ==========================================
  if (isStealthMode) {
    return (
      <div className="fixed inset-0 z-50 bg-[#0F172A] text-slate-200 font-sans p-4 flex flex-col justify-between select-none">
        {/* Cover Header */}
        <div className="flex items-center justify-between border-b border-slate-700/60 pb-3">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-400" />
            <span className="font-bold text-sm tracking-wide text-white">Advanced Data Structures - Notes</span>
          </div>

          <div className="flex items-center gap-2">
            {/* Stealth Pulse Dot indicating active SOS transmission without alerting bystander */}
            {activeIncident && (
              <span
                className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"
                title="Stealth transmission active"
              />
            )}
            <button
              onClick={() => setIsStealthMode(false)}
              className="p-1 text-slate-500 hover:text-white"
              title="Exit Stealth Screen"
            >
              <Eye className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Fake Study Notes Content */}
        <div className="space-y-4 my-auto max-w-lg mx-auto text-xs text-slate-300">
          <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700">
            <h4 className="font-bold text-indigo-300 mb-1">Module 4: Graph Algorithms</h4>
            <p className="text-slate-400 leading-relaxed">
              Dijkstra's shortest path uses a priority queue with adjacency list representation. Time complexity: O((V + E) log V).
            </p>
          </div>

          <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700">
            <h4 className="font-bold text-indigo-300 mb-1">Assignment 3 Submission Due</h4>
            <p className="text-slate-400 leading-relaxed">
              Submit lab manual hard-copies to HOD desk before 4:00 PM Thursday. Late submissions subject to deduction.
            </p>
          </div>

          {activeIncident && (
            <div className="p-2.5 rounded-lg bg-emerald-950/30 border border-emerald-800/40 text-[11px] text-emerald-400 flex items-center justify-between">
              <span>Status: {activeIncident.status}</span>
              <button
                onClick={() => setIsStealthMode(false)}
                className="underline hover:text-emerald-300"
              >
                View SOS Details
              </button>
            </div>
          )}
        </div>

        {/* Cover Footer */}
        <div className="flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-800 pt-2">
          <span>Campus LMS Synchronized</span>
          <button
            onClick={() => setIsStealthMode(false)}
            className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
          >
            <EyeOff className="w-3.5 h-3.5" />
            <span>Return to Safety Console</span>
          </button>
        </div>
      </div>
    );
  }

  // ==========================================
  // REGULAR ZOVA SOS WIDGET VIEW
  // ==========================================
  return (
    <div className={`rounded-3xl border border-rose-900/60 bg-[#0B0F19] text-[#F9FAFB] shadow-2xl overflow-hidden ${isFloating ? 'max-w-md w-full mx-auto' : 'w-full'}`}>
      {/* Top Banner Toolbar */}
      <div className="p-4 bg-[#111827] border-b border-[#064E3B]/60 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <div className="w-9 h-9 rounded-xl bg-rose-500/10 border border-rose-500/40 text-rose-400 flex items-center justify-center">
              <ShieldAlert className="w-5 h-5 animate-pulse" />
            </div>
            <span className="w-2 h-2 rounded-full bg-emerald-400 absolute -top-0.5 -right-0.5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-sm text-[#F9FAFB] tracking-wide">
                Campus Emergency SOS
              </h3>
              <span className="px-1.5 py-0.5 text-[9px] font-extrabold uppercase rounded bg-rose-950 text-rose-400 border border-rose-800/50">
                Live Harassment Shield
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              {currentUser.campus.collegeName} · {currentUser.campus.campusCode}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Stealth Cover Toggle */}
          <button
            onClick={() => setIsStealthMode(true)}
            className="p-2 rounded-lg bg-[#1F2937] hover:bg-slate-700 text-slate-300 hover:text-white text-xs transition-colors"
            title="Switch to Stealth Disguise Screen (Study Notes)"
          >
            <EyeOff className="w-4 h-4" />
          </button>

          {/* Home Screen Widget Setup Guide */}
          <button
            onClick={() => setShowWidgetGuide(true)}
            className="p-2 rounded-lg bg-[#1F2937] hover:bg-slate-700 text-slate-300 hover:text-white text-xs transition-colors"
            title="Add SOS Widget to Home Screen"
          >
            <Smartphone className="w-4 h-4" />
          </button>

          {/* Preferences */}
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 rounded-lg bg-[#1F2937] hover:bg-slate-700 text-slate-300 hover:text-white text-xs transition-colors"
            title="SOS Widget Settings"
          >
            <Sliders className="w-4 h-4" />
          </button>

          {onClose && (
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Offline Alert Bar */}
      {!isOnline && (
        <div className="px-4 py-2 bg-amber-950/80 border-b border-amber-800/60 text-amber-200 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Network disconnected. Offline safe queue active.</span>
          </div>
          <a
            href="tel:112"
            className="px-2.5 py-1 rounded bg-amber-600 hover:bg-amber-500 text-[#111827] font-bold text-[11px] flex items-center gap-1 shrink-0"
          >
            <PhoneCall className="w-3 h-3" />
            <span>Call 112</span>
          </a>
        </div>
      )}

      {/* Widget Settings Drawer */}
      {showSettings && (
        <div className="p-4 bg-[#111827] border-b border-[#064E3B] space-y-3.5 text-xs animate-in slide-in-from-top-2">
          <div className="flex items-center justify-between font-bold text-white">
            <span>SOS Widget Safety Preferences</span>
            <button
              onClick={() => setShowSettings(false)}
              className="text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-2">
            <label className="text-slate-400 font-semibold block">Activation Gesture</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() =>
                  handleUpdatePreferences({ ...preferences, activationGesture: 'hold_to_activate' })
                }
                className={`p-2 rounded-xl border text-center transition-all ${
                  preferences.activationGesture === 'hold_to_activate'
                    ? 'bg-rose-950/60 border-rose-500 text-white font-bold'
                    : 'bg-[#1F2937] border-slate-700 text-slate-300'
                }`}
              >
                Press & Hold (2s)
                <span className="block text-[10px] text-slate-400">Prevents accidental taps</span>
              </button>
              <button
                onClick={() =>
                  handleUpdatePreferences({ ...preferences, activationGesture: 'instant_countdown' })
                }
                className={`p-2 rounded-xl border text-center transition-all ${
                  preferences.activationGesture === 'instant_countdown'
                    ? 'bg-rose-950/60 border-rose-500 text-white font-bold'
                    : 'bg-[#1F2937] border-slate-700 text-slate-300'
                }`}
              >
                Instant + 5s Grace
                <span className="block text-[10px] text-slate-400">Immediate trigger</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.enableHaptics}
                onChange={(e) =>
                  handleUpdatePreferences({ ...preferences, enableHaptics: e.target.checked })
                }
                className="w-4 h-4 rounded text-rose-600 bg-slate-800 border-slate-700 focus:ring-0"
              />
              <span>Tactile Haptics</span>
            </label>

            <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.enableAudioFeedback}
                onChange={(e) =>
                  handleUpdatePreferences({ ...preferences, enableAudioFeedback: e.target.checked })
                }
                className="w-4 h-4 rounded text-rose-600 bg-slate-800 border-slate-700 focus:ring-0"
              />
              <span>Audio Feedback</span>
            </label>

            <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.autoShareLocation}
                onChange={(e) =>
                  handleUpdatePreferences({ ...preferences, autoShareLocation: e.target.checked })
                }
                className="w-4 h-4 rounded text-rose-600 bg-slate-800 border-slate-700 focus:ring-0"
              />
              <span>Auto-Stream GPS</span>
            </label>
          </div>
        </div>
      )}

      {/* Main Body */}
      <div className="p-5 sm:p-6 space-y-6">
        {/* ============================================================== */}
        {/* CASE 1: ACTIVE EMERGENCY SOS IN PROGRESS */}
        {/* ============================================================== */}
        {activeIncident && activeIncident.status !== 'Resolved' && activeIncident.status !== 'Cancelled' ? (
          <div className="space-y-5 animate-in fade-in duration-200">
            {/* Pulsing Emergency Status Badge */}
            <div className="p-4 rounded-2xl bg-rose-950/40 border-2 border-rose-600 shadow-xl shadow-rose-950/50 flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="relative mt-0.5">
                  <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center animate-pulse">
                    <Radio className="w-5 h-5" />
                  </div>
                  <span className="w-3 h-3 rounded-full bg-rose-400 absolute -top-1 -right-1 animate-ping" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-rose-400">
                      {activeIncident.id}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-rose-600 text-white">
                      {activeIncident.status}
                    </span>
                  </div>
                  <h4 className="text-base font-extrabold text-[#F9FAFB] mt-0.5">
                    Emergency Alert Active
                  </h4>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Campus Security & Anti-Ragging officers are notified with your live coordinates.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowCancelModal(true)}
                className="px-3 py-1.5 rounded-xl bg-[#1F2937] hover:bg-slate-700 text-xs font-semibold text-rose-300 hover:text-white border border-rose-800/40 transition-colors shrink-0"
              >
                Cancel SOS
              </button>
            </div>

            {/* Acknowledgment & Responder Info */}
            {activeIncident.acknowledgedBy ? (
              <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/50 text-xs flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-[#10B981] flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-bold text-[#10B981] block">
                    Acknowledged by {activeIncident.acknowledgedBy.role} ({activeIncident.acknowledgedBy.name})
                  </span>
                  <span className="text-slate-300 text-[11px]">
                    Emergency Response Squad has been dispatched to your exact campus coordinates.
                  </span>
                </div>
              </div>
            ) : (
              <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-600/40 text-xs flex items-center gap-3">
                <Clock className="w-5 h-5 text-amber-400 animate-spin shrink-0" />
                <div>
                  <span className="font-bold text-amber-300 block">
                    Awaiting Officer Acknowledgment
                  </span>
                  <span className="text-slate-300 text-[11px]">
                    High-priority siren sounding in Campus Control Room (Auto-escalation SLA: 60s).
                  </span>
                </div>
              </div>
            )}

            {/* Live Interactive Map */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-300 flex items-center gap-1.5">
                  <Navigation className="w-3.5 h-3.5 text-rose-400" />
                  <span>Live Location Shared With Responders</span>
                </span>
                <span className="text-rose-400 text-[11px] font-mono animate-pulse">
                  Streaming GPS Updates
                </span>
              </div>
              <InteractiveCampusMap
                location={activeIncident.location}
                locationError={activeIncident.locationError}
                locationHistory={activeIncident.locationHistory}
                campusName={currentUser.campus.collegeName}
                isLiveTracking={true}
              />
            </div>

            {/* Live Dispatch Notes Stream */}
            {activeIncident.dispatchNotes && activeIncident.dispatchNotes.length > 0 && (
              <div className="p-3.5 rounded-2xl bg-[#111827] border border-slate-800 space-y-2 text-xs">
                <div className="font-bold text-slate-300 flex items-center gap-1.5">
                  <Radio className="w-3.5 h-3.5 text-[#10B981]" />
                  <span>Authority Dispatch Communications</span>
                </div>
                <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                  {activeIncident.dispatchNotes.map((note) => (
                    <div
                      key={note.id}
                      className="p-2 rounded-lg bg-[#0B0F19] border border-slate-800/80 text-[11px]"
                    >
                      <div className="flex items-center justify-between text-slate-400 font-mono text-[10px]">
                        <span className="text-emerald-400 font-semibold">{note.authorRole} ({note.authorName})</span>
                        <span>{new Date(note.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                      </div>
                      <p className="text-slate-200 mt-1">{note.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* One-Tap Emergency Calls */}
            <div className="pt-2 grid grid-cols-2 gap-2">
              <a
                href={`tel:${currentUser.campus.securityHelpline}`}
                className="p-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-lg shadow-emerald-600/30"
              >
                <PhoneCall className="w-4 h-4" />
                <span>Call Campus Security</span>
              </a>
              <a
                href="tel:112"
                className="p-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-lg shadow-rose-600/30"
              >
                <PhoneCall className="w-4 h-4" />
                <span>Police Helpline 112</span>
              </a>
            </div>
          </div>
        ) : (
          /* ============================================================== */
          /* CASE 2: STANDBY / READY TO TRIGGER SOS */
          /* ============================================================== */
          <div className="space-y-6 text-center">
            {/* Grace Period Countdown Display if active */}
            {countdownRemaining !== null ? (
              <div className="p-6 rounded-3xl bg-rose-950/80 border-2 border-rose-500 shadow-2xl animate-pulse space-y-4">
                <div className="w-16 h-16 rounded-full bg-rose-600 text-white font-mono text-3xl font-extrabold flex items-center justify-center mx-auto shadow-xl">
                  {countdownRemaining}
                </div>
                <div>
                  <h4 className="text-lg font-bold text-white">Emergency SOS Triggering in {countdownRemaining}s</h4>
                  <p className="text-xs text-rose-200 mt-1">
                    Accidental tap? Tap below to cancel immediately.
                  </p>
                </div>
                <button
                  onClick={cancelCountdown}
                  className="px-6 py-2.5 rounded-xl bg-white hover:bg-slate-200 text-[#111827] font-extrabold text-xs transition-colors shadow-lg"
                >
                  Cancel Accidental SOS
                </button>
              </div>
            ) : (
              /* Central SOS Button */
              <div className="flex flex-col items-center justify-center py-4">
                <div className="relative select-none touch-none">
                  {/* Circular SVG Progress Ring for Hold-to-Activate */}
                  <svg
                    className="w-48 h-48 sm:w-56 sm:h-56 transform -rotate-90 pointer-events-none"
                    viewBox="0 0 120 120"
                  >
                    <circle
                      cx="60"
                      cy="60"
                      r="54"
                      className="text-slate-800"
                      strokeWidth="6"
                      stroke="currentColor"
                      fill="transparent"
                    />
                    <circle
                      cx="60"
                      cy="60"
                      r="54"
                      className="text-rose-500 transition-all duration-75"
                      strokeWidth="6"
                      strokeDasharray={339.29}
                      strokeDashoffset={339.29 - (339.29 * pressProgress) / 100}
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="transparent"
                    />
                  </svg>

                  {/* Physical Button Center */}
                  <button
                    onMouseDown={handlePressStart}
                    onMouseUp={handlePressEnd}
                    onMouseLeave={handlePressEnd}
                    onTouchStart={handlePressStart}
                    onTouchEnd={handlePressEnd}
                    disabled={isTriggering}
                    className={`absolute inset-4 rounded-full flex flex-col items-center justify-center transition-all duration-150 shadow-2xl ${
                      isPressing
                        ? 'bg-rose-700 scale-95 shadow-rose-900/80 ring-8 ring-rose-500/40'
                        : 'bg-gradient-to-br from-rose-600 via-rose-700 to-rose-900 hover:scale-105 shadow-rose-950/80 ring-4 ring-rose-500/20'
                    }`}
                  >
                    <ShieldAlert
                      className={`w-12 h-12 text-white transition-transform ${
                        isPressing ? 'scale-125 animate-pulse' : ''
                      }`}
                    />
                    <span className="text-xl sm:text-2xl font-black text-white tracking-widest mt-1">
                      SOS
                    </span>
                    <span className="text-[10px] font-bold text-rose-200 uppercase tracking-wider">
                      {preferences.activationGesture === 'hold_to_activate'
                        ? isPressing
                          ? 'HOLDING...'
                          : 'HOLD 2 SECONDS'
                        : 'TAP FOR HELP'}
                    </span>
                  </button>
                </div>

                <p className="text-xs text-slate-400 mt-4 max-w-xs leading-relaxed">
                  {preferences.activationGesture === 'hold_to_activate'
                    ? 'Press and hold the SOS button for 2 seconds to alert Campus Security & Proctor.'
                    : 'Tap once to trigger emergency alert with 5-second cancellation grace.'}
                </p>

                {statusMessage && (
                  <p className="text-xs font-semibold text-rose-400 mt-2 animate-pulse">
                    {statusMessage}
                  </p>
                )}
              </div>
            )}

            {/* Quick Actions Bar */}
            <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
              <button
                onClick={() => setShowWidgetGuide(true)}
                className="flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 font-semibold"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Add Widget to Home Screen</span>
              </button>

              <button
                onClick={() => setIsStealthMode(true)}
                className="flex items-center gap-1.5 text-slate-400 hover:text-white"
              >
                <EyeOff className="w-3.5 h-3.5" />
                <span>Stealth Disguise Mode</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Accidental Cancellation Modal */}
      {showCancelModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="cancel-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in"
        >
          <div className="w-full max-w-md rounded-2xl bg-[#111827] border border-rose-900 p-5 space-y-4 text-[#F9FAFB]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h4 id="cancel-modal-title" className="text-sm font-bold">Cancel Emergency Alert?</h4>
                <p className="text-xs text-slate-400">
                  Authorities will be notified of the cancellation and will log this event.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs text-slate-300 font-semibold block">
                Reason for Cancellation
              </label>
              <select
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-[#0B0F19] border border-slate-700 text-xs text-white"
              >
                <option value="Accidental tap / False alarm">Accidental tap / False alarm</option>
                <option value="Situation resolved safely">Situation resolved safely</option>
                <option value="Security reached student">Campus officer reached my location</option>
                <option value="Testing widget functionality">Testing widget functionality</option>
              </select>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowCancelModal(false)}
                className="px-4 py-2 rounded-xl bg-[#1F2937] hover:bg-slate-700 text-xs font-semibold text-slate-300 transition-colors"
              >
                Keep Active
              </button>
              <button
                onClick={handleConfirmCancelSOS}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-bold text-white transition-colors"
              >
                Confirm Cancellation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Widget Setup Guide Modal */}
      <SOSHomeWidgetModal
        isOpen={showWidgetGuide}
        onClose={() => setShowWidgetGuide(false)}
        onTriggerSOSNow={() => executeSOSTrigger('widget_shortcut')}
      />
    </div>
  );
};
