// AlterFocus Popup Script v2.0 - Enhanced UI
document.addEventListener('DOMContentLoaded', () => {
    const toggleBtn = document.getElementById('toggleBtn');
    const statusText = document.getElementById('statusText');
    const statusDot = document.getElementById('statusDot');
    const blockedCount = document.getElementById('blockedCount');
    const savedTime = document.getElementById('savedTime');
    const streakDays = document.getElementById('streakDays');
    const totalPoints = document.getElementById('totalPoints');
    const openDashboardBtn = document.getElementById('openDashboard');
    const focusBtn = document.getElementById('focusBtn');
    const breakBtn = document.getElementById('breakBtn');
    const statsBtn = document.getElementById('statsBtn');
    const settingsBtn = document.getElementById('settingsBtn');

    // Animation helper
    function animateValue(element, start, end, duration = 300) {
        const range = end - start;
        const startTime = performance.now();

        function update(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easeOut = 1 - Math.pow(1 - progress, 3);
            const current = Math.round(start + range * easeOut);
            element.textContent = current;

            if (progress < 1) {
                requestAnimationFrame(update);
            }
        }
        requestAnimationFrame(update);
    }

    // Load stats
    function loadStats() {
        chrome.runtime.sendMessage({ action: 'getStats' }, (response) => {
            if (response) {
                // Animate blocked count
                const blocked = response.blockedToday || 0;
                const currentBlocked = parseInt(blockedCount.textContent) || 0;
                if (blocked !== currentBlocked) {
                    animateValue(blockedCount, currentBlocked, blocked);
                }

                // Format and display saved time
                const minutes = response.savedMinutes || 0;
                if (minutes >= 60) {
                    const hours = Math.floor(minutes / 60);
                    const mins = minutes % 60;
                    savedTime.textContent = `${hours}h ${mins}m`;
                } else {
                    savedTime.textContent = `${minutes}m`;
                }

                // Streak days (from localStorage sync)
                const streak = response.streakDays || 0;
                streakDays.textContent = streak;

                // Total points
                const points = response.totalPoints || 0;
                totalPoints.textContent = points;

                // Update toggle state
                const isActive = response.isActive !== false;
                updateToggleState(isActive);
            }
        });
    }

    // Update toggle visual state
    function updateToggleState(isActive) {
        toggleBtn.classList.toggle('active', isActive);
        statusText.textContent = isActive ? 'Activo' : 'Pausado';
        statusDot.classList.toggle('active', isActive);
        statusDot.classList.toggle('inactive', !isActive);
    }

    // Toggle active state
    toggleBtn.addEventListener('click', () => {
        // Add click animation
        toggleBtn.style.transform = 'scale(0.95)';
        setTimeout(() => toggleBtn.style.transform = '', 100);

        chrome.runtime.sendMessage({ action: 'toggleActive' }, (response) => {
            if (response) {
                updateToggleState(response.isActive);

                // Show notification
                showNotification(response.isActive ? '🛡️ Escudo activado' : '⚠️ Escudo pausado');
            }
        });
    });

    // Quick action: Focus Mode
    focusBtn.addEventListener('click', () => {
        chrome.tabs.create({ url: 'http://localhost:5174/?view=FLIP_PHONE_MODE' });
    });

    // Quick action: Break (pause for 5 minutes)
    breakBtn.addEventListener('click', () => {
        chrome.runtime.sendMessage({ action: 'pauseFor', minutes: 5 }, (response) => {
            showNotification('☕ Pausa de 5 minutos activada');
            // Temporarily update UI
            updateToggleState(false);
            statusText.textContent = 'Pausa 5m';
        });
    });

    // Quick action: Stats
    statsBtn.addEventListener('click', () => {
        chrome.tabs.create({ url: 'http://localhost:5174/?view=ANALYTICS' });
    });

    // Open dashboard
    openDashboardBtn.addEventListener('click', () => {
        chrome.tabs.create({ url: 'http://localhost:5174' });
    });

    // Settings
    settingsBtn.addEventListener('click', () => {
        chrome.tabs.create({ url: 'http://localhost:5174/?view=SETTINGS' });
    });

    // Simple notification
    function showNotification(message) {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 10px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(0,0,0,0.9);
            color: white;
            padding: 8px 16px;
            border-radius: 8px;
            font-size: 12px;
            font-weight: 600;
            z-index: 1000;
            animation: slideDown 0.3s ease;
        `;
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideUp 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 2000);
    }

    // Add animation keyframes
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideDown {
            from { transform: translateX(-50%) translateY(-20px); opacity: 0; }
            to { transform: translateX(-50%) translateY(0); opacity: 1; }
        }
        @keyframes slideUp {
            from { transform: translateX(-50%) translateY(0); opacity: 1; }
            to { transform: translateX(-50%) translateY(-20px); opacity: 0; }
        }
    `;
    document.head.appendChild(style);

    // Initial load
    loadStats();

    // Refresh every 2 seconds
    setInterval(loadStats, 2000);

    // Sync with main app localStorage
    function syncWithMainApp() {
        // Try to read from main app's localStorage via messaging
        chrome.runtime.sendMessage({ action: 'syncWithApp' });
    }

    // Sync on load
    syncWithMainApp();
});
