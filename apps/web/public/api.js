/**
 * Inboxly API Client
 * JavaScript module for interacting with the backend API
 */

const API_BASE_URL = 'http://localhost:3000/api';

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Get userId from URL query parameters
 */
function getUserIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get('userId');
}

/**
 * Save userId to localStorage
 */
function saveUserId(userId) {
    localStorage.setItem('inboxly_userId', userId);
}

/**
 * Get userId from localStorage
 */
function getSavedUserId() {
    return localStorage.getItem('inboxly_userId');
}

/**
 * Get userId from URL or localStorage
 */
function getUserId() {
    const urlUserId = getUserIdFromUrl();
    if (urlUserId) {
        saveUserId(urlUserId);
        // Update all navigation links with userId
        updateNavigationLinks(urlUserId);
        return urlUserId;
    }
    const savedUserId = getSavedUserId();
    if (savedUserId) {
        // Update all navigation links with userId
        updateNavigationLinks(savedUserId);
    }
    return savedUserId;
}

/**
 * Update all navigation links to include userId
 */
function updateNavigationLinks(userId) {
    if (!userId) return;

    // Update all nav links
    const navLinks = document.querySelectorAll('a.nav-item[href*=".html"]');
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href && !href.includes('userId=')) {
            const separator = href.includes('?') ? '&' : '?';
            link.setAttribute('href', `${href}${separator}userId=${userId}`);
        }
    });
}

/**
 * Clear saved userId (for logout)
 */
function clearUserId() {
    localStorage.removeItem('inboxly_userId');
}

/**
 * Make API request with error handling
 */
async function apiRequest(endpoint, options = {}) {
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ error: 'Request failed' }));
            throw new Error(error.error || `HTTP ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('API Request Error:', error);
        throw error;
    }
}

// ============================================================================
// Authentication API
// ============================================================================

/**
 * Initiate Google OAuth login
 */
function loginWithGoogle() {
    window.location.href = `${API_BASE_URL}/auth/google`;
}

/**
 * Get current user information
 */
async function getCurrentUser() {
    const userId = getUserId();
    if (!userId) {
        throw new Error('Not authenticated');
    }
    return await apiRequest(`/auth/me?userId=${userId}`);
}

/**
 * Logout user
 */
function logout() {
    clearUserId();
    window.location.href = '/landing.html';
}

/**
 * Check if user is authenticated
 */
function isAuthenticated() {
    return !!getUserId();
}

/**
 * Redirect to login if not authenticated
 */
function requireAuth() {
    if (!isAuthenticated()) {
        window.location.href = '/landing.html';
    }
}

// ============================================================================
// Email API
// ============================================================================

/**
 * Sync emails from Gmail
 */
async function syncEmails() {
    const userId = getUserId();
    if (!userId) throw new Error('Not authenticated');

    return await apiRequest('/emails/sync', {
        method: 'POST',
        body: JSON.stringify({ userId }),
    });
}

/**
 * Get user's emails
 */
async function getEmails(filters = {}) {
    const userId = getUserId();
    if (!userId) throw new Error('Not authenticated');

    const params = new URLSearchParams({ userId, ...filters });
    return await apiRequest(`/emails?${params}`);
}

/**
 * Get single email details
 */
async function getEmail(emailId) {
    const userId = getUserId();
    if (!userId) throw new Error('Not authenticated');

    return await apiRequest(`/emails/${emailId}?userId=${userId}`);
}

/**
 * Analyze email with AI
 */
async function analyzeEmail(emailId) {
    const userId = getUserId();
    if (!userId) throw new Error('Not authenticated');

    return await apiRequest(`/emails/${emailId}/analyze`, {
        method: 'POST',
        body: JSON.stringify({ userId }),
    });
}

// ============================================================================
// Subscription API
// ============================================================================

/**
 * Get all subscriptions
 */
async function getSubscriptions() {
    const userId = getUserId();
    if (!userId) throw new Error('Not authenticated');

    return await apiRequest(`/subscriptions?userId=${userId}`);
}

/**
 * Get billing subscriptions
 */
async function getBillingSubscriptions() {
    const userId = getUserId();
    if (!userId) throw new Error('Not authenticated');

    return await apiRequest(`/subscriptions/billing/all?userId=${userId}`);
}

/**
 * Analyze sender for subscription info
 */
async function analyzeSender(senderEmail) {
    const userId = getUserId();
    if (!userId) throw new Error('Not authenticated');

    return await apiRequest('/subscriptions/analyze-sender', {
        method: 'POST',
        body: JSON.stringify({ userId, senderEmail }),
    });
}

// ============================================================================
// Unsubscribe API
// ============================================================================

/**
 * Unsubscribe from a single subscription
 */
async function unsubscribeFromSender(subscriptionId) {
    const userId = getUserId();
    if (!userId) throw new Error('Not authenticated');

    return await apiRequest(`/unsubscribe/${subscriptionId}`, {
        method: 'POST',
        body: JSON.stringify({ userId }),
    });
}

/**
 * Bulk unsubscribe from multiple subscriptions
 */
async function bulkUnsubscribe(subscriptionIds) {
    const userId = getUserId();
    if (!userId) throw new Error('Not authenticated');

    return await apiRequest('/unsubscribe/bulk', {
        method: 'POST',
        body: JSON.stringify({ userId, subscriptionIds }),
    });
}

// ============================================================================
// Gemini AI API
// ============================================================================

/**
 * Categorize email with Gemini AI
 */
async function categorizeEmail(emailContent) {
    return await apiRequest('/gemini/categorize', {
        method: 'POST',
        body: JSON.stringify({ emailContent }),
    });
}

/**
 * Summarize email with Gemini AI
 */
async function summarizeEmail(emailContent) {
    return await apiRequest('/gemini/summarize', {
        method: 'POST',
        body: JSON.stringify({ emailContent }),
    });
}

// ============================================================================
// UI Helper Functions
// ============================================================================

/**
 * Show loading state
 */
function showLoading(message = 'Loading...') {
    // You can customize this to show a loading spinner
    console.log(message);
}

/**
 * Hide loading state
 */
function hideLoading() {
    console.log('Loading complete');
}

/**
 * Show error message
 */
function showError(message) {
    alert(`Error: ${message}`);
}

/**
 * Show success message
 */
function showSuccess(message) {
    console.log(`Success: ${message}`);
}

/**
 * Format date for display
 */
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
}

/**
 * Format currency
 */
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(amount);
}
