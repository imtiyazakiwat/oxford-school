const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

const url = 'https://www.justdial.com/Bijapur-Karnataka/New Oxford Coaching Classes-Group-Of-Institutions-Horti-Near-Nh-52-Horti/9999P8352-8352-240315123854-I5P3_BZDET/gallery?tab=all';

const outputDir = './public/img/scrap';

async function downloadImage(imageUrl, filename) {
  return new Promise((resolve, reject) => {
    const protocol = imageUrl.startsWith('https') ? https : http;
    const file = fs.createWriteStream(filename);

    protocol.get(imageUrl, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        downloadImage(response.headers.location, filename).then(resolve).catch(reject);
        return;
      }
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(filename, () => { });
      reject(err);
    });
  });
}

async function scrapeImages() {
  console.log('Launching browser...');
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();

  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');

  console.log('Navigating to gallery page...');
  await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

  // Wait for images to load
  await page.waitForSelector('img', { timeout: 10000 }).catch(() => { });

  // Scroll to load more images
  await page.evaluate(async () => {
    for (let i = 0; i < 5; i++) {
      window.scrollBy(0, 500);
      await new Promise(r => setTimeout(r, 500));
    }
  });

  // Get all image URLs
  const imageUrls = await page.evaluate(() => {
    const imgs = document.querySelectorAll('img');
    return Array.from(imgs)
      .map(img => img.src || img.dataset.src)
      .filter(src => src && !src.includes('data:') && !src.includes('svg') &&
        (src.includes('justdial') || src.includes('jd') || src.includes('akam')));
  });

  console.log(`Found ${imageUrls.length} images`);

  // Create output directory
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Download each image
  for (let i = 0; i < imageUrls.length; i++) {
    const imageUrl = imageUrls[i];
    const ext = path.extname(new URL(imageUrl).pathname) || '.jpg';
    const filename = path.join(outputDir, `image_${i + 1}${ext}`);

    try {
      console.log(`Downloading ${i + 1}/${imageUrls.length}: ${imageUrl.substring(0, 60)}...`);
      await downloadImage(imageUrl, filename);
      console.log(`  Saved: ${filename}`);
    } catch (err) {
      console.error(`  Failed: ${err.message}`);
    }
  }

  await browser.close();
  console.log('Done!');
}

scrapeImages().catch(console.error);
