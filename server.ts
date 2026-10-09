import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  classifySeverityWithGemini,
  summarizeComplaintWithGemini,
  rewriteDescriptionWithGemini,
} from './server/gemini.ts';
import { serverDb, INSTITUTIONAL_PASSKEYS } from './server/db.ts';
import { Role } from './src/types/index.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  // Body parsing
  app.use(express.json({ limit: '25mb' }));
  app.use(express.urlencoded({ extended: true, limit: '25mb' }));

  // Health check endpoint
  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      app: 'ZOVA',
      tagline: 'Safer Campus. Stronger You.',
      timestamp: new Date().toISOString(),
    });
  });

  // ==========================================
  // AUTHENTICATION & REGISTRATION ENDPOINTS
  // ==========================================

  // Register new profile (with campus details & role verification)
  app.post('/api/auth/register', (req, res) => {
    try {
      const { user, passkey } = req.body;
      if (!user || !user.name || !user.role) {
        res.status(400).json({ error: 'Name and role are required fields' });
        return;
      }

      let isVerified = false;
      let verificationMethod: any = 'unverified_pending';

      if (user.role === 'Student') {
        isVerified = true;
        verificationMethod = 'student_portal';
      } else if (passkey) {
        const verifyResult = serverDb.verifyRoleWithPasskey(passkey, user);
        if (verifyResult.success) {
          isVerified = true;
          verificationMethod = 'institutional_passkey';
        }
      }

      const userData = {
        ...user,
        isVerified,
        verificationMethod,
      };

      const result = serverDb.registerUser(userData);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to register account' });
    }
  });

  // Verify role with institutional passkey
  app.post('/api/auth/verify-role', (req, res) => {
    try {
      const { passkey, user } = req.body;
      if (!passkey || !passkey.trim()) {
        res.status(400).json({ error: 'Please enter an institutional passkey' });
        return;
      }

      const verifyResult = serverDb.verifyRoleWithPasskey(passkey, user);
      if (!verifyResult.success) {
        res.status(403).json({ error: verifyResult.message });
        return;
      }

      res.json(verifyResult);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Verification failed' });
    }
  });

  // Get institutional verification passkey hints (for evaluation & testing)
  app.get('/api/auth/passkey-info', (_req, res) => {
    res.json({
      passkeys: Object.entries(INSTITUTIONAL_PASSKEYS).map(([key, info]) => ({
        key,
        role: info.role,
        label: info.label,
      })),
    });
  });

  // ==========================================
  // CAMPUS DIRECTORY ENDPOINTS
  // ==========================================

  // Get directory contacts
  app.get('/api/directory', (req, res) => {
    try {
      const campusCode = req.query.campusCode as string | undefined;
      const contacts = serverDb.getDirectory(campusCode);
      res.json({ contacts });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to fetch directory' });
    }
  });

  // Add contact to directory (Server-side authorization: requires verified authority or faculty)
  app.post('/api/directory', (req, res) => {
    try {
      const requesterRole = req.headers['x-zova-role'] as string;
      const isVerified = req.headers['x-zova-verified'] === 'true';

      const allowedRoles = ['Dean', 'HOD', 'Higher Authority', 'Faculty'];
      if (!isVerified || !allowedRoles.includes(requesterRole)) {
        res.status(403).json({
          error: 'Only verified campus authorities and faculty can manage the campus directory.',
        });
        return;
      }

      const { name, designation, roleType, department, phone, email, officeRoom, campusCode } = req.body;
      if (!name || !phone || !email) {
        res.status(400).json({ error: 'Name, phone, and email are required fields.' });
        return;
      }

      const newContact = serverDb.addDirectoryContact({
        name,
        designation: designation || 'Staff',
        roleType: roleType || 'Staff',
        department: department || 'General Administration',
        phone,
        email,
        officeRoom: officeRoom || 'Admin Wing',
        isAvailable: true,
        verifiedCampusBadge: true,
        campusCode: campusCode || 'AIST-BLR',
      });

      res.status(201).json({ contact: newContact });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to add directory entry' });
    }
  });

  // Update directory contact
  app.put('/api/directory/:id', (req, res) => {
    try {
      const requesterRole = req.headers['x-zova-role'] as string;
      const isVerified = req.headers['x-zova-verified'] === 'true';

      const allowedRoles = ['Dean', 'HOD', 'Higher Authority', 'Faculty'];
      if (!isVerified || !allowedRoles.includes(requesterRole)) {
        res.status(403).json({
          error: 'Only verified campus authorities can edit directory entries.',
        });
        return;
      }

      const updated = serverDb.updateDirectoryContact(req.params.id, req.body);
      if (!updated) {
        res.status(404).json({ error: 'Directory contact not found' });
        return;
      }

      res.json({ contact: updated });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to update contact' });
    }
  });

  // Delete directory contact
  app.delete('/api/directory/:id', (req, res) => {
    try {
      const requesterRole = req.headers['x-zova-role'] as string;
      const isVerified = req.headers['x-zova-verified'] === 'true';

      const allowedRoles = ['Dean', 'HOD', 'Higher Authority'];
      if (!isVerified || !allowedRoles.includes(requesterRole)) {
        res.status(403).json({
          error: 'Only verified Dean, HOD, or Higher Authority can remove directory entries.',
        });
        return;
      }

      const success = serverDb.deleteDirectoryContact(req.params.id);
      if (!success) {
        res.status(404).json({ error: 'Directory contact not found' });
        return;
      }

      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to remove contact' });
    }
  });

  // ==========================================
  // EMERGENCY CONTACTS ENDPOINTS
  // ==========================================

  // Get emergency contacts dynamically filtered by location and complaint type
  app.get('/api/emergency-contacts', (req, res) => {
    try {
      const location = req.query.location as string | undefined;
      const complaintType = req.query.complaintType as string | undefined;

      const contacts = serverDb.getEmergencyContacts(location, complaintType);
      res.json({ contacts });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to fetch emergency contacts' });
    }
  });

  // ==========================================
  // EMERGENCY SOS ENDPOINTS (LIVE HARASSMENT & RAGGING PREVENTION)
  // ==========================================

  // Trigger an emergency SOS alert
  app.post('/api/sos/trigger', (req, res) => {
    try {
      const { student, location, triggerMode, locationError } = req.body;
      if (!student || !student.name) {
        res.status(400).json({ error: 'Valid authenticated student profile required to trigger SOS' });
        return;
      }

      const incident = serverDb.triggerSOS({
        student,
        location: location || null,
        triggerMode: triggerMode || 'hold_press',
        locationError,
      });

      res.status(201).json({
        incident,
        message: 'Emergency SOS broadcasted successfully. Campus responders notified.',
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to trigger emergency SOS' });
    }
  });

  // Get active SOS incidents for authorities & live synchronization
  app.get('/api/sos/active', (req, res) => {
    try {
      const campusCode = (req.query.campusCode as string) || (req.headers['x-zova-campus'] as string);
      const activeIncidents = serverDb.getActiveSOS(campusCode);
      res.json({ activeIncidents });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to fetch active SOS incidents' });
    }
  });

  // Get incident details by ID
  app.get('/api/sos/:id', (req, res) => {
    try {
      const incident = serverDb.getSOSById(req.params.id);
      if (!incident) {
        res.status(404).json({ error: 'Emergency SOS incident not found' });
        return;
      }
      res.json({ incident });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to fetch incident' });
    }
  });

  // Acknowledge SOS alert (Authority only)
  app.post('/api/sos/:id/acknowledge', (req, res) => {
    try {
      const actorRole = (req.headers['x-zova-role'] as Role) || req.body.actorRole || 'Dean';
      const actorName = (req.headers['x-zova-name'] as string) || req.body.actorName || 'Campus Responder';

      const incident = serverDb.acknowledgeSOS(req.params.id, actorRole, actorName);
      if (!incident) {
        res.status(404).json({ error: 'Emergency incident not found' });
        return;
      }

      res.json({
        incident,
        message: `Alert acknowledged by ${actorRole} (${actorName}). First responder dispatched.`,
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to acknowledge alert' });
    }
  });

  // Update SOS status (e.g. Response in progress, Resolved, Escalated)
  app.post('/api/sos/:id/status', (req, res) => {
    try {
      const { status, note, actorRole, actorName } = req.body;
      const role = (req.headers['x-zova-role'] as Role) || actorRole || 'Dean';
      const name = (req.headers['x-zova-name'] as string) || actorName || 'Campus Authority';

      const updated = serverDb.updateSOSStatus(req.params.id, status, role, name, note);
      if (!updated) {
        res.status(404).json({ error: 'Emergency incident not found' });
        return;
      }

      res.json({ incident: updated });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to update incident status' });
    }
  });

  // Cancel SOS alert (Student or Authority)
  app.post('/api/sos/:id/cancel', (req, res) => {
    try {
      const { cancelledBy, actorName, reason } = req.body;
      const who = cancelledBy || (req.headers['x-zova-role'] === 'Student' ? 'Student' : 'Authority');
      const name = actorName || (req.headers['x-zova-name'] as string) || 'Student';

      const updated = serverDb.cancelSOS(req.params.id, who, name, reason);
      if (!updated) {
        res.status(404).json({ error: 'Emergency incident not found' });
        return;
      }

      res.json({
        incident: updated,
        message: 'Emergency alert cancelled. Responders stood down.',
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to cancel incident' });
    }
  });

  // Update live streaming location during active emergency
  app.post('/api/sos/:id/location', (req, res) => {
    try {
      const { location } = req.body;
      if (!location || typeof location.latitude !== 'number') {
        res.status(400).json({ error: 'Valid location coordinates required' });
        return;
      }

      const updated = serverDb.updateSOSLocation(req.params.id, location);
      if (!updated) {
        res.status(404).json({ error: 'Emergency incident not found or resolved' });
        return;
      }

      res.json({ success: true, incident: updated });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to update emergency location' });
    }
  });

  // Add responder dispatch note to SOS incident
  app.post('/api/sos/:id/dispatch-note', (req, res) => {
    try {
      const { text, authorRole, authorName } = req.body;
      const role = (req.headers['x-zova-role'] as Role) || authorRole || 'Higher Authority';
      const name = (req.headers['x-zova-name'] as string) || authorName || 'Responder';

      if (!text || !text.trim()) {
        res.status(400).json({ error: 'Dispatch note text is required' });
        return;
      }

      const updated = serverDb.addSOSDispatchNote(req.params.id, role, name, text);
      if (!updated) {
        res.status(404).json({ error: 'Emergency incident not found' });
        return;
      }

      res.json({ incident: updated });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to post dispatch note' });
    }
  });

  // Get SOS incident history
  app.get('/api/sos-history', (req, res) => {
    try {
      const campusCode = (req.query.campusCode as string) || (req.headers['x-zova-campus'] as string);
      const history = serverDb.getSOSHistory(campusCode);
      res.json({ history });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to fetch SOS history' });
    }
  });

  // ==========================================
  // COLLEGES & CAMPUSES ENDPOINTS
  // ==========================================

  app.get('/api/colleges', (_req, res) => {
    try {
      const colleges = serverDb.getColleges();
      res.json({ colleges });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to fetch colleges' });
    }
  });

  // ==========================================
  // COMPLAINTS ENDPOINTS (SERVER-SIDE AUTHORIZATION & ANONYMIZATION)
  // ==========================================

  // Get complaints with strict role-based authorization and student privacy protection
  app.get('/api/complaints', (req, res) => {
    try {
      const role = (req.headers['x-zova-role'] as Role) || 'Student';
      const department = req.headers['x-zova-dept'] as string | undefined;
      const studentId = req.headers['x-zova-studentid'] as string | undefined;
      const isVerified = req.headers['x-zova-verified'] === 'true';

      const result = serverDb.getComplaintsForRequester(role, department, studentId, isVerified);

      if (result.forbidden) {
        res.status(403).json({ error: result.reason, forbidden: true });
        return;
      }

      res.json({ complaints: result.complaints });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to retrieve complaints' });
    }
  });

  // Public/Student anonymous report tracking
  app.get('/api/complaints/track/:id', (req, res) => {
    try {
      const trackingData = serverDb.getComplaintForTracking(req.params.id);
      if (!trackingData) {
        res.status(404).json({ error: 'Report not found. Please verify the Report ID.' });
        return;
      }
      res.json({ complaint: trackingData });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to track report' });
    }
  });

  // Submit new confidential complaint
  app.post('/api/complaints', async (req, res) => {
    try {
      const { complaint } = req.body;
      if (!complaint || !complaint.description || !complaint.category || !complaint.suspect?.name) {
        res.status(400).json({ error: 'Incomplete complaint payload. Required fields missing.' });
        return;
      }

      // Automatically classify severity and summarize if not already present
      if (!complaint.severity) {
        const severityResult = await classifySeverityWithGemini(
          complaint.description,
          complaint.category,
          complaint.raggingType || 'offline'
        );
        complaint.severity = severityResult.severity;
      }

      if (!complaint.aiSummary) {
        complaint.aiSummary = await summarizeComplaintWithGemini(
          complaint.description,
          complaint.category,
          complaint.location,
          complaint.incidentDate
        );
      }

      const result = serverDb.addComplaint(complaint);
      res.status(201).json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to file complaint' });
    }
  });

  // Update complaint status (Server-side authorization check)
  app.post('/api/complaints/:id/status', (req, res) => {
    try {
      const requesterRole = req.headers['x-zova-role'] as Role;
      const isVerified = req.headers['x-zova-verified'] === 'true';
      const actorName = (req.headers['x-zova-name'] as string) || requesterRole;

      const allowedRoles = ['HOD', 'Dean', 'Higher Authority'];
      if (!isVerified || !allowedRoles.includes(requesterRole)) {
        res.status(403).json({
          error: 'Only verified administrative authorities can update complaint resolution status.',
        });
        return;
      }

      const { status, note } = req.body;
      const updated = serverDb.updateComplaintStatus(
        req.params.id,
        status,
        note || '',
        requesterRole,
        actorName
      );

      if (!updated) {
        res.status(404).json({ error: 'Complaint not found' });
        return;
      }

      res.json({ complaint: updated });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to update complaint status' });
    }
  });

  // Add private note (Server-side authorization check)
  app.post('/api/complaints/:id/notes', (req, res) => {
    try {
      const requesterRole = req.headers['x-zova-role'] as Role;
      const isVerified = req.headers['x-zova-verified'] === 'true';
      const actorName = (req.headers['x-zova-name'] as string) || requesterRole;

      const allowedRoles = ['HOD', 'Dean', 'Higher Authority'];
      if (!isVerified || !allowedRoles.includes(requesterRole)) {
        res.status(403).json({
          error: 'Only verified administrative authorities can add private proctorial notes.',
        });
        return;
      }

      const { note } = req.body;
      if (!note || !note.trim()) {
        res.status(400).json({ error: 'Note text cannot be empty' });
        return;
      }

      const updated = serverDb.addPrivateNote(
        req.params.id,
        note.trim(),
        requesterRole,
        actorName
      );

      if (!updated) {
        res.status(404).json({ error: 'Complaint not found' });
        return;
      }

      res.json({ complaint: updated });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to add note' });
    }
  });

  // Reset demo data on server
  app.post('/api/demo/reset', (_req, res) => {
    try {
      serverDb.resetToDefaultDemo();
      res.json({ status: 'ok', message: 'ZOVA server database reset to default demo dataset' });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to reset demo data' });
    }
  });

  // ==========================================
  // SMART AI FEATURES (GEMINI 3.8 FLASH VIA @GOOGLE/GENAI)
  // ==========================================

  app.post('/api/smart/classify-severity', async (req, res) => {
    try {
      const { description, category, raggingType } = req.body;
      const result = await classifySeverityWithGemini(
        description || '',
        category || '',
        raggingType || 'offline'
      );
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to classify severity' });
    }
  });

  app.post('/api/smart/summarize', async (req, res) => {
    try {
      const { description, category, location, date } = req.body;
      const summary = await summarizeComplaintWithGemini(
        description || '',
        category || '',
        location || '',
        date || ''
      );
      res.json({ summary });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to generate summary' });
    }
  });

  app.post('/api/smart/rewrite-description', async (req, res) => {
    try {
      const { roughNotes } = req.body;
      if (!roughNotes || !roughNotes.trim()) {
        res.status(400).json({ error: 'Please provide rough notes to rewrite' });
        return;
      }
      const enhancedDescription = await rewriteDescriptionWithGemini(roughNotes);
      res.json({ enhancedDescription });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to rewrite description' });
    }
  });

  // ==========================================
  // STATIC / VITE MOUNTING
  // ==========================================

  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
        watch: process.env.DISABLE_HMR === 'true' ? null : {},
      },
      appType: 'spa',
    });

    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[ZOVA] Secure Server operational on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[ZOVA] Failed to start server:', err);
  process.exit(1);
});
