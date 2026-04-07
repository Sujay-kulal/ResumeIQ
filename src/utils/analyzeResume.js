/**
 * ============================================================
 * LOCAL RESUME ANALYSIS ENGINE
 * Zero API calls — runs entirely in the browser.
 * Implements deterministic ATS scoring rules:
 *   Skills Match  → 40%
 *   Experience    → 20%
 *   Projects      → 20%
 *   Formatting    → 20%
 * ============================================================
 */

// ─── Predefined skill keyword sets per role ──────────────────
export const ROLE_KEYWORDS = {
  'Frontend Developer': [
    'React', 'Vue', 'Angular', 'JavaScript', 'TypeScript', 'HTML', 'CSS', 'SASS',
    'Redux', 'Webpack', 'Vite', 'REST API', 'GraphQL', 'Jest', 'Cypress',
    'Responsive Design', 'Web Performance', 'Accessibility', 'Git', 'Node.js',
  ],
  'Backend Developer': [
    'Node.js', 'Python', 'Java', 'Spring Boot', 'Django', 'FastAPI', 'Express',
    'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'Docker', 'Kubernetes',
    'REST API', 'GraphQL', 'Microservices', 'CI/CD', 'AWS', 'Git', 'Linux',
  ],
  'Full Stack Developer': [
    'React', 'Node.js', 'JavaScript', 'TypeScript', 'Python', 'SQL', 'MongoDB',
    'REST API', 'GraphQL', 'Docker', 'AWS', 'Git', 'CI/CD', 'Redis',
    'HTML', 'CSS', 'Express', 'PostgreSQL', 'Agile', 'Microservices',
  ],
  'Data Scientist': [
    'Python', 'R', 'Machine Learning', 'Deep Learning', 'TensorFlow', 'PyTorch',
    'Pandas', 'NumPy', 'Scikit-learn', 'SQL', 'Tableau', 'Power BI',
    'Statistics', 'Natural Language Processing', 'Computer Vision', 'Jupyter',
    'Feature Engineering', 'Model Deployment', 'A/B Testing', 'Data Visualization',
  ],
  'Machine Learning Engineer': [
    'Python', 'TensorFlow', 'PyTorch', 'Scikit-learn', 'MLOps', 'Kubernetes',
    'Docker', 'AWS SageMaker', 'Feature Engineering', 'Model Training',
    'Model Serving', 'Spark', 'Airflow', 'Kubeflow', 'ONNX', 'Transformers',
    'REST API', 'SQL', 'CI/CD', 'Git',
  ],
  'DevOps Engineer': [
    'Docker', 'Kubernetes', 'Terraform', 'Ansible', 'Jenkins', 'GitHub Actions',
    'AWS', 'GCP', 'Azure', 'Linux', 'Bash', 'Python', 'Prometheus', 'Grafana',
    'CI/CD', 'Helm', 'Nginx', 'Git', 'Microservices', 'Networking',
  ],
  'Mobile Developer': [
    'React Native', 'Flutter', 'Swift', 'Kotlin', 'iOS', 'Android', 'Dart',
    'Xcode', 'Android Studio', 'REST API', 'Firebase', 'Redux', 'SQLite',
    'App Store', 'Play Store', 'Push Notifications', 'Git', 'TypeScript',
  ],
  'UI/UX Designer': [
    'Figma', 'Sketch', 'Adobe XD', 'Prototyping', 'Wireframing', 'User Research',
    'Usability Testing', 'Design Systems', 'Information Architecture',
    'Interaction Design', 'Accessibility', 'HTML', 'CSS', 'Adobe Illustrator',
    'Photoshop', 'Design Thinking', 'A/B Testing',
  ],
  'Cloud Engineer': [
    'AWS', 'Azure', 'GCP', 'Terraform', 'CloudFormation', 'Kubernetes', 'Docker',
    'IAM', 'VPC', 'Load Balancers', 'Lambda', 'S3', 'EC2', 'RDS',
    'CI/CD', 'Networking', 'Security', 'Linux', 'Python', 'Bash',
  ],
  'Cybersecurity Analyst': [
    'Penetration Testing', 'SIEM', 'Vulnerability Assessment', 'SOC',
    'Incident Response', 'Firewall', 'IDS/IPS', 'OWASP', 'Python', 'Linux',
    'Network Security', 'Cryptography', 'Risk Assessment', 'Compliance',
    'Active Directory', 'Wireshark', 'Metasploit', 'CISSP', 'CEH',
  ],
  'Product Manager': [
    'Product Roadmap', 'Agile', 'Scrum', 'User Stories', 'Stakeholder Management',
    'A/B Testing', 'KPI', 'OKR', 'Jira', 'Product Strategy', 'Market Research',
    'User Research', 'Analytics', 'SQL', 'Figma', 'Go-to-Market', 'Prioritization',
  ],
  'Data Analyst': [
    'SQL', 'Python', 'Excel', 'Tableau', 'Power BI', 'Data Visualization',
    'Statistics', 'Pandas', 'NumPy', 'ETL', 'Data Cleaning', 'R',
    'Google Analytics', 'A/B Testing', 'Dashboard', 'Reporting', 'BigQuery',
  ],
  'Software Engineer (General)': [
    'Data Structures', 'Algorithms', 'OOP', 'Design Patterns', 'Git', 'SQL',
    'REST API', 'Agile', 'Unit Testing', 'CI/CD', 'Docker', 'Linux',
    'System Design', 'Microservices', 'Code Review', 'Python', 'Java',
  ],
};

export const ROLE_OPTIONS = Object.keys(ROLE_KEYWORDS);

// ─── Scoring constants ────────────────────────────────────────
const ACTION_VERBS = [
  'developed', 'built', 'designed', 'implemented', 'architected', 'engineered',
  'created', 'launched', 'deployed', 'optimized', 'reduced', 'increased',
  'improved', 'automated', 'led', 'managed', 'delivered', 'migrated',
  'integrated', 'refactored', 'established', 'resolved', 'spearheaded',
  'accelerated', 'streamlined', 'transformed', 'configured', 'maintained',
  'collaborated', 'mentored', 'trained', 'analyzed', 'researched',
  'published', 'presented', 'authored', 'coordinated', 'facilitated',
];

const VAGUE_PHRASES = [
  'worked on', 'responsible for', 'assisted with', 'helped with',
  'part of a team', 'involved in', 'participated in', 'was tasked with',
  'tasked with', 'contributed to', 'familiar with', 'exposure to',
  'knowledge of', 'experience with', 'worked as', 'was involved',
  'various tasks', 'multiple tasks', 'various projects',
];

const SECTION_HEADERS = [
  'experience', 'work experience', 'employment', 'professional experience',
  'skills', 'technical skills', 'core skills',
  'education', 'academic background', 'qualifications',
  'projects', 'personal projects', 'academic projects', 'portfolio',
  'summary', 'objective', 'profile', 'about',
  'certifications', 'achievements', 'awards',
];

const QUANTIFIER_PATTERN = /\d+\s*(%|percent|x|times|users|customers|engineers|team|members|days|weeks|months|years|hours|minutes|seconds|ms|k\b|million|billion|\$|€|£|rupees?|inr)/i;
const NUMBER_PATTERN = /\b\d{2,}\b/;

// ─── STEP 1: Skill matching ───────────────────────────────────
function matchSkills(text, roleKeywords) {
  const lower = text.toLowerCase();
  const matched = [];
  const missing = [];

  for (const kw of roleKeywords) {
    // handle multi-word keywords: all words must be present near each other
    const kwLower = kw.toLowerCase();
    if (lower.includes(kwLower)) {
      matched.push(kw);
    } else {
      missing.push(kw);
    }
  }

  const pct = Math.round((matched.length / roleKeywords.length) * 100);
  return { matched, missing, pct };
}

// ─── STEP 2: Extract bullet-like lines ───────────────────────
function extractBullets(text) {
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 15);
  // Prefer lines that start with bullet markers, dashes, or look like bullet points
  return lines.filter(l =>
    l.startsWith('•') || l.startsWith('-') || l.startsWith('*') ||
    l.startsWith('→') || l.startsWith('▸') ||
    /^[a-z]/i.test(l.slice(0, 1)) // also plain lines
  ).map(l => l.replace(/^[•\-*→▸]\s*/, '').trim()).filter(l => l.length > 20);
}

// ─── STEP 3: Score experience quality ────────────────────────
function scoreExperience(text, bullets) {
  let score = 50; // base
  const lower = text.toLowerCase();
  const issues = [];
  const goodBullets = [];

  // Check for action verbs
  let actionCount = 0;
  let vaguePenalty = 0;
  let quantifiedCount = 0;

  for (const bullet of bullets) {
    const bl = bullet.toLowerCase();

    const startsWithVerb = ACTION_VERBS.some(v => bl.startsWith(v));
    if (startsWithVerb) actionCount++;

    const hasVague = VAGUE_PHRASES.some(p => bl.includes(p));
    if (hasVague) {
      vaguePenalty++;
      issues.push(bullet.slice(0, 120));
    }

    const hasQuantifier = QUANTIFIER_PATTERN.test(bullet) || NUMBER_PATTERN.test(bullet);
    if (hasQuantifier) quantifiedCount++;
    else if (startsWithVerb) {
      goodBullets.push(bullet); // good verb but no metric yet
    }
  }

  const bulletCount = Math.max(bullets.length, 1);
  const actionRate = actionCount / bulletCount;
  const quantRate = quantifiedCount / bulletCount;
  const vagueRate = vaguePenalty / bulletCount;

  score += Math.round(actionRate * 30);      // up to +30 for action verbs
  score += Math.round(quantRate * 20);       // up to +20 for quantification
  score -= Math.round(vagueRate * 30);       // up to -30 for vague phrases

  // Bonus: check for job titles / years of experience
  if (/\b(senior|lead|principal|staff|architect|manager)\b/i.test(lower)) score += 5;
  if (/\b\d+\s*\+?\s*years?\s*(of\s+)?(experience|exp)\b/i.test(lower)) score += 5;

  return {
    score: Math.min(100, Math.max(0, score)),
    weakBullets: issues.slice(0, 5),
    goodBulletsWithoutMetrics: goodBullets.slice(0, 3),
  };
}

// ─── STEP 4: Score projects ───────────────────────────────────
function scoreProjects(text) {
  const lower = text.toLowerCase();
  let score = 40;

  // Has a projects section
  const hasProjectsSection = /\b(project|portfolio|built|created)\b/i.test(lower);
  if (hasProjectsSection) score += 15;

  // Technologies mentioned
  const techKeywords = [
    'react', 'node', 'python', 'java', 'docker', 'aws', 'mongodb', 'sql',
    'tensorflow', 'flutter', 'android', 'ios', 'firebase', 'redis', 'rest',
    'api', 'html', 'css', 'javascript', 'typescript', 'github', 'git',
  ];
  const techMentioned = techKeywords.filter(t => lower.includes(t));
  score += Math.min(25, techMentioned.length * 3);

  // Impact/outcome described
  const hasOutcome = QUANTIFIER_PATTERN.test(text) || NUMBER_PATTERN.test(text);
  if (hasOutcome) score += 15;

  // Link to GitHub / live demo
  if (/github\.com|vercel\.app|netlify\.app|heroku\.com|demo|live\s+link/i.test(lower)) score += 5;

  return Math.min(100, score);
}

// ─── STEP 5: Score formatting ─────────────────────────────────
function scoreFormatting(text, rawText) {
  let score = 50;
  const lower = text.toLowerCase();

  // Section headers present
  const foundHeaders = SECTION_HEADERS.filter(h => lower.includes(h));
  score += Math.min(20, foundHeaders.length * 4);

  // Bullet points present
  const bulletCount = (rawText.match(/^[\s]*[•\-*▸→]/gm) || []).length;
  if (bulletCount >= 5) score += 15;
  else if (bulletCount >= 2) score += 8;

  // Length check (rough: 300-1200 words = ideal)
  const wordCount = rawText.split(/\s+/).filter(Boolean).length;
  if (wordCount >= 300 && wordCount <= 1200) score += 15;
  else if (wordCount < 150) score -= 15;
  else if (wordCount > 1800) score -= 10;

  // Contact info
  if (/[\w.]+@[\w.]+\.\w+/.test(rawText)) score += 5; // email
  if (/linkedin\.com|github\.com/.test(lower)) score += 5;

  return Math.min(100, Math.max(0, score));
}

// ─── STEP 6: Score education ──────────────────────────────────
function scoreEducation(text) {
  const lower = text.toLowerCase();
  let score = 40;

  const degreeKeywords = ['bachelor', 'master', 'phd', 'b.tech', 'm.tech', 'bsc', 'msc', 'be ', 'me ', 'mba', 'b.e', 'm.e'];
  if (degreeKeywords.some(d => lower.includes(d))) score += 20;

  if (/university|college|institute|school/i.test(lower)) score += 10;
  if (/\b(gpa|cgpa|grade)\s*[-:]?\s*\d/i.test(lower)) score += 10;
  if (/\b(honor|distinction|merit|gold medal|rank)\b/i.test(lower)) score += 10;
  if (/\b(2[0-9]{3})\b/.test(lower)) score += 10; // has year

  return Math.min(100, score);
}

// ─── STEP 7: Build section feedback ───────────────────────────
function buildFeedback(skillMatch, expScore, projectScore, formatScore, weakBullets) {
  const feedback = {};

  // Skills
  if (skillMatch.pct >= 70) {
    feedback.skills = `Strong skill alignment — ${skillMatch.pct}% keyword match (${skillMatch.matched.length}/${skillMatch.matched.length + skillMatch.missing.length} keywords found). Consider grouping skills by category (Languages, Frameworks, Tools) for better ATS parsing.`;
  } else if (skillMatch.pct >= 40) {
    feedback.skills = `Moderate skill match at ${skillMatch.pct}%. Add the missing keywords listed below to your Skills section. ATS systems scan for exact keyword matches — use the same terminology as job descriptions.`;
  } else {
    feedback.skills = `Low skill match at ${skillMatch.pct}% — only ${skillMatch.matched.length} of ${skillMatch.matched.length + skillMatch.missing.length} expected keywords detected. Significantly expand your Skills section with role-specific technologies.`;
  }

  // Experience
  if (expScore >= 75) {
    feedback.experience = `Experience section demonstrates strong use of action verbs and quantified results. Well-structured bullet points that communicate clear impact. Ensure each role has 3–5 bullets minimum.`;
  } else if (expScore >= 50) {
    feedback.experience = `Experience section has some strong bullets but ${weakBullets.length > 0 ? `${weakBullets.length} vague statements were detected (e.g., "Worked on", "Responsible for")` : 'lacks quantified metrics'}. Replace vague phrases with action verbs and add numbers to demonstrate impact (%, users, time saved).`;
  } else {
    feedback.experience = `Experience section heavily relies on vague, passive language. Rewrite all bullets starting with strong action verbs. Add quantifiable results to every bullet — recruiters spend 7 seconds scanning; make each line count.`;
  }

  // Projects
  if (projectScore >= 75) {
    feedback.projects = `Projects section clearly lists technologies used and describes outcomes. Good technical specificity. Consider adding links (GitHub/live demo) and user count or performance metrics for stronger impact.`;
  } else if (projectScore >= 50) {
    feedback.projects = `Projects mention some technologies but lack outcome/impact statements. For each project add: what problem it solved, technologies used, and a measurable result (e.g., "Served 500+ users", "Reduced load time by 40%").`;
  } else {
    feedback.projects = `Projects section is weak or missing. Add 2–3 significant projects with clear tech stack and impact. Even personal or academic projects count — they demonstrate initiative and practical skills.`;
  }

  // Formatting
  if (formatScore >= 75) {
    feedback.formatting = `Formatting is clean and ATS-friendly with clear section headers and proper use of bullet points. Resume length appears appropriate. Avoid tables, columns, or graphics which confuse ATS parsers.`;
  } else if (formatScore >= 50) {
    feedback.formatting = `Formatting is acceptable but could be improved. Ensure all major sections (Skills, Experience, Projects, Education) have clear headers. Use consistent bullet points throughout rather than paragraph text.`;
  } else {
    feedback.formatting = `Formatting needs significant improvement. Use a simple single-column layout with clearly labeled sections. Avoid graphics, tables, or unusual fonts. ATS parsers cannot read complex formatting and will reject the resume.`;
  }

  return feedback;
}

// ─── STEP 8: Generate bullet rewrites ────────────────────────
const REWRITE_TEMPLATES = [
  (orig, tech) => `Developed and deployed ${tech ? tech + ' solution' : 'full-stack application'} that improved operational efficiency by 30%, reducing manual processing time by 5+ hours per week.`,
  (orig, tech) => `Implemented ${tech || 'automated'} pipeline using ${tech || 'modern tooling'}, reducing error rate by 40% and increasing team throughput by 2×.`,
  (orig, tech) => `Engineered scalable ${tech || 'backend'} service handling 10,000+ daily requests with 99.9% uptime, improving user response time by 35%.`,
  (orig, tech) => `Led development of ${tech || 'core'} module adopted by 500+ users, delivering feature on schedule within a 2-week sprint cycle.`,
  (orig, tech) => `Optimized ${tech || 'database'} queries and caching strategy, cutting API latency from 800ms to under 200ms — a 75% performance improvement.`,
];

function detectTech(bullet) {
  const techs = [
    'React', 'Node.js', 'Python', 'Java', 'SQL', 'MongoDB', 'PostgreSQL',
    'Docker', 'AWS', 'REST API', 'GraphQL', 'Django', 'Express', 'Redis',
    'Kubernetes', 'Firebase', 'TypeScript', 'Vue', 'Angular', 'Flutter',
  ];
  for (const t of techs) {
    if (bullet.toLowerCase().includes(t.toLowerCase())) return t;
  }
  return null;
}

function rewriteBullets(weakBullets) {
  return weakBullets.slice(0, 3).map((bullet, i) => {
    const tech = detectTech(bullet);
    const template = REWRITE_TEMPLATES[i % REWRITE_TEMPLATES.length];
    return {
      original: bullet.length > 120 ? bullet.slice(0, 120) + '...' : bullet,
      improved: template(bullet, tech),
    };
  });
}

// ─── STEP 9: Generate suggested skills ───────────────────────
function suggestSkills(missing) {
  // Return top missing keywords (already calculated)
  return missing.slice(0, 10);
}

// ─── STEP 10: Summary ─────────────────────────────────────────
function buildSummary(skillPct, expScore, projectScore, formatScore, eduScore, matched, missing) {
  const strengths = [];
  const improvements = [];

  if (skillPct >= 60) strengths.push(`Good keyword coverage — ${skillPct}% skill match against target role expectations.`);
  if (expScore >= 65) strengths.push('Experience section uses action-oriented language with measurable outcomes.');
  if (projectScore >= 60) strengths.push('Projects demonstrate relevant technical hands-on experience.');
  if (formatScore >= 65) strengths.push('Resume structure is clean and ATS-parseable with proper section headers.');
  if (eduScore >= 65) strengths.push('Education section is well-documented with relevant qualifications.');

  while (strengths.length < 3) {
    const fill = [
      'Resume has a clear professional structure that is easy to scan.',
      'Contact information is present and properly formatted.',
      'Resume covers the essential sections expected by recruiters.',
    ];
    const next = fill[strengths.length] || 'Resume provides a solid foundation to build on.';
    if (!strengths.includes(next)) strengths.push(next);
    else break;
  }

  if (skillPct < 60) improvements.push(`Add ${missing.slice(0, 5).join(', ')} to your Skills section — currently missing ${missing.length} expected keywords.`);
  if (expScore < 60) improvements.push('Rewrite vague experience bullets using: Action Verb + Task + Technology + Result (e.g., "Developed React dashboard that reduced support tickets by 20%").');
  if (projectScore < 60) improvements.push('Strengthen Projects section by adding technologies used and measurable outcomes (users, performance %, deployment details).');
  if (formatScore < 60) improvements.push('Improve formatting — use consistent bullet points, clear section headers, and keep resume to 1–2 pages.');

  while (improvements.length < 3) {
    const fill = [
      'Tailor this resume for each job posting by matching exact keywords from the job description.',
      'Add a concise 2–3 line professional summary at the top highlighting your strongest skills.',
      'Include GitHub profile and/or live project links to give recruiters tangible proof of work.',
    ];
    const next = fill[improvements.length] || 'Review and proofread for grammatical errors and inconsistent formatting.';
    if (!improvements.includes(next)) improvements.push(next);
    else break;
  }

  return {
    strengths: strengths.slice(0, 3),
    improvements: improvements.slice(0, 3),
  };
}

// ─── MAIN EXPORT ─────────────────────────────────────────────
/**
 * Analyze resume text locally — no API, no network.
 * Returns the same JSON shape as the previous Gemini-based analyzer.
 */
export async function analyzeResume(resumeText, _apiKey, targetRole = 'Software Engineer (General)') {
  const roleKeywords = ROLE_KEYWORDS[targetRole] || ROLE_KEYWORDS['Software Engineer (General)'];
  const text = resumeText;
  const lower = text.toLowerCase();

  // 1. Skill matching
  const skillData = matchSkills(lower, roleKeywords);

  // 2. Extract bullets
  const bullets = extractBullets(text);

  // 3. Score sections
  const expData = scoreExperience(text, bullets);
  const projectScore = scoreProjects(text);
  const formatScore = scoreFormatting(lower, text);
  const eduScore = scoreEducation(text);

  // 4. Compute scores
  const skillScore = Math.round(40 + skillData.pct * 0.6); // 40–100 range
  const expScore = expData.score;
  const atsScore = Math.round(skillScore * 0.40 + expScore * 0.20 + projectScore * 0.20 + formatScore * 0.20);
  const overallScore = atsScore;

  // 5. Build outputs
  const section_feedback = buildFeedback(skillData, expScore, projectScore, formatScore, expData.weakBullets);
  const improved_bullets = rewriteBullets(expData.weakBullets);
  const summary = buildSummary(skillData.pct, expScore, projectScore, formatScore, eduScore, skillData.matched, skillData.missing);
  const suggested_skills = suggestSkills(skillData.missing);

  // 6. Keyword density — count appearances of each matched keyword
  const keyword_density = {};
  for (const kw of skillData.matched) {
    const regex = new RegExp(kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    const matches = lower.match(regex);
    keyword_density[kw.toLowerCase()] = matches ? matches.length : 1;
  }

  // 7. Return full shape
  return {
    overall_score: overallScore,
    skill_match_percentage: skillData.pct,
    section_scores: {
      skills:     skillScore,
      experience: expScore,
      projects:   projectScore,
      education:  eduScore,
      ats:        atsScore,
      formatting: formatScore,
    },
    matched_keywords:  skillData.matched,
    missing_keywords:  skillData.missing,
    weak_points:       expData.weakBullets,
    improved_bullets,
    suggested_skills,
    section_feedback,
    summary,
    keyword_density,
  };
}
