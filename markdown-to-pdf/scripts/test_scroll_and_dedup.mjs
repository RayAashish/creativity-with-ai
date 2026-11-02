import puppeteer from 'puppeteer-core';
import { findBrowserExecutable } from '../server/browserFinder.js';

async function run() {
  const browserPath = findBrowserExecutable();
  console.log('Using browser at:', browserPath);

  const browser = await puppeteer.launch({
    executablePath: browserPath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  // Set Moto Pad 70 Pro tablet landscape resolution (1280 x 800)
  await page.setViewport({ width: 1280, height: 800, deviceScaleFactor: 2 });

  console.log('Navigating to http://localhost:5173...');
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 800));

  // 1. Verify that the preview toolbar NO LONGER has duplicate Print and PDF buttons
  const previewToolbarButtons = await page.evaluate(() => {
    // Find preview controls container (sibling of scroll container)
    const previewContainer = document.querySelector('#markpdf-paper-container')?.parentElement?.parentElement?.parentElement;
    if (!previewContainer) return [];
    const buttons = Array.from(previewContainer.querySelectorAll('button')).map(b => b.textContent?.trim());
    return buttons;
  });

  console.log('Preview toolbar button labels:', previewToolbarButtons);
  const hasDupPrint = previewToolbarButtons.some(b => b === 'Print');
  const hasDupPdf = previewToolbarButtons.some(b => b === 'PDF' && !b.includes('Download'));
  console.log('Has duplicate Print in preview toolbar:', hasDupPrint);
  console.log('Has duplicate PDF in preview toolbar:', hasDupPdf);

  // 2. Test Scroll Position Persistence
  // Generate a long markdown document (e.g. 50 sections)
  let longMarkdown = '# Mega Documentation (100 Pages)\n\n';
  for (let i = 1; i <= 60; i++) {
    longMarkdown += `## Section ${i}: Deep Dive into Topic ${i}\n\nThis is paragraph content for section ${i}. It covers extensive details, code examples, and mathematical equations.\n\n\`\`\`java\npublic class Service${i} {\n    public void execute() {\n        System.out.println("Section ${i}");\n    }\n}\n\`\`\`\n\n$$\\int_{0}^{${i}} x^2 dx = \\frac{${i}^3}{3}$$\n\n`;
  }

  // Set the long document in localStorage
  await page.evaluate((doc) => {
    localStorage.setItem('markpdf_saved_markdown', doc);
    localStorage.setItem('markpdf_saved_title', 'Mega Documentation');
    localStorage.setItem('markpdf_saved_filename', 'mega-doc.md');
  }, longMarkdown);

  console.log('Reloading with long document...');
  await page.reload({ waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1200));

  // Scroll down in the preview panel
  const scrollResult = await page.evaluate(() => {
    const scrollContainer = document.getElementById('markpdf-scroll-area');
    if (scrollContainer) {
      scrollContainer.scrollTop = 2400; // Scroll down 2400 pixels
      // Dispatch scroll event so it saves to localStorage
      scrollContainer.dispatchEvent(new Event('scroll'));
      return { scrolled: true, scrollTop: scrollContainer.scrollTop, scrollHeight: scrollContainer.scrollHeight };
    }
    return { scrolled: false };
  });

  console.log('Scrolled preview down:', scrollResult);
  await new Promise(r => setTimeout(r, 400));

  // Now reload page!
  console.log('Reloading page to test scroll position restoration...');
  await page.reload({ waitUntil: 'networkidle0' });

  // Wait for staggered scroll restoration
  await new Promise(r => setTimeout(r, 1200));

  const restoredScrollTop = await page.evaluate(() => {
    const scrollContainer = document.getElementById('markpdf-scroll-area');
    return scrollContainer ? scrollContainer.scrollTop : 0;
  });

  console.log('Restored scrollTop after reload:', restoredScrollTop);
  if (restoredScrollTop > 1000) {
    console.log('SUCCESS: Scroll position was preserved across page reload!');
  } else {
    console.warn('Scroll position might need longer wait or check:', restoredScrollTop);
  }

  // 3. Take screenshot of tablet layout with enlarged header icons and deduplicated preview toolbar
  await page.screenshot({ path: '/Users/aashishkumarray/.gemini/antigravity/brain/6e0442b0-5169-4544-913b-59dd77200543/markpdf_tablet_optimized.png' });
  console.log('Saved screenshot of tablet view');

  // 4. Test Mobile View
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await page.reload({ waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 800));
  await page.screenshot({ path: '/Users/aashishkumarray/.gemini/antigravity/brain/6e0442b0-5169-4544-913b-59dd77200543/markpdf_mobile_optimized.png' });
  console.log('Saved screenshot of mobile view');

  await browser.close();
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
