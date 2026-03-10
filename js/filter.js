// DSA: Data Filtering via Hash Tables (Indexes)

// 1. Filter by Linear Hash-Map scan (O(n) Time, O(k) Space)
// Basic filtering iterating through all values
export function filterNotesBySubjectLinear(subject) {
    if (!subject || subject === 'All') return Object.values(JSON.parse(localStorage.notes || '{}'));

    const notes = JSON.parse(localStorage.notes || '{}');
    const results = [];

    for (const noteId in notes) {
        if (notes[noteId].subject === subject) {
            results.push(notes[noteId]);
        }
    }

    return results;
}

// 2. Pre-computed Subject Index (Hash Table)
// This simulates inverted indexes used in real Databases like Firestore
// Time to build: O(n), Space: O(n)
export function buildSubjectIndex() {
    const notes = JSON.parse(localStorage.notes || '{}');
    const subjectIndex = {}; // Hash Table: { "DSA": ["note1", "note2"], "OS": [...] }

    for (const noteId in notes) {
        const subject = notes[noteId].subject;
        // Handle missing subject edge cases
        if (!subject) continue;

        if (!subjectIndex[subject]) {
            subjectIndex[subject] = [];
        }
        // Append to adjacency list
        subjectIndex[subject].push(noteId);
    }

    localStorage.subjectIndex = JSON.stringify(subjectIndex);
    return subjectIndex;
}

// 3. O(1) Time Lookup Filter using Index
export function filterNotesBySubjectIndexed(subject) {
    if (!subject || subject === 'All') return Object.values(JSON.parse(localStorage.notes || '{}'));

    // Ensure index exists every time we try to filter for safety edge cases
    buildSubjectIndex();

    const subjectIndex = JSON.parse(localStorage.subjectIndex || '{}');
    const noteIds = subjectIndex[subject] || [];

    const notesMap = JSON.parse(localStorage.notes || '{}');

    // Array map: O(k) where k is matches, much faster than O(n) overall
    return noteIds.map(id => notesMap[id]);
}
