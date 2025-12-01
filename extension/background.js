// AlterFocus Background Service Worker - Enhanced with webNavigation
console.log('✅ AlterFocus Background Worker Started');

// List of blocked sites
const BLOCKED_SITES = [
    'youtube.com',
    'facebook.com',
    'instagram.com',
    'tiktok.com',
    'twitter.com',
    'x.com',
    'reddit.com',
    'netflix.com',
    'twitch.tv',
    'discord.com',
    'web.whatsapp.com',
    'web.telegram.org',
    'messenger.com'
];

// Initialize storage on install
chrome.runtime.onInstalled.addListener(() => {
    console.log('📦 Extension installed/updated');

    chrome.storage.local.set({
        isActive: true,
        blockedToday: 0,
        savedMinutes: 0,
        lastResetDate: new Date().toDateString(),
        blockedSites: BLOCKED_SITES
    }, () => {
        console.log('💾 Initial storage set');
        console.log('🚫 Blocking sites:', BLOCKED_SITES);
    });
});

// Listen for tab navigation to block BEFORE page loads
chrome.webNavigation.onBeforeNavigate.addListener((details) => {
    // Only process main frame navigations (not iframes)
    if (details.frameId !== 0) return;

    const url = new URL(details.url);
    const hostname = url.hostname;

    console.log('🔍 Checking URL:', hostname);

    const shouldBlock = BLOCKED_SITES.some(site => hostname.includes(site));
    if (shouldBlock) {
        console.log('🔴 BLOCKING:', hostname);
        const appUrl = 'http://localhost:5175';
        const interventionUrl = `${appUrl}/?from=intervention&blocked=true&source=${encodeURIComponent(hostname)}`;
        console.log('🔴 Redirecting to:', interventionUrl);
        chrome.tabs.update(details.tabId, { url: interventionUrl });
        // Update stats
        updateBlockStats(hostname);
    }
});

// Update block statistics
function updateBlockStats(hostname) {
    chrome.storage.local.get(['blockedToday', 'savedMinutes'], (result) => {
        const newBlocked = (result.blockedToday || 0) + 1;
        const newMinutes = (result.savedMinutes || 0) + 5;

        chrome.storage.local.set({
            blockedToday: newBlocked,
            savedMinutes: newMinutes
        }, () => {
            console.log(`📊 Stats updated: ${newBlocked} blocked, ${newMinutes}min saved`);

            // Update badge to show blocked count
            chrome.action.setBadgeText({ text: newBlocked.toString() });
            chrome.action.setBadgeBackgroundColor({ color: '#ef4444' });
        });
    });
}

// Listen for messages from content script and popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('📨 Message received:', request);

    if (request.action === 'siteBlocked') {
        console.log('🚫 Site blocked via content script:', request.hostname);
        updateBlockStats(request.hostname);
    }

    if (request.action === 'getStats') {
        chrome.storage.local.get(['blockedToday', 'savedMinutes', 'isActive'], (result) => {
            sendResponse(result);
        });
        return true; // Keep channel open for async response
    }

    if (request.action === 'toggleActive') {
        chrome.storage.local.get(['isActive'], (result) => {
            const newState = !result.isActive;
            chrome.storage.local.set({ isActive: newState }, () => {
                console.log('🔄 Extension active state:', newState);
                sendResponse({ isActive: newState });
            });
        });
        return true;
    }

    return true;
});

// Daily reset check
function checkDailyReset() {
    chrome.storage.local.get(['lastResetDate'], (result) => {
        const today = new Date().toDateString();
        if (result.lastResetDate !== today) {
            console.log('🔄 Daily reset triggered');
            chrome.storage.local.set({
                blockedToday: 0,
                savedMinutes: 0,
                lastResetDate: today
            }, () => {
                // Reset badge
                chrome.action.setBadgeText({ text: '0' });
            });
        }
    });
}

// Run reset check on startup
checkDailyReset();

// Check every hour
setInterval(checkDailyReset, 60 * 60 * 1000);

// Initialize badge on startup
chrome.storage.local.get(['blockedToday'], (result) => {
    const count = result.blockedToday || 0;
    chrome.action.setBadgeText({ text: count.toString() });
    chrome.action.setBadgeBackgroundColor({ color: '#ef4444' });
});

console.log('🎯 Background worker ready - webNavigation blocking enabled');
