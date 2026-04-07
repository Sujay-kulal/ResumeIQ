# ResumeIQ: Local ATS Analysis Engine Documentation

## Overview

ResumeIQ uses a **100% local, rule-based analysis engine** to evaluate your resume. This means:
- **No APIs are used.** Your resume data is never sent to external servers (like Google Gemini or OpenAI).
- **Absolute Privacy.** Everything runs directly in your browser.
- **Instant Results.** Since there are no network requests, the analysis is generated in milliseconds.

The engine parses the extracted text from your PDF or DOCX file and applies a strict **40/20/20/20 ATS scoring formula** to determine your overall ATS compatibility.

---

## The ATS Scoring Formula

The overall pass rate of your resume is calculated using the following weighted dimensions:

1. **Skills Match (40%)**
2. **Experience Quality (20%)**
3. **Projects Quality (20%)**
4. **Formatting (20%)**

### 1. Skills Match (40% of Total Score)
When you select a **Target Job Role**, the engine loads a predefined library of 20 high-value technical keywords specific to that role (e.g., *Frontend Developer* checks for React, JavaScript, Responsive Design, Webpack, etc.).

- **Mechanism:** The engine converts your resume text to lowercase and performs exact subset matching against the dictionary.
- **Scoring:** The raw percentage of matched keywords determines this sub-score.
- **Feedback Generation:** The engine identifies exactly which keywords you have and which ones you are missing, suggesting the top missing keywords to add.

### 2. Experience Quality (20% of Total Score)
This checks the actual content and phrasing of your bullet points.

- **Action Verbs (Reward):** The engine searches for strong starting verbs (e.g., *Developed, Built, Architected, Optimized, Spearheaded*).
- **Quantifiable Results (Reward):** Using regex patterns, the engine looks for numbers, percentages, dollar signs, and time metrics (e.g., *%, users, times, $10k, 40 hours*).
- **Vague Language (Penalty):** Points are heavily deducted for passive or weak phrases (e.g., *Worked on, Responsible for, Assisted with, Part of a team*).
- **Auto-Rewrites:** If the engine finds weak bullets, it uses predefined templates (`Action Verb + Task + Technology + Result`) to suggest professional rewrites based on the technologies it detected in your bullet.

### 3. Projects Quality (20% of Total Score)
Recruiters look for verifiable, hands-on experience, especially for junior to mid-level roles.

- **Mechanism:** Checks for the presence of a "Projects" or "Portfolio" section.
- **Technical Specificity:** Scans for hard skills (React, MongoDB, AWS, Docker) explicitly mentioned within the proximity of project descriptions.
- **Links & Metrics:** Rewards the presence of GitHub links, live demo URLs, or business impact metrics within the project text.

### 4. Formatting (20% of Total Score)
Even the best content will fail if the ATS parser cannot read the physical layout.

- **Section Headers:** Ensures standard headers are present (*Experience, Education, Skills, Projects*). Unconventional headers confuse older ATS systems.
- **Bullet Count:** Verifies that lists are actually using bullet characters (`•`, `-`, `*`) rather than huge blocks of paragraph text.
- **Length Constraint:** Counts the total words to ensure the resume is not too sparse (<150 words) or too dense (>1800 words), targeting a sweet spot of ~300-1200 words for standard 1-2 page resumes.
- **Contact Info:** Validates the presence of an email address and professional profiles (LinkedIn/GitHub).

---

## Edge Cases and Extras

- **Education Validation:** While not strictly part of the main 40/20/20/20 ATS weight, it checks for degree types (B.Tech, BSc, Master) and graduation years, feeding into the qualitative summary.
- **Custom Roles:** If a user inputs a custom role, it evaluates them against a generalized *Software Engineer* vocabulary, but focuses heavily on the structural and experiential quality of the resume.

With this localized architecture, you get enterprise-level ATS structural checking without sacrificing data privacy.
