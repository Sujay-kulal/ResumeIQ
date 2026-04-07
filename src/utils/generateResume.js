/**
 * ============================================================
 * RESUME GENERATOR ENGINE
 * Part 1: Builds an ATS-optimized resume from raw user inputs.
 * Part 2: Scores it using the local ATS scoring rules.
 * Part 3: Optionally enhances via backend Gemini AI.
 * ============================================================
 */

import { analyzeResume, ROLE_KEYWORDS } from './analyzeResume.js';
import { apiGenerateResume } from '../api.js';

// ─── Action Verb Library (strong verbs by domain) ────────────
const ACTION_VERBS = [
  'Engineered', 'Built', 'Designed', 'Developed', 'Implemented',
  'Architected', 'Automated', 'Optimized', 'Streamlined', 'Launched',
  'Deployed', 'Led', 'Delivered', 'Migrated', 'Integrated',
  'Reduced', 'Increased', 'Improved', 'Spearheaded', 'Refactored',
];

// ─── Vague phrase replacements ────────────────────────────────
const VAGUE_MAP = {
  'worked on':       'Developed',
  'helped with':     'Contributed to',
  'responsible for': 'Led',
  'assisted with':   'Supported',
  'was involved in': 'Participated in',
  'tasked with':     'Delivered',
  'part of':         'Collaborated on',
  'familiar with':   'Proficient in',
  'knowledge of':    'Experienced in',
  'exposure to':     'Skilled in',
  'contributed to':  'Enhanced',
  'worked as':       'Served as',
};

/**
 * Replace vague phrases and ensure bullet starts with an action verb.
 */
function strengthenBullet(bullet, index = 0) {
  let b = bullet.trim();

  // Replace vague openings
  for (const [vague, strong] of Object.entries(VAGUE_MAP)) {
    const regex = new RegExp(`^${vague}\\s+`, 'i');
    if (regex.test(b)) {
      b = strong + ' ' + b.slice(vague.length).trimStart();
      break;
    }
  }

  // If no action verb detected at start, prepend one
  const startsWithVerb = ACTION_VERBS.some(v => b.toLowerCase().startsWith(v.toLowerCase()));
  if (!startsWithVerb) {
    const verb = ACTION_VERBS[index % ACTION_VERBS.length];
    b = `${verb} ${b.charAt(0).toLowerCase()}${b.slice(1)}`;
  }

  // Truncate if too long (keep concise ~20 words)
  const words = b.split(' ');
  if (words.length > 22) b = words.slice(0, 22).join(' ') + '...';

  return b;
}

/**
 * Parse multi-line text field into bullet array.
 */
function parseBullets(text) {
  return text
    .split('\n')
    .map(l => l.replace(/^[\s•\-*]\s*/, '').trim())
    .filter(l => l.length > 5);
}

/**
 * Parse experience entries (format: "Role | Company | Duration\nbullets")
 */
function parseExperience(expText) {
  const blocks = expText.split(/\n\s*\n/).filter(b => b.trim());
  return blocks.map(block => {
    const lines = block.trim().split('\n');
    const header = lines[0];
    const bullets = lines.slice(1).map((l, i) => strengthenBullet(l.replace(/^[\s•\-*]\s*/, '').trim(), i)).filter(b => b.length > 5);
    return { header: header.trim(), bullets };
  });
}

/**
 * Parse project entries (format: "Project Name\nDescription\nbullets")
 */
function parseProjects(projText) {
  const blocks = projText.split(/\n\s*\n/).filter(b => b.trim());
  return blocks.map(block => {
    const lines = block.trim().split('\n');
    const name = lines[0].trim();
    const rest = lines.slice(1).map(l => l.replace(/^[\s•\-*]\s*/, '').trim()).filter(l => l.length > 3);
    return { name, details: rest };
  });
}

/**
 * Format skills into clean categorized lines.
 */
function formatSkills(skillsText, targetRole) {
  // Try to split by comma or newline
  const raw = skillsText.replace(/\n/g, ', ');
  // Also append top role keywords the user might have missed but listed
  const roleKws = ROLE_KEYWORDS[targetRole] || [];
  const userSkills = raw.split(',').map(s => s.trim()).filter(Boolean);

  // Categorize loosely
  const languages   = userSkills.filter(s => /python|javascript|typescript|java|c\+\+|c#|go|rust|swift|kotlin|dart|ruby|php|r\b|sql|html|css|bash/i.test(s));
  const frameworks  = userSkills.filter(s => /react|vue|angular|next|node|express|django|flask|fastapi|spring|flutter|laravel|rails|svelte/i.test(s));
  const tools       = userSkills.filter(s => /git|docker|kubernetes|jenkins|webpack|vite|jest|cypress|postman|figma|jira|linux|nginx|redis|kafka|spark/i.test(s));
  const platforms   = userSkills.filter(s => /aws|gcp|azure|firebase|heroku|vercel|netlify|digitalocean|cloudflare/i.test(s));
  const other       = userSkills.filter(s => ![...languages, ...frameworks, ...tools, ...platforms].includes(s));

  const lines = [];
  if (languages.length)  lines.push(`Languages   : ${languages.join(', ')}`);
  if (frameworks.length) lines.push(`Frameworks  : ${frameworks.join(', ')}`);
  if (tools.length)      lines.push(`Tools       : ${tools.join(', ')}`);
  if (platforms.length)  lines.push(`Platforms   : ${platforms.join(', ')}`);
  if (other.length)      lines.push(`Other       : ${other.join(', ')}`);

  return lines.length ? lines.join('\n') : raw;
}

// ─── PART 1: Build Resume Text (local) ─────────────────────────
export function buildResumeText({ name, contact, summary, skills, experience, projects, education, achievements, targetRole }) {
  const lines = [];

  // Header
  lines.push(name.trim().toUpperCase());
  lines.push(contact.trim());
  lines.push('');

  // Summary
  lines.push('SUMMARY');
  lines.push('-'.repeat(60));
  const summaryLines = summary.split('\n').map(l => l.trim()).filter(Boolean);
  summaryLines.forEach(l => lines.push(l));
  lines.push('');

  // Skills
  lines.push('SKILLS');
  lines.push('-'.repeat(60));
  lines.push(formatSkills(skills, targetRole));
  lines.push('');

  // Experience
  lines.push('EXPERIENCE');
  lines.push('-'.repeat(60));
  const expEntries = parseExperience(experience);
  expEntries.forEach(entry => {
    lines.push(entry.header);
    entry.bullets.forEach(b => lines.push(`  • ${b}`));
    lines.push('');
  });

  // Projects
  lines.push('PROJECTS');
  lines.push('-'.repeat(60));
  const projEntries = parseProjects(projects);
  projEntries.forEach(entry => {
    lines.push(entry.name);
    entry.details.forEach((d, i) => lines.push(`  • ${strengthenBullet(d, i)}`));
    lines.push('');
  });

  // Education
  lines.push('EDUCATION');
  lines.push('-'.repeat(60));
  education.split('\n').map(l => l.trim()).filter(Boolean).forEach(l => lines.push(l));
  lines.push('');

  // Achievements (optional)
  if (achievements && achievements.trim()) {
    lines.push('ACHIEVEMENTS');
    lines.push('-'.repeat(60));
    achievements.split('\n').map(l => l.replace(/^[\s•\-*]\s*/, '').trim()).filter(Boolean).forEach(l => lines.push(`  • ${l}`));
    lines.push('');
  }

  return lines.join('\n');
}

// ─── PART 2: Generate + Analyze (with backend fallback) ──────
export async function generateAndAnalyze(userData) {
  // Try backend AI generation first
  let aiResult = null;
  try {
    aiResult = await apiGenerateResume(userData);
  } catch {
    // Backend unavailable — that's fine, use local
  }

  let resumeText;
  let aiSuggestions = [];

  if (aiResult && aiResult.resumeText && aiResult.ai_generated) {
    // Use AI-generated resume text
    resumeText = aiResult.resumeText;
    aiSuggestions = aiResult.suggestions || [];
  } else {
    // Fallback: use local template-based generation
    resumeText = buildResumeText(userData);
  }

  // Always run local ATS scoring on the final resume
  const analysisResult = await analyzeResume(resumeText, null, userData.targetRole);

  return {
    resumeText,
    ...analysisResult,
    ai_generated: !!(aiResult?.ai_generated),
    ai_suggestions: aiSuggestions.length > 0 ? aiSuggestions.join('\n\n') : null,
  };
}
