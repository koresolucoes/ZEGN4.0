
import { Injectable } from '@angular/core';
import { GoogleGenAI, Chat, GenerateContentResponse, Part } from '@google/genai';
import { Message } from '../models/patient.model';

@Injectable({
  providedIn: 'root',
})
export class GeminiService {
  private ai: GoogleGenAI;
  private chats = new Map<number, Chat>();

  constructor() {
    // IMPORTANT: The API key is sourced from environment variables.
    // Do not hardcode or expose it in the frontend.
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      throw new Error("API_KEY environment variable not set.");
    }
    this.ai = new GoogleGenAI({ apiKey });
  }

  private getOrCreateChat(patientId: number, history: Message[]): Chat {
    if (this.chats.has(patientId)) {
      return this.chats.get(patientId)!;
    }
    
    const chat = this.ai.chats.create({
        model: 'gemini-2.5-flash',
        config: {
            systemInstruction: 'Eres un asistente clínico servicial y empático. Te comunicas de forma clara y concisa, proporcionando información relacionada con las consultas de los pacientes. No eres un médico y siempre debes aconsejar a los pacientes que consulten a un profesional de la salud para obtener consejo médico.',
        },
        // The API expects a specific format for history
        history: history.map(msg => ({
            role: msg.sender === 'user' ? 'user' : 'model',
            parts: [{ text: msg.text }]
        }))
    });

    this.chats.set(patientId, chat);
    return chat;
  }

  async generateResponse(patientId: number, history: Message[], newMessage: string): Promise<string> {
    try {
      const chat = this.getOrCreateChat(patientId, history);
      const response: GenerateContentResponse = await chat.sendMessage({ message: newMessage });
      return response.text;
    } catch (error) {
      console.error('Error generating response from Gemini API:', error);
      return 'Lo siento, he encontrado un error. Por favor, inténtelo de nuevo más tarde.';
    }
  }
}