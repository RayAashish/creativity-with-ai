import { SubjectMeta } from '../types';

export const SUBJECTS: SubjectMeta[] = [
  {
    id: 'dsa',
    name: 'Data Structures & Algorithms',
    shortName: 'DSA',
    tagline: 'Complexity, Trees, Graphs, DP & Algorithmic Thinking',
    description: 'Master time/space complexities, linear and non-linear data structures, sorting algorithms, greedy strategies, graph traversals, and dynamic programming.',
    icon: 'Layers',
    accentColor: '#3b82f6',
    gradient: 'from-blue-600 to-cyan-500',
    topicsCount: 14,
    featuredTopics: ['Asymptotic Analysis', 'Binary Search & Two Pointers', 'Trees & BST', 'Graph BFS/DFS', 'Dynamic Programming', 'Stacks & Queues']
  },
  {
    id: 'cn',
    name: 'Computer Networks',
    shortName: 'Networks',
    tagline: 'OSI/TCP-IP, Subnetting, Routing & Transport Protocols',
    description: 'Demystify layer protocols, IP CIDR calculations, TCP 3-way handshake, sliding window flow control, routing algorithms (Dijkstra, Bellman-Ford), and DNS/HTTP.',
    icon: 'Network',
    accentColor: '#06b6d4',
    gradient: 'from-cyan-500 to-teal-500',
    topicsCount: 12,
    featuredTopics: ['OSI vs TCP/IP Models', 'IPv4 Subnetting & CIDR', 'TCP Flow & Congestion Control', 'Routing Algorithms', 'DNS, DHCP, HTTP/HTTPS']
  },
  {
    id: 'oops',
    name: 'Object-Oriented Programming',
    shortName: 'OOPs',
    tagline: 'Encapsulation, Polymorphism, SOLID & Design Patterns',
    description: 'Master core object-oriented paradigms, virtual tables, dynamic binding, multiple inheritance traps, abstract classes vs interfaces, and GoF design patterns.',
    icon: 'Boxes',
    accentColor: '#8b5cf6',
    gradient: 'from-purple-600 to-pink-500',
    topicsCount: 10,
    featuredTopics: ['4 Core Pillars', 'Virtual Functions & VTABLE', 'SOLID Principles', 'Creational & Structural Patterns', 'Memory Management']
  },
  {
    id: 'dbms',
    name: 'Database Management Systems',
    shortName: 'DBMS',
    tagline: 'Relational Algebra, SQL, Normalization, ACID & Indexing',
    description: 'Conquer database schemas, ER diagrams, complex SQL joins, 1NF to BCNF decomposition, serializability, two-phase locking (2PL), and B+ tree indexing.',
    icon: 'Database',
    accentColor: '#10b981',
    gradient: 'from-emerald-600 to-teal-400',
    topicsCount: 12,
    featuredTopics: ['Relational Model & Keys', 'SQL Queries & Subqueries', 'Functional Dependencies & BCNF', 'ACID & Concurrency Control', 'B+ Trees Indexing']
  },
  {
    id: 'os',
    name: 'Operating Systems',
    shortName: 'OS',
    tagline: 'Processes, CPU Scheduling, Deadlocks, Paging & Virtual Memory',
    description: 'Understand system calls, thread synchronization, semaphores, deadlock detection & Bankers algorithm, multi-level paging, page replacement (LRU/FIFO), and file systems.',
    icon: 'Cpu',
    accentColor: '#f59e0b',
    gradient: 'from-amber-500 to-orange-500',
    topicsCount: 12,
    featuredTopics: ['Process Lifecycle & Threads', 'CPU Scheduling Algorithms', 'Semaphores & Mutex', 'Deadlock & Banker Algorithm', 'Paging & Virtual Memory']
  },
  {
    id: 'aptitude',
    name: 'Aptitude & Reasoning',
    shortName: 'Aptitude',
    tagline: 'Quantitative Math & Logical/Verbal Reasoning (Both Types)',
    description: 'Crack placement rounds with high-speed tricks for Quantitative Math (Time & Work, Profit & Loss, P&C, Probability) and Logical/Verbal reasoning (Syllogisms, Blood Relations, Coding-Decoding).',
    icon: 'BrainCircuit',
    accentColor: '#ec4899',
    gradient: 'from-pink-600 to-rose-500',
    topicsCount: 16,
    featuredTopics: ['Time, Speed & Work', 'Percentages & Profit/Loss', 'Permutation & Probability', 'Syllogisms & Deductions', 'Blood Relations & Direction', 'Critical Reasoning']
  }
];
