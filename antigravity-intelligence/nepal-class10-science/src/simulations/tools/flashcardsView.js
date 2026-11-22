// Interactive SEE Revision Flashcards Deck (द्रुत पुनरावलोकन फ्ल्यासकार्ड)
import { FLASHCARDS_DATA } from '../../data/flashcardsData.js';

export function renderFlashcards(container, lang = 'en') {
  let currentIndex = 0;
  let isFlipped = false;

  container.innerHTML = `
    <div class="sim-card">
      <div class="sim-header">
        <div class="sim-badge">SEE EXAM REVISION // द्रुत पुनरावलोकन</div>
        <h2 class="sim-title">${lang === 'np' ? 'SEE विज्ञान मुख्य सूत्र तथा परिभाषा फ्ल्यासकार्ड' : 'High-Yield SEE Science Flashcards'}</h2>
        <p class="sim-desc">
          ${lang === 'np'
            ? 'परीक्षामा बारम्बार सोधिने सिद्धान्त, नियम, सूत्र र कारणहरूलाई कार्ड पल्टाएर छिटो-छिटो सम्झिनुहोस्।'
            : 'Rapid revision deck covering essential laws, definitions, units, and reasoning questions asked in the SEE Board Exams. Click the card to flip between Question and Answer!'}
        </p>
      </div>

      <div class="flashcards-wrapper">
        <div class="flashcard-status-bar">
          <span id="fc-counter" class="telemetry-label">Card 1 of ${FLASHCARDS_DATA.length}</span>
          <span id="fc-subject" class="value-pill">Physics</span>
        </div>

        <div id="active-flashcard" class="flashcard-element">
          <div class="flashcard-inner">
            <div class="flashcard-front">
              <div class="card-prompt-label">QUESTION / प्रश्न</div>
              <h3 id="card-front-text" class="card-text">Loading...</h3>
              <div class="card-click-hint">👆 Click to flip answer / उत्तर हेर्न थिच्नुहोस्</div>
            </div>
            <div class="flashcard-back">
              <div class="card-prompt-label success">MODEL ANSWER / उत्तर</div>
              <div id="card-back-text" class="card-text">Loading...</div>
              <div class="card-click-hint">👆 Click to flip back / फेरि थिच्नुहोस्</div>
            </div>
          </div>
        </div>

        <div class="flashcard-nav-bar">
          <button id="fc-prev-btn" class="btn-minimal secondary">← ${lang === 'np' ? 'अघिल्लो' : 'Previous'}</button>
          <button id="fc-flip-btn" class="btn-minimal">🔄 ${lang === 'np' ? 'कार्ड पल्टाउनुहोस्' : 'Flip Card'}</button>
          <button id="fc-next-btn" class="btn-minimal"> ${lang === 'np' ? 'पछिल्लो' : 'Next'} →</button>
        </div>
      </div>
    </div>
  `;

  const cardElement = container.querySelector('#active-flashcard');
  const frontText = container.querySelector('#card-front-text');
  const backText = container.querySelector('#card-back-text');
  const counter = container.querySelector('#fc-counter');
  const subjectTag = container.querySelector('#fc-subject');

  const updateCard = () => {
    isFlipped = false;
    cardElement.classList.remove('flipped');
    const card = FLASHCARDS_DATA[currentIndex];

    counter.textContent = `Card ${currentIndex + 1} of ${FLASHCARDS_DATA.length}`;
    subjectTag.textContent = card.subject.toUpperCase();

    frontText.innerHTML = `
      <div style="font-size: 1.15rem; font-weight: 600; margin-bottom: 0.5rem;">${card.frontEn}</div>
      <div style="font-size: 1rem; color: #71717a;">${card.frontNp}</div>
    `;

    backText.innerHTML = `
      <div style="font-size: 1.05rem; margin-bottom: 0.75rem;">${card.backEn}</div>
      <div style="font-size: 0.95rem; color: #52525b; border-top: 1px solid #e4e4e7; padding-top: 0.5rem;">${card.backNp}</div>
    `;
  };

  const toggleFlip = () => {
    isFlipped = !isFlipped;
    cardElement.classList.toggle('flipped', isFlipped);
  };

  cardElement.addEventListener('click', toggleFlip);
  container.querySelector('#fc-flip-btn').addEventListener('click', toggleFlip);

  container.querySelector('#fc-prev-btn').addEventListener('click', () => {
    if (currentIndex > 0) {
      currentIndex--;
      updateCard();
    }
  });

  container.querySelector('#fc-next-btn').addEventListener('click', () => {
    if (currentIndex < FLASHCARDS_DATA.length - 1) {
      currentIndex++;
      updateCard();
    }
  });

  updateCard();
}
