/**
 * ============================================================
 * REAL-TIME RESUME INPUT CORRECTION ENGINE
 * Fixes grammar, replaces weak phrases, improves tone.
 * 100% local — no API calls.
 * ============================================================
 */

// ─── Weak phrase → strong action verb replacements ───────────
const WEAK_REPLACEMENTS = [
  [/^worked on\s+/i,          'Developed '],
  [/^was working on\s+/i,     'Developed '],
  [/^helped (?:with\s+|to\s+)?/i,      'Contributed to '],
  [/^assisted (?:with\s+|in\s+)?/i,    'Supported '],
  [/^responsible for\s+/i,    'Led '],
  [/^was responsible for\s+/i,'Led '],
  [/^in charge of\s+/i,       'Managed '],
  [/^tasked with\s+/i,        'Delivered '],
  [/^involved in\s+/i,        'Contributed to '],
  [/^part of (?:a |the )?team\s+/i, 'Collaborated to '],
  [/^part of\s+/i,            'Participated in '],
  [/^did\s+/i,                'Executed '],
  [/^did work on\s+/i,        'Developed '],
  [/^made\s+/i,               'Created '],
  [/^did the\s+/i,            'Handled '],
  [/^handling\s+/i,           'Managed '],
  [/^managing\s+/i,           'Managed '],
  [/^creating\s+/i,           'Created '],
  [/^building\s+/i,           'Built '],
  [/^developing\s+/i,         'Developed '],
  [/^designing\s+/i,          'Designed '],
  [/^implementing\s+/i,       'Implemented '],
  [/^working with\s+/i,       'Leveraged '],
  [/^used\s+/i,               'Utilized '],
  [/^using\s+/i,              'Leveraged '],
  [/^tried to\s+/i,           'Worked to '],
  [/^focused on\s+/i,         'Spearheaded '],
  [/^dealt with\s+/i,         'Resolved '],
];

// ─── Strong action verbs to detect (no replacement needed) ───
const STRONG_VERBS = [
  'Engineered', 'Architected', 'Developed', 'Built', 'Designed',
  'Implemented', 'Optimized', 'Automated', 'Deployed', 'Launched',
  'Led', 'Managed', 'Delivered', 'Created', 'Established',
  'Migrated', 'Integrated', 'Streamlined', 'Reduced', 'Increased',
  'Improved', 'Spearheaded', 'Refactored', 'Enhanced', 'Transformed',
  'Negotiated', 'Mentored', 'Collaborated', 'Contributed', 'Executed',
  'Coordinated', 'Configured', 'Leveraged', 'Resolved', 'Analyzed',
  'Utilized', 'Prototyped', 'Authored', 'Maintained', 'Monitored',
  'Supported', 'Handled', 'Established', 'Drove', 'Achieved',
];

// ─── Grammar fixups ──────────────────────────────────────────
const GRAMMAR_PATTERNS = [
  // Fix double spaces
  [/  +/g, ' '],
  // Fix comma spacing
  [/\s+,/g, ','],
  [/,(?=[^\s])/g, ', '],
  // Lowercase "i " → "I " in the middle of sentence
  [/\bi\b/g, 'I'],
  // Fix "to to", "a a" etc.
  [/\b(\w+)\s+\1\b/gi, '$1'],
  // Fix trailing period in bullets (optional)
  // Remove trailing whitespace
  [/\s+$/gm, ''],
];

/**
 * Capitalize first letter of a string.
 */
function capitalize(str) {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Check if a line already starts with a strong action verb.
 */
function startsWithStrongVerb(line) {
  return STRONG_VERBS.some(v => line.toLowerCase().startsWith(v.toLowerCase()));
}

/**
 * Apply weak phrase replacements to a single bullet line.
 */
function replacWeakPhrase(line) {
  for (const [pattern, replacement] of WEAK_REPLACEMENTS) {
    if (pattern.test(line)) {
      return capitalize(line.replace(pattern, replacement));
    }
  }
  return line;
}

/**
 * Apply grammar fixups to a text block.
 */
function applyGrammar(text) {
  let result = text;
  for (const [pattern, replacement] of GRAMMAR_PATTERNS) {
    result = result.replace(pattern, replacement);
  }
  return result;
}

/**
 * Correct a single bullet point line.
 */
function correctBullet(line) {
  const trimmed = line.trim();
  if (!trimmed) return line;

  // Strip bullet characters
  const bulletMatch = trimmed.match(/^([•·→▸\-\*]\s*)/);
  const bulletPrefix = bulletMatch ? bulletMatch[1] : '';
  let content = bulletMatch ? trimmed.slice(bulletPrefix.length).trim() : trimmed;

  // Skip if it's a header line (contains | separator — Role | Company | Date)
  if (content.includes('|')) return line;

  // Skip very short lines (might be section headers or dates)
  if (content.split(' ').length < 3) return line;

  // Capitalize first letter
  content = capitalize(content);

  // Replace weak phrases
  if (!startsWithStrongVerb(content)) {
    content = replacWeakPhrase(content);
  }

  // Apply grammar fixes
  content = applyGrammar(content);

  // Reconstruct with original indent + bullet
  const indent = line.match(/^(\s*)/)?.[1] || '';
  return `${indent}${bulletPrefix}${content}`;
}

/**
 * Correct a summary paragraph.
 */
function correctSummary(text) {
  let result = text.trim();
  // Capitalize first letter
  result = capitalize(result);
  // Apply grammar
  result = applyGrammar(result);
  return result;
}

/**
 * Main correction function.
 * Handles multi-line text blocks (experience, projects, summary).
 *
 * @param {string} input - Raw user input
 * @param {'experience'|'projects'|'summary'|'general'} fieldType
 * @returns {{ corrected: string, changed: boolean, changes: string[] }}
 */
export function correctInput(input, fieldType = 'general') {
  if (!input || !input.trim()) return { corrected: input, changed: false, changes: [] };

  const lines = input.split('\n');
  const correctedLines = [];
  const changes = [];

  for (const line of lines) {
    const trimmed = line.trim();

    if (fieldType === 'summary') {
      const fixed = correctSummary(line);
      if (fixed !== line) changes.push(`"${trimmed.slice(0, 40)}…" improved`);
      correctedLines.push(fixed);
      continue;
    }

    // For experience/projects: treat non-empty lines as potential bullets
    if (!trimmed) {
      correctedLines.push(line);
      continue;
    }

    // Header lines (Role | Company | Date) — skip correction
    if (trimmed.includes('|') && !trimmed.startsWith('•') && !trimmed.startsWith('-')) {
      const fixed = capitalize(trimmed);
      correctedLines.push(fixed);
      continue;
    }

    // Bullet lines
    const fixed = correctBullet(line);
    if (fixed.trim() !== line.trim() && trimmed.length > 5) {
      changes.push(`"${trimmed.slice(0, 35)}…"  →  stronger`);
    }
    correctedLines.push(fixed);
  }

  const corrected = correctedLines.join('\n');
  const changed = corrected !== input;

  return { corrected, changed, changes: changes.slice(0, 5) };
}

/**
 * Quick single-line correction (for summary field).
 */
export function correctLine(line) {
  return correctInput(line, 'summary').corrected;
}
