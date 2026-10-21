import { LearningTopic } from '../../types';

export const OS_LEARNING_TOPICS: LearningTopic[] = [
  {
    id: 'os-cpu-scheduling',
    subject: 'os',
    title: 'CPU Scheduling Algorithms & Metrics',
    category: 'Process Management',
    readTimeMinutes: 10,
    summary: 'Turnaround time, Waiting time, Response time, FCFS, SJF (Preemptive/Non-preemptive), Round Robin, Priority, and Convoy Effect.',
    content: {
      coreConcept: `CPU Scheduling decides which ready process is allocated the CPU by the short-term scheduler (dispatcher).

### Key Performance Formulas:
- **Turnaround Time ($TAT$)**: $\\text{Completion Time } (CT) - \\text{Arrival Time } (AT)$
- **Waiting Time ($WT$)**: $\\text{Turnaround Time } (TAT) - \\text{Burst Time } (BT)$
- **Response Time ($RT$)**: $\\text{Time of First CPU Allocation} - \\text{Arrival Time } (AT)$

### Scheduling Algorithms:
1. **FCFS (First-Come First-Served)**: Non-preemptive. Suffers from **Convoy Effect** (short processes wait behind long CPU-intensive process, lowering throughput).
2. **SJF / SRTF (Shortest Job First / Shortest Remaining Time First)**:
   - SRTF is preemptive. Provably optimal in minimizing average waiting time.
   - Disadvantage: Possibility of **Starvation** for longer processes.
3. **Round Robin (RR)**: Preemptive based on Time Quantum ($q$).
   - If $q \\to \\infty$, behaves like FCFS.
   - If $q \\to 0$, context switch overhead dominates the CPU.
   - Rule of thumb: $q$ should be large enough that 80% of CPU bursts are shorter than $q$.
4. **Priority Scheduling**: Can be preemptive or non-preemptive. Suffers from starvation of low-priority jobs (solved by **Aging**).`,
      keyPoints: [
        'Dispatcher latency: Time taken to stop one process and start running another (context switch overhead).',
        'Preemptive algorithms switch CPU when a new process with higher priority or shorter remaining burst arrives.',
        'SJF gives the theoretical minimum average waiting time among all scheduling algorithms.'
      ],
      formulasAndRules: [
        { title: 'Turnaround Time Formula', detail: 'TAT = Completion Time (CT) - Arrival Time (AT)' },
        { title: 'Waiting Time Formula', detail: 'WT = Turnaround Time (TAT) - Burst Time (BT)' },
        { title: 'Aging Solution', detail: 'Gradually increase the priority of processes that wait in the system for a long time to prevent starvation.' }
      ],
      interviewPitfalls: [
        'Including waiting in I/O queue as CPU waiting time. CPU Waiting time is strictly the time spent sitting in the READY queue waiting for the CPU.',
        'Assuming Round Robin has lower average turnaround time than SJF: RR has higher average TAT due to frequent context switching, but excels in interactive Response Time.'
      ],
      gateOrPlacementTip: 'GATE classical Gantt chart problem: Always arrange processes by arrival time first, track the Ready Queue step-by-step, and watch out for CPU idle gaps when no process has arrived yet!'
    },
    quickQuiz: [
      {
        question: 'Which CPU scheduling algorithm achieves the provably minimum average waiting time for a given set of processes?',
        options: ['Round Robin', 'Shortest Remaining Time First (SRTF)', 'Priority Scheduling', 'First-Come First-Served'],
        correctAnswer: 1,
        explanation: 'SRTF (Preemptive Shortest Job First) is mathematically proven to produce the minimal average waiting time because scheduling the shortest remaining burst reduces the waiting time of all other processes in the queue.'
      }
    ]
  },
  {
    id: 'os-synchronization-deadlocks',
    subject: 'os',
    title: 'Process Synchronization, Semaphores & Deadlocks',
    category: 'Concurrency & Deadlocks',
    readTimeMinutes: 12,
    summary: 'Critical Section requirements, Peterson Algorithm, Counting vs Binary Semaphores, Coffman 4 Deadlock conditions, and Banker Algorithm.',
    content: {
      coreConcept: `When concurrent processes share memory/resources, race conditions can produce inconsistent state.

### Critical Section Problem Criteria:
1. **Mutual Exclusion**: If process Pi is executing in its critical section, no other process can enter. (MANDATORY)
2. **Progress**: If no process is in critical section and some wish to enter, selection cannot be postponed indefinitely, and only processes not in remainder section participate. (MANDATORY)
3. **Bounded Waiting**: Bound exists on number of times other processes enter CS after a process requests entry. (Prevents starvation).

### Semaphores:
- **Binary Semaphore (Mutex)**: Takes values 0 or 1.
- **Counting Semaphore**: Value initialized to $N$ (available resource units).
  - \`wait(S)\` or \`P(S)\`: Decrements $S$. If $S < 0$, calling process blocks.
  - \`signal(S)\` or \`V(S)\`: Increments $S$. If $S \\le 0$, wakes a sleeping process.
  - Magnitude $|S|$ when $S < 0$ equals the exact number of processes waiting in the blocked queue!

### Deadlocks - 4 Necessary Coffman Conditions:
1. **Mutual Exclusion**: Non-shareable resource.
2. **Hold and Wait**: Process holds at least one resource and requests others.
3. **No Preemption**: Resources cannot be forcibly confiscated.
4. **Circular Wait**: Closed loop of processes where each waits for a resource held by the next.

### Banker's Algorithm (Deadlock Avoidance):
State is **Safe** if there exists a **Safe Sequence** $\\langle P_1, P_2, \\dots, P_n \\rangle$ such that for each $P_i$, its maximum remaining need can be satisfied by current Available + resources held by all prior $P_j$.
$$\\text{Need}[i][j] = \\text{Max}[i][j] - \\text{Allocation}[i][j]$$`,
      keyPoints: [
        'A system can be in an Unsafe state without being in a Deadlock state, but all Deadlocked states are Unsafe.',
        'Resource Allocation Graph (RAG): If resources have single instances, a cycle is a necessary AND sufficient condition for deadlock. If multiple instances, a cycle is necessary but NOT sufficient.',
        'Deadlock Prevention invalidates at least one of the 4 Coffman conditions; Avoidance uses Banker algorithm.'
      ],
      interviewPitfalls: [
        'Thinking Semaphores require busy waiting: Counting semaphores in modern OS use block/wake sleep queues, avoiding CPU spinning (unlike spinlocks).',
        'Confusing Deadlock with Starvation: In deadlock, no process can proceed; in starvation, one or more processes wait indefinitely while others continue making progress.'
      ],
      gateOrPlacementTip: 'GATE formula for minimum resources to prevent deadlock: For $N$ processes each requiring maximum $K$ instances of a single resource type, Minimum resources $R$ needed to guarantee no deadlock = $N \\cdot (K - 1) + 1$.'
    },
    quickQuiz: [
      {
        question: 'A system has 4 processes sharing 12 units of a resource. Each process requires a maximum of 3 units. Can a deadlock occur?',
        options: ['Yes, always', 'No, never', 'Yes, if all request at once', 'Depends on CPU scheduling'],
        correctAnswer: 1,
        explanation: 'Using the formula: Total resources R >= N*(K-1) + 1. Here N=4, K=3. Min resources to prevent deadlock = 4*(3-1) + 1 = 9. Since the system has 12 units (12 >= 9), deadlock can NEVER occur.'
      }
    ]
  },
  {
    id: 'os-virtual-memory',
    subject: 'os',
    title: 'Paging, Multi-level Page Tables & Page Replacement',
    category: 'Memory Management',
    readTimeMinutes: 11,
    summary: 'Logical to physical address translation, Page size, Frame calculation, TLB hit ratio effective memory access time (EMAT), and Belady Anomaly.',
    content: {
      coreConcept: `Virtual Memory provides each process an illusion of contiguous memory larger than physical RAM.

### Address Translation in Paging:
Logical Address (Generated by CPU) consists of:
- **Page Number ($p$)**: High-order bits ($m - n$)
- **Page Offset ($d$)**: Low-order bits ($n = \\log_2(\\text{Page Size})$)
Physical Address = $\\text{Frame Number } (f) \\times \\text{Frame Size} + d$.

### Effective Memory Access Time (EMAT):
With a **Translation Lookaside Buffer (TLB)** hit ratio $h$, TLB lookup time $t$, and main memory access time $m$:
$$\\text{EMAT} = h \\cdot (t + m) + (1 - h) \\cdot (t + 2m)$$
(For 2-level paging, page table lookup requires 2 memory accesses, so miss penalty is $t + 3m$).

### Page Replacement Algorithms:
1. **FIFO**: Replaces oldest page. Suffers from **Bélády\'s Anomaly** (increasing frame allocation can actually INCREASE page faults!).
2. **Optimal (MIN / Belady Optimal)**: Replaces page that will not be used for longest time in future. (Theoretical benchmark, cannot be implemented).
3. **LRU (Least Recently Used)**: Replaces page not used for longest time in past. Stack property ensures no Belady\'s Anomaly.
4. **Clock / Second Chance**: Efficient FIFO approximation using 1-bit reference flag.`,
      keyPoints: [
        'Page size is always a power of 2 to allow fast bitwise splitting of address.',
        'Internal Fragmentation occurs on the last page of a process. Paging eliminates external fragmentation.',
        'Inverted Page Table contains one entry per physical frame, reducing memory footprint for large 64-bit address spaces.'
      ],
      formulasAndRules: [
        { title: 'Page Table Size Formula', detail: 'Number of Pages = Virtual Address Space / Page Size. Total Page Table Size = Number of Pages * Page Table Entry (PTE) size.' },
        { title: 'EMAT Formula', detail: 'EMAT = h*(t + m) + (1-h)*(t + (k+1)*m) for k-level paging.' }
      ],
      interviewPitfalls: [
        'Thinking LRU suffers from Belady\'s Anomaly. LRU and Optimal belong to Stack Algorithms and are mathematically immune to Belady\'s anomaly!',
        'Forgetting that TLB hit requires accessing physical memory once for the actual data byte: access time is (t + m), not just t.'
      ],
      gateOrPlacementTip: 'GATE standard question: "Virtual address = 32 bits, Page size = 4 KB, PTE = 4 bytes. What is the size of the single-level page table?" Answer: Page size = 2^12 bytes, so 20 bits page number => 2^20 pages * 4 bytes = 4 MB.'
    },
    quickQuiz: [
      {
        question: 'Which page replacement algorithm can experience an increase in page faults when more physical frames are allocated (Bélády\'s Anomaly)?',
        options: ['LRU (Least Recently Used)', 'Optimal Page Replacement', 'FIFO (First-In First-Out)', 'LFU (Least Frequently Used)'],
        correctAnswer: 2,
        explanation: 'FIFO does not satisfy the stack property. In FIFO, adding frames can disrupt the replacement order and cause more page faults on certain reference strings, known as Bélády\'s Anomaly.'
      }
    ]
  }
];
