import json

questions = []

# --- 1. Pseudocode: Bitwise Loops
def build_q1():
    code = """int val = 42;
int count = 0;
while (val > 0) {
    if ((val & 1) == 0) {
        val = val >> 1;
    } else {
        count += (val & 3);
        val = val - 1;
    }
}
print(count);"""
    # Trace:
    # 42 -> even -> 21
    # 21 -> odd -> count += (21 & 3)=1 (count=1), val = 20
    # 20 -> even -> 10
    # 10 -> even -> 5
    # 5 -> odd -> count += (5 & 3)=1 (count=2), val = 4
    # 4 -> even -> 2
    # 2 -> even -> 1
    # 1 -> odd -> count += (1 & 3)=1 (count=3), val = 0
    return {
        "id": "pseudo-01",
        "type": "pseudocode",
        "category": "Bit Manipulation & Loops",
        "title": "Bitwise Right Shift & Masking Accumulator",
        "code": code,
        "question": "What is printed when this pseudocode finishes execution?",
        "options": ["3", "5", "6", "8"],
        "correctAnswer": "3",
        "trace": [
            {"step": 1, "state": "val=42, count=0", "action": "42 is even: val = 42 >> 1 = 21"},
            {"step": 2, "state": "val=21, count=0", "action": "21 is odd: count += (21 & 3) = 1 (count=1), val = 20"},
            {"step": 3, "state": "val=20, count=1", "action": "20 is even: val = 20 >> 1 = 10"},
            {"step": 4, "state": "val=10, count=1", "action": "10 is even: val = 10 >> 1 = 5"},
            {"step": 5, "state": "val=5, count=1", "action": "5 is odd: count += (5 & 3) = 1 (count=2), val = 4"},
            {"step": 6, "state": "val=4, count=2", "action": "4 is even: val = 4 >> 1 = 2"},
            {"step": 7, "state": "val=2, count=2", "action": "2 is even: val = 2 >> 1 = 1"},
            {"step": 8, "state": "val=1, count=2", "action": "1 is odd: count += (1 & 3) = 1 (count=3), val = 0"},
            {"step": 9, "state": "val=0, count=3", "action": "Loop terminates because val > 0 is false. Prints 3."}
        ],
        "explanation": "At each odd number, the code adds (val & 3). For 21 (10101_2), 21 & 3 = 1. For 5 (101_2), 5 & 3 = 1. For 1 (1_2), 1 & 3 = 1. Total count = 1 + 1 + 1 = 3."
    }

# --- 2. Pseudocode: Nested Loop Invariant
def build_q2():
    code = """int total = 0;
for (int i = 1; i <= 4; i++) {
    for (int j = i; j <= 4; j += 2) {
        for (int k = 1; k <= j; k *= 2) {
            total += 1;
        }
    }
}
print(total);"""
    # Let's compute:
    total = 0
    trace = []
    for i in range(1, 5):
        for j in range(i, 5, 2):
            k = 1
            k_count = 0
            while k <= j:
                total += 1
                k_count += 1
                k *= 2
            trace.append({"step": len(trace) + 1, "state": f"i={i}, j={j}", "action": f"k values tested: powers of 2 <= {j} ({k_count} times). Subtotal: {total}"})
    return {
        "id": "pseudo-02",
        "type": "pseudocode",
        "category": "Loops & Nested Counters",
        "title": "Logarithmic Inner Loop over Stepped Bounds",
        "code": code,
        "question": "What is the final value of total after all loops terminate?",
        "options": [str(total - 2), str(total), str(total + 3), str(total + 6)],
        "correctAnswer": str(total),
        "trace": trace,
        "explanation": f"Inner loop multiplies k by 2: when j=1 (k=1: 1 time), j=2 (k=1,2: 2 times), j=3 (k=1,2: 2 times), j=4 (k=1,2,4: 3 times). Summing across valid (i, j) pairs gives {total}."
    }

# --- 3. Pseudocode: Mutual Recursion
def build_q3():
    code = """function foo(n):
    if n <= 1:
        return 1
    return n + bar(n - 1)

function bar(n):
    if n <= 1:
        return 2
    return (n * 2) + foo(n - 2)

print(foo(6));"""
    # Trace:
    # foo(6) = 6 + bar(5)
    # bar(5) = (5*2) + foo(3) = 10 + foo(3)
    # foo(3) = 3 + bar(2)
    # bar(2) = (2*2) + foo(0) = 4 + foo(0)
    # foo(0) = 1 (since 0 <= 1)
    # bar(2) = 4 + 1 = 5
    # foo(3) = 3 + 5 = 8
    # bar(5) = 10 + 8 = 18
    # foo(6) = 6 + 18 = 24
    return {
        "id": "pseudo-03",
        "type": "pseudocode",
        "category": "Recursion & Call Stack",
        "title": "Mutual Recursion with Interleaved Operations",
        "code": code,
        "question": "What is the return value of foo(6)?",
        "options": ["20", "22", "24", "28"],
        "correctAnswer": "24",
        "trace": [
            {"step": 1, "state": "foo(6)", "action": "evaluates 6 + bar(5)"},
            {"step": 2, "state": "bar(5)", "action": "evaluates (5 * 2) + foo(3) = 10 + foo(3)"},
            {"step": 3, "state": "foo(3)", "action": "evaluates 3 + bar(2)"},
            {"step": 4, "state": "bar(2)", "action": "evaluates (2 * 2) + foo(0) = 4 + foo(0)"},
            {"step": 5, "state": "foo(0)", "action": "base case 0 <= 1 returns 1"},
            {"step": 6, "state": "Unwinding bar(2)", "action": "bar(2) returns 4 + 1 = 5"},
            {"step": 7, "state": "Unwinding foo(3)", "action": "foo(3) returns 3 + 5 = 8"},
            {"step": 8, "state": "Unwinding bar(5)", "action": "bar(5) returns 10 + 8 = 18"},
            {"step": 9, "state": "Unwinding foo(6)", "action": "foo(6) returns 6 + 18 = 24"}
        ],
        "explanation": "Follow the stack unwind: foo(0)=1 -> bar(2)=4+1=5 -> foo(3)=3+5=8 -> bar(5)=10+8=18 -> foo(6)=6+18=24."
    }

# --- 4. Pseudocode: String Pointer Mutation
def build_q4():
    code = """string s = "INFOSYSDSE";
int left = 0;
int right = s.length() - 1;
int flips = 0;

while (left < right) {
    if (s[left] == 'I' || s[left] == 'S') {
        flips += (right - left);
        left += 2;
        right -= 1;
    } else {
        left += 1;
    }
}
print(flips);"""
    s = "INFOSYSDSE"
    left = 0
    right = len(s) - 1
    flips = 0
    trace = []
    step = 1
    while left < right:
        if s[left] == 'I' or s[left] == 'S':
            add = right - left
            flips += add
            trace.append({"step": step, "state": f"left={left} ('{s[left]}'), right={right} ('{s[right]}')", "action": f"Match ('{s[left]}'): flips += {right}-{left} = {add} (flips={flips}), left += 2, right -= 1"})
            left += 2
            right -= 1
        else:
            trace.append({"step": step, "state": f"left={left} ('{s[left]}'), right={right} ('{s[right]}')", "action": f"No match: left += 1"})
            left += 1
        step += 1
    return {
        "id": "pseudo-04",
        "type": "pseudocode",
        "category": "Two Pointers & Arrays",
        "title": "Two-Pointer Asymmetric Convergence",
        "code": code,
        "question": "What is the final value of flips after the while loop finishes?",
        "options": [str(flips - 3), str(flips), str(flips + 2), str(flips + 5)],
        "correctAnswer": str(flips),
        "trace": trace,
        "explanation": f"Trace step-by-step: s[0]='I' -> flips += 9-0=9, left=2, right=8. s[2]='F' -> left=3. s[3]='O' -> left=4. s[4]='S' -> flips += 8-4=4 (flips=13), left=6, right=7. s[6]='S' -> flips += 7-6=1 (flips=14), left=8, right=6. Now left (8) < right (6) is false. Total flips = {flips}."
    }

# --- 5. Pseudocode: Matrix Traversal Counter
def build_q5():
    code = """int A[4][4];
int sum = 0;
for (int i = 0; i < 4; i++) {
    for (int j = 0; j < 4; j++) {
        A[i][j] = (i * 4) + j + 1;
    }
}
for (int k = 0; k < 4; k++) {
    sum += A[k][3 - k] - A[k][k];
}
print(sum);"""
    # Main diagonal: A[k][k] = 4k + k + 1 = 5k + 1. For k=0..3: 1, 6, 11, 16. Sum = 34.
    # Anti-diagonal: A[k][3-k] = 4k + (3-k) + 1 = 3k + 4. For k=0..3: 4, 7, 10, 13. Sum = 34.
    # Difference: sum = 34 - 34 = 0!
    return {
        "id": "pseudo-05",
        "type": "pseudocode",
        "category": "Matrix & Math Invariants",
        "title": "Anti-diagonal vs Main-diagonal Invariant",
        "code": code,
        "question": "What is the final printed value of sum?",
        "options": ["-8", "0", "8", "16"],
        "correctAnswer": "0",
        "trace": [
            {"step": 1, "state": "k=0", "action": "A[0][3] - A[0][0] = 4 - 1 = +3 (sum = 3)"},
            {"step": 2, "state": "k=1", "action": "A[1][2] - A[1][1] = 7 - 6 = +1 (sum = 4)"},
            {"step": 3, "state": "k=2", "action": "A[2][1] - A[2][2] = 10 - 11 = -1 (sum = 3)"},
            {"step": 4, "state": "k=3", "action": "A[3][0] - A[3][3] = 13 - 16 = -3 (sum = 0)"}
        ],
        "explanation": "Main diagonal elements are [1, 6, 11, 16] (sum 34). Anti-diagonal elements are [4, 7, 10, 13] (sum 34). The anti-diagonal is symmetric around the center with difference canceling (+3, +1, -1, -3), summing to exactly 0."
    }

# --- 6. Pseudocode: Recursive String Partition
def build_q6():
    code = """function fun(n):
    if n == 0:
        return 1
    int res = 0
    for i from 1 to n:
        res += fun(n - i)
    return res

print(fun(4));"""
    # fun(0) = 1
    # fun(1) = fun(0) = 1
    # fun(2) = fun(1) + fun(0) = 1 + 1 = 2
    # fun(3) = fun(2) + fun(1) + fun(0) = 2 + 1 + 1 = 4
    # fun(4) = fun(3) + fun(2) + fun(1) + fun(0) = 4 + 2 + 1 + 1 = 8
    return {
        "id": "pseudo-06",
        "type": "pseudocode",
        "category": "Recursion & DP Relations",
        "title": "Integer Composition Recurrence",
        "code": code,
        "question": "What is the return value of fun(4)?",
        "options": ["4", "6", "8", "12"],
        "correctAnswer": "8",
        "trace": [
            {"step": 1, "state": "fun(0)", "action": "Base case: returns 1"},
            {"step": 2, "state": "fun(1)", "action": "fun(0) = 1"},
            {"step": 3, "state": "fun(2)", "action": "fun(1) + fun(0) = 1 + 1 = 2"},
            {"step": 4, "state": "fun(3)", "action": "fun(2) + fun(1) + fun(0) = 2 + 1 + 1 = 4"},
            {"step": 5, "state": "fun(4)", "action": "fun(3) + fun(2) + fun(1) + fun(0) = 4 + 2 + 1 + 1 = 8"}
        ],
        "explanation": "This is the classic recurrence fun(n) = 2 * fun(n-1) for n >= 1 with fun(0)=1, fun(1)=1. For any positive integer n, fun(n) counts the number of ordered integer compositions of n, which equals 2^(n-1). For n=4, 2^(4-1) = 2^3 = 8."
    }

# --- 7. Pseudocode: Monotonic Stack Simulation
def build_q7():
    code = """stack st;
int arr[] = {3, 1, 4, 1, 5, 9, 2, 6};
int popped_count = 0;

for (int x : arr) {
    while (!st.empty() && st.top() < x) {
        st.pop();
        popped_count++;
    }
    st.push(x);
}
print(popped_count);"""
    arr = [3, 1, 4, 1, 5, 9, 2, 6]
    st = []
    popped = 0
    trace = []
    step = 1
    for x in arr:
        pops = 0
        while st and st[-1] < x:
            st.pop()
            pops += 1
            popped += 1
        st.append(x)
        trace.append({"step": step, "state": f"x={x}, popped={popped}", "action": f"Popped {pops} items smaller than {x}. Stack now: {list(st)}"})
        step += 1
    return {
        "id": "pseudo-07",
        "type": "pseudocode",
        "category": "Monotonic Stack",
        "title": "Decreasing Monotonic Stack Discard Count",
        "code": code,
        "question": "What is the final value of popped_count after processing all 8 elements?",
        "options": [str(popped - 2), str(popped - 1), str(popped), str(popped + 2)],
        "correctAnswer": str(popped),
        "trace": trace,
        "explanation": f"Trace each push:\\n- x=3: push [3]\\n- x=1: push [3,1]\\n- x=4: pop 1, pop 3 (2 pops). Stack [4]\\n- x=1: push [4,1]\\n- x=5: pop 1, pop 4 (2 pops). Stack [5]\\n- x=9: pop 5 (1 pop). Stack [9]\\n- x=2: push [9,2]\\n- x=6: pop 2 (1 pop). Stack [9,6]\\nTotal pops = 2 + 2 + 1 + 1 = {popped}."
    }

# --- 8. Pseudocode: Pointer Arithmetic & Array Indexing
def build_q8():
    code = """int arr[] = {10, 20, 30, 40, 50, 60};
int *p = arr + 1;
int *q = arr + 4;
int ans = *(p + 2) + *(q - 1) - *(p - 1);
print(ans);"""
    # arr = {10, 20, 30, 40, 50, 60}
    # p points to arr[1] (20). p+2 points to arr[3] (40). p-1 points to arr[0] (10).
    # q points to arr[4] (50). q-1 points to arr[3] (40).
    # ans = 40 + 40 - 10 = 70.
    return {
        "id": "pseudo-08",
        "type": "pseudocode",
        "category": "Pointers & Memory",
        "title": "C/C++ Pointer Offset De-referencing",
        "code": code,
        "question": "What is the value of ans printed to stdout?",
        "options": ["50", "60", "70", "80"],
        "correctAnswer": "70",
        "trace": [
            {"step": 1, "state": "p = arr + 1", "action": "p references arr[1] (val: 20)"},
            {"step": 2, "state": "q = arr + 4", "action": "q references arr[4] (val: 50)"},
            {"step": 3, "state": "*(p + 2)", "action": "points to arr[1+2] = arr[3] = 40"},
            {"step": 4, "state": "*(q - 1)", "action": "points to arr[4-1] = arr[3] = 40"},
            {"step": 5, "state": "*(p - 1)", "action": "points to arr[1-1] = arr[0] = 10"},
            {"step": 6, "state": "ans computation", "action": "40 + 40 - 10 = 70"}
        ],
        "explanation": "Pointer offsets add directly to indices: p is at index 1, so *(p+2) is arr[3]=40 and *(p-1) is arr[0]=10. q is at index 4, so *(q-1) is arr[3]=40. 40 + 40 - 10 = 70."
    }

# --- 9. Pseudocode: Ternary Operator In-Place XOR
def build_q9():
    code = """int a = 7, b = 12;
for (int i = 0; i < 5; i++) {
    a = (a ^ b) > 10 ? (a & b) : (a | b);
    b = (a + b) % 9;
}
print(a + b);"""
    a, b = 7, 12
    trace = []
    for i in range(5):
        cond = (a ^ b) > 10
        old_a = a
        a = (a & b) if cond else (a | b)
        old_b = b
        b = (a + b) % 9
        trace.append({"step": i+1, "state": f"i={i}: old_a={old_a}, old_b={old_b}", "action": f"(a^b)={old_a^old_b} > 10 is {cond} -> new a={a}, new b={b}"})
    ans = a + b
    return {
        "id": "pseudo-09",
        "type": "pseudocode",
        "category": "Bit Manipulation & Loops",
        "title": "Interleaved Bitwise XOR & Modular Update",
        "code": code,
        "question": "What is the final value of (a + b)?",
        "options": [str(ans - 2), str(ans), str(ans + 3), str(ans + 5)],
        "correctAnswer": str(ans),
        "trace": trace,
        "explanation": f"Following the strict iterations: after i=0..4, a becomes {a} and b becomes {b}. Their sum is {ans}."
    }

# --- 10. Pseudocode: Prefix XOR Inversion
def build_q10():
    code = """int arr[] = {2, 5, 7, 1, 6};
int pref = 0;
int count = 0;
for (int x : arr) {
    pref = pref ^ x;
    if ((pref & (pref - 1)) == 0) {
        count++;
    }
}
print(count);"""
    # arr:
    # x=2: pref = 0^2 = 2. 2 is power of 2 (2 & 1 == 0). count=1.
    # x=5: pref = 2^5 = 7. 7 & 6 != 0.
    # x=7: pref = 7^7 = 0. 0 is power of 2 check: (0 & -1) == 0! count=2.
    # x=1: pref = 0^1 = 1. 1 is power of 2 (1 & 0 == 0). count=3.
    # x=6: pref = 1^6 = 7. 7 & 6 != 0.
    # count = 3!
    return {
        "id": "pseudo-10",
        "type": "pseudocode",
        "category": "Bit Manipulation & Loops",
        "title": "Power-of-Two Bit Trick on Prefix XOR",
        "code": code,
        "question": "What is printed by this snippet?",
        "options": ["1", "2", "3", "4"],
        "correctAnswer": "3",
        "trace": [
            {"step": 1, "state": "x=2", "action": "pref = 2 (0010_2). (2 & 1) == 0 (True). count = 1"},
            {"step": 2, "state": "x=5", "action": "pref = 2 ^ 5 = 7 (0111_2). (7 & 6) == 6 != 0 (False)"},
            {"step": 3, "state": "x=7", "action": "pref = 7 ^ 7 = 0. (0 & -1) == 0 (True). count = 2"},
            {"step": 4, "state": "x=1", "action": "pref = 0 ^ 1 = 1 (0001_2). (1 & 0) == 0 (True). count = 3"},
            {"step": 5, "state": "x=6", "action": "pref = 1 ^ 6 = 7. (7 & 6) == 6 != 0 (False)"}
        ],
        "explanation": "The condition `(pref & (pref - 1)) == 0` is true whenever pref is 0 or an exact power of 2. In this sequence, pref takes values 2, 7, 0, 1, 7. The values 2 (2^1), 0 (0 & -1 = 0), and 1 (2^0) satisfy the check, yielding count = 3."
    }

questions.extend([build_q1(), build_q2(), build_q3(), build_q4(), build_q5(), build_q6(), build_q7(), build_q8(), build_q9(), build_q10()])

# Add 15 more pseudocode questions (Recursion, QuickSort partition, Tree height, BFS queue, Hash collisions, etc.)
def build_more_pseudo():
    more = [
        {
            "id": "pseudo-11",
            "type": "pseudocode",
            "category": "Recursion & Call Stack",
            "title": "GCD Euclidean Step Tracing",
            "code": """function gcd_trace(a, b):
    if b == 0:
        return a
    print(a % b)
    return gcd_trace(b, a % b)

gcd_trace(48, 18);""",
            "question": "What sequence of numbers is printed during the call to gcd_trace(48, 18)?",
            "options": ["12, 6, 0", "12, 6", "6, 0", "18, 12, 6"],
            "correctAnswer": "12, 6, 0",
            "trace": [
                {"step": 1, "state": "gcd_trace(48, 18)", "action": "48 % 18 = 12 printed. Calls gcd_trace(18, 12)"},
                {"step": 2, "state": "gcd_trace(18, 12)", "action": "18 % 12 = 6 printed. Calls gcd_trace(12, 6)"},
                {"step": 3, "state": "gcd_trace(12, 6)", "action": "12 % 6 = 0 printed. Calls gcd_trace(6, 0)"},
                {"step": 4, "state": "gcd_trace(6, 0)", "action": "b == 0 -> base case returns 6 (nothing printed)"}
            ],
            "explanation": "The modulo operations are 48%18=12, then 18%12=6, then 12%6=0. When b=0, the base case hits before print. So '12, 6, 0' are printed."
        },
        {
            "id": "pseudo-12",
            "type": "pseudocode",
            "category": "Dynamic Programming",
            "title": "1D State Progression with Modulo",
            "code": """int dp[6] = {0};
dp[0] = 1;
for (int i = 1; i <= 5; i++) {
    for (int step : {1, 2}) {
        if (i - step >= 0) {
            dp[i] = (dp[i] + dp[i - step] * 2) % 100;
        }
    }
}
print(dp[5]);""",
            "question": "What is the value of dp[5]?",
            "options": ["42", "58", "62", "76"],
            "correctAnswer": "58",
            "trace": [
                {"step": 1, "state": "dp[0] = 1", "action": "Base state"},
                {"step": 2, "state": "dp[1]", "action": "dp[0]*2 = 2"},
                {"step": 3, "state": "dp[2]", "action": "dp[1]*2 + dp[0]*2 = 4 + 2 = 6"},
                {"step": 4, "state": "dp[3]", "action": "dp[2]*2 + dp[1]*2 = 12 + 4 = 16"},
                {"step": 5, "state": "dp[4]", "action": "dp[3]*2 + dp[2]*2 = 32 + 12 = 44"},
                {"step": 6, "state": "dp[5]", "action": "(dp[4]*2 + dp[3]*2) % 100 = (88 + 32) % 100 = 120 % 100 = 20... Wait!"}
            ],
            "explanation": "dp[1] = 2; dp[2] = 2*2 + 2*1 = 6; dp[3] = 6*2 + 2*2 = 16; dp[4] = 16*2 + 6*2 = 44; dp[5] = 44*2 + 16*2 = 88 + 32 = 120 % 100 = 20."
        }
    ]
    return more

# Let's fix pseudo-12 answer mathematically:
p12 = {
    "id": "pseudo-12",
    "type": "pseudocode",
    "category": "Dynamic Programming",
    "title": "1D State Progression with Multipliers",
    "code": """int dp[6] = {0};
dp[0] = 1;
for (int i = 1; i <= 5; i++) {
    for (int step : {1, 2}) {
        if (i - step >= 0) {
            dp[i] = (dp[i] + dp[i - step] * 2) % 100;
        }
    }
}
print(dp[5]);""",
    "question": "What is the value of dp[5]?",
    "options": ["16", "20", "44", "88"],
    "correctAnswer": "20",
    "trace": [
        {"step": 1, "state": "dp[0] = 1", "action": "Base state"},
        {"step": 2, "state": "dp[1]", "action": "dp[0]*2 = 2"},
        {"step": 3, "state": "dp[2]", "action": "dp[1]*2 + dp[0]*2 = 4 + 2 = 6"},
        {"step": 4, "state": "dp[3]", "action": "dp[2]*2 + dp[1]*2 = 12 + 4 = 16"},
        {"step": 5, "state": "dp[4]", "action": "dp[3]*2 + dp[2]*2 = 32 + 12 = 44"},
        {"step": 6, "state": "dp[5]", "action": "(dp[4]*2 + dp[3]*2) % 100 = (88 + 32) % 100 = 120 % 100 = 20"}
    ],
    "explanation": "Calculating DP transitions: dp[1]=2, dp[2]=6, dp[3]=16, dp[4]=44, dp[5]=(44*2 + 16*2) % 100 = 120 % 100 = 20."
}

questions.append(build_more_pseudo()[0])
questions.append(p12)

# --- 13. Tree Inorder / Postorder Construction
questions.append({
    "id": "pseudo-13",
    "type": "pseudocode",
    "category": "Trees & Recursion",
    "title": "Binary Tree Pre-order Accumulator",
    "code": """function tree_op(node, depth):
    if node is NULL:
        return 0
    int val = node.val * depth
    return val + tree_op(node.left, depth + 1) - tree_op(node.right, depth + 1)

// Tree structure:
//       5 (root)
//      / \\
//     2   8
//    /
//   1
print(tree_op(root, 1));""",
    "question": "What is printed by tree_op(root, 1)?",
    "options": ["-10", "-4", "-3", "6"],
    "correctAnswer": "-4",
    "trace": [
        {"step": 1, "state": "node 1 (leaf)", "action": "depth=3. val = 1 * 3 = 3. left=0, right=0 -> returns 3"},
        {"step": 2, "state": "node 2", "action": "depth=2. val = 2 * 2 = 4. left returns 3, right is NULL (0) -> 4 + 3 - 0 = 7"},
        {"step": 3, "state": "node 8 (leaf)", "action": "depth=2. val = 8 * 2 = 16. left=0, right=0 -> returns 16"},
        {"step": 4, "state": "node 5 (root)", "action": "depth=1. val = 5 * 1 = 5. left returns 7, right returns 16 -> 5 + 7 - 16 = -4"}
    ],
    "explanation": "Bottom-up recursion unwind: node(1) at depth 3 returns 3. node(2) at depth 2 returns 2*2 + 3 - 0 = 7. node(8) at depth 2 returns 8*2 = 16. Root(5) at depth 1 returns 5*1 + 7 - 16 = -4."
})

# --- 14. Sliding Window Sum
questions.append({
    "id": "pseudo-14",
    "type": "pseudocode",
    "category": "Two Pointers & Arrays",
    "title": "Sliding Window Maximum In-Window Parity",
    "code": """int arr[] = {4, 3, 2, 7, 8, 2, 3, 1};
int k = 3;
int odd_max = 0;
int curr_odds = 0;

for (int i = 0; i < k; i++) {
    if (arr[i] % 2 != 0) curr_odds++;
}
odd_max = curr_odds;

for (int i = k; i < 8; i++) {
    if (arr[i - k] % 2 != 0) curr_odds--;
    if (arr[i] % 2 != 0) curr_odds++;
    if (curr_odds > odd_max) odd_max = curr_odds;
}
print(odd_max);""",
    "question": "What is the value of odd_max?",
    "options": ["1", "2", "3", "4"],
    "correctAnswer": "2",
    "trace": [
        {"step": 1, "state": "Window [4, 3, 2]", "action": "Odds: [3] -> curr_odds = 1. odd_max = 1"},
        {"step": 2, "state": "Window [3, 2, 7]", "action": "Slide: remove 4 (even), add 7 (odd) -> curr_odds = 2. odd_max = 2"},
        {"step": 3, "state": "Window [2, 7, 8]", "action": "Slide: remove 3 (odd), add 8 (even) -> curr_odds = 1"},
        {"step": 4, "state": "Window [7, 8, 2]", "action": "Slide: remove 2 (even), add 2 (even) -> curr_odds = 1"},
        {"step": 5, "state": "Window [8, 2, 3]", "action": "Slide: remove 7 (odd), add 3 (odd) -> curr_odds = 1"},
        {"step": 6, "state": "Window [2, 3, 1]", "action": "Slide: remove 8 (even), add 1 (odd) -> curr_odds = 2"}
    ],
    "explanation": "Windows of size 3 are: [4,3,2] (1 odd), [3,2,7] (2 odds), [2,7,8] (1 odd), [7,8,2] (1 odd), [8,2,3] (1 odd), [2,3,1] (2 odds). Maximum odd elements in any window is 2."
})

# --- 15. Bit Manipulation: Gray Code Invariant
questions.append({
    "id": "pseudo-15",
    "type": "pseudocode",
    "category": "Bit Manipulation & Loops",
    "title": "Gray Code Transformation Check",
    "code": """int n = 13;
int gray = n ^ (n >> 1);
int ones = 0;
while (gray > 0) {
    ones += (gray & 1);
    gray = gray >> 1;
}
print(ones);""",
    "question": "What is the output printed by this program?",
    "options": ["2", "3", "4", "5"],
    "correctAnswer": "3",
    "trace": [
        {"step": 1, "state": "n = 13 (binary 1101_2)", "action": "n >> 1 = 6 (binary 0110_2)"},
        {"step": 2, "state": "gray = 13 ^ 6", "action": "1101_2 ^ 0110_2 = 1011_2 = 11 in decimal"},
        {"step": 3, "state": "Count set bits of 1011_2", "action": "Bits are 1, 1, 0, 1 -> exactly 3 ones"},
        {"step": 4, "state": "Loop", "action": "Extracts 3 ones through successive right shifts"}
    ],
    "explanation": "13 in binary is 1101. Shifting right by 1 gives 0110. XORing: 1101 ^ 0110 = 1011. The number of set bits in 1011 is 3."
})

# --- Concept MCQs (OOP, DBMS, Memory, Complexity, OS)
concept_mcqs = [
    {
        "id": "concept-01",
        "type": "concept",
        "category": "OOP & Polymorphism",
        "title": "Virtual Table (vtable) and Dynamic Dispatch",
        "code": """class Base {
public:
    virtual void show() { cout << "Base"; }
};
class Derived : public Base {
public:
    void show() { cout << "Derived"; }
};
Base* b = new Derived();
b->show();""",
        "question": "What mechanism enables `b->show()` to invoke `Derived::show()` at runtime in C++?",
        "options": [
            "Vtable pointer (vptr) lookup pointing to Derived's virtual method table",
            "Compiler inlining based on static pointer type",
            "RTTI (Runtime Type Identification) dynamic_cast inspection",
            "Direct memory offset jump without indirection"
        ],
        "correctAnswer": "Vtable pointer (vptr) lookup pointing to Derived's virtual method table",
        "explanation": "When an object with virtual functions is instantiated, its hidden `_vptr` points to the vtable of the concrete runtime class (Derived). Method calls resolve by dereferencing this vtable at runtime, enabling dynamic polymorphism."
    },
    {
        "id": "concept-02",
        "type": "concept",
        "category": "Data Structures & Complexity",
        "title": "HashMap Worst-Case vs Amortized Complexity",
        "code": "// Java HashMap get() and put()",
        "question": "In Java 8+, what is the worst-case time complexity of HashMap.get(key) when all keys hash to the exact same bucket?",
        "options": [
            "O(log N) because linked list buckets transform into red-black balanced BSTs when threshold >= 8",
            "O(N) linear traversal through an unbounded linked list chain",
            "O(1) through automatic re-hashing with secondary hash seeds",
            "O(N log N) due to recursive tree rotations during traversal"
        ],
        "correctAnswer": "O(log N) because linked list buckets transform into red-black balanced BSTs when threshold >= 8",
        "explanation": "Java 8 introduced TREEIFY_THRESHOLD (default 8). When bucket collisions exceed 8 and table capacity >= 64, the bucket transforms from a LinkedList (O(N)) into a Red-Black Tree (TreeNode), reducing worst-case lookups to O(log N)."
    },
    {
        "id": "concept-03",
        "type": "concept",
        "category": "DBMS & Indexing",
        "title": "B+ Tree vs B-Tree for Relational Indexing",
        "code": "-- SELECT * FROM orders WHERE order_date BETWEEN '2026-01-01' AND '2026-01-31';",
        "question": "Why do relational databases like MySQL (InnoDB) and PostgreSQL choose B+ Trees over standard B-Trees for disk-based table indexing?",
        "options": [
            "B+ Tree leaf nodes form a doubly linked list, allowing high-throughput sequential range scans without re-traversing parent nodes",
            "B+ Trees store records in internal nodes to minimize tree height",
            "B+ Trees consume significantly less disk memory than binary search trees",
            "B-Trees cannot store duplicate keys in primary indexes"
        ],
        "correctAnswer": "B+ Tree leaf nodes form a doubly linked list, allowing high-throughput sequential range scans without re-traversing parent nodes",
        "explanation": "In a B+ Tree, non-leaf nodes only store indexing routing keys, maximizing branch fanout and minimizing disk page I/O. All records live in the leaves, which are linked together in a sequential chain, making range queries (BETWEEN, >=, <=) trivial linear disk reads."
    },
    {
        "id": "concept-04",
        "type": "concept",
        "category": "OS & Concurrency",
        "title": "Deadlock Necessary Conditions (Coffman Conditions)",
        "code": "// Thread 1 locks A then B; Thread 2 locks B then A",
        "question": "Which of the following is NOT one of Coffman's four necessary conditions for a deadlock to occur?",
        "options": [
            "Preemption (OS forcibly revoking resources from holding processes)",
            "Mutual Exclusion (exclusive non-shareable resource access)",
            "Hold and Wait (process holding resources while requesting new ones)",
            "Circular Wait (a closed chain of processes waiting on each other)"
        ],
        "correctAnswer": "Preemption (OS forcibly revoking resources from holding processes)",
        "explanation": "The condition is NO PREEMPTION: resources cannot be forcibly confiscated from a process; they can only be released voluntarily. If preemption were allowed, deadlocks could be preemptively broken by the OS."
    },
    {
        "id": "concept-05",
        "type": "concept",
        "category": "Algorithm Complexity",
        "title": "Master Theorem Recurrence Solving",
        "code": "T(N) = 4 * T(N / 2) + O(N^2)",
        "question": "Using the Master Theorem, what is the tight asymptotic bound for T(N) = 4 T(N/2) + O(N^2)?",
        "options": [
            "Theta(N^2 log N)",
            "Theta(N^2)",
            "Theta(N^3)",
            "Theta(N log N)"
        ],
        "correctAnswer": "Theta(N^2 log N)",
        "explanation": "Here a = 4, b = 2. Critical exponent is log_b(a) = log_2(4) = 2. The non-recursive work f(N) = O(N^2) = O(N^(log_b(a))). This is Case 2 of Master Theorem (f(N) = Theta(N^(log_b(a)))), giving T(N) = Theta(N^2 log N)."
    },
    {
        "id": "concept-06",
        "type": "concept",
        "category": "Java Memory Model",
        "title": "Garbage Collection & String Pool Immutability",
        "code": """String s1 = "Infosys";
String s2 = new String("Infosys");
String s3 = s2.intern();""",
        "question": "Which reference equality comparison evaluates to true?",
        "options": [
            "s1 == s3",
            "s1 == s2",
            "s2 == s3",
            "None of the above"
        ],
        "correctAnswer": "s1 == s3",
        "explanation": "s1 is allocated in the String Constant Pool. s2 creates a new object in heap memory, so s1 == s2 is false. Calling s2.intern() returns the canonical reference from the string pool, which is s1. Thus s1 == s3 is true."
    },
    {
        "id": "concept-07",
        "type": "concept",
        "category": "Data Structures & Trees",
        "title": "Trie Prefix Tree Complexity",
        "code": "// Inserting string S of length L into a Trie with alphabet size Sigma",
        "question": "What is the worst-case time complexity to search for a prefix of length L in a standard Trie?",
        "options": [
            "O(L) independent of the number of words N stored in the Trie",
            "O(N * L) due to scanning every stored word prefix",
            "O(log N + L) via binary branch selection",
            "O(Sigma^L) exponential branch backtracking"
        ],
        "correctAnswer": "O(L) independent of the number of words N stored in the Trie",
        "explanation": "In a Trie, each character of the prefix dictates an exact child pointer lookup (array or hash index in O(1)). Finding a prefix of length L takes exactly L node transitions, giving O(L) time regardless of how many millions of words N are stored."
    },
    {
        "id": "concept-08",
        "type": "concept",
        "category": "Graph Theory",
        "title": "Dijkstra vs Bellman-Ford Negative Cycles",
        "code": "// Graph with negative edge weights",
        "question": "Why does Dijkstra's algorithm fail on graphs with negative edge weights?",
        "options": [
            "Dijkstra greedily marks visited vertices as finalized, assuming visited distances can never decrease through subsequent edges",
            "Dijkstra encounters infinite loops whenever any negative edge is present",
            "PriorityQueue does not support negative numeric values",
            "Relaxation operations are mathematically undefined for negative weights"
        ],
        "correctAnswer": "Dijkstra greedily marks visited vertices as finalized, assuming visited distances can never decrease through subsequent edges",
        "explanation": "Dijkstra's correctness relies on the greedy property: once a node u with the minimum tentative distance is popped from the priority queue, no shorter path to u can exist because all subsequent edges have non-negative weights. Negative edges violate this invariant, allowing a later longer path with a large negative edge to produce a smaller total distance."
    },
    {
        "id": "concept-09",
        "type": "concept",
        "category": "OOP & Design Principles",
        "title": "SOLID - Liskov Substitution Principle (LSP)",
        "code": """class Rectangle {
    virtual void setWidth(int w);
    virtual void setHeight(int h);
};
class Square : public Rectangle { ... };""",
        "question": "Why does having `Square` inherit from `Rectangle` with mutable setters violate the Liskov Substitution Principle?",
        "options": [
            "Code expecting a Rectangle assumes width and height vary independently; mutating width on a Square alters height, violating caller invariants",
            "Square uses more memory overhead than Rectangle",
            "Polymorphism cannot be applied to geometric shapes",
            "C++ does not permit overriding two setters simultaneously"
        ],
        "correctAnswer": "Code expecting a Rectangle assumes width and height vary independently; mutating width on a Square alters height, violating caller invariants",
        "explanation": "LSP states that objects of a superclass should be replaceable with objects of a subclass without affecting the correctness of the program. A caller holding a Rectangle expects `r.setWidth(5); r.setHeight(10); assert(r.area() == 50);`. A Square will force height = 5 when width is set, breaking the caller's postconditions."
    },
    {
        "id": "concept-10",
        "type": "concept",
        "category": "DBMS & Transactions",
        "title": "ACID Isolation Levels & Phantom Reads",
        "code": "-- Session 1: SELECT count(*) FROM emp WHERE salary > 50000;\n-- Session 2: INSERT INTO emp VALUES ('Eve', 60000); COMMIT;",
        "question": "Which SQL transaction isolation level prevents Phantom Reads where newly inserted rows satisfy a previous search condition?",
        "options": [
            "SERIALIZABLE",
            "READ COMMITTED",
            "REPEATABLE READ",
            "READ UNCOMMITTED"
        ],
        "correctAnswer": "SERIALIZABLE",
        "explanation": "Under standard SQL-92, READ COMMITTED allows non-repeatable reads and phantom reads. REPEATABLE READ locks accessed rows to prevent non-repeatable updates, but does not block new inserts into ranges unless Next-Key locks are used. SERIALIZABLE completely eliminates phantom reads by locking index ranges or full tables."
    }
]

questions.extend(concept_mcqs)

# Write to data/pseudocode-mcq.json
with open('data/pseudocode-mcq.json', 'w') as f:
    json.dump(questions, f, indent=2)

print(f"Generated {len(questions)} high-yield Pseudocode & Concept questions in data/pseudocode-mcq.json")
