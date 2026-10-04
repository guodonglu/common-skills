#!/usr/bin/env node

/**
 * TikTok Mod Downloader for LiteAPKs
 * Automatically fetches the latest ARM8 Mod APK and saves it to the target download directory.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const USER_AGENT = 'Mozilla/5.0 (Linux; Android 14; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Mobile Safari/537.36';
const REFERER = 'https://liteapks.com/';

function resolveDefaultDestDir() {
  if (process.env.DOWNLOAD_DIR) {
    return process.env.DOWNLOAD_DIR;
  }
  const userConfigFile = path.join(process.env.HOME || '', '.config', 'agent_download_dir');
  if (fs.existsSync(userConfigFile)) {
    try {
      const customPath = fs.readFileSync(userConfigFile, 'utf8').trim();
      if (customPath) return customPath;
    } catch (_) {}
  }
  return path.join(process.env.HOME || '.', 'downloads');
}

function fetchHtml(url) {
  return execSync(`curl -sL -A "${USER_AGENT}" "${url}"`, { maxBuffer: 50 * 1024 * 1024 }).toString();
}

function getDownloadToken() {
  const timeToLive = Math.floor(Date.now() / 1000) + 3600 * 3;
  return Buffer.from(Buffer.from(timeToLive.toString()).toString('base64')).toString('base64');
}

async function main() {
  const args = process.argv.slice(2);
  const targetType = args.find(a => a.startsWith('--type='))?.split('=')[1] || 'platinum'; // 'platinum' or 'private_plus'
  const destDir = args.find(a => a.startsWith('--dest='))?.split('=')[1] || resolveDefaultDestDir();

  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }

  console.log(`[1/4] Fetching latest TikTok download links from LiteAPKs...`);
  const indexHtml = fetchHtml('https://liteapks.com/download/tiktok-81');

  // Match download options
  const optionRegex = /<a[^>]+href="https:\/\/liteapks\.com\/download\/tiktok-81\/(\d+)"[^>]*>([\s\S]*?)<\/a>/gi;
  let match;
  const options = [];
  while ((match = optionRegex.exec(indexHtml)) !== null) {
    const id = match[1];
    const text = match[2].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    options.push({ id, text });
  }

  console.log(`Found ${options.length} download options on site.`);
  
  // Select option based on user request (ARM8 is required for modern 64-bit devices)
  let chosenOptionId = null;
  if (targetType.toLowerCase() === 'platinum') {
    // Prefer Platinum arm8 (typically option 1)
    const opt = options.find(o => /platinum|mod.*stable/i.test(o.text) && /arm8/i.test(o.text)) || options[0];
    chosenOptionId = opt.id;
  } else {
    // Private Plus arm8 (typically option 3)
    const opt = options.find(o => /private|plus/i.test(o.text) && /arm8/i.test(o.text)) || options[2];
    chosenOptionId = opt.id;
  }

  console.log(`[2/4] Selected option ID ${chosenOptionId}...`);
  const optionPageHtml = fetchHtml(`https://liteapks.com/download/tiktok-81/${chosenOptionId}`);

  // Extract base64 encoded link from data-link attribute
  const linkMatch = optionPageHtml.match(/data-link="([^"]+)"/);
  if (!linkMatch) {
    throw new Error('Failed to find data-link attribute on option download page.');
  }

  const rawBase64 = linkMatch[1];
  const baseUrl = Buffer.from(rawBase64, 'base64').toString('utf8');
  const filename = path.basename(baseUrl.split('?')[0]);
  const token = getDownloadToken();
  const finalDownloadUrl = `${baseUrl}?token=${encodeURIComponent(token)}`;

  const outputPath = path.join(destDir, filename);
  console.log(`[3/4] Downloading ${filename} ...`);
  console.log(`Source URL: ${baseUrl}`);
  console.log(`Target Path: ${outputPath}`);

  execSync(`curl -L -A "${USER_AGENT}" -e "${REFERER}" -o "${outputPath}" "${finalDownloadUrl}"`, { stdio: 'inherit' });

  console.log(`[4/4] Verifying APK integrity...`);
  try {
    execSync(`unzip -tq "${outputPath}"`, { stdio: 'pipe' });
    console.log(`[SUCCESS] APK integrity verified successfully!`);
    console.log(`Saved file: ${outputPath}`);
  } catch (err) {
    console.error(`[WARNING] Verification warning: ${err.message}`);
  }
}

main().catch(err => {
  console.error('[ERROR]', err.message);
  process.exit(1);
});
