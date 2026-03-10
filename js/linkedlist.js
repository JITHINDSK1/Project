// DSA: Singly Linked List Node
export class LinkedListNode {
    constructor(data) {
        this.data = data;
        this.next = null;
    }
}

// Utility to append to a user's uploaded notes list (Singly Linked List)
// In localstorage, we'll store it as an array or simulated linked list, 
// but we demonstrate the ADT here.
export function appendToSinglyLinkedList(headPtr, data) {
    const newNode = new LinkedListNode(data);

    if (!headPtr) {
        return newNode; // First element
    }

    // Traverse to end - O(n) Time, O(1) Space
    let current = headPtr;
    while (current.next) {
        current = current.next;
    }
    current.next = newNode;

    return headPtr;
}

// DSA: Doubly Linked List Node for Recent Notes
export class DoublyLinkedListNode {
    constructor(data) {
        this.data = data;
        this.next = null;
        this.prev = null;
    }
}

export class DoublyLinkedList {
    constructor() {
        this.head = null;
        this.tail = null;
        this.size = 0;
    }

    // Insert at Head - O(1) Time, O(1) Space
    insertAtHead(data) {
        const newNode = new DoublyLinkedListNode(data);

        if (!this.head) {
            this.head = this.tail = newNode;
        } else {
            newNode.next = this.head;
            this.head.prev = newNode;
            this.head = newNode;
        }
        this.size++;
    }

    // Convert standard array to Doubly Linked List for operations
    static fromArray(arr) {
        const dll = new DoublyLinkedList();
        // Assuming we want newer at the head (standard)
        // Actually we'll insert from back to keep order
        for (let i = arr.length - 1; i >= 0; i--) {
            dll.insertAtHead(arr[i]);
        }
        return dll;
    }

    // Convert back to Array for LocalStorage serialization - O(n) Time
    toArray() {
        const result = [];
        let current = this.head;
        while (current) {
            result.push(current.data);
            current = current.next;
        }
        return result;
    }
}

// Function to manage Recent Notes
export function addToRecentNotes(noteData) {
    let recentArr = JSON.parse(localStorage.recentNotes || '[]');

    const dll = DoublyLinkedList.fromArray(recentArr);
    dll.insertAtHead(noteData); // O(1) insert

    // Cap at 20
    recentArr = dll.toArray();
    if (recentArr.length > 20) {
        recentArr.pop(); // Remove last
    }

    localStorage.recentNotes = JSON.stringify(recentArr);
}
