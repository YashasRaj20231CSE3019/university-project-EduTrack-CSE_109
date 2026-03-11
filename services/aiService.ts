
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export const explainLesson = async (lessonTitle: string, description: string, objectives: string[]) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `As an educational assistant, explain this lesson to a student in a simple, engaging way. 
      Lesson Title: ${lessonTitle}
      Description: ${description}
      Learning Objectives: ${objectives.join(', ')}
      
      Provide a summary, why it's important, and a fun fact related to the topic. Use markdown formatting.`,
    });
    return response.text;
  } catch (error) {
    console.error("AI Explanation Error:", error);
    return "I'm sorry, I couldn't generate an explanation right now. Please try again later.";
  }
};

export const explainCurriculum = async (subject: string, grade: string, query: string) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `As an educational assistant, help a student understand their curriculum for ${subject} in grade ${grade}.
      The student's question is: "${query}"
      
      Provide a clear, detailed explanation that helps them understand the topic or how it fits into their overall syllabus. Use markdown formatting and a supportive, encouraging tone.`,
    });
    return response.text;
  } catch (error) {
    console.error("AI Curriculum Error:", error);
    return "I'm sorry, I couldn't generate an explanation for that part of the curriculum. Please try again later.";
  }
};

export const generateWeeklyReport = async (stats: any, activities: any[]) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `As a school administrator assistant, generate a professional weekly classroom report based on these statistics:
      Attendance Rate: ${stats.attendanceRate}%
      Total Students: ${stats.studentCount}
      Activities Completed: ${activities.filter(a => a.status === 'completed').length}
      Upcoming Activities: ${activities.filter(a => a.status === 'planned').length}
      
      Provide a summary of performance, highlights of the week, and areas for improvement. Use markdown formatting.`,
    });
    return response.text;
  } catch (error) {
    console.error("AI Report Error:", error);
    return "Failed to generate report. Please try again later.";
  }
};
