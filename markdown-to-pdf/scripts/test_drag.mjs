import puppeteer from 'puppeteer-core';

async function run() {
  const browser = await puppeteer.launch({
    executablePath: '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1400,900']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 900 });

  console.log('Navigating to http://localhost:5173...');
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle0' });

  // Wait for splitter handle
  const splitterSelector = '[title*="Drag to resize editor view"]';
  await page.waitForSelector(splitterSelector, { timeout: 5000 });

  // Get initial bounding box of splitter
  const splitterHandle = await page.$(splitterSelector);
  let box = await splitterHandle.boundingBox();
  console.log('Initial splitter position:', box);

  // Take screenshot 1: Initial state
  await page.screenshot({ path: '/Users/aashishkumarray/.gemini/antigravity/brain/6e0442b0-5169-4544-913b-59dd77200543/markpdf_drag_initial.png' });

  // Drag splitter from box.x to box.x + 220 (making editor wider)
  console.log('Dragging splitter to the right (+220px)...');
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  // Move in steps
  for (let offset = 20; offset <= 220; offset += 20) {
    await page.mouse.move(box.x + box.width / 2 + offset, box.y + box.height / 2);
    await new Promise(r => setTimeout(r, 20));
  }

  // Take screenshot during drag with badge visible
  await page.screenshot({ path: '/Users/aashishkumarray/.gemini/antigravity/brain/6e0442b0-5169-4544-913b-59dd77200543/markpdf_dragging_active.png' });

  await page.mouse.up();
  await new Promise(r => setTimeout(r, 200));

  box = await splitterHandle.boundingBox();
  console.log('New splitter position after drag:', box);

  // Take screenshot 2: After drag
  await page.screenshot({ path: '/Users/aashishkumarray/.gemini/antigravity/brain/6e0442b0-5169-4544-913b-59dd77200543/markpdf_drag_expanded.png' });

  // Double-click to test reset
  console.log('Double clicking splitter to test reset...');
  await splitterHandle.click({ clickCount: 2 });
  await new Promise(r => setTimeout(r, 300));

  box = await splitterHandle.boundingBox();
  console.log('Position after reset double click:', box);

  await page.screenshot({ path: '/Users/aashishkumarray/.gemini/antigravity/brain/6e0442b0-5169-4544-913b-59dd77200543/markpdf_drag_reset.png' });

  await browser.close();
  console.log('Drag test finished successfully!');
}

run().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
