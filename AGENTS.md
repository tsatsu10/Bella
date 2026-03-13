# Agents

This project uses **custom subagents** in [`.cursor/agents/`](.cursor/agents/). Each is a specialist the main Agent can delegate to (e.g. frontend, design, testing, security).

## Quick reference

- **Full index**: See [.cursor/agents/README.md](.cursor/agents/README.md) for the list of subagents and how to invoke them.
- **Invoke in chat**: Use `/name`, e.g. `/engineering-frontend-developer`, or ask in natural language: “Use the design-ui-designer subagent to suggest a layout.”
- **Relevant to this repo** (Next.js, React, birthday site):  
  `engineering-frontend-developer`, `design-ui-designer`, `design-ux-architect`, `testing-accessibility-auditor`, `engineering-security-engineer`, `engineering-technical-writer`.

## How subagents work

- Each subagent runs in its own context; long or noisy work stays there.
- Agent chooses when to delegate based on each file’s `description` in `.cursor/agents/*.md`.
- You can run multiple subagents in parallel for different parts of a task.

Details: [Cursor Subagents docs](https://cursor.com/docs/subagents).
