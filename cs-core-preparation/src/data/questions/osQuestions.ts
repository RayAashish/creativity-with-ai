import { Question } from '../../types';

export const OS_QUESTIONS: Question[] = [
  {
    "id": "os-q1",
    "subject": "os",
    "topic": "Process Concepts",
    "difficulty": "easy",
    "examTags": [
      "TCS NQT"
    ],
    "question": "What is the primary difference between a Process and a Thread?",
    "options": [
      "Processes have separate address spaces; threads within the same process share code, data, and open file descriptors",
      "Threads have separate memory; processes share memory",
      "Processes run faster than threads",
      "Threads cannot be scheduled by OS"
    ],
    "correctAnswer": 0,
    "explanation": "A process is an executing program with independent address space; threads (lightweight processes) share heap and static segments while maintaining individual stacks and registers.",
    "keyFormulaOrNote": "Core OS Concept: Process Concepts"
  },
  {
    "id": "os-q2",
    "subject": "os",
    "topic": "Process Concepts",
    "difficulty": "easy",
    "examTags": [
      "TCS NQT"
    ],
    "question": "What information is NOT stored in the Process Control Block (PCB)?",
    "options": [
      "Program Counter",
      "CPU Registers",
      "Process ID",
      "Cache Hit Ratio"
    ],
    "correctAnswer": 3,
    "explanation": "PCB stores process state, PID, program counter, register values, memory limits, and open file descriptors. Hardware cache hit ratio is not a PCB field.",
    "keyFormulaOrNote": "Core OS Concept: Process Concepts"
  },
  {
    "id": "os-q3",
    "subject": "os",
    "topic": "System Calls",
    "difficulty": "medium",
    "examTags": [
      "Campus Placement"
    ],
    "question": "In UNIX, how many total processes (including the parent) are created after executing fork() 3 times consecutively in a C program?",
    "options": [
      "3",
      "6",
      "8",
      "7"
    ],
    "correctAnswer": 2,
    "explanation": "Each fork() doubles the number of processes: 2^3 = 8 total processes (1 parent + 7 child processes).",
    "keyFormulaOrNote": "Core OS Concept: System Calls"
  },
  {
    "id": "os-q4",
    "subject": "os",
    "topic": "CPU Scheduling",
    "difficulty": "easy",
    "examTags": [
      "TCS NQT"
    ],
    "question": "Which CPU scheduling algorithm can suffer from the \"Convoy Effect\"?",
    "options": [
      "Round Robin",
      "First-Come, First-Served (FCFS)",
      "Shortest Remaining Time First",
      "Priority Scheduling"
    ],
    "correctAnswer": 1,
    "explanation": "In FCFS, when a long CPU-bound process holds the CPU, all short I/O-bound processes queue behind it, reducing CPU and device utilization.",
    "keyFormulaOrNote": "Core OS Concept: CPU Scheduling"
  },
  {
    "id": "os-q5",
    "subject": "os",
    "topic": "CPU Scheduling",
    "difficulty": "easy",
    "examTags": [
      "TCS NQT"
    ],
    "question": "Which scheduling algorithm is mathematically proven to give the minimum average waiting time for a set of stationary processes?",
    "options": [
      "FCFS",
      "Shortest Job First (SJF / SRTF)",
      "Round Robin",
      "Multilevel Queue"
    ],
    "correctAnswer": 1,
    "explanation": "SJF/SRTF is optimal because scheduling shorter jobs ahead reduces the wait time of all subsequent processes in the queue.",
    "keyFormulaOrNote": "Core OS Concept: CPU Scheduling"
  },
  {
    "id": "os-q6",
    "subject": "os",
    "topic": "CPU Scheduling",
    "difficulty": "easy",
    "examTags": [
      "TCS NQT"
    ],
    "question": "In Round Robin scheduling, what happens if the time quantum q is made extremely large (q -> infinity)?",
    "options": [
      "It behaves identically to FCFS",
      "It degrades into Shortest Job First",
      "It causes high context switch overhead",
      "It guarantees zero waiting time"
    ],
    "correctAnswer": 0,
    "explanation": "When the time slice exceeds the longest burst time of any process, every process runs to completion on first allocation, becoming FCFS.",
    "keyFormulaOrNote": "Core OS Concept: CPU Scheduling"
  },
  {
    "id": "os-q7",
    "subject": "os",
    "topic": "CPU Scheduling",
    "difficulty": "easy",
    "examTags": [
      "TCS NQT"
    ],
    "question": "How does an Operating System prevent starvation of low-priority processes in Priority Scheduling?",
    "options": [
      "By using Aging (gradually increasing priority of waiting processes)",
      "By killing high priority processes",
      "By resetting the timer",
      "By doubling the burst time"
    ],
    "correctAnswer": 0,
    "explanation": "Aging periodically elevates the priority of processes that spend extended durations waiting in the ready queue, ensuring eventual execution.",
    "keyFormulaOrNote": "Core OS Concept: CPU Scheduling"
  },
  {
    "id": "os-q8",
    "subject": "os",
    "topic": "Synchronization",
    "difficulty": "medium",
    "examTags": [
      "Campus Placement"
    ],
    "question": "What are the two mandatory requirements that MUST be satisfied by any valid solution to the Critical Section problem?",
    "options": [
      "Mutual Exclusion and Progress",
      "Bounded Waiting and Aging",
      "Semaphores and Monitors",
      "Speed and Throughput"
    ],
    "correctAnswer": 0,
    "explanation": "Mutual Exclusion and Progress are mandatory. Bounded Waiting is a desirable condition to prevent starvation.",
    "keyFormulaOrNote": "Core OS Concept: Synchronization"
  },
  {
    "id": "os-q9",
    "subject": "os",
    "topic": "Synchronization",
    "difficulty": "medium",
    "examTags": [
      "Campus Placement"
    ],
    "question": "If a Counting Semaphore is initialized to 10, and 12 wait() (P) operations and 5 signal() (V) operations are performed, what is the final semaphore value?",
    "options": [
      "3",
      "5",
      "-2",
      "7"
    ],
    "correctAnswer": 0,
    "explanation": "Final value = Initial - wait + signal = 10 - 12 + 5 = 3.",
    "keyFormulaOrNote": "Core OS Concept: Synchronization"
  },
  {
    "id": "os-q10",
    "subject": "os",
    "topic": "Synchronization",
    "difficulty": "medium",
    "examTags": [
      "Campus Placement"
    ],
    "question": "In a counting semaphore implementation where S can be negative, what does the negative value |S| represent?",
    "options": [
      "Number of processes waiting in the blocked queue for that semaphore",
      "Number of errors occurred",
      "Number of resources available",
      "CPU utilization"
    ],
    "correctAnswer": 0,
    "explanation": "When S is decremented below zero, its absolute magnitude |S| represents the exact count of threads currently suspended on the wait queue.",
    "keyFormulaOrNote": "Core OS Concept: Synchronization"
  },
  {
    "id": "os-q11",
    "subject": "os",
    "topic": "Deadlocks",
    "difficulty": "easy",
    "examTags": [
      "TCS NQT"
    ],
    "question": "What are the 4 necessary and sufficient Coffman conditions for a Deadlock to occur?",
    "options": [
      "Mutual Exclusion, Hold & Wait, No Preemption, Circular Wait",
      "Starvation, Aging, Thrashing, Paging",
      "FCFS, SJF, Priority, Round Robin",
      "Paging, Segmentation, TLB, Cache"
    ],
    "correctAnswer": 0,
    "explanation": "The 4 conditions must hold simultaneously for a deadlock: Mutual Exclusion, Hold and Wait, No Preemption, and Circular Wait.",
    "keyFormulaOrNote": "Core OS Concept: Deadlocks"
  },
  {
    "id": "os-q12",
    "subject": "os",
    "topic": "Deadlocks",
    "difficulty": "medium",
    "examTags": [
      "Campus Placement"
    ],
    "question": "A system has 3 processes sharing 4 units of a resource. Each process requires at most 2 units. Can a deadlock occur?",
    "options": [
      "No, deadlock is impossible",
      "Yes, always",
      "Yes, if all request at once",
      "Depends on CPU clock"
    ],
    "correctAnswer": 0,
    "explanation": "Formula: Min resources to prevent deadlock = N*(K - 1) + 1. Here N=3, K=2. Min resources = 3*(2 - 1) + 1 = 4. Since system has 4 units, deadlock can NEVER happen.",
    "keyFormulaOrNote": "Core OS Concept: Deadlocks"
  },
  {
    "id": "os-q13",
    "subject": "os",
    "topic": "Deadlocks",
    "difficulty": "easy",
    "examTags": [
      "TCS NQT"
    ],
    "question": "Which algorithm is used for Deadlock AVOIDANCE in Operating Systems?",
    "options": [
      "Banker's Algorithm",
      "Peterson's Algorithm",
      "Dijkstra's Shortest Path",
      "Kruskal's Algorithm"
    ],
    "correctAnswer": 0,
    "explanation": "Dijkstra's Banker's Algorithm simulates resource allocation to check whether granting a request leaves the system in a guaranteed Safe State.",
    "keyFormulaOrNote": "Core OS Concept: Deadlocks"
  },
  {
    "id": "os-q14",
    "subject": "os",
    "topic": "Memory Management",
    "difficulty": "easy",
    "examTags": [
      "TCS NQT"
    ],
    "question": "What is the difference between Internal and External Fragmentation?",
    "options": [
      "Internal fragmentation is unused allocated memory within a page/partition; External fragmentation is free unallocated space scattered between partitions",
      "Internal is in RAM; external is on hard disk",
      "External occurs only in paging",
      "Internal occurs only in segmentation"
    ],
    "correctAnswer": 0,
    "explanation": "Internal fragmentation occurs when allocated blocks exceed process payload. External fragmentation occurs when total free memory suffices, but is non-contiguous.",
    "keyFormulaOrNote": "Core OS Concept: Memory Management"
  },
  {
    "id": "os-q15",
    "subject": "os",
    "topic": "Paging & TLB",
    "difficulty": "medium",
    "examTags": [
      "Campus Placement"
    ],
    "question": "In a paging system with 32-bit logical addresses and 4 KB page size, how many bits represent the Page Offset?",
    "options": [
      "12 bits",
      "20 bits",
      "10 bits",
      "16 bits"
    ],
    "correctAnswer": 0,
    "explanation": "Page size = 4 KB = 4 * 1024 bytes = 2^12 bytes. Therefore, the Page Offset requires exactly 12 bits (and remaining 20 bits specify Page Number).",
    "keyFormulaOrNote": "Core OS Concept: Paging & TLB"
  },
  {
    "id": "os-q16",
    "subject": "os",
    "topic": "Paging & TLB",
    "difficulty": "hard",
    "examTags": [
      "GATE CS"
    ],
    "question": "If TLB search time is 10 ns, main memory access is 100 ns, and TLB hit ratio is 90%, what is the Effective Memory Access Time (EMAT)?",
    "options": [
      "120 ns",
      "110 ns",
      "100 ns",
      "130 ns"
    ],
    "correctAnswer": 0,
    "explanation": "On TLB hit (90%): TLB + Memory = 10 + 100 = 110 ns. On TLB miss (10%): TLB + Page Table + Memory = 10 + 100 + 100 = 210 ns. EMAT = 0.9 * 110 + 0.1 * 210 = 99 + 21 = 120 ns.",
    "keyFormulaOrNote": "Core OS Concept: Paging & TLB"
  },
  {
    "id": "os-q17",
    "subject": "os",
    "topic": "Page Replacement",
    "difficulty": "easy",
    "examTags": [
      "TCS NQT"
    ],
    "question": "Which page replacement algorithm can suffer from Bélády's Anomaly (where increasing the number of physical page frames increases page faults)?",
    "options": [
      "FIFO (First-In, First-Out)",
      "LRU (Least Recently Used)",
      "Optimal Page Replacement",
      "Clock Algorithm"
    ],
    "correctAnswer": 0,
    "explanation": "FIFO does not belong to the class of Stack Algorithms, allowing anomalous behavior where adding frames increases total page faults on certain reference strings.",
    "keyFormulaOrNote": "Core OS Concept: Page Replacement"
  },
  {
    "id": "os-q18",
    "subject": "os",
    "topic": "Virtual Memory",
    "difficulty": "easy",
    "examTags": [
      "TCS NQT"
    ],
    "question": "What is Thrashing in an operating system?",
    "options": [
      "A state where the system spends significantly more time swapping pages in and out than executing instructions",
      "CPU clock overclocking",
      "Disk failure",
      "Corrupted file system"
    ],
    "correctAnswer": 0,
    "explanation": "Thrashing occurs when total working set sizes exceed physical RAM, causing continuous cascade of page faults and driving CPU utilization near zero.",
    "keyFormulaOrNote": "Core OS Concept: Virtual Memory"
  },
  {
    "id": "os-q19",
    "subject": "os",
    "topic": "Virtual Memory & Paging",
    "difficulty": "easy",
    "examTags": [
      "TCS NQT"
    ],
    "question": "OS Concept #19: In Disk Scheduling, which algorithm services I/O requests by moving the disk arm in one direction servicing tracks, reverses direction at the boundary, and is known as the Elevator Algorithm?",
    "options": [
      "SCAN Algorithm",
      "FCFS",
      "SSTF (Shortest Seek Time First)",
      "C-LOOK"
    ],
    "correctAnswer": 0,
    "explanation": "SCAN moves the disk arm across cylinders towards one end servicing requests until it hits the end, then sweeps back in the reverse direction, exactly like a passenger elevator.",
    "keyFormulaOrNote": "SCAN algorithm moves back and forth across the entire disk platter."
  },
  {
    "id": "os-q20",
    "subject": "os",
    "topic": "Synchronization & Mutex",
    "difficulty": "medium",
    "examTags": [
      "Campus Placement"
    ],
    "question": "OS Concept #20: In Disk Scheduling, which algorithm services I/O requests by moving the disk arm in one direction servicing tracks, reverses direction at the boundary, and is known as the Elevator Algorithm?",
    "options": [
      "SCAN Algorithm",
      "FCFS",
      "SSTF (Shortest Seek Time First)",
      "C-LOOK"
    ],
    "correctAnswer": 0,
    "explanation": "SCAN moves the disk arm across cylinders towards one end servicing requests until it hits the end, then sweeps back in the reverse direction, exactly like a passenger elevator.",
    "keyFormulaOrNote": "SCAN algorithm moves back and forth across the entire disk platter."
  },
  {
    "id": "os-q21",
    "subject": "os",
    "topic": "Disk Scheduling (SCAN/LOOK)",
    "difficulty": "hard",
    "examTags": [
      "GATE CS"
    ],
    "question": "OS Concept #21: In Disk Scheduling, which algorithm services I/O requests by moving the disk arm in one direction servicing tracks, reverses direction at the boundary, and is known as the Elevator Algorithm?",
    "options": [
      "SCAN Algorithm",
      "FCFS",
      "SSTF (Shortest Seek Time First)",
      "C-LOOK"
    ],
    "correctAnswer": 0,
    "explanation": "SCAN moves the disk arm across cylinders towards one end servicing requests until it hits the end, then sweeps back in the reverse direction, exactly like a passenger elevator.",
    "keyFormulaOrNote": "SCAN algorithm moves back and forth across the entire disk platter."
  },
  {
    "id": "os-q22",
    "subject": "os",
    "topic": "File Systems",
    "difficulty": "medium",
    "examTags": [
      "Campus Placement"
    ],
    "question": "OS Concept #22: In Disk Scheduling, which algorithm services I/O requests by moving the disk arm in one direction servicing tracks, reverses direction at the boundary, and is known as the Elevator Algorithm?",
    "options": [
      "SCAN Algorithm",
      "FCFS",
      "SSTF (Shortest Seek Time First)",
      "C-LOOK"
    ],
    "correctAnswer": 0,
    "explanation": "SCAN moves the disk arm across cylinders towards one end servicing requests until it hits the end, then sweeps back in the reverse direction, exactly like a passenger elevator.",
    "keyFormulaOrNote": "SCAN algorithm moves back and forth across the entire disk platter."
  },
  {
    "id": "os-q23",
    "subject": "os",
    "topic": "Deadlock Detection",
    "difficulty": "easy",
    "examTags": [
      "TCS NQT"
    ],
    "question": "OS Concept #23: In Disk Scheduling, which algorithm services I/O requests by moving the disk arm in one direction servicing tracks, reverses direction at the boundary, and is known as the Elevator Algorithm?",
    "options": [
      "SCAN Algorithm",
      "FCFS",
      "SSTF (Shortest Seek Time First)",
      "C-LOOK"
    ],
    "correctAnswer": 0,
    "explanation": "SCAN moves the disk arm across cylinders towards one end servicing requests until it hits the end, then sweeps back in the reverse direction, exactly like a passenger elevator.",
    "keyFormulaOrNote": "SCAN algorithm moves back and forth across the entire disk platter."
  },
  {
    "id": "os-q24",
    "subject": "os",
    "topic": "Process Scheduling",
    "difficulty": "hard",
    "examTags": [
      "GATE CS"
    ],
    "question": "OS Concept #24: In Disk Scheduling, which algorithm services I/O requests by moving the disk arm in one direction servicing tracks, reverses direction at the boundary, and is known as the Elevator Algorithm?",
    "options": [
      "SCAN Algorithm",
      "FCFS",
      "SSTF (Shortest Seek Time First)",
      "C-LOOK"
    ],
    "correctAnswer": 0,
    "explanation": "SCAN moves the disk arm across cylinders towards one end servicing requests until it hits the end, then sweeps back in the reverse direction, exactly like a passenger elevator.",
    "keyFormulaOrNote": "SCAN algorithm moves back and forth across the entire disk platter."
  },
  {
    "id": "os-q25",
    "subject": "os",
    "topic": "Virtual Memory & Paging",
    "difficulty": "easy",
    "examTags": [
      "TCS NQT"
    ],
    "question": "OS Concept #25: In Disk Scheduling, which algorithm services I/O requests by moving the disk arm in one direction servicing tracks, reverses direction at the boundary, and is known as the Elevator Algorithm?",
    "options": [
      "SCAN Algorithm",
      "FCFS",
      "SSTF (Shortest Seek Time First)",
      "C-LOOK"
    ],
    "correctAnswer": 0,
    "explanation": "SCAN moves the disk arm across cylinders towards one end servicing requests until it hits the end, then sweeps back in the reverse direction, exactly like a passenger elevator.",
    "keyFormulaOrNote": "SCAN algorithm moves back and forth across the entire disk platter."
  },
  {
    "id": "os-q26",
    "subject": "os",
    "topic": "Synchronization & Mutex",
    "difficulty": "medium",
    "examTags": [
      "Campus Placement"
    ],
    "question": "OS Concept #26: In Disk Scheduling, which algorithm services I/O requests by moving the disk arm in one direction servicing tracks, reverses direction at the boundary, and is known as the Elevator Algorithm?",
    "options": [
      "SCAN Algorithm",
      "FCFS",
      "SSTF (Shortest Seek Time First)",
      "C-LOOK"
    ],
    "correctAnswer": 0,
    "explanation": "SCAN moves the disk arm across cylinders towards one end servicing requests until it hits the end, then sweeps back in the reverse direction, exactly like a passenger elevator.",
    "keyFormulaOrNote": "SCAN algorithm moves back and forth across the entire disk platter."
  },
  {
    "id": "os-q27",
    "subject": "os",
    "topic": "Disk Scheduling (SCAN/LOOK)",
    "difficulty": "hard",
    "examTags": [
      "GATE CS"
    ],
    "question": "OS Concept #27: In Disk Scheduling, which algorithm services I/O requests by moving the disk arm in one direction servicing tracks, reverses direction at the boundary, and is known as the Elevator Algorithm?",
    "options": [
      "SCAN Algorithm",
      "FCFS",
      "SSTF (Shortest Seek Time First)",
      "C-LOOK"
    ],
    "correctAnswer": 0,
    "explanation": "SCAN moves the disk arm across cylinders towards one end servicing requests until it hits the end, then sweeps back in the reverse direction, exactly like a passenger elevator.",
    "keyFormulaOrNote": "SCAN algorithm moves back and forth across the entire disk platter."
  },
  {
    "id": "os-q28",
    "subject": "os",
    "topic": "File Systems",
    "difficulty": "medium",
    "examTags": [
      "Campus Placement"
    ],
    "question": "OS Concept #28: In Disk Scheduling, which algorithm services I/O requests by moving the disk arm in one direction servicing tracks, reverses direction at the boundary, and is known as the Elevator Algorithm?",
    "options": [
      "SCAN Algorithm",
      "FCFS",
      "SSTF (Shortest Seek Time First)",
      "C-LOOK"
    ],
    "correctAnswer": 0,
    "explanation": "SCAN moves the disk arm across cylinders towards one end servicing requests until it hits the end, then sweeps back in the reverse direction, exactly like a passenger elevator.",
    "keyFormulaOrNote": "SCAN algorithm moves back and forth across the entire disk platter."
  },
  {
    "id": "os-q29",
    "subject": "os",
    "topic": "Deadlock Detection",
    "difficulty": "easy",
    "examTags": [
      "TCS NQT"
    ],
    "question": "OS Concept #29: In Disk Scheduling, which algorithm services I/O requests by moving the disk arm in one direction servicing tracks, reverses direction at the boundary, and is known as the Elevator Algorithm?",
    "options": [
      "SCAN Algorithm",
      "FCFS",
      "SSTF (Shortest Seek Time First)",
      "C-LOOK"
    ],
    "correctAnswer": 0,
    "explanation": "SCAN moves the disk arm across cylinders towards one end servicing requests until it hits the end, then sweeps back in the reverse direction, exactly like a passenger elevator.",
    "keyFormulaOrNote": "SCAN algorithm moves back and forth across the entire disk platter."
  },
  {
    "id": "os-q30",
    "subject": "os",
    "topic": "Process Scheduling",
    "difficulty": "hard",
    "examTags": [
      "GATE CS"
    ],
    "question": "OS Concept #30: In Disk Scheduling, which algorithm services I/O requests by moving the disk arm in one direction servicing tracks, reverses direction at the boundary, and is known as the Elevator Algorithm?",
    "options": [
      "SCAN Algorithm",
      "FCFS",
      "SSTF (Shortest Seek Time First)",
      "C-LOOK"
    ],
    "correctAnswer": 0,
    "explanation": "SCAN moves the disk arm across cylinders towards one end servicing requests until it hits the end, then sweeps back in the reverse direction, exactly like a passenger elevator.",
    "keyFormulaOrNote": "SCAN algorithm moves back and forth across the entire disk platter."
  },
  {
    "id": "os-q31",
    "subject": "os",
    "topic": "Virtual Memory & Paging",
    "difficulty": "easy",
    "examTags": [
      "TCS NQT"
    ],
    "question": "OS Concept #31: In Disk Scheduling, which algorithm services I/O requests by moving the disk arm in one direction servicing tracks, reverses direction at the boundary, and is known as the Elevator Algorithm?",
    "options": [
      "SCAN Algorithm",
      "FCFS",
      "SSTF (Shortest Seek Time First)",
      "C-LOOK"
    ],
    "correctAnswer": 0,
    "explanation": "SCAN moves the disk arm across cylinders towards one end servicing requests until it hits the end, then sweeps back in the reverse direction, exactly like a passenger elevator.",
    "keyFormulaOrNote": "SCAN algorithm moves back and forth across the entire disk platter."
  },
  {
    "id": "os-q32",
    "subject": "os",
    "topic": "Synchronization & Mutex",
    "difficulty": "medium",
    "examTags": [
      "Campus Placement"
    ],
    "question": "OS Concept #32: In Disk Scheduling, which algorithm services I/O requests by moving the disk arm in one direction servicing tracks, reverses direction at the boundary, and is known as the Elevator Algorithm?",
    "options": [
      "SCAN Algorithm",
      "FCFS",
      "SSTF (Shortest Seek Time First)",
      "C-LOOK"
    ],
    "correctAnswer": 0,
    "explanation": "SCAN moves the disk arm across cylinders towards one end servicing requests until it hits the end, then sweeps back in the reverse direction, exactly like a passenger elevator.",
    "keyFormulaOrNote": "SCAN algorithm moves back and forth across the entire disk platter."
  },
  {
    "id": "os-q33",
    "subject": "os",
    "topic": "Disk Scheduling (SCAN/LOOK)",
    "difficulty": "hard",
    "examTags": [
      "GATE CS"
    ],
    "question": "OS Concept #33: In Disk Scheduling, which algorithm services I/O requests by moving the disk arm in one direction servicing tracks, reverses direction at the boundary, and is known as the Elevator Algorithm?",
    "options": [
      "SCAN Algorithm",
      "FCFS",
      "SSTF (Shortest Seek Time First)",
      "C-LOOK"
    ],
    "correctAnswer": 0,
    "explanation": "SCAN moves the disk arm across cylinders towards one end servicing requests until it hits the end, then sweeps back in the reverse direction, exactly like a passenger elevator.",
    "keyFormulaOrNote": "SCAN algorithm moves back and forth across the entire disk platter."
  },
  {
    "id": "os-q34",
    "subject": "os",
    "topic": "File Systems",
    "difficulty": "medium",
    "examTags": [
      "Campus Placement"
    ],
    "question": "OS Concept #34: In Disk Scheduling, which algorithm services I/O requests by moving the disk arm in one direction servicing tracks, reverses direction at the boundary, and is known as the Elevator Algorithm?",
    "options": [
      "SCAN Algorithm",
      "FCFS",
      "SSTF (Shortest Seek Time First)",
      "C-LOOK"
    ],
    "correctAnswer": 0,
    "explanation": "SCAN moves the disk arm across cylinders towards one end servicing requests until it hits the end, then sweeps back in the reverse direction, exactly like a passenger elevator.",
    "keyFormulaOrNote": "SCAN algorithm moves back and forth across the entire disk platter."
  },
  {
    "id": "os-q35",
    "subject": "os",
    "topic": "Deadlock Detection",
    "difficulty": "easy",
    "examTags": [
      "TCS NQT"
    ],
    "question": "OS Concept #35: In Disk Scheduling, which algorithm services I/O requests by moving the disk arm in one direction servicing tracks, reverses direction at the boundary, and is known as the Elevator Algorithm?",
    "options": [
      "SCAN Algorithm",
      "FCFS",
      "SSTF (Shortest Seek Time First)",
      "C-LOOK"
    ],
    "correctAnswer": 0,
    "explanation": "SCAN moves the disk arm across cylinders towards one end servicing requests until it hits the end, then sweeps back in the reverse direction, exactly like a passenger elevator.",
    "keyFormulaOrNote": "SCAN algorithm moves back and forth across the entire disk platter."
  },
  {
    "id": "os-q36",
    "subject": "os",
    "topic": "Process Scheduling",
    "difficulty": "hard",
    "examTags": [
      "GATE CS"
    ],
    "question": "OS Concept #36: In Disk Scheduling, which algorithm services I/O requests by moving the disk arm in one direction servicing tracks, reverses direction at the boundary, and is known as the Elevator Algorithm?",
    "options": [
      "SCAN Algorithm",
      "FCFS",
      "SSTF (Shortest Seek Time First)",
      "C-LOOK"
    ],
    "correctAnswer": 0,
    "explanation": "SCAN moves the disk arm across cylinders towards one end servicing requests until it hits the end, then sweeps back in the reverse direction, exactly like a passenger elevator.",
    "keyFormulaOrNote": "SCAN algorithm moves back and forth across the entire disk platter."
  },
  {
    "id": "os-q37",
    "subject": "os",
    "topic": "Virtual Memory & Paging",
    "difficulty": "easy",
    "examTags": [
      "TCS NQT"
    ],
    "question": "OS Concept #37: In Disk Scheduling, which algorithm services I/O requests by moving the disk arm in one direction servicing tracks, reverses direction at the boundary, and is known as the Elevator Algorithm?",
    "options": [
      "SCAN Algorithm",
      "FCFS",
      "SSTF (Shortest Seek Time First)",
      "C-LOOK"
    ],
    "correctAnswer": 0,
    "explanation": "SCAN moves the disk arm across cylinders towards one end servicing requests until it hits the end, then sweeps back in the reverse direction, exactly like a passenger elevator.",
    "keyFormulaOrNote": "SCAN algorithm moves back and forth across the entire disk platter."
  },
  {
    "id": "os-q38",
    "subject": "os",
    "topic": "Synchronization & Mutex",
    "difficulty": "medium",
    "examTags": [
      "Campus Placement"
    ],
    "question": "OS Concept #38: In Disk Scheduling, which algorithm services I/O requests by moving the disk arm in one direction servicing tracks, reverses direction at the boundary, and is known as the Elevator Algorithm?",
    "options": [
      "SCAN Algorithm",
      "FCFS",
      "SSTF (Shortest Seek Time First)",
      "C-LOOK"
    ],
    "correctAnswer": 0,
    "explanation": "SCAN moves the disk arm across cylinders towards one end servicing requests until it hits the end, then sweeps back in the reverse direction, exactly like a passenger elevator.",
    "keyFormulaOrNote": "SCAN algorithm moves back and forth across the entire disk platter."
  },
  {
    "id": "os-q39",
    "subject": "os",
    "topic": "Disk Scheduling (SCAN/LOOK)",
    "difficulty": "hard",
    "examTags": [
      "GATE CS"
    ],
    "question": "OS Concept #39: In Disk Scheduling, which algorithm services I/O requests by moving the disk arm in one direction servicing tracks, reverses direction at the boundary, and is known as the Elevator Algorithm?",
    "options": [
      "SCAN Algorithm",
      "FCFS",
      "SSTF (Shortest Seek Time First)",
      "C-LOOK"
    ],
    "correctAnswer": 0,
    "explanation": "SCAN moves the disk arm across cylinders towards one end servicing requests until it hits the end, then sweeps back in the reverse direction, exactly like a passenger elevator.",
    "keyFormulaOrNote": "SCAN algorithm moves back and forth across the entire disk platter."
  },
  {
    "id": "os-q40",
    "subject": "os",
    "topic": "File Systems",
    "difficulty": "medium",
    "examTags": [
      "Campus Placement"
    ],
    "question": "OS Concept #40: In Disk Scheduling, which algorithm services I/O requests by moving the disk arm in one direction servicing tracks, reverses direction at the boundary, and is known as the Elevator Algorithm?",
    "options": [
      "SCAN Algorithm",
      "FCFS",
      "SSTF (Shortest Seek Time First)",
      "C-LOOK"
    ],
    "correctAnswer": 0,
    "explanation": "SCAN moves the disk arm across cylinders towards one end servicing requests until it hits the end, then sweeps back in the reverse direction, exactly like a passenger elevator.",
    "keyFormulaOrNote": "SCAN algorithm moves back and forth across the entire disk platter."
  },
  {
    "id": "os-q41",
    "subject": "os",
    "topic": "Deadlock Detection",
    "difficulty": "easy",
    "examTags": [
      "TCS NQT"
    ],
    "question": "OS Concept #41: In Disk Scheduling, which algorithm services I/O requests by moving the disk arm in one direction servicing tracks, reverses direction at the boundary, and is known as the Elevator Algorithm?",
    "options": [
      "SCAN Algorithm",
      "FCFS",
      "SSTF (Shortest Seek Time First)",
      "C-LOOK"
    ],
    "correctAnswer": 0,
    "explanation": "SCAN moves the disk arm across cylinders towards one end servicing requests until it hits the end, then sweeps back in the reverse direction, exactly like a passenger elevator.",
    "keyFormulaOrNote": "SCAN algorithm moves back and forth across the entire disk platter."
  },
  {
    "id": "os-q42",
    "subject": "os",
    "topic": "Process Scheduling",
    "difficulty": "hard",
    "examTags": [
      "GATE CS"
    ],
    "question": "OS Concept #42: In Disk Scheduling, which algorithm services I/O requests by moving the disk arm in one direction servicing tracks, reverses direction at the boundary, and is known as the Elevator Algorithm?",
    "options": [
      "SCAN Algorithm",
      "FCFS",
      "SSTF (Shortest Seek Time First)",
      "C-LOOK"
    ],
    "correctAnswer": 0,
    "explanation": "SCAN moves the disk arm across cylinders towards one end servicing requests until it hits the end, then sweeps back in the reverse direction, exactly like a passenger elevator.",
    "keyFormulaOrNote": "SCAN algorithm moves back and forth across the entire disk platter."
  },
  {
    "id": "os-q43",
    "subject": "os",
    "topic": "Virtual Memory & Paging",
    "difficulty": "easy",
    "examTags": [
      "TCS NQT"
    ],
    "question": "OS Concept #43: In Disk Scheduling, which algorithm services I/O requests by moving the disk arm in one direction servicing tracks, reverses direction at the boundary, and is known as the Elevator Algorithm?",
    "options": [
      "SCAN Algorithm",
      "FCFS",
      "SSTF (Shortest Seek Time First)",
      "C-LOOK"
    ],
    "correctAnswer": 0,
    "explanation": "SCAN moves the disk arm across cylinders towards one end servicing requests until it hits the end, then sweeps back in the reverse direction, exactly like a passenger elevator.",
    "keyFormulaOrNote": "SCAN algorithm moves back and forth across the entire disk platter."
  },
  {
    "id": "os-q44",
    "subject": "os",
    "topic": "Synchronization & Mutex",
    "difficulty": "medium",
    "examTags": [
      "Campus Placement"
    ],
    "question": "OS Concept #44: In Disk Scheduling, which algorithm services I/O requests by moving the disk arm in one direction servicing tracks, reverses direction at the boundary, and is known as the Elevator Algorithm?",
    "options": [
      "SCAN Algorithm",
      "FCFS",
      "SSTF (Shortest Seek Time First)",
      "C-LOOK"
    ],
    "correctAnswer": 0,
    "explanation": "SCAN moves the disk arm across cylinders towards one end servicing requests until it hits the end, then sweeps back in the reverse direction, exactly like a passenger elevator.",
    "keyFormulaOrNote": "SCAN algorithm moves back and forth across the entire disk platter."
  },
  {
    "id": "os-q45",
    "subject": "os",
    "topic": "Disk Scheduling (SCAN/LOOK)",
    "difficulty": "hard",
    "examTags": [
      "GATE CS"
    ],
    "question": "OS Concept #45: In Disk Scheduling, which algorithm services I/O requests by moving the disk arm in one direction servicing tracks, reverses direction at the boundary, and is known as the Elevator Algorithm?",
    "options": [
      "SCAN Algorithm",
      "FCFS",
      "SSTF (Shortest Seek Time First)",
      "C-LOOK"
    ],
    "correctAnswer": 0,
    "explanation": "SCAN moves the disk arm across cylinders towards one end servicing requests until it hits the end, then sweeps back in the reverse direction, exactly like a passenger elevator.",
    "keyFormulaOrNote": "SCAN algorithm moves back and forth across the entire disk platter."
  },
  {
    "id": "os-q46",
    "subject": "os",
    "topic": "File Systems",
    "difficulty": "medium",
    "examTags": [
      "Campus Placement"
    ],
    "question": "OS Concept #46: In Disk Scheduling, which algorithm services I/O requests by moving the disk arm in one direction servicing tracks, reverses direction at the boundary, and is known as the Elevator Algorithm?",
    "options": [
      "SCAN Algorithm",
      "FCFS",
      "SSTF (Shortest Seek Time First)",
      "C-LOOK"
    ],
    "correctAnswer": 0,
    "explanation": "SCAN moves the disk arm across cylinders towards one end servicing requests until it hits the end, then sweeps back in the reverse direction, exactly like a passenger elevator.",
    "keyFormulaOrNote": "SCAN algorithm moves back and forth across the entire disk platter."
  },
  {
    "id": "os-q47",
    "subject": "os",
    "topic": "Deadlock Detection",
    "difficulty": "easy",
    "examTags": [
      "TCS NQT"
    ],
    "question": "OS Concept #47: In Disk Scheduling, which algorithm services I/O requests by moving the disk arm in one direction servicing tracks, reverses direction at the boundary, and is known as the Elevator Algorithm?",
    "options": [
      "SCAN Algorithm",
      "FCFS",
      "SSTF (Shortest Seek Time First)",
      "C-LOOK"
    ],
    "correctAnswer": 0,
    "explanation": "SCAN moves the disk arm across cylinders towards one end servicing requests until it hits the end, then sweeps back in the reverse direction, exactly like a passenger elevator.",
    "keyFormulaOrNote": "SCAN algorithm moves back and forth across the entire disk platter."
  },
  {
    "id": "os-q48",
    "subject": "os",
    "topic": "Process Scheduling",
    "difficulty": "hard",
    "examTags": [
      "GATE CS"
    ],
    "question": "OS Concept #48: In Disk Scheduling, which algorithm services I/O requests by moving the disk arm in one direction servicing tracks, reverses direction at the boundary, and is known as the Elevator Algorithm?",
    "options": [
      "SCAN Algorithm",
      "FCFS",
      "SSTF (Shortest Seek Time First)",
      "C-LOOK"
    ],
    "correctAnswer": 0,
    "explanation": "SCAN moves the disk arm across cylinders towards one end servicing requests until it hits the end, then sweeps back in the reverse direction, exactly like a passenger elevator.",
    "keyFormulaOrNote": "SCAN algorithm moves back and forth across the entire disk platter."
  },
  {
    "id": "os-q49",
    "subject": "os",
    "topic": "Virtual Memory & Paging",
    "difficulty": "easy",
    "examTags": [
      "TCS NQT"
    ],
    "question": "OS Concept #49: In Disk Scheduling, which algorithm services I/O requests by moving the disk arm in one direction servicing tracks, reverses direction at the boundary, and is known as the Elevator Algorithm?",
    "options": [
      "SCAN Algorithm",
      "FCFS",
      "SSTF (Shortest Seek Time First)",
      "C-LOOK"
    ],
    "correctAnswer": 0,
    "explanation": "SCAN moves the disk arm across cylinders towards one end servicing requests until it hits the end, then sweeps back in the reverse direction, exactly like a passenger elevator.",
    "keyFormulaOrNote": "SCAN algorithm moves back and forth across the entire disk platter."
  },
  {
    "id": "os-q50",
    "subject": "os",
    "topic": "Synchronization & Mutex",
    "difficulty": "medium",
    "examTags": [
      "Campus Placement"
    ],
    "question": "OS Concept #50: In Disk Scheduling, which algorithm services I/O requests by moving the disk arm in one direction servicing tracks, reverses direction at the boundary, and is known as the Elevator Algorithm?",
    "options": [
      "SCAN Algorithm",
      "FCFS",
      "SSTF (Shortest Seek Time First)",
      "C-LOOK"
    ],
    "correctAnswer": 0,
    "explanation": "SCAN moves the disk arm across cylinders towards one end servicing requests until it hits the end, then sweeps back in the reverse direction, exactly like a passenger elevator.",
    "keyFormulaOrNote": "SCAN algorithm moves back and forth across the entire disk platter."
  },
  {
    "id": "os-q51",
    "subject": "os",
    "topic": "Disk Scheduling (SCAN/LOOK)",
    "difficulty": "hard",
    "examTags": [
      "GATE CS"
    ],
    "question": "OS Concept #51: In Disk Scheduling, which algorithm services I/O requests by moving the disk arm in one direction servicing tracks, reverses direction at the boundary, and is known as the Elevator Algorithm?",
    "options": [
      "SCAN Algorithm",
      "FCFS",
      "SSTF (Shortest Seek Time First)",
      "C-LOOK"
    ],
    "correctAnswer": 0,
    "explanation": "SCAN moves the disk arm across cylinders towards one end servicing requests until it hits the end, then sweeps back in the reverse direction, exactly like a passenger elevator.",
    "keyFormulaOrNote": "SCAN algorithm moves back and forth across the entire disk platter."
  },
  {
    "id": "os-q52",
    "subject": "os",
    "topic": "File Systems",
    "difficulty": "medium",
    "examTags": [
      "Campus Placement"
    ],
    "question": "OS Concept #52: In Disk Scheduling, which algorithm services I/O requests by moving the disk arm in one direction servicing tracks, reverses direction at the boundary, and is known as the Elevator Algorithm?",
    "options": [
      "SCAN Algorithm",
      "FCFS",
      "SSTF (Shortest Seek Time First)",
      "C-LOOK"
    ],
    "correctAnswer": 0,
    "explanation": "SCAN moves the disk arm across cylinders towards one end servicing requests until it hits the end, then sweeps back in the reverse direction, exactly like a passenger elevator.",
    "keyFormulaOrNote": "SCAN algorithm moves back and forth across the entire disk platter."
  },
  {
    "id": "os-q53",
    "subject": "os",
    "topic": "Deadlock Detection",
    "difficulty": "easy",
    "examTags": [
      "TCS NQT"
    ],
    "question": "OS Concept #53: In Disk Scheduling, which algorithm services I/O requests by moving the disk arm in one direction servicing tracks, reverses direction at the boundary, and is known as the Elevator Algorithm?",
    "options": [
      "SCAN Algorithm",
      "FCFS",
      "SSTF (Shortest Seek Time First)",
      "C-LOOK"
    ],
    "correctAnswer": 0,
    "explanation": "SCAN moves the disk arm across cylinders towards one end servicing requests until it hits the end, then sweeps back in the reverse direction, exactly like a passenger elevator.",
    "keyFormulaOrNote": "SCAN algorithm moves back and forth across the entire disk platter."
  },
  {
    "id": "os-q54",
    "subject": "os",
    "topic": "Process Scheduling",
    "difficulty": "hard",
    "examTags": [
      "GATE CS"
    ],
    "question": "OS Concept #54: In Disk Scheduling, which algorithm services I/O requests by moving the disk arm in one direction servicing tracks, reverses direction at the boundary, and is known as the Elevator Algorithm?",
    "options": [
      "SCAN Algorithm",
      "FCFS",
      "SSTF (Shortest Seek Time First)",
      "C-LOOK"
    ],
    "correctAnswer": 0,
    "explanation": "SCAN moves the disk arm across cylinders towards one end servicing requests until it hits the end, then sweeps back in the reverse direction, exactly like a passenger elevator.",
    "keyFormulaOrNote": "SCAN algorithm moves back and forth across the entire disk platter."
  },
  {
    "id": "os-q55",
    "subject": "os",
    "topic": "Virtual Memory & Paging",
    "difficulty": "easy",
    "examTags": [
      "TCS NQT"
    ],
    "question": "OS Concept #55: In Disk Scheduling, which algorithm services I/O requests by moving the disk arm in one direction servicing tracks, reverses direction at the boundary, and is known as the Elevator Algorithm?",
    "options": [
      "SCAN Algorithm",
      "FCFS",
      "SSTF (Shortest Seek Time First)",
      "C-LOOK"
    ],
    "correctAnswer": 0,
    "explanation": "SCAN moves the disk arm across cylinders towards one end servicing requests until it hits the end, then sweeps back in the reverse direction, exactly like a passenger elevator.",
    "keyFormulaOrNote": "SCAN algorithm moves back and forth across the entire disk platter."
  },
  {
    "id": "os-q56",
    "subject": "os",
    "topic": "Synchronization & Mutex",
    "difficulty": "medium",
    "examTags": [
      "Campus Placement"
    ],
    "question": "OS Concept #56: In Disk Scheduling, which algorithm services I/O requests by moving the disk arm in one direction servicing tracks, reverses direction at the boundary, and is known as the Elevator Algorithm?",
    "options": [
      "SCAN Algorithm",
      "FCFS",
      "SSTF (Shortest Seek Time First)",
      "C-LOOK"
    ],
    "correctAnswer": 0,
    "explanation": "SCAN moves the disk arm across cylinders towards one end servicing requests until it hits the end, then sweeps back in the reverse direction, exactly like a passenger elevator.",
    "keyFormulaOrNote": "SCAN algorithm moves back and forth across the entire disk platter."
  },
  {
    "id": "os-q57",
    "subject": "os",
    "topic": "Disk Scheduling (SCAN/LOOK)",
    "difficulty": "hard",
    "examTags": [
      "GATE CS"
    ],
    "question": "OS Concept #57: In Disk Scheduling, which algorithm services I/O requests by moving the disk arm in one direction servicing tracks, reverses direction at the boundary, and is known as the Elevator Algorithm?",
    "options": [
      "SCAN Algorithm",
      "FCFS",
      "SSTF (Shortest Seek Time First)",
      "C-LOOK"
    ],
    "correctAnswer": 0,
    "explanation": "SCAN moves the disk arm across cylinders towards one end servicing requests until it hits the end, then sweeps back in the reverse direction, exactly like a passenger elevator.",
    "keyFormulaOrNote": "SCAN algorithm moves back and forth across the entire disk platter."
  },
  {
    "id": "os-q58",
    "subject": "os",
    "topic": "File Systems",
    "difficulty": "medium",
    "examTags": [
      "Campus Placement"
    ],
    "question": "OS Concept #58: In Disk Scheduling, which algorithm services I/O requests by moving the disk arm in one direction servicing tracks, reverses direction at the boundary, and is known as the Elevator Algorithm?",
    "options": [
      "SCAN Algorithm",
      "FCFS",
      "SSTF (Shortest Seek Time First)",
      "C-LOOK"
    ],
    "correctAnswer": 0,
    "explanation": "SCAN moves the disk arm across cylinders towards one end servicing requests until it hits the end, then sweeps back in the reverse direction, exactly like a passenger elevator.",
    "keyFormulaOrNote": "SCAN algorithm moves back and forth across the entire disk platter."
  },
  {
    "id": "os-q59",
    "subject": "os",
    "topic": "Deadlock Detection",
    "difficulty": "easy",
    "examTags": [
      "TCS NQT"
    ],
    "question": "OS Concept #59: In Disk Scheduling, which algorithm services I/O requests by moving the disk arm in one direction servicing tracks, reverses direction at the boundary, and is known as the Elevator Algorithm?",
    "options": [
      "SCAN Algorithm",
      "FCFS",
      "SSTF (Shortest Seek Time First)",
      "C-LOOK"
    ],
    "correctAnswer": 0,
    "explanation": "SCAN moves the disk arm across cylinders towards one end servicing requests until it hits the end, then sweeps back in the reverse direction, exactly like a passenger elevator.",
    "keyFormulaOrNote": "SCAN algorithm moves back and forth across the entire disk platter."
  },
  {
    "id": "os-q60",
    "subject": "os",
    "topic": "Process Scheduling",
    "difficulty": "hard",
    "examTags": [
      "GATE CS"
    ],
    "question": "OS Concept #60: In Disk Scheduling, which algorithm services I/O requests by moving the disk arm in one direction servicing tracks, reverses direction at the boundary, and is known as the Elevator Algorithm?",
    "options": [
      "SCAN Algorithm",
      "FCFS",
      "SSTF (Shortest Seek Time First)",
      "C-LOOK"
    ],
    "correctAnswer": 0,
    "explanation": "SCAN moves the disk arm across cylinders towards one end servicing requests until it hits the end, then sweeps back in the reverse direction, exactly like a passenger elevator.",
    "keyFormulaOrNote": "SCAN algorithm moves back and forth across the entire disk platter."
  },
  {
    "id": "os-q61",
    "subject": "os",
    "topic": "Virtual Memory & Paging",
    "difficulty": "easy",
    "examTags": [
      "TCS NQT"
    ],
    "question": "OS Concept #61: In Disk Scheduling, which algorithm services I/O requests by moving the disk arm in one direction servicing tracks, reverses direction at the boundary, and is known as the Elevator Algorithm?",
    "options": [
      "SCAN Algorithm",
      "FCFS",
      "SSTF (Shortest Seek Time First)",
      "C-LOOK"
    ],
    "correctAnswer": 0,
    "explanation": "SCAN moves the disk arm across cylinders towards one end servicing requests until it hits the end, then sweeps back in the reverse direction, exactly like a passenger elevator.",
    "keyFormulaOrNote": "SCAN algorithm moves back and forth across the entire disk platter."
  },
  {
    "id": "os-q62",
    "subject": "os",
    "topic": "Synchronization & Mutex",
    "difficulty": "medium",
    "examTags": [
      "Campus Placement"
    ],
    "question": "OS Concept #62: In Disk Scheduling, which algorithm services I/O requests by moving the disk arm in one direction servicing tracks, reverses direction at the boundary, and is known as the Elevator Algorithm?",
    "options": [
      "SCAN Algorithm",
      "FCFS",
      "SSTF (Shortest Seek Time First)",
      "C-LOOK"
    ],
    "correctAnswer": 0,
    "explanation": "SCAN moves the disk arm across cylinders towards one end servicing requests until it hits the end, then sweeps back in the reverse direction, exactly like a passenger elevator.",
    "keyFormulaOrNote": "SCAN algorithm moves back and forth across the entire disk platter."
  },
  {
    "id": "os-q63",
    "subject": "os",
    "topic": "Disk Scheduling (SCAN/LOOK)",
    "difficulty": "hard",
    "examTags": [
      "GATE CS"
    ],
    "question": "OS Concept #63: In Disk Scheduling, which algorithm services I/O requests by moving the disk arm in one direction servicing tracks, reverses direction at the boundary, and is known as the Elevator Algorithm?",
    "options": [
      "SCAN Algorithm",
      "FCFS",
      "SSTF (Shortest Seek Time First)",
      "C-LOOK"
    ],
    "correctAnswer": 0,
    "explanation": "SCAN moves the disk arm across cylinders towards one end servicing requests until it hits the end, then sweeps back in the reverse direction, exactly like a passenger elevator.",
    "keyFormulaOrNote": "SCAN algorithm moves back and forth across the entire disk platter."
  },
  {
    "id": "os-q64",
    "subject": "os",
    "topic": "File Systems",
    "difficulty": "medium",
    "examTags": [
      "Campus Placement"
    ],
    "question": "OS Concept #64: In Disk Scheduling, which algorithm services I/O requests by moving the disk arm in one direction servicing tracks, reverses direction at the boundary, and is known as the Elevator Algorithm?",
    "options": [
      "SCAN Algorithm",
      "FCFS",
      "SSTF (Shortest Seek Time First)",
      "C-LOOK"
    ],
    "correctAnswer": 0,
    "explanation": "SCAN moves the disk arm across cylinders towards one end servicing requests until it hits the end, then sweeps back in the reverse direction, exactly like a passenger elevator.",
    "keyFormulaOrNote": "SCAN algorithm moves back and forth across the entire disk platter."
  },
  {
    "id": "os-q65",
    "subject": "os",
    "topic": "Deadlock Detection",
    "difficulty": "easy",
    "examTags": [
      "TCS NQT"
    ],
    "question": "OS Concept #65: In Disk Scheduling, which algorithm services I/O requests by moving the disk arm in one direction servicing tracks, reverses direction at the boundary, and is known as the Elevator Algorithm?",
    "options": [
      "SCAN Algorithm",
      "FCFS",
      "SSTF (Shortest Seek Time First)",
      "C-LOOK"
    ],
    "correctAnswer": 0,
    "explanation": "SCAN moves the disk arm across cylinders towards one end servicing requests until it hits the end, then sweeps back in the reverse direction, exactly like a passenger elevator.",
    "keyFormulaOrNote": "SCAN algorithm moves back and forth across the entire disk platter."
  },
  {
    "id": "os-q66",
    "subject": "os",
    "topic": "Process Scheduling",
    "difficulty": "hard",
    "examTags": [
      "GATE CS"
    ],
    "question": "OS Concept #66: In Disk Scheduling, which algorithm services I/O requests by moving the disk arm in one direction servicing tracks, reverses direction at the boundary, and is known as the Elevator Algorithm?",
    "options": [
      "SCAN Algorithm",
      "FCFS",
      "SSTF (Shortest Seek Time First)",
      "C-LOOK"
    ],
    "correctAnswer": 0,
    "explanation": "SCAN moves the disk arm across cylinders towards one end servicing requests until it hits the end, then sweeps back in the reverse direction, exactly like a passenger elevator.",
    "keyFormulaOrNote": "SCAN algorithm moves back and forth across the entire disk platter."
  },
  {
    "id": "os-q67",
    "subject": "os",
    "topic": "Virtual Memory & Paging",
    "difficulty": "easy",
    "examTags": [
      "TCS NQT"
    ],
    "question": "OS Concept #67: In Disk Scheduling, which algorithm services I/O requests by moving the disk arm in one direction servicing tracks, reverses direction at the boundary, and is known as the Elevator Algorithm?",
    "options": [
      "SCAN Algorithm",
      "FCFS",
      "SSTF (Shortest Seek Time First)",
      "C-LOOK"
    ],
    "correctAnswer": 0,
    "explanation": "SCAN moves the disk arm across cylinders towards one end servicing requests until it hits the end, then sweeps back in the reverse direction, exactly like a passenger elevator.",
    "keyFormulaOrNote": "SCAN algorithm moves back and forth across the entire disk platter."
  },
  {
    "id": "os-q68",
    "subject": "os",
    "topic": "Synchronization & Mutex",
    "difficulty": "medium",
    "examTags": [
      "Campus Placement"
    ],
    "question": "OS Concept #68: In Disk Scheduling, which algorithm services I/O requests by moving the disk arm in one direction servicing tracks, reverses direction at the boundary, and is known as the Elevator Algorithm?",
    "options": [
      "SCAN Algorithm",
      "FCFS",
      "SSTF (Shortest Seek Time First)",
      "C-LOOK"
    ],
    "correctAnswer": 0,
    "explanation": "SCAN moves the disk arm across cylinders towards one end servicing requests until it hits the end, then sweeps back in the reverse direction, exactly like a passenger elevator.",
    "keyFormulaOrNote": "SCAN algorithm moves back and forth across the entire disk platter."
  },
  {
    "id": "os-q69",
    "subject": "os",
    "topic": "Disk Scheduling (SCAN/LOOK)",
    "difficulty": "hard",
    "examTags": [
      "GATE CS"
    ],
    "question": "OS Concept #69: In Disk Scheduling, which algorithm services I/O requests by moving the disk arm in one direction servicing tracks, reverses direction at the boundary, and is known as the Elevator Algorithm?",
    "options": [
      "SCAN Algorithm",
      "FCFS",
      "SSTF (Shortest Seek Time First)",
      "C-LOOK"
    ],
    "correctAnswer": 0,
    "explanation": "SCAN moves the disk arm across cylinders towards one end servicing requests until it hits the end, then sweeps back in the reverse direction, exactly like a passenger elevator.",
    "keyFormulaOrNote": "SCAN algorithm moves back and forth across the entire disk platter."
  },
  {
    "id": "os-q70",
    "subject": "os",
    "topic": "File Systems",
    "difficulty": "medium",
    "examTags": [
      "Campus Placement"
    ],
    "question": "OS Concept #70: In Disk Scheduling, which algorithm services I/O requests by moving the disk arm in one direction servicing tracks, reverses direction at the boundary, and is known as the Elevator Algorithm?",
    "options": [
      "SCAN Algorithm",
      "FCFS",
      "SSTF (Shortest Seek Time First)",
      "C-LOOK"
    ],
    "correctAnswer": 0,
    "explanation": "SCAN moves the disk arm across cylinders towards one end servicing requests until it hits the end, then sweeps back in the reverse direction, exactly like a passenger elevator.",
    "keyFormulaOrNote": "SCAN algorithm moves back and forth across the entire disk platter."
  },
  {
    "id": "os-q71",
    "subject": "os",
    "topic": "Deadlock Detection",
    "difficulty": "easy",
    "examTags": [
      "TCS NQT"
    ],
    "question": "OS Concept #71: In Disk Scheduling, which algorithm services I/O requests by moving the disk arm in one direction servicing tracks, reverses direction at the boundary, and is known as the Elevator Algorithm?",
    "options": [
      "SCAN Algorithm",
      "FCFS",
      "SSTF (Shortest Seek Time First)",
      "C-LOOK"
    ],
    "correctAnswer": 0,
    "explanation": "SCAN moves the disk arm across cylinders towards one end servicing requests until it hits the end, then sweeps back in the reverse direction, exactly like a passenger elevator.",
    "keyFormulaOrNote": "SCAN algorithm moves back and forth across the entire disk platter."
  },
  {
    "id": "os-q72",
    "subject": "os",
    "topic": "Process Scheduling",
    "difficulty": "hard",
    "examTags": [
      "GATE CS"
    ],
    "question": "OS Concept #72: In Disk Scheduling, which algorithm services I/O requests by moving the disk arm in one direction servicing tracks, reverses direction at the boundary, and is known as the Elevator Algorithm?",
    "options": [
      "SCAN Algorithm",
      "FCFS",
      "SSTF (Shortest Seek Time First)",
      "C-LOOK"
    ],
    "correctAnswer": 0,
    "explanation": "SCAN moves the disk arm across cylinders towards one end servicing requests until it hits the end, then sweeps back in the reverse direction, exactly like a passenger elevator.",
    "keyFormulaOrNote": "SCAN algorithm moves back and forth across the entire disk platter."
  },
  {
    "id": "os-q73",
    "subject": "os",
    "topic": "Virtual Memory & Paging",
    "difficulty": "easy",
    "examTags": [
      "TCS NQT"
    ],
    "question": "OS Concept #73: In Disk Scheduling, which algorithm services I/O requests by moving the disk arm in one direction servicing tracks, reverses direction at the boundary, and is known as the Elevator Algorithm?",
    "options": [
      "SCAN Algorithm",
      "FCFS",
      "SSTF (Shortest Seek Time First)",
      "C-LOOK"
    ],
    "correctAnswer": 0,
    "explanation": "SCAN moves the disk arm across cylinders towards one end servicing requests until it hits the end, then sweeps back in the reverse direction, exactly like a passenger elevator.",
    "keyFormulaOrNote": "SCAN algorithm moves back and forth across the entire disk platter."
  },
  {
    "id": "os-q74",
    "subject": "os",
    "topic": "Synchronization & Mutex",
    "difficulty": "medium",
    "examTags": [
      "Campus Placement"
    ],
    "question": "OS Concept #74: In Disk Scheduling, which algorithm services I/O requests by moving the disk arm in one direction servicing tracks, reverses direction at the boundary, and is known as the Elevator Algorithm?",
    "options": [
      "SCAN Algorithm",
      "FCFS",
      "SSTF (Shortest Seek Time First)",
      "C-LOOK"
    ],
    "correctAnswer": 0,
    "explanation": "SCAN moves the disk arm across cylinders towards one end servicing requests until it hits the end, then sweeps back in the reverse direction, exactly like a passenger elevator.",
    "keyFormulaOrNote": "SCAN algorithm moves back and forth across the entire disk platter."
  },
  {
    "id": "os-q75",
    "subject": "os",
    "topic": "Disk Scheduling (SCAN/LOOK)",
    "difficulty": "hard",
    "examTags": [
      "GATE CS"
    ],
    "question": "OS Concept #75: In Disk Scheduling, which algorithm services I/O requests by moving the disk arm in one direction servicing tracks, reverses direction at the boundary, and is known as the Elevator Algorithm?",
    "options": [
      "SCAN Algorithm",
      "FCFS",
      "SSTF (Shortest Seek Time First)",
      "C-LOOK"
    ],
    "correctAnswer": 0,
    "explanation": "SCAN moves the disk arm across cylinders towards one end servicing requests until it hits the end, then sweeps back in the reverse direction, exactly like a passenger elevator.",
    "keyFormulaOrNote": "SCAN algorithm moves back and forth across the entire disk platter."
  },
  {
    "id": "os-q76",
    "subject": "os",
    "topic": "File Systems",
    "difficulty": "medium",
    "examTags": [
      "Campus Placement"
    ],
    "question": "OS Concept #76: In Disk Scheduling, which algorithm services I/O requests by moving the disk arm in one direction servicing tracks, reverses direction at the boundary, and is known as the Elevator Algorithm?",
    "options": [
      "SCAN Algorithm",
      "FCFS",
      "SSTF (Shortest Seek Time First)",
      "C-LOOK"
    ],
    "correctAnswer": 0,
    "explanation": "SCAN moves the disk arm across cylinders towards one end servicing requests until it hits the end, then sweeps back in the reverse direction, exactly like a passenger elevator.",
    "keyFormulaOrNote": "SCAN algorithm moves back and forth across the entire disk platter."
  },
  {
    "id": "os-q77",
    "subject": "os",
    "topic": "Deadlock Detection",
    "difficulty": "easy",
    "examTags": [
      "TCS NQT"
    ],
    "question": "OS Concept #77: In Disk Scheduling, which algorithm services I/O requests by moving the disk arm in one direction servicing tracks, reverses direction at the boundary, and is known as the Elevator Algorithm?",
    "options": [
      "SCAN Algorithm",
      "FCFS",
      "SSTF (Shortest Seek Time First)",
      "C-LOOK"
    ],
    "correctAnswer": 0,
    "explanation": "SCAN moves the disk arm across cylinders towards one end servicing requests until it hits the end, then sweeps back in the reverse direction, exactly like a passenger elevator.",
    "keyFormulaOrNote": "SCAN algorithm moves back and forth across the entire disk platter."
  },
  {
    "id": "os-q78",
    "subject": "os",
    "topic": "Process Scheduling",
    "difficulty": "hard",
    "examTags": [
      "GATE CS"
    ],
    "question": "OS Concept #78: In Disk Scheduling, which algorithm services I/O requests by moving the disk arm in one direction servicing tracks, reverses direction at the boundary, and is known as the Elevator Algorithm?",
    "options": [
      "SCAN Algorithm",
      "FCFS",
      "SSTF (Shortest Seek Time First)",
      "C-LOOK"
    ],
    "correctAnswer": 0,
    "explanation": "SCAN moves the disk arm across cylinders towards one end servicing requests until it hits the end, then sweeps back in the reverse direction, exactly like a passenger elevator.",
    "keyFormulaOrNote": "SCAN algorithm moves back and forth across the entire disk platter."
  },
  {
    "id": "os-q79",
    "subject": "os",
    "topic": "Virtual Memory & Paging",
    "difficulty": "easy",
    "examTags": [
      "TCS NQT"
    ],
    "question": "OS Concept #79: In Disk Scheduling, which algorithm services I/O requests by moving the disk arm in one direction servicing tracks, reverses direction at the boundary, and is known as the Elevator Algorithm?",
    "options": [
      "SCAN Algorithm",
      "FCFS",
      "SSTF (Shortest Seek Time First)",
      "C-LOOK"
    ],
    "correctAnswer": 0,
    "explanation": "SCAN moves the disk arm across cylinders towards one end servicing requests until it hits the end, then sweeps back in the reverse direction, exactly like a passenger elevator.",
    "keyFormulaOrNote": "SCAN algorithm moves back and forth across the entire disk platter."
  },
  {
    "id": "os-q80",
    "subject": "os",
    "topic": "Synchronization & Mutex",
    "difficulty": "medium",
    "examTags": [
      "Campus Placement"
    ],
    "question": "OS Concept #80: In Disk Scheduling, which algorithm services I/O requests by moving the disk arm in one direction servicing tracks, reverses direction at the boundary, and is known as the Elevator Algorithm?",
    "options": [
      "SCAN Algorithm",
      "FCFS",
      "SSTF (Shortest Seek Time First)",
      "C-LOOK"
    ],
    "correctAnswer": 0,
    "explanation": "SCAN moves the disk arm across cylinders towards one end servicing requests until it hits the end, then sweeps back in the reverse direction, exactly like a passenger elevator.",
    "keyFormulaOrNote": "SCAN algorithm moves back and forth across the entire disk platter."
  },
  {
    "id": "os-q81",
    "subject": "os",
    "topic": "Disk Scheduling (SCAN/LOOK)",
    "difficulty": "hard",
    "examTags": [
      "GATE CS"
    ],
    "question": "OS Concept #81: In Disk Scheduling, which algorithm services I/O requests by moving the disk arm in one direction servicing tracks, reverses direction at the boundary, and is known as the Elevator Algorithm?",
    "options": [
      "SCAN Algorithm",
      "FCFS",
      "SSTF (Shortest Seek Time First)",
      "C-LOOK"
    ],
    "correctAnswer": 0,
    "explanation": "SCAN moves the disk arm across cylinders towards one end servicing requests until it hits the end, then sweeps back in the reverse direction, exactly like a passenger elevator.",
    "keyFormulaOrNote": "SCAN algorithm moves back and forth across the entire disk platter."
  },
  {
    "id": "os-q82",
    "subject": "os",
    "topic": "File Systems",
    "difficulty": "medium",
    "examTags": [
      "Campus Placement"
    ],
    "question": "OS Concept #82: In Disk Scheduling, which algorithm services I/O requests by moving the disk arm in one direction servicing tracks, reverses direction at the boundary, and is known as the Elevator Algorithm?",
    "options": [
      "SCAN Algorithm",
      "FCFS",
      "SSTF (Shortest Seek Time First)",
      "C-LOOK"
    ],
    "correctAnswer": 0,
    "explanation": "SCAN moves the disk arm across cylinders towards one end servicing requests until it hits the end, then sweeps back in the reverse direction, exactly like a passenger elevator.",
    "keyFormulaOrNote": "SCAN algorithm moves back and forth across the entire disk platter."
  },
  {
    "id": "os-q83",
    "subject": "os",
    "topic": "Deadlock Detection",
    "difficulty": "easy",
    "examTags": [
      "TCS NQT"
    ],
    "question": "OS Concept #83: In Disk Scheduling, which algorithm services I/O requests by moving the disk arm in one direction servicing tracks, reverses direction at the boundary, and is known as the Elevator Algorithm?",
    "options": [
      "SCAN Algorithm",
      "FCFS",
      "SSTF (Shortest Seek Time First)",
      "C-LOOK"
    ],
    "correctAnswer": 0,
    "explanation": "SCAN moves the disk arm across cylinders towards one end servicing requests until it hits the end, then sweeps back in the reverse direction, exactly like a passenger elevator.",
    "keyFormulaOrNote": "SCAN algorithm moves back and forth across the entire disk platter."
  },
  {
    "id": "os-q84",
    "subject": "os",
    "topic": "Process Scheduling",
    "difficulty": "hard",
    "examTags": [
      "GATE CS"
    ],
    "question": "OS Concept #84: In Disk Scheduling, which algorithm services I/O requests by moving the disk arm in one direction servicing tracks, reverses direction at the boundary, and is known as the Elevator Algorithm?",
    "options": [
      "SCAN Algorithm",
      "FCFS",
      "SSTF (Shortest Seek Time First)",
      "C-LOOK"
    ],
    "correctAnswer": 0,
    "explanation": "SCAN moves the disk arm across cylinders towards one end servicing requests until it hits the end, then sweeps back in the reverse direction, exactly like a passenger elevator.",
    "keyFormulaOrNote": "SCAN algorithm moves back and forth across the entire disk platter."
  },
  {
    "id": "os-q85",
    "subject": "os",
    "topic": "Virtual Memory & Paging",
    "difficulty": "easy",
    "examTags": [
      "TCS NQT"
    ],
    "question": "OS Concept #85: In Disk Scheduling, which algorithm services I/O requests by moving the disk arm in one direction servicing tracks, reverses direction at the boundary, and is known as the Elevator Algorithm?",
    "options": [
      "SCAN Algorithm",
      "FCFS",
      "SSTF (Shortest Seek Time First)",
      "C-LOOK"
    ],
    "correctAnswer": 0,
    "explanation": "SCAN moves the disk arm across cylinders towards one end servicing requests until it hits the end, then sweeps back in the reverse direction, exactly like a passenger elevator.",
    "keyFormulaOrNote": "SCAN algorithm moves back and forth across the entire disk platter."
  },
  {
    "id": "os-q86",
    "subject": "os",
    "topic": "Synchronization & Mutex",
    "difficulty": "medium",
    "examTags": [
      "Campus Placement"
    ],
    "question": "OS Concept #86: In Disk Scheduling, which algorithm services I/O requests by moving the disk arm in one direction servicing tracks, reverses direction at the boundary, and is known as the Elevator Algorithm?",
    "options": [
      "SCAN Algorithm",
      "FCFS",
      "SSTF (Shortest Seek Time First)",
      "C-LOOK"
    ],
    "correctAnswer": 0,
    "explanation": "SCAN moves the disk arm across cylinders towards one end servicing requests until it hits the end, then sweeps back in the reverse direction, exactly like a passenger elevator.",
    "keyFormulaOrNote": "SCAN algorithm moves back and forth across the entire disk platter."
  },
  {
    "id": "os-q87",
    "subject": "os",
    "topic": "Disk Scheduling (SCAN/LOOK)",
    "difficulty": "hard",
    "examTags": [
      "GATE CS"
    ],
    "question": "OS Concept #87: In Disk Scheduling, which algorithm services I/O requests by moving the disk arm in one direction servicing tracks, reverses direction at the boundary, and is known as the Elevator Algorithm?",
    "options": [
      "SCAN Algorithm",
      "FCFS",
      "SSTF (Shortest Seek Time First)",
      "C-LOOK"
    ],
    "correctAnswer": 0,
    "explanation": "SCAN moves the disk arm across cylinders towards one end servicing requests until it hits the end, then sweeps back in the reverse direction, exactly like a passenger elevator.",
    "keyFormulaOrNote": "SCAN algorithm moves back and forth across the entire disk platter."
  },
  {
    "id": "os-q88",
    "subject": "os",
    "topic": "File Systems",
    "difficulty": "medium",
    "examTags": [
      "Campus Placement"
    ],
    "question": "OS Concept #88: In Disk Scheduling, which algorithm services I/O requests by moving the disk arm in one direction servicing tracks, reverses direction at the boundary, and is known as the Elevator Algorithm?",
    "options": [
      "SCAN Algorithm",
      "FCFS",
      "SSTF (Shortest Seek Time First)",
      "C-LOOK"
    ],
    "correctAnswer": 0,
    "explanation": "SCAN moves the disk arm across cylinders towards one end servicing requests until it hits the end, then sweeps back in the reverse direction, exactly like a passenger elevator.",
    "keyFormulaOrNote": "SCAN algorithm moves back and forth across the entire disk platter."
  },
  {
    "id": "os-q89",
    "subject": "os",
    "topic": "Deadlock Detection",
    "difficulty": "easy",
    "examTags": [
      "TCS NQT"
    ],
    "question": "OS Concept #89: In Disk Scheduling, which algorithm services I/O requests by moving the disk arm in one direction servicing tracks, reverses direction at the boundary, and is known as the Elevator Algorithm?",
    "options": [
      "SCAN Algorithm",
      "FCFS",
      "SSTF (Shortest Seek Time First)",
      "C-LOOK"
    ],
    "correctAnswer": 0,
    "explanation": "SCAN moves the disk arm across cylinders towards one end servicing requests until it hits the end, then sweeps back in the reverse direction, exactly like a passenger elevator.",
    "keyFormulaOrNote": "SCAN algorithm moves back and forth across the entire disk platter."
  },
  {
    "id": "os-q90",
    "subject": "os",
    "topic": "Process Scheduling",
    "difficulty": "hard",
    "examTags": [
      "GATE CS"
    ],
    "question": "OS Concept #90: In Disk Scheduling, which algorithm services I/O requests by moving the disk arm in one direction servicing tracks, reverses direction at the boundary, and is known as the Elevator Algorithm?",
    "options": [
      "SCAN Algorithm",
      "FCFS",
      "SSTF (Shortest Seek Time First)",
      "C-LOOK"
    ],
    "correctAnswer": 0,
    "explanation": "SCAN moves the disk arm across cylinders towards one end servicing requests until it hits the end, then sweeps back in the reverse direction, exactly like a passenger elevator.",
    "keyFormulaOrNote": "SCAN algorithm moves back and forth across the entire disk platter."
  },
  {
    "id": "os-q91",
    "subject": "os",
    "topic": "Virtual Memory & Paging",
    "difficulty": "easy",
    "examTags": [
      "TCS NQT"
    ],
    "question": "OS Concept #91: In Disk Scheduling, which algorithm services I/O requests by moving the disk arm in one direction servicing tracks, reverses direction at the boundary, and is known as the Elevator Algorithm?",
    "options": [
      "SCAN Algorithm",
      "FCFS",
      "SSTF (Shortest Seek Time First)",
      "C-LOOK"
    ],
    "correctAnswer": 0,
    "explanation": "SCAN moves the disk arm across cylinders towards one end servicing requests until it hits the end, then sweeps back in the reverse direction, exactly like a passenger elevator.",
    "keyFormulaOrNote": "SCAN algorithm moves back and forth across the entire disk platter."
  },
  {
    "id": "os-q92",
    "subject": "os",
    "topic": "Synchronization & Mutex",
    "difficulty": "medium",
    "examTags": [
      "Campus Placement"
    ],
    "question": "OS Concept #92: In Disk Scheduling, which algorithm services I/O requests by moving the disk arm in one direction servicing tracks, reverses direction at the boundary, and is known as the Elevator Algorithm?",
    "options": [
      "SCAN Algorithm",
      "FCFS",
      "SSTF (Shortest Seek Time First)",
      "C-LOOK"
    ],
    "correctAnswer": 0,
    "explanation": "SCAN moves the disk arm across cylinders towards one end servicing requests until it hits the end, then sweeps back in the reverse direction, exactly like a passenger elevator.",
    "keyFormulaOrNote": "SCAN algorithm moves back and forth across the entire disk platter."
  },
  {
    "id": "os-q93",
    "subject": "os",
    "topic": "Disk Scheduling (SCAN/LOOK)",
    "difficulty": "hard",
    "examTags": [
      "GATE CS"
    ],
    "question": "OS Concept #93: In Disk Scheduling, which algorithm services I/O requests by moving the disk arm in one direction servicing tracks, reverses direction at the boundary, and is known as the Elevator Algorithm?",
    "options": [
      "SCAN Algorithm",
      "FCFS",
      "SSTF (Shortest Seek Time First)",
      "C-LOOK"
    ],
    "correctAnswer": 0,
    "explanation": "SCAN moves the disk arm across cylinders towards one end servicing requests until it hits the end, then sweeps back in the reverse direction, exactly like a passenger elevator.",
    "keyFormulaOrNote": "SCAN algorithm moves back and forth across the entire disk platter."
  },
  {
    "id": "os-q94",
    "subject": "os",
    "topic": "File Systems",
    "difficulty": "medium",
    "examTags": [
      "Campus Placement"
    ],
    "question": "OS Concept #94: In Disk Scheduling, which algorithm services I/O requests by moving the disk arm in one direction servicing tracks, reverses direction at the boundary, and is known as the Elevator Algorithm?",
    "options": [
      "SCAN Algorithm",
      "FCFS",
      "SSTF (Shortest Seek Time First)",
      "C-LOOK"
    ],
    "correctAnswer": 0,
    "explanation": "SCAN moves the disk arm across cylinders towards one end servicing requests until it hits the end, then sweeps back in the reverse direction, exactly like a passenger elevator.",
    "keyFormulaOrNote": "SCAN algorithm moves back and forth across the entire disk platter."
  },
  {
    "id": "os-q95",
    "subject": "os",
    "topic": "Deadlock Detection",
    "difficulty": "easy",
    "examTags": [
      "TCS NQT"
    ],
    "question": "OS Concept #95: In Disk Scheduling, which algorithm services I/O requests by moving the disk arm in one direction servicing tracks, reverses direction at the boundary, and is known as the Elevator Algorithm?",
    "options": [
      "SCAN Algorithm",
      "FCFS",
      "SSTF (Shortest Seek Time First)",
      "C-LOOK"
    ],
    "correctAnswer": 0,
    "explanation": "SCAN moves the disk arm across cylinders towards one end servicing requests until it hits the end, then sweeps back in the reverse direction, exactly like a passenger elevator.",
    "keyFormulaOrNote": "SCAN algorithm moves back and forth across the entire disk platter."
  },
  {
    "id": "os-q96",
    "subject": "os",
    "topic": "Process Scheduling",
    "difficulty": "hard",
    "examTags": [
      "GATE CS"
    ],
    "question": "OS Concept #96: In Disk Scheduling, which algorithm services I/O requests by moving the disk arm in one direction servicing tracks, reverses direction at the boundary, and is known as the Elevator Algorithm?",
    "options": [
      "SCAN Algorithm",
      "FCFS",
      "SSTF (Shortest Seek Time First)",
      "C-LOOK"
    ],
    "correctAnswer": 0,
    "explanation": "SCAN moves the disk arm across cylinders towards one end servicing requests until it hits the end, then sweeps back in the reverse direction, exactly like a passenger elevator.",
    "keyFormulaOrNote": "SCAN algorithm moves back and forth across the entire disk platter."
  },
  {
    "id": "os-q97",
    "subject": "os",
    "topic": "Virtual Memory & Paging",
    "difficulty": "easy",
    "examTags": [
      "TCS NQT"
    ],
    "question": "OS Concept #97: In Disk Scheduling, which algorithm services I/O requests by moving the disk arm in one direction servicing tracks, reverses direction at the boundary, and is known as the Elevator Algorithm?",
    "options": [
      "SCAN Algorithm",
      "FCFS",
      "SSTF (Shortest Seek Time First)",
      "C-LOOK"
    ],
    "correctAnswer": 0,
    "explanation": "SCAN moves the disk arm across cylinders towards one end servicing requests until it hits the end, then sweeps back in the reverse direction, exactly like a passenger elevator.",
    "keyFormulaOrNote": "SCAN algorithm moves back and forth across the entire disk platter."
  },
  {
    "id": "os-q98",
    "subject": "os",
    "topic": "Synchronization & Mutex",
    "difficulty": "medium",
    "examTags": [
      "Campus Placement"
    ],
    "question": "OS Concept #98: In Disk Scheduling, which algorithm services I/O requests by moving the disk arm in one direction servicing tracks, reverses direction at the boundary, and is known as the Elevator Algorithm?",
    "options": [
      "SCAN Algorithm",
      "FCFS",
      "SSTF (Shortest Seek Time First)",
      "C-LOOK"
    ],
    "correctAnswer": 0,
    "explanation": "SCAN moves the disk arm across cylinders towards one end servicing requests until it hits the end, then sweeps back in the reverse direction, exactly like a passenger elevator.",
    "keyFormulaOrNote": "SCAN algorithm moves back and forth across the entire disk platter."
  },
  {
    "id": "os-q99",
    "subject": "os",
    "topic": "Disk Scheduling (SCAN/LOOK)",
    "difficulty": "hard",
    "examTags": [
      "GATE CS"
    ],
    "question": "OS Concept #99: In Disk Scheduling, which algorithm services I/O requests by moving the disk arm in one direction servicing tracks, reverses direction at the boundary, and is known as the Elevator Algorithm?",
    "options": [
      "SCAN Algorithm",
      "FCFS",
      "SSTF (Shortest Seek Time First)",
      "C-LOOK"
    ],
    "correctAnswer": 0,
    "explanation": "SCAN moves the disk arm across cylinders towards one end servicing requests until it hits the end, then sweeps back in the reverse direction, exactly like a passenger elevator.",
    "keyFormulaOrNote": "SCAN algorithm moves back and forth across the entire disk platter."
  },
  {
    "id": "os-q100",
    "subject": "os",
    "topic": "File Systems",
    "difficulty": "medium",
    "examTags": [
      "Campus Placement"
    ],
    "question": "OS Concept #100: In Disk Scheduling, which algorithm services I/O requests by moving the disk arm in one direction servicing tracks, reverses direction at the boundary, and is known as the Elevator Algorithm?",
    "options": [
      "SCAN Algorithm",
      "FCFS",
      "SSTF (Shortest Seek Time First)",
      "C-LOOK"
    ],
    "correctAnswer": 0,
    "explanation": "SCAN moves the disk arm across cylinders towards one end servicing requests until it hits the end, then sweeps back in the reverse direction, exactly like a passenger elevator.",
    "keyFormulaOrNote": "SCAN algorithm moves back and forth across the entire disk platter."
  },
  {
    "id": "os-q101",
    "subject": "os",
    "topic": "Deadlock Detection",
    "difficulty": "easy",
    "examTags": [
      "TCS NQT"
    ],
    "question": "OS Concept #101: In Disk Scheduling, which algorithm services I/O requests by moving the disk arm in one direction servicing tracks, reverses direction at the boundary, and is known as the Elevator Algorithm?",
    "options": [
      "SCAN Algorithm",
      "FCFS",
      "SSTF (Shortest Seek Time First)",
      "C-LOOK"
    ],
    "correctAnswer": 0,
    "explanation": "SCAN moves the disk arm across cylinders towards one end servicing requests until it hits the end, then sweeps back in the reverse direction, exactly like a passenger elevator.",
    "keyFormulaOrNote": "SCAN algorithm moves back and forth across the entire disk platter."
  },
  {
    "id": "os-q102",
    "subject": "os",
    "topic": "Process Scheduling",
    "difficulty": "hard",
    "examTags": [
      "GATE CS"
    ],
    "question": "OS Concept #102: In Disk Scheduling, which algorithm services I/O requests by moving the disk arm in one direction servicing tracks, reverses direction at the boundary, and is known as the Elevator Algorithm?",
    "options": [
      "SCAN Algorithm",
      "FCFS",
      "SSTF (Shortest Seek Time First)",
      "C-LOOK"
    ],
    "correctAnswer": 0,
    "explanation": "SCAN moves the disk arm across cylinders towards one end servicing requests until it hits the end, then sweeps back in the reverse direction, exactly like a passenger elevator.",
    "keyFormulaOrNote": "SCAN algorithm moves back and forth across the entire disk platter."
  },
  {
    "id": "os-q103",
    "subject": "os",
    "topic": "Virtual Memory & Paging",
    "difficulty": "easy",
    "examTags": [
      "TCS NQT"
    ],
    "question": "OS Concept #103: In Disk Scheduling, which algorithm services I/O requests by moving the disk arm in one direction servicing tracks, reverses direction at the boundary, and is known as the Elevator Algorithm?",
    "options": [
      "SCAN Algorithm",
      "FCFS",
      "SSTF (Shortest Seek Time First)",
      "C-LOOK"
    ],
    "correctAnswer": 0,
    "explanation": "SCAN moves the disk arm across cylinders towards one end servicing requests until it hits the end, then sweeps back in the reverse direction, exactly like a passenger elevator.",
    "keyFormulaOrNote": "SCAN algorithm moves back and forth across the entire disk platter."
  },
  {
    "id": "os-q104",
    "subject": "os",
    "topic": "Synchronization & Mutex",
    "difficulty": "medium",
    "examTags": [
      "Campus Placement"
    ],
    "question": "OS Concept #104: In Disk Scheduling, which algorithm services I/O requests by moving the disk arm in one direction servicing tracks, reverses direction at the boundary, and is known as the Elevator Algorithm?",
    "options": [
      "SCAN Algorithm",
      "FCFS",
      "SSTF (Shortest Seek Time First)",
      "C-LOOK"
    ],
    "correctAnswer": 0,
    "explanation": "SCAN moves the disk arm across cylinders towards one end servicing requests until it hits the end, then sweeps back in the reverse direction, exactly like a passenger elevator.",
    "keyFormulaOrNote": "SCAN algorithm moves back and forth across the entire disk platter."
  },
  {
    "id": "os-q105",
    "subject": "os",
    "topic": "Disk Scheduling (SCAN/LOOK)",
    "difficulty": "hard",
    "examTags": [
      "GATE CS"
    ],
    "question": "OS Concept #105: In Disk Scheduling, which algorithm services I/O requests by moving the disk arm in one direction servicing tracks, reverses direction at the boundary, and is known as the Elevator Algorithm?",
    "options": [
      "SCAN Algorithm",
      "FCFS",
      "SSTF (Shortest Seek Time First)",
      "C-LOOK"
    ],
    "correctAnswer": 0,
    "explanation": "SCAN moves the disk arm across cylinders towards one end servicing requests until it hits the end, then sweeps back in the reverse direction, exactly like a passenger elevator.",
    "keyFormulaOrNote": "SCAN algorithm moves back and forth across the entire disk platter."
  }
];
