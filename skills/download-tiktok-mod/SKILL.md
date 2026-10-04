---
name: download-tiktok-mod
description: >-
  Use this skill whenever the user asks to download the latest TikTok mod,
  or says phrases like "下载最新版TikTok", "下载最新版TikTok mod包", "更新TikTok mod", or "下载TikTok".
  It automatically fetches the latest stable ARM8 (64-bit) TikTok mod APK from LiteAPKs,
  resolves dynamic security tokens, downloads it to the designated download directory,
  and verifies zip package integrity.
---

# Download TikTok Mod Skill

This skill automates fetching and downloading the latest modified TikTok APK (such as Platinum or Private Plus) from LiteAPKs, specifically targeting the `arm64-v8a` (ARM8 64-bit) architecture and saving it to the user's preferred download directory.

## Target Directory Configuration

The download path is dynamically resolved in the following priority order:
1. `--dest=/path/to/folder` command-line argument
2. `DOWNLOAD_DIR` environment variable
3. Local configuration file `~/.config/agent_download_dir`
4. Fallback default directory: `~/downloads`

## Quick Execution

Execute the bundled helper script to handle link resolution, token generation, downloading, and integrity checking in a single step:

```bash
# Recommended default (Platinum ARM8 version):
node scripts/download_tiktok.js --type=platinum

# If user specifically asks for Private Plus:
node scripts/download_tiktok.js --type=private_plus

# Custom download destination (optional):
node scripts/download_tiktok.js --type=platinum --dest=/path/to/download
```

If installed globally in `~/.agents/skills/download-tiktok-mod/`:
```bash
node ~/.agents/skills/download-tiktok-mod/scripts/download_tiktok.js --type=platinum
```

## Manual Workflow (If Helper Script Needs Fallback)

1. **Query Download Options**:
   Fetch `https://liteapks.com/download/tiktok-81` to locate the latest ARM8 download options.
   - Option 1 is typically `TikTok_Platinum_v..._(MOD)_arm8.apk` (Recommended, lightweight).
   - Option 3 is typically `TikTok_Private_Plus_v..._(MOD)_arm8.apk` (Full bundle).

2. **Extract Base64 Link**:
   Fetch `https://liteapks.com/download/tiktok-81/<option_id>` and extract the `data-link="..."` attribute on the `#download` element. Base64 decode this attribute to obtain the direct CDN base URL.

3. **Generate Security Token**:
   LiteAPKs requires a double-base64 encoded Unix timestamp token with a 3-hour TTL:
   ```javascript
   const timeToLive = Math.floor(Date.now() / 1000) + 3600 * 3;
   const token = Buffer.from(Buffer.from(timeToLive.toString()).toString('base64')).toString('base64');
   const downloadUrl = `${baseUrl}?token=${encodeURIComponent(token)}`;
   ```

4. **Download File**:
   Use `curl` with a mobile User-Agent and Referer:
   ```bash
   curl -L -A "Mozilla/5.0 (Linux; Android 14; Mobile) AppleWebKit/537.36" \
        -e "https://liteapks.com/" \
        -o "${DEST_DIR}/<filename>.apk" \
        "<downloadUrl>"
   ```

5. **Verify File Integrity**:
   Run `unzip -tq "${DEST_DIR}/<filename>.apk"` to confirm the archive has no corrupted parts.
