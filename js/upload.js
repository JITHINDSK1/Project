import { getCurrentUser, saveNote, getUser, saveUser, getAllNotes } from './database.js';
import { LinkedListNode, appendToSinglyLinkedList, addToRecentNotes } from './linkedlist.js';
import { showError } from './app.js';

const uploadForm = document.getElementById('uploadForm');

if (uploadForm) {
    uploadForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const currentUser = getCurrentUser();
        if (!currentUser) {
            alert("Please login to upload notes.");
            window.location.href = 'login.html';
            return;
        }

        const title = document.getElementById('noteTitle').value;
        const subject = document.getElementById('noteSubject').value;
        const desc = document.getElementById('noteDesc').value;
        const fileInput = document.getElementById('noteFile');
        const file = fileInput.files[0];

        if (!file) {
            showError('uploadError', 'Please select a file.');
            return;
        }

        // File size validation (Max 10MB)
        if (file.size > 10 * 1024 * 1024) {
            showError('uploadError', 'File size exceeds 10MB limit.');
            return;
        }

        try {
            const uploadBtn = document.getElementById('uploadBtn');
            const originalText = uploadBtn.textContent;
            uploadBtn.textContent = "Uploading...";
            uploadBtn.disabled = true;

            // 1. File Conversion (Simulating Cloud Storage)
            const base64Data = await convertFileToBase64(file);

            // 2. Generate Note ID (Hash Table key)
            const noteId = 'note_' + Date.now();

            const newNote = {
                id: noteId,
                title: title,
                description: desc,
                subject: subject,
                uploaderId: currentUser.id,
                uploaderName: currentUser.name,
                fileUrl: base64Data, // Big string in localStorage (mock)
                fileType: file.name.split('.').pop(),
                fileName: file.name,
                fileSize: file.size,
                uploadDate: Date.now(),
                downloads: 0
            };

            // 3. Hash Table Insertion: O(1)
            saveNote(newNote);

            // 4. Update User's Singly Linked List: O(n) average to reach end
            const user = getUser(currentUser.id);
            user.uploadedNotesHeadPtr = appendToSinglyLinkedList(user.uploadedNotesHeadPtr, newNote);
            saveUser(user);

            // 5. Update Doubly Linked List for Recent Notes: O(1) insert at head
            addToRecentNotes(newNote);

            // 6. Force index rebuild so the dashboard sees the new note immediately
            // We use standard localStorage deletion to force dashboard to rebuild it on demand
            localStorage.removeItem('subjectIndex');

            // Upload specific UI Feedback
            alert("Note uploaded successfully!");
            window.location.href = 'dashboard.html';

        } catch (err) {
            showError('uploadError', 'An error occurred during upload.');
            console.error(err);

            const uploadBtn = document.getElementById('uploadBtn');
            uploadBtn.textContent = "Upload to StudyShare";
            uploadBtn.disabled = false;
        }
    });
}

// Helper: Convert File to Base64 (Mocking Firebase Storage Upload)
function convertFileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}
