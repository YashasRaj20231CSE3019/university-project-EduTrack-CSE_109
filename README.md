
# EduTrack: Smart Curriculum & Attendance

EduTrack is a comprehensive, full-stack education management platform designed to modernize classroom operations. It bridges the gap between teachers and students through AI-powered tools, real-time communication, and secure attendance tracking.

## 🌟 Key Modules

### 👨‍🏫 Teacher Suite
- **Dynamic Dashboard:** Real-time overview of class attendance, upcoming activities, and student performance metrics.
- **AI Lesson Planner:** Leverage Google Gemini AI to generate creative, structured, and objective-driven lesson plans in seconds.
- **Smart Attendance:** Generate time-sensitive, secure QR codes for touchless and fraud-proof attendance marking.
- **Classroom Management:** View detailed student profiles, behavioral notes, and academic progress.

### 🎓 Student Portal
- **Personalized Experience:** Track individual schedules, pending assignments, and graded performance.
- **Real-time Notifications:** Stay updated with instant alerts for new messages from teachers and school-wide announcements.
- **Attendance Check-in:** Scan teacher-generated QR codes to mark presence instantly.

### 💬 Real-time Communication
- **Private Messaging:** Secure, instant chat between teachers and students with read receipts and unread indicators.
- **Broadcast Announcements:** Teachers can send urgent updates to the entire class or specific roles.
- **Presence Tracking:** See who is currently online with live status indicators.

## 🛠️ Tech Stack

- **Frontend:** React 18, Vite, Tailwind CSS, Framer Motion, Lucide Icons, Recharts.
- **Backend:** Node.js, Express, Socket.io (Real-time), JWT (Security).
- **Database:** SQLite (via `better-sqlite3`) for persistent, reliable data storage.
- **AI Integration:** Google Gemini API (`@google/genai`).

---

## 💻 Local Setup & Installation

Follow these steps to get EduTrack running on your local machine. The setup process is identical for both macOS and Windows.

### 📋 Prerequisites
- **Node.js:** version 18.0.0 or higher ([Download here](https://nodejs.org/))
- **npm:** usually comes bundled with Node.js.
- **Git:** for cloning the repository ([Download here](https://git-scm.com/))

### 1. Clone the Repository
Open your terminal (macOS/Linux) or Command Prompt/PowerShell (Windows):
```bash
git clone <your-repo-url>
cd edutrack
```

### 2. Install Dependencies
Install all required npm packages for both the frontend and backend:
```bash
npm install
```

### 3. Environment Configuration
Create a file named `.env` in the root directory of the project. You will need to add your Google Gemini API key and a secret string for JWT authentication.

```env
# Your Google Gemini API Key (Get one at https://aistudio.google.com/)
GEMINI_API_KEY=your_google_gemini_api_key

# A secure random string for signing JWT tokens (e.g., "my_super_secret_key_123")
JWT_SECRET=a_secure_random_string_for_tokens
```

### 4. Running the Application

The application uses a single command to start both the Vite frontend and the Express backend concurrently.

#### **🍎 macOS / Linux**
1. Open your Terminal application.
2. Navigate to the project directory if you haven't already.
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000) in your web browser.

#### **🪟 Windows**
1. Open **PowerShell** or **Command Prompt**.
2. Navigate to the project directory if you haven't already.
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000) in your web browser.

*Note: If you encounter any permission issues on Windows, try running PowerShell or Command Prompt as Administrator.*

---

## 🔑 Demo Accounts

To test the application, you can use the demo accounts provided in the `CREDENTIALS.md` or `credentials.csv` file. 

**Teacher Example:**
- Email: `sharma@school.edu`
- Password: (any password will work in demo mode)

**Student Example:**
- Email: `aarav.sharma1@school.edu`
- Password: (any password will work in demo mode)

---

## 📂 Project Structure

- **`/src`**: React frontend source code.
- **`/components`**: Reusable UI components (Dashboard, Chat, Attendance, etc.).
- **`/services`**: API service layer and AI integration logic.
- **`server.ts`**: Express & Socket.io server implementation.
- **`db.ts`**: SQLite database schema and seeding logic.
- **`types.ts`**: Global TypeScript definitions.
- **`constants.ts`**: Mock data generation and constants.

## 🛡️ Security & Reliability
- **JWT Authentication:** Secure session management and QR code validation.
- **Socket.io Rooms:** Isolated communication channels for private messaging.
- **SQLite Persistence:** All chat history, attendance records, and lesson plans are saved permanently in `edutrack.db`.

## 🤝 Contributing
Contributions are welcome! Please feel free to submit a Pull Request.

---
*Developed with ❤️ for the future of education.*
