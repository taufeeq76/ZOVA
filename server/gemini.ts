import { GoogleGenAI } from '@google/genai';
import { SeverityLevel } from '../src/types/index.ts';

// Server-side initialization
const apiKey = process.env.GEMINI_API_KEY;
let aiClient: GoogleGenAI | null = null;

if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
  aiClient = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

/**
 * Heuristic fallback for severity classification if Gemini is unavailable.
 */
export function fallbackClassifySeverity(description: string, category?: string): SeverityLevel {
  const text = (description + ' ' + (category || '')).toLowerCase();
  if (
    text.includes('assault') ||
    text.includes('hit') ||
    text.includes('beat') ||
    text.includes('physical violence') ||
    text.includes('kill') ||
    text.includes('weapon') ||
    text.includes('suicide') ||
    text.includes('hospital') ||
    text.includes('critical') ||
    text.includes('death threat')
  ) {
    return 'Critical';
  }
  if (
    text.includes('threat') ||
    text.includes('stalk') ||
    text.includes('follow') ||
    text.includes('forced') ||
    text.includes('coerc') ||
    text.includes('blackmail') ||
    text.includes('extort') ||
    text.includes('obscene') ||
    text.includes('leak')
  ) {
    return 'High';
  }
  if (
    text.includes('humiliat') ||
    text.includes('abuse') ||
    text.includes('shout') ||
    text.includes('vulgar') ||
    text.includes('unwanted') ||
    text.includes('fake account') ||
    text.includes('mock')
  ) {
    return 'Medium';
  }
  return 'Low';
}

/**
 * Classifies severity using Gemini 3.8 Flash, or falls back to rules engine.
 */
export async function classifySeverityWithGemini(
  description: string,
  category: string,
  raggingType: string
): Promise<{ severity: SeverityLevel; reason?: string }> {
  if (!aiClient) {
    return { severity: fallbackClassifySeverity(description, category) };
  }

  try {
    const prompt = `Analyze this college campus safety report description and determine the severity level.
Report Type: ${raggingType}
Category: ${category}
Description: "${description}"

Categories of severity:
- "Critical": Imminent physical danger, weapons, physical assault, threats to life, severe sexual violation, or severe immediate retaliation.
- "High": Stalking, extortion, direct threats of violence, blackmail, continuous targeted intimidation, or distribution of non-consensual media.
- "Medium": Verbal abuse, forced tasks, public humiliation, derogatory impersonation, or persistent unwanted behaviour.
- "Low": Minor boundary infractions, isolated discourtesy, or initial unwanted remarks without explicit threats.

Respond ONLY with a JSON object in this exact schema:
{"severity": "Low" | "Medium" | "High" | "Critical", "reason": "brief 1-sentence justification"}`;

    const res = await aiClient.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(res.text || '{}');
    if (['Low', 'Medium', 'High', 'Critical'].includes(parsed.severity)) {
      return { severity: parsed.severity as SeverityLevel, reason: parsed.reason };
    }
    return { severity: fallbackClassifySeverity(description, category) };
  } catch (err) {
    console.warn('[Gemini classifySeverity fallback]', err);
    return { severity: fallbackClassifySeverity(description, category) };
  }
}

/**
 * Generates an objective, neutral 1-paragraph summary for administrative review.
 */
export async function summarizeComplaintWithGemini(
  description: string,
  category: string,
  location: string,
  date: string
): Promise<string> {
  if (!aiClient) {
    // Fallback neutral summary
    return `Report of alleged ${category.toLowerCase()} occurring at ${location || 'campus'} on ${date || 'recent date'}. Summary: ${description.slice(0, 150)}${description.length > 150 ? '...' : ''}`;
  }

  try {
    const prompt = `Write a neutral, objective, factual one-paragraph executive summary (2-3 sentences max) of this student incident report for institutional authority review. Do NOT take sides or assume guilt, use objective phrasing like "The reporter states...", "Incident allegedly occurred...".

Category: ${category}
Location: ${location}
Date: ${date}
Description: "${description}"`;

    const res = await aiClient.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
    });

    return res.text?.trim() || description.slice(0, 200);
  } catch (err) {
    console.warn('[Gemini summarize fallback]', err);
    return `Report regarding alleged ${category.toLowerCase()} at ${location || 'campus'}. ${description.slice(0, 180)}...`;
  }
}

/**
 * Rewrites rough, distressed, or fragmented student notes into a clear, chronological,
 * factual description WITHOUT inventing any new facts, names, or events.
 */
export async function rewriteDescriptionWithGemini(roughNotes: string): Promise<string> {
  if (!aiClient) {
    // Clean up casing and spacing as fallback
    const trimmed = roughNotes.trim();
    if (trimmed.length === 0) return '';
    return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
  }

  try {
    const prompt = `A college student in distress wrote the following rough notes about an incident of harassment or ragging.
Rewrite their notes into a clear, factual, objective, and well-structured incident description.

STRICT CONSTRAINTS:
- Do NOT invent or hallucinate any details, names, locations, dates, or actions not present in the original notes.
- Preserve the exact factual claims made by the student.
- Organize into clear, concise chronological sentences.
- Maintain a serious, dignified, and objective tone.

Student's rough notes:
"${roughNotes}"`;

    const res = await aiClient.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
    });

    return res.text?.trim() || roughNotes;
  } catch (err) {
    console.warn('[Gemini rewriteDescription fallback]', err);
    return roughNotes.trim();
  }
}
