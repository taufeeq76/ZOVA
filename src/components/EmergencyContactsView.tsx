import React, { useState, useEffect } from 'react';
import { CurrentUser, EmergencyContact } from '../types/index.ts';
import { apiClient } from '../services/apiClient.ts';
import { ZovaShieldIcon } from './ZovaLogo.tsx';
import {
  PhoneCall,
  ShieldAlert,
  Search,
  CheckCircle2,
  Clock,
  ExternalLink,
  MapPin,
  LifeBuoy,
  Flame,
  Globe,
  Heart,
  Copy,
  Check,
  PhoneForwarded,
} from 'lucide-react';

interface EmergencyContactsViewProps {
  currentUser: CurrentUser;
  initialCategory?: string;
  onOpenReportForm?: () => void;
}

export const EmergencyContactsView: React.FC<EmergencyContactsViewProps> = ({
  currentUser,
  initialCategory = 'All',
  onOpenReportForm,
}) => {
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [activeIncidentFilter, setActiveIncidentFilter] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    apiClient
      .getEmergencyContacts(currentUser.campus?.city, activeIncidentFilter)
      .then((data) => {
        if (data && data.length > 0) {
          setContacts(data);
        }
      });
  }, [currentUser.campus?.city, activeIncidentFilter]);

  const categories = [
    'All',
    'Campus Security',
    'Anti-Ragging Helpline',
    'Police & Emergency',
    'Cyber Crime',
    'Medical & Trauma',
    'Women Safety',
    'Counselling',
  ];

  const handleCopyNumber = (contact: EmergencyContact) => {
    navigator.clipboard.writeText(contact.phone);
    setCopiedId(contact.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredContacts = contacts.filter((c) => {
    const matchesCat = selectedCategory === 'All' || c.category === selectedCategory;
    const matchesSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone.includes(searchTerm) ||
      c.category.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      {/* Top Hero Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-[#111827] via-[#064E3B]/60 to-[#111827] border border-[#064E3B] shadow-2xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#064E3B] border border-[#10B981]/50 text-[#10B981] flex items-center justify-center shadow-lg shadow-[#10B981]/20">
              <ShieldAlert className="w-7 h-7 text-[#10B981]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-[#F9FAFB] tracking-tight">
                  Emergency & Safety Helplines
                </h1>
                <span className="px-2 py-0.5 rounded-full bg-[#10B981]/20 border border-[#10B981]/40 text-[#34D399] text-[10px] font-bold">
                  24/7 Verified
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5 flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-[#10B981]" />
                <span>
                  Calibrated for <strong className="text-white">{currentUser.campus?.collegeName || 'Campus'}</strong> ({currentUser.campus?.city || 'Local Area'})
                </span>
              </p>
            </div>
          </div>

          {onOpenReportForm && (
            <button
              onClick={onOpenReportForm}
              className="px-4 py-2 rounded-xl bg-[#10B981] hover:bg-[#059669] text-xs font-bold text-[#111827] transition-all flex items-center gap-2 shadow-lg shadow-[#10B981]/20"
            >
              <ZovaShieldIcon className="w-4 h-4 !p-0.5" />
              <span>Submit Confidential Report</span>
            </button>
          )}
        </div>

        {/* Incident Type Context Filter */}
        <div className="p-3.5 rounded-2xl bg-[#111827]/80 border border-[#064E3B] flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-300">
            <Flame className="w-4 h-4 text-amber-400" />
            <span className="font-semibold">Highlight recommendations for incident type:</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {[
              { id: 'all', label: 'All Emergency Needs' },
              { id: 'offline', label: 'Hostel / Offline Ragging' },
              { id: 'online', label: 'Cyber Bullying / Media Leaks' },
              { id: 'Threats', label: 'Physical Threat / Assault' },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveIncidentFilter(t.id)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  activeIncidentFilter === t.id
                    ? 'bg-[#10B981] text-[#111827] font-bold shadow-md shadow-[#10B981]/20'
                    : 'bg-[#111827] text-slate-300 hover:text-white border border-[#064E3B]'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Dial Critical Cards (Top 3) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Campus Security */}
        <div className="p-5 rounded-2xl bg-[#111827] border-2 border-[#10B981]/60 shadow-xl space-y-3 relative overflow-hidden group">
          <div className="absolute top-0 right-0 bg-[#10B981] text-[#111827] text-[10px] font-bold px-2.5 py-0.5 rounded-bl-lg uppercase">
            Campus Quick Dispatch
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#064E3B] text-[#10B981] flex items-center justify-center font-bold">
              <PhoneCall className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-[#F9FAFB]">Campus Security Control</h3>
              <p className="text-[11px] text-slate-400">Patrol response: &lt; 3 mins</p>
            </div>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Direct hotline to campus gate marshals, warden rapid response squad, and on-site proctors.
          </p>
          <div className="pt-2 flex items-center gap-2">
            <a
              href={`tel:${currentUser.campus?.securityHelpline || '+918028390100'}`}
              className="flex-1 py-2.5 px-3 rounded-xl bg-[#10B981] hover:bg-[#059669] text-center text-xs font-bold text-[#111827] flex items-center justify-center gap-2 shadow-md shadow-[#10B981]/25 transition-transform active:scale-95"
            >
              <PhoneCall className="w-4 h-4" />
              <span>Call {currentUser.campus?.securityHelpline || '+91 80 2839 0100'}</span>
            </a>
          </div>
        </div>

        {/* National Anti-Ragging */}
        <div className="p-5 rounded-2xl bg-[#111827] border border-[#064E3B] shadow-xl space-y-3 relative overflow-hidden group">
          <div className="absolute top-0 right-0 bg-[#064E3B] text-[#34D399] text-[10px] font-bold px-2.5 py-0.5 rounded-bl-lg uppercase border-l border-b border-[#10B981]/30">
            National UGC
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#064E3B]/80 text-[#34D399] flex items-center justify-center font-bold">
              <LifeBuoy className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-[#F9FAFB]">Anti-Ragging Helpline</h3>
              <p className="text-[11px] text-[#34D399] font-mono">1800-180-5522 (Toll Free)</p>
            </div>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Statutory UGC national registry. Direct FIR mandate and university accountability tracking.
          </p>
          <div className="pt-2 flex items-center gap-2">
            <a
              href="tel:18001805522"
              className="flex-1 py-2.5 px-3 rounded-xl bg-[#064E3B] hover:bg-[#064E3B]/80 border border-[#10B981]/60 text-center text-xs font-bold text-[#F9FAFB] flex items-center justify-center gap-2 transition-transform active:scale-95"
            >
              <PhoneCall className="w-4 h-4 text-[#10B981]" />
              <span>One-Tap Dial 1800-180-5522</span>
            </a>
          </div>
        </div>

        {/* National Cyber Crime */}
        <div className="p-5 rounded-2xl bg-[#111827] border border-[#064E3B] shadow-xl space-y-3 relative overflow-hidden group">
          <div className="absolute top-0 right-0 bg-[#064E3B] text-[#34D399] text-[10px] font-bold px-2.5 py-0.5 rounded-bl-lg uppercase border-l border-b border-[#10B981]/30">
            Govt. Cyber Desk
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#064E3B]/80 text-[#34D399] flex items-center justify-center font-bold">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-[#F9FAFB]">Cyber Crime Helpline</h3>
              <p className="text-[11px] text-[#34D399] font-mono">1930 (Toll Free)</p>
            </div>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Emergency intervention for online threats, non-consensual media, impersonation, or cyber harassment.
          </p>
          <div className="pt-2 flex items-center gap-2">
            <a
              href="tel:1930"
              className="flex-1 py-2.5 px-3 rounded-xl bg-[#064E3B] hover:bg-[#064E3B]/80 border border-[#10B981]/60 text-center text-xs font-bold text-[#F9FAFB] flex items-center justify-center gap-2 transition-transform active:scale-95"
            >
              <PhoneCall className="w-4 h-4 text-[#10B981]" />
              <span>One-Tap Dial 1930</span>
            </a>
          </div>
        </div>
      </div>

      {/* Search and Category Filters */}
      <div className="space-y-3 pt-4">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search helpline name, authority, phone number, or service..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#111827] border border-[#064E3B] focus:border-[#10B981] text-xs text-[#F9FAFB] placeholder-slate-400 outline-none"
            />
          </div>

          <span className="text-xs text-slate-400 shrink-0">
            Showing {filteredContacts.length} verified helplines
          </span>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                selectedCategory === cat
                  ? 'bg-[#10B981] text-[#111827] font-bold shadow-md shadow-[#10B981]/20'
                  : 'bg-[#111827] text-slate-300 hover:text-white border border-[#064E3B]/80 hover:border-[#10B981]/50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Helplines Directory List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {filteredContacts.map((contact) => {
          const isCopied = copiedId === contact.id;
          return (
            <div
              key={contact.id}
              className="p-4 rounded-2xl bg-[#111827] border border-[#064E3B] hover:border-[#10B981]/50 transition-all flex flex-col justify-between space-y-3 shadow-lg group"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-[#F9FAFB]">{contact.name}</h4>
                      {contact.isVerified && (
                        <span
                          title="Verified Campus/National Official Number"
                          className="inline-flex items-center gap-1 text-[10px] text-[#34D399] font-bold"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981]" />
                          <span>Verified</span>
                        </span>
                      )}
                    </div>
                    <span className="inline-block mt-0.5 text-[10px] font-semibold px-2 py-0.5 rounded bg-[#064E3B]/60 text-[#34D399] border border-[#10B981]/20">
                      {contact.category}
                    </span>
                  </div>

                  <span className="text-[10px] text-slate-400 flex items-center gap-1 font-mono">
                    <Clock className="w-3 h-3 text-[#10B981]" />
                    <span>{contact.hours}</span>
                  </span>
                </div>

                <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                  {contact.description}
                </p>
              </div>

              {/* Actions: One Tap Call + Copy Phone */}
              <div className="pt-2 border-t border-[#064E3B]/50 flex items-center gap-2">
                <a
                  href={`tel:${contact.phone.replace(/[^0-9+]/g, '')}`}
                  className="flex-1 py-2 px-3 rounded-lg bg-[#064E3B] hover:bg-[#10B981] text-[#F9FAFB] hover:text-[#111827] text-xs font-bold font-mono flex items-center justify-center gap-2 transition-all border border-[#10B981]/40"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>Call {contact.phone}</span>
                </a>

                <button
                  type="button"
                  onClick={() => handleCopyNumber(contact)}
                  title="Copy number to clipboard"
                  className="p-2 rounded-lg bg-[#111827] hover:bg-[#064E3B] text-slate-300 hover:text-white border border-[#064E3B] transition-colors"
                >
                  {isCopied ? (
                    <Check className="w-4 h-4 text-[#10B981]" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredContacts.length === 0 && (
        <div className="p-8 rounded-2xl bg-[#111827] border border-[#064E3B] text-center space-y-2">
          <p className="text-sm font-bold text-slate-300">No helplines found matching your search</p>
          <p className="text-xs text-slate-400">
            Try clearing filters or search by category like "Security" or "Cyber".
          </p>
        </div>
      )}
    </div>
  );
};
