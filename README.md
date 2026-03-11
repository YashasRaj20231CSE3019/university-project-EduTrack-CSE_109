
# EduTrack: Smart Curriculum & Attendance

EduTrack is a modern, full-stack education management system designed to streamline classroom operations. It features AI-powered lesson planning, secure QR-based attendance tracking, and persistent data storage using SQLite.

## 🚀 Features

- **Teacher Dashboard:** Comprehensive overview of class attendance, upcoming activities, and student performance.
- **Student Dashboard:** Personalized view for students to track their schedule, assignments, and academic progress.
- **AI Lesson Planner:** Generate creative and structured lesson plans using Google Gemini AI integration.
- **QR Attendance:** Secure, time-sensitive QR code system for touchless attendance marking.
- **Persistent Storage:** Full SQLite database integration ensures all data is saved permanently.
- **Responsive Design:** Fully optimized for mobile, tablet, and desktop devices using Tailwind CSS.

## 🛠️ Tech Stack

- **Frontend:** React 18, Vite, Tailwind CSS, Lucide Icons, Recharts.
- **Backend:** Node.js, Express, JWT (for secure QR tokens).
- **Database:** SQLite (via `better-sqlite3`).
- **AI:** Google Gemini API (`@google/genai`).

## 📋 Prerequisites

- **Node.js:** version 18.0.0 or higher.
- **npm:** usually comes with Node.js.

## ⚙️ Setup and Installation

### 1. Clone and Install Dependencies

Open your terminal (Mac/Linux) or Command Prompt/PowerShell (Windows) and run:

```bash
# Install all required packages
npm install
```

### 2. Environment Configuration

Create a `.env` file in the root directory and add your Gemini API key:

```env
GEMINI_API_KEY=your_api_key_here
JWT_SECRET=your_random_secret_string
```

### 3. Run the Application

#### **macOS / Linux**
```bash
# Start the development server
npm run dev
```

#### **Windows**
```bash
# Start the development server
npm run dev
```

The application will be accessible at [http://localhost:3000](http://localhost:3000).

## 📂 Project Structure

- `/src`: React frontend components and logic.
- `/services`: API and AI service integrations.
- `server.ts`: Express server and API endpoints.
- `db.ts`: SQLite database initialization and seeding.
- `constants.tsx`: Initial mock data and system constants.

## 🛡️ Security

- QR tokens are signed with JWT and expire after 30 seconds to prevent replay attacks.
- Sensitive API keys are managed via environment variables.
