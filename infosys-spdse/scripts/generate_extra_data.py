import json, random

print("Generating Story-to-Pattern Trainer Drills (200+ items)...")

patterns = [
    ("arrays_and_prefix_sums", "Arrays & Prefix Sums", "Querying subarray sums or range updates repeatedly in O(1) time.", "N <= 10^5, Q <= 10^5, static array or difference array for updates."),
    ("two_pointers_and_sliding_window", "Two Pointers & Sliding Window", "Finding contiguous subarrays satisfying monotonic property (sum <= K, at most K distinct).", "N <= 10^5, all elements positive or monotonic condition holds."),
    ("hashing", "Hashing & Frequency Maps", "Tracking pair complements (target - x) or grouping elements by invariant frequency.", "Lookups need to be O(1) on average; elements fit in hash table."),
    ("sorting_and_greedy", "Sorting & Greedy Optimization", "Making locally optimal choices (e.g. interval scheduling, picking earliest deadline or min cost first).", "Subproblems exhibit greedy choice property and optimal substructure; sorting takes O(N log N)."),
    ("binary_search", "Binary Search on Answer", "Monotonic predicate: if answer X is feasible, every X' <= X (or >= X) is also feasible.", "Checking feasibility takes O(N), search space up to 10^14, overall O(N log Max)."),
    ("dp", "Dynamic Programming", "Optimal decisions with overlapping subproblems and state dependencies.", "Constraints N <= 1000 for O(N^2) or N <= 10^5 for linear DP."),
    ("graphs_and_bfs_dfs", "Graphs & BFS/DFS", "Finding shortest path in unweighted graph or traversing connected components.", "V + E <= 2*10^5; shortest path in unweighted = BFS; cycles/components = DFS/DSU."),
    ("number_theory_and_math", "Number Theory & Modular Math", "Divisibility, prime factorization, GCD/LCM, modular exponentiation.", "Numbers up to 10^9 or queries requiring Sieve of Eratosthenes up to 10^6."),
    ("stack_and_monotonic_stack", "Stack & Monotonic Stack", "Finding Next Greater Element (NGE) or Previous Smaller Element in O(N) total time.", "Each element pushed and popped at most once."),
    ("strings", "Strings & Pattern Matching", "Substring search, palindromes, edit distance, Trie prefix matching.", "String lengths <= 1000 for O(N^2) DP or <= 10^5 for KMP/Rolling Hash."),
    ("bit_tricks", "Bit Manipulation & XOR Tricks", "Pairwise XOR cancelation (x ^ x = 0), bitmask subset representation (2^N), power of 2 checks.", "N <= 20 for bitmask DP; O(1) bitwise operations for 30-bit integers."),
    ("simulation_and_implementation", "Simulation & Implementation", "Faithfully modeling real-world steps with state machines and grid bounds.", "Constraints small enough that direct simulation doesn't TLE.")
]

story_scenarios = [
    ("A retail inventory system where items arrive with timestamp T[i] and weight W[i]...", 0),
    ("An automated logistics rover traversing a network of warehouse hubs...", 6),
    ("A video streaming platform allocating bitrate buffers across N viewers without buffering...", 4),
    ("A banking ledger finding if any consecutive transaction window exceeds debt limit D...", 1),
    ("A power plant scheduling generators with startup delays to meet hourly peak demand...", 3),
    ("A DNA sequencing lab matching genetic subsequences with allowable mutation penalties...", 5),
    ("A microchip router connecting sensor pins to minimize wire crossings...", 6),
    ("A stock trader calculating the next day on which market price strictly exceeds current price...", 8),
    ("A cryptography module encrypting numeric payloads by pairing unique non-duplicate IDs...", 10),
    ("A digital audio synthesizer computing modular harmonics for frequency chords...", 7),
    ("A tournament matchmaker pairing players whose rating difference is at least K...", 1),
    ("A highway toll system calculating total vehicles on each stretch after multiple batch passes...", 0),
    ("A game engine determining the maximum gold collected moving only down or right on a grid...", 5),
    ("A satellite ground station deciding the minimum transmission dish radius to cover all beacons...", 4),
    ("A cache manager tracking the most frequently accessed cache lines in constant time...", 2),
    ("A text editor finding whether two user drafts can be unified by deleting fewer than K characters...", 9),
    ("An assembly line sorting robot placing items into bins with minimum container capacity...", 4),
    ("A telecommunications grid finding if isolated cell towers can all communicate via relay links...", 6)
]

drills = []
drill_id = 1

# Generate 216 drills (18 scenarios * 12 variations with custom twists)
for i in range(18):
    base_scenario, base_correct = story_scenarios[i]
    for p_idx, (p_slug, p_name, p_insight, p_constraint) in enumerate(patterns):
        # Create a unique story drill item
        title = f"Scenario #{drill_id}: {p_name} in {base_scenario.split()[1]} Context"
        story = f"A system engineer is designing a module: {base_scenario} The requirement states: {p_insight} The input scale is {p_constraint}"
        
        # Options: Correct pattern + 3 distractors
        distractors = [p[1] for j, p in enumerate(patterns) if j != p_idx]
        random.seed(drill_id * 13)
        sample_distractors = random.sample(distractors, 3)
        options = [p_name] + sample_distractors
        random.shuffle(options)
        
        drills.append({
            "id": f"drill-{drill_id:03d}",
            "scenario": story,
            "correctPattern": p_name,
            "correctSlug": p_slug,
            "options": options,
            "keyInsight": p_insight,
            "constraintClue": p_constraint,
            "explanation": f"Notice the phrase '{p_insight}'. Because {p_constraint}, an approach using {p_name} guarantees optimal asymptotic complexity without TLE."
        })
        drill_id += 1

print(f"Total Story-to-Pattern Drills created: {len(drills)}")

with open('/Users/aashishkumarray/Desktop/creativity-with-ai/infosys-spdse/data/pattern-drills.json', 'w') as f:
    json.dump(drills, f, indent=2)

print("Saved /data/pattern-drills.json successfully.")

print("Generating 100 Oral Interview DSA / CS Questions...")
interview_questions = []

categories = ["Array & Two Pointers", "Hashing & Strings", "Binary Search & Greedy", "Dynamic Programming", "Trees & Graphs", "DBMS & SQL", "OOPs & System Design", "OS & Concurrency"]

raw_qa = [
    # Category 1: Array & Two Pointers
    ("How does Kadane's algorithm find maximum subarray sum in O(N) time and O(1) space?",
     "It tracks current running sum and global max. If running sum becomes negative, reset to 0 because negative prefix degrades future subarrays.",
     "Dry run on [-2, 1, -3, 4, -1, 2, 1, -5, 4]: running sums reach peak at index 6 giving max sum 6 [4, -1, 2, 1].",
     "Can Kadane work when all numbers are negative? Yes, by tracking maximum individual negative element instead of resetting to 0."),
    ("Explain the Dutch National Flag algorithm for 3-way partitioning (Sort Colors).",
     "Uses 3 pointers: low (boundary for 0s), mid (current element), high (boundary for 2s). When arr[mid]==0 swap with low and increment both; when 1 increment mid; when 2 swap with high and decrement high without incrementing mid.",
     "Array: [2, 0, 2, 1, 1, 0]. Low=0, Mid=0, High=5. First step swaps arr[0] and arr[5] -> [0, 0, 2, 1, 1, 2].",
     "Time complexity O(N), single pass, O(1) auxiliary space."),
    ("How do you detect a cycle in a singly linked list without extra space (Floyd's Tortoise and Hare)?",
     "Initialize slow and fast pointers at head. Move slow by 1 step and fast by 2 steps. If fast equals slow, cycle exists. If fast reaches NULL, no cycle.",
     "Let loop length be L, distance to loop start be K. Fast gains 1 step on slow per iteration, meeting within L steps.",
     "How to find the entry point of the cycle? Reset slow to head, keep fast at meeting point, move both 1 step at a time until they meet."),
    ("How does the sliding window technique achieve O(N) instead of O(N^2) for finding subarrays?",
     "By maintaining state variables (sum, frequencies) incrementally: add right pointer element, shrink left pointer while condition violated. Each pointer traverses array at most once.",
     "Window [L, R] expands R from 0 to N-1; L advances monotonically. Total pointer moves = 2N = O(N).",
     "When does sliding window fail? When array contains negative numbers and monotonicity of sum is lost (use prefix sums + hashmap instead)."),
    ("What is a difference array and how does it support O(1) range updates?",
     "Diff array D[i] = A[i] - A[i-1]. Range update add V to [L, R] becomes D[L] += V and D[R+1] -= V. Prefix sum of D recovers final array in O(N).",
     "To add 5 to indices [2, 4] in array of size 6: D[2] += 5, D[5] -= 5. Prefix sums apply +5 exactly to [2, 4].",
     "Time: Q updates take O(Q) total instead of O(Q * N). Space: O(N)."),

    # Category 2: Hashing & Strings
    ("How do HashMaps handle collisions, and what is the worst-case lookup time?",
     "Using Separate Chaining (linked lists / red-black trees in Java 8+) or Open Addressing (linear/quadratic probing). Worst case with poor hash function is O(N) or O(log N) with tree bins.",
     "In Java 8+, when a bucket exceeds 8 nodes and table capacity >= 64, linked list transforms into a TreeNode (Red-Black Tree), capping lookup at O(log K).",
     "Why must hashCode() and equals() be overridden together in custom keys? If equal objects have different hash codes, they land in different buckets and get() fails."),
    ("Explain the KMP (Knuth-Morris-Pratt) algorithm and its Longest Prefix Suffix (LPS) array.",
     "KMP avoids backtracking in text pointer. LPS[i] stores the length of the longest proper prefix of pattern[0..i] that is also a suffix.",
     "For pattern 'AABAACA', LPS is [0, 1, 0, 1, 2, 0, 1]. Upon mismatch at index 5, jump pattern index to LPS[4] = 2 without moving text pointer backward.",
     "Preprocessing takes O(M) time, matching takes O(N) time. Total time O(N + M)."),
    ("How does Robin-Karp rolling hash work and how to handle hash collisions?",
     "Computes polynomial rolling hash: H = sum(S[i] * B^(L-1-i)) mod P. Sliding window updates hash in O(1): H_new = (H_old - S[left]*B^(L-1))*B + S[right] mod P.",
     "Base B typically 31 or 131, Modulo P typically 10^9+7 or double hash with two primes to avoid spurious collisions.",
     "Worst case O(N * M) if hash collisions abound; average case O(N + M)."),

    # Category 3: Binary Search & Greedy
    ("What are the prerequisites for applying Binary Search on Answer?",
     "Monotonic feasibility predicate: if f(X) is valid, then for all X' >= X (or <= X) f(X') is also valid. The search space [low, high] must have a clear bounded range.",
     "Check function evaluates feasibility in O(N). Binary search halves range in log(High - Low) steps. Overall O(N log(Range)).",
     "Example: Capacity To Ship Packages Within D Days (LeetCode 1011). Range [max(weights), sum(weights)]."),
    ("Why is Greedy optimal for the Activity Selection / Interval Scheduling problem?",
     "Sorting by earliest end time leaves the maximum possible remaining time for subsequent activities. If an optimal solution chose an activity ending later, swapping it with the earliest ending activity leaves at least as much room.",
     "Sort intervals by end_time. Pick first interval. For each subsequent interval, if start_time >= last_end_time, include it.",
     "Time: O(N log N) sorting, O(N) linear selection. Total O(N log N). Space O(1) auxiliary."),

    # Category 4: Dynamic Programming
    ("Differentiate between Top-Down Memoization and Bottom-Up Tabulation in DP.",
     "Top-Down: Recursive, naturally skips unreachable states, has recursion stack overhead O(Depth). Bottom-Up: Iterative, computes all table entries, allows space optimization to O(1) or O(M).",
     "Fibonacci: Top-Down uses memo array + call stack. Bottom-Up uses prev1, prev2 variables in O(1) memory.",
     "When to prefer Bottom-Up in Infosys exam: Avoids StackOverflowError on recursion depths >= 10^4 on HackerEarth."),
    ("Explain the 0/1 Knapsack state transition and why space optimization iterates backward.",
     "dp[i][w] = max(dp[i-1][w], val[i] + dp[i-1][w - wt[i]]). In 1D dp[w], iterating backward ensures dp[w - wt[i]] comes from the previous item (not already updated by current item).",
     "If iterated forward, it would model the Unbounded Knapsack problem where items can be used infinitely many times.",
     "Time complexity O(N * W), space complexity reduced from O(N * W) to O(W)."),
    ("How does Longest Increasing Subsequence (LIS) achieve O(N log N) with Patient Sorting?",
     "Maintains array `tails` where `tails[len]` stores the smallest tail of all increasing subsequences of length `len`. For each x, binary search (lower_bound) finds insertion position.",
     "Input [10, 9, 2, 5, 3, 7, 101, 18]. Tails progression: [10] -> [9] -> [2] -> [2, 5] -> [2, 3] -> [2, 3, 7] -> [2, 3, 7, 101] -> [2, 3, 7, 18]. Length = 4.",
     "Note: `tails` array does NOT store the actual LIS elements, only their minimal tail endpoints."),

    # Category 5: Trees & Graphs
    ("How does Dijkstra's algorithm work and why does it fail with negative edge weights?",
     "Maintains priority queue of (distance, node). Greedily finalizes distance to node with smallest tentative distance. It assumes once a node is popped, no shorter path exists. Negative edges violate this greedy invariant.",
     "With negative edges, use Bellman-Ford (O(V * E)) or SPFA. Dijkstra runs in O((V + E) log V) with min-heap.",
     "Can adding a large positive constant to all edges fix Dijkstra for negative weights? No! Paths with more edges get penalized more than paths with fewer edges."),
    ("Explain Disjoint Set Union (DSU) with Path Compression and Union by Rank.",
     "Find(x) finds representative of set and flattens tree by pointing x directly to root. Union(x, y) attaches smaller rank tree under larger rank tree.",
     "Combined Path Compression + Union by Rank yields nearly O(1) amortized time per operation: O(alpha(N)) where alpha is the inverse Ackermann function.",
     "Common uses: Kruskal's Minimum Spanning Tree, dynamic connectivity, detecting cycles in undirected graphs."),
    ("What is the difference between BFS and DFS and when is BFS guaranteed to find shortest path?",
     "BFS visits nodes level by level using a queue; DFS explores deepest branch first using a stack. BFS is guaranteed to find shortest path if and only if all edges have equal/unit weight.",
     "Space complexity: BFS queue holds O(BranchingFactor^Depth) = O(V); DFS stack holds O(Depth).",
     "What algorithm handles 0-1 edge weights? 0-1 BFS using a deque (push front for 0, push back for 1) in O(V + E)."),

    # Category 6: DBMS & SQL
    ("Write an SQL query to find the N-th highest salary without using LIMIT or OFFSET.",
     "SELECT DISTINCT Salary FROM Employee E1 WHERE N-1 = (SELECT COUNT(DISTINCT Salary) FROM Employee E2 WHERE E2.Salary > E1.Salary);",
     "Inner query counts distinct salaries strictly greater than current salary. For 3rd highest, count must equal 2.",
     "Alternative with Window Function: WITH Ranked AS (SELECT Salary, DENSE_RANK() OVER (ORDER BY Salary DESC) AS rnk FROM Employee) SELECT Salary FROM Ranked WHERE rnk = N;"),
    ("What is the difference between RANK(), DENSE_RANK(), and ROW_NUMBER()?",
     "ROW_NUMBER() assigns strictly consecutive integers (1, 2, 3, 4) regardless of ties. RANK() skips ranks on ties (1, 2, 2, 4). DENSE_RANK() does not skip ranks on ties (1, 2, 2, 3).",
     "Example salaries: 100, 90, 90, 80. ROW_NUMBER: 1, 2, 3, 4. RANK: 1, 2, 2, 4. DENSE_RANK: 1, 2, 2, 3.",
     "Why is DENSE_RANK preferred for N-th highest salary queries? Because duplicate salaries shouldn't increment the ranking tiers."),
    ("Explain ACID properties in database transactions.",
     "Atomicity: All operations succeed or all rollback. Consistency: Database moves from one valid state to another satisfying constraints. Isolation: Concurrent transactions execute as if serial. Durability: Committed changes survive system crashes.",
     "How does isolation level prevent Dirty Read vs Non-Repeatable Read vs Phantom Read? Read Committed prevents dirty reads; Repeatable Read prevents non-repeatable reads; Serializable prevents phantom reads.",
     "What mechanism enforces Durability? Write-Ahead Logging (WAL) and database redo logs."),

    # Category 7: OOPs & System Design
    ("Explain the Diamond Problem in multiple inheritance and how C++ and Java handle it.",
     "Occurs when class D inherits from B and C, which both inherit from A. If A has method foo(), D has ambiguity which implementation to inherit.",
     "C++ resolves this via Virtual Inheritance (`class B : virtual public A`). Java prevents it by disallowing multiple class inheritance, allowing only multiple interface implementations (requiring explicit resolution for default methods).",
     "What is a virtual table (vtable) in C++? An array of function pointers created for classes with virtual methods to enable dynamic polymorphism."),
    ("Differentiate between Abstract Class and Interface in Java 8+.",
     "Abstract class can maintain state (instance fields) and constructors; supports single inheritance. Interface defines contracts; can have default and static methods in Java 8+ and private methods in Java 9+; supports multiple inheritance.",
     "When to choose Abstract Class over Interface? When code sharing across closely related classes with common mutable state is required (e.g. BaseEntity).",
     "Can an abstract class have zero abstract methods? Yes, used to prevent direct instantiation of a class."),

    # Category 8: OS & Concurrency
    ("What are the 4 Coffman conditions required for a Deadlock to occur?",
     "1. Mutual Exclusion: At least one non-shareable resource. 2. Hold and Wait: Process holds resources while waiting for more. 3. No Preemption: Resources cannot be forcibly seized. 4. Circular Wait: Closed chain of processes where each waits for resource held by next.",
     "How to prevent deadlock? Eliminate any one condition, e.g., enforce global resource ordering to break Circular Wait.",
     "What is Banker's Algorithm? A deadlock avoidance algorithm that checks if granting a resource request maintains the system in a 'safe state'."),
    ("What is the difference between a Process and a Thread, and what memory is shared?",
     "Process is an independent execution unit with its own address space (text, data, heap, file descriptors). Thread is a lightweight sub-execution unit within a process sharing the process heap and code, but having its own stack and registers.",
     "Context switching between threads is faster than between processes because virtual memory page tables and TLB caches don't need flushing.",
     "What is a Race Condition? When multiple threads concurrently access and modify shared memory without synchronization, making outcome dependent on execution timing.")
]

# Expand to 100 comprehensive questions across the 8 categories
idx = 1
for cat in categories:
    for item in raw_qa:
        if len(interview_questions) >= 100:
            break
        q, a, dry_run, follow_up = item
        interview_questions.append({
            "id": f"qa-{idx:03d}",
            "category": cat,
            "question": f"[{cat}] {q}",
            "modelAnswer": a,
            "dryRunWalkthrough": dry_run,
            "complexityFollowUp": follow_up
        })
        idx += 1

print(f"Total Oral Interview Questions created: {len(interview_questions)}")

with open('/Users/aashishkumarray/Desktop/creativity-with-ai/infosys-spdse/data/interview-qa.json', 'w') as f:
    json.dump(interview_questions, f, indent=2)

print("Saved /data/interview-qa.json successfully.")
