import express from 'express';
import cors from 'cors';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// ─── CORS ────────────────────────────────────────────────────
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:4173',
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin)) cb(null, true);
    else cb(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

app.use(express.json({ limit: '2mb' }));

// ─── Rate limiting (simple in-memory) ────────────────────────
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW = 60_000; // 1 minute
const RATE_LIMIT_MAX = 15;        // 15 requests per minute

function rateLimit(req, res, next) {
  const ip = req.ip || req.connection.remoteAddress;
  const now = Date.now();
  const entry = rateLimitMap.get(ip) || { count: 0, resetAt: now + RATE_LIMIT_WINDOW };

  if (now > entry.resetAt) {
    entry.count = 0;
    entry.resetAt = now + RATE_LIMIT_WINDOW;
  }

  entry.count++;
  rateLimitMap.set(ip, entry);

  if (entry.count > RATE_LIMIT_MAX) {
    return res.status(429).json({ error: 'Too many requests. Please wait a moment.' });
  }
  next();
}

app.use('/api', rateLimit);

// ─── Gemini client ───────────────────────────────────────────
let genAI = null;
let model = null;

function getModel() {
  if (!model) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error('GEMINI_API_KEY not configured');
    genAI = new GoogleGenerativeAI(apiKey);
    model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  }
  return model;
}

// ─── Utility: safe Gemini call ───────────────────────────────
async function callGemini(prompt) {
  const m = getModel();
  const result = await m.generateContent(prompt);
  const response = await result.response;
  return response.text();
}

// ─── Health check ────────────────────────────────────────────
app.get('/', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'ResumeIQ Backend',
    version: '1.0.0',
    endpoints: [
      'POST /api/analyze-resume',
      'POST /api/generate-resume',
    ],
  });
});

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─── POST /api/analyze-resume ────────────────────────────────
app.post('/api/analyze-resume', async (req, res) => {
  try {
    const { resumeText, targetRole } = req.body;

    if (!resumeText || typeof resumeText !== 'string') {
      return res.status(400).json({ error: 'resumeText is required and must be a string.' });
    }
    if (resumeText.length < 50) {
      return res.status(400).json({ error: 'Resume text is too short for meaningful analysis.' });
    }
    if (resumeText.length > 50_000) {
      return res.status(400).json({ error: 'Resume text is too long (max 50,000 characters).' });
    }

    const role = targetRole || 'Software Engineer (General)';

    const prompt = `You are an expert ATS (Applicant Tracking System) resume analyst.

Analyze the following resume for the role: "${role}"

Resume:
"""
${resumeText.slice(0, 8000)}
"""

Provide your analysis as a JSON object with this exact structure:
{
  "overall_score": <number 0-100>,
  "skill_match_percentage": <number 0-100>,
  "section_scores": {
    "skills": <number 0-100>,
    "experience": <number 0-100>,
    "projects": <number 0-100>,
    "education": <number 0-100>,
    "formatting": <number 0-100>
  },
  "matched_keywords": [<strings of skills found>],
  "missing_keywords": [<strings of important missing skills for this role>],
  "weak_points": [<strings of weak bullet points found>],
  "improved_bullets": [
    {"original": "<weak bullet>", "improved": "<strengthened version>"}
  ],
  "suggested_skills": [<top 10 skills to add>],
  "section_feedback": {
    "skills": "<detailed feedback>",
    "experience": "<detailed feedback>",
    "projects": "<detailed feedback>",
    "formatting": "<detailed feedback>"
  },
  "summary": {
    "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
    "improvements": ["<improvement 1>", "<improvement 2>", "<improvement 3>"]
  },
  "ai_suggestions": "<2-3 paragraph personalized advice for this candidate>"
}

Return ONLY valid JSON, no markdown formatting, no code fences.`;

    const text = await callGemini(prompt);

    // Parse the JSON from Gemini response
    let analysis;
    try {
      // Strip any markdown code fences if present
      const cleaned = text.replace(/^```json?\s*/i, '').replace(/\s*```\s*$/i, '').trim();
      analysis = JSON.parse(cleaned);
    } catch {
      // If JSON parsing fails, return a structured error with raw text
      return res.json({
        ai_enhanced: true,
        parse_error: true,
        raw_response: text.slice(0, 2000),
        ai_suggestions: text.slice(0, 2000),
      });
    }

    res.json({
      ...analysis,
      ai_enhanced: true,
    });

  } catch (err) {
    console.error('analyze-resume error:', err.message);
    if (err.message.includes('GEMINI_API_KEY')) {
      return res.status(500).json({ error: 'AI service not configured. Using local analysis.' });
    }
    res.status(500).json({ error: 'AI analysis failed. Please try again.' });
  }
});

// ─── POST /api/generate-resume ───────────────────────────────
app.post('/api/generate-resume', async (req, res) => {
  try {
    const { userData, targetRole, selectedGitHubProjects } = req.body;

    if (!userData || typeof userData !== 'object') {
      return res.status(400).json({ error: 'userData object is required.' });
    }
    if (!userData.name || !userData.skills || !userData.experience) {
      return res.status(400).json({ error: 'name, skills, and experience are required fields.' });
    }

    const role = targetRole || userData.targetRole || 'Software Engineer (General)';

    // Build context about GitHub projects if provided
    let githubContext = '';
    if (selectedGitHubProjects && selectedGitHubProjects.length > 0) {
      githubContext = `\n\nGitHub Projects to include:\n${selectedGitHubProjects.map(p =>
        `- ${p.name}: ${p.description || 'No description'} [${p.language || 'Unknown'}] ⭐${p.stargazers_count || 0}`
      ).join('\n')}`;
    }

    const prompt = `You are an expert resume writer specializing in ATS-optimized resumes for tech roles.

Create a professional, ATS-optimized resume for the role: "${role}"

Candidate Information:
- Name: ${userData.name}
- Contact: ${userData.contact || 'Not provided'}
- Summary: ${userData.summary || 'Not provided'}
- Skills: ${userData.skills}
- Experience: ${userData.experience}
- Projects: ${userData.projects || 'Not provided'}
- Education: ${userData.education || 'Not provided'}
- Achievements: ${userData.achievements || 'None'}${githubContext}

Requirements:
1. Use STRONG action verbs (Engineered, Built, Deployed, Optimized, Led, etc.)
2. Add quantifiable metrics where possible (%, users, time saved, etc.)
3. Structure with clear resume headers: SUMMARY, SKILLS, EXPERIENCE, PROJECTS, EDUCATION
4. Make every bullet point follow the pattern: Action Verb + Task + Technology + Measurable Result
5. Optimize for ATS keyword matching for the "${role}" role
6. Keep concise — 1-2 pages max
7. Include relevant keywords from the job domain naturally throughout

Return the resume as plain text with clear section headers (use ALL CAPS headers with dashes underneath).
Also include a section at the end titled "---AI SUGGESTIONS---" with 3-5 specific tips to further improve this resume.`;

    const text = await callGemini(prompt);

    // Split resume from suggestions
    const parts = text.split(/---\s*AI SUGGESTIONS\s*---/i);
    const resumeText = parts[0].trim();
    const suggestions = parts[1]
      ? parts[1].trim().split('\n').filter(l => l.trim().length > 5).map(l => l.replace(/^\d+\.\s*/, '').trim())
      : [];

    res.json({
      resumeText,
      suggestions,
      ai_generated: true,
    });

  } catch (err) {
    console.error('generate-resume error:', err.message);
    if (err.message.includes('GEMINI_API_KEY')) {
      return res.status(500).json({ error: 'AI service not configured. Using local generation.' });
    }
    res.status(500).json({ error: 'AI generation failed. Please try again.' });
  }
});

// ─── Global error handler ────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error.' });
});

// ─── MongoDB Connection ──────────────────────────────────────
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.warn('⚠️  MONGODB_URI not found in .env. MongoDB will not be connected.');
} else {
  mongoose.connect(MONGODB_URI)
    .then(() => console.log('✅ Connected to MongoDB Atlas'))
    .catch(err => console.error('❌ MongoDB connection error:', err));
}

// ─── Start ───────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀 ResumeIQ Backend running on http://localhost:${PORT}`);
  console.log(`   Health: http://localhost:${PORT}/api/health`);
  console.log(`   Gemini: ${process.env.GEMINI_API_KEY ? '✅ API key configured' : '⚠️  GEMINI_API_KEY not set'}`);
  console.log(`   CORS:   ${allowedOrigins.join(', ')}\n`);
});
