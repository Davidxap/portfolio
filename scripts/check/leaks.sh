#!/bin/sh
# Reads a unified diff on stdin and fails when a touched path or an added line looks like a secret,
# an AI-session file or chat text (prompts and transcripts). Naming an AI tool or crediting it as a co-author is allowed. Fed by .githooks/pre-commit; bypass a false positive with `git commit --no-verify`.
diff=$(cat)

files=$(printf '%s\n' "$diff" | sed -n 's|^+++ b/||p' \
  | grep -E '(^|/)(\.(claude|atl|codex|gemini|opencode|ollama|local)|odd)/|(^|/)(HANDOFF|task_plan|findings|progress)\.md$|(^|/)\.env($|\.)' \
  | grep -v '\.env\.example$' | sed 's/$/: session or env file/')

# "path: added line" for every added line.
added=$(printf '%s\n' "$diff" | awk '/^\+\+\+ b\//{f=substr($0,7);next} /^\+\+\+ /{next} /^\+/{print f ": " substr($0,2)}')

marks=$(printf '%s\n' "$added" | grep -iE 'ghp_[a-z0-9]{30,}|github_pat_[a-z0-9_]{20,}|(^|[^a-z0-9])sk-[a-z0-9_-]{20,}|akia[0-9a-z]{16}|begin [a-z ]*private key|[a-z]+://[^:/[:space:]]+:[^@[:space:]]+@')
chat=$(printf '%s\n' "$added" | grep -E '^[^:]+: [[:space:]>*#-]*(User|Human|Assistant|Prompt)\**: ')

hits=$(printf '%s\n%s\n%s\n' "$files" "$marks" "$chat" | sed '/^$/d' | cut -c1-120)
[ -z "$hits" ] && exit 0
echo "Possible leak in the staged changes:"
printf '%s\n' "$hits"
exit 1
