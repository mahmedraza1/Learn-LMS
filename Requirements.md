# React + Tailwind + Vite Project Instructions

We are building a role-based lecture management frontend that integrates with a WordPress backend API.

---

## API
- First, always fetch user data from:  
  `https://learn.pk/wp-json/custom/v1/me`

- Example response:
  ```json
  {
    "id": 1168,
    "name": "test",
    "email": "test@test.com",
    "roles": ["student", "bbp_participant"],
    "batch": "Batch B"
  }
Role Logic
Guest

If id === 0 → show message:
"Please log in at Learn.pk to continue."

Student

If batch === "Unassigned" → show message:
"Your account is pending verification.
If you have paid your fee, please wait for approval.
If not, please pay your fee or contact us at:
📧 contact@learn.pk
📱 WhatsApp: +923177569038"

If batch === "Batch A" or "Batch B" → show lecture dashboard for that batch.

Instructor/Admin

Skip batch logic.

Show dashboard with tabs for "Batch A" and "Batch B".

Each tab shows course cards.

Clicking a course shows lecture cards (15 cards, prewritten dates).

Instructors/Admins can add/edit/delete lectures by entering a YouTube live stream URL.

Lecture Dates Logic
Each course has 15 lectures.

Each lecture card must have a scheduled date.

Rules
Batch A → Lectures are scheduled on all odd dates of the current month (1, 3, 5, 7, …).

Batch B → Lectures are scheduled on all even dates of the current month (2, 4, 6, 8, …).

Display Behavior
Today’s date:

If today matches the scheduled date → mark that lecture card as prominent (highlighted with primary color).

All other lecture dates:

Cards must appear grayed out (reduced opacity, disabled hover/CTA).

Student Dashboard Rules
Students see all courses in their batch.

Each lecture card shows:

YouTube thumbnail (or placeholder if no link).

Title: "Lecture {number}".

Scheduled date (calculated via odd/even rule).

CTA button → "Attend".

Card states:

Today’s lecture → highlighted with primary color (#0d7c66).

All other lectures → grayed out (lower opacity).

Clicking a card/CTA opens a fullscreen modal with embedded YouTube live stream.

Components
React Hook Form → for forms (adding/editing lectures).

React Hot Toast → for notifications (success/error).

React Icons → for icons (close button, delete icon, play icon, etc).

TailwindCSS → for styling.

Theme
Mode: Light

make design modern

Colors:

Primary: #0d7c66

Secondary: #f2b544

Heading: #000000

Text Secondary: #8a8a8a 

## Additional Features
- **Instructors/Admins**  
  - Confirmation dialog before deleting a lecture.  
  - Delete only resets the lecture’s YouTube link to blank, keeping the lecture card, date, and numbering intact.  
  - Multi-select delete option.  
  - "Select All" → only selects lectures of the current course.  

- **Students**  
  - If lecture date != today → card is **disabled + grayed out**.  
  - If lecture date == today → card is **prominent + clickable**.  
