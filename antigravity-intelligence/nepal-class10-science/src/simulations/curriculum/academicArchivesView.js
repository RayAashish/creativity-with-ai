// Academic Archives & 100k+ Data Explorer View
import { SEE_PAST_PAPERS_ARCHIVE } from '../../data/seePastQuestionsArchive.js';
import { GLOSSARY_DICTIONARY } from '../../data/glossaryDictionary.js';
import { CHEMICAL_REACTIONS_DB } from '../../data/chemicalReactionsDatabase.js';
import { MASSIVE_NUMERICALS_BANK } from '../../data/massiveNumericalsBank.js';
import { COMPREHENSIVE_UNIT_NOTES } from '../../data/comprehensiveUnitNotes.js';
import { MISCONCEPTIONS_EXAM_TRAPS } from '../../data/misconceptionsExamTraps.js';
import { DIY_HOME_EXPERIMENTS } from '../../data/diyHomeExperiments.js';
import { PRACTICAL_RECORD_BOOK } from '../../data/practicalRecordBook.js';
import { ALL_118_ELEMENTS } from '../../data/elements118.js';

export function renderAcademicArchives(container, lang = 'en') {
  container.innerHTML = `
    <div class="sim-card">
      <div class="sim-header">
        <div class="sim-badge">COMPREHENSIVE REPOSITORY // १०३,०००+ हरफ वैज्ञानिक सामग्री</div>
        <h2 class="sim-title">${lang === 'np' ? 'SEE विज्ञान महा-अभिलेख तथा अध्ययन सामग्री (१०३,०००+ हरफ)' : 'CDC SEE Science Master Academic Repository (103,631+ Lines)'}</h2>
        <p class="sim-desc">
          ${lang === 'np'
            ? '३५ वटा विगत बोर्ड परीक्षा सेटहरू, १५००+ वैज्ञानिक शब्दावली, ६००+ रासायनिक समीकरण, ३५०+ हिसाबहरू र २४ वटा विस्तृत पाठ्यपुस्तक नोटहरू।'
            : 'Explore the complete 103,631-line academic repository: 35 SEE Board Question Papers, 1,500+ Glossary Terms, 600+ Chemical Equations, 350+ Numericals, 50 Lab Experiments, and 24 Unit Study Guides.'}
        </p>
      </div>

      <!-- REPOSITORY TABS -->
      <div class="lab-subtabs">
        <button class="subtab-btn active" data-repo="papers">📜 ${lang === 'np' ? '३५ वटा SEE परीक्षा सेट' : '35 SEE Question Sets'}</button>
        <button class="subtab-btn" data-repo="glossary">📖 ${lang === 'np' ? '१५००+ शब्दावली' : '1,500+ Glossary'}</button>
        <button class="subtab-btn" data-repo="reactions">⚗️ ${lang === 'np' ? '६००+ समीकरण' : '600+ Reactions'}</button>
        <button class="subtab-btn" data-repo="notes">📘 ${lang === 'np' ? '२४ पाठ विस्तृत नोट' : '24 Unit Notes'}</button>
        <button class="subtab-btn" data-repo="labmanual">🧪 ${lang === 'np' ? '५० प्रयोगात्मक स्टेशन' : '50 Lab Stations'}</button>
        <button class="subtab-btn" data-repo="traps">⚠️ ${lang === 'np' ? '१५० परीक्षा भ्रम र समाधान' : '150 Exam Traps'}</button>
      </div>

      <!-- 1. SEE PAPERS BROWSER -->
      <div id="repo-sub-papers" class="subtab-content active">
        <div class="control-row">
          <label class="control-label">${lang === 'np' ? 'SEE परीक्षा सेट छान्नुहोस्:' : 'Select Examination Set:'}</label>
          <select id="repo-paper-select" class="minimal-select">
            ${SEE_PAST_PAPERS_ARCHIVE.map(s => `
              <option value="${s.setId}">[${s.yearBS} BS] ${lang === 'np' ? s.titleNp : s.titleEn} (75 Marks)</option>
            `).join('')}
          </select>
        </div>

        <div id="repo-paper-display" class="paper-display-box" style="margin-top: 1rem;">
          <!-- Dynamically populated -->
        </div>
      </div>

      <!-- 2. GLOSSARY BROWSER -->
      <div id="repo-sub-glossary" class="subtab-content">
        <div class="search-handbook-bar">
          <input type="text" id="repo-glossary-search" placeholder="${lang === 'np' ? '१५००+ वैज्ञानिक शब्दहरू खोज्नुहोस्...' : 'Search 1,500+ scientific terms, units, or definitions...'}" class="minimal-search-input" />
        </div>
        <div id="repo-glossary-grid" class="cards-grid-2">
          <!-- Dynamically populated -->
        </div>
      </div>

      <!-- 3. REACTIONS BROWSER -->
      <div id="repo-sub-reactions" class="subtab-content">
        <div class="search-handbook-bar">
          <input type="text" id="repo-reactions-search" placeholder="${lang === 'np' ? '६००+ रासायनिक समीकरण खोज्नुहोस् (उदा: CaCO3, NH3, Displacement)...' : 'Search 600+ balanced chemical reactions...'}" class="minimal-search-input" />
        </div>
        <div id="repo-reactions-grid" class="cards-grid-2">
          <!-- Dynamically populated -->
        </div>
      </div>

      <!-- 4. CHAPTER NOTES BROWSER -->
      <div id="repo-sub-notes" class="subtab-content">
        <div class="control-row">
          <label class="control-label">${lang === 'np' ? 'अध्याय छान्नुहोस्:' : 'Select Chapter Guide:'}</label>
          <select id="repo-notes-select" class="minimal-select">
            ${COMPREHENSIVE_UNIT_NOTES.map(n => `
              <option value="${n.chapterId}">Unit ${n.chapterNumber}: ${lang === 'np' ? n.titleNp : n.titleEn}</option>
            `).join('')}
          </select>
        </div>
        <div id="repo-notes-display" style="margin-top: 1rem;">
          <!-- Dynamically populated -->
        </div>
      </div>

      <!-- 5. LAB STATIONS -->
      <div id="repo-sub-labmanual" class="subtab-content">
        <div id="repo-labmanual-grid" class="cards-grid-2">
          ${PRACTICAL_RECORD_BOOK.slice(0, 12).map(exp => `
            <div class="handbook-card">
              <div class="handbook-meta">
                <span class="value-pill">${exp.subject.toUpperCase()}</span>
                <span class="text-muted" style="font-size: 0.8rem;">Station: 5 Marks</span>
              </div>
              <h3 class="handbook-title">${lang === 'np' ? exp.titleNp : exp.titleEn}</h3>
              <p class="text-muted" style="font-size: 0.85rem;"><strong>Objective:</strong> ${lang === 'np' ? exp.objectiveNp : exp.objectiveEn}</p>
              <div class="formula-box" style="margin-top: 0.5rem;">
                <div class="formula-math" style="font-size: 0.85rem;">${exp.apparatus}</div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- 6. EXAM TRAPS -->
      <div id="repo-sub-traps" class="subtab-content">
        <div class="cards-grid-2">
          ${MISCONCEPTIONS_EXAM_TRAPS.slice(0, 10).map(trap => `
            <div class="handbook-card" style="border-left: 4px solid #ef4444;">
              <h3 class="handbook-title">${trap.topicTitle}</h3>
              <p style="color: #ef4444; font-size: 0.85rem; margin-bottom: 0.4rem;"><strong>❌ Common Pitfall:</strong> ${trap.commonMythEn}</p>
              <p style="color: #10b981; font-size: 0.85rem;"><strong>✔ Scientific Truth:</strong> ${trap.scientificTruthEn}</p>
              <div class="formula-note" style="margin-top: 0.5rem; background: var(--bg-subtle); padding: 0.4rem;">
                <strong>Examiner Warning:</strong> ${trap.examinerWarning}
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;

  // Subtabs
  const tabs = container.querySelectorAll('.subtab-btn');
  tabs.forEach(t => {
    t.addEventListener('click', () => {
      tabs.forEach(tab => tab.classList.remove('active'));
      container.querySelectorAll('.subtab-content').forEach(c => c.classList.remove('active'));
      t.classList.add('active');
      const target = container.querySelector(`#repo-sub-${t.dataset.repo}`);
      if (target) target.classList.add('active');
    });
  });

  // Paper Selector
  const paperSelect = container.querySelector('#repo-paper-select');
  const paperDisplay = container.querySelector('#repo-paper-display');

  const updatePaper = (setId) => {
    const s = SEE_PAST_PAPERS_ARCHIVE.find(item => item.setId === setId) || SEE_PAST_PAPERS_ARCHIVE[0];
    paperDisplay.innerHTML = `
      <div class="telemetry-bar" style="margin-bottom: 1rem;">
        <span class="telemetry-label">Selected Paper:</span>
        <span class="telemetry-value">${lang === 'np' ? s.titleNp : s.titleEn} (${s.yearBS} BS)</span>
        <span class="value-pill">Full Marks: ${s.totalMarks} | Time: ${s.timeHours} Hours</span>
      </div>

      <div class="questions-flow">
        ${s.questions.slice(0, 10).map(q => `
          <div class="quiz-card">
            <div class="quiz-q-num">Group ${q.group} • Question ${q.qNum} (${q.marks} Mark${q.marks > 1 ? 's' : ''})</div>
            <h4 class="quiz-q-text-en">${q.questionEn}</h4>
            <h5 class="quiz-q-text-np text-muted">${q.questionNp}</h5>
            <div class="formula-box" style="text-align: left; margin-top: 0.5rem;">
              <strong style="color: #10b981;">Model Answer / अङ्कन योजना:</strong>
              <div style="font-size: 0.9rem; margin-top: 0.25rem;">${q.modelAnswerEn}</div>
              <div style="font-size: 0.8rem; color: #71717a; margin-top: 0.25rem;"><strong>Rubric:</strong> ${q.markingScheme}</div>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  };

  paperSelect.addEventListener('change', (e) => updatePaper(e.target.value));
  updatePaper(paperSelect.value);

  // Glossary Search
  const glossInput = container.querySelector('#repo-glossary-search');
  const glossGrid = container.querySelector('#repo-glossary-grid');

  const updateGlossary = (q = '') => {
    const term = q.toLowerCase().trim();
    const matches = GLOSSARY_DICTIONARY.filter(t => !term || t.termEn.toLowerCase().includes(term) || t.termNp.toLowerCase().includes(term)).slice(0, 16);

    glossGrid.innerHTML = matches.map(t => `
      <div class="handbook-card">
        <div class="handbook-meta">
          <span class="value-pill">${t.domain.toUpperCase()}</span>
          <span class="text-muted" style="font-size: 0.8rem;">${t.siUnit}</span>
        </div>
        <h3 class="handbook-title">${t.termEn} <span style="font-size: 0.85rem; font-weight: normal; color: #71717a;">(${t.termNp})</span></h3>
        <p style="font-size: 0.85rem; color: var(--text-muted);">${lang === 'np' ? t.defNp : t.defEn}</p>
      </div>
    `).join('');
  };

  glossInput.addEventListener('input', (e) => updateGlossary(e.target.value));
  updateGlossary();

  // Reactions Search
  const rxnInput = container.querySelector('#repo-reactions-search');
  const rxnGrid = container.querySelector('#repo-reactions-grid');

  const updateReactions = (q = '') => {
    const term = q.toLowerCase().trim();
    const matches = CHEMICAL_REACTIONS_DB.filter(r => !term || r.equation.toLowerCase().includes(term) || r.title.toLowerCase().includes(term)).slice(0, 16);

    rxnGrid.innerHTML = matches.map(r => `
      <div class="handbook-card">
        <div class="handbook-meta">
          <span class="value-pill">${r.type.toUpperCase()}</span>
          <span class="text-muted" style="font-size: 0.8rem;">${r.isExothermic ? '🔥 Exothermic' : '❄️ Endothermic'}</span>
        </div>
        <h3 class="handbook-title" style="font-size: 0.95rem;">${r.title}</h3>
        <div class="formula-box">
          <div class="formula-math" style="font-size: 0.95rem;">${r.equation}</div>
        </div>
        <p style="font-size: 0.8rem; color: var(--text-muted);">${lang === 'np' ? r.observationsNp : r.observationsEn}</p>
      </div>
    `).join('');
  };

  rxnInput.addEventListener('input', (e) => updateReactions(e.target.value));
  updateReactions();

  // Notes Selector
  const notesSelect = container.querySelector('#repo-notes-select');
  const notesDisplay = container.querySelector('#repo-notes-display');

  const updateNotes = (chId) => {
    const n = COMPREHENSIVE_UNIT_NOTES.find(item => item.chapterId === chId) || COMPREHENSIVE_UNIT_NOTES[0];
    notesDisplay.innerHTML = `
      <div class="handbook-card" style="margin-bottom: 1rem;">
        <div class="handbook-meta">
          <span class="value-pill">UNIT ${n.chapterNumber}</span>
          <span class="text-muted">${n.keywords}</span>
        </div>
        <h3 class="handbook-title" style="font-size: 1.3rem;">${lang === 'np' ? n.titleNp : n.titleEn}</h3>
      </div>

      <div class="subsections-list">
        ${n.subsections.slice(0, 4).map(sub => `
          <div class="quiz-card" style="margin-bottom: 1rem;">
            <h4 style="font-size: 1.05rem; font-weight: 700; margin-bottom: 0.5rem;">${lang === 'np' ? sub.titleNp : sub.titleEn}</h4>
            <p style="font-size: 0.9rem; line-height: 1.6; color: var(--text-main); margin-bottom: 0.75rem;">${lang === 'np' ? sub.theoryNp : sub.theoryEn}</p>
            <div class="formula-box" style="text-align: left;">
              <strong style="color: #0284c7;">Mathematical Derivation / गणितीय सूत्र:</strong>
              <div style="font-size: 0.85rem; font-family: var(--font-mono); margin-top: 0.35rem; white-space: pre-line;">${sub.mathematicalDerivation}</div>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  };

  notesSelect.addEventListener('change', (e) => updateNotes(e.target.value));
  updateNotes(notesSelect.value);
}
