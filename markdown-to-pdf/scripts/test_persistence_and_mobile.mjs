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
  // Set mobile device viewport (e.g. 390x844 iPhone 13 / modern Android phone)
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });

  console.log('Navigating to http://localhost:5173...');
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle0' });

  // 1. Verify initial title and content
  const initialTitle = await page.evaluate(() => document.title);
  console.log('Initial document title:', initialTitle);

  // 2. Set custom fetched content in localStorage as if fetched from GitHub
  const customDoc = '# Spring Boot Under The Hood\n\nCustom fetched document from GitHub repository.\n\n```java\n@Configuration\npublic class AppConfig {}\n```';
  await page.evaluate((doc) => {
    localStorage.setItem('markpdf_saved_markdown', doc);
    localStorage.setItem('markpdf_saved_title', 'Spring Boot Under The Hood');
    localStorage.setItem('markpdf_saved_filename', 'spring-boot-guide.md');
  }, customDoc);

  console.log('Reloading page to test persistence...');
  await page.reload({ waitUntil: 'networkidle0' });

  // 3. Verify that the reloaded page displays the persisted content, NOT the showcase!
  const persistedContent = await page.evaluate(() => {
    const editor = document.querySelector('textarea');
    return editor ? editor.value : '';
  });

  console.log('Persisted content in editor starts with:', persistedContent.slice(0, 60));
  if (persistedContent.includes('Spring Boot Under The Hood')) {
    console.log('SUCCESS: Content persisted correctly across reload!');
  } else {
    console.error('FAILURE: Content did not persist!');
  }

  // 4. Verify mobile header layout
  await page.screenshot({ path: '/Users/aashishkumarray/.gemini/antigravity/brain/6e0442b0-5169-4544-913b-59dd77200543/markpdf_mobile_persisted_editor.png' });
  console.log('Saved screenshot of mobile editor');

  // Switch to preview tab
  await page.click('button[data-tab="preview"]');
  await new Promise(r => setTimeout(r, 600));

  await page.screenshot({ path: '/Users/aashishkumarray/.gemini/antigravity/brain/6e0442b0-5169-4544-913b-59dd77200543/markpdf_mobile_persisted_preview.png' });
  console.log('Saved screenshot of mobile preview');

  await browser.close();
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
