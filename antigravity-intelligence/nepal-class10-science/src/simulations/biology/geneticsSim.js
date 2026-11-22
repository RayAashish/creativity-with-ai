// Interactive Genetics, Mendel's Cross & Sex Determination Lab (आनुवंशिकी तथा लिंग निर्धारण)

export function renderGeneticsSim(container, lang = 'en') {
  container.innerHTML = `
    <div class="sim-card">
      <div class="sim-header">
        <div class="sim-badge">BIOLOGY LAB // जीव विज्ञान</div>
        <h2 class="sim-title">${lang === 'np' ? 'मेन्डेलको आनुवंशिकी र मानव लिंग निर्धारण' : 'Mendel\'s Monohybrid Cross & Sex Determination'}</h2>
        <p class="sim-desc">
          ${lang === 'np'
            ? 'केराउको बोटमा मेन्डेलको एकजोडी गुण संकरण (Punnett Square), ३:१ अनुपात र मानव शिशुको लिंग निर्धारणमा बाबुको भूमिका।'
            : 'Explore Gregor Mendel\'s monohybrid pea plant cross (3:1 phenotypic and 1:2:1 genotypic ratios) and human chromosomal sex determination (XX vs XY).'}
        </p>
      </div>

      <div class="lab-subtabs">
        <button class="subtab-btn active" data-sub="mendel">${lang === 'np' ? '🌱 मेन्डेलको एकजोडी गुण संकरण' : '🌱 Mendel\'s Monohybrid Cross'}</button>
        <button class="subtab-btn" data-sub="sexdet">${lang === 'np' ? '👶 मानव लिंग निर्धारण (XX vs XY)' : '👶 Human Sex Determination'}</button>
      </div>

      <!-- 1. MENDEL MONOHYBRID CROSS -->
      <div id="gen-sub-mendel" class="subtab-content active">
        <div class="minimal-grid">
          <div class="interactive-panel">
            <h3 class="panel-heading">${lang === 'np' ? 'F₂ वंशको पुनेट वर्ग (Punnett Square)' : 'F₂ Generation Punnett Square'}</h3>

            <div class="punnett-wrapper">
              <table class="punnett-table">
                <thead>
                  <tr>
                    <th class="blank-corner">♀ \\ ♂</th>
                    <th>Gamete T (अग्लो)</th>
                    <th>Gamete t (पुड्को)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <th>Gamete T (अग्लो)</th>
                    <td class="allele-box dominant">
                      <div class="gene-code">TT</div>
                      <div class="trait-name">Pure Tall (शुद्ध अग्लो)</div>
                    </td>
                    <td class="allele-box hybrid">
                      <div class="gene-code">Tt</div>
                      <div class="trait-name">Hybrid Tall (वर्णशङ्कर अग्लो)</div>
                    </td>
                  </tr>
                  <tr>
                    <th>Gamete t (पुड्को)</th>
                    <td class="allele-box hybrid">
                      <div class="gene-code">Tt</div>
                      <div class="trait-name">Hybrid Tall (वर्णशङ्कर अग्लो)</div>
                    </td>
                    <td class="allele-box recessive">
                      <div class="gene-code">tt</div>
                      <div class="trait-name">Pure Dwarf (शुद्ध पुड्को)</div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="telemetry-bar" style="margin-top: 1.5rem;">
              <div class="telemetry-item">
                <span class="telemetry-label">Phenotypic Ratio (स्वरुप अनुपात):</span>
                <span class="telemetry-value" style="color: #10b981;">3 Tall : 1 Dwarf (३ अग्लो : १ पुड्को)</span>
              </div>
              <div class="telemetry-item">
                <span class="telemetry-label">Genotypic Ratio (जिन अनुपात):</span>
                <span class="telemetry-value" style="color: #0284c7;">1 TT : 2 Tt : 1 tt (१ : २ : १)</span>
              </div>
            </div>
          </div>

          <div class="details-panel">
            <h4 class="details-heading">${lang === 'np' ? 'मेन्डेलका नियमहरू' : 'Mendel\'s Laws'}</h4>
            <ul class="clean-list">
              <li><strong>${lang === 'np' ? 'प्रबलताको नियम (Dominance):' : 'Law of Dominance:'}</strong> In heterozygous condition ($Tt$), the dominant allele ($T$) masks the expression of the recessive allele ($t$).</li>
              <li><strong>${lang === 'np' ? 'पृथकीकरणको नियम (Segregation):' : 'Law of Segregation:'}</strong> Alleles separate cleanly during gamete formation so each gamete carries only one allele.</li>
              <li><strong>${lang === 'np' ? 'केराउ किन रोजे?' : 'Why Pea Plant (Pisum sativum)?'}</strong> Short life cycle, naturally self-pollinating, easy cross-pollination, and distinct contrasting characters.</li>
            </ul>
          </div>
        </div>
      </div>

      <!-- 2. HUMAN SEX DETERMINATION -->
      <div id="gen-sub-sexdet" class="subtab-content">
        <div class="minimal-grid">
          <div class="interactive-panel">
            <h3 class="panel-heading">${lang === 'np' ? 'क्रोमोजोम संकरण र लिंग निर्धारण' : 'Chromosomal Sex Determination (50% Chance)'}</h3>

            <div class="punnett-wrapper">
              <table class="punnett-table">
                <thead>
                  <tr>
                    <th class="blank-corner">Mother \\ Father</th>
                    <th>Sperm 22+X (५०%)</th>
                    <th>Sperm 22+Y (५०%)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <th>Ovum 22+X (१००%)</th>
                    <td class="allele-box female">
                      <div class="gene-code">44 + XX</div>
                      <div class="trait-name">👧 Female Child / छोरी (50%)</div>
                    </td>
                    <td class="allele-box male">
                      <div class="gene-code">44 + XY</div>
                      <div class="trait-name">👦 Male Child / छोरा (50%)</div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="action-bar" style="margin-top: 1.5rem;">
              <button id="btn-fertilize-random" class="btn-minimal">🎲 ${lang === 'np' ? 'आकस्मिक गर्भाधान गराउनुहोस् (Simulate Conception)' : 'Simulate Random Fertilization'}</button>
            </div>

            <div id="fertilize-result-box" class="telemetry-bar" style="margin-top: 1rem;">
              <span class="telemetry-label">Outcome:</span>
              <span id="fert-outcome-text" class="telemetry-value">Click button to simulate random sperm-egg fusion.</span>
            </div>
          </div>

          <div class="details-panel">
            <h4 class="details-heading">${lang === 'np' ? 'सामाजिक तथा वैज्ञानिक यथार्थ' : 'Societal & Scientific Truth'}</h4>
            <div class="nepal-context-box">
              <div class="context-tag">🇳🇵 ${lang === 'np' ? 'नेपाली समाजमा चेतना:' : 'Awareness for Nepal:'}</div>
              <p class="context-text">
                ${lang === 'np'
                  ? 'नेपाली समाजमा छोरी मात्र जन्माएको भन्दै महिलालाई दोष दिने कुप्रथा छ। तर जैविक विज्ञानअनुसार आमाले सधैं X क्रोमोजोम मात्र दिन्छिन्। बाबुको शुक्राणुमा रहने X वा Y क्रोमोजोमले नै शिशुको लिंग निर्धारण गर्दछ। तसर्थ सन्तानको लिंग निर्धारणमा केवल बाबुको शुक्राणु जिम्मेवार हुन्छ।'
                  : 'In traditional societies, mothers are mistakenly blamed for bearing daughters. Scientifically, mother\'s eggs only have X chromosomes. It is the father\'s sperm (50% X, 50% Y) that strictly determines the sex of the child.'}
              </p>
            </div>
          </div>
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
      const target = container.querySelector(`#gen-sub-${t.dataset.sub}`);
      if (target) target.classList.add('active');
    });
  });

  // Fertilization simulation
  const btnFert = container.querySelector('#btn-fertilize-random');
  const outcomeText = container.querySelector('#fert-outcome-text');

  btnFert.addEventListener('click', () => {
    const isY = Math.random() < 0.5;
    if (isY) {
      outcomeText.textContent = '👦 SPERM WITH Y CHROMOSOME FERTILIZED THE EGG → 44+XY MALE CHILD (छोरा)!';
      outcomeText.style.color = '#0284c7';
    } else {
      outcomeText.textContent = '👧 SPERM WITH X CHROMOSOME FERTILIZED THE EGG → 44+XX FEMALE CHILD (छोरी)!';
      outcomeText.style.color = '#ec4899';
    }
  });
}
