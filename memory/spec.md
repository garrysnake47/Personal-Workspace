# Original Spec (verbatim, 2026-09-12)

> Source of truth for details. If something here conflicts with memory/project.md, this wins on WHAT, project.md wins on HOW/stack.

## Modules
Daily Work Logs · Meetings · Tickets · Tasks · Notes · Reports · Useful Links · Resources
Clean professional productivity-dashboard design. Desktop-primary, fully responsive on tablet/mobile.

## 1. Authentication
Pages: Login, Registration/Sign Up, Logout, Forgot/Reset Password if supported.
Registration fields: Name, Email, Password, Confirm Password.
Users access only their own workspace data. Unauthenticated → redirect to login. After login → dashboard.

## 2. Layout
Left sidebar nav: Dashboard, Work Logs, Tickets, Tasks, Notes, Reports, Links, Resources.
Sidebar bottom: User Profile, Settings, Logout. Sidebar collapses/expands.
Top nav: Global search, current date, Quick Create button, notifications if appropriate, user avatar.
Feel: Linear / Notion / Jira / modern SaaS. Clean typography, whitespace, cards, subtle borders,
clear hierarchy, responsive, light + dark mode.

## 3. Dashboard
Cards: Today's Work Log (Create if none / Continue if exists) · Today's Meetings ·
Active Tickets (Open, In Progress, Blocked) · Tasks (due today, overdue, upcoming) ·
Recent Notes · Quick Links · Recent Activity (work log updated, ticket updated, note created, task completed).

## 4. Work Log — most important feature
Fields: Title (e.g. "Daily Work Log"), Date (defaults today, selectable for historical entries).
Preferably one primary work log per date.

## 5. Meetings (inside each Work Log)
Four default meeting cards: ASU Sync-up, Veritech Sync-up, Client Sync-up, Others.
Each has a large multiline textarea: "Add meeting notes...". Clean and easy to scan.
"+ Add Meeting" for custom meetings (Meeting Name + Meeting Notes).

## 6. Tickets section (inside Work Log)
Prominent input: "Search or enter Ticket ID..."  (e.g. ASU-1234, VER-2456, ABC-567)
If ticket EXISTS → auto-populate: Ticket ID, Title, Current Status, Previous Work Updates, Last Updated Date.
If NOT → auto-create inline, no separate page. Fields: Ticket ID, Title/Summary, Status.
Statuses: Open, In Progress, Blocked, Waiting, Testing, Completed, Closed.

## 7. Ticket Work Updates
Field "Work Done", multiline. Placeholder: "What did you work on for this ticket today?"
**Do NOT overwrite previous work updates.** Append as a new work-entry/history record.
Each update stores: Work description, Date, Time, Associated Work Log, Ticket Status at that time.
Creates a permanent chronological history per ticket.

## 8. Ticket Status
Status changeable when adding an update inside a Work Log. On save, ticket's current status updates.
Status history also kept.

## 9. Multiple Tickets per Work Log
"+ Add Ticket". Each attached ticket = a card. User can add ticket, remove from current work log,
change status, add work notes, open full ticket details.
**Removing a ticket from a Work Log must NOT delete the ticket from the database.**

## 10. Work Log Display (read-only detail page)
Structure: Title, Date, Meetings (name + notes), Tickets (ID, Status, Work Done).
Actions: Edit Work Log, Duplicate (if useful), Export/Print, Delete.
Must be highly readable — used later when preparing reports.

## 11. Work Logs Listing Page
Listed/grouped by date. Search, date filter, month filter, ticket filter.
Each row/card: Date, Title, # meetings, # tickets, Last updated. Click → detail page.

## 12. Tickets Page
Professional table. Columns: Ticket ID, Title, Status, Latest Update, Last Updated, # Work Logs.
Search by Ticket ID, search by title, status filter, sort, pagination if needed.
Colored status badges. Click → ticket detail.

## 13. Ticket Details Page
Header: Ticket ID, Title, Current Status.
Work History: every update added through Daily Work Logs, as a timeline
(Date, source Work Log, Status at that time, description).
Allow direct updates to the ticket when appropriate.

## 14. Tasks
Fields: Title, Description, Due Date, Priority, Status, Related Ticket (optional), Notes.
Priority: Low, Medium, High, Urgent. Status: Todo, In Progress, Completed.
Views: Today, Upcoming, Completed, All Tasks.

## 15. Notes
Fields: Title, Content, Tags, Created Date, Updated Date.
Search, tags, recent notes, favorite/pin. Clean rich-text or Markdown editor if possible.

## 16. Reports
Daily Report (from a selected Work Log), Weekly Report (combine a week's logs),
Monthly Report (summarize a month).
Display: Meetings, Tickets worked on, Work completed, Ticket status, Tasks completed.
Architecture must allow AI-generated report summaries to be added later.

## 17. Links
Fields: Title, URL, Description, Category, Tags. (Jira, GitHub, Confluence, Docs, Internal tools.)
Clean cards.

## 18. Resources
Save documentation links, commands, code snippets, reference notes, useful tools, learning resources.
Fields: Title, Description, Type, URL (if applicable), Content/Notes, Tags.

## 19. Global Search
Across Work Logs, Tickets, Tasks, Notes, Links, Resources.
Searching a Ticket ID immediately shows matching tickets.

## 20. Data Model
User(id, name, email, passwordHash, createdAt, updatedAt)
WorkLog(id, userId, title, date, createdAt, updatedAt)
Meeting(id, workLogId, name, notes, order)
Ticket(id, userId, ticketId, title, status, createdAt, updatedAt)  — ticketId UNIQUE PER USER
TicketWorkUpdate(id, ticketId, workLogId, userId, description, status, createdAt, updatedAt)
  — each new work entry creates a NEW row; never overwrite
Task(id, userId, ticketId?, title, description, dueDate, priority, status, createdAt, updatedAt)
Note(id, userId, title, content, tags, createdAt, updatedAt)
Link(id, userId, title, url, description, category, tags, createdAt)
Resource(id, userId, title, description, type, url, content, tags, createdAt, updatedAt)

## 21. Critical Ticket Logic
1. Search the user's tickets. 2. If exists → load, show title/status/history, allow today's update.
3. If not → create automatically, ask title/summary if needed, set initial status, attach to current Work Log.
4. On work entered → NEVER overwrite; create a new TicketWorkUpdate.
5. Associate with Ticket, Work Log, User, Date/time, Status.
6. Update the ticket's current status.
**One of the most important requirements of the application.**

## 22. Autosave
Debounced autosave when editing a Work Log. Show "Saving..." / "Saved" / "Last saved 2 minutes ago".
Must NOT create duplicate ticket updates. The in-progress update may be updated until the
Work Log entry is finalized; historical entries remain intact.

## 23. Work Log UX
Optimized for very fast daily entry:
open today's log → enter meeting notes → type Ticket ID → ticket appears or is created →
enter work done → set status → add another ticket → save.
Avoid unnecessary modals and page changes. Must feel fast.

## 24. Suggested Work Log Interface
Title field · MEETINGS (4 cards + "Add Meeting") · TICKETS (search input, then ticket cards each with
ID + status badge + title + "Work Done Today" textarea + Status dropdown + "View Previous Updates") ·
"+ Add Ticket" · "Saved ✓" indicator.
Polished, spacious, comfortable for long sessions.

## 25. Technology
Next.js, React, TypeScript, Tailwind, shadcn/ui, Next.js API routes/Server Actions,
PostgreSQL, Prisma, Auth.js/NextAuth, Zod. Clean reusable components, maintainable structure.

## 26. Security
Secure password hashing, auth-protected routes, user-level DB isolation, server-side validation,
input sanitization, secure session handling.
A user must never access another user's Work Logs, Tickets, Tasks, Notes, Links, or Resources.

## 27. UI Components
AppSidebar, TopNavigation, WorkLogEditor, MeetingCard, TicketSearch, TicketCard, TicketStatusBadge,
TicketHistory, TaskCard, NoteCard, ResourceCard, SearchCommand, DatePicker, EmptyState,
ConfirmationDialog. Toast notifications for: work log saved, ticket created, ticket updated, task completed.

## 28. Design Requirement
NOT a generic CRUD admin panel. A personal productivity operating system for a software professional.
Prioritize: fast data entry, easy scanning, strong information hierarchy, minimal clicking,
keyboard-friendly interactions, powerful search, clear ticket history, beautiful Work Log presentation.
Work Log and Ticket workflow get the highest UI/UX attention.

## 29. Future Expansion (design for, do not build)
AI daily summaries, AI weekly status reports, AI search, Jira/GitHub/Slack/Calendar integration,
file attachments, Markdown support, work log templates, PDF export, Markdown export, email reports,
team workspace.

## Final Requirement
Build a USABLE APPLICATION, not static mockups.
Core workflow first: Authentication → Dashboard → Daily Work Log → Meetings → Ticket Search/Create →
Ticket Work Updates → Ticket History → Work Log History.
Ticket search/create/append-history must work correctly before secondary modules.
