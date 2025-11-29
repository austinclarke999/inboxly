// Dashboard Stats Loader
// This script dynamically loads user stats from the API and updates the dashboard

document.addEventListener('DOMContentLoaded', async () => {
    await loadDashboardStats();
});

async function loadDashboard Stats() {
    try {
        const userId = getUserId();
        if (!userId) return;

        const response = await fetch(`/api/stats?userId=${userId}`);
        const stats = await response.json();

        // Update health score
        updateHealthScore(stats.healthScore || 0);

        // Update stat cards
        updateStatValue('emails-processed', (stats.emailsProcessed || 0).toLocaleString());
        updateStatValue('subscriptions-removed', stats.subscriptionsRemoved || 0);
        updateStatValue('money-saved', `$${stats.moneySaved || '0.00'}`);
        updateStatValue('noise-reduced', `${stats.noiseReduced || 0}%`);

        // Update achievements
        renderAchievements(stats.achievements || []);

        // Show empty state for recent activity if no activity
        if (!stats.recentActivity || stats.recentActivity.length === 0) {
            showEmptyActivity();
        }
    } catch (error) {
        console.error('Failed to load dashboard stats:', error);
    }
}

function updateStatValue(id, value) {
    const elem = document.getElementById(id);
    if (elem) {
        elem.textContent = value;
    }
}

function updateHealthScore(score) {
    const scoreElem = document.getElementById('health-score');
    if (scoreElem) {
        scoreElem.textContent = score;
    }
}

function renderAchievements(achievements) {
    const container = document.getElementById('achievements-list');
    if (!container) return;

    const icons = {
        'inbox-ninja': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <circle cx="12" cy="12" r="6"></circle>
            <circle cx="12" cy="12" r="2"></circle>
        </svg>`,
        'signal-saver': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
        </svg>`,
        'zero-inbox-hero': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path>
            <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path>
            <path d="M4 22h16"></path>
            <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path>
            <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path>
            <path d="M18 2H6v7a6 6 0 0 0 12 0V2z"></path>
        </svg>`,
        'subscription-samurai': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
        </svg>`
    };

    container.innerHTML = achievements.map(achievement => `
        <div class="achievement-item ${achievement.unlocked ? 'unlocked' : ''}">
            <div class="achievement-icon">
                ${icons[achievement.id] || ''}
            </div>
            <div class="achievement-info">
                <p class="achievement-name">${achievement.name}</p>
                <p class="achievement-status">${achievement.status}</p>
            </div>
        </div>
    `).join('');
}

function showEmptyActivity() {
    const container = document.getElementById('activity-list');
    if (!container) return;

    container.innerHTML = `
        <div style="text-align: center; padding: 3rem 1rem; color: var(--dark-400);">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin: 0 auto 1rem; opacity: 0.5;">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <p style="font-size: 0.875rem;">No activity yet</p>
            <p style="font-size: 0.75rem; margin-top: 0.5rem;">Sync your emails to get started!</p>
        </div>
    `;
}
