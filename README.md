# Learn Live - Lecture Management System

A React-based lecture management system that integrates with a WordPress backend API to provide role-based access to lecture content.

## Features

- **Role-based access control**: Different views for guests, students, and instructors/admins
- **Batch management**: Courses organized by batches with specific lecture schedules
- **Lecture scheduling**: Automatic date calculation for lectures based on batch rules
- **Live lectures**: Integration with YouTube live streams for virtual classes
- **Responsive design**: Built with Tailwind CSS for a modern, mobile-friendly interface

## Technologies Used

- React 19
- Tailwind CSS 4
- Vite 7
- React Hook Form for form management
- React Hot Toast for notifications
- React Icons for UI elements

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

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm run dev
   ```

4. Access the application at [https://lectures.learn.pk:5173](https://lectures.learn.pk:5173)

## Project Structure

- `src/components/` - Reusable UI components
- `src/contexts/` - React context providers for state management
- `src/pages/` - Page components for different user roles
- `src/utils/` - Utility functions and helpers

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
