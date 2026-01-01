
import { GoogleGenAI } from "@google/genai";

// Always use named parameter and direct process.env.API_KEY reference for initialization.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getBusinessInsights = async (data: any) => {
  try {
    const prompt = `
      Analisislah data bisnis berikut dan berikan wawasan (insights) yang ringkas dan bermanfaat bagi pemilik bisnis dalam Bahasa Indonesia.
      Sertakan saran untuk meningkatkan profit atau efisiensi stok.

      DATA BISNIS:
      ${JSON.stringify(data, null, 2)}

      Format output harus dalam Markdown yang rapi dengan poin-poin.
    `;

    // Using gemini-3-flash-preview for basic text tasks like summarization
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    // Directly access the text property as per GenerateContentResponse definition
    return response.text || "Tidak dapat menghasilkan wawasan saat ini.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Terjadi kesalahan saat menghubungi asisten AI.";
  }
};
