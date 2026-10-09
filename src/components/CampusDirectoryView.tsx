import React, { useState, useEffect } from 'react';
import { CurrentUser, DirectoryContact } from '../types/index.ts';
import { apiClient } from '../services/apiClient.ts';
import { DEPARTMENTS } from '../services/storage.ts';
import { ZovaShieldIcon } from './ZovaLogo.tsx';
import {
  Users,
  Search,
  Phone,
  Mail,
  MapPin,
  CheckCircle2,
  Plus,
  Edit2,
  Trash2,
  X,
  Check,
  ShieldAlert,
  Building,
  UserCheck,
  Power,
} from 'lucide-react';

interface CampusDirectoryViewProps {
  currentUser: CurrentUser;
}

export const CampusDirectoryView: React.FC<CampusDirectoryViewProps> = ({ currentUser }) => {
  const [contacts, setContacts] = useState<DirectoryContact[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedDept, setSelectedDept] = useState<string>('All');
  const [selectedRoleType, setSelectedRoleType] = useState<string>('All');

  // Contact Modal (Add/Edit)
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingContact, setEditingContact] = useState<DirectoryContact | null>(null);

  // Form Fields
  const [formName, setFormName] = useState<string>('');
  const [formDesignation, setFormDesignation] = useState<string>('');
  const [formRoleType, setFormRoleType] = useState<any>('Faculty');
  const [formDepartment, setFormDepartment] = useState<string>('Computer Science & Engineering');
  const [formPhone, setFormPhone] = useState<string>('');
  const [formEmail, setFormEmail] = useState<string>('');
  const [formOfficeRoom, setFormOfficeRoom] = useState<string>('');
  const [formIsAvailable, setFormIsAvailable] = useState<boolean>(true);
  const [formError, setFormError] = useState<string | null>(null);

  const canManageDirectory =
    currentUser.isVerified &&
    ['Dean', 'HOD', 'Higher Authority', 'Faculty'].includes(currentUser.role);

  const loadDirectory = async () => {
    try {
      const list = await apiClient.getDirectory(currentUser.campus?.campusCode);
      if (list && list.length > 0) {
        setContacts(list);
      }
    } catch {}
  };

  useEffect(() => {
    loadDirectory();
  }, [currentUser.campus?.campusCode]);

  const handleOpenAddModal = () => {
    setEditingContact(null);
    setFormName('');
    setFormDesignation('');
    setFormRoleType('Faculty');
    setFormDepartment('Computer Science & Engineering');
    setFormPhone('');
    setFormEmail('');
    setFormOfficeRoom('');
    setFormIsAvailable(true);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (c: DirectoryContact) => {
    setEditingContact(c);
    setFormName(c.name);
    setFormDesignation(c.designation);
    setFormRoleType(c.roleType);
    setFormDepartment(c.department);
    setFormPhone(c.phone);
    setFormEmail(c.email);
    setFormOfficeRoom(c.officeRoom);
    setFormIsAvailable(c.isAvailable);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSaveContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formPhone.trim() || !formEmail.trim()) {
      setFormError('Name, phone, and email are required fields');
      return;
    }

    try {
      if (editingContact) {
        await apiClient.updateDirectoryContact(
          editingContact.id,
          {
            name: formName.trim(),
            designation: formDesignation.trim(),
            roleType: formRoleType,
            department: formDepartment,
            phone: formPhone.trim(),
            email: formEmail.trim(),
            officeRoom: formOfficeRoom.trim() || 'Campus Office',
            isAvailable: formIsAvailable,
          },
          currentUser
        );
      } else {
        await apiClient.addDirectoryContact(
          {
            name: formName.trim(),
            designation: formDesignation.trim() || 'Staff Officer',
            roleType: formRoleType,
            department: formDepartment,
            phone: formPhone.trim(),
            email: formEmail.trim(),
            officeRoom: formOfficeRoom.trim() || 'Campus Office',
            isAvailable: formIsAvailable,
            verifiedCampusBadge: true,
            campusCode: currentUser.campus?.campusCode || 'AIST-BLR',
          },
          currentUser
        );
      }

      await loadDirectory();
      setIsModalOpen(false);
    } catch (err: any) {
      setFormError(err.message || 'Failed to save contact');
    }
  };

  const handleDeleteContact = async (id: string) => {
    if (!window.confirm('Are you sure you want to remove this staff contact from the campus directory?')) {
      return;
    }
    try {
      await apiClient.deleteDirectoryContact(id, currentUser);
      await loadDirectory();
    } catch (err: any) {
      alert(err.message || 'Failed to remove contact');
    }
  };

  const handleToggleAvailability = async (c: DirectoryContact) => {
    if (!canManageDirectory) return;
    try {
      await apiClient.updateDirectoryContact(
        c.id,
        { isAvailable: !c.isAvailable },
        currentUser
      );
      await loadDirectory();
    } catch {}
  };

  // Filtered contacts
  const filtered = contacts.filter((c) => {
    const matchesDept = selectedDept === 'All' || c.department === selectedDept;
    const matchesRole = selectedRoleType === 'All' || c.roleType === selectedRoleType;
    const matchesSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.designation.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.officeRoom.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesDept && matchesRole && matchesSearch;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-[#111827] via-[#064E3B]/60 to-[#111827] border border-[#064E3B] shadow-2xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#064E3B] border border-[#10B981]/50 text-[#10B981] flex items-center justify-center shadow-lg shadow-[#10B981]/20">
              <Users className="w-7 h-7 text-[#10B981]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-[#F9FAFB] tracking-tight">
                  Official Campus Directory
                </h1>
                <span className="px-2 py-0.5 rounded-full bg-[#10B981]/20 border border-[#10B981]/40 text-[#34D399] text-[10px] font-bold">
                  {currentUser.campus?.campusCode || 'Verified Campus'}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Contact your college's Faculty, HOD, Dean, Counsellors, and Campus Security Staff.
              </p>
            </div>
          </div>

          {canManageDirectory ? (
            <button
              onClick={handleOpenAddModal}
              className="px-4 py-2 rounded-xl bg-[#10B981] hover:bg-[#059669] text-xs font-bold text-[#111827] transition-all flex items-center gap-2 shadow-lg shadow-[#10B981]/20"
            >
              <Plus className="w-4 h-4" />
              <span>Add Staff / Contact</span>
            </button>
          ) : (
            <div className="text-right">
              <span className="text-[11px] text-slate-400 block">
                Logged in as: <strong className="text-[#34D399]">{currentUser.role}</strong>
              </span>
              <span className="text-[10px] text-slate-500">
                Staff management requires verified authority credentials.
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Filters & Search */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search faculty name, designation, office room, or department..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#111827] border border-[#064E3B] focus:border-[#10B981] text-xs text-[#F9FAFB] outline-none"
            />
          </div>

          <span className="text-xs text-slate-400 shrink-0">
            {filtered.length} staff contacts found
          </span>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-slate-400 mr-1">Role:</span>
          {['All', 'Dean', 'HOD', 'Faculty', 'Counsellor', 'Security', 'Warden'].map((rt) => (
            <button
              key={rt}
              onClick={() => setSelectedRoleType(rt)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                selectedRoleType === rt
                  ? 'bg-[#10B981] text-[#111827] font-bold shadow-md shadow-[#10B981]/20'
                  : 'bg-[#111827] text-slate-300 hover:text-white border border-[#064E3B]/80'
              }`}
            >
              {rt}
            </button>
          ))}
        </div>
      </div>

      {/* Directory Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((contact) => (
          <div
            key={contact.id}
            className="p-5 rounded-2xl bg-[#111827] border border-[#064E3B] hover:border-[#10B981]/50 transition-all flex flex-col justify-between space-y-4 shadow-xl relative group"
          >
            <div>
              {/* Top Row: Role Badge & Availability Status */}
              <div className="flex items-start justify-between gap-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#064E3B] text-[#34D399] border border-[#10B981]/30">
                  {contact.roleType}
                </span>

                <button
                  type="button"
                  onClick={() => handleToggleAvailability(contact)}
                  disabled={!canManageDirectory}
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1.5 transition-colors ${
                    contact.isAvailable
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-700/50'
                      : 'bg-rose-950 text-rose-400 border border-rose-700/50'
                  } ${canManageDirectory ? 'cursor-pointer hover:opacity-80' : 'cursor-default'}`}
                  title={canManageDirectory ? 'Click to toggle availability' : undefined}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      contact.isAvailable ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'
                    }`}
                  />
                  <span>{contact.isAvailable ? 'Available / On Duty' : 'Away / Off Duty'}</span>
                </button>
              </div>

              {/* Contact Details */}
              <div className="mt-3">
                <div className="flex items-center gap-1.5">
                  <h3 className="font-bold text-sm text-[#F9FAFB]">{contact.name}</h3>
                  {contact.verifiedCampusBadge && (
                    <span title="Verified Campus Official">
                      <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0" />
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#10B981] font-semibold mt-0.5">
                  {contact.designation}
                </p>
                <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1.5">
                  <Building className="w-3 h-3 text-[#10B981]" />
                  <span>{contact.department}</span>
                </p>
                <p className="text-[11px] text-slate-300 mt-1 flex items-center gap-1.5">
                  <MapPin className="w-3 h-3 text-slate-400" />
                  <span>{contact.officeRoom}</span>
                </p>
              </div>
            </div>

            {/* Actions: One Tap Call & Email */}
            <div className="space-y-2 pt-3 border-t border-[#064E3B]/50">
              <div className="flex items-center gap-2">
                <a
                  href={`tel:${contact.phone.replace(/[^0-9+]/g, '')}`}
                  className="flex-1 py-1.5 px-3 rounded-lg bg-[#064E3B] hover:bg-[#10B981] text-[#F9FAFB] hover:text-[#111827] text-xs font-bold font-mono flex items-center justify-center gap-1.5 transition-all border border-[#10B981]/30"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call</span>
                </a>

                <a
                  href={`mailto:${contact.email}`}
                  className="flex-1 py-1.5 px-3 rounded-lg bg-[#111827] hover:bg-[#064E3B] text-slate-300 hover:text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all border border-[#064E3B]"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Email</span>
                </a>
              </div>

              {/* Authorized Authority Management Controls */}
              {canManageDirectory && (
                <div className="flex items-center justify-end gap-1 pt-1">
                  <button
                    onClick={() => handleOpenEditModal(contact)}
                    className="p-1 text-slate-400 hover:text-[#10B981] rounded hover:bg-[#064E3B] transition-colors"
                    title="Edit Contact Details"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteContact(contact.id)}
                    className="p-1 text-slate-400 hover:text-rose-400 rounded hover:bg-rose-950/50 transition-colors"
                    title="Delete Contact"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="p-8 rounded-2xl bg-[#111827] border border-[#064E3B] text-center space-y-2">
          <p className="text-sm font-bold text-slate-300">No staff members found matching criteria</p>
          <p className="text-xs text-slate-400">
            Try adjusting your search terms or department filters.
          </p>
        </div>
      )}

      {/* Add / Edit Contact Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#111827]/85 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#111827] border border-[#064E3B] rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#064E3B] pb-3">
              <h3 className="font-bold text-base text-[#F9FAFB]">
                {editingContact ? 'Edit Staff Contact' : 'Add New Staff Contact'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <p className="text-xs text-rose-400 p-2 rounded bg-rose-950/40 border border-rose-800">
                {formError}
              </p>
            )}

            <form onSubmit={handleSaveContact} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Full Name *</label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Dr. K. Sharma"
                  className="w-full px-3 py-2 rounded-lg bg-[#111827] border border-[#064E3B] focus:border-[#10B981] text-[#F9FAFB] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Designation</label>
                  <input
                    type="text"
                    value={formDesignation}
                    onChange={(e) => setFormDesignation(e.target.value)}
                    placeholder="e.g. Head of Department"
                    className="w-full px-3 py-2 rounded-lg bg-[#111827] border border-[#064E3B] focus:border-[#10B981] text-[#F9FAFB] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Role Type</label>
                  <select
                    value={formRoleType}
                    onChange={(e) => setFormRoleType(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[#111827] border border-[#064E3B] focus:border-[#10B981] text-[#F9FAFB] outline-none"
                  >
                    <option value="Dean">Dean</option>
                    <option value="HOD">HOD</option>
                    <option value="Faculty">Faculty</option>
                    <option value="Counsellor">Counsellor</option>
                    <option value="Security">Security</option>
                    <option value="Warden">Warden</option>
                    <option value="Staff">Staff</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Department</label>
                <input
                  type="text"
                  value={formDepartment}
                  onChange={(e) => setFormDepartment(e.target.value)}
                  placeholder="e.g. Computer Science & Engineering"
                  className="w-full px-3 py-2 rounded-lg bg-[#111827] border border-[#064E3B] focus:border-[#10B981] text-[#F9FAFB] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Phone Number *</label>
                  <input
                    type="text"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    placeholder="+91 80 2839 0120"
                    className="w-full px-3 py-2 rounded-lg bg-[#111827] border border-[#064E3B] focus:border-[#10B981] text-[#F9FAFB] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Email *</label>
                  <input
                    type="email"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="hod.cse@aist.edu.in"
                    className="w-full px-3 py-2 rounded-lg bg-[#111827] border border-[#064E3B] focus:border-[#10B981] text-[#F9FAFB] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Office Room / Desk</label>
                <input
                  type="text"
                  value={formOfficeRoom}
                  onChange={(e) => setFormOfficeRoom(e.target.value)}
                  placeholder="e.g. CS Wing, Room 301"
                  className="w-full px-3 py-2 rounded-lg bg-[#111827] border border-[#064E3B] focus:border-[#10B981] text-[#F9FAFB] outline-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="availCheck"
                  checked={formIsAvailable}
                  onChange={(e) => setFormIsAvailable(e.target.checked)}
                  className="rounded text-[#10B981] focus:ring-[#10B981]"
                />
                <label htmlFor="availCheck" className="text-slate-300 font-semibold">
                  Mark as Available / On Duty right now
                </label>
              </div>

              <div className="pt-3 border-t border-[#064E3B] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-[#111827] hover:bg-[#064E3B] text-slate-300 border border-[#064E3B]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-[#10B981] hover:bg-[#059669] text-[#111827] font-bold shadow-md shadow-[#10B981]/20"
                >
                  Save Contact
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
