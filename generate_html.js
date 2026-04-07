const fs = require('fs');

const md = fs.readFileSync('ResumeIQ_Full_Project_Details.md', 'utf8');

// Basic ultra-light markdown to HTML parser for our specific doc
let html = md
  .replace(/^### (.*$)/gim, '<h3>$1</h3>')
  .replace(/^## (.*$)/gim, '<h2>$1</h2>')
  .replace(/^# (.*$)/gim, '<h1>$1</h1>')
  .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
  .replace(/\*(.*?)\*/g, '<em>$1</em>')
  .replace(/`(.*?)`/g, '<code>$1</code>')
  .replace(/^\s*-\s(.*)/gim, '<li>$1</li>')
  .replace(/<\/li>\n<li>/gim, '</li><li>') // clean up list breaks
  .replace(/^(?!<[hl])/gim, '<p>')
  .replace(/<p><\/p>/gim, '')
  .replace(/\n/g, '<br>');

// Fix lists block
html = html.replace(/(<li>.*<\/li>)/gim, '<ul>$1</ul>').replace(/<\/ul><br><ul>/g, '');
html = html.replace(/<br><\/ul>/g, '</ul>').replace(/<ul><br>/g, '<ul>');
html = html.replace(/<p><br>/g, '<p>').replace(/<br><\/p>/g, '</p>');
html = html.replace(/<br><h3>/g, '<h3>').replace(/<br><h2>/g, '<h2>');
html = html.replace(/<p>---<br><\/p>/g, '<hr>');

const template = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>ResumeIQ Project Details</title>
    <style>
        body { font-family: 'Inter', -apple-system, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 40px; background: #fff; }
        h1 { color: #1a1a1a; border-bottom: 2px solid #7c3aed; padding-bottom: 10px; }
        h2 { color: #2563eb; margin-top: 30px; border-bottom: 1px solid #eee; padding-bottom: 5px; }
        h3 { color: #4b5563; margin-top: 25px; }
        p { margin: 15px 0; }
        ul { margin: 15px 0; padding-left: 20px; }
        li { margin-bottom: 8px; }
        code { background: #f3f4f6; padding: 2px 6px; border-radius: 4px; font-family: monospace; font-size: 0.9em; color: #db2777; }
        hr { border: 0; border-top: 1px solid #e5e7eb; margin: 40px 0; }
        strong { color: #111; }
        @media print {
            body { padding: 0; max-width: none; }
            h2, h3 { page-break-after: avoid; }
            p, li { page-break-inside: avoid; }
        }
    </style>
</head>
<body>
    ${html}
</body>
</html>`;

fs.writeFileSync('ResumeIQ_Full_Project_Details.html', template);
console.log('Successfully generated HTML format suitable for printing to PDF.');
