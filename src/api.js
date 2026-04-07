/**
 * ============================================================
 * BACKEND API CLIENT
 * Communicates with the Express server on Render.
 * Returns null on any failure so the local engine takes over.
 * ============================================================
 */

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';
const TIMEOUT  = 15_000; // 15 seconds

/**
 * Internal fetch wrapper with timeout and error handling.
 */
async function apiFetch(endpoint, body) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT);

  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    clearTimeout(timer);

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      console.warn(`API ${endpoint} returned ${res.status}:`, err.error || 'Unknown error');
      return null;
    }

    return await res.json();
  } catch (err) {
    clearTimeout(timer);
    if (err.name === 'AbortError') {
      console.warn(`API ${endpoint} timed out after ${TIMEOUT}ms`);
    } else {
      console.warn(`API ${endpoint} failed:`, err.message);
    }
    return null;
  }
}

/**
 * Send resume text to backend for AI-enhanced analysis.
 * Returns the AI analysis result or null if backend is unavailable.
 */
export async function apiAnalyzeResume(resumeText, targetRole) {
  return apiFetch('/api/analyze-resume', { resumeText, targetRole });
}

/**
 * Send user data to backend for AI-powered resume generation.
 * Returns { resumeText, suggestions } or null if backend is unavailable.
 */
export async function apiGenerateResume(userData, selectedGitHubProjects = []) {
  return apiFetch('/api/generate-resume', {
    userData,
    targetRole: userData.targetRole,
    selectedGitHubProjects,
  });
}

/**
 * Check if the backend is reachable.
 */
export async function apiHealthCheck() {
  try {
    const res = await fetch(`${API_BASE}/api/health`, { signal: AbortSignal.timeout(5000) });
    return res.ok;
  } catch {
    return false;
  }
}
