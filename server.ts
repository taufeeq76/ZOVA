import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  classifySeverityWithGemini,
  summarizeComplaintWithGemini,
  rewriteDescriptionWithGemini,
} from './server/gemini.ts';

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
    res.json({ status: 'ok', app: 'SafeCampus', timestamp: new Date().toISOString() });
  });

  // Smart Features Proxy (Gemini 3.8 Flash via @google/genai SDK)
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

  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    // Mount Vite middleware in development
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
    // Serve production static build
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[SafeCampus] Server operational on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[SafeCampus] Failed to start server:', err);
  process.exit(1);
});
