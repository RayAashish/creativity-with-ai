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

  // Locate the preview scroll area
  const scrollSelector = '#markpdf-paper-container';
  await page.waitForSelector(scrollSelector, { timeout: 5000 });

  // 1. Test Trackpad Pinch-Out (Zoom In) via Wheel event with ctrlKey
  console.log('Testing Trackpad Pinch-Out (Zoom In: ctrlKey + wheel)...');
  await page.evaluate(() => {
    const el = document.getElementById('markpdf-paper-container');
    const scrollArea = el.closest('.overflow-auto');
    // Dispatch wheel event with ctrlKey: negative deltaY = zoom in (pinch out)
    const wheelEvent = new WheelEvent('wheel', {
      ctrlKey: true,
      deltaY: -80,
      bubbles: true,
      cancelable: true
    });
    scrollArea.dispatchEvent(wheelEvent);
  });

  await new Promise(r => setTimeout(r, 200));

  // Take screenshot of zoomed preview with floating zoom pill visible
  await page.screenshot({ path: '/Users/aashishkumarray/.gemini/antigravity/brain/6e0442b0-5169-4544-913b-59dd77200543/markpdf_pinch_zoomed_in.png' });

  // Check scale on paper container
  const scaleZoomedIn = await page.evaluate(() => {
    const paper = document.getElementById('markpdf-paper-container').parentElement;
    return paper.style.transform;
  });
  console.log('Paper transform after pinch-out (zoom in):', scaleZoomedIn);

  // 2. Test Touch Pinch-In (Zoom Out) via 2-finger Touch events
  console.log('Testing Touch Pinch-In (Zoom Out via 2-finger Touch)...');
  await page.evaluate(() => {
    const el = document.getElementById('markpdf-paper-container');
    const scrollArea = el.closest('.overflow-auto');
    const rect = scrollArea.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    // Create 2 initial touches far apart (distance = 300px)
    const touch1 = new Touch({ identifier: 1, target: scrollArea, clientX: centerX - 150, clientY: centerY });
    const touch2 = new Touch({ identifier: 2, target: scrollArea, clientX: centerX + 150, clientY: centerY });

    scrollArea.dispatchEvent(new TouchEvent('touchstart', {
      touches: [touch1, touch2],
      targetTouches: [touch1, touch2],
      changedTouches: [touch1, touch2],
      bubbles: true,
      cancelable: true
    }));

    // Move touches closer together (pinch in: distance = 120px)
    const touch1Moved = new Touch({ identifier: 1, target: scrollArea, clientX: centerX - 60, clientY: centerY });
    const touch2Moved = new Touch({ identifier: 2, target: scrollArea, clientX: centerX + 60, clientY: centerY });

    scrollArea.dispatchEvent(new TouchEvent('touchmove', {
      touches: [touch1Moved, touch2Moved],
      targetTouches: [touch1Moved, touch2Moved],
      changedTouches: [touch1Moved, touch2Moved],
      bubbles: true,
      cancelable: true
    }));

    scrollArea.dispatchEvent(new TouchEvent('touchend', {
      touches: [],
      targetTouches: [],
      changedTouches: [touch1Moved, touch2Moved],
      bubbles: true,
      cancelable: true
    }));
  });

  await new Promise(r => setTimeout(r, 200));

  const scaleZoomedOut = await page.evaluate(() => {
    const paper = document.getElementById('markpdf-paper-container').parentElement;
    return paper.style.transform;
  });
  console.log('Paper transform after 2-finger pinch-in (zoom out):', scaleZoomedOut);

  await page.screenshot({ path: '/Users/aashishkumarray/.gemini/antigravity/brain/6e0442b0-5169-4544-913b-59dd77200543/markpdf_pinch_zoomed_out.png' });

  await browser.close();
  console.log('Pinch tests completed successfully!');
}

run().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
