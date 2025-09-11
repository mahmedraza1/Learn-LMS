Build a MERN stack dashboard for WordPress-integrated courses and live lectures. The app should support three roles: student, instructor, and admin, based on the WordPress /me endpoint.

Requirements:

1. **Roles & Permissions:**
   - **Student**: can only see their batch (A or B) lectures for their enrolled courses. Cards should be grayed out if the lecture hasn’t started and prominent when the lecture date/time has arrived. Clicking “Attend” opens the YouTube live video in a fullscreen popup modal.
   - **Instructor**: can add/edit lectures for only the courses assigned to them (max 4 courses). They can only add lectures for batches A & B of their assigned courses. Can edit their own lectures.
   - **Admin**: can add/edit lectures for any course and any batch. Can edit anyone’s lectures.

2. **Data Storage (JSON Files):**
   - **courses.json**: list of all courses with id and name.
   - **classes.json**: stores lectures for each course, batch, lecture number, YouTube URL, scheduled date/time, and instructor id.

3. **Backend (Express/Node):**
   - API endpoints:
     - GET `/lectures/:courseId/:batch` → returns all lectures for course + batch.
     - POST `/lectures/add` → adds a lecture (role-based access: instructor/admin).
     - PUT `/lectures/edit/:lectureId` → edits a lecture (role-based access: instructor/admin).
     - DELETE `/lectures/:lectureId` → deletes a lecture with confirmation.
     - GET `/me` → returns WordPress user info (id, name, role, batch) from `/wp-json/custom/v1/me`.
   - Validate user role and batch for each endpoint.
   - Read/write JSON files for persistence.

4. **Frontend (React + Vite):**
   - Detect WordPress user using `/me` endpoint.
   - Role-based routing & rendering:
     - Guest → show message linking to learn.pk to log in.
     - Student → show batch-specific lecture cards.
     - Instructor/Admin → show course selection, batch tabs, and add/edit lecture forms.
   - **Lecture Cards**:
     - Show thumbnail, lecture number, title, and “Attend” button.
     - Card grayed out if lecture date is in the future, prominent when live.
   - **Add/Edit Lecture Form**:
     - Use **React Hook Form** for form handling.
     - Fields: Lecture number, YouTube live URL, scheduled date/time.
     - Only allowed courses and batches based on role.
   - **Deletion Mechanism**:
     - Can delete single lectures.
     - Warn with confirmation before deleting.
     - Include “Select” feature to select multiple lectures for deletion.
     - “Select All” selects only lectures of the currently selected course.
   - **Notifications**:
     - Use **React Hot Toast** to show success/error messages.
   - **Icons**:
     - Use **React Icons** for buttons (edit, delete, add, etc.).
   - YouTube popup modal for lecture playback.
   - Styling:
     - Light theme.
     - Primary: #0d7c66, Secondary: #f2b544, Heading: #000000, Text secondary: #8a8a8a.
     - Grayed-out cards: desaturated, opacity ~0.5.
     - Prominent cards: primary color accents, hover shadow.

5. **UX/Behavior:**
   - Auto-sort lectures by date.
   - Only instructors assigned to a course can add/edit their courses.
   - Students cannot edit or see other courses/batches.
   - Admin can see/edit all courses and lectures.
   - Handle all role and batch restrictions on both frontend and backend.
   - Responsive layout for desktop, tablet, and mobile.

6. **Extras:**
   - Include simple error handling for failed fetch requests.
   - Include loading state for API calls.
   - Modular React components: LectureCard, AddLectureForm, CourseTabs, YouTubeModal, DeleteConfirmation.
   - Keep code clean and organized for scalability.

Generate both backend and frontend scaffolding, including JSON read/write logic, API endpoints, role-based permissions, React components with state management, lecture card rendering, forms with React Hook Form, notifications using React Hot Toast, icons using React Icons, and deletion with confirmation & select functionality.

Do not hardcode data; make it dynamic and read/write from the JSON files.
