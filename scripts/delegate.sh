#!/usr/bin/env bash
# Quick-delegate a task to Cursor's inbox from the terminal
# Usage: ./scripts/delegate.sh "Task title" "Description of what to do"

set -euo pipefail

INBOX="$(git rev-parse --show-toplevel)/CURSOR_INBOX.md"
TITLE="${1:?Usage: delegate.sh \"Title\" \"Description\"}"
DESC="${2:-No additional details.}"
PRIORITY="${3:-medium}"
ID="TASK-$(date +%s)"
DATE=$(date +%Y-%m-%d)

TASK_BLOCK="## $ID — $TITLE
**Priority:** $PRIORITY | **Assigned:** $DATE | **Status:** Pending

### Instructions
$DESC

### Acceptance Criteria
- [ ] Implementation matches the instructions above
- [ ] No TypeScript errors
- [ ] Existing tests still pass

### Completion Notes
_(Cursor: write your notes here when done)_

---

"

# Insert new task above the marker line
sed -i "/<!-- NEW TASKS GO ABOVE THIS LINE -->/i\\
$(echo "$TASK_BLOCK" | sed 's/$/\\/' | sed '$ s/\\$//')" "$INBOX"

echo "Delegated $ID to Cursor inbox: $TITLE"
