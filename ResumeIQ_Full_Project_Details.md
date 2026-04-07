# ResumeIQ: Full Project Documentation

## 1. Project Overview
ResumeIQ is a modern, high-performance web application designed to locally analyze resumes against Applicant Tracking System (ATS) standards. Originally conceived as an AI-powered tool leveraging the Google Gemini API, it has been deliberately re-architected into a **100% local, privacy-first, rule-based engine**.

**Key Features:**
- **Zero Privacy Risk:** Resumes are never transmitted over the internet or saved to any external servers. The analysis runs entirely in the user's browser.
- **Instant Processing:** Without network requests or API rate limits, feedback generation occurs in milliseconds.
- **Client-Side Document Parsing:** Extracts text directly from PDFs and DOCX files securely within the browser using web workers.
- **Precision ATS Scoring:** Uses deterministic rule-based algorithms to score the resume precisely on four distinct vectors.

---

## 2. Technology Stack
- **Framework:** React 18 with Vite (for ultra-fast HMR and optimized production bundling)
- **Styling:** Custom Vanilla CSS with a bespoke glassmorphism design system, dark-mode, and complex SVG animations.
- **Text Extraction:**
  - `pdfjs-dist`: For reading and extracting text layers from PDF files.
  - `mammoth`: For extracting raw text from DOCX files.
- **File Handling:** `react-dropzone` for drag-and-drop mechanics and file type validation.
- **Icons & Visuals:** Inline SVGs, CSS Gradients, and animated components (e.g., Score Ring, Skill Match Gauge).

---

## 3. System Architecture & Components

The application is structured into modular React components, handling distinct parts of the user journey:

### `App.jsx` (Core Controller)
The main state machine managing the flow of data:
1. `file`: The uploaded resume document.
2. `targetRole`: The selected job profile (e.g., Frontend Developer).
3. `result`: The final ATS scoring object returned by the analysis engine.
It conditionally renders the Uploader, Loader, and Results sections based on the current state.

### `ResumeUploader.jsx` (Input Layer)
Handles file intake and configuration:
- Allows selecting 1 of 12 predefined roles or entering a custom role.
- Validates the uploaded file type and size.
- Displays a prominent "100% Local" badge and an educational "How It Works" step-by-step graphic.

### `extractText.js` (Parsing Engine)
A utility script configured for heavy client-side text processing:
- **PDF Extraction:** Loads the `pdf.js` worker from a CDN. It iterates through every page of the uploaded PDF, extracting the `textContent` items and joining them into a clean string.
- **DOCX Extraction:** Uses `mammoth.extractRawText` to convert the binary `ArrayBuffer` into readable plain text.

### `analyzeResume.js` (The Brain)
The deterministic local scoring engine. Detailed fully in Section 4.

### Rendering the Results:
- **`ScoreDashboard.jsx`:** Provides high-level visual feedback. Features a dynamically animated SVG ring for the overall ATS score and a smaller donut gauge for the Skill Match percentage.
- **`AnalysisPanels.jsx`:** Provides detailed, actionable feedback. Displays matched/missing keywords, points out weak bullets, suggests AI-like rewrites, and gives section-by-section qualitative feedback.

---

## 4. Local Analysis Engine Mechanics

The `analyzeResume.js` engine simulates how an enterprise ATS scans a resume. The score comprises four factors:

### A. Skills Match (40% Weight)
The engine contains libraries of ~20 high-value keywords for standard roles (e.g., *Data Scientist* checks for Python, PyTorch, SQL, Pandas, A/B Testing).
- Converts resume to lowercase.
- Performs substring/boundary matching for each predefined keyword.
- **Outputs:** Percentage match, array of missing skills to add.

### B. Experience Quality (20% Weight)
Breaks down the text into bullet points and evaluates their strength.
- **Rewards:** Presence of action verbs (e.g., *Engineered, Spearheaded, Optimized*).
- **Rewards:** Quantifiable metrics using Regex (numbers, `%`, `$`, time measurements).
- **Penalizes:** Vague, passive phrasing (e.g., *Worked on, Responsible for*).
- **Template Rewrites:** Selects weak bullets and maps them into a robust `Action Verb + Task + Tech + Result` template format.

### C. Projects Quality (20% Weight)
Recognizes that technical roles require hands-on technical outputs.
- Searches for dedicated project sections.
- Evaluates if specific technologies (React, Docker, AWS) are explicitly mentioned in proximity to project headers.
- Looks for links (GitHub/Live demo) as proof of work.

### D. Formatting (20% Weight)
Parsers require standard formatting to comprehend the document hierarchy.
- Checks for standard headers (*Experience, Education, Skills*).
- Validates that the document uses actual bullet points (`•`, `-`) rather than massive paragraph blocks.
- Uses word-count heuristics to penalize overly sparse (<150 words) or excessively dense (>1800 words) resumes.

---

## 5. Build and Execution
Because of the heavy PDF.js worker and Mammoth dependencies, the Vite configuration (`vite.config.js`) includes manual chunk splitting (`manualChunks`). This ensures the vendor libraries are packaged separately from the application code, preventing a massive initial payload block.

To run the application locally:
```bash
npm install
npm run dev
```

To build for production deployment (Netlify, Vercel, GitHub Pages):
```bash
npm run build
```
