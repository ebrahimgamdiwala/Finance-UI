# Task Schema Alignment - Project Manager Implementation

## Overview
Updated the tasks section to properly reflect the Task model schema and provide comprehensive task management for Project Managers.

## Schema Reference (from `prisma/schema.prisma`)

```prisma
model Task {
  id           String      @id @default(uuid())
  project      Project     @relation(fields: [projectId], references: [id], onDelete: Cascade)
  projectId    String
  title        String
  description  String?
  assigneeId   String?
  assignee     User?       @relation("Assignee", fields: [assigneeId], references: [id], onDelete: SetNull)
  status       TaskStatus  @default(NEW)
  priority     Priority    @default(MEDIUM)
  deadline     DateTime?
  estimateHours Decimal?   @db.Decimal(8,2)
  loggedHours  Decimal?    @db.Decimal(8,2) @default(0.00)
  orderIndex   Int?
  coverUrl     String?
  images       String[]    @default([])
  createdAt    DateTime    @default(now())
  updatedAt    DateTime    @updatedAt

  comments     TaskComment[]
  attachments  Attachment[]
  timesheets   Timesheet[]
}
```

## Changes Made

### 1. KanbanBoard Component (`components/KanbanBoard.jsx`)

#### Removed:
- ❌ Hardcoded "Feedback" and "Bug" badges (not in schema)
- ❌ Generic task display without description

#### Added:
- ✅ **Priority Badge** - Shows priority level with color coding (CRITICAL, HIGH, MEDIUM, LOW)
- ✅ **Description Preview** - Displays first 2 lines of task description
- ✅ **Time Tracking Display** - Shows `loggedHours / estimateHours` (e.g., "4h / 8h")
- ✅ **Comments Count** - Shows number of comments using `_count.comments`
- ✅ **Attachments Count** - Shows number of attachments using `_count.attachments`
- ✅ **Timesheets** - Backend includes timesheet count in `_count.timesheets`

**Example Task Card Now Shows:**
```
[CRITICAL Badge] ⭐⭐⭐
Project: Website Redesign
Fix homepage layout bug
"The navigation menu overlaps the hero section on mobile devices..."

📅 Nov 12  ⏱️ 4h / 8h
💬 3  📎 2
[Avatar] John Doe
```

### 2. EditTaskDialog Component (`components/EditTaskDialog.jsx`)

#### Added:
- ✅ **Logged Hours Field** - Input to track hours already worked on the task
  - Type: number with 0.5 step increment
  - Placeholder: "e.g., 4.5"
  - Help text: "Hours already logged on this task"
- ✅ **Improved Layout** - Reorganized time tracking fields into a dedicated row

**Form Structure:**
```
- Task Title * (required)
- Description
- Status | Priority
- Assign To | Deadline
- Estimated Hours | Logged Hours (NEW)
- Cover Image URL | Upload Cover
- Multiple Images Upload
```

### 3. API Routes Updates

#### `/api/projects/[id]/route.js`
- ✅ Returns `_count` for comments, attachments, and timesheets
- ✅ Includes all task relationships in project detail response

#### `/api/tasks/route.js` (POST)
- ✅ Returns task with `_count` data after creation
- ✅ Initializes `loggedHours` to 0.00 (schema default)

#### `/api/tasks/[id]/route.js` (PATCH)
- ✅ Accepts `loggedHours` in update payload
- ✅ Returns task with `_count` data after update
- ✅ Handles `estimateHours` and `loggedHours` as Decimal types

### 4. Schema-Aligned Features

| Schema Field | Implementation | Location |
|--------------|----------------|----------|
| `title` | Required field with validation | CreateTaskDialog, EditTaskDialog |
| `description` | Textarea with preview on card | KanbanBoard, Both Dialogs |
| `status` | Drag-drop columns + Select | KanbanBoard, Both Dialogs |
| `priority` | Badge + Stars (1-3) | KanbanBoard, Both Dialogs |
| `deadline` | Date picker with display | KanbanBoard, Both Dialogs |
| `estimateHours` | Number input (0.5 step) | CreateTaskDialog, EditTaskDialog |
| `loggedHours` | Number input (0.5 step) | EditTaskDialog |
| `coverUrl` | URL input + upload | Both Dialogs |
| `images[]` | Multiple upload + carousel | Both Dialogs, KanbanBoard |
| `assignee` | User select dropdown | Both Dialogs, KanbanBoard |
| `comments` | Count display | KanbanBoard (from `_count`) |
| `attachments` | Count display | KanbanBoard (from `_count`) |
| `timesheets` | Related data | Backend API includes count |

## Task Card Display Logic

```javascript
// Priority-based badge color
CRITICAL: bg-red-500/10 text-red-600
HIGH:     bg-orange-500/10 text-orange-600
MEDIUM:   bg-yellow-500/10 text-yellow-600
LOW:      bg-gray-500/10 text-gray-600

// Priority stars
LOW:      ⭐ (1 star)
MEDIUM:   ⭐⭐ (2 stars)
HIGH:     ⭐⭐⭐ (3 stars)
CRITICAL: ⭐⭐⭐ (3 stars, red color)

// Time tracking display
Shows: loggedHours / estimateHours
Example: "4h / 8h" (4 hours logged out of 8 estimated)
Only shows if either value exists
```

## Project Manager Workflow

1. **View Project Tasks**
   - Navigate to `/dashboard/projects/[id]`
   - Switch to "Tasks" tab
   - See all tasks in Kanban board format

2. **Create New Task**
   - Click "New Task" button
   - Fill in all schema fields including:
     - Title (required)
     - Description
     - Status, Priority
     - Assignee, Deadline
     - Estimated Hours
     - Cover image or multiple images

3. **Edit Existing Task**
   - Click on any task card
   - Update any field including:
     - Log hours worked (loggedHours)
     - Change status by dragging or using dropdown
     - Add/remove images
     - Reassign to team member

4. **Track Progress**
   - View logged vs estimated hours on each card
   - See comments and attachments count
   - Monitor task status across columns
   - Check priority indicators (badges + stars)

## Backend Data Flow

```
GET /api/projects/[id]
├─ Returns project with tasks[]
├─ Each task includes:
│  ├─ All schema fields
│  ├─ assignee { id, name, email, avatarUrl }
│  └─ _count { comments, attachments, timesheets }

POST /api/tasks
├─ Creates task with all schema fields
├─ Auto-sets orderIndex for column
├─ Returns task with assignee and _count

PATCH /api/tasks/[id]
├─ Updates any schema field
├─ Handles loggedHours updates
├─ Returns updated task with _count
```

## Future Enhancements (Per Schema)

- [ ] **Task Comments** - Add comment UI using TaskComment model
- [ ] **Attachments** - File upload using Attachment model
- [ ] **Timesheets** - Time logging UI using Timesheet model
- [ ] **Time Entry** - Create timesheets when logging hours
- [ ] **Billable Hours** - Track billable vs non-billable time
- [ ] **Task Analytics** - Show time-to-completion metrics
- [ ] **Burndown Charts** - Visualize estimated vs logged hours

## Notes

- All numeric fields (estimateHours, loggedHours) support 0.5 hour increments
- Image carousel auto-plays every 3 seconds with pause on hover
- Task cards show description preview (first 2 lines)
- Comments/attachments are counted but UI not yet implemented
- Timesheets are tracked in the backend but not visible in UI yet
- loggedHours should ideally be calculated from timesheets (future enhancement)

## Testing Checklist

- [x] Create task with all fields populated
- [x] Edit task and update loggedHours
- [x] View time tracking (logged / estimated)
- [x] See priority badges with correct colors
- [x] Count comments/attachments (when they exist)
- [x] Upload multiple images and view carousel
- [x] Drag tasks between status columns
- [x] Assign/reassign team members
- [x] Set deadlines and see them on cards

## Related Files

- `prisma/schema.prisma` - Source of truth for Task model
- `components/KanbanBoard.jsx` - Main task display component
- `components/CreateTaskDialog.jsx` - Task creation form
- `components/EditTaskDialog.jsx` - Task editing form
- `app/api/tasks/route.js` - Task CRUD endpoints
- `app/api/tasks/[id]/route.js` - Single task operations
- `app/api/projects/[id]/route.js` - Project with tasks

---

**Last Updated:** November 8, 2025
**Status:** ✅ Complete - All schema fields implemented
