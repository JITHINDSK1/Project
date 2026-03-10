// DSA: Circular Queue for Download Management
// Circular Queues re-use allocated space efficiently (O(1) Enqueue/Dequeue)
export class CircularQueue {
    constructor(capacity = 100) {
        this.items = new Array(capacity);
        this.front = 0;
        this.rear = -1;
        this.capacity = capacity;
        this.size = 0;
    }

    // Enqueue: O(1) Time, O(1) Space
    enqueue(noteId) {
        if (this.isFull()) {
            return { success: false, error: "Download queue is full. Try again later." };
        }

        this.rear = (this.rear + 1) % this.capacity; // Wrap around
        this.items[this.rear] = noteId;
        this.size++;

        return { success: true };
    }

    // Dequeue: O(1) Time, O(1) Space
    dequeue() {
        if (this.isEmpty()) {
            return { success: false, error: "Queue is empty" };
        }

        const noteId = this.items[this.front];
        this.front = (this.front + 1) % this.capacity; // Wrap around
        this.size--;

        return { success: true, noteId: noteId };
    }

    peek() {
        if (this.isEmpty()) return null;
        return this.items[this.front];
    }

    getSize() {
        return this.size;
    }

    isFull() {
        return this.size === this.capacity;
    }

    isEmpty() {
        return this.size === 0;
    }
}

// Global hook for mock implementation
export function addToDownloadQueue(noteId) {
    let queueData = JSON.parse(localStorage.downloadQueue || 'null');
    let queue;

    if (!queueData) {
        queue = new CircularQueue(100);
    } else {
        // Reconstruct prototype
        queue = Object.assign(new CircularQueue(100), queueData);
    }

    const result = queue.enqueue(noteId);
    localStorage.downloadQueue = JSON.stringify(queue); // Space: O(capacity) Fixed

    return result;
}

export function processNextDownload() {
    let queueData = JSON.parse(localStorage.downloadQueue || 'null');
    if (!queueData) return null;

    let queue = Object.assign(new CircularQueue(100), queueData);
    const result = queue.dequeue();

    localStorage.downloadQueue = JSON.stringify(queue);
    return result.success ? result.noteId : null;
}
