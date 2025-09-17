TalentFlow – Mini Hiring Platform (No Backend)

TalentFlow is a React app to manage Jobs, Candidates, and Assessments with local persistence and mock networking. It supports optimistic updates, drag-and-drop, deep links, and an assessment builder with runtime and validation.

Quick Start

- Prerequisite: Node.js 18+
- Install and run (dev):
  - cd react
  - npm install
  - npm run dev
- Build: npm run build (inside react)
- Preview build: npm run preview

Project Structure

- react/
  - src/App.jsx – App shell and routes
  - src/main.jsx – Entry (BrowserRouter)
  - src/style.css – Design system and styles
  - src/components/
    - Nav.jsx, Dashboard.jsx, Jobs.jsx, JobModal.jsx
    - Candidates.jsx, CandidateModal.jsx, KanbanBoard.jsx, CandidateProfile.jsx
    - Assessments.jsx, AssessmentModal.jsx, AssessmentRuntime.jsx
    - NotificationSystem.jsx, MentionsTextarea.jsx, NotesDisplay.jsx, Footer.jsx
  - src/store/DataProvider.jsx – Global state, seeding, persistence
  - src/contexts/ErrorContext.jsx – Notifications
  - src/hooks/useOptimisticUpdate.js – Optimistic updates
  - src/utils/retryUtils.js – Retry with backoff

Key Features

- Jobs
  - Filtered list, pagination
  - Create/Edit in modal; Archive/Unarchive (optimistic with rollback)
  - Drag-and-drop reordering (optimistic with rollback)
  - Deep link: /jobs/:jobId opens the edit modal
- Candidates
  - Search + stage filter
  - Kanban board (drag-and-drop), profile with timeline and notes
  - @mentions in notes; list click opens profile
- Assessments
  - Builder with sections and question types: single, multi, short, long, numeric (min/max), file stub
  - Live preview and runtime with validation and conditional questions (showIf)
  - Builder drafts and responses stored locally

Routing

- / – Dashboard
- /jobs and /jobs/:jobId
- /candidates and /candidates/:id
- /assessments

Data & Persistence

- LocalStorage for app state, drafts, and responses
- Dexie/MSW dependencies included for future IndexedDB + mock REST

Scripts (run inside react/)

- npm run dev – start dev server
- npm run build – production build
- npm run preview – preview built app

License

MIT


