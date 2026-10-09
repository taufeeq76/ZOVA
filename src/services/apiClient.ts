import {
  Complaint,
  CurrentUser,
  DirectoryContact,
  EmergencyContact,
  College,
  ComplaintStatus,
  Role,
} from '../types/index.ts';

/**
 * ZOVA Secure API Client
 * Sends requests with server-side authorization headers
 */
class ApiClient {
  private getHeaders(currentUser?: CurrentUser): HeadersInit {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (currentUser) {
      headers['x-zova-role'] = currentUser.role;
      headers['x-zova-name'] = currentUser.name;
      headers['x-zova-verified'] = currentUser.isVerified ? 'true' : 'false';
      if (currentUser.studentId) headers['x-zova-studentid'] = currentUser.studentId;
      if (currentUser.department) headers['x-zova-dept'] = currentUser.department;
      if (currentUser.authToken) headers['Authorization'] = `Bearer ${currentUser.authToken}`;
    }

    return headers;
  }

  // --- Authentication & Verification ---
  public async register(user: CurrentUser, passkey?: string) {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user, passkey }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to register');
    }
    return res.json();
  }

  public async verifyRole(passkey: string, user: CurrentUser) {
    const res = await fetch('/api/auth/verify-role', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ passkey, user }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Verification failed');
    }
    return res.json();
  }

  public async getPasskeyHints(): Promise<Array<{ key: string; role: Role; label: string }>> {
    try {
      const res = await fetch('/api/auth/passkey-info');
      if (res.ok) {
        const data = await res.json();
        return data.passkeys || [];
      }
    } catch {}
    return [
      { key: 'ZOVA-DEAN-SECURE', role: 'Dean', label: 'Dean of Student Welfare' },
      { key: 'ZOVA-HOD-AUTH', role: 'HOD', label: 'Department Head Authorization' },
      { key: 'ZOVA-AUTHORITY-ROOT', role: 'Higher Authority', label: 'Anti-Ragging Committee' },
      { key: 'ZOVA-FACULTY-2026', role: 'Faculty', label: 'Campus Faculty Staff' },
    ];
  }

  // --- Colleges ---
  public async getColleges(): Promise<College[]> {
    try {
      const res = await fetch('/api/colleges');
      if (res.ok) {
        const data = await res.json();
        return data.colleges || [];
      }
    } catch {}
    return [];
  }

  // --- Directory ---
  public async getDirectory(campusCode?: string): Promise<DirectoryContact[]> {
    try {
      const url = campusCode ? `/api/directory?campusCode=${encodeURIComponent(campusCode)}` : '/api/directory';
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        return data.contacts || [];
      }
    } catch {}
    return [];
  }

  public async addDirectoryContact(contact: Omit<DirectoryContact, 'id'>, currentUser: CurrentUser) {
    const res = await fetch('/api/directory', {
      method: 'POST',
      headers: this.getHeaders(currentUser),
      body: JSON.stringify(contact),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to add directory entry');
    }
    return res.json();
  }

  public async updateDirectoryContact(id: string, updates: Partial<DirectoryContact>, currentUser: CurrentUser) {
    const res = await fetch(`/api/directory/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(currentUser),
      body: JSON.stringify(updates),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to update contact');
    }
    return res.json();
  }

  public async deleteDirectoryContact(id: string, currentUser: CurrentUser) {
    const res = await fetch(`/api/directory/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(currentUser),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to remove contact');
    }
    return res.json();
  }

  // --- Emergency Contacts ---
  public async getEmergencyContacts(location?: string, complaintType?: string): Promise<EmergencyContact[]> {
    try {
      const params = new URLSearchParams();
      if (location) params.append('location', location);
      if (complaintType) params.append('complaintType', complaintType);
      const res = await fetch(`/api/emergency-contacts?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        return data.contacts || [];
      }
    } catch {}
    return [];
  }

  // --- Complaints ---
  public async getComplaints(currentUser: CurrentUser): Promise<{ complaints: Complaint[]; forbidden?: boolean }> {
    try {
      const res = await fetch('/api/complaints', {
        headers: this.getHeaders(currentUser),
      });
      if (res.status === 403) {
        return { complaints: [], forbidden: true };
      }
      if (res.ok) {
        const data = await res.json();
        return { complaints: data.complaints || [] };
      }
    } catch {}
    return { complaints: [] };
  }

  public async submitComplaint(complaint: Complaint) {
    const res = await fetch('/api/complaints', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ complaint }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to submit complaint');
    }
    return res.json();
  }

  public async updateComplaintStatus(
    id: string,
    status: ComplaintStatus,
    note: string,
    currentUser: CurrentUser
  ) {
    const res = await fetch(`/api/complaints/${id}/status`, {
      method: 'POST',
      headers: this.getHeaders(currentUser),
      body: JSON.stringify({ status, note }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to update complaint status');
    }
    return res.json();
  }

  public async addPrivateNote(id: string, note: string, currentUser: CurrentUser) {
    const res = await fetch(`/api/complaints/${id}/notes`, {
      method: 'POST',
      headers: this.getHeaders(currentUser),
      body: JSON.stringify({ note }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to add private note');
    }
    return res.json();
  }

  public async trackReport(id: string): Promise<Complaint | null> {
    try {
      const res = await fetch(`/api/complaints/track/${encodeURIComponent(id)}`);
      if (res.ok) {
        const data = await res.json();
        return data.complaint;
      }
    } catch {}
    return null;
  }

  public async resetDemoData(): Promise<void> {
    try {
      await fetch('/api/demo/reset', { method: 'POST' });
    } catch {}
  }
}

export const apiClient = new ApiClient();
