
import { GoogleGenAI, Type } from "@google/genai";
import { MovieResult } from "../types";

export const identifyMovie = async (input: string, imageData?: string): Promise<MovieResult> => {
  // Always initialize GoogleGenAI with { apiKey: process.env.API_KEY } directly inside the function
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const systemInstruction = `
    أنت خبير سينمائي عالمي ومحقق في قواعد بيانات الأفلام والمسلسلات.
    مهمتك هي التعرف على اسم العمل الفني بدقة متناهية من خلال الوصف أو الصورة.
    
    إذا قدم المستخدم وصفاً:
    - ابحث عن المشاهد المحددة، الحوارات، أو أسماء الممثلين.
    - استخدم Google Search للتحقق من النتائج.
    
    إذا قدم المستخدم صورة:
    - حلل الوجوه، الإضاءة، الملابس، والديكور.
    
    يجب أن تكون الإجابة بصيغة JSON دقيقة جداً وباللغة العربية.
  `;

  const prompt = `التعرف على هذا العمل الفني: "${input || "لقطة شاشة مرفقة"}"`;
  
  const parts: any[] = [{ text: prompt }];
  if (imageData) {
    parts.push({
      inlineData: {
        mimeType: "image/jpeg",
        data: imageData.split(',')[1]
      }
    });
  }

  try {
    const response = await ai.models.generateContent({
      // Use gemini-3-pro-preview for complex reasoning and search-based movie identification
      model: "gemini-3-pro-preview",
      contents: { parts },
      config: {
        systemInstruction,
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: "اسم الفيلم أو المسلسل" },
            year: { type: Type.STRING, description: "سنة الإصدار" },
            genre: { type: Type.STRING, description: "التصنيف الفني" },
            description: { type: Type.STRING, description: "تفاصيل المطابقة ولماذا هذا هو العمل المقصود" },
            confidence: { type: Type.NUMBER, description: "نسبة الثقة من 0 لـ 100" },
            isFound: { type: Type.BOOLEAN },
          },
          required: ["title", "description", "confidence", "isFound"]
        }
      },
    });

    // The text output is obtained via the .text property
    const text = response.text || "{}";
    const data = JSON.parse(text);
    
    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((chunk: any) => ({
      title: chunk.web?.title || "مصدر خارجي",
      uri: chunk.web?.uri || ""
    })).filter((s: any) => s.uri) || [];

    return {
      ...data,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
      sources: sources,
      imageThumbnail: imageData || null
    };
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("حدث خطأ أثناء محاولة التعرف على الفيلم. يرجى المحاولة مرة أخرى.");
  }
};
