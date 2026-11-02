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
  
  // Test Moto Pad 70 Pro in Portrait (approx 800 x 1280 or 768 x 1024)
  const viewports = [
    { name: 'Tablet Portrait 768px', width: 768, height: 1024 },
    { name: 'Moto Pad Portrait 800px', width: 800, height: 1280 },
    { name: 'Mobile 390px', width: 390, height: 844 },
    { name: 'Tablet Landscape 1280px', width: 1280, height: 800 }
  ];

  for (const vp of viewports) {
    await page.setViewport({ width: vp.width, height: vp.height, deviceScaleFactor: 2 });
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 600));

    const check = await page.evaluate((vpWidth) => {
      // Find the Download PDF button
      const downloadBtn = Array.from(document.querySelectorAll('header button')).find(b => 
        b.textContent?.includes('PDF') || b.textContent?.includes('Download')
      );
      if (!downloadBtn) return { error: 'Download button not found' };

      const rect = downloadBtn.getBoundingClientRect();
      const isOutside = rect.right > vpWidth;
      const marginFromRight = vpWidth - rect.right;
      return {
        buttonText: downloadBtn.textContent?.trim(),
        rect: { left: rect.left, right: rect.right, width: rect.width },
        viewportWidth: vpWidth,
        marginFromRight,
        isFullyInside: rect.right <= vpWidth && rect.left >= 0
      };
    }, vp.width);

    console.log(`[${vp.name}]:`, check);

    if (vp.name.includes('Portrait 768px')) {
      await page.screenshot({ path: '/Users/aashishkumarray/.gemini/antigravity/brain/6e0442b0-5169-4544-913b-59dd77200543/markpdf_tablet_portrait_768_fixed.png' });
    }
  }

  await browser.close();
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
