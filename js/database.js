// DSA: Hash Table & LocalStorage Mock Database
// This file simulates Firebase using browser LocalStorage for demonstration.

export function initDatabase() {
    if (!localStorage.users) localStorage.users = JSON.stringify({});
    if (!localStorage.notes) localStorage.notes = JSON.stringify({});
    if (!localStorage.recentNotes) localStorage.recentNotes = JSON.stringify([]);
    if (!localStorage.searchStack) localStorage.searchStack = JSON.stringify([]);
    // We'll initialize downloadQueue and heap as needed or keep as JSON.
}

// ALGORITHM ANALYSIS:
// Hash Table lookup: Average O(1), Worst O(n)
export function getUserByEmail(email) {
    const users = JSON.parse(localStorage.users || '{}');
    // LINEAR SEARCH through hash table values (since keys are IDs)
    for (const userId in users) {
        if (users[userId].email === email) {
            return users[userId];
        }
    }
    return null;
}

export function saveUser(userObj) {
    const users = JSON.parse(localStorage.users || '{}');
    users[userObj.id] = userObj; // Hash Table Insert - O(1)
    localStorage.users = JSON.stringify(users);
}

export function getUser(userId) {
    const users = JSON.parse(localStorage.users || '{}');
    return users[userId]; // Hash Table Lookup - O(1)
}

export function saveNote(noteObj) {
    const notes = JSON.parse(localStorage.notes || '{}');
    notes[noteObj.id] = noteObj; // Hash Table Insert - O(1)
    localStorage.notes = JSON.stringify(notes);
}

export function getNote(noteId) {
    const notes = JSON.parse(localStorage.notes || '{}');
    return notes[noteId]; // Hash Table Lookup - O(1)
}

export function getAllNotes() {
    return JSON.parse(localStorage.notes || '{}');
}

export function deleteNoteEntry(noteId) {
    const notes = JSON.parse(localStorage.notes || '{}');
    if (notes[noteId]) {
        delete notes[noteId]; // Hash Table Delete - O(1) true average
        localStorage.notes = JSON.stringify(notes);
        return true;
    }
    return false;
}

export function getCurrentUser() {
    const currentUserId = sessionStorage.currentUserId;
    if (!currentUserId) return null;
    return getUser(currentUserId);
}
