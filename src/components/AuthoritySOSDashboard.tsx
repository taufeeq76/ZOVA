import React, { useState, useEffect } from 'react';
import {
  CurrentUser,
  SOSIncident,
  SOSIncidentStatus,
  SOSDispatchNote,
} from '../types/index.ts';
import { apiClient } from '../services/apiClient.ts';
import { InteractiveCampusMap } from './InteractiveCampusMap.tsx';
import {
  ShieldAlert,
  Radio,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Send,
  Navigation,
  PhoneCall,
  User,
  Building2,
  RefreshCw,
  ExternalLink,
  Volume2,
  VolumeX,
  History,
  FileCheck2,
} from 'lucide-react';

interface AuthoritySOSDashboardProps {
  currentUser: CurrentUser;
}

export const AuthoritySOSDashboard: React.FC<AuthoritySOSDashboardProps> = ({
  currentUser,
}) => {
  const [activeIncidents, setActiveIncidents] = useState<SOSIncident[]>([]);
  const [selectedIncident, setSelectedIncident] = useState<SOSIncident | null>(null);
  const [historyIncidents, setHistoryIncidents] = useState<SOSIncident[]>([]);
  const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');
  const [dispatchText, setDispatchText] = useState<string>('');
  const [resolutionNote, setResolutionNote] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSirenMuted, setIsSirenMuted] = useState<boolean>(false);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());

  // Polling for active SOS incidents every 2.5 seconds for real-time synchronization
  const fetchIncidents = async () => {
    try {
      const active = await apiClient.getActiveSOS(currentUser);
      setActiveIncidents(active);
      setLastRefreshed(new Date());

      // If currently inspecting an incident, update its details
      if (selectedIncident) {
        const fresh = active.find((i) => i.id === selectedIncident.id);
        if (fresh) {
          setSelectedIncident(fresh);
        } else {
          // Check if it got resolved/cancelled
          const details = await apiClient.getSOSDetails(selectedIncident.id);
          if (details) setSelectedIncident(details);
        }
      } else if (active.length > 0) {
        setSelectedIncident(active[0]);
      }
    } catch {}
  };

  const fetchHistory = async () => {
    try {
      const hist = await apiClient.getSOSHistory(currentUser);
      setHistoryIncidents(hist);
    } catch {}
  };

  useEffect(() => {
    fetchIncidents();
    const interval = setInterval(fetchIncidents, 2500);
    return () => clearInterval(interval);
  }, [currentUser, selectedIncident?.id]);

  useEffect(() => {
    if (activeTab === 'history') {
      fetchHistory();
    }
  }, [activeTab]);

  // Handle Acknowledgement
  const handleAcknowledge = async (id: string) => {
    try {
      setIsSubmitting(true);
      const updated = await apiClient.acknowledgeSOS(id, currentUser);
      setSelectedIncident(updated);
      await fetchIncidents();
      setIsSubmitting(false);
    } catch (err: any) {
      setIsSubmitting(false);
      alert(`Acknowledgement error: ${err.message}`);
    }
  };

  // Handle Status Update
  const handleUpdateStatus = async (id: string, status: SOSIncidentStatus, note?: string) => {
    try {
      setIsSubmitting(true);
      const updated = await apiClient.updateSOSStatus(id, status, note, currentUser);
      setSelectedIncident(updated);
      setResolutionNote('');
      await fetchIncidents();
      setIsSubmitting(false);
    } catch (err: any) {
      setIsSubmitting(false);
      alert(`Status update error: ${err.message}`);
    }
  };

  // Handle Posting Dispatch Note
  const handlePostDispatchNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIncident || !dispatchText.trim()) return;

    try {
      setIsSubmitting(true);
      const updated = await apiClient.addSOSDispatchNote(
        selectedIncident.id,
        dispatchText,
        currentUser
      );
      setSelectedIncident(updated);
      setDispatchText('');
      setIsSubmitting(false);
    } catch (err: any) {
      setIsSubmitting(false);
      alert(`Error posting dispatch note: ${err.message}`);
    }
  };

  const hasUnacknowledged = activeIncidents.some((i) => i.status === 'Delivered' || i.status === 'Triggered');

  return (
    <div className="space-y-6">
      {/* High-Alert Emergency Banner if any active incident is unacknowledged */}
      {hasUnacknowledged && (
        <div className="p-4 rounded-2xl bg-rose-950/60 border-2 border-rose-500 shadow-2xl shadow-rose-950 flex flex-wrap items-center justify-between gap-4 animate-pulse">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0">
              <ShieldAlert className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-rose-300">
                  CRITICAL CAMPUS EMERGENCY IN PROGRESS
                </span>
                <span className="w-2.5 h-2.5 rounded-full bg-rose-400 animate-ping" />
              </div>
              <h3 className="text-base font-extrabold text-[#F9FAFB]">
                {activeIncidents.filter((i) => i.status === 'Delivered').length} Unacknowledged SOS Alert(s)
              </h3>
              <p className="text-xs text-rose-200">
                Immediate response required by Campus Proctor, Security Officers, or Anti-Ragging Squad.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsSirenMuted(!isSirenMuted)}
              className="p-2 rounded-xl bg-rose-900/60 hover:bg-rose-800 text-rose-200 text-xs flex items-center gap-1.5 transition-colors"
            >
              {isSirenMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              <span>{isSirenMuted ? 'Unmute Alarm' : 'Mute Alarm'}</span>
            </button>

            {activeIncidents.length > 0 && (
              <button
                onClick={() => setSelectedIncident(activeIncidents[0])}
                className="px-4 py-2 rounded-xl bg-white hover:bg-rose-50 text-[#111827] font-black text-xs transition-colors shadow-lg"
              >
                Inspect Top Alert
              </button>
            )}
          </div>
        </div>
      )}

      {/* Control Header & Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-[#0B0F19] border border-[#064E3B]/60">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-rose-500/10 border border-rose-500/40 text-rose-400 flex items-center justify-center">
            <Radio className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-[#F9FAFB] flex items-center gap-2">
              Campus SOS Emergency Response Center
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/40">
                Live 24/7 Gateway
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Authorized Console: {currentUser.role} ({currentUser.name}) · {currentUser.campus.collegeName}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('active')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'active'
                ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30'
                : 'bg-[#1F2937] text-slate-400 hover:text-white'
            }`}
          >
            Active Emergencies ({activeIncidents.length})
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'history'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                : 'bg-[#1F2937] text-slate-400 hover:text-white'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Audit History</span>
          </button>
          <button
            onClick={fetchIncidents}
            className="p-1.5 rounded-lg bg-[#1F2937] text-slate-400 hover:text-white transition-colors"
            title="Refresh incidents"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* ACTIVE EMERGENCIES TAB */}
      {/* ============================================================== */}
      {activeTab === 'active' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Active Incidents List (4 cols) */}
          <div className="lg:col-span-5 space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400 px-1">
              <span className="font-bold uppercase tracking-wider text-slate-300">
                Live Active Incidents
              </span>
              <span>Updated {lastRefreshed.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
            </div>

            {activeIncidents.length === 0 ? (
              <div className="p-8 rounded-2xl bg-[#0B0F19] border border-slate-800 text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                <h4 className="text-sm font-bold text-white">All Campus Sectors Clear</h4>
                <p className="text-xs text-slate-400">
                  No active emergency SOS requests reported at {currentUser.campus.collegeName}.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {activeIncidents.map((incident) => {
                  const isSelected = selectedIncident?.id === incident.id;
                  const isDelivered = incident.status === 'Delivered';

                  return (
                    <div
                      key={incident.id}
                      onClick={() => setSelectedIncident(incident)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#111827] border-rose-500 shadow-xl shadow-rose-950/40 ring-1 ring-rose-500'
                          : isDelivered
                          ? 'bg-[#0B0F19] border-rose-900/60 hover:border-rose-600'
                          : 'bg-[#0B0F19] border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-rose-400">
                            {incident.id}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase ${
                              incident.status === 'Delivered'
                                ? 'bg-rose-600 text-white animate-pulse'
                                : incident.status === 'Acknowledged'
                                ? 'bg-amber-500 text-black'
                                : incident.status === 'Response in progress'
                                ? 'bg-blue-600 text-white'
                                : 'bg-purple-600 text-white'
                            }`}
                          >
                            {incident.status}
                          </span>
                        </div>

                        <span className="text-[10px] text-slate-400 font-mono">
                          {new Date(incident.triggeredAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      <div className="mt-2 text-xs">
                        <div className="font-bold text-[#F9FAFB] flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          <span>{incident.studentName}</span>
                          <span className="text-slate-400 text-[11px]">({incident.studentId})</span>
                        </div>
                        <p className="text-slate-400 text-[11px] mt-0.5 truncate">
                          {incident.location?.campusZone || 'Campus Quad'} · {incident.studentDepartment || 'General'}
                        </p>
                      </div>

                      {/* Quick Acknowledge if unacknowledged */}
                      {incident.status === 'Delivered' && (
                        <div className="mt-3 pt-2 border-t border-rose-900/40 flex items-center justify-between">
                          <span className="text-[10px] text-rose-300 font-semibold animate-pulse">
                            ⚠️ Awaiting Response
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAcknowledge(incident.id);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-[10px] font-bold transition-colors shadow-md"
                          >
                            Acknowledge
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Column: Detailed Incident Inspector (7 cols) */}
          <div className="lg:col-span-7">
            {selectedIncident ? (
              <div className="rounded-2xl border border-[#064E3B]/70 bg-[#0B0F19] p-5 sm:p-6 space-y-5 shadow-2xl">
                {/* Header & Status Actions */}
                <div className="flex flex-wrap items-start justify-between gap-3 pb-4 border-b border-slate-800">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-extrabold text-rose-400">
                        {selectedIncident.id}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-rose-600 text-white">
                        {selectedIncident.status}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-[#F9FAFB] mt-1">
                      {selectedIncident.studentName} · {selectedIncident.studentDepartment || 'Department'}
                    </h3>
                    <p className="text-xs text-slate-400">
                      Triggered {new Date(selectedIncident.triggeredAt).toLocaleString()} via{' '}
                      <span className="font-mono text-teal-400">{selectedIncident.triggerMode}</span>
                    </p>
                  </div>

                  {/* Immediate Action Buttons */}
                  <div className="flex flex-wrap items-center gap-2">
                    {selectedIncident.status === 'Delivered' && (
                      <button
                        onClick={() => handleAcknowledge(selectedIncident.id)}
                        disabled={isSubmitting}
                        className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition-colors shadow-lg shadow-rose-600/30 flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Acknowledge & Dispatch</span>
                      </button>
                    )}

                    {selectedIncident.status === 'Acknowledged' && (
                      <button
                        onClick={() =>
                          handleUpdateStatus(selectedIncident.id, 'Response in progress', 'Officer deployed to location')
                        }
                        disabled={isSubmitting}
                        className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-colors shadow-lg flex items-center gap-1.5"
                      >
                        <Radio className="w-4 h-4" />
                        <span>Mark Response in Progress</span>
                      </button>
                    )}

                    {selectedIncident.status !== 'Resolved' && selectedIncident.status !== 'Cancelled' && (
                      <>
                        <button
                          onClick={() =>
                            handleUpdateStatus(
                              selectedIncident.id,
                              'Escalated',
                              'Escalated to Higher Authority and Local Police Liaison.'
                            )
                          }
                          disabled={isSubmitting}
                          className="px-3 py-2 rounded-xl bg-[#1F2937] hover:bg-slate-700 text-amber-300 text-xs font-semibold transition-colors flex items-center gap-1"
                          title="Escalate incident"
                        >
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>Escalate</span>
                        </button>

                        <button
                          onClick={() =>
                            handleUpdateStatus(
                              selectedIncident.id,
                              'Resolved',
                              resolutionNote || 'Perimeter secured. Student safe.'
                            )
                          }
                          disabled={isSubmitting}
                          className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors shadow-md flex items-center gap-1"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Resolve Case</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Student Details Card */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-xl bg-[#111827] border border-slate-800 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Student Phone</span>
                    <a
                      href={`tel:${selectedIncident.studentPhone}`}
                      className="text-emerald-400 font-bold hover:underline flex items-center gap-1 mt-0.5"
                    >
                      <PhoneCall className="w-3 h-3" />
                      <span>{selectedIncident.studentPhone || 'N/A'}</span>
                    </a>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Campus Jurisdiction</span>
                    <span className="text-[#F9FAFB] font-semibold mt-0.5 block truncate">
                      {selectedIncident.campusName}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Current Responder</span>
                    <span className="text-teal-300 font-semibold mt-0.5 block">
                      {selectedIncident.acknowledgedBy
                        ? `${selectedIncident.acknowledgedBy.role} (${selectedIncident.acknowledgedBy.name})`
                        : 'Unassigned (Waiting)'}
                    </span>
                  </div>
                </div>

                {/* Interactive GPS Location Map */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-300 flex items-center gap-1.5">
                      <Navigation className="w-3.5 h-3.5 text-rose-400" />
                      <span>Interactive Incident Location Map</span>
                    </span>
                    {selectedIncident.location && (
                      <span className="text-[11px] font-mono text-emerald-400">
                        Accuracy: ±{selectedIncident.location.accuracy.toFixed(1)}m
                      </span>
                    )}
                  </div>
                  <InteractiveCampusMap
                    location={selectedIncident.location}
                    locationError={selectedIncident.locationError}
                    locationHistory={selectedIncident.locationHistory}
                    campusName={selectedIncident.campusName}
                    isLiveTracking={selectedIncident.status !== 'Resolved' && selectedIncident.status !== 'Cancelled'}
                  />
                </div>

                {/* Responder Dispatch Communications Channel */}
                <div className="space-y-2.5">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Radio className="w-3.5 h-3.5 text-[#10B981]" />
                    <span>Real-Time Dispatch Communications</span>
                  </h4>

                  <div className="p-3 rounded-xl bg-[#111827] border border-slate-800 space-y-2 max-h-48 overflow-y-auto">
                    {selectedIncident.dispatchNotes && selectedIncident.dispatchNotes.length > 0 ? (
                      selectedIncident.dispatchNotes.map((note) => (
                        <div
                          key={note.id}
                          className="p-2 rounded-lg bg-[#0B0F19] border border-slate-800/80 text-xs"
                        >
                          <div className="flex items-center justify-between text-[10px] text-slate-400">
                            <span className="text-emerald-400 font-bold">{note.authorRole} ({note.authorName})</span>
                            <span className="font-mono">{new Date(note.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                          </div>
                          <p className="text-slate-200 mt-1 text-xs">{note.text}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-slate-500 text-xs text-center py-2">
                        No dispatch messages yet. Post instructions below.
                      </p>
                    )}
                  </div>

                  {/* Dispatch message input */}
                  {selectedIncident.status !== 'Resolved' && selectedIncident.status !== 'Cancelled' && (
                    <form onSubmit={handlePostDispatchNote} className="flex gap-2">
                      <input
                        type="text"
                        value={dispatchText}
                        onChange={(e) => setDispatchText(e.target.value)}
                        placeholder="Broadcast responder note (e.g., Patrol Car 2 arrived on scene)..."
                        className="flex-1 p-2.5 rounded-xl bg-[#111827] border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#10B981]"
                      />
                      <button
                        type="submit"
                        disabled={isSubmitting || !dispatchText.trim()}
                        className="px-4 py-2.5 rounded-xl bg-[#10B981] hover:bg-[#059669] text-[#111827] font-bold text-xs transition-colors flex items-center gap-1.5 disabled:opacity-50"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Send</span>
                      </button>
                    </form>
                  )}
                </div>

                {/* Audit Trail Timeline */}
                <div className="space-y-2 pt-2 border-t border-slate-800">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Official Chronological Audit Trail
                  </h4>
                  <div className="space-y-1.5 max-h-36 overflow-y-auto text-[11px] text-slate-400 font-mono">
                    {selectedIncident.auditLogs?.map((log) => (
                      <div key={log.id} className="flex items-start gap-2">
                        <span className="text-slate-500 shrink-0">
                          {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </span>
                        <span className="text-teal-400 shrink-0">[{log.action}]</span>
                        <span className="text-slate-300">{log.details}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-12 rounded-2xl bg-[#0B0F19] border border-slate-800 text-center text-slate-400 text-xs">
                Select an active SOS emergency from the list to inspect details and dispatch security.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* AUDIT HISTORY TAB */}
      {/* ============================================================== */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-[#0B0F19] border border-slate-800 space-y-3">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <FileCheck2 className="w-4 h-4 text-[#10B981]" />
              <span>Campus SOS Emergency Incident Archive</span>
            </h4>
            <p className="text-xs text-slate-400">
              Complete tamper-evident record of all emergency SOS activations, responder actions, and resolutions.
            </p>

            <div className="overflow-x-auto mt-4">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-mono text-[11px]">
                    <th className="py-2.5 px-3">Incident ID</th>
                    <th className="py-2.5 px-3">Student</th>
                    <th className="py-2.5 px-3">Location / Zone</th>
                    <th className="py-2.5 px-3">Triggered</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Responder</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {historyIncidents.map((sos) => (
                    <tr key={sos.id} className="hover:bg-[#111827] text-slate-300">
                      <td className="py-3 px-3 font-mono text-teal-400 font-bold">{sos.id}</td>
                      <td className="py-3 px-3 font-medium text-white">{sos.studentName}</td>
                      <td className="py-3 px-3 text-slate-400">{sos.location?.campusZone || 'Quad'}</td>
                      <td className="py-3 px-3 text-slate-400 font-mono">
                        {new Date(sos.triggeredAt).toLocaleString()}
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            sos.status === 'Resolved'
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/40'
                              : sos.status === 'Cancelled'
                              ? 'bg-slate-800 text-slate-400'
                              : 'bg-rose-950 text-rose-400 border border-rose-800/40'
                          }`}
                        >
                          {sos.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-400">
                        {sos.resolvedBy
                          ? `${sos.resolvedBy.role} (${sos.resolvedBy.name})`
                          : sos.acknowledgedBy
                          ? `${sos.acknowledgedBy.role} (${sos.acknowledgedBy.name})`
                          : 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
