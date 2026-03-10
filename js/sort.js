// DSA: Sorting Algorithms 
// Implemented with varying Time & Space complexities

function compareNotes(a, b, sortBy) {
    if (sortBy === 'uploadDate') return b.uploadDate - a.uploadDate; // Descending (Newest first)
    if (sortBy === 'downloads') return b.downloads - a.downloads;    // Descending
    if (sortBy === 'title') return a.title.localeCompare(b.title);   // Ascending A-Z
    return 0; // Default: stable
}

// 1. Bubble Sort: Time O(n²), Space O(1) In-place
// Best for: Extremely small data sets or mostly-sorted data
export function bubbleSortNotes(notes, sortBy) {
    const arr = [...notes]; // Clone 
    const n = arr.length;
    let swapped;

    for (let i = 0; i < n - 1; i++) {
        swapped = false;
        for (let j = 0; j < n - i - 1; j++) {
            // If we should swap (e.g., A > B for ascending)
            if (compareNotes(arr[j], arr[j + 1], sortBy) > 0) {
                // Swap 
                [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
                swapped = true;
            }
        }
        if (!swapped) break; // Optimization for already sorted arrays (Best case O(n))
    }
    return arr;
}

// 2. Insertion Sort: Time O(n²) worst, O(n) best, Space O(1) In-place
// Best for: Small datasets or online sorting (real-time stream)
export function insertionSortNotes(notes, sortBy) {
    const arr = [...notes];
    for (let i = 1; i < arr.length; i++) {
        const key = arr[i];
        let j = i - 1;

        // Move elements of arr[0..i-1] that are greater than key
        while (j >= 0 && compareNotes(arr[j], key, sortBy) > 0) {
            arr[j + 1] = arr[j];
            j--;
        }
        arr[j + 1] = key;
    }
    return arr;
}

// 3. Merge Sort: Time O(n log n) Guaranteed, Space O(n) Auxiliary Space
// Best for: Large datasets ensuring predictable performance. Stable sort.
export function mergeSortNotes(notes, sortBy) {
    if (notes.length <= 1) return notes; // Base Case

    // Divide
    const mid = Math.floor(notes.length / 2);
    const left = notes.slice(0, mid);
    const right = notes.slice(mid);

    // Conquer & Merge
    return merge(mergeSortNotes(left, sortBy), mergeSortNotes(right, sortBy), sortBy);
}

function merge(left, right, sortBy) {
    const result = [];
    let i = 0, j = 0;

    while (i < left.length && j < right.length) {
        if (compareNotes(left[i], right[j], sortBy) <= 0) {
            result.push(left[i++]);
        } else {
            result.push(right[j++]);
        }
    }

    // Exhaust remaining elements
    return result.concat(left.slice(i)).concat(right.slice(j));
}

// 4. Quick Sort: Time Average O(n log n), Worst O(n²), Space O(log n) call stack
// Best for: Fast, general-purpose in-place sorting
export function quickSortNotes(notes, sortBy, left = 0, right = notes.length - 1) {
    let arr = notes;
    if (left === 0 && right === notes.length - 1) {
        arr = [...notes]; // Clone only on first call
    }

    if (left < right) {
        const partitionIndex = partition(arr, sortBy, left, right);
        quickSortNotes(arr, sortBy, left, partitionIndex - 1);
        quickSortNotes(arr, sortBy, partitionIndex + 1, right);
    }
    return arr;
}

function partition(arr, sortBy, left, right) {
    const pivot = arr[right]; // Choose last as pivot
    let i = left - 1;

    for (let j = left; j < right; j++) {
        // If current element is smaller than or equal to pivot
        if (compareNotes(arr[j], pivot, sortBy) <= 0) {
            i++;
            [arr[i], arr[j]] = [arr[j], arr[i]]; // Swap
        }
    }

    [arr[i + 1], arr[right]] = [arr[right], arr[i + 1]]; // Place pivot in middle
    return i + 1;
}

// Algorithm Selector (Uses Strategy based on dataset size)
export function smartSortNotes(notes, sortBy) {
    const n = notes.length;
    // Choose algorithm dynamically
    if (n < 15) {
        return insertionSortNotes(notes, sortBy);
    } else if (n < 1000) {
        return quickSortNotes(notes, sortBy); // Quick sort is cache-friendly 
    } else {
        return mergeSortNotes(notes, sortBy); // Guarantees n*log(n)
    }
}
