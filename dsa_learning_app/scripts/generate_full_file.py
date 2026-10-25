#!/usr/bin/env python3
import json

# Load all pieces
with open('scripts/existing67.json') as f:
    existing = json.load(f)

with open('scripts/arrays_addl.json') as f:
    arrays_addl = json.load(f)

with open('scripts/strings_addl.json') as f:
    strings_addl = json.load(f)

with open('scripts/ll_addl.json') as f:
    ll_addl = json.load(f)

with open('scripts/sq_addl.json') as f:
    sq_addl = json.load(f)

with open('scripts/trees_addl.json') as f:
    trees_addl = json.load(f)

with open('scripts/bst_addl.json') as f:
    bst_addl = json.load(f)

with open('scripts/grd_addl.json') as f:
    grd_addl = json.load(f)

with open('scripts/bck_addl.json') as f:
    bck_addl = json.load(f)

with open('scripts/heap_addl.json') as f:
    heap_addl = json.load(f)

with open('scripts/grp_addl.json') as f:
    grp_addl = json.load(f)

with open('scripts/dp_addl.json') as f:
    dp_addl = json.load(f)

with open('scripts/bit_addl.json') as f:
    bit_addl = json.load(f)

# Group existing by topic
existing_by_topic = {}
for q in existing:
    existing_by_topic.setdefault(q['topic'], []).append(q)

topic_groups = [
    ('ARRAYS', 'arrays', existing_by_topic['arrays'] + arrays_addl),
    ('STRINGS', 'strings', existing_by_topic['strings'] + strings_addl),
    ('LINKED LIST', 'linked-list', existing_by_topic['linked-list'] + ll_addl),
    ('STACKS & QUEUES', 'stacks-queues', existing_by_topic['stacks-queues'] + sq_addl),
    ('BINARY TREES', 'trees', existing_by_topic['trees'] + trees_addl),
    ('BINARY SEARCH TREES', 'bst', existing_by_topic['bst'] + bst_addl),
    ('GRAPHS', 'graphs', existing_by_topic['graphs'] + grp_addl),
    ('DYNAMIC PROGRAMMING', 'dp', existing_by_topic['dp'] + dp_addl),
    ('HEAPS & HASHING', 'heaps-hashing', existing_by_topic['heaps-hashing'] + heap_addl),
    ('GREEDY', 'greedy', existing_by_topic['greedy'] + grd_addl),
    ('BACKTRACKING', 'backtracking', existing_by_topic['backtracking'] + bck_addl),
    ('BIT MANIPULATION', 'bit-manipulation', existing_by_topic['bit-manipulation'] + bit_addl),
]

def format_question(q):
    lines = ["  {"]
    lines.append(f"    id: '{q['id']}',")
    # escape single quotes in title and description
    title = q['title'].replace("'", "\\'")
    lines.append(f"    title: '{title}',")
    lines.append(f"    topic: '{q['topic']}',")
    lines.append(f"    difficulty: '{q['difficulty']}',")
    lines.append(f"    platform: '{q['platform']}',")
    lines.append(f"    url: '{q['url']}',")
    escaped_companies = []
    for c in q['companies']:
        esc = c.replace("'", "\\'")
        escaped_companies.append(f"'{esc}'")
    companies_str = ", ".join(escaped_companies)
    lines.append(f"    companies: [{companies_str}],")
    desc = q.get('description', '').replace("'", "\\'")
    lines.append(f"    description: '{desc}',")
    if 'hint' in q and q['hint']:
        hint = q['hint'].replace("'", "\\'")
        lines.append(f"    hint: '{hint}',")
    lines.append("  },")
    return "\n".join(lines)

output_lines = [
    "import { Question } from '../types/dsa';",
    "",
    "export const QUESTIONS_450: Question[] = ["
]

total_count = 0
for title, topic_key, questions in topic_groups:
    output_lines.append(f"  // ================= {title} ({len(questions)}) =================")
    total_count += len(questions)
    for q in questions:
        output_lines.append(format_question(q))
    output_lines.append("")

output_lines.append("];")
output_lines.append("")

output_text = "\n".join(output_lines)

with open('src/data/questions450.ts', 'w', encoding='utf-8') as f:
    f.write(output_text)

print(f"Successfully generated src/data/questions450.ts with {total_count} questions.")
