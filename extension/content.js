// AlterFocus Extension - Premium AI Intervention v3.0
console.log('🧠 AlterFocus Extension v3.0 Loaded');

// -----------------------------------------------------------------------------
// 1. Detect hostname and decide if we need to block the page
// -----------------------------------------------------------------------------
const hostname = window.location.hostname;
const blockedSites = [
    'youtube.com',
    'facebook.com',
    'instagram.com',
    'tiktok.com',
    'twitter.com',
    'x.com',
    'reddit.com',
    'netflix.com',
    'web.whatsapp.com',
    'web.telegram.org',
    'discord.com',
    'messenger.com'
];
const shouldBlock = blockedSites.some(site => hostname.includes(site));

if (!shouldBlock) {
    console.log('✅ Site allowed:', hostname);
    return;
}

console.log('🚫 BLOCKING:', hostname);

// -----------------------------------------------------------------------------
// 2. Stop page load and clean the DOM IMMEDIATELY
// -----------------------------------------------------------------------------
window.stop();
if (document.documentElement) {
    document.documentElement.innerHTML = '';
}

// -----------------------------------------------------------------------------
// 3. Site metadata
// -----------------------------------------------------------------------------
const siteData = {
    'youtube.com': { name: 'YouTube', emoji: '🎥', color: '#ef4444' },
    'facebook.com': { name: 'Facebook', emoji: '📘', color: '#3b82f6' },
    'instagram.com': { name: 'Instagram', emoji: '📷', color: '#ec4899' },
    'tiktok.com': { name: 'TikTok', emoji: '🎵', color: '#000000' },
    'twitter.com': { name: 'X', emoji: '🐦', color: '#1da1f2' },
    'x.com': { name: 'X', emoji: '🐦', color: '#1da1f2' },
    'reddit.com': { name: 'Reddit', emoji: '🔴', color: '#ff4500' },
    'netflix.com': { name: 'Netflix', emoji: '🎬', color: '#e50914' }
};

const currentKey = Object.keys(siteData).find(k => hostname.includes(k)) || 'youtube.com';
const site = siteData[currentKey] || { name: hostname, emoji: '🚫', color: '#6366f1' };

// -----------------------------------------------------------------------------
// 4. Check if app is running
// -----------------------------------------------------------------------------
async function isAppRunning(url) {
    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 1500);
        const response = await fetch(url, { method: 'HEAD', signal: controller.signal });
        clearTimeout(timeout);
        return response.ok;
    } catch (_) {
        return false;
    }
}

// -----------------------------------------------------------------------------
// 5. Build and inject intervention UI
// -----------------------------------------------------------------------------
(async () => {
    // Prevent double injection
    if (window.__alterfocusInjected) {
        console.warn('⚠️ AlterFocus UI already injected – aborting');
        return;
    }
    window.__alterfocusInjected = true;

    const primaryUrl = 'http://localhost:5173';
    const fallbackUrl = 'http://localhost:5175';
    const targetUrl = (await isAppRunning(primaryUrl)) ? primaryUrl : (await isAppRunning(fallbackUrl)) ? fallbackUrl : null;

    // Clear document
    document.head.innerHTML = '';
    document.body.innerHTML = '';

    // Add styles
    const style = document.createElement('style');
    style.textContent = `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap');
        * {margin:0;padding:0;box-sizing:border-box;}
        body {
            font-family:'Inter',sans-serif;
            background:#020617;
            color:#f8fafc;
            height:100vh;
            display:flex;
            align-items:center;
            justify-content:center;
            overflow:hidden;
            position:relative;
        }
        /* Animated gradient orbs */
        body::before {
            content:'';
            position:absolute;
            top:10%;
            left:10%;
            width:600px;
            height:600px;
            background:radial-gradient(circle, rgba(99,102,241,0.3), transparent);
            animation:float 10s ease-in-out infinite;
            border-radius:50%;
            filter:blur(80px);
        }
        body::after {
            content:'';
            position:absolute;
            bottom:10%;
            right:10%;
            width:500px;
            height:500px;
            background:radial-gradient(circle, rgba(168,85,247,0.3), transparent);
            animation:float 12s ease-in-out infinite reverse;
            border-radius:50%;
            filter:blur(80px);
        }
        @keyframes float {
            0%, 100% {transform:translate(0, 0) scale(1);}
            50% {transform:translate(30px, -30px) scale(1.1);}
        }
        .card {
            background:rgba(15,23,42,0.7);
            backdrop-filter:blur(30px);
            border:1px solid rgba(255,255,255,0.1);
            border-radius:32px;
            padding:48px;
            max-width:520px;
            width:100%;
            text-align:center;
            box-shadow:0 30px 60px -12px rgba(0,0,0,0.6);
            animation:fadeIn 0.5s cubic-bezier(0.16, 1, 0.3, 1);
            position:relative;
            z-index:10;
        }
        @keyframes fadeIn {
            from{opacity:0;transform:scale(0.9) translateY(20px);}
            to{opacity:1;transform:scale(1) translateY(0);}
        }
        .icon {
            font-size:64px;
            margin-bottom:20px;
            animation:bounce 2s ease-in-out infinite;
        }
        @keyframes bounce {
            0%, 100% {transform:translateY(0);}
            50% {transform:translateY(-10px);}
        }
        h1 {
            font-size:32px;
            font-weight:800;
            margin-bottom:12px;
            background:linear-gradient(135deg,#fff,#94a3b8);
            -webkit-background-clip:text;
            -webkit-text-fill-color:transparent;
            background-clip:text;
        }
        p.context {
            font-size:15px;
            color:#94a3b8;
            margin-bottom:32px;
            line-height:1.6;
        }
        .goal {
            background:rgba(99,102,241,0.15);
            border:1px solid rgba(99,102,241,0.3);
            border-radius:16px;
            padding:16px;
            margin-bottom:32px;
        }
        .goal-label {
            font-size:11px;
            text-transform:uppercase;
            color:#94a3b8;
            letter-spacing:1px;
            margin-bottom:8px;
        }
        .goal-text {
            font-size:16px;
            font-weight:600;
            color:#fff;
        }
        button {
            background:rgba(255,255,255,0.07);
            border:1px solid rgba(255,255,255,0.15);
            color:#fff;
            padding:14px 20px;
            border-radius:14px;
            font-weight:600;
            cursor:pointer;
            transition:all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
            margin-bottom:12px;
            width:100%;
            font-size:15px;
        }
        button:hover {
            background:rgba(255,255,255,0.12);
            transform:translateY(-2px);
            box-shadow:0 8px 16px rgba(0,0,0,0.3);
        }
        button.primary {
            background:linear-gradient(135deg,#4f46e5,#7c3aed);
            border:none;
            box-shadow:0 12px 24px -8px rgba(79,70,229,0.5);
        }
        button.primary:hover {
            box-shadow:0 16px 32px -8px rgba(79,70,229,0.7);
            transform:translateY(-3px);
        }
        .footer {
            margin-top:32px;
            font-size:12px;
            color:#475569;
        }
    `;
    document.head.appendChild(style);

    // Build card
    const card = document.createElement('div');
    card.className = 'card';

    // Icon
    const iconDiv = document.createElement('div');
    iconDiv.className = 'icon';
    iconDiv.textContent = site.emoji;
    card.appendChild(iconDiv);

    // Title
    const title = document.createElement('h1');
    title.textContent = '⚠️ Distracción Bloqueada';
    card.appendChild(title);

    // Message
    const msg = document.createElement('p');
    msg.className = 'context';
    msg.innerHTML = `AlterFocus bloqueó <strong style="color:#fff;">${site.name}</strong> para proteger tu enfoque.`;
    card.appendChild(msg);

    // Goal display (try to get from localStorage)
    let userGoal = 'Mantener el enfoque';
    try {
        const stored = localStorage.getItem('dailyGoal');
        if (stored && stored.length > 2) userGoal = stored;
    } catch (e) { /* ignore */ }

    const goalDiv = document.createElement('div');
    goalDiv.className = 'goal';

    const goalLabel = document.createElement('div');
    goalLabel.className = 'goal-label';
    goalLabel.textContent = 'Tu objetivo de hoy';
    goalDiv.appendChild(goalLabel);

    const goalText = document.createElement('div');
    goalText.className = 'goal-text';
    goalText.textContent = userGoal;
    goalDiv.appendChild(goalText);

    card.appendChild(goalDiv);

    // Buttons
    if (targetUrl) {
        // Primary: Open intervention
        const btnIntervention = document.createElement('button');
        btnIntervention.className = 'primary';
        btnIntervention.textContent = '🧠 Abrir Herramientas de Enfoque';
        btnIntervention.addEventListener('click', () => {
            const interventionUrl = `${targetUrl}?blocked=true&source=${encodeURIComponent(site.name)}`;
            window.location.href = interventionUrl;
        });
        card.appendChild(btnIntervention);

        // Notify background
        chrome.runtime.sendMessage({ action: 'siteBlocked', hostname });
    } else {
        // App not running
        const errMsg = document.createElement('p');
        errMsg.className = 'context';
        errMsg.style.color = '#ef4444';
        errMsg.innerHTML = '⚠️ <strong>Error:</strong> La aplicación AlterFocus no está ejecutándose. Inicia <code>npm run dev</code> en el proyecto.';
        card.appendChild(errMsg);
    }

    // Footer
    const footer = document.createElement('div');
    footer.className = 'footer';
    footer.textContent = 'AlterFocus - Protege tu atención, transforma tu vida';
    card.appendChild(footer);

    document.body.appendChild(card);

    console.log('✅ Intervention UI injected successfully');
})();
