import { GoogleGenAI, Content, Part } from "@google/genai";
import { GEMINI_MODEL, SYSTEM_INSTRUCTION } from "../constants";
import { Message, Attachment } from "../types";

// Initialize the API client
// Ideally, we would re-initialize this if we needed to handle dynamic keys, 
// but for this structure, we assume process.env.API_KEY is available.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Sends a message to Gemini, maintaining a chat history context if possible, 
 * or using single-turn generation with history appended for simplicity in this stateless service.
 */
export const sendMessageToGemini = async (
  history: Message[],
  newMessage: string,
  attachment?: Attachment
): Promise<string> => {
  try {
    // Construct the history for the model
    // We filter out the very last message if it's the one we are currently sending (though the UI usually handles this separately)
    // For this service, we assume 'history' contains previous messages, and 'newMessage' is the current user input.

    const contents: Content[] = history.map((msg) => {
      const parts: Part[] = [];
      if (msg.attachment) {
        parts.push({
          inlineData: {
            mimeType: msg.attachment.mimeType,
            data: msg.attachment.data,
          },
        });
      }
      parts.push({ text: msg.text });

      return {
        role: msg.role,
        parts: parts,
      };
    });

    // Add the new message
    const currentParts: Part[] = [];
    if (attachment) {
      currentParts.push({
        inlineData: {
          mimeType: attachment.mimeType,
          data: attachment.data,
        },
      });
    }
    currentParts.push({ text: newMessage });
    
    // We add the current user message to the contents list for the API call
    contents.push({
      role: 'user',
      parts: currentParts,
    });

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: contents,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        // Optional safety settings could go here
      }
    });

    return response.text || "I apologize, but I couldn't generate a response at this moment.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to connect to MediMate service. Please try again.");
  }
};
