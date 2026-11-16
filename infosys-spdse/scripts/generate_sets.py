import json, random

with open('/Users/aashishkumarray/Desktop/creativity-with-ai/infosys-spdse/data/problems.json') as f:
    problems = json.load(f)

# Group problems by tier
by_tier = {
    "P1 Easy": [p for p in problems if p['tier'] == "P1 Easy"],
    "P2 Medium": [p for p in problems if p['tier'] == "P2 Medium"],
    "P3 Hard": [p for p in problems if p['tier'] == "P3 Hard"],
    "P4 Complex": [p for p in problems if p['tier'] == "P4 Complex"]
}

print(f"Pool sizes: P1={len(by_tier['P1 Easy'])}, P2={len(by_tier['P2 Medium'])}, P3={len(by_tier['P3 Hard'])}, P4={len(by_tier['P4 Complex'])}")

usage_count = {}
predicted_sets = []

TOTAL_SETS = 52
roles = ["DSE", "SP L1", "SP L2", "SP L3"]

for i in range(1, TOTAL_SETS + 1):
    # Determine role target and structure
    if i <= 15:
        target_role = "DSE"
        time_limit = 180
        pass_threshold = "Solve P1 fully + at least 35% on P2 (Total 35+ marks)"
        has_p4 = False
    elif i <= 32:
        target_role = "SP L1"
        time_limit = 180
        pass_threshold = "Solve P1 and P2 fully (Total 50+ marks)"
        has_p4 = False
    elif i <= 44:
        target_role = "SP L2"
        time_limit = 180
        pass_threshold = "Solve P1, P2 fully + at least 65% on P3 (Total 80+ marks)"
        has_p4 = (i % 2 == 0)
    else:
        target_role = "SP L3"
        time_limit = 180
        pass_threshold = "Solve all 3 (or 4) problems cleanly with 100% test cases passed"
        has_p4 = True

    # Helper to pick candidate with lowest usage
    def pick_problem(tier):
        pool = by_tier[tier]
        # Filter problems used < 3 times
        valid = [p for p in pool if usage_count.get(p['id'], 0) < 3]
        if not valid:
            valid = pool
        # Pick problem with minimum current usage
        valid.sort(key=lambda x: usage_count.get(x['id'], 0))
        chosen = valid[0]
        usage_count[chosen['id']] = usage_count.get(chosen['id'], 0) + 1
        return chosen

    p1 = pick_problem("P1 Easy")
    p2 = pick_problem("P2 Medium")
    p3 = pick_problem("P3 Hard")
    
    set_problems = [
        {
            "position": "P1",
            "marks": 20,
            "problem": p1,
            "storyDisguise": f"Set {i} Task Alpha: {p1['storyDisguise']}",
            "hint": f"Examine the constraints and order of operations. Hidden Pattern: {p1['patternName']}."
        },
        {
            "position": "P2",
            "marks": 30,
            "problem": p2,
            "storyDisguise": f"Set {i} Task Beta: {p2['storyDisguise']}",
            "hint": f"Notice whether a greedy rule or binary monotonic condition holds. Hidden Pattern: {p2['patternName']}."
        },
        {
            "position": "P3",
            "marks": 50,
            "problem": p3,
            "storyDisguise": f"Set {i} Task Gamma: {p3['storyDisguise']}",
            "hint": f"Identify the subproblem overlapping structure or graph transition. Hidden Pattern: {p3['patternName']}."
        }
    ]

    if has_p4 and len(by_tier["P4 Complex"]) > 0:
        p4 = pick_problem("P4 Complex")
        set_problems.append({
            "position": "P4",
            "marks": 30,
            "problem": p4,
            "storyDisguise": f"Set {i} Task Delta: {p4['storyDisguise']}",
            "hint": f"State optimization under multi-dimensional constraints. Hidden Pattern: {p4['patternName']}."
        })

    predicted_sets.append({
        "id": f"set-{i:02d}",
        "title": f"Predicted Assessment Set {i:02d}",
        "targetRole": target_role,
        "timeLimitMinutes": time_limit,
        "passCriteria": pass_threshold,
        "problemCount": len(set_problems),
        "totalMarks": sum(sp["marks"] for sp in set_problems),
        "problems": set_problems
    })

print(f"Generated {len(predicted_sets)} predicted sets.")

# Check max usage of any problem
max_usage = max(usage_count.values())
min_usage = min(usage_count.values())
print(f"Usage stats: max usage = {max_usage}, min usage = {min_usage}")

# Generate Coverage Matrix
coverage_matrix = {
    "totalSets": len(predicted_sets),
    "maxProblemReuse": max_usage,
    "patternOccurrences": {},
    "tierOccurrences": {},
    "roleOccurrences": {}
}

for s in predicted_sets:
    role = s['targetRole']
    coverage_matrix["roleOccurrences"][role] = coverage_matrix["roleOccurrences"].get(role, 0) + 1
    for prob_entry in s['problems']:
        prob = prob_entry['problem']
        pat = prob['pattern']
        tier = prob['tier']
        coverage_matrix["patternOccurrences"][pat] = coverage_matrix["patternOccurrences"].get(pat, 0) + 1
        coverage_matrix["tierOccurrences"][tier] = coverage_matrix["tierOccurrences"].get(tier, 0) + 1

with open('/Users/aashishkumarray/Desktop/creativity-with-ai/infosys-spdse/data/predicted-sets.json', 'w') as f:
    json.dump(predicted_sets, f, indent=2)

with open('/Users/aashishkumarray/Desktop/creativity-with-ai/infosys-spdse/data/set-coverage.json', 'w') as f:
    json.dump(coverage_matrix, f, indent=2)

print("Saved /data/predicted-sets.json and /data/set-coverage.json successfully.")
print("Coverage Summary:")
print(json.dumps(coverage_matrix, indent=2))
