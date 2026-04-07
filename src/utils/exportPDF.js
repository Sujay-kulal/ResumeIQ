function modernTemplate({ name }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>${name} — Resume</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;900&family=Space+Grotesk:wght@700&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Inter', sans-serif; font-size: 10.5pt; color: #1e293b; background: #fff; padding: 0; }
  .page { max-width: 800px; margin: 0 auto; padding: 40px 48px; }
  .header { display: flex; flex-direction: column; margin-bottom: 24px; padding-bottom: 18px; border-bottom: 3px solid #7c3aed; }
  .name { font-family: 'Space Grotesk', sans-serif; font-size: 26pt; font-weight: 900; color: #0f172a; letter-spacing: -0.02em; line-height: 1; }
  .contact { font-size: 9pt; color: #64748b; margin-top: 6px; letter-spacing: 0.03em; }
  .section { margin-bottom: 18px; }
  .section-title { font-family: 'Space Grotesk', sans-serif; font-size: 10pt; font-weight: 700; color: #7c3aed; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 8px; padding-bottom: 4px; border-bottom: 1px solid #e2e8f0; }
  .entry-header { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 4px; }
  .entry-title { font-weight: 700; color: #0f172a; font-size: 10.5pt; }
  .entry-date { font-size: 9pt; color: #64748b; font-style: italic; }
  .entry-sub { font-size: 9.5pt; color: #475569; margin-bottom: 4px; font-weight: 600; }
  ul { padding-left: 16px; margin: 4px 0 10px; }
  li { margin-bottom: 3px; line-height: 1.5; font-size: 10pt; }
  p { line-height: 1.65; margin-bottom: 6px; font-size: 10pt; color: #334155; }
  .skills-grid { display: flex; flex-wrap: wrap; gap: 5px; margin-top: 6px; }
  .skill-tag { background: #f1f5f9; border: 1px solid #e2e8f0; padding: 2px 10px; border-radius: 20px; font-size: 9pt; color: #475569; font-weight: 500; }
  @media print {
    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .page { padding: 24px 32px; }
    @page { margin: 0; size: A4; }
  }
</style>
</head>
<body>
<div class="page">
__CONTENT__
</div>
<script>window.onload = () => { setTimeout(() => window.print(), 500); }</script>
</body>
</html>`;
}

function classicTemplate({ name }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>${name} — Resume</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Merriweather:wght@400;700&family=Source+Sans+3:wght@400;600;700&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Source Sans 3', sans-serif; font-size: 10.5pt; color: #2d2d2d; background: #fff; }
  .page { max-width: 780px; margin: 0 auto; padding: 44px 52px; }
  .header { text-align: center; margin-bottom: 20px; padding-bottom: 16px; border-bottom: 2px solid #2d2d2d; }
  .name { font-family: 'Merriweather', serif; font-size: 22pt; font-weight: 700; color: #111; letter-spacing: 0.03em; }
  .contact { font-size: 9pt; color: #555; margin-top: 6px; }
  .section { margin-bottom: 16px; }
  .section-title { font-family: 'Merriweather', serif; font-size: 10.5pt; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; border-bottom: 1.5px solid #2d2d2d; padding-bottom: 3px; margin-bottom: 10px; color: #111; }
  .entry-title { font-weight: 700; font-size: 10.5pt; }
  .entry-date { font-size: 9pt; color: #666; font-style: italic; float: right; }
  ul { padding-left: 18px; margin: 5px 0 10px; }
  li { margin-bottom: 3px; line-height: 1.55; font-size: 10pt; }
  p { line-height: 1.65; margin-bottom: 6px; font-size: 10pt; }
  @media print {
    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .page { padding: 24px 36px; }
    @page { margin: 0; size: A4; }
  }
</style>
</head>
<body>
<div class="page">
__CONTENT__
</div>
<script>window.onload = () => { setTimeout(() => window.print(), 500); }</script>
</body>
</html>`;
}

function minimalTemplate({ name }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>${name} — Resume</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'DM Sans', sans-serif; font-size: 10pt; color: #333; background: #fff; }
  .page { max-width: 760px; margin: 0 auto; padding: 48px 56px; }
  .header { margin-bottom: 28px; }
  .name { font-size: 20pt; font-weight: 700; color: #111; letter-spacing: -0.01em; }
  .contact { font-size: 9pt; color: #888; margin-top: 4px; }
  .section { margin-bottom: 20px; }
  .section-title { font-size: 7.5pt; font-weight: 700; text-transform: uppercase; letter-spacing: 0.18em; color: #888; margin-bottom: 10px; }
  .entry-title { font-weight: 700; font-size: 10.5pt; color: #222; }
  .entry-date { font-size: 9pt; color: #aaa; }
  ul { padding-left: 14px; margin: 6px 0 12px; list-style: '– '; }
  li { margin-bottom: 3px; line-height: 1.5; font-size: 10pt; }
  p { line-height: 1.7; margin-bottom: 6px; font-size: 10pt; color: #444; }
  @media print {
    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .page { padding: 28px 40px; }
    @page { margin: 0; size: A4; }
  }
</style>
</head>
<body>
<div class="page">
__CONTENT__
</div>
<script>window.onload = () => { setTimeout(() => window.print(), 500); }</script>
</body>
</html>`;
}

function parsePlainTextToHTML(resumeText, templateName) {
  const lines = resumeText.split('\n');
  const isModern = templateName === 'modern';

  let html = '';
  let inSection = false;
  let sectionName = '';
  let bulletBuffer = [];

  const flushBullets = () => {
    if (bulletBuffer.length > 0) {
      html += `<ul>${bulletBuffer.map(b => `<li>${b}</li>`).join('')}</ul>`;
      bulletBuffer = [];
    }
  };

  const SECTION_HEADERS = ['SUMMARY', 'SKILLS', 'EXPERIENCE', 'PROJECTS', 'EDUCATION', 'ACHIEVEMENTS'];
  const DIVIDER = /^[-=]{10,}$/;

  const totalLines = lines.length;

  let headerDone = false;
  let nameFound = false;
  let contactFound = false;

  for (let i = 0; i < totalLines; i++) {
    const raw = lines[i];
    const line = raw.trim();

    if (!headerDone) {
      if (!nameFound && line) {
        html += `<div class="header"><div class="name">${line}</div>`;
        nameFound = true;
        continue;
      }
      if (nameFound && !contactFound && line) {
        html += `<div class="contact">${line.replace(/\|/g, '&nbsp;·&nbsp;')}</div></div>`;
        contactFound = true;
        headerDone = true;
        continue;
      }
      continue;
    }

    if (SECTION_HEADERS.includes(line)) {
      flushBullets();
      if (inSection) html += '</div>'; 
      sectionName = line;
      html += `<div class="section"><div class="section-title">${line}</div>`;
      inSection = true;
      continue;
    }

    if (DIVIDER.test(line)) continue;

    if (!line) {
      flushBullets();
      continue;
    }

    if (/^[•·▸→*-]\s/.test(raw) || /^\s{2,}[•·▸→*-]\s/.test(raw)) {
      const content = line.replace(/^[•·▸→*-]\s*/, '');
      bulletBuffer.push(content);
      continue;
    }

    // Entry header (Role | Company | Date) inside EXPERIENCE or PROJECTS
    if ((sectionName === 'EXPERIENCE' || sectionName === 'PROJECTS') && line.includes('|')) {
      flushBullets();
      const parts = line.split('|').map(p => p.trim());
      const role = parts[0] || '';
      const company = parts[1] || '';
      const date = parts[2] || '';
      html += `<div class="entry-header"><div class="entry-title">${role}</div><div class="entry-date">${date}</div></div>`;
      if (company) html += `<div class="entry-sub">${company}</div>`;
      continue;
    }

    // Skills categorized lines
    if (sectionName === 'SKILLS' && line.includes(':')) {
      const [cat, vals] = line.split(':');
      const skills = vals ? vals.trim().split(',').map(s => s.trim()) : [];
      if (isModern) {
        html += `<div style="margin-bottom:8px"><strong style="color:#7c3aed;font-size:8.5pt;text-transform:uppercase;letter-spacing:0.05em">${cat.trim()}</strong><div class="skills-grid">${skills.map(s => `<span class="skill-tag">${s}</span>`).join('')}</div></div>`;
      } else {
        html += `<p><strong>${cat.trim()}:</strong> ${skills.join(', ')}</p>`;
      }
      continue;
    }

    flushBullets();
    html += `<p>${line}</p>`;
  }

  flushBullets();
  if (inSection) html += '</div>';

  return html;
}

export function exportResumePDF(resumeText, name, contact, templateName = 'modern') {
  const htmlContent = parsePlainTextToHTML(resumeText, templateName);

  let templateFn;
  if (templateName === 'classic') templateFn = classicTemplate;
  else if (templateName === 'minimal') templateFn = minimalTemplate;
  else templateFn = modernTemplate;

  const fullHTML = templateFn({ name, contact, resumeText })
    .replace('__CONTENT__', htmlContent);

  const win = window.open('', '_blank');
  if (!win) {
    alert('Please allow popups for this site to export PDF.');
    return;
  }
  win.document.open();
  win.document.write(fullHTML);
  win.document.close();
}
