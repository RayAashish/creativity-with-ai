// SEE Science Practical Laboratory - Master Application Controller
import { renderGravitySim } from './simulations/physics/gravitySim.js';
import { renderPressureSim } from './simulations/physics/pressureSim.js';
import { renderHeatSim } from './simulations/physics/heatSim.js';
import { renderOpticsSim } from './simulations/physics/opticsSim.js';
import { renderTransformerSim } from './simulations/physics/transformerSim.js';
import { renderPeriodicTableSim } from './simulations/chemistry/periodicTableSim.js';
import { renderGasPrepSim } from './simulations/chemistry/gasPrepSim.js';
import { renderGeneticsSim } from './simulations/biology/geneticsSim.js';
import { renderHeartSim } from './simulations/biology/heartSim.js';
import { renderStarsSim } from './simulations/astronomy/starsSim.js';
import { renderNumericalSolver } from './simulations/tools/numericalSolver.js';
import { renderFlashcards } from './simulations/tools/flashcardsView.js';
import { renderFormulaHandbook } from './simulations/tools/formulaHandbook.js';
import { renderAcademicArchives } from './simulations/curriculum/academicArchivesView.js';
import { renderQuiz } from './simulations/exam/quiz.js';

let currentLang = 'en'; // 'en' or 'np'
let currentTheme = 'light'; // 'light' or 'dark'

function initApp() {
  mountAllSimulations();
  setupNavigation();
  setupLanguageToggle();
  setupThemeToggle();
  setupSearch();
}

function mountAllSimulations() {
  const mounts = [
    { id: 'gravity-lab-mount', fn: renderGravitySim },
    { id: 'pressure-lab-mount', fn: renderPressureSim },
    { id: 'heat-lab-mount', fn: renderHeatSim },
    { id: 'optics-lab-mount', fn: renderOpticsSim },
    { id: 'transformer-lab-mount', fn: renderTransformerSim },
    { id: 'periodic-lab-mount', fn: renderPeriodicTableSim },
    { id: 'gasprep-lab-mount', fn: renderGasPrepSim },
    { id: 'genetics-lab-mount', fn: renderGeneticsSim },
    { id: 'heart-lab-mount', fn: renderHeartSim },
    { id: 'stars-lab-mount', fn: renderStarsSim },
    { id: 'solver-lab-mount', fn: renderNumericalSolver },
    { id: 'flashcards-lab-mount', fn: renderFlashcards },
    { id: 'handbook-lab-mount', fn: renderFormulaHandbook },
    { id: 'archives-lab-mount', fn: renderAcademicArchives },
    { id: 'quiz-lab-mount', fn: renderQuiz }
  ];

  mounts.forEach(({ id, fn }) => {
    const el = document.getElementById(id);
    if (el) fn(el, currentLang);
  });
}

function setupNavigation() {
  const pills = document.querySelectorAll('.cat-pill');
  const modules = document.querySelectorAll('.module-card');

  pills.forEach(pill => {
    pill.addEventListener('click', () => {
      pills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');

      const filter = pill.dataset.filter;
      modules.forEach(mod => {
        if (filter === 'all' || mod.dataset.category === filter) {
          mod.style.display = 'block';
        } else {
          mod.style.display = 'none';
        }
      });
    });
  });
}

function setupLanguageToggle() {
  const btn = document.getElementById('btn-lang-toggle');
  const heroTitle = document.getElementById('hero-title');
  const heroSub = document.getElementById('hero-subtitle');

  if (!btn) return;

  btn.addEventListener('click', () => {
    currentLang = currentLang === 'en' ? 'np' : 'en';
    btn.textContent = currentLang === 'en' ? '🇳🇵 नेपाली' : '🇬🇧 English';

    if (currentLang === 'np') {
      heroTitle.textContent = 'विज्ञान घोक्ने होइन, गरेर बुझ्ने विषय हो।';
      heroSub.textContent = 'नेपालको नयाँ पाठ्यक्रम (CDC) अनुसार कक्षा १० का सम्पूर्ण सिद्धान्तहरूलाई प्रत्यक्ष प्रयोगात्मक प्रयोगशालामा बुझ्नुहोस्।';
    } else {
      heroTitle.textContent = 'Science is Understood by Doing, Not by Memorizing.';
      heroSub.textContent = 'A comprehensive interactive practical laboratory for Nepal\'s Grade 10 Science (SEE). Built to give students intuitive, visual, and mathematical clarity for every concept.';
    }

    // Re-mount modules with the new language
    mountAllSimulations();
  });
}

function setupThemeToggle() {
  const btn = document.getElementById('btn-theme-toggle');
  if (!btn) return;

  btn.addEventListener('click', () => {
    currentTheme = currentTheme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', currentTheme);
    btn.textContent = currentTheme === 'light' ? '🌓 Theme' : '☀️ Light';
  });
}

function setupSearch() {
  const input = document.getElementById('search-input');
  const modules = document.querySelectorAll('.module-card');

  if (!input) return;

  input.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase().trim();
    if (!query) {
      modules.forEach(m => m.style.display = 'block');
      return;
    }

    modules.forEach(mod => {
      const text = mod.textContent.toLowerCase();
      if (text.includes(query)) {
        mod.style.display = 'block';
      } else {
        mod.style.display = 'none';
      }
    });
  });
}

// Start application on DOM ready
document.addEventListener('DOMContentLoaded', initApp);
