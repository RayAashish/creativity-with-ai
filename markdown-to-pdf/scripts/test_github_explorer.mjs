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
  // Set Moto Pad 70 Pro viewport (1280 x 800)
  await page.setViewport({ width: 1280, height: 800, deviceScaleFactor: 2 });

  console.log('Navigating to http://localhost:5173...');
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1000));

  // 1. Verify GitHub Explorer Tab exists and click it if not active
  const hasGithubTab = await page.evaluate(() => {
    const tabs = Array.from(document.querySelectorAll('button')).filter(b => b.textContent?.includes('GitHub Explorer'));
    if (tabs.length > 0) {
      tabs[0].click();
      return true;
    }
    return false;
  });
  console.log('Has GitHub Explorer Tab:', hasGithubTab);
  await new Promise(r => setTimeout(r, 500));

  // Take screenshot of initial GitHub Explorer
  await page.screenshot({ path: '/Users/aashishkumarray/.gemini/antigravity/brain/6e0442b0-5169-4544-913b-59dd77200543/markpdf_github_repos_list.png' });
  console.log('Saved screenshot of GitHub Explorer repos list');

  // 2. Click repo "under-the-hood-spring"
  console.log('Looking for repo under-the-hood-spring...');
  const repoClicked = await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const repoBtn = buttons.find(b => b.textContent?.includes('under-the-hood-spring'));
    if (repoBtn) {
      repoBtn.click();
      return true;
    }
    return false;
  });
  console.log('Clicked under-the-hood-spring repo:', repoClicked);

  // Wait for tree to load
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: '/Users/aashishkumarray/.gemini/antigravity/brain/6e0442b0-5169-4544-913b-59dd77200543/markpdf_github_tree_root.png' });
  console.log('Saved screenshot of repo tree root');

  // 3. Click folder "09-spring-boot-core"
  console.log('Looking for folder 09-spring-boot-core...');
  const folderClicked = await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const folderBtn = buttons.find(b => b.textContent?.includes('09-spring-boot-core'));
    if (folderBtn) {
      folderBtn.click();
      return true;
    }
    return false;
  });
  console.log('Clicked 09-spring-boot-core folder:', folderClicked);
  await new Promise(r => setTimeout(r, 800));

  // 4. Click folder "notes"
  console.log('Looking for folder notes...');
  const notesFolderClicked = await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const notesBtn = buttons.find(b => b.textContent?.trim().toLowerCase() === 'notes' || b.textContent?.includes('notes'));
    if (notesBtn) {
      notesBtn.click();
      return true;
    }
    return false;
  });
  console.log('Clicked notes folder:', notesFolderClicked);
  await new Promise(r => setTimeout(r, 800));
  await page.screenshot({ path: '/Users/aashishkumarray/.gemini/antigravity/brain/6e0442b0-5169-4544-913b-59dd77200543/markpdf_github_notes_folder.png' });
  console.log('Saved screenshot of notes folder');

  // 5. Click "notes.md"
  console.log('Looking for notes.md file...');
  const fileClicked = await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const fileBtn = buttons.find(b => b.textContent?.includes('notes.md'));
    if (fileBtn) {
      fileBtn.click();
      return true;
    }
    return false;
  });
  console.log('Clicked notes.md file:', fileClicked);
  await new Promise(r => setTimeout(r, 2000));

  // Take screenshot with document loaded
  await page.screenshot({ path: '/Users/aashishkumarray/.gemini/antigravity/brain/6e0442b0-5169-4544-913b-59dd77200543/markpdf_github_note_loaded.png' });
  console.log('Saved screenshot of note loaded in preview');

  // 6. Test Persistence across reload
  console.log('Reloading page to test persistence of GitHub repo & folder state...');
  await page.reload({ waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1500));

  const afterReloadCheck = await page.evaluate(() => {
    const breadcrumbs = document.body.textContent?.includes('09-spring-boot-core') && document.body.textContent?.includes('notes');
    const docTitle = document.querySelector('h1')?.textContent || '';
    return {
      breadcrumbsPresent: breadcrumbs,
      docTitle
    };
  });
  console.log('After reload check:', afterReloadCheck);

  await page.screenshot({ path: '/Users/aashishkumarray/.gemini/antigravity/brain/6e0442b0-5169-4544-913b-59dd77200543/markpdf_github_after_reload.png' });
  console.log('Saved screenshot after reload');

  await browser.close();
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
