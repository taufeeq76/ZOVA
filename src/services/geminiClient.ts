import { SeverityLevel } from '../types/index.ts';

export const geminiClient = {
  /**
   * Classify severity of an incident description.
   */
  async classifySeverity(
    description: string,
    category: string,
    raggingType: string
  ): Promise<SeverityLevel> {
    try {
      const res = await fetch('/api/smart/classify-severity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description, category, raggingType }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.severity) return data.severity;
      }
    } catch (err) {
      console.warn('Fallback severity classification used', err);
    }

    // Local client-side fallback
    const text = (description + ' ' + category).toLowerCase();
    if (
      text.includes('assault') ||
      text.includes('weapon') ||
      text.includes('death') ||
      text.includes('kill') ||
      text.includes('hospital') ||
      text.includes('critical')
    ) {
      return 'Critical';
    }
    if (
      text.includes('threat') ||
      text.includes('stalk') ||
      text.includes('forced') ||
      text.includes('extort') ||
      text.includes('obscene')
    ) {
      return 'High';
    }
    if (
      text.includes('humiliat') ||
      text.includes('abuse') ||
      text.includes('shout') ||
      text.includes('fake account')
    ) {
      return 'Medium';
    }
    return 'Low';
  },

  /**
   * Generate an objective 1-paragraph administrative summary.
   */
  async summarize(
    description: string,
    category: string,
    location: string,
    date: string
  ): Promise<string> {
    try {
      const res = await fetch('/api/smart/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description, category, location, date }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.summary) return data.summary;
      }
    } catch (err) {
      console.warn('Fallback summary used', err);
    }

    return `Report of alleged ${category.toLowerCase()} occurring at ${location || 'campus'} on ${date || 'recent date'}. Summary: ${description.slice(0, 180)}${description.length > 180 ? '...' : ''}`;
  },

  /**
   * "Help me describe it" - rewrites student's rough notes into a clear factual narrative.
   */
  async rewriteDescription(roughNotes: string): Promise<string> {
    try {
      const res = await fetch('/api/smart/rewrite-description', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roughNotes }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.enhancedDescription) return data.enhancedDescription;
      }
    } catch (err) {
      console.warn('Fallback rewrite used', err);
    }

    const trimmed = roughNotes.trim();
    if (!trimmed) return '';
    return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
  },
};
