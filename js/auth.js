import { initDatabase, getUserByEmail, saveUser, getCurrentUser } from './database.js';
import { updateAuthUI, showError } from './app.js';

// DOM Elements
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');
const logoutBtn = document.getElementById('nav-logout');
const heroSection = document.getElementById('heroSection');

document.addEventListener('DOMContentLoaded', () => {
    initDatabase(); // Ensure mock DB is initialized

    const currentUser = getCurrentUser();
    updateAuthUI(currentUser);

    // Allow hero section to be visible whether logged in or not.
});

// Handle Signup (Hash Table Insertion & Collision Handling)
if (signupForm) {
    signupForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        if (password !== confirmPassword) {
            showError('signupError', 'Passwords do not match.');
            return;
        }

        // 1. Check for collision - O(n) average (in real DB, this is constrained to O(1) via unique constraints)
        const existingUser = getUserByEmail(email);
        if (existingUser) {
            showError('signupError', 'Email is already registered.');
            return;
        }

        // 2. Insert into Hash Table - O(1)
        const userId = 'user_' + Date.now();
        const newUser = {
            id: userId,
            email: email,
            name: name,
            password: password, // Mock only
            uploadedNotesHeadPtr: null, // Singly Linked List pointer
            joinDate: new Date().toISOString()
        };

        saveUser(newUser); // Save to LocalStorage hash map

        // Log the user in
        sessionStorage.currentUserId = userId;
        alert("Account created successfully!");
        window.location.href = 'dashboard.html';
    });
}

// Handle Login (Hash Table Lookup)
if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        // Linear Search through hash-map values - O(n) average
        const user = getUserByEmail(email);

        if (user && user.password === password) {
            sessionStorage.currentUserId = user.id;
            alert("Logged in successfully!");
            window.location.href = 'dashboard.html';
        } else {
            showError('loginError', "Invalid email or password.");
        }
    });
}

// Handle Logout
if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        sessionStorage.removeItem('currentUserId');
        alert("Logged out successfully.");
        window.location.href = 'index.html';
    });
}
