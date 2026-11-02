import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import puppeteer from 'puppeteer-core';
import { findBrowserExecutable } from './browserFinder.js';
import { normalizeMarkdownUrl } from './urlResolver.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

const browserExecutable = findBrowserExecutable();
console.log(`[Server] Detected Browser Executable: ${browserExecutable || 'None (Fallback mode)'}`);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    browserAvailable: Boolean(browserExecutable),
    browserPath: browserExecutable || null,
    uptime: process.uptime()
  });
});

// Fetch Markdown from URL endpoint
app.post('/api/fetch-url', async (req, res) => {
  try {
    const { url } = req.body;
    if (!url || typeof url !== 'string') {
      return res.status(400).json({ error: 'Missing or invalid "url" parameter.' });
    }

    const resolved = normalizeMarkdownUrl(url);
    const urlsToTry = resolved.candidateUrls || [resolved.rawUrl];

    let content = null;
    let fetchedFrom = null;
    let lastError = null;

    const headers = {
      'User-Agent': 'MarkdownToPdfConverter/1.0 (+https://github.com)',
      'Accept': 'text/plain, text/markdown, text/x-markdown, application/octet-stream, */*'
    };

    for (const targetUrl of urlsToTry) {
      try {
        const response = await fetch(targetUrl, { headers, redirect: 'follow' });
        if (response.ok) {
          const text = await response.text();
          // Check if it's an HTML 404 page masquerading as text
          if (text.includes('<!DOCTYPE html>') && text.includes('404')) {
            lastError = `Received 404 page from ${targetUrl}`;
            continue;
          }
          content = text;
          fetchedFrom = targetUrl;
          break;
        } else {
          lastError = `HTTP ${response.status} ${response.statusText} from ${targetUrl}`;
        }
      } catch (err) {
        lastError = err.message;
      }
    }

    if (!content) {
      return res.status(404).json({
        error: `Could not fetch markdown from the provided URL. ${lastError || ''}`,
        resolvedUrl: resolved.rawUrl
      });
    }

    // Try to extract an initial title from the markdown
    const titleMatch = content.match(/^#\s+(.+)$/m);
    const docTitle = titleMatch ? titleMatch[1].trim() : resolved.filename.replace(/\.md$/i, '');

    res.json({
      success: true,
      content,
      filename: resolved.filename,
      title: docTitle,
      sourceUrl: fetchedFrom
    });
  } catch (err) {
    console.error('[Fetch Error]:', err);
    res.status(500).json({ error: err.message || 'Failed to fetch content from URL.' });
  }
});

// Generate PDF endpoint
app.post('/api/generate-pdf', async (req, res) => {
  if (!browserExecutable) {
    return res.status(503).json({
      error: 'Headless browser not detected on the server. Please use the "Print / Save as PDF" option in the browser.'
    });
  }

  let browser = null;
  try {
    const {
      html,
      title = 'document',
      format = 'A4',
      landscape = false,
      margin = { top: '20mm', right: '20mm', bottom: '20mm', left: '20mm' },
      displayHeaderFooter = false,
      headerTemplate = '',
      footerTemplate = ''
    } = req.body;

    if (!html) {
      return res.status(400).json({ error: 'Missing HTML content to render.' });
    }

    browser = await puppeteer.launch({
      executablePath: browserExecutable,
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-gpu',
        '--disable-dev-shm-usage',
        '--no-first-run',
        '--no-zygote'
      ]
    });

    const page = await browser.newPage();

    // Set high-DPI viewport for crisp rendering
    await page.setViewport({ width: 1200, height: 1600, deviceScaleFactor: 2 });

    // Set content and wait for loaded
    await page.setContent(html, {
      waitUntil: ['load', 'networkidle0'],
      timeout: 30000
    });

    // Wait for fonts if document.fonts is supported
    await page.evaluate(async () => {
      if (document.fonts && document.fonts.ready) {
        await document.fonts.ready;
      }
    });

    // Small delay to ensure SVGs (Mermaid, math) finish layout
    await new Promise((resolve) => setTimeout(resolve, 300));

    const pdfBuffer = await page.pdf({
      format,
      landscape: Boolean(landscape),
      printBackground: true,
      margin,
      displayHeaderFooter: Boolean(displayHeaderFooter),
      headerTemplate: headerTemplate || '<div></div>',
      footerTemplate: footerTemplate || '<div style="font-size: 10px; text-align: center; width: 100%; color: #666;"><span class="pageNumber"></span> of <span class="totalPages"></span></div>',
      preferCSSPageSize: false
    });

    await browser.close();
    browser = null;

    const safeTitle = (title || 'document').replace(/[^a-zA-Z0-9_-]/g, '_');

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${safeTitle}.pdf"`);
    res.setHeader('Content-Length', pdfBuffer.length);
    res.end(pdfBuffer);
  } catch (err) {
    if (browser) {
      try {
        await browser.close();
      } catch (e) {
        // ignore
      }
    }
    console.error('[PDF Generation Error]:', err);
    res.status(500).json({ error: `PDF generation failed: ${err.message}` });
  }
});

// Serve static frontend build if present
const distPath = path.join(__dirname, '../dist');
app.use(express.static(distPath));

// Fallback for SPA routing
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  const indexPath = path.join(distPath, 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) {
      res.status(404).send('Markdown to PDF backend is running. Run `npm run dev` to launch Vite frontend.');
    }
  });
});

app.listen(PORT, () => {
  console.log(`[Server] Markdown-to-PDF server running at http://localhost:${PORT}`);
});
