// DSA: Binary Max Heap / Priority Queue
// Priority based on download counts to fetch trending notes.
export class MaxHeap {
    constructor() {
        this.heap = [];
    }

    parent(i) { return Math.floor((i - 1) / 2); }
    left(i) { return 2 * i + 1; }
    right(i) { return 2 * i + 2; }

    swap(i, j) {
        [this.heap[i], this.heap[j]] = [this.heap[j], this.heap[i]];
    }

    // Insert elements into Max Heap - Time: O(log n), Space: O(1) per node
    insert(noteData) {
        this.heap.push(noteData);
        this.heapifyUp(this.heap.length - 1);
    }

    heapifyUp(i) {
        while (i > 0 && this.heap[this.parent(i)].downloads < this.heap[i].downloads) {
            this.swap(i, this.parent(i));
            i = this.parent(i);
        }
    }

    // Extract max element - Time: O(log n), Space: O(1)
    extractMax() {
        if (this.heap.length === 0) return null;
        if (this.heap.length === 1) return this.heap.pop();

        const max = this.heap[0];
        this.heap[0] = this.heap.pop(); // Replace root with last element
        this.heapifyDown(0);

        return max;
    }

    heapifyDown(i) {
        let largest = i;
        const left = this.left(i);
        const right = this.right(i);

        if (left < this.heap.length && this.heap[left].downloads > this.heap[largest].downloads) {
            largest = left;
        }

        if (right < this.heap.length && this.heap[right].downloads > this.heap[largest].downloads) {
            largest = right;
        }

        if (largest !== i) {
            this.swap(i, largest);
            this.heapifyDown(largest); // Recursive call: Max depth log(n)
        }
    }

    // Get top K elements - Time: O(k log n)
    getTopK(k) {
        const result = [];
        const tempHeap = [...this.heap]; // Copy to avoid destructing

        // We recreate a temporary heap tree since extracting mutates
        // the array. More efficiently, we can duplicate the MaxHeap:
        const tempMaxHeap = new MaxHeap();
        tempMaxHeap.heap = tempHeap;

        for (let i = 0; i < k && tempMaxHeap.heap.length > 0; i++) {
            result.push(tempMaxHeap.extractMax());
        }

        return result;
    }
}

// Function to calculate trending notes using the Max Heap
export function getTrendingNotes(k = 5) {
    const notes = JSON.parse(localStorage.notes || '{}');
    const heap = new MaxHeap();

    // Build heap - Inserting N elements is O(n log n)
    // (Alternatively can build via bottom-up heapify in O(n))
    for (const noteId in notes) {
        heap.insert(notes[noteId]);
    }

    return heap.getTopK(k); // Returning highest priority items (Most downloaded)
}
