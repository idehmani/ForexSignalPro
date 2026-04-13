import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function getForexAnalysis(pairs: string[]): Promise<AnalysisResult> {
  const prompt = `Analyse le marché financier pour les actifs suivants: ${pairs.join(", ")}. 
  Cela inclut le Forex, les matières premières (Or), les cryptomonnaies (BTC) et les indices boursiers (US30, NAS100).
  Utilise tes outils de recherche pour obtenir les dernières informations économiques, les tendances techniques et les nouvelles à fort impact.
  Fournis des signaux de trading précis (Entrée, Stop Loss, Take Profit) avec une justification détaillée.
  Inclus également un aperçu global du marché et les actualités récentes pertinentes.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          signals: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                pair: { type: Type.STRING },
                type: { type: Type.STRING, enum: ["BUY", "SELL"] },
                entry: { type: Type.NUMBER },
                stopLoss: { type: Type.NUMBER },
                takeProfit: { type: Type.NUMBER },
                confidence: { type: Type.NUMBER, description: "Confiance de 0 à 100" },
                rationale: { type: Type.STRING },
                timestamp: { type: Type.STRING }
              },
              required: ["pair", "type", "entry", "stopLoss", "takeProfit", "confidence", "rationale", "timestamp"]
            }
          },
          marketOverview: { type: Type.STRING },
          news: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                impact: { type: Type.STRING, enum: ["High", "Medium", "Low"] },
                summary: { type: Type.STRING }
              },
              required: ["title", "impact", "summary"]
            }
          }
        },
        required: ["signals", "marketOverview", "news"]
      }
    }
  });

  try {
    return JSON.parse(response.text || "{}") as AnalysisResult;
  } catch (e) {
    console.error("Failed to parse Gemini response", e);
    throw new Error("Erreur lors de l'analyse des données du marché.");
  }
}
