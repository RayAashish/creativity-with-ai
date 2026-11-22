import { SYLLABUS_DATA } from './data/syllabus.js';
import { GravitySimulation } from './simulations/physics/gravitySim.js';
import { PressureSimulation } from './simulations/physics/pressureSim.js';
import { OpticsSimulation } from './simulations/physics/opticsSim.js';
import { TransformerSimulation } from './simulations/physics/transformerSim.js';
import { GasPrepSimulation } from './simulations/chemistry/gasPrepSim.js';
import { PeriodicTableSimulation } from './simulations/chemistry/periodicTable.js';
import { GeneticsSimulation } from './simulations/biology/geneticsSim.js';
import { HeartSimulation } from './simulations/biology/heartSim.js';
import { StarsSimulation } from './simulations/astronomy/starsSim.js';
import { SEEQuiz } from './simulations/exam/quiz.js';

class NepalSciencePlatform {
  constructor() {
    this.currentLang = 'en'; // 'en' | 'ne'
    this.activeFilter = 'all'; // 'all' | 'physics' | 'chemistry' | 'biology' | 'astronomy' | 'quiz' | 'diy'

    this.init();
  }

  init() {
    this.bindGlobalEvents();
    this.renderHero();
    this.mountSimulations();
    this.renderDIYSection();
  }

  bindGlobalEvents() {
    // Language Toggle
    const langBtn = document.getElementById('btn-lang-toggle');
    if (langBtn) {
      langBtn.addEventListener('click', () => {
        this.currentLang = this.currentLang === 'en' ? 'ne' : 'en';
        langBtn.textContent = this.currentLang === 'en' ? '🇳🇵 नेपाली' : '🇬🇧 English';
        this.updateLanguageTexts();
      });
    }

    // Category Filter Pills
    const catPills = document.querySelectorAll('.cat-pill');
    catPills.forEach(pill => {
      pill.addEventListener('click', () => {
        catPills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');

        this.activeFilter = pill.dataset.filter;
        this.filterModules();
      });
    });

    // Search Box
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        this.searchModules(query);
      });
    }
  }

  renderHero() {
    const heroH2 = document.getElementById('hero-title');
    const heroP = document.getElementById('hero-subtitle');

    if (this.currentLang === 'ne') {
      heroH2.textContent = "विज्ञान घोक्ने होइन, गरेर बुझ्ने विषय हो।";
      heroP.textContent = "नेपालको नयाँ पाठ्यक्रम (CDC) अनुसार कक्षा १० का सम्पूर्ण सिद्धान्तहरूलाई प्रत्यक्ष प्रयोगात्मक प्रयोगशालामा बुझ्नुहोस्।";
    } else {
      heroH2.textContent = "Science is Not to Memorize, It's to Experience.";
      heroP.textContent = "Master every concept of Nepal's Grade 10 Science (SEE) through hands-on interactive simulations, visual formulas, and real experiments.";
    }
  }

  updateLanguageTexts() {
    this.renderHero();
    // Re-render DIY section with updated language
    this.renderDIYSection();
  }

  mountSimulations() {
    new GravitySimulation('gravity-lab-mount');
    new PressureSimulation('pressure-lab-mount');
    new OpticsSimulation('optics-lab-mount');
    new TransformerSimulation('transformer-lab-mount');
    new GasPrepSimulation('gasprep-lab-mount');
    new PeriodicTableSimulation('periodic-lab-mount');
    new GeneticsSimulation('genetics-lab-mount');
    new HeartSimulation('heart-lab-mount');
    new StarsSimulation('stars-lab-mount');
    new SEEQuiz('quiz-lab-mount');
  }

  renderDIYSection() {
    const mount = document.getElementById('diy-lab-mount');
    if (!mount) return;

    const isNe = this.currentLang === 'ne';

    mount.innerHTML = `
      <div class="lab-card">
        <div class="lab-header">
          <div>
            <h3>${isNe ? 'घरमै गर्न सकिने सरल वैज्ञानिक प्रयोगहरू' : 'DIY Home Science Experiments (घरमै सिक्नुहोस्)'}</h3>
            <p class="lab-desc">${isNe ? 'घरमा उपलब्ध सामान्य सामग्रीहरू (पानीको बोतल, सिरिन्ज, नुन, बेसार) बाट विज्ञानका नियमहरूको प्रत्यक्ष अनुभव गर्नुहोस्।' : 'Safe, hands-on physics and chemistry experiments you can do using everyday household items in any Nepali home.'}</p>
          </div>
          <div class="formula-badge">🏡 100% Practical at Home</div>
        </div>

        <div class="diy-grid">
          ${SYLLABUS_DATA.diyHomeExperiments.map(exp => `
            <div class="diy-card">
              <h4>${exp.title}</h4>
              <div class="diy-materials">
                <strong>Materials Needed:</strong> ${exp.materials}
              </div>
              <ul class="diy-steps">
                ${exp.steps.map(step => `<li>${step}</li>`).join('')}
              </ul>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  filterModules() {
    const sections = document.querySelectorAll('.lab-section');
    sections.forEach(sec => {
      const domain = sec.dataset.domain;
      if (this.activeFilter === 'all' || domain === this.activeFilter) {
        sec.style.display = 'block';
      } else {
        sec.style.display = 'none';
      }
    });
  }

  searchModules(query) {
    if (!query) {
      this.filterModules();
      return;
    }

    const sections = document.querySelectorAll('.lab-section');
    sections.forEach(sec => {
      const text = sec.innerText.toLowerCase();
      if (text.includes(query)) {
        sec.style.display = 'block';
      } else {
        sec.style.display = 'none';
      }
    });
  }
}

window.addEventListener('DOMContentLoaded', () => {
  new NepalSciencePlatform();
});
