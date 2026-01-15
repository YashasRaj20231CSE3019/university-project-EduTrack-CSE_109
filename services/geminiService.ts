import { GoogleGenAI, Type } from "@google/genai";
import { ActivitySuggestion } from "../types";

// Always initialize the client with the environment variable directly.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateActivityIdeas = async (grade: string, subject: string, topic: string): Promise<ActivitySuggestion[]> => {
  // Use the ai.models.generateContent method as per current SDK patterns.
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Generate 3 engaging curriculum activities for Grade ${grade} in ${subject} specifically about the topic: "${topic}".`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            learningObjectives: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            materials: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            duration: { type: Type.STRING }
          },
          required: ["title", "description", "learningObjectives", "materials", "duration"]
        }
      }
    }
  });

  try {
    // response.text is a property, accessing it directly.
    const text = response.text;
    if (!text) return [];
    return JSON.parse(text.trim());
  } catch (error) {
    console.error("Failed to parse Gemini response", error);
    return [];
  }
};