@AGENTS.md

## Cursor Delegation System
When the user wants to delegate a task to Cursor, write a structured task entry
into `CURSOR_INBOX.md`. Use this format:

```
## TASK-{timestamp} — {Title}
**Priority:** {high|medium|low} | **Assigned:** {date} | **Status:** Pending

### Instructions
{Detailed instructions for Cursor}

### Acceptance Criteria
- [ ] {criterion 1}
- [ ] {criterion 2}

### Completion Notes
_(Cursor: write your notes here when done)_
```

Insert new tasks above the `<!-- NEW TASKS GO ABOVE THIS LINE -->` marker.
Cursor's `.cursorrules` file tells it to check this inbox before starting work.
