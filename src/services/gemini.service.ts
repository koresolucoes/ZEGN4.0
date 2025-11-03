import { Injectable } from '@angular/core';
import { GoogleGenAI, Chat, GenerateContentResponse } from '@google/genai';
import { Message } from '../models/patient.model';

@Injectable({
  providedIn: 'root',
})
export class GeminiService {
  private ai: GoogleGenAI;
  private isInitialized = false;
  private chats = new Map<string, Chat>();

  constructor() {
    // FIX: Use `process.env.API_KEY` to get the Gemini API key as per project requirements, replacing `import.meta.env`.
    const apiKey = (process.env as any).API_KEY;
    if (apiKey) {
      this.ai = new GoogleGenAI({ apiKey });
      this.isInitialized = true;
    } else {
      console.error(
        'La clave API de Gemini no está configurada en la variable de entorno API_KEY. Las funciones de IA no funcionarán.'
      );
      // Create a non-functional instance to avoid null checks
      this.ai = new GoogleGenAI({apiKey: 'invalid-key'});
    }
  }

  private getOrCreateChat(patientId: string, history: Message[]): Chat {
    if (this.chats.has(patientId)) {
      return this.chats.get(patientId)!;
    }

    const chat = this.ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction:
          'Eres un asistente clínico servicial y empático. Te comunicas de forma clara y concisa, proporcionando información relacionada con las consultas de los pacientes. No eres un médico y siempre debes aconsejar a los pacientes que consulten a un profesional de la salud para obtener consejo médico.',
      },
      history: history.map((msg) => ({
        role: msg.sender === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }],
      })),
    });

    this.chats.set(patientId, chat);
    return chat;
  }

  async generateResponse(
    patientId: string,
    history: Message[],
    newMessage: string
  ): Promise<string> {
    if (!this.isInitialized) {
      // FIX: Updated the error message to reference the correct environment variable `API_KEY`.
      return 'Error: El servicio de IA no está configurado. Por favor, añade una clave de API de Gemini en la variable de entorno API_KEY.';
    }
    try {
      const chat = this.getOrCreateChat(patientId, history);
      const response: GenerateContentResponse = await chat.sendMessage({
        message: newMessage,
      });
      return response.text;
    } catch (error) {
      console.error('Error generating response from Gemini API:', error);
      return 'Lo siento, he encontrado un error. Por favor, inténtelo de nuevo más tarde.';
    }
  }
}
