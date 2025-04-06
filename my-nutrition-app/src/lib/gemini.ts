import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || "");

export const queryGemini = async (nutritionText: string, medicalConditions: string) => {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
      ],
    });

    const prompt = `
    ROLE: You are a nutrition expert analyzing food labels for people with specific health conditions.

    TASK: Analyze this nutrition label for someone with: ${medicalConditions}.

    NUTRITION LABEL TEXT:
    ${nutritionText}

    REQUIRED OUTPUT FORMAT (JSON):
    {
      "riskAssessment": "low/medium/high",
      "harmfulComponents": [{
        "name": "component name",
        "reason": "why it's problematic",
        "recommendation": "what to do about it",
        "alternative": "suggested alternative (optional)"
      }],
      "generalAdvice": "personalized dietary advice"
    }

    INSTRUCTIONS:
    1. Be concise but thorough
    2. Only flag ingredients that are actually problematic
    3. Provide practical alternatives
    4. If label is unreadable, say so
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    
    if (!response.text) {
      throw new Error("Empty response from Gemini");
    }

    try {
      const jsonMatch = response.text().match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      return response.text();
    } catch (parseError) {
      console.warn("Failed to parse JSON, returning raw text");
      return response.text();
    }
  } catch (error) {
    console.error("Gemini API error:", error);
    throw error;
  }
};