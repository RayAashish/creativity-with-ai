import puppeteer from 'puppeteer-core';

async function run() {
  const browser = await puppeteer.launch({
    executablePath: '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  // 1. Mobile Phone Viewport (390 x 844)
  console.log('Testing Mobile Phone Viewport (390x844)...');
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle0' });
  await page.screenshot({ path: '/Users/aashishkumarray/.gemini/antigravity/brain/6e0442b0-5169-4544-913b-59dd77200543/markpdf_mobile_editor.png' });

  // Click on "Preview" tab in bottom dock
  console.log('Switching to Preview tab on mobile...');
  await page.click('button[data-tab="preview"]');
  await new Promise(r => setTimeout(r, 400));
  await page.screenshot({ path: '/Users/aashishkumarray/.gemini/antigravity/brain/6e0442b0-5169-4544-913b-59dd77200543/markpdf_mobile_preview.png' });

  // Click on "Style" tab in bottom dock
  console.log('Switching to Style tab on mobile...');
  await page.click('button[data-tab="style"]');
  await new Promise(r => setTimeout(r, 400));
  await page.screenshot({ path: '/Users/aashishkumarray/.gemini/antigravity/brain/6e0442b0-5169-4544-913b-59dd77200543/markpdf_mobile_style.png' });

  // 2. Tablet Portrait Viewport (800 x 1280 - Moto Pad 70 Pro Portrait)
  console.log('Testing Tablet Portrait Viewport (800x1280)...');
  await page.setViewport({ width: 800, height: 1280, isMobile: true, hasTouch: true });
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle0' });
  await page.screenshot({ path: '/Users/aashishkumarray/.gemini/antigravity/brain/6e0442b0-5169-4544-913b-59dd77200543/markpdf_tablet_portrait.png' });

  await browser.close();
  console.log('Responsive test screenshots captured successfully!');
}

run().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
