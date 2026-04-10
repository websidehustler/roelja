import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface AnchoringPhrase {
  time: number;
  text: string;
}

export const generatePersonalizedPhrases = async (focus: string): Promise<AnchoringPhrase[]> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate 5 short, meditative anchoring phrases for a 10-minute meditation focused on "${focus}". 
      Each phrase should be under 10 words. 
      Return them as a JSON array of objects with 'time' (a number between 100 and 500) and 'text' (the phrase).`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              time: { type: Type.NUMBER, description: "Time in seconds (100-500)" },
              text: { type: Type.STRING, description: "The meditative phrase" }
            },
            required: ["time", "text"]
          }
        }
      }
    });

    const text = response.text;
    if (!text) return [];
    return JSON.parse(text);
  } catch (error) {
    console.error("Error generating AI phrases:", error);
    return [];
  }
};

export const generateDailyIntention = async (focus: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate a single, powerful "Daily Intention" sentence for someone who just finished a meditation focused on "${focus}". 
      The tone should be nurturing and wise. Keep it under 15 words.`,
    });

    return response.text || "Carry this peace with you today.";
  } catch (error) {
    console.error("Error generating daily intention:", error);
    return "Carry this peace with you today.";
  }
};
