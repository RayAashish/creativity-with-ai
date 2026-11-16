import json

with open('data/pseudocode-mcq.json') as f:
    questions = json.load(f)

more = [
    {
        "id": "pseudo-16",
        "type": "pseudocode",
        "category": "Loops & Pointers",
        "title": "Floyd Cycle Detection Fast/Slow Step Counter",
        "code": """// Linked list of 7 nodes: 1->2->3->4->5->6->3 (cycle length 4)
slow = head; // node 1
fast = head; // node 1
int steps = 0;
while (fast != NULL && fast.next != NULL) {
    slow = slow.next;
    fast = fast.next.next;
    steps++;
    if (slow == fast) break;
}
print(steps);""",
        "question": "How many loop iterations (steps) elapse before slow and fast meet?",
        "options": ["4", "5", "6", "7"],
        "correctAnswer": "5",
        "trace": [
            {"step": 1, "state": "slow=2, fast=3", "action": "Step 1: not equal"},
            {"step": 2, "state": "slow=3, fast=5", "action": "Step 2: not equal"},
            {"step": 3, "state": "slow=4, fast=3 (fast wrapped around: 5->6->3)", "action": "Step 3: not equal"},
            {"step": 4, "state": "slow=5, fast=5 (from 3: 3->4->5)", "action": "Step 4: not equal... wait: let us trace carefully: from 3, next is 4, next is 5. So fast at step 4 is node 5! slow at step 4 is node 5! They meet at step 4!"}
        ],
        "explanation": "Tracing positions step by step:\n- Step 0: slow=1, fast=1\n- Step 1: slow=2, fast=3\n- Step 2: slow=3, fast=5\n- Step 3: slow=4, fast=6.next = 3\n- Step 4: slow=5, fast=3.next.next = 5\nBoth slow and fast meet at node 5 on step 4!"
    }
]

# Let's fix pseudo-16 options/trace cleanly:
more[0]["options"] = ["3", "4", "5", "6"]
more[0]["correctAnswer"] = "4"
more[0]["trace"] = [
    {"step": 1, "state": "slow=2, fast=3", "action": "slow advances 1, fast advances 2"},
    {"step": 2, "state": "slow=3, fast=5", "action": "slow advances 1, fast advances 2"},
    {"step": 3, "state": "slow=4, fast=3", "action": "slow advances to 4. fast moves 5->6->3 (enters cycle)"},
    {"step": 4, "state": "slow=5, fast=5", "action": "slow moves to 5. fast moves 3->4->5. slow == fast (break)"}
]

more.append({
    "id": "pseudo-17",
    "type": "pseudocode",
    "category": "Two Pointers & Arrays",
    "title": "Lomuto Partition Step Count",
    "code": """int A[] = {5, 2, 8, 3, 1, 6};
int pivot = A[5]; // pivot = 6
int i = -1;
int swaps = 0;
for (int j = 0; j < 5; j++) {
    if (A[j] <= pivot) {
        i++;
        swap(A[i], A[j]);
        swaps++;
    }
}
swap(A[i + 1], A[5]);
swaps++;
print(swaps);""",
    "question": "What is the total number of swaps executed during this Lomuto partition?",
    "options": ["3", "4", "5", "6"],
    "correctAnswer": "5",
    "trace": [
        {"step": 1, "state": "j=0 (A[0]=5 <= 6)", "action": "i=0, swap(A[0], A[0]) [self-swap], swaps=1"},
        {"step": 2, "state": "j=1 (A[1]=2 <= 6)", "action": "i=1, swap(A[1], A[1]) [self-swap], swaps=2"},
        {"step": 3, "state": "j=2 (A[2]=8 > 6)", "action": "condition false, no swap"},
        {"step": 4, "state": "j=3 (A[3]=3 <= 6)", "action": "i=2, swap(A[2]=8, A[3]=3), swaps=3. Array: [5,2,3,8,1,6]"},
        {"step": 5, "state": "j=4 (A[4]=1 <= 6)", "action": "i=3, swap(A[3]=8, A[4]=1), swaps=4. Array: [5,2,3,1,8,6]"},
        {"step": 6, "state": "Final pivot swap", "action": "swap(A[4]=8, A[5]=6), swaps=5. Array: [5,2,3,1,6,8]"}
    ],
    "explanation": "Elements <= 6 are 5, 2, 3, 1 (4 elements). Each triggers a swap inside the loop (including self-swaps on 5 and 2). Finally, the pivot 6 is swapped into position i+1=4 with 8. Total swaps = 4 + 1 = 5."
})

more.append({
    "id": "pseudo-18",
    "type": "pseudocode",
    "category": "Bit Manipulation & Loops",
    "title": "Twos Complement Lowest Set Bit Isolation",
    "code": """int x = 56; // 00111000 in binary
int isolated = x & (-x);
int pos = 0;
while (isolated > 1) {
    isolated >>= 1;
    pos++;
}
print(pos);""",
    "question": "What is the 0-indexed position (pos) of the lowest set bit printed by this snippet?",
    "options": ["2", "3", "4", "5"],
    "correctAnswer": "3",
    "trace": [
        {"step": 1, "state": "x = 56 (0011 1000_2)", "action": "-x in 2s complement is (~x + 1) = 1100 0111 + 1 = 1100 1000_2"},
        {"step": 2, "state": "x & (-x)", "action": "0011 1000 & 1100 1000 = 0000 1000_2 = 8 in decimal"},
        {"step": 3, "state": "while isolated > 1", "action": "isolated=8 -> pos=1 (val 4) -> pos=2 (val 2) -> pos=3 (val 1). Loop stops."},
        {"step": 4, "state": "Final pos", "action": "pos = 3 (since 2^3 = 8)"}
    ],
    "explanation": "x & (-x) isolates the lowest set bit. For 56 (32 + 16 + 8), the lowest set bit is 8 (2^3). Shifting right until 1 divides by 2 three times, setting pos = 3."
})

more.append({
    "id": "pseudo-19",
    "type": "pseudocode",
    "category": "Binary Search",
    "title": "Lower Bound Binary Search Off-by-One",
    "code": """int A[] = {1, 3, 5, 7, 9, 11};
int target = 6;
int low = 0, high = 5;
int iterations = 0;

while (low <= high) {
    iterations++;
    int mid = low + (high - low) / 2;
    if (A[mid] >= target) {
        high = mid - 1;
    } else {
        low = mid + 1;
    }
}
print(low + ":" + iterations);""",
    "question": "What is the printed output?",
    "options": ["3:3", "2:3", "3:4", "4:3"],
    "correctAnswer": "3:3",
    "trace": [
        {"step": 1, "state": "low=0, high=5", "action": "mid=2 (A[2]=5). 5 >= 6 is False -> low = 3. iterations=1"},
        {"step": 2, "state": "low=3, high=5", "action": "mid=4 (A[4]=9). 9 >= 6 is True -> high = 3. iterations=2"},
        {"step": 3, "state": "low=3, high=3", "action": "mid=3 (A[3]=7). 7 >= 6 is True -> high = 2. iterations=3"},
        {"step": 4, "state": "low=3, high=2", "action": "low <= high (3 <= 2) is False. Loop terminates with low=3, iterations=3"}
    ],
    "explanation": "Iteration 1: mid=2 (val 5 < 6) -> low=3. Iteration 2: mid=4 (val 9 >= 6) -> high=3. Iteration 3: mid=3 (val 7 >= 6) -> high=2. Loop breaks with low=3 (pointing to 7, the first element >= 6) after exactly 3 iterations."
})

more.append({
    "id": "pseudo-20",
    "type": "pseudocode",
    "category": "Recursion & Call Stack",
    "title": "Ackermann Function Miniature Evaluation",
    "code": """function A(m, n):
    if m == 0:
        return n + 1
    if m == 1:
        return n + 2
    if m == 2:
        return 2 * n + 3
    return A(m - 1, A(m, n - 1))

print(A(2, 4));""",
    "question": "What is the return value of A(2, 4)?",
    "options": ["9", "11", "13", "15"],
    "correctAnswer": "11",
    "trace": [
        {"step": 1, "state": "A(2, 4)", "action": "matches m == 2 base rule: returns 2 * 4 + 3 = 11"}
    ],
    "explanation": "With the short-circuit definition for m=2: A(2, n) = 2*n + 3. For n=4, A(2, 4) = 2*(4) + 3 = 11."
})

# Concept MCQs
more.extend([
    {
        "id": "concept-11",
        "type": "concept",
        "category": "Java Memory Model",
        "title": "try-catch-finally Return Precedence",
        "code": """public int test() {
    try {
        return 10;
    } finally {
        return 20;
    }
}""",
        "question": "What value is returned when test() is called?",
        "options": [
            "20, because the finally block executes immediately before control leaves the method and overrides the pending try return",
            "10, because the try block's return value is saved on the stack and cannot be modified",
            "Compilation Error: return inside finally is forbidden by javac",
            "Runtime Exception: IllegalMonitorStateException"
        ],
        "correctAnswer": "20, because the finally block executes immediately before control leaves the method and overrides the pending try return",
        "explanation": "In Java, code inside a `finally` block is guaranteed to execute before the method exits. If the `finally` block contains a `return` statement, it discards any previously evaluated return value from the `try` or `catch` block."
    },
    {
        "id": "concept-12",
        "type": "concept",
        "category": "OOP & Polymorphism",
        "title": "C++ Diamond Problem & Virtual Inheritance",
        "code": """class A { public: int x; };
class B : virtual public A {};
class C : virtual public A {};
class D : public B, public C {};""",
        "question": "What is the purpose of declaring `virtual public A` in classes B and C?",
        "options": [
            "Ensures only a single shared instance of class A is instantiated in class D, eliminating ambiguous member access",
            "Forces class A to become an abstract interface with pure virtual methods",
            "Allows class D to access private members of class A",
            "Enables dynamic runtime class loading for class A"
        ],
        "correctAnswer": "Ensures only a single shared instance of class A is instantiated in class D, eliminating ambiguous member access",
        "explanation": "Without virtual inheritance, class D would inherit two distinct copies of class A (one through B, one through C), leading to compiler errors when accessing `D::x`. Virtual base classes ensure a unified subobject."
    },
    {
        "id": "concept-13",
        "type": "concept",
        "category": "DBMS & SQL",
        "title": "SQL Window Functions: RANK() vs DENSE_RANK()",
        "code": "-- Salaries: [50k, 50k, 40k, 30k]",
        "question": "What ranks are assigned to 40k and 30k respectively under DENSE_RANK() over ORDER BY salary DESC?",
        "options": [
            "2 and 3",
            "3 and 4",
            "2 and 4",
            "1 and 2"
        ],
        "correctAnswer": "2 and 3",
        "explanation": "Under DENSE_RANK(), ties receive the same rank without leaving gaps in the numbering sequence. Both 50k entries receive rank 1; the next unique salary (40k) receives rank 2; 30k receives rank 3. Standard RANK() would leave a gap: 1, 1, 3, 4."
    },
    {
        "id": "concept-14",
        "type": "concept",
        "category": "OS & Memory",
        "title": "TLB (Translation Lookaside Buffer) Hit and Miss",
        "code": "// Virtual Memory address translation",
        "question": "What hardware component is checked first by the MMU to translate a virtual page number to a physical frame number?",
        "options": [
            "TLB (Translation Lookaside Buffer) associative cache",
            "L1 Data Cache",
            "Operating System Page Table in RAM",
            "Secondary Swap Space on SSD"
        ],
        "correctAnswer": "TLB (Translation Lookaside Buffer) associative cache",
        "explanation": "The MMU first queries the TLB, a fast on-chip associative cache. On a TLB hit, physical translation completes in <1 ns. Only on a TLB miss does the hardware or OS page-walk the multi-level page table in main memory."
    },
    {
        "id": "concept-15",
        "type": "concept",
        "category": "System Design & Caching",
        "title": "Cache-Aside (Lazy Loading) vs Write-Through",
        "code": "// Web application database caching pattern",
        "question": "In the Cache-Aside pattern, what action does the application take when updating a record?",
        "options": [
            "Writes update directly to the DB, and evicts (invalidates) the key from the cache",
            "Writes update to cache only, and asynchronously persists to DB via queue",
            "Simultaneously writes to cache and DB inside a two-phase commit lock",
            "Never touches the cache; DB triggers replicate updates to Redis"
        ],
        "correctAnswer": "Writes update directly to the DB, and evicts (invalidates) the key from the cache",
        "explanation": "Under Cache-Aside, mutating operations write to the primary database first, then invalidate (delete) the entry in cache. Subsequent read queries will experience a cache miss and reload the freshest data from the DB into cache."
    }
])

questions.extend(more)

with open('data/pseudocode-mcq.json', 'w') as f:
    json.dump(questions, f, indent=2)

print(f"Total updated questions: {len(questions)}")
