// DSA: Stack ADT for Search History
// Stack Application: LIFO (Last-In-First-Out)
export class Stack {
    constructor(initialItems = []) {
        this.items = initialItems;
    }

    // Push: O(1) Time
    push(element) {
        this.items.push(element);
    }

    // Pop: O(1) Time
    pop() {
        if (this.isEmpty()) return undefined;
        return this.items.pop();
    }

    // Peek: O(1) Time
    peek() {
        if (this.isEmpty()) return undefined;
        return this.items[this.items.length - 1];
    }

    // O(1) Time
    isEmpty() {
        return this.items.length === 0;
    }

    size() {
        return this.items.length;
    }

    toArray() {
        return [...this.items];
    }
}

// Helper to manage Search History
export function pushSearchQuery(query) {
    const currentHistory = JSON.parse(localStorage.searchStack || '[]');
    const stack = new Stack(currentHistory);

    stack.push({
        query: query,
        timestamp: Date.now()
    });

    const arr = stack.toArray();
    // Keep only last 20 searches max
    if (arr.length > 20) {
        arr.shift(); // Underlying array shift is O(n), but necessary for capping
    }

    localStorage.searchStack = JSON.stringify(arr);
}

export function getRecentSearches() {
    return JSON.parse(localStorage.searchStack || '[]').reverse();
}

export function undoLastSearch() {
    const currentHistory = JSON.parse(localStorage.searchStack || '[]');
    const stack = new Stack(currentHistory);

    if (!stack.isEmpty()) {
        const last = stack.pop();
        localStorage.searchStack = JSON.stringify(stack.toArray());
        return last;
    }
    return null;
}

// --- Balanced Symbols (Stack Application) ---
// Example: Validating if a search expression has balanced parentheses
// Time: O(n), Space: O(n)
export function isBalanced(expression) {
    const s = new Stack();
    const pairs = { ')': '(', '}': '{', ']': '[' };

    for (let i = 0; i < expression.length; i++) {
        const char = expression[i];

        if (char === '(' || char === '{' || char === '[') {
            s.push(char);
        } else if (char === ')' || char === '}' || char === ']') {
            if (s.isEmpty() || s.pop() !== pairs[char]) {
                return false;
            }
        }
    }
    return s.isEmpty();
}
