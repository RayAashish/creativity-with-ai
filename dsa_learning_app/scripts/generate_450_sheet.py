#!/usr/bin/env python3
import json
import re

# Load existing 67 questions from src/data/questions450.ts
with open('src/data/questions450.ts', 'r', encoding='utf-8') as f:
    orig_content = f.read()

# Parse existing questions
# Pattern for question blocks
q_pattern = re.compile(
    r"\{\s*id:\s*'([^']+)',\s*title:\s*'([^']+)',\s*topic:\s*'([^']+)',\s*difficulty:\s*'([^']+)',\s*platform:\s*'([^']+)',\s*url:\s*'([^']+)',\s*companies:\s*\[([^\]]*)\],\s*description:\s*'([^']*)'(?:,\s*hint:\s*'([^']*)')?\s*\}",
    re.MULTILINE | re.DOTALL
)

existing_questions = []
for match in q_pattern.finditer(orig_content):
    qid, title, topic, diff, platform, url, companies_str, desc, hint = match.groups()
    companies = [c.strip().strip("'\"") for c in companies_str.split(',') if c.strip()]
    q_obj = {
        'id': qid,
        'title': title,
        'topic': topic,
        'difficulty': diff,
        'platform': platform,
        'url': url,
        'companies': companies,
        'description': desc
    }
    if hint:
        q_obj['hint'] = hint
    existing_questions.append(q_obj)

print(f"Loaded {len(existing_questions)} existing questions.")
