// Global Utilities & UI Handling

document.addEventListener('DOMContentLoaded', () => {
    // Mobile Nav Toggle
    const navToggle = document.getElementById('navToggle');
    const navLinks = document.getElementById('navLinks');

    if (navToggle && navLinks) {
        navToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });
    }

    // Auth State Observer - update UI based on login status
    // We will connect this to Firebase auth state later
    updateAuthUI(null);
});

export function updateAuthUI(user) {
    const loginLink = document.getElementById('nav-login');
    const addNoteLink = document.getElementById('nav-upload');
    const profileLink = document.getElementById('nav-profile');
    const logoutLink = document.getElementById('nav-logout');

    if (user) {
        if (loginLink) loginLink.classList.add('hidden');
        if (addNoteLink) addNoteLink.classList.remove('hidden');
        if (profileLink) profileLink.classList.remove('hidden');
        if (logoutLink) logoutLink.classList.remove('hidden');
    } else {
        if (loginLink) loginLink.classList.remove('hidden');
        if (addNoteLink) addNoteLink.classList.add('hidden');
        if (profileLink) profileLink.classList.add('hidden');
        if (logoutLink) logoutLink.classList.add('hidden');
    }
}

// Utility: Show error message in form
export function showError(elementId, message) {
    const el = document.getElementById(elementId);
    if (el) {
        el.textContent = message;
        el.classList.add('show');
        setTimeout(() => {
            el.classList.remove('show');
        }, 5000);
    }
}
