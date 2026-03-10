import { getCurrentUser, getUser, saveUser, deleteNoteEntry, getNote } from './database.js';
import { getRecentSearches, undoLastSearch } from './stack.js';
import { getTrendingNotes } from './heap.js';
import { CircularQueue, processNextDownload } from './queue.js';
import { DoublyLinkedList } from './linkedlist.js';

document.addEventListener('DOMContentLoaded', () => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }

    document.getElementById('userNameDisplay').textContent = currentUser.name;

    renderMyNotes(currentUser);
    renderSearchHistory();
    renderTrendingNotes();
    renderRecentNotes();
    renderDownloadQueue();

    setupEventListeners();
});

function setupEventListeners() {
    document.getElementById('undoSearchBtn')?.addEventListener('click', () => {
        const popped = undoLastSearch(); // O(1) Stack Pop
        if (popped) {
            alert(`Undid search: "${popped.query}"`);
            renderSearchHistory();
        } else {
            alert("Search history is empty.");
        }
    });

    document.getElementById('processQueueBtn')?.addEventListener('click', () => {
        const noteId = processNextDownload(); // O(1) Queue Dequeue
        if (noteId) {
            const note = getNote(noteId); // O(1) Hash Table Lookup
            alert(`Processed download for: ${note ? note.title : noteId}`);
            renderDownloadQueue();
        } else {
            alert("Download queue is empty.");
        }
    });

    document.getElementById('myNotesGallery')?.addEventListener('click', (e) => {
        if (e.target.closest('.delete-btn')) {
            const btn = e.target.closest('.delete-btn');
            const noteId = btn.dataset.noteId;
            if (confirm("Are you sure you want to delete this note?")) {
                handleDeleteNote(noteId);
            }
        }
    });
}

// 1. Render Uploaded Notes (Traverse Singly Linked List)
function renderMyNotes(currentUser) {
    const gallery = document.getElementById('myNotesGallery');
    const user = getUser(currentUser.id); // Refresh data

    let currentPtr = user.uploadedNotesHeadPtr; // SLL Head
    let nodesArr = [];

    // Traverse SLL - O(N)
    while (currentPtr) {
        nodesArr.push(currentPtr.data);
        currentPtr = currentPtr.next;
    }

    if (nodesArr.length === 0) {
        gallery.innerHTML = '<p class="text-muted">You haven\'t uploaded any notes yet.</p>';
        return;
    }

    gallery.innerHTML = nodesArr.map(note => `
    <article class="glass-panel note-card" style="padding: 1rem; margin-bottom: 1rem;">
      <div class="flex justify-between items-center mb-sm">
        <h4 style="margin:0;">${note.title}</h4>
        <button class="btn btn-danger btn-icon delete-btn" data-note-id="${note.id}" title="Delete">
          🗑️
        </button>
      </div>
      <p class="text-muted" style="font-size: 0.85rem;">Subject: ${note.subject} | Downloads: ${note.downloads}</p>
    </article>
  `).join('');
}

// 2. Delete Note (Delete from Hash Table + Linked List)
function handleDeleteNote(noteId) {
    const currentUser = getCurrentUser();
    const user = getUser(currentUser.id);

    // A. Delete from Hash Table - O(1)
    const dbSuccess = deleteNoteEntry(noteId);
    if (!dbSuccess) return;

    // B. Delete from User's Singly Linked List - O(n) Search & Re-link
    let current = user.uploadedNotesHeadPtr;
    let prev = null;

    while (current) {
        if (current.data.id === noteId) {
            if (prev === null) {
                user.uploadedNotesHeadPtr = current.next; // Delete Head
            } else {
                prev.next = current.next; // Bypass deleted node
            }
            break; // Node deleted
        }
        prev = current;
        current = current.next;
    }

    // C. Save user update O(1)
    saveUser(user);
    alert("Note deleted successfully.");
    renderMyNotes(currentUser);
}

// 3. Search History (Stack to Array conversion O(N))
function renderSearchHistory() {
    const historyList = document.getElementById('searchHistoryList');
    const searches = getRecentSearches();

    if (searches.length === 0) {
        historyList.innerHTML = '<li class="list-group-item"><p class="text-muted">No recent searches</p></li>';
        return;
    }

    historyList.innerHTML = searches.map(s => `
    <li class="list-group-item">
      <span>"${s.query}"</span>
      <span class="text-muted" style="font-size: 0.75rem;">${new Date(s.timestamp).toLocaleTimeString()}</span>
    </li>
  `).join('');
}

// 4. Trending Notes (Max Heap Extraction O(K log N))
function renderTrendingNotes() {
    const trendingList = document.getElementById('trendingList');
    const topNotes = getTrendingNotes(5);

    if (topNotes.length === 0) {
        trendingList.innerHTML = '<li class="list-group-item text-muted">No notes uploaded yet.</li>';
        return;
    }

    trendingList.innerHTML = topNotes.map((note, index) => `
    <li class="list-group-item">
      <div>
        <strong>#${index + 1}</strong> ${note.title}
      </div>
      <span class="badge" style="background: var(--color-accent); color: white; padding: 2px 6px; border-radius: 4px; font-size: 0.75rem;">
        ${note.downloads} 📥
      </span>
    </li>
  `).join('');
}

// 5. Recent Notes (Doubly Linked List Traversal O(N))
function renderRecentNotes() {
    const recentList = document.getElementById('recentList');
    const recentArr = JSON.parse(localStorage.recentNotes || '[]');

    if (recentArr.length === 0) {
        recentList.innerHTML = '<li class="list-group-item text-muted">No recent notes.</li>';
        return;
    }

    // Convert to DoublyLinkedList to demonstrate operations
    const dll = DoublyLinkedList.fromArray(recentArr);
    const traverseResult = dll.toArray(); // Simulates forward traversal O(N)

    recentList.innerHTML = traverseResult.slice(0, 5).map(note => `
    <li class="list-group-item">
      <span>${note.title}</span>
      <span class="text-primary text-sm">${note.subject}</span>
    </li>
  `).join('');
}

// 6. Download Queue (Circular Queue Traversal O(Queue Size))
function renderDownloadQueue() {
    const queueUl = document.getElementById('downloadQueueList');
    let queueData = JSON.parse(localStorage.downloadQueue || 'null');

    if (!queueData || queueData.size === 0) {
        queueUl.innerHTML = '<li class="list-group-item"><p class="text-muted">Queue is empty</p></li>';
        return;
    }

    let queue = Object.assign(new CircularQueue(100), queueData);
    let html = '';

    // Custom traversal to show contents accurately without dequeuing
    // O(N) traversal where N = queue size
    let currentIdx = queue.front;
    for (let i = 0; i < queue.size; i++) {
        const nid = queue.items[currentIdx];
        const note = getNote(nid); // O(1) hash map lookup
        html += `
      <li class="list-group-item">
        <span>${note ? note.title : 'Deleted Note'}</span>
        <span class="text-muted text-sm">Waiting</span>
      </li>
    `;
        currentIdx = (currentIdx + 1) % queue.capacity;
    }

    queueUl.innerHTML = html;
}
