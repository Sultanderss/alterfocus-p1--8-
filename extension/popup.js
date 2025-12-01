// AlterFocus Popup Script
document.addEventListener('DOMContentLoaded', () => {
    const toggleBtn = document.getElementById('toggleBtn');
    const statusText = document.getElementById('statusText');
    const blockedCount = document.getElementById('blockedCount');
    const savedTime = document.getElementById('savedTime');
    const openDashboardBtn = document.getElementById('openDashboard');
    const resetStatsBtn = document.getElementById('resetStats');

    // Load stats
    function loadStats() {
        chrome.runtime.sendMessage({ action: 'getStats' }, (response) => {
            if (response) {
                blockedCount.textContent = response.blockedToday || 0;
                savedTime.textContent = `${response.savedMinutes || 0} min`;

                const isActive = response.isActive !== false;
                toggleBtn.classList.toggle('active', isActive);
                statusText.textContent = isActive ? 'Activo' : 'Pausado';
                statusText.className = isActive ? 'toggle-status active' : 'toggle-status inactive';
            }
        });
    }

    // Toggle active state
    toggleBtn.addEventListener('click', () => {
        chrome.runtime.sendMessage({ action: 'toggleActive' }, (response) => {
            if (response) {
                const isActive = response.isActive;
                toggleBtn.classList.toggle('active', isActive);
                statusText.textContent = isActive ? 'Activo' : 'Pausado';
                statusText.className = isActive ? 'toggle-status active' : 'toggle-status inactive';
            }
        });
    });

    // Open dashboard
    openDashboardBtn.addEventListener('click', () => {
        chrome.tabs.create({ url: 'http://localhost:5175' });
    });

    // Reset stats
    resetStatsBtn.addEventListener('click', () => {
        if (confirm('¿Resetear todas las estadísticas de hoy?')) {
            chrome.storage.local.set({
                blockedToday: 0,
                savedMinutes: 0
            }, () => {
                loadStats();
            });
        }
    });

    // Initial load
    loadStats();

    // Refresh every 2 seconds
    setInterval(loadStats, 2000);
});
