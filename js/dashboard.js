import { getAllNotes } from './database.js';
import { searchWithHistory } from './search.js';
import { filterNotesBySubjectIndexed } from './filter.js';
import { smartSortNotes } from './sort.js';
import { addToDownloadQueue } from './queue.js';

// DOM Elements
const notesGallery = document.getElementById('notesGallery');
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const subjectFilter = document.getElementById('subjectFilter');
const sortFilter = document.getElementById('sortFilter');

document.addEventListener('DOMContentLoaded', () => {
    if (notesGallery) {
        // Parse URL params from index.html Hero
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.has('search') && searchInput) {
            searchInput.value = urlParams.get('search');
        }

        loadAndRenderNotes();
        setupEventListeners();
    }
});

function setupEventListeners() {
    if (searchBtn) {
        searchBtn.addEventListener('click', () => {
            loadAndRenderNotes();
        });
    }

    if (searchInput) {
        searchInput.addEventListener('keyup', (e) => {
            if (e.key === 'Enter') {
                loadAndRenderNotes();
            }
        });
    }

    if (subjectFilter) {
        subjectFilter.addEventListener('change', () => {
            loadAndRenderNotes();
        });
    }

    if (sortFilter) {
        sortFilter.addEventListener('change', () => {
            loadAndRenderNotes();
        });
    }

    // Delegate download button clicks
    notesGallery.addEventListener('click', (e) => {
        if (e.target.closest('.download-btn')) {
            const btn = e.target.closest('.download-btn');
            const noteId = btn.dataset.noteId;
            handleDownload(noteId);
        }
    });
}

function loadAndRenderNotes() {
    const query = searchInput ? searchInput.value.trim() : '';
    const subject = subjectFilter ? subjectFilter.value : '';
    let sortBy = sortFilter ? sortFilter.value : 'uploadDate';

    // Map dropdown values to our generic algorithm keys
    if (sortBy === 'newest') sortBy = 'uploadDate';
    if (sortBy === 'alpha') sortBy = 'title';

    notesGallery.innerHTML = '<p class="text-muted text-center" style="grid-column: 1/-1;">Processing notes...</p>';

    setTimeout(() => {
        // 1. Search (Linear Search for Substring Matching)
        let results = searchWithHistory(query, false); // useBinary flag = false

        // 2. Filter via Hash Table Index
        if (subject && subject !== "") {
            const subjectResults = filterNotesBySubjectIndexed(subject);
            const subjectIds = new Set(subjectResults.map(n => n.id));
            results = results.filter(n => subjectIds.has(n.id));
        }

        // 3. Sort via Smart Selector (Bubble/Insertion/Merge/Quick)
        results = smartSortNotes(results, sortBy);

        renderNotes(results);
    }, 100);
}

function renderNotes(notesArray) {
    notesGallery.classList.remove('hidden');

    if (notesArray.length === 0) {
        notesGallery.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 3rem;">
        <h3 class="text-muted">No notes found!</h3>
        <p class="text-muted">Try adjusting your search or filters.</p>
      </div>
    `;
        return;
    }

    notesGallery.innerHTML = notesArray.map(note => createNoteCard(note)).join('');
}

function createNoteCard(note) {
    const dateStr = new Date(note.uploadDate).toLocaleDateString();
    const sizeKb = Math.round(note.fileSize / 1024);

    return `
    <article class="glass-panel note-card">
      <div class="note-header flex justify-between items-center mb-sm">
        <span class="badge-${note.subject.toLowerCase()}">${note.subject}</span>
        <span class="text-muted" style="font-size: 0.8rem;">${dateStr}</span>
      </div>
      <h3 class="mt-sm mb-xs" style="font-size: 1.25rem;">${note.title}</h3>
      <p class="text-muted mb-md" style="font-size: 0.9rem; flex-grow: 1;">${note.description || 'No description provided.'}</p>
      
      <div class="note-footer flex justify-between items-center mt-auto">
        <div class="uploader-info flex flex-col">
          <span style="font-size: 0.8rem;" class="text-muted">By ${note.uploaderName}</span>
          <span style="font-size: 0.8rem;" class="text-primary">${note.downloads} Downloads</span>
        </div>
        
        <button class="btn btn-secondary download-btn" data-note-id="${note.id}" title="Download ${sizeKb}KB">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="7 10 12 15 17 10"></polyline>
            <line x1="12" y1="15" x2="12" y2="3"></line>
          </svg>
        </button>
      </div>
    </article>
  `;
}

function handleDownload(noteId) {
    const currentUser = sessionStorage.currentUserId;
    if (!currentUser) {
        alert("Please login to download notes.");
        window.location.href = 'login.html';
        return;
    }

    // 1. Add to Circular Queue (Stats & Limits Tracking)
    const queueResult = addToDownloadQueue(noteId);
    if (!queueResult.success) {
        alert(queueResult.error);
        return;
    }

    // 2. Retrieve actual file (Base64) from mock database Hash Table
    import('./database.js').then(module => {
        const note = module.getNote(noteId);
        if (!note || !note.fileUrl) {
            alert("Error: File data is missing or corrupted.");
            return;
        }

        // Trigger real browser download action
        const link = document.createElement('a');
        link.href = note.fileUrl; // This is the Base64 Data URL
        link.download = note.fileName || `studyshare_note_${note.id}.${note.fileType || 'pdf'}`;

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Update downloads metric
        note.downloads = (note.downloads || 0) + 1;
        module.saveNote(note);
    });
}
