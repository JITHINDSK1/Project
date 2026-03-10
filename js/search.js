// DSA: Searching Algorithms & Hash Table Indexing

import { pushSearchQuery } from './stack.js';

// 1. Linear Search: Time O(n), Space O(k) where k=results
// Best for: Small, unsorted datasets or exact content matches
export function linearSearchNotes(query) {
    const notes = JSON.parse(localStorage.notes || '{}');
    const results = [];
    const lowerQuery = query.toLowerCase();

    // LINEAR SCAN through the hash table values
    for (const noteId in notes) {
        const note = notes[noteId];
        if (
            note.title.toLowerCase().includes(lowerQuery) ||
            note.description.toLowerCase().includes(lowerQuery)
        ) {
            results.push(note);
        }
    }

    return results;
}

// 2. Binary Search: Time O(log n), Space O(n) due to array conversion
// Best for: Large datasets that are already sorted. 
export function binarySearchNotesByTitle(query) {
    const notes = JSON.parse(localStorage.notes || '{}');

    // Convert map to array and sort by title
    // Space: O(n), Time: O(n log n) for building sorted array initially
    const sortedNotes = Object.values(notes).sort((a, b) =>
        a.title.localeCompare(b.title)
    );

    let left = 0;
    let right = sortedNotes.length - 1;
    const lowerQuery = query.toLowerCase();
    const results = [];

    // Find ONE match via Binary Search - Time O(log n)
    // Note: Binary search for a substring is tricky. Usually used for exact prefix/match.
    // Here we use it for a prefix matching simulation.
    let foundIndex = -1;
    while (left <= right) {
        const mid = Math.floor((left + right) / 2);
        const midTitle = sortedNotes[mid].title.toLowerCase();

        if (midTitle.includes(lowerQuery)) {
            foundIndex = mid;
            break;
        } else if (midTitle < lowerQuery) {
            left = mid + 1;
        } else {
            right = mid - 1;
        }
    }

    // If found, expand left and right to find ALL adjacent matches
    if (foundIndex !== -1) {
        results.push(sortedNotes[foundIndex]);

        // Scan left
        let lscan = foundIndex - 1;
        while (lscan >= 0 && sortedNotes[lscan].title.toLowerCase().includes(lowerQuery)) {
            results.unshift(sortedNotes[lscan]);
            lscan--;
        }

        // Scan right
        let rscan = foundIndex + 1;
        while (rscan < sortedNotes.length && sortedNotes[rscan].title.toLowerCase().includes(lowerQuery)) {
            results.push(sortedNotes[rscan]);
            rscan++;
        }
    }

    return results;
}

// 3. Hybrid Search Wrapper (Utilizes History Stack)
export function searchWithHistory(query, useBinary = false) {
    if (!query) return Object.values(JSON.parse(localStorage.notes || '{}'));

    // Push to history stack (O(1))
    pushSearchQuery(query);

    // Conditionally choose search algorithm
    if (useBinary) {
        return binarySearchNotesByTitle(query);
    } else {
        return linearSearchNotes(query);
    }
}
