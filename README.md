
# EduTrack: Smart Curriculum & Attendance

This application is set up to run in an isolated Python virtual environment for local development and testing.

## Prerequisites

- Python 3.8 or higher
- Browser (Chrome/Edge/Firefox)

## Setup and Run

To set up the environment and start the application:

1. **Create the Virtual Environment:**
   ```bash
   python -m venv venv
   ```

2. **Activate the Environment:**
   - **Windows:**
     ```bash
     .\venv\Scripts\activate
     ```
   - **macOS/Linux:**
     ```bash
     source venv/bin/activate
     ```

3. **Install Dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Start the Server:**
   ```bash
   python server.py
   ```

5. **Access the App:**
   Open [http://localhost:8000](http://localhost:8000) in your browser.

## Features

- **Teacher View:** Manage attendance, plan activities using Gemini AI, and track student progress.
- **Student View:** View schedule, track assignment status, and monitor grades.
- **AI Integration:** Lesson planning and activity suggestions powered by Google Gemini.
- **Responsive UI:** Built with React and Tailwind CSS for a seamless experience across devices.
