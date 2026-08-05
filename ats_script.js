/* ============================================================
   ats_script.js — Intelligent Client-Side ATS Score Calculator
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

    // 1. Initialize Lucide Icons if available
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    // PDF.js worker setup from CDN
    if (typeof pdfjsLib !== 'undefined') {
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    }

    // Role Taxonomic Keywords Dictionary
    const ROLE_TAXONOMY = {
        'embedded_cybersecurity': {
            title: 'Embedded Cybersecurity / Automotive ECU',
            keywords: [
                'C', 'Embedded C', 'AUTOSAR', 'UDS', 'CAN', 'CANopen', 'ISO 26262', 'MISRA C', 
                'Microcontroller', 'RTOS', 'PKI', 'X.509', 'Cryptography', 'SecOC', 'HSM', 
                'Firmware', 'Cybersecurity', 'SPI', 'I2C', 'UART', 'Bootloader', 'Diagnostic', 
                'Vector', 'EB Tresos', 'Git', 'JIRA', 'SAE J3061', 'ISO 21434', 'Hardware Security Module'
            ]
        },
        'embedded_software': {
            title: 'Embedded Software Engineer',
            keywords: [
                'C', 'C++', 'RTOS', 'FreeRTOS', 'Embedded Linux', 'Microcontroller', 'STM32', 'ARM', 
                'SPI', 'I2C', 'UART', 'Device Drivers', 'Firmware', 'Debugging', 'GDB', 'Git', 
                'DSP', 'Assembly', 'PCB', 'GPIO', 'DMA', 'Oscilloscope', 'Logic Analyzer', 'Embedded C'
            ]
        },
        'cybersecurity_engineer': {
            title: 'Cybersecurity Engineer / Analyst',
            keywords: [
                'Cybersecurity', 'Penetration Testing', 'Vulnerability Assessment', 'Network Security', 
                'SIEM', 'Firewall', 'Ethical Hacking', 'Python', 'Cryptography', 'SOC', 'Incident Response', 
                'ISO 27001', 'NIST', 'Threat Modeling', 'Linux', 'Wireshark', 'Burp Suite', 'Identity Access'
            ]
        },
        'software_engineer': {
            title: 'Software Engineer / Fullstack',
            keywords: [
                'JavaScript', 'TypeScript', 'Python', 'Java', 'React', 'Node.js', 'SQL', 'REST API', 
                'Git', 'Docker', 'CI/CD', 'AWS', 'Microservices', 'Data Structures', 'Algorithms', 
                'System Design', 'Unit Testing', 'HTML', 'CSS', 'PostgreSQL', 'MongoDB'
            ]
        },
        'data_scientist': {
            title: 'Data Scientist / AI Engineer',
            keywords: [
                'Python', 'R', 'Machine Learning', 'Deep Learning', 'TensorFlow', 'PyTorch', 
                'Pandas', 'NumPy', 'SQL', 'Scikit-learn', 'Data Analysis', 'NLP', 'Computer Vision', 
                'Statistics', 'Data Visualization', 'Big Data', 'Jupyter', 'Feature Engineering'
            ]
        }
    };

    // Strong Action Verbs Repository
    const ACTION_VERBS = [
        'engineered', 'developed', 'designed', 'architected', 'implemented', 'spearheaded', 
        'optimized', 'reduced', 'increased', 'streamlined', 'built', 'integrated', 'led', 
        'executed', 'maximized', 'created', 'established', 'formulated', 'overhauled', 'piloted', 
        'quantified', 'resolved', 'transformed', 'yielded', 'audited', 'commissioned', 'configured', 
        'deployed', 'enhanced', 'automated', 'delivered', 'managed', 'authored', 'validated', 
        'launched', 'secured', 'migrated', 'refactored', 'pioneered', 'standardized'
    ];

    // Standard Resume Sections
    const STANDARD_SECTIONS = [
        { key: 'experience', label: 'Work Experience', regex: /(work\s+experience|experience|employment|professional\s+background|career\s+history)/i },
        { key: 'education', label: 'Education', regex: /(education|academic|qualification|degrees|university)/i },
        { key: 'skills', label: 'Skills & Technologies', regex: /(skills|technical\s+skills|expertise|competencies|technologies)/i },
        { key: 'projects', label: 'Projects', regex: /(projects|key\s+projects|portfolio|implementations)/i },
        { key: 'summary', label: 'Professional Summary', regex: /(summary|profile|about\s+me|objective|overview)/i },
        { key: 'certifications', label: 'Certifications', regex: /(certifications|licenses|courses|credentials)/i }
    ];

    // UI Element Binding
    const roleSelect = document.getElementById('ats-role-select');
    const customJdContainer = document.getElementById('custom-jd-container');
    const customJdInput = document.getElementById('custom-jd-input');
    const resumeTextInput = document.getElementById('ats-resume-text');
    const fileInput = document.getElementById('ats-file-input');
    const dropzone = document.getElementById('ats-dropzone');
    const fileNameDisplay = document.getElementById('ats-file-name');
    const analyzeBtn = document.getElementById('ats-analyze-btn');
    const scanContainer = document.getElementById('ats-scanning-state');
    const scanStatusText = document.getElementById('ats-scan-status');
    const scanProgressBar = document.getElementById('ats-scan-progress-bar');
    const resultsContainer = document.getElementById('ats-results-container');
    const tabBtnText = document.getElementById('tab-btn-text');
    const tabBtnFile = document.getElementById('tab-btn-file');
    const inputAreaText = document.getElementById('input-area-text');
    const inputAreaFile = document.getElementById('input-area-file');

    let extractedResumeText = '';
    let currentInputMode = 'text'; // 'text' or 'file'

    // Tab Switching Logic (Text vs File Upload)
    if (tabBtnText && tabBtnFile) {
        tabBtnText.addEventListener('click', () => {
            currentInputMode = 'text';
            tabBtnText.classList.add('active');
            tabBtnFile.classList.remove('active');
            if (inputAreaText) inputAreaText.style.display = 'block';
            if (inputAreaFile) inputAreaFile.style.display = 'none';
        });

        tabBtnFile.addEventListener('click', () => {
            currentInputMode = 'file';
            tabBtnFile.classList.add('active');
            tabBtnText.classList.remove('active');
            if (inputAreaFile) inputAreaFile.style.display = 'block';
            if (inputAreaText) inputAreaText.style.display = 'none';
        });
    }

    // Toggle Custom Job Description
    if (roleSelect && customJdContainer) {
        roleSelect.addEventListener('change', (e) => {
            if (e.target.value === 'custom') {
                customJdContainer.style.display = 'block';
            } else {
                customJdContainer.style.display = 'none';
            }
        });
    }

    // Drag and Drop Handling
    if (dropzone && fileInput) {
        dropzone.addEventListener('click', () => fileInput.click());

        dropzone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropzone.classList.add('drag-over');
        });

        dropzone.addEventListener('dragleave', () => {
            dropzone.classList.remove('drag-over');
        });

        dropzone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropzone.classList.remove('drag-over');
            if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                fileInput.files = e.dataTransfer.files;
                handleFileSelection(e.dataTransfer.files[0]);
            }
        });

        fileInput.addEventListener('change', (e) => {
            if (e.target.files && e.target.files.length > 0) {
                handleFileSelection(e.target.files[0]);
            }
        });
    }

    // Handle File Selection and Parsing
    async function handleFileSelection(file) {
        if (!file) return;

        if (fileNameDisplay) {
            fileNameDisplay.textContent = `Selected: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`;
            fileNameDisplay.style.display = 'block';
        }

        try {
            if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
                extractedResumeText = await parsePdfFile(file);
            } else {
                // Plain text / Markdown / HTML file
                extractedResumeText = await file.text();
            }
        } catch (err) {
            console.error('File parsing error:', err);
            alert('Could not parse file. Please try copying and pasting the text directly into the text tab.');
        }
    }

    // PDF.js Text Parser
    async function parsePdfFile(file) {
        if (typeof pdfjsLib === 'undefined') {
            throw new Error('PDF.js library is not loaded');
        }

        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        let fullText = '';

        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items.map(item => item.str).join(' ');
            fullText += pageText + '\n';
        }

        return fullText;
    }

    // Handle "Calculate ATS Score" Action
    if (analyzeBtn) {
        analyzeBtn.addEventListener('click', async () => {
            let textToAnalyze = '';

            if (currentInputMode === 'text') {
                textToAnalyze = resumeTextInput ? resumeTextInput.value.trim() : '';
            } else {
                textToAnalyze = extractedResumeText.trim();
            }

            if (!textToAnalyze) {
                alert('Please paste your resume text or upload a resume file (PDF/TXT) to calculate your ATS score.');
                return;
            }

            if (textToAnalyze.length < 50) {
                alert('The provided text is too short to analyze. Please provide a full resume.');
                return;
            }

            // Start Scanning Animation
            await runScanningAnimation();

            // Run Analysis Engine
            const analysis = calculateAtsScore(textToAnalyze);

            // Render Results
            renderResults(analysis);
        });
    }

    // Scanning Animation Steps
    function runScanningAnimation() {
        return new Promise((resolve) => {
            if (!scanContainer || !resultsContainer) {
                resolve();
                return;
            }

            resultsContainer.style.display = 'none';
            scanContainer.style.display = 'block';
            scanContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

            const steps = [
                { progress: 20, text: 'Extracting text and identifying document structure...' },
                { progress: 45, text: 'Scanning technical skills & keyword match...' },
                { progress: 70, text: 'Evaluating action verbs & quantifiable metrics...' },
                { progress: 90, text: 'Checking ATS formatting, section completeness & readability...' },
                { progress: 100, text: 'Finalizing ATS score calculation...' }
            ];

            let stepIndex = 0;
            const interval = setInterval(() => {
                if (stepIndex < steps.length) {
                    if (scanProgressBar) scanProgressBar.style.width = steps[stepIndex].progress + '%';
                    if (scanStatusText) scanStatusText.textContent = steps[stepIndex].text;
                    stepIndex++;
                } else {
                    clearInterval(interval);
                    setTimeout(() => {
                        scanContainer.style.display = 'none';
                        resolve();
                    }, 400);
                }
            }, 300);
        });
    }

    // Core ATS Analysis Engine
    function calculateAtsScore(resumeText) {
        const lowerText = resumeText.toLowerCase();
        const selectedRoleKey = roleSelect ? roleSelect.value : 'embedded_cybersecurity';

        // 1. Keyword Matching
        let targetKeywords = [];
        if (selectedRoleKey === 'custom' && customJdInput && customJdInput.value.trim()) {
            const words = customJdInput.value.match(/\b[A-Za-z0-9+#.#-]{2,}\b/g) || [];
            // Remove common stop words
            const stopWords = new Set(['the', 'and', 'for', 'with', 'you', 'that', 'this', 'have', 'from', 'your', 'will', 'are', 'work', 'experience', 'team', 'company', 'looking', 'role']);
            const freq = {};
            words.forEach(w => {
                const lw = w.toLowerCase();
                if (!stopWords.has(lw) && lw.length > 2) {
                    freq[w] = (freq[w] || 0) + 1;
                }
            });
            targetKeywords = Object.keys(freq).sort((a, b) => freq[b] - freq[a]).slice(0, 25);
        } else {
            const roleData = ROLE_TAXONOMY[selectedRoleKey] || ROLE_TAXONOMY['embedded_cybersecurity'];
            targetKeywords = roleData.keywords;
        }

        const foundKeywords = [];
        const missingKeywords = [];

        targetKeywords.forEach(kw => {
            const kwRegex = new RegExp('\\b' + escapeRegExp(kw) + '\\b', 'i');
            if (kwRegex.test(resumeText)) {
                foundKeywords.push(kw);
            } else {
                missingKeywords.push(kw);
            }
        });

        const keywordMatchPercent = targetKeywords.length > 0 
            ? Math.round((foundKeywords.length / targetKeywords.length) * 100) 
            : 70;

        // 2. Section Completeness Check
        const detectedSections = [];
        const missingSections = [];
        STANDARD_SECTIONS.forEach(sec => {
            if (sec.regex.test(resumeText)) {
                detectedSections.push(sec.label);
            } else {
                missingSections.push(sec.label);
            }
        });
        const sectionScorePercent = Math.round((detectedSections.length / STANDARD_SECTIONS.length) * 100);

        // 3. Action Verbs Detection
        const foundActionVerbs = new Set();
        ACTION_VERBS.forEach(verb => {
            const verbRegex = new RegExp('\\b' + verb + '\\b', 'i');
            if (verbRegex.test(resumeText)) {
                foundActionVerbs.add(verb);
            }
        });
        // Score: >= 8 action verbs = 100%, 5-7 = 80%, 3-4 = 60%, <3 = 40%
        let actionVerbScorePercent = 40;
        if (foundActionVerbs.size >= 8) actionVerbScorePercent = 100;
        else if (foundActionVerbs.size >= 5) actionVerbScorePercent = 85;
        else if (foundActionVerbs.size >= 3) actionVerbScorePercent = 65;

        // 4. Impact & Quantifiable Metrics Check
        // Match numbers, percentages, dollar figures, metrics like "reduced by 30%", "20+ microservices", etc.
        const metricMatches = resumeText.match(/(\b\d+(\.\d+)?%|\$\d+[\text{kMB}]?|\b\d+\+\s*\w+|\breduced\b|\bincreased\b|\bsaved\b|\bimproved\b)/gi) || [];
        let metricScorePercent = 40;
        if (metricMatches.length >= 6) metricScorePercent = 100;
        else if (metricMatches.length >= 3) metricScorePercent = 80;
        else if (metricMatches.length >= 1) metricScorePercent = 60;

        // 5. Readability & Formatting / Length Check
        const wordCount = resumeText.split(/\s+/).filter(Boolean).length;
        let wordCountScore = 100;
        if (wordCount < 150) wordCountScore = 40;
        else if (wordCount < 300) wordCountScore = 70;
        else if (wordCount > 1200) wordCountScore = 80;

        // Contact Info Checks
        const hasEmail = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(resumeText);
        const hasPhone = /(\+\d{1,3}[\s-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/.test(resumeText);
        const hasLinkedIn = /linkedin\.com\/in\/[a-zA-Z0-9_-]+/i.test(resumeText);

        let contactScore = (hasEmail ? 40 : 0) + (hasPhone ? 30 : 0) + (hasLinkedIn ? 30 : 0);
        const readabilityScorePercent = Math.round((wordCountScore * 0.5) + (contactScore * 0.5));

        // Final Overall ATS Score Calculation
        // Weights: Keywords 35%, Sections 20%, Action Verbs 20%, Impact/Metrics 15%, Readability 10%
        const overallScore = Math.min(99, Math.max(15, Math.round(
            (keywordMatchPercent * 0.35) +
            (sectionScorePercent * 0.20) +
            (actionVerbScorePercent * 0.20) +
            (metricScorePercent * 0.15) +
            (readabilityScorePercent * 0.10)
        )));

        // Generate Recommendations
        const recommendations = [];

        if (missingKeywords.length > 0) {
            recommendations.push({
                type: 'warning',
                title: 'Include Missing High-Impact Keywords',
                desc: `Your resume is missing key technical terms for this role: <strong>${missingKeywords.slice(0, 5).join(', ')}</strong>. Incorporate these into your work experience bullet points.`
            });
        }

        if (missingSections.length > 0) {
            recommendations.push({
                type: 'important',
                title: 'Add Missing Core Resume Sections',
                desc: `ATS parsers look for standard headings. You seem to be missing: <strong>${missingSections.join(', ')}</strong>.`
            });
        }

        if (metricMatches.length < 3) {
            recommendations.push({
                type: 'tip',
                title: 'Quantify Accomplishments with Metrics & Data',
                desc: 'Add measurable results (e.g., "Optimized latency by 35%", "Reduced bugs by 20%", "Managed 10+ ECUs"). Numbers grab recruiter attention and boost ATS metrics.'
            });
        }

        if (foundActionVerbs.size < 5) {
            recommendations.push({
                type: 'tip',
                title: 'Use Stronger Action Verbs',
                desc: 'Start bullet points with strong verbs such as <em>Engineered, Spearheaded, Architected, Optimized, Standardized</em> instead of passive phrases like "Responsible for".'
            });
        }

        if (!hasLinkedIn) {
            recommendations.push({
                type: 'note',
                title: 'Add LinkedIn Profile URL',
                desc: 'Including a customized LinkedIn link (e.g. linkedin.com/in/yourname) improves applicant credibility.'
            });
        }

        if (recommendations.length === 0) {
            recommendations.push({
                type: 'success',
                title: 'Outstanding ATS Format!',
                desc: 'Your resume follows top-tier ATS standards with clear sections, rich technical keywords, and strong quantifiable achievements.'
            });
        }

        return {
            overallScore,
            keywordMatchPercent,
            sectionScorePercent,
            actionVerbScorePercent,
            metricScorePercent,
            readabilityScorePercent,
            foundKeywords,
            missingKeywords,
            detectedSections,
            missingSections,
            foundActionVerbsCount: foundActionVerbs.size,
            metricMatchesCount: metricMatches.length,
            wordCount,
            hasEmail,
            hasPhone,
            hasLinkedIn,
            recommendations
        };
    }

    // Render Results in UI
    function renderResults(analysis) {
        if (!resultsContainer) return;

        resultsContainer.style.display = 'block';
        resultsContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });

        // Update Score Radial Gauge & Text
        const scoreValEl = document.getElementById('ats-score-value');
        const scoreBadgeEl = document.getElementById('ats-score-badge');
        const gaugeCircle = document.getElementById('ats-gauge-circle');

        if (scoreValEl) scoreValEl.textContent = analysis.overallScore;

        if (gaugeCircle) {
            const circumference = 2 * Math.PI * 45; // radius = 45 -> 282.74
            const offset = circumference - (analysis.overallScore / 100) * circumference;
            gaugeCircle.style.strokeDasharray = circumference;
            gaugeCircle.style.strokeDashoffset = offset;

            if (analysis.overallScore >= 80) {
                gaugeCircle.style.stroke = '#10b981'; // Green
            } else if (analysis.overallScore >= 60) {
                gaugeCircle.style.stroke = '#f59e0b'; // Amber
            } else {
                gaugeCircle.style.stroke = '#ef4444'; // Red
            }
        }

        if (scoreBadgeEl) {
            if (analysis.overallScore >= 80) {
                scoreBadgeEl.textContent = 'Excellent ATS Match';
                scoreBadgeEl.className = 'ats-badge ats-badge--success';
            } else if (analysis.overallScore >= 60) {
                scoreBadgeEl.textContent = 'Good — Optimization Needed';
                scoreBadgeEl.className = 'ats-badge ats-badge--warning';
            } else {
                scoreBadgeEl.textContent = 'Needs Improvement';
                scoreBadgeEl.className = 'ats-badge ats-badge--danger';
            }
        }

        // Update Category Breakdown Progress Bars
        updateBar('bar-keywords', analysis.keywordMatchPercent);
        updateBar('bar-sections', analysis.sectionScorePercent);
        updateBar('bar-verbs', analysis.actionVerbScorePercent);
        updateBar('bar-metrics', analysis.metricScorePercent);
        updateBar('bar-readability', analysis.readabilityScorePercent);

        // Render Found & Missing Keywords
        const foundContainer = document.getElementById('ats-found-keywords');
        const missingContainer = document.getElementById('ats-missing-keywords');

        if (foundContainer) {
            if (analysis.foundKeywords.length > 0) {
                foundContainer.innerHTML = analysis.foundKeywords.map(kw => 
                    `<span class="ats-tag ats-tag--match"><i data-lucide="check" style="width:14px;height:14px;"></i> ${escapeHtml(kw)}</span>`
                ).join('');
            } else {
                foundContainer.innerHTML = '<p class="text-muted" style="font-size:0.9rem;">No major target keywords detected in resume text.</p>';
            }
        }

        if (missingContainer) {
            if (analysis.missingKeywords.length > 0) {
                missingContainer.innerHTML = analysis.missingKeywords.map(kw => 
                    `<span class="ats-tag ats-tag--missing" title="Click to copy" onclick="navigator.clipboard.writeText('${escapeHtml(kw)}')"><i data-lucide="plus" style="width:14px;height:14px;"></i> ${escapeHtml(kw)}</span>`
                ).join('');
            } else {
                missingContainer.innerHTML = '<p class="text-muted" style="font-size:0.9rem;">Great job! No key technical skills missing.</p>';
            }
        }

        // Render Recommendations List
        const recListEl = document.getElementById('ats-recommendations-list');
        if (recListEl) {
            recListEl.innerHTML = analysis.recommendations.map(rec => `
                <div class="ats-rec-item ats-rec-item--${rec.type}">
                    <div class="ats-rec-icon">
                        <i data-lucide="${getIconForType(rec.type)}" style="width:20px;height:20px;"></i>
                    </div>
                    <div class="ats-rec-body">
                        <div class="ats-rec-title">${rec.title}</div>
                        <div class="ats-rec-desc">${rec.desc}</div>
                    </div>
                </div>
            `).join('');
        }

        // Re-initialize icons in dynamically added elements
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }

    function updateBar(barId, percent) {
        const barEl = document.getElementById(barId);
        const textEl = document.getElementById(barId + '-val');
        if (barEl) barEl.style.width = percent + '%';
        if (textEl) textEl.textContent = percent + '%';
    }

    function getIconForType(type) {
        switch (type) {
            case 'success': return 'check-circle';
            case 'important': return 'alert-triangle';
            case 'warning': return 'alert-circle';
            case 'tip': return 'lightbulb';
            default: return 'info';
        }
    }

    function escapeHtml(str) {
        return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    function escapeRegExp(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

});
