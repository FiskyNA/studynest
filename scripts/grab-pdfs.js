const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Load env vars
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing Supabase env vars. Make sure .env.local has NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or NEXT_PUBLIC_SUPABASE_ANON_KEY)');
  process.exit(1);
}

const COURSE_URL = 'https://nexttoppers.com/private/course/aarambh-10th-batch-26-27-176?from=my-course';

async function createNote(title, pdfUrl, subject, userId) {
  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const res = await fetch(`${SUPABASE_URL}/rest/v1/notes`, {
    method: 'POST',
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=minimal',
    },
    body: JSON.stringify({
      user_id: userId,
      title: title,
      content: `<p><a href="${pdfUrl}" target="_blank">Open PDF: ${title}</a></p>`,
      pdf_url: pdfUrl,
      tags: [subject.toLowerCase()],
      folder_id: null,
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    console.error(`  Failed to create "${title}": ${err}`);
    return false;
  }
  return true;
}

async function createFolder(name, userId) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/folders`, {
    method: 'POST',
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation',
    },
    body: JSON.stringify({
      user_id: userId,
      name: name,
      color: '#4c6ef5',
    }),
  });
  if (res.ok) {
    const data = await res.json();
    return data[0]?.id || null;
  }
  return null;
}

async function getUserId(email) {
  // We'll get the user ID after login by querying profiles
  // For now, we'll use the auth token from the browser session
  return null;
}

function extractSubject(title) {
  const lower = title.toLowerCase();
  if (lower.includes('life process')) return 'Science - Life Processes';
  if (lower.includes('chemical reaction')) return 'Science - Chemical Reactions';
  if (lower.includes('acid') || lower.includes('base') || lower.includes('salt')) return 'Science - Acids Bases Salts';
  if (lower.includes('metal') || lower.includes('non metal')) return 'Science - Metals Non-metals';
  if (lower.includes('carbon') || lower.includes('compound')) return 'Science - Carbon Compounds';
  if (lower.includes('light') || lower.includes('reflection') || lower.includes('refraction')) return 'Science - Light';
  if (lower.includes('electric') || lower.includes('circuit') || lower.includes('current')) return 'Science - Electricity';
  if (lower.includes('magnetic') || lower.includes('magnet')) return 'Science - Magnetic Effects';
  if (lower.includes('coordinate') || lower.includes('geometry')) return 'Math - Coordinate Geometry';
  if (lower.includes('quadratic')) return 'Math - Quadratic Equations';
  if (lower.includes('arithmetic') || lower.includes('progression')) return 'Math - Arithmetic Progressions';
  if (lower.includes('triangle') || lower.includes('trigonometry')) return 'Math - Triangles';
  if (lower.includes('circle')) return 'Math - Circles';
  if (lower.includes('area') || lower.includes('volume')) return 'Math - Surface Areas Volumes';
  if (lower.includes('statistic') || lower.includes('probability')) return 'Math - Statistics Probability';
  if (lower.includes('number')) return 'Math - Number Systems';
  if (lower.includes('polynomial')) return 'Math - Polynomials';
  if (lower.includes('pair') || lower.includes('linear')) return 'Math - Pair of Linear Equations';
  if (lower.includes('surface') || lower.includes('solid')) return 'Math - Surface Areas Volumes';
  if (lower.includes('chapter') || lower.includes('lecture')) return 'Study Material';
  return 'Study Material';
}

async function main() {
  console.log('Starting Next Toppers PDF scraper...\n');

  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
    args: ['--start-maximized'],
  });

  const page = await browser.newPage();

  // Collect PDF URLs from network requests
  const pdfUrls = new Map(); // url -> title

  page.on('response', async (response) => {
    const url = response.url();
    if (url.includes('.pdf') && url.includes('cloudfront.net')) {
      if (!pdfUrls.has(url)) {
        pdfUrls.set(url, null); // title will be filled later
        console.log(`  Found PDF: ${url.substring(0, 80)}...`);
      }
    }
  });

  console.log('1. Opening Next Toppers login page...');
  console.log('   Please log in manually in the browser window.\n');
  await page.goto('https://nexttoppers.com/login', { waitUntil: 'networkidle2' });

  // Wait for user to log in - detect navigation away from login
  console.log('   Waiting for you to log in...');
  await page.waitForFunction(
    () => !window.location.href.includes('/login'),
    { timeout: 300000 } // 5 minutes to log in
  );
  console.log('   Login detected!\n');

  console.log('2. Navigating to course page...');
  await page.goto(COURSE_URL, { waitUntil: 'networkidle2', timeout: 60000 });
  await page.waitForTimeout(3000);

  console.log('3. Scanning for PDF links...\n');

  // Scroll through the entire page to trigger lazy loading
  let previousHeight = 0;
  for (let i = 0; i < 20; i++) {
    const currentHeight = await page.evaluate(() => document.body.scrollHeight);
    if (currentHeight === previousHeight) break;
    previousHeight = currentHeight;
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1500);
  }

  // Now click all "View" buttons to trigger PDF loads
  console.log('   Clicking View buttons to capture PDF URLs...\n');

  const viewButtons = await page.$$('button, a');
  const viewBtnTexts = [];

  for (const btn of viewButtons) {
    const text = await page.evaluate(el => el.textContent.trim(), btn);
    if (text === 'View') {
      viewBtnTexts.push(btn);
    }
  }

  console.log(`   Found ${viewBtnTexts.length} View buttons\n`);

  for (let i = 0; i < viewBtnTexts.length; i++) {
    const btn = viewBtnTexts[i];

    // Get the lesson title (look for nearby text)
    const lessonTitle = await page.evaluate((el) => {
      // Look for text content near the button
      const parent = el.closest('[class]');
      if (parent) {
        const texts = parent.textContent.split('\n').map(t => t.trim()).filter(t => t && t !== 'View' && t !== 'Share' && !t.includes('Next') && !t.includes('Toppers'));
        return texts[0] || 'Untitled';
      }
      return 'Untitled';
    }, btn);

    console.log(`   [${i + 1}/${viewBtnTexts.length}] ${lessonTitle}`);

    // Click View in a new tab
    const newPage = await browser.newPage();

    // Listen for PDF URLs in the new tab
    newPage.on('response', async (response) => {
      const url = response.url();
      if (url.includes('.pdf') && url.includes('cloudfront.net')) {
        if (!pdfUrls.has(url)) {
          pdfUrls.set(url, lessonTitle);
          console.log(`     -> PDF URL captured`);
        } else {
          // Update title if we have it
          if (!pdfUrls.get(url)) pdfUrls.set(url, lessonTitle);
        }
      }
    });

    try {
      // Click the View button - it might open in a new tab
      const [newTab] = await Promise.all([
        new Promise(resolve => {
          browser.once('targetcreated', async target => {
            const page = await target.page();
            resolve(page);
          });
          // Fallback timeout
          setTimeout(() => resolve(null), 5000);
        }),
        btn.click(),
      ]);

      if (newTab) {
        await newTab.waitForTimeout(5000);
        const newUrl = newTab.url();
        if (newUrl.includes('.pdf') || newUrl.includes('cloudfront.net')) {
          pdfUrls.set(newUrl, lessonTitle);
        }
        await newTab.close();
      } else {
        await newPage.waitForTimeout(3000);
        const newPageUrl = newPage.url();
        if (newPageUrl.includes('.pdf') || newPageUrl.includes('cloudfront.net')) {
          pdfUrls.set(newPageUrl, lessonTitle);
        }
      }
    } catch (e) {
      // Some buttons might not work, skip them
    }

    await newPage.close().catch(() => {});
  }

  // Also check the current page for any PDF links
  const pagePdfLinks = await page.evaluate(() => {
    const links = Array.from(document.querySelectorAll('a[href*=".pdf"], iframe[src*=".pdf"]'));
    return links.map(l => l.href || l.src).filter(Boolean);
  });

  for (const url of pagePdfLinks) {
    if (url.includes('cloudfront.net') && !pdfUrls.has(url)) {
      pdfUrls.set(url, 'PDF Document');
    }
  }

  console.log(`\n4. Found ${pdfUrls.size} PDF URLs total\n`);

  if (pdfUrls.size === 0) {
    console.log('No PDFs found. The page structure might have changed.');
    console.log('Try manually clicking a View button and check if PDFs load.');
    await browser.close();
    return;
  }

  // Get user ID from Supabase
  console.log('5. Getting user account...');

  // We need to find the user. Let's try querying profiles
  const profilesRes = await fetch(`${SUPABASE_URL}/rest/v1/profiles?select=id&limit=1`, {
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
    },
  });

  let userId = null;
  if (profilesRes.ok) {
    const profiles = await profilesRes.json();
    if (profiles.length > 0) {
      userId = profiles[0].id;
    }
  }

  if (!userId) {
    console.error('Could not find user profile. Please make sure you have signed up for StudyNest first.');
    await browser.close();
    return;
  }

  console.log(`   User ID: ${userId}\n`);

  // Create "Next Toppers" folder
  console.log('6. Creating "Next Toppers" folder...');
  const folderId = await createFolder('Next Toppers', userId);
  console.log(`   Folder created: ${folderId ? 'Yes' : 'Failed'}\n`);

  // Create notes for each PDF
  console.log('7. Creating notes in StudyNest...\n');

  let created = 0;
  let failed = 0;

  for (const [url, title] of pdfUrls) {
    const subject = extractSubject(title);
    const success = await createNote(title, url, subject, userId);
    if (success) {
      created++;
      console.log(`   ✓ ${title}`);
    } else {
      failed++;
      console.log(`   ✗ ${title}`);
    }
  }

  console.log(`\n8. Done!`);
  console.log(`   Created: ${created} notes`);
  console.log(`   Failed: ${failed}`);
  console.log(`\n   Go to StudyNest Notes to see your PDFs!`);

  await browser.close();
}

main().catch(console.error);
