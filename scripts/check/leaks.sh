#!/bin/sh
# Reads a unified diff on stdin and fails when a touched path or an added line looks like a secret,
# an AI-session file or chat text (prompts and transcripts). Naming an AI tool or crediting it as a co-author is allowed. Fed by .githooks/pre-commit; bypass a false positive with `git commit --no-verify`.
# Input: `+++ b/<path>` lines (one per staged path) followed by the staged diff. A `+++ b/` line is a header only outside a hunk, so an added line that starts with `++ ` is still scanned.
# Chat-like lines are flagged in prose files (md, mdx, txt, rst, html) anywhere, and in other files only after a comment opener.
diff=$(cat)

# Mode "p" prints each header path, any other mode prints "path: added line".
scan_diff='/^diff --git /{h=0;next} /^@@/{h=1;next}
h&&/^\+/{if(m!="p")print f ": " substr($0,2);next} h{next}
/^\+\+\+ b\//{f=substr($0,7);if(m=="p")print f;next}
/^\+\+\+ "b\//{f=substr($0,8);sub(/"$/,"",f);if(m=="p")print f}'

files=$(printf '%s\n' "$diff" | awk -v m=p "$scan_diff" \
  | grep -E '(^|/)(\.(claude|atl|codex|gemini|opencode|ollama|local|taste-skill)|odd)/|(^|/)(HANDOFF|task_plan|findings|progress)\.md$|(^|/)\.env($|\.)' \
  | grep -v '\.env\.example$' | sed 's/$/: session or env file/')

# "path: added line" for every added line.
added=$(printf '%s\n' "$diff" | awk -v m=a "$scan_diff")

marks=$(printf '%s\n' "$added" | grep -iE 'ghp_[a-z0-9]{30,}|github_pat_[a-z0-9_]{20,}|(^|[^a-z0-9])sk-[a-z0-9_-]{20,}|akia[0-9a-z]{16}|begin [a-z ]*private key|[a-z]+://[^:/[:space:]]+:[^@[:space:]]+@')
prose='[^:]+\.(md|mdx|txt|rst|html)'
speaker='[[:space:]>*#-]*(User|Human|Assistant|Prompt)\**: '
chat=$(printf '%s\n' "$added" | grep -E "^$prose: $speaker"
  printf '%s\n' "$added" | grep -vE "^$prose: " | grep -E "^[^:]+: [[:space:]]*(//|#|\*|/\*|<!--)$speaker")

hits=$(printf '%s\n%s\n%s\n' "$files" "$marks" "$chat" | sed '/^$/d' | cut -c1-120)
[ -z "$hits" ] && exit 0
echo "Possible leak in the staged changes:"
printf '%s\n' "$hits"
exit 1
