// AlterFocus Background Service Worker v2.1 - Synced with WebApp
console.log('✅ AlterFocus Background Worker v2.1 Started');

// Default blocked sites with categories
const DEFAULT_BLOCKED_SITES = {
    'youtube.com': { name: 'YouTube', category: 'video', avgTime: 15 },
    'facebook.com': { name: 'Facebook', category: 'social', avgTime: 10 },
    'instagram.com': { name: 'Instagram', category: 'social', avgTime: 8 },
    'tiktok.com': { name: 'TikTok', category: 'video', avgTime: 20 },
    'twitter.com': { name: 'Twitter', category: 'social', avgTime: 12 },
    'x.com': { name: 'X', category: 'social', avgTime: 12 },
    'reddit.com': { name: 'Reddit', category: 'forum', avgTime: 15 },
    'netflix.com': { name: 'Netflix', category: 'streaming', avgTime: 45 },
    'twitch.tv': { name: 'Twitch', category: 'streaming', avgTime: 30 },
    'discord.com': { name: 'Discord', category: 'chat', avgTime: 10 },
    'web.whatsapp.com': { name: 'WhatsApp Web', category: 'chat', avgTime: 5 },
    'web.telegram.org': { name: 'Telegram Web', category: 'chat', avgTime: 5 },
    'messenger.com': { name: 'Messenger', category: 'chat', avgTime: 5 },
    'snapchat.com': { name: 'Snapchat', category: 'social', avgTime: 10 }
};

// User-customized blocked sites (synced with webapp)
let customBlockedApps = [];

// Merge default and custom blocked sites
function getBlockedSites() {
    const sites = { ...DEFAULT_BLOCKED_SITES };

    // Add custom apps from webapp
    customBlockedApps.forEach(appName => {
        const domain = appName.toLowerCase().replace(/\s+/g, '') + '.com';
        if (!sites[domain]) {
            sites[domain] = { name: appName, category: 'custom', avgTime: 10 };
        }
    });

    return sites;
}

// State
let state = {
    isActive: true,
    isPaused: false,
    pauseUntil: null,
    blockedToday: 0,
    savedMinutes: 0,
    streakDays: 0,
    totalPoints: 0,
    lastResetDate: new Date().toDateString(),
    interventionMode: 'gentle',
    blockHistory: [],
    dailyGoal: 5,
    mostBlockedSite: null,
    customBlockedApps: []
};

// Initialize storage on install
chrome.runtime.onInstalled.addListener(() => {
    console.log('📦 Extension installed/updated');

    chrome.storage.local.get(null, (stored) => {
        state = { ...state, ...stored };
        state.lastResetDate = state.lastResetDate || new Date().toDateString();
        customBlockedApps = state.customBlockedApps || [];

        chrome.storage.local.set(state, () => {
            console.log('💾 State initialized:', state);
        });
    });

    // Try to sync with webapp on install
    syncWithWebApp();
});

// Sync with webapp
async function syncWithWebApp() {
    try {
        // Try to fetch blocked apps from localStorage via the webapp
        const response = await fetch('http://localhost:5174/api/blocked-apps');
        if (response.ok) {
            const data = await response.json();
            if (data.apps) {
                customBlockedApps = data.apps;
                state.customBlockedApps = data.apps;
                chrome.storage.local.set({ customBlockedApps: data.apps });
                console.log('🔄 Synced blocked apps from webapp:', data.apps);
            }
        }
    } catch (e) {
        console.log('ℹ️ Could not sync with webapp (offline mode)');
    }
}

// Load state on startup
chrome.storage.local.get(null, (stored) => {
    state = { ...state, ...stored };
    customBlockedApps = state.customBlockedApps || [];
    updateBadge();
    console.log('📦 State loaded:', state);
});

// Check if should block
function shouldBlock(hostname) {
    // Check if paused
    if (state.isPaused && state.pauseUntil) {
        if (Date.now() < state.pauseUntil) {
            console.log('⏸️ Blocking paused until:', new Date(state.pauseUntil));
            return false;
        } else {
            // Pause expired
            state.isPaused = false;
            state.pauseUntil = null;
            chrome.storage.local.set({ isPaused: false, pauseUntil: null });
        }
    }

    if (!state.isActive) return false;

    const blockedSites = getBlockedSites();
    return Object.keys(blockedSites).some(site => hostname.includes(site));
}

// Get site info
function getSiteInfo(hostname) {
    const blockedSites = getBlockedSites();
    for (const [domain, info] of Object.entries(blockedSites)) {
        if (hostname.includes(domain)) {
            return { domain, ...info };
        }
    }
    return null;
}

// Listen for tab navigation to block BEFORE page loads
chrome.webNavigation.onBeforeNavigate.addListener((details) => {
    // Only process main frame navigations
    if (details.frameId !== 0) return;

    try {
        const url = new URL(details.url);
        const hostname = url.hostname;

        console.log('🔍 Checking URL:', hostname);

        if (shouldBlock(hostname)) {
            const siteInfo = getSiteInfo(hostname);
            console.log('🔴 BLOCKING:', hostname, siteInfo);

            // Determine intervention URL based on mode and history
            const interventionLevel = calculateInterventionLevel();
            const appUrl = 'http://localhost:5174';
            const params = new URLSearchParams({
                from: 'intervention',
                source: encodeURIComponent(hostname),
                site: siteInfo?.name || hostname,
                level: interventionLevel,
                attempt: (state.blockedToday + 1).toString()
            });

            const interventionUrl = `${appUrl}/?${params.toString()}`;
            console.log('🔴 Redirecting to:', interventionUrl);

            chrome.tabs.update(details.tabId, { url: interventionUrl });
            updateBlockStats(hostname, siteInfo);
        }
    } catch (e) {
        console.error('Error processing URL:', e);
    }
});

// Calculate intervention level based on history
function calculateInterventionLevel() {
    const today = new Date().toDateString();
    const todayBlocks = state.blockHistory.filter(b =>
        new Date(b.timestamp).toDateString() === today
    ).length;

    if (todayBlocks >= 10) return 'blocked';
    if (todayBlocks >= 5) return 'strict';
    if (todayBlocks >= 2) return 'moderate';
    return 'gentle';
}

// Update block statistics
function updateBlockStats(hostname, siteInfo) {
    const now = new Date();

    // Add to history
    state.blockHistory.push({
        hostname,
        site: siteInfo?.name || hostname,
        category: siteInfo?.category || 'unknown',
        timestamp: now.toISOString()
    });

    // Keep only last 100 entries
    if (state.blockHistory.length > 100) {
        state.blockHistory = state.blockHistory.slice(-100);
    }

    // Calculate saved time
    const avgTime = siteInfo?.avgTime || 5;
    state.blockedToday += 1;
    state.savedMinutes += avgTime;

    // Update most blocked site
    const siteCounts = {};
    state.blockHistory.forEach(b => {
        siteCounts[b.site] = (siteCounts[b.site] || 0) + 1;
    });
    state.mostBlockedSite = Object.entries(siteCounts).sort((a, b) => b[1] - a[1])[0]?.[0];

    // Calculate points
    const pointsEarned = calculatePoints();
    state.totalPoints += pointsEarned;

    chrome.storage.local.set({
        blockedToday: state.blockedToday,
        savedMinutes: state.savedMinutes,
        totalPoints: state.totalPoints,
        blockHistory: state.blockHistory,
        mostBlockedSite: state.mostBlockedSite
    }, () => {
        console.log(`📊 Stats: ${state.blockedToday} blocked, ${state.savedMinutes}min saved, ${state.totalPoints} points`);
        updateBadge();
    });
}

// Calculate points for blocking
function calculatePoints() {
    let points = 5; // Base points

    // Bonus for streak
    if (state.streakDays >= 7) points += 3;
    else if (state.streakDays >= 3) points += 1;

    // Bonus for intervention level (harder = more points)
    const level = calculateInterventionLevel();
    if (level === 'strict') points += 5;
    else if (level === 'moderate') points += 2;

    return points;
}

// Update badge
function updateBadge() {
    const count = state.blockedToday || 0;
    chrome.action.setBadgeText({ text: count > 0 ? count.toString() : '' });

    // Color based on count
    let color = '#22c55e'; // Green
    if (count >= 10) color = '#ef4444'; // Red
    else if (count >= 5) color = '#f59e0b'; // Orange

    chrome.action.setBadgeBackgroundColor({ color });
}

// Listen for messages
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('📨 Message received:', request);

    switch (request.action) {
        case 'getStats':
            sendResponse({
                ...state,
                interventionLevel: calculateInterventionLevel()
            });
            break;

        case 'toggleActive':
            state.isActive = !state.isActive;
            chrome.storage.local.set({ isActive: state.isActive }, () => {
                console.log('🔄 Active state:', state.isActive);
                updateBadge();
                sendResponse({ isActive: state.isActive });
            });
            return true;

        case 'pauseFor':
            const minutes = request.minutes || 5;
            state.isPaused = true;
            state.pauseUntil = Date.now() + (minutes * 60 * 1000);
            chrome.storage.local.set({
                isPaused: true,
                pauseUntil: state.pauseUntil
            }, () => {
                console.log(`⏸️ Paused for ${minutes} minutes`);
                sendResponse({
                    isPaused: true,
                    pauseUntil: state.pauseUntil,
                    minutes
                });

                // Auto-resume after pause
                setTimeout(() => {
                    if (state.pauseUntil && Date.now() >= state.pauseUntil) {
                        state.isPaused = false;
                        state.pauseUntil = null;
                        chrome.storage.local.set({ isPaused: false, pauseUntil: null });
                        console.log('▶️ Pause ended, resuming protection');
                    }
                }, minutes * 60 * 1000);
            });
            return true;

        case 'getBlockHistory':
            sendResponse({ history: state.blockHistory });
            break;

        case 'syncWithApp':
            // Sync with main app - receive blocked apps list
            if (request.blockedApps) {
                customBlockedApps = request.blockedApps;
                state.customBlockedApps = request.blockedApps;
                chrome.storage.local.set({ customBlockedApps: request.blockedApps });
                console.log('🔄 Synced blocked apps:', request.blockedApps);
            }
            sendResponse({ synced: true, state, blockedSites: Object.keys(getBlockedSites()) });
            break;

        case 'updateBlockedApps':
            // Update custom blocked apps from webapp
            customBlockedApps = request.apps || [];
            state.customBlockedApps = customBlockedApps;
            chrome.storage.local.set({ customBlockedApps }, () => {
                console.log('📱 Updated blocked apps:', customBlockedApps);
                sendResponse({ success: true, blockedApps: customBlockedApps });
            });
            return true;

        case 'getBlockedApps':
            sendResponse({
                defaultApps: Object.keys(DEFAULT_BLOCKED_SITES).map(d => DEFAULT_BLOCKED_SITES[d].name),
                customApps: customBlockedApps,
                allSites: Object.keys(getBlockedSites())
            });
            break;

        case 'updateStreak':
            state.streakDays = request.streak || 0;
            chrome.storage.local.set({ streakDays: state.streakDays });
            sendResponse({ streakDays: state.streakDays });
            break;

        case 'resetStats':
            state.blockedToday = 0;
            state.savedMinutes = 0;
            state.blockHistory = [];
            chrome.storage.local.set({
                blockedToday: 0,
                savedMinutes: 0,
                blockHistory: []
            }, () => {
                updateBadge();
                sendResponse({ reset: true });
            });
            return true;

        default:
            sendResponse({ error: 'Unknown action' });
    }

    return true;
});

// Daily reset check
function checkDailyReset() {
    const today = new Date().toDateString();

    if (state.lastResetDate !== today) {
        console.log('🔄 Daily reset triggered');

        // Check if yesterday was also active (for streak)
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const wasActiveYesterday = state.blockHistory.some(b =>
            new Date(b.timestamp).toDateString() === yesterday.toDateString()
        );

        if (wasActiveYesterday) {
            state.streakDays += 1;
        } else {
            state.streakDays = 0;
        }

        state.blockedToday = 0;
        state.savedMinutes = 0;
        state.lastResetDate = today;

        chrome.storage.local.set({
            blockedToday: 0,
            savedMinutes: 0,
            lastResetDate: today,
            streakDays: state.streakDays
        }, () => {
            updateBadge();
            console.log(`📅 New day! Streak: ${state.streakDays}`);
        });
    }
}

// Run reset check on startup
checkDailyReset();

// Check every hour
setInterval(checkDailyReset, 60 * 60 * 1000);

// Initialize badge
updateBadge();

console.log('🎯 Background worker v2.0 ready - Enhanced blocking enabled');
