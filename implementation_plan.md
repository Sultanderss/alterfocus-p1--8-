# Implementation Plan - Chrome Extension Integration

## Goal Description
Implement a "real" Chrome Extension companion for AlterFocus that performs actual website blocking and redirection. This fulfills the user's request to move beyond simulation and have the application interact with the browser environment to block distractions (e.g., YouTube, social media) and redirect to the intervention flow.

## User Review Required
> [!IMPORTANT]
> **Browser Installation Required:** The user will need to manually load the extension in Chrome via `chrome://extensions` (Developer Mode) -> "Load unpacked" and select the `extension` folder. This cannot be automated by the agent.

> [!NOTE]
> **MVP Scope:** The extension will initially block a hardcoded list of distraction sites (YouTube, Facebook, TikTok, Instagram, Twitter/X) and redirect to `http://localhost:5173`. In production, this URL would be the deployed app URL.

## Proposed Changes

### 1. New Directory Structure
Create a new `extension/` directory in the project root to house the Chrome Extension files.

### 2. Extension Files

#### [NEW] [manifest.json](file:///c:/Users/U%20S%20U%20A%20R%20I%20O/Downloads/alterfocus-p1%20(8)/extension/manifest.json)
- Manifest V3 configuration.
- Permissions: `storage`, `activeTab`, `scripting`.
- Host Permissions: `*://*.youtube.com/*`, `*://*.facebook.com/*`, `*://*.instagram.com/*`, `*://*.tiktok.com/*`, `*://*.twitter.com/*`, `*://*.x.com/*`.

#### [NEW] [content.js](file:///c:/Users/U%20S%20U%20A%20R%20I%20O/Downloads/alterfocus-p1%20(8)/extension/content.js)
- Runs on `document_start`.
- Checks `chrome.storage.local` for blocking status (is session active?).
- If active and site is blacklisted -> Redirects to `http://localhost:5173/intervention?url=[BLOCKED_URL]`.

#### [NEW] [background.js](file:///c:/Users/U%20S%20U%20A%20R%20I%20O/Downloads/alterfocus-p1%20(8)/extension/background.js)
- Initializes default settings on install.
- Listen for messages from WebApp (optional for advanced sync).

#### [NEW] [popup.html](file:///c:/Users/U%20S%20U%20A%20R%20I%20O/Downloads/alterfocus-p1%20(8)/extension/popup.html) & [popup.js](file:///c:/Users/U%20S%20U%20A%20R%20I%20O/Downloads/alterfocus-p1%20(8)/extension/popup.js)
- Simple UI to see if AlterFocus is "Active" or "Inactive".

### 3. WebApp Integration

#### [MODIFY] [App.tsx](file:///c:/Users/U%20S%20U%20A%20R%20I%20O/Downloads/alterfocus-p1%20(8)/App.tsx)
- Add logic in `useEffect` to check for URL query parameters (e.g., `?blocked=true&url=...`).
- If detected, immediately trigger the `InterventionMultimodal` flow with the specific context.

## Verification Plan

### Manual Verification
1. **Build Extension:** Create files.
2. **Load Extension:** User loads `extension/` folder in Chrome.
3. **Test Blocking:**
   - Open YouTube.
   - Verify immediate redirection to localhost WebApp.
   - Verify WebApp shows intervention screen ("¿Qué te está frenando?").
4. **Test Flow:**
   - Complete intervention (e.g., Breathing).
   - Verify user can "return" (in this MVP, return means just unblocking temporarily or acknowledging).

### Automated Tests
- None for the extension itself (requires browser driver).
- WebApp logic for URL parsing can be verified via console logs.
