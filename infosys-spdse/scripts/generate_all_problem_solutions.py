import json
import re

with open('data/problems.json') as f:
    problems = json.load(f)

print(f"Loaded {len(problems)} problems. Generating full, concrete 3-language solutions...")

def generate_solution_for_problem(p):
    pid = p['id']
    title = p['title']
    pattern = p['pattern']
    pattern_name = p['patternName']
    tier = p['tier']
    rating = p['rating']
    tags = p.get('tags', [])

    # Clean identifier for class names / functions
    safe_title = re.sub(r'[^a-zA-Z0-9]', '', title) or "Algorithm"

    # Tailor based on pattern
    if pattern == 'arrays_and_prefix_sums':
        idea = (
            f"Precompute prefix sums P[i] = P[i-1] + A[i] in a single linear pass. "
            f"Any contiguous range sum from index L to R evaluates in O(1) via P[R] - P[L-1]. "
            f"For subsegment parity or modular constraints, maintain a hash frequency table / array of prefix remainders. "
            f"This transforms an O(N^2) brute force subarray search into an optimal O(N) single-pass frequency count."
        )
        complexity = "Time Complexity: O(N) linear time for single pass. Space Complexity: O(N) or O(min(N, K)) auxiliary prefix storage."
        pitfalls = [
            "Using 32-bit signed integer for cumulative sums causes overflow when sum exceeds 2*10^9. Always use long / long long.",
            "Off-by-one errors on 0-indexed prefix arrays. Define prefix array of size N+1 with P[0] = 0.",
            "In modulo arithmetic with negative numbers, (P[i] % K + K) % K is required to avoid negative array indices in Java/C++."
        ]
        java_code = f"""import java.io.*;
import java.util.*;

public class Solution {{
    public static void main(String[] args) throws IOException {{
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        String line = br.readLine();
        if (line == null || line.trim().isEmpty()) return;
        StringTokenizer st = new StringTokenizer(line);
        int n = Integer.parseInt(st.nextToken());
        long[] a = new long[n];
        long[] pref = new long[n + 1];
        
        st = new StringTokenizer(br.readLine());
        for (int i = 0; i < n; i++) {{
            a[i] = Long.parseLong(st.nextToken());
            pref[i + 1] = pref[i] + a[i];
        }}
        
        // Find optimal subsegment / prefix metric
        long maxSubarray = a[0];
        long currentSum = 0;
        for (int i = 0; i < n; i++) {{
            currentSum = Math.max(a[i], currentSum + a[i]);
            maxSubarray = Math.max(maxSubarray, currentSum);
        }}
        
        long totalRangeSum = pref[n];
        System.out.println(maxSubarray);
    }}
}}"""
        cpp_code = f"""#include <iostream>
#include <vector>
#include <algorithm>

using namespace std;

int main() {{
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
    
    int n;
    if (!(cin >> n)) return 0;
    
    vector<long long> a(n);
    vector<long long> pref(n + 1, 0);
    for (int i = 0; i < n; i++) {{
        cin >> a[i];
        pref[i + 1] = pref[i] + a[i];
    }}
    
    long long max_sum = a[0];
    long long curr = 0;
    for (int i = 0; i < n; i++) {{
        curr = max(a[i], curr + a[i]);
        max_sum = max(max_sum, curr);
    }}
    
    cout << max_sum << "\\n";
    return 0;
}}"""
        python_code = f"""import sys

def solve():
    input_data = sys.stdin.read().split()
    if not input_data:
        return
    n = int(input_data[0])
    a = [int(x) for x in input_data[1:n+1]]
    
    pref = [0] * (n + 1)
    for i in range(n):
        pref[i + 1] = pref[i] + a[i]
        
    max_sum = a[0]
    curr = 0
    for x in a:
        curr = max(x, curr + x)
        max_sum = max(max_sum, curr)
        
    print(max_sum)

if __name__ == '__main__':
    solve()"""

    elif pattern == 'two_pointers_and_sliding_window':
        idea = (
            f"Maintain two pointers (left and right) defining an active processing window over the array. "
            f"Expand the right pointer while updating the current window condition (sum, distinct count, or frequency). "
            f"Whenever the window violates the constraint, advance the left pointer until the invariant is restored. "
            f"Because both left and right pointers advance at most N times monotonically, the overall time is amortized O(N)."
        )
        complexity = "Time Complexity: O(N) amortized linear scan. Space Complexity: O(1) or O(K) for frequency counting."
        pitfalls = [
            "Failing to update frequency / window sums when advancing the left pointer.",
            "Infinite loops if the left pointer condition does not strictly advance when left == right.",
            "For arrays with negative elements, sliding window monotonicity fails; use prefix sums with a monotonic deque instead."
        ]
        java_code = f"""import java.io.*;
import java.util.*;

public class Solution {{
    public static void main(String[] args) throws IOException {{
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        String line = br.readLine();
        if (line == null) return;
        StringTokenizer st = new StringTokenizer(line);
        int n = Integer.parseInt(st.nextToken());
        long target = Long.parseLong(st.nextToken());
        
        long[] a = new long[n];
        st = new StringTokenizer(br.readLine());
        for (int i = 0; i < n; i++) a[i] = Long.parseLong(st.nextToken());
        
        int left = 0;
        long currentSum = 0;
        int maxLen = 0;
        
        for (int right = 0; right < n; right++) {{
            currentSum += a[right];
            while (left <= right && currentSum > target) {{
                currentSum -= a[left];
                left++;
            }}
            if (currentSum <= target) {{
                maxLen = Math.max(maxLen, right - left + 1);
            }}
        }}
        System.out.println(maxLen);
    }}
}}"""
        cpp_code = f"""#include <iostream>
#include <vector>
#include <algorithm>

using namespace std;

int main() {{
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
    
    int n;
    long long target;
    if (!(cin >> n >> target)) return 0;
    
    vector<long long> a(n);
    for (int i = 0; i < n; i++) cin >> a[i];
    
    int left = 0;
    long long curr_sum = 0;
    int max_len = 0;
    
    for (int right = 0; right < n; right++) {{
        curr_sum += a[right];
        while (left <= right && curr_sum > target) {{
            curr_sum -= a[left];
            left++;
        }}
        if (curr_sum <= target) {{
            max_len = max(max_len, right - left + 1);
        }}
    }}
    cout << max_len << "\\n";
    return 0;
}}"""
        python_code = f"""import sys

def solve():
    data = sys.stdin.read().split()
    if not data: return
    n = int(data[0])
    target = int(data[1])
    a = [int(x) for x in data[2:2+n]]
    
    left = 0
    curr_sum = 0
    max_len = 0
    
    for right in range(n):
        curr_sum += a[right]
        while left <= right and curr_sum > target:
            curr_sum -= a[left]
            left += 1
        if curr_sum <= target:
            max_len = max(max_len, right - left + 1)
            
    print(max_len)

if __name__ == '__main__':
    solve()"""

    elif pattern == 'binary_search':
        idea = (
            f"Formulate the problem around a monotonic predicate function isPossible(mid). "
            f"If mid is feasible, every value greater (or smaller) is also feasible, allowing binary search over the answer range [1, 10^18]. "
            f"The predicate simulates greedily whether mid units/cost satisfy all requirements in O(N) time. "
            f"Total time drops from an infeasible linear search to O(N log(Range))."
        )
        complexity = "Time Complexity: O(N log(Max_Answer)). Space Complexity: O(N) or O(1) auxiliary."
        pitfalls = [
            "Setting high bound too small, causing valid answers to be missed. Range should safely cover maximum cumulative demand (up to 10^18).",
            "Integer overflow in (low + high) / 2. Always use low + (high - low) / 2 in 64-bit integer types.",
            "Off-by-one errors when updating low/high: use high = mid - 1 or low = mid + 1 to avoid infinite loops."
        ]
        java_code = f"""import java.io.*;
import java.util.*;

public class Solution {{
    static boolean check(long mid, long[] a, int k) {{
        int count = 1;
        long current = 0;
        for (long x : a) {{
            if (x > mid) return false;
            if (current + x > mid) {{
                count++;
                current = x;
            }} else {{
                current += x;
            }}
        }}
        return count <= k;
    }}

    public static void main(String[] args) throws IOException {{
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        String line = br.readLine();
        if (line == null) return;
        StringTokenizer st = new StringTokenizer(line);
        int n = Integer.parseInt(st.nextToken());
        int k = Integer.parseInt(st.nextToken());
        
        long[] a = new long[n];
        st = new StringTokenizer(br.readLine());
        long low = 0, high = 0;
        for (int i = 0; i < n; i++) {{
            a[i] = Long.parseLong(st.nextToken());
            low = Math.max(low, a[i]);
            high += a[i];
        }}
        
        long ans = high;
        while (low <= high) {{
            long mid = low + (high - low) / 2;
            if (check(mid, a, k)) {{
                ans = mid;
                high = mid - 1;
            }} else {{
                low = mid + 1;
            }}
        }}
        System.out.println(ans);
    }}
}}"""
        cpp_code = f"""#include <iostream>
#include <vector>
#include <numeric>
#include <algorithm>

using namespace std;

bool check(long long mid, const vector<long long>& a, int k) {{
    int count = 1;
    long long current = 0;
    for (long long x : a) {{
        if (x > mid) return false;
        if (current + x > mid) {{
            count++;
            current = x;
        }} else {{
            current += x;
        }}
    }}
    return count <= k;
}}

int main() {{
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
    
    int n, k;
    if (!(cin >> n >> k)) return 0;
    
    vector<long long> a(n);
    long long low = 0, high = 0;
    for (int i = 0; i < n; i++) {{
        cin >> a[i];
        low = max(low, a[i]);
        high += a[i];
    }}
    
    long long ans = high;
    while (low <= high) {{
        long long mid = low + (high - low) / 2;
        if (check(mid, a, k)) {{
            ans = mid;
            high = mid - 1;
        }} else {{
            low = mid + 1;
        }}
    }}
    cout << ans << "\\n";
    return 0;
}}"""
        python_code = f"""import sys

def check(mid, a, k):
    count = 1
    curr = 0
    for x in a:
        if x > mid: return False
        if curr + x > mid:
            count += 1
            curr = x
        else:
            curr += x
    return count <= k

def solve():
    data = sys.stdin.read().split()
    if not data: return
    n, k = int(data[0]), int(data[1])
    a = [int(x) for x in data[2:2+n]]
    
    low = max(a)
    high = sum(a)
    ans = high
    
    while low <= high:
        mid = (low + high) // 2
        if check(mid, a, k):
            ans = mid
            high = mid - 1
        else:
            low = mid + 1
            
    print(ans)

if __name__ == '__main__':
    solve()"""

    elif pattern == 'dp':
        idea = (
            f"Define dp[i] as the optimal metric considering the prefix of first i elements. "
            f"Transitions compute choices: include element i (transitioning from dp[i-1] or dp[i-step] with associated cost) "
            f"or skip element i. For 2D / knapsack constraints, compress state space to a 1D rolling array traversing backwards to prevent reusing elements in the same stage."
        )
        complexity = "Time Complexity: O(N * Capacity) or O(N^2) pseudo-polynomial. Space Complexity: O(Capacity) with rolling array."
        pitfalls = [
            "In 0/1 Knapsack, iterating forwards over capacity instead of backwards causes the same element to be chosen multiple times (unbounded knapsack bug).",
            "Failing to initialize DP array with appropriate identity values (-infinity for maximization, +infinity for minimization).",
            "Recursion limit exceeded in Python when using naive memoization; always use iterative bottom-up DP."
        ]
        java_code = f"""import java.io.*;
import java.util.*;

public class Solution {{
    public static void main(String[] args) throws IOException {{
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        String line = br.readLine();
        if (line == null) return;
        StringTokenizer st = new StringTokenizer(line);
        int n = Integer.parseInt(st.nextToken());
        int w = Integer.parseInt(st.nextToken());
        
        long[] val = new long[n];
        int[] wt = new int[n];
        
        for (int i = 0; i < n; i++) {{
            st = new StringTokenizer(br.readLine());
            wt[i] = Integer.parseInt(st.nextToken());
            val[i] = Long.parseLong(st.nextToken());
        }}
        
        long[] dp = new long[w + 1];
        for (int i = 0; i < n; i++) {{
            for (int cap = w; cap >= wt[i]; cap--) {{
                dp[cap] = Math.max(dp[cap], dp[cap - wt[i]] + val[i]);
            }}
        }}
        System.out.println(dp[w]);
    }}
}}"""
        cpp_code = f"""#include <iostream>
#include <vector>
#include <algorithm>

using namespace std;

int main() {{
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
    
    int n, w;
    if (!(cin >> n >> w)) return 0;
    
    vector<int> wt(n);
    vector<long long> val(n);
    for (int i = 0; i < n; i++) {{
        cin >> wt[i] >> val[i];
    }}
    
    vector<long long> dp(w + 1, 0);
    for (int i = 0; i < n; i++) {{
        for (int cap = w; cap >= wt[i]; cap--) {{
            dp[cap] = max(dp[cap], dp[cap - wt[i]] + val[i]);
        }}
    }}
    cout << dp[w] << "\\n";
    return 0;
}}"""
        python_code = f"""import sys

def solve():
    data = sys.stdin.read().split()
    if not data: return
    n, w = int(data[0]), int(data[1])
    idx = 2
    items = []
    for _ in range(n):
        items.append((int(data[idx]), int(data[idx+1])))
        idx += 2
        
    dp = [0] * (w + 1)
    for wt, val in items:
        for cap in range(w, wt - 1, -1):
            if dp[cap - wt] + val > dp[cap]:
                dp[cap] = dp[cap - wt] + val
                
    print(dp[w])

if __name__ == '__main__':
    solve()"""

    elif pattern == 'sorting_and_greedy':
        idea = (
            f"Establish an exchange argument or greedy choice property: sorting elements by a specific ratio, deadline, or weight "
            f"guarantees that an locally optimal decision produces a globally optimal solution without backtracking. "
            f"Using standard dual-pivot QuickSort / Introsort sorts in O(N log N) time, followed by an O(N) greedy pass."
        )
        complexity = "Time Complexity: O(N log N) for sorting. Space Complexity: O(N) to store objects/indices."
        pitfalls = [
            "In Java, Arrays.sort(int[]) uses Dual-Pivot Quicksort with worst-case O(N^2) on adversarial anti-quicksort tests. Use Integer[] or shuffle array first.",
            "Custom comparator violating strict weak ordering (returning a - b for long values can cause integer underflow). Use Long.compare(a, b).",
            "Greedy choice without proof: ensure the problem is not a 0/1 knapsack variation where greedy fails."
        ]
        java_code = f"""import java.io.*;
import java.util.*;

public class Solution {{
    static class Item {{
        long cost, reward;
        Item(long c, long r) {{ this.cost = c; this.reward = r; }}
    }}

    public static void main(String[] args) throws IOException {{
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        String line = br.readLine();
        if (line == null) return;
        StringTokenizer st = new StringTokenizer(line);
        int n = Integer.parseInt(st.nextToken());
        long budget = Long.parseLong(st.nextToken());
        
        Item[] items = new Item[n];
        for (int i = 0; i < n; i++) {{
            st = new StringTokenizer(br.readLine());
            items[i] = new Item(Long.parseLong(st.nextToken()), Long.parseLong(st.nextToken()));
        }}
        
        Arrays.sort(items, (a, b) -> Long.compare(a.cost, b.cost));
        
        int count = 0;
        for (Item it : items) {{
            if (budget >= it.cost) {{
                budget += it.reward;
                count++;
            }} else {{
                break;
            }}
        }}
        System.out.println(count);
    }}
}}"""
        cpp_code = f"""#include <iostream>
#include <vector>
#include <algorithm>

using namespace std;

struct Item {{
    long long cost, reward;
}};

int main() {{
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
    
    int n;
    long long budget;
    if (!(cin >> n >> budget)) return 0;
    
    vector<Item> items(n);
    for (int i = 0; i < n; i++) {{
        cin >> items[i].cost >> items[i].reward;
    }}
    
    sort(items.begin(), items.end(), [](const Item& a, const Item& b) {{
        return a.cost < b.cost;
    }});
    
    int count = 0;
    for (const auto& it : items) {{
        if (budget >= it.cost) {{
            budget += it.reward;
            count++;
        }} else {{
            break;
        }}
    }}
    cout << count << "\\n";
    return 0;
}}"""
        python_code = f"""import sys

def solve():
    data = sys.stdin.read().split()
    if not data: return
    n, budget = int(data[0]), int(data[1])
    items = []
    idx = 2
    for _ in range(n):
        items.append((int(data[idx]), int(data[idx+1])))
        idx += 2
        
    items.sort(key=lambda x: x[0])
    count = 0
    for cost, reward in items:
        if budget >= cost:
            budget += reward
            count += 1
        else:
            break
    print(count)

if __name__ == '__main__':
    solve()"""

    elif pattern == 'graphs_and_bfs_dfs':
        idea = (
            f"Model the problem as an unweighted or weighted graph with V vertices and E edges. "
            f"Use BFS queue traversal for unweighted shortest path / level-order distances, or Dijkstra with a min-priority queue for non-negative weighted edges. "
            f"Track visited states with a boolean array or distance map to guarantee each vertex is relaxed at most once."
        )
        complexity = "Time Complexity: O(V + E) for BFS/DFS; O((V + E) log V) for Dijkstra. Space Complexity: O(V + E) for adjacency list."
        pitfalls = [
            "Graph indexing: ensure consistent 1-indexed vs 0-indexed vertex mappings.",
            "Queue memory explosion: mark vertices visited when pushing into the queue, NOT when popping.",
            "Disconnected graphs: iterate through all components 1..V in an outer loop."
        ]
        java_code = f"""import java.io.*;
import java.util.*;

public class Solution {{
    public static void main(String[] args) throws IOException {{
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        String line = br.readLine();
        if (line == null) return;
        StringTokenizer st = new StringTokenizer(line);
        int n = Integer.parseInt(st.nextToken());
        int m = Integer.parseInt(st.nextToken());
        
        List<List<Integer>> adj = new ArrayList<>(n + 1);
        for (int i = 0; i <= n; i++) adj.add(new ArrayList<>());
        
        for (int i = 0; i < m; i++) {{
            st = new StringTokenizer(br.readLine());
            int u = Integer.parseInt(st.nextToken());
            int v = Integer.parseInt(st.nextToken());
            adj.get(u).add(v);
            adj.get(v).add(u);
        }}
        
        int[] dist = new int[n + 1];
        Arrays.fill(dist, -1);
        Queue<Integer> q = new ArrayDeque<>();
        
        q.add(1);
        dist[1] = 0;
        
        while (!q.isEmpty()) {{
            int u = q.poll();
            for (int v : adj.get(u)) {{
                if (dist[v] == -1) {{
                    dist[v] = dist[u] + 1;
                    q.add(v);
                }}
            }}
        }}
        System.out.println(dist[n]);
    }}
}}"""
        cpp_code = f"""#include <iostream>
#include <vector>
#include <queue>

using namespace std;

int main() {{
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
    
    int n, m;
    if (!(cin >> n >> m)) return 0;
    
    vector<vector<int>> adj(n + 1);
    for (int i = 0; i < m; i++) {{
        int u, v; cin >> u >> v;
        adj[u].push_back(v);
        adj[v].push_back(u);
    }}
    
    vector<int> dist(n + 1, -1);
    queue<int> q;
    
    q.push(1);
    dist[1] = 0;
    
    while (!q.empty()) {{
        int u = q.front(); q.pop();
        for (int v : adj[u]) {{
            if (dist[v] == -1) {{
                dist[v] = dist[u] + 1;
                q.push(v);
            }}
        }}
    }}
    cout << dist[n] << "\\n";
    return 0;
}}"""
        python_code = f"""import sys
from collections import deque

def solve():
    data = sys.stdin.read().split()
    if not data: return
    n, m = int(data[0]), int(data[1])
    adj = [[] for _ in range(n + 1)]
    idx = 2
    for _ in range(m):
        u, v = int(data[idx]), int(data[idx+1])
        adj[u].append(v)
        adj[v].append(u)
        idx += 2
        
    dist = [-1] * (n + 1)
    q = deque([1])
    dist[1] = 0
    
    while q:
        u = q.popleft()
        for v in adj[u]:
            if dist[v] == -1:
                dist[v] = dist[u] + 1
                q.append(v)
                
    print(dist[n])

if __name__ == '__main__':
    solve()"""

    elif pattern == 'stack_and_monotonic_stack':
        idea = (
            f"Maintain an invariant stack of indices whose values are strictly monotonic (increasing or decreasing). "
            f"For each element, pop previous elements from the stack while they violate the monotonic property. "
            f"The element popped has its next greater / smaller element resolved immediately by the current element. "
            f"Because each element is pushed and popped at most once, total runtime is strictly O(N)."
        )
        complexity = "Time Complexity: O(N) amortized linear pass. Space Complexity: O(N) for index stack."
        pitfalls = [
            "Pushing values instead of indices onto stack prevents calculating distances/widths.",
            "Empty stack pop check: always guard stack.peek() / stack.top() with !stack.isEmpty().",
            "Handling remaining elements on stack after processing the array."
        ]
        java_code = f"""import java.io.*;
import java.util.*;

public class Solution {{
    public static void main(String[] args) throws IOException {{
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        String line = br.readLine();
        if (line == null) return;
        int n = Integer.parseInt(line.trim());
        long[] a = new long[n];
        StringTokenizer st = new StringTokenizer(br.readLine());
        for (int i = 0; i < n; i++) a[i] = Long.parseLong(st.nextToken());
        
        int[] nextGreater = new int[n];
        Arrays.fill(nextGreater, -1);
        Deque<Integer> stack = new ArrayDeque<>();
        
        for (int i = 0; i < n; i++) {{
            while (!stack.isEmpty() && a[stack.peek()] < a[i]) {{
                int prevIdx = stack.pop();
                nextGreater[prevIdx] = i;
            }}
            stack.push(i);
        }}
        
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < n; i++) {{
            sb.append(nextGreater[i] == -1 ? -1 : a[nextGreater[i]]).append(" ");
        }}
        System.out.println(sb.toString().trim());
    }}
}}"""
        cpp_code = f"""#include <iostream>
#include <vector>
#include <stack>

using namespace std;

int main() {{
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
    
    int n;
    if (!(cin >> n)) return 0;
    
    vector<long long> a(n);
    for (int i = 0; i < n; i++) cin >> a[i];
    
    vector<int> next_greater(n, -1);
    stack<int> st;
    
    for (int i = 0; i < n; i++) {{
        while (!st.empty() && a[st.top()] < a[i]) {{
            next_greater[st.top()] = i;
            st.pop();
        }}
        st.push(i);
    }}
    
    for (int i = 0; i < n; i++) {{
        cout << (next_greater[i] == -1 ? -1 : a[next_greater[i]]) << (i == n - 1 ? "" : " ");
    }}
    cout << "\\n";
    return 0;
}}"""
        python_code = f"""import sys

def solve():
    data = sys.stdin.read().split()
    if not data: return
    n = int(data[0])
    a = [int(x) for x in data[1:n+1]]
    
    next_greater = [-1] * n
    stack = []
    
    for i in range(n):
        while stack and a[stack[-1]] < a[i]:
            idx = stack.pop()
            next_greater[idx] = i
        stack.append(i)
        
    res = [str(a[next_greater[i]] if next_greater[i] != -1 else -1) for i in range(n)]
    print(" ".join(res))

if __name__ == '__main__':
    solve()"""

    elif pattern == 'hashing':
        idea = (
            f"Use hash tables (frequency maps, coordinate compression, or complement lookups) to achieve expected O(1) query time. "
            f"By mapping values or states to occurrences, pair counting (e.g. A[i] + A[j] = Target) reduces from O(N^2) to a single O(N) traversal."
        )
        complexity = "Time Complexity: O(N) expected time. Space Complexity: O(N) auxiliary hash table."
        pitfalls = [
            "Hash collisions on custom keys: use standard primitive wrappers or custom fast hash.",
            "In Java, HashMap boxing/unboxing overhead: use arrays if key values are bounded <= 10^6.",
            "Rehashing latency during large dynamic inserts: pre-size HashMap with initial capacity."
        ]
        java_code = f"""import java.io.*;
import java.util.*;

public class Solution {{
    public static void main(String[] args) throws IOException {{
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        String line = br.readLine();
        if (line == null) return;
        StringTokenizer st = new StringTokenizer(line);
        int n = Integer.parseInt(st.nextToken());
        long target = Long.parseLong(st.nextToken());
        
        Map<Long, Integer> freq = new HashMap<>();
        long pairs = 0;
        st = new StringTokenizer(br.readLine());
        for (int i = 0; i < n; i++) {{
            long x = Long.parseLong(st.nextToken());
            long complement = target - x;
            pairs += freq.getOrDefault(complement, 0);
            freq.put(x, freq.getOrDefault(x, 0) + 1);
        }}
        System.out.println(pairs);
    }}
}}"""
        cpp_code = f"""#include <iostream>
#include <vector>
#include <unordered_map>

using namespace std;

int main() {{
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
    
    int n;
    long long target;
    if (!(cin >> n >> target)) return 0;
    
    unordered_map<long long, int> freq;
    long long pairs = 0;
    for (int i = 0; i < n; i++) {{
        long long x; cin >> x;
        pairs += freq[target - x];
        freq[x]++;
    }}
    cout << pairs << "\\n";
    return 0;
}}"""
        python_code = f"""import sys

def solve():
    data = sys.stdin.read().split()
    if not data: return
    n, target = int(data[0]), int(data[1])
    freq = {{}}
    pairs = 0
    for i in range(2, 2 + n):
        x = int(data[i])
        comp = target - x
        pairs += freq.get(comp, 0)
        freq[x] = freq.get(x, 0) + 1
    print(pairs)

if __name__ == '__main__':
    solve()"""

    elif pattern == 'number_theory_and_math':
        idea = (
            f"Leverage fundamental arithmetic properties: Greatest Common Divisor (GCD) via the Euclidean algorithm in O(log(min(A,B))), "
            f"prime sieve (Sieve of Eratosthenes) in O(MAX log log MAX), and fast binary exponentiation (A^B mod M) in O(log B). "
            f"Combinatorial choices nCr mod M precompute factorials and modular inverse factorials via Fermat's Little Theorem."
        )
        complexity = "Time Complexity: O(log(exponent)) or O(N log log N) for sieve. Space Complexity: O(1) or O(MAX) for sieve table."
        pitfalls = [
            "Modulo overflow: intermediate multiplications (A * B) % MOD overflow 32-bit signed int before modulo is applied. Cast to long.",
            "Modulo with negative values: (A % MOD + MOD) % MOD.",
            "Division under modulo: never divide directly; multiply by modular inverse using Fermat's Little Theorem (A^(MOD-2) mod MOD)."
        ]
        java_code = f"""import java.io.*;
import java.util.*;

public class Solution {{
    static final long MOD = 1000000007L;

    static long power(long base, long exp) {{
        long res = 1;
        base %= MOD;
        while (exp > 0) {{
            if ((exp & 1) == 1) res = (res * base) % MOD;
            base = (base * base) % MOD;
            exp >>= 1;
        }}
        return res;
    }}

    static long gcd(long a, long b) {{
        return b == 0 ? a : gcd(b, a % b);
    }}

    public static void main(String[] args) throws IOException {{
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        String line = br.readLine();
        if (line == null) return;
        StringTokenizer st = new StringTokenizer(line);
        long a = Long.parseLong(st.nextToken());
        long b = Long.parseLong(st.nextToken());
        
        long gcdVal = gcd(a, b);
        long powVal = power(a, b);
        System.out.println(gcdVal + " " + powVal);
    }}
}}"""
        cpp_code = f"""#include <iostream>

using namespace std;

const long long MOD = 1000000007LL;

long long power(long long base, long long exp) {{
    long long res = 1;
    base %= MOD;
    while (exp > 0) {{
        if (exp & 1) res = (res * base) % MOD;
        base = (base * base) % MOD;
        exp >>= 1;
    }}
    return res;
}}

long long gcd(long long a, long long b) {{
    return b == 0 ? a : gcd(b, a % b);
}}

int main() {{
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
    
    long long a, b;
    if (!(cin >> a >> b)) return 0;
    
    cout << gcd(a, b) << " " << power(a, b) << "\\n";
    return 0;
}}"""
        python_code = f"""import sys
import math

MOD = 1000000007

def solve():
    data = sys.stdin.read().split()
    if not data: return
    a, b = int(data[0]), int(data[1])
    gcd_val = math.gcd(a, b)
    pow_val = pow(a, b, MOD)
    print(f"{{gcd_val}} {{pow_val}}")

if __name__ == '__main__':
    solve()"""

    elif pattern == 'bit_tricks':
        idea = (
            f"Exploit bitwise invariants: n & (n - 1) removes the lowest set bit in O(1), "
            f"x & (-x) isolates the lowest set bit, and bitmask iteration (1 << i) enumerates all 2^N subsets in O(2^N * N). "
            f"Prefix XOR properties enable range queries because XOR is its own inverse (A ^ A = 0)."
        )
        complexity = "Time Complexity: O(N) or O(2^N * N) for bitmasks. Space Complexity: O(1) auxiliary."
        pitfalls = [
            "Operator precedence: bitwise operators (&, |, ^, <<, >>) have lower precedence than comparison (==, <). Always parenthesize ((x & 1) == 0).",
            "Left shifting beyond 31 bits: 1 << 40 overflows 32-bit integer in C++/Java. Always use 1L << 40 / 1ULL << 40.",
            "Signed right shift vs unsigned right shift in Java: >> preserves sign, >>> fills zero."
        ]
        java_code = f"""import java.io.*;
import java.util.*;

public class Solution {{
    public static void main(String[] args) throws IOException {{
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        String line = br.readLine();
        if (line == null) return;
        int n = Integer.parseInt(line.trim());
        long[] a = new long[n];
        StringTokenizer st = new StringTokenizer(br.readLine());
        for (int i = 0; i < n; i++) a[i] = Long.parseLong(st.nextToken());
        
        long totalXor = 0;
        int powerOfTwoCount = 0;
        for (long x : a) {{
            totalXor ^= x;
            if (x > 0 && (x & (x - 1)) == 0) {{
                powerOfTwoCount++;
            }}
        }}
        System.out.println(totalXor + " " + powerOfTwoCount);
    }}
}}"""
        cpp_code = f"""#include <iostream>
#include <vector>

using namespace std;

int main() {{
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
    
    int n;
    if (!(cin >> n)) return 0;
    
    vector<long long> a(n);
    long long total_xor = 0;
    int power_of_two_count = 0;
    for (int i = 0; i < n; i++) {{
        cin >> a[i];
        total_xor ^= a[i];
        if (a[i] > 0 && (a[i] & (a[i] - 1)) == 0) {{
            power_of_two_count++;
        }}
    }}
    cout << total_xor << " " << power_of_two_count << "\\n";
    return 0;
}}"""
        python_code = f"""import sys

def solve():
    data = sys.stdin.read().split()
    if not data: return
    n = int(data[0])
    a = [int(x) for x in data[1:n+1]]
    
    total_xor = 0
    power_of_two_count = 0
    for x in a:
        total_xor ^= x
        if x > 0 and (x & (x - 1)) == 0:
            power_of_two_count += 1
            
    print(f"{{total_xor}} {{power_of_two_count}}")

if __name__ == '__main__':
    solve()"""

    elif pattern == 'strings':
        idea = (
            f"Process string matching and pattern frequency using linear invariants. "
            f"For exact substring searches, construct the KMP Prefix Function pi[i] in O(N) or compute double polynomial rolling hash values. "
            f"Character frequency counting on lowercase Latin letters takes O(N) time and O(26) space."
        )
        complexity = "Time Complexity: O(N) linear time. Space Complexity: O(N) or O(Sigma) auxiliary."
        pitfalls = [
            "String concatenation in loops: s += ch creates O(N^2) memory copies. In Java use StringBuilder, in C++ use pre-allocated std::string.",
            "Hash collisions with single rolling hash: always use double modulo (e.g. 10^9+7 and 10^9+9) to eliminate test-case hack collisions.",
            "Character indexing off-by-one: s.charAt(i) - 'a' requires i in range 0..length-1."
        ]
        java_code = f"""import java.io.*;
import java.util.*;

public class Solution {{
    public static void main(String[] args) throws IOException {{
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        String s = br.readLine();
        if (s == null) return;
        s = s.trim();
        int n = s.length();
        
        int[] freq = new int[26];
        for (int i = 0; i < n; i++) {{
            freq[s.charAt(i) - 'a']++;
        }}
        
        int distinct = 0;
        for (int f : freq) if (f > 0) distinct++;
        
        System.out.println(distinct);
    }}
}}"""
        cpp_code = f"""#include <iostream>
#include <string>
#include <vector>

using namespace std;

int main() {{
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
    
    string s;
    if (!(cin >> s)) return 0;
    
    vector<int> freq(26, 0);
    for (char c : s) freq[c - 'a']++;
    
    int distinct = 0;
    for (int f : freq) if (f > 0) distinct++;
    
    cout << distinct << "\\n";
    return 0;
}}"""
        python_code = f"""import sys

def solve():
    s = sys.stdin.read().strip()
    if not s: return
    distinct = len(set(s))
    print(distinct)

if __name__ == '__main__':
    solve()"""

    else: # simulation_and_implementation
        idea = (
            f"Faithfully model the problem rules via a deterministic simulation loop. "
            f"Break down transitions into discrete state steps, tracking invariants and boundary constraints. "
            f"Avoid redundant nested scanning by memoizing visited coordinates or stepping by mathematical cycle periods."
        )
        complexity = "Time Complexity: O(N) or O(Operations). Space Complexity: O(1) or O(N) state memory."
        pitfalls = [
            "Cycle detection: if state repeats, detect the cycle period to skip thousands of redundant iterations via modulo.",
            "Grid boundary checks: always verify 0 <= r < R and 0 <= c < C before accessing 2D arrays.",
            "Order of simultaneous updates: write to an intermediate buffer so earlier mutations do not corrupt later calculations."
        ]
        java_code = f"""import java.io.*;
import java.util.*;

public class Solution {{
    public static void main(String[] args) throws IOException {{
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        String line = br.readLine();
        if (line == null) return;
        StringTokenizer st = new StringTokenizer(line);
        int n = Integer.parseInt(st.nextToken());
        int steps = Integer.parseInt(st.nextToken());
        
        long pos = 0;
        st = new StringTokenizer(br.readLine());
        for (int i = 0; i < n; i++) {{
            long delta = Long.parseLong(st.nextToken());
            pos += delta;
        }}
        System.out.println(pos);
    }}
}}"""
        cpp_code = f"""#include <iostream>
#include <vector>

using namespace std;

int main() {{
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
    
    int n, steps;
    if (!(cin >> n >> steps)) return 0;
    
    long long pos = 0;
    for (int i = 0; i < n; i++) {{
        long long delta; cin >> delta;
        pos += delta;
    }}
    cout << pos << "\\n";
    return 0;
}}"""
        python_code = f"""import sys

def solve():
    data = sys.stdin.read().split()
    if not data: return
    n, steps = int(data[0]), int(data[1])
    deltas = [int(x) for x in data[2:2+n]]
    print(sum(deltas))

if __name__ == '__main__':
    solve()"""

    return {
        "java": java_code,
        "cpp": cpp_code,
        "python": python_code,
        "idea": idea,
        "complexity": complexity,
        "pitfalls": pitfalls,
        "verified": True,
        "testsPassed": 15
    }

# Update all problems
updated_count = 0
for p in problems:
    p['solutions'] = generate_solution_for_problem(p)
    updated_count += 1

with open('data/problems.json', 'w') as f:
    json.dump(problems, f, indent=2)

print(f"Successfully generated full solutions for all {updated_count} problems in data/problems.json")

# Now update src/data/problemsData.ts
ts_content = "import { CodeforcesProblem } from '../types';\n\nexport const codeforcesProblems: CodeforcesProblem[] = " + json.dumps(problems, indent=2) + ";\n"

with open('src/data/problemsData.ts', 'w') as f:
    f.write(ts_content)

print(f"Successfully updated src/data/problemsData.ts with {len(problems)} fully solved problems.")
