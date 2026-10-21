import { Flashcard } from '../types';

export const FLASHCARDS: Flashcard[] = [
  // DSA
  {
    id: 'fc-dsa-1',
    subject: 'dsa',
    topic: 'Sorting Complexities',
    difficulty: 'easy',
    front: 'What are the worst-case time complexities of Quick Sort vs Merge Sort?',
    back: 'Quick Sort: O(n^2) worst case (unbalanced partition). Merge Sort: O(n log n) guaranteed worst, average, and best cases.'
  },
  {
    id: 'fc-dsa-2',
    subject: 'dsa',
    topic: 'Trees',
    difficulty: 'medium',
    front: 'How many null pointers exist in any binary tree with N nodes?',
    back: 'Exactly (N + 1) null pointers. Proof: N nodes have 2N total child pointers. (N - 1) pointers are incoming to nodes (except root). Remaining = 2N - (N - 1) = N + 1.'
  },
  {
    id: 'fc-dsa-3',
    subject: 'dsa',
    topic: 'Graph Algorithms',
    difficulty: 'medium',
    front: 'When does Dijkstra\'s algorithm fail, and what should be used instead?',
    back: 'Dijkstra fails when graphs contain negative edge weights. Use the Bellman-Ford algorithm (O(V * E)) instead.'
  },
  {
    id: 'fc-dsa-4',
    subject: 'dsa',
    topic: 'Heaps',
    difficulty: 'easy',
    front: 'What is the time complexity to build a binary heap from an unsorted array?',
    back: 'O(N) linear time using bottom-up Floyd\'s heapify, NOT O(N log N).'
  },

  // Networks
  {
    id: 'fc-cn-1',
    subject: 'cn',
    topic: 'Subnetting',
    difficulty: 'easy',
    front: 'In IPv4 subnet /27, what is the subnet mask and number of usable host addresses?',
    back: 'Mask: 255.255.255.224. Host bits = 32 - 27 = 5. Usable hosts = 2^5 - 2 = 30 hosts.'
  },
  {
    id: 'fc-cn-2',
    subject: 'cn',
    topic: 'TCP Handshake',
    difficulty: 'easy',
    front: 'What 3 packets establish a TCP connection?',
    back: '1. Client -> Server: [SYN, Seq=x]\n2. Server -> Client: [SYN, ACK, Seq=y, Ack=x+1]\n3. Client -> Server: [ACK, Seq=x+1, Ack=y+1]'
  },
  {
    id: 'fc-cn-3',
    subject: 'cn',
    topic: 'OSI Devices',
    difficulty: 'easy',
    front: 'What OSI layers do Hubs, Switches, and Routers operate at?',
    back: 'Hub: Physical Layer (Layer 1). Switch: Data Link Layer (Layer 2). Router: Network Layer (Layer 3).'
  },
  {
    id: 'fc-cn-4',
    subject: 'cn',
    topic: 'Sliding Window',
    difficulty: 'medium',
    front: 'What is the maximum window size in Go-Back-N vs Selective Repeat with m-bit sequence numbers?',
    back: 'Go-Back-N sender window: (2^m - 1). Selective Repeat sender/receiver window: 2^(m - 1).'
  },

  // OOPs
  {
    id: 'fc-oops-1',
    subject: 'oops',
    topic: 'Polymorphism',
    difficulty: 'medium',
    front: 'Why should a base class destructor always be declared virtual in C++?',
    back: 'To prevent memory leaks when deleting a derived object via a base pointer. A virtual destructor ensures derived destructor executes before base destructor.'
  },
  {
    id: 'fc-oops-2',
    subject: 'oops',
    topic: 'VTABLE',
    difficulty: 'medium',
    front: 'Can a constructor be virtual in C++? Why?',
    back: 'No. Dynamic dispatch requires the object\'s VPTR to point to a valid VTABLE. Before the constructor completes, the object and VPTR do not yet exist.'
  },
  {
    id: 'fc-oops-3',
    subject: 'oops',
    topic: 'Multiple Inheritance',
    difficulty: 'medium',
    front: 'How is the Diamond Problem resolved in C++?',
    back: 'By using Virtual Base Classes (e.g. `class B : virtual public A`). This guarantees that only one shared instance of A exists in derived class D.'
  },
  {
    id: 'fc-oops-4',
    subject: 'oops',
    topic: 'SOLID',
    difficulty: 'easy',
    front: 'What does Liskov Substitution Principle (LSP) state?',
    back: 'Objects of a superclass should be replaceable with objects of its subclasses without breaking program correctness or altering expected invariants.'
  },

  // DBMS
  {
    id: 'fc-dbms-1',
    subject: 'dbms',
    topic: 'Normal Forms',
    difficulty: 'medium',
    front: 'What is the key difference between 3NF and BCNF?',
    back: 'In 3NF, for X -> Y: either X is a Super Key OR Y is a Prime attribute. In BCNF, X MUST strictly be a Super Key (no prime attribute exception).'
  },
  {
    id: 'fc-dbms-2',
    subject: 'dbms',
    topic: 'Serializability',
    difficulty: 'medium',
    front: 'How do you test if a concurrent schedule is Conflict Serializable?',
    back: 'Construct the Precedence (Serialization) Graph with directed edges Ti -> Tj for conflicting operations. The schedule is Conflict Serializable iff the graph has NO CYCLES.'
  },
  {
    id: 'fc-dbms-3',
    subject: 'dbms',
    topic: 'Concurrency Control',
    difficulty: 'medium',
    front: 'Does Basic Two-Phase Locking (2PL) prevent deadlocks?',
    back: 'NO! Basic 2PL guarantees Conflict Serializability, but deadlocks can and do occur due to mutual lock waits.'
  },
  {
    id: 'fc-dbms-4',
    subject: 'dbms',
    topic: 'ACID Properties',
    difficulty: 'easy',
    front: 'What does the ACID acronym stand for in DBMS?',
    back: 'Atomicity (All-or-nothing), Consistency (integrity constraints), Isolation (independent concurrent execution), Durability (persistence after commit).'
  },

  // OS
  {
    id: 'fc-os-1',
    subject: 'os',
    topic: 'Deadlocks',
    difficulty: 'easy',
    front: 'What are Coffman\'s 4 necessary conditions for Deadlock?',
    back: '1. Mutual Exclusion\n2. Hold and Wait\n3. No Preemption\n4. Circular Wait.'
  },
  {
    id: 'fc-os-2',
    subject: 'os',
    topic: 'Paging & Memory',
    difficulty: 'medium',
    front: 'What is Bélády\'s Anomaly and which page replacement algorithm experiences it?',
    back: 'Bélády\'s Anomaly is when increasing the number of physical frames increases page faults. FIFO exhibits it; stack algorithms like LRU and Optimal do NOT.'
  },
  {
    id: 'fc-os-3',
    subject: 'os',
    topic: 'CPU Scheduling',
    difficulty: 'easy',
    front: 'Which CPU scheduling algorithm achieves the provably minimum average waiting time?',
    back: 'Shortest Remaining Time First (SRTF) / Preemptive Shortest Job First.'
  },
  {
    id: 'fc-os-4',
    subject: 'os',
    topic: 'Deadlock Avoidance',
    difficulty: 'medium',
    front: 'What formula calculates minimum resources R to guarantee no deadlock for N processes each needing K resources?',
    back: 'R >= N * (K - 1) + 1. (Worst-case allocation has every process holding K - 1 resources, plus 1 more to let at least one finish).'
  },

  // Aptitude
  {
    id: 'fc-apt-1',
    subject: 'aptitude',
    topic: 'Time & Speed',
    difficulty: 'easy',
    front: 'What is the average speed formula when covering equal distances at speeds x and y?',
    back: 'Harmonic Mean: Average Speed = (2 * x * y) / (x + y). Never take arithmetic mean (x + y)/2!'
  },
  {
    id: 'fc-apt-2',
    subject: 'aptitude',
    topic: 'Unit Conversion',
    difficulty: 'easy',
    front: 'How do you convert km/h to m/s and vice versa?',
    back: 'km/h to m/s: Multiply by 5/18.\nm/s to km/h: Multiply by 18/5.'
  },
  {
    id: 'fc-apt-3',
    subject: 'aptitude',
    topic: 'Time & Work',
    difficulty: 'easy',
    front: 'What is the Man-Days-Hours Chain Rule formula?',
    back: '(M1 * D1 * H1 * E1) / W1 = (M2 * D2 * H2 * E2) / W2.'
  },
  {
    id: 'fc-apt-4',
    subject: 'aptitude',
    topic: 'Successive Discounts',
    difficulty: 'medium',
    front: 'What single discount is equivalent to two successive discounts of a% and b%?',
    back: 'Net Discount % = a + b - (a * b) / 100.'
  }
];
