# Learn Live - Lecture Management System

A React-based lecture management system that integrates with a WordPress backend API for user authentication and provides a dedicated Express backend for lecture data storage.

## Features

- **Role-based access control**: Different views for guests, students, and instructors/admins
- **Batch management**: Courses organized by batches with specific lecture schedules
- **Lecture scheduling**: Automatic date calculation for lectures based on batch rules
- **Live lectures**: Integration with YouTube live streams for virtual classes
- **Responsive design**: Built with Tailwind CSS for a modern, mobile-friendly interface
- **Persistent storage**: Express backend API with JSON file storage

## Technologies Used

- React 19
- Tailwind CSS 4
- Vite 7
- Express.js for backend API
- Axios for API requests
- React Hook Form for form management
- React Hot Toast for notifications
- React Icons for UI elements
- Concurrently for running multiple services

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm 9.x or higher

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/mahmedraza1/Learn-Live.git
   cd Learn-Live
   ```

2. Install all dependencies (frontend and backend):
   ```
   ./setup.sh
   ```
   
   Or manually:
   ```
   npm install                        # Install frontend dependencies
   cd server && npm install && cd ..  # Install backend dependencies
   ```

3. Start both frontend and backend:
   ```
   npm run dev:all
   ```
   
   Or start them separately:
   ```
   # Terminal 1 - Frontend
   npm run dev
   
   # Terminal 2 - Backend
   npm run server
   ```

4. Access the frontend at [https://lectures.learn.pk:5173](https://lectures.learn.pk:5173)
5. Backend API runs at [http://localhost:5000](http://localhost:5000)

## Project Structure

- `src/components/` - Reusable UI components
- `src/contexts/` - React context providers for state management
- `src/pages/` - Page components for different user roles
- `src/utils/` - Utility functions and helpers
- `server/` - Express.js backend API
- `server/data/` - JSON data storage files

## User Roles

### Guest
- Sees a login message prompting them to log in at Learn.pk

### Student
- If unassigned to a batch: Sees a pending verification message
- If assigned to a batch: Sees lecture dashboard for their batch

### Instructor/Admin
- Has access to all batches
- Can add/edit/delete lectures
- Can preview video content

## Backend API Endpoints

- `GET /api/lectures` - Get all lectures
- `GET /api/lectures/:batch` - Get lectures for a specific batch
- `GET /api/lectures/:batch/:courseId` - Get lectures for a specific course in a batch
- `POST /api/lectures/:batch/:courseId` - Create or update a lecture
- `DELETE /api/lectures/:batch/:courseId/:lectureId` - Delete a lecture

## Data Structure

The backend stores lectures in a JSON file with the following structure:

```json
{
  "Batch A": {
    "course_id_1": [
      {
        "id": 1234567890,
        "course_id": "course_id_1",
        "title": "Lecture 1",
        "youtube_url": "https://youtube.com/watch?v=VIDEO_ID",
        "youtube_id": "VIDEO_ID",
        "lecture_number": 1,
        "date": "2023-10-01T00:00:00.000Z"
      }
    ]
  },
  "Batch B": {
    // Similar structure for Batch B
  }
}
```
