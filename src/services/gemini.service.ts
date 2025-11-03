import { Injectable } from '@angular/core';
import { GoogleGenAI, Chat, GenerateContentResponse } from '@google/genai';
import { Message } from '../models/patient.model';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class GeminiService {
  private ai: GoogleGenAI | null = null;
  private isInitialized = false;
  private chats = new Map<number, Chat>();

  constructor() {
    const apiKey = environment.gemini.apiKey;
    if (apiKey && apiKey !== 'AIzaSyBfYfyyX0PixNLYheBZj7jmS1GCAFhsg20') {
      this.ai = new GoogleGenAI({ apiKey });
      this.isInitialized = true;
    } else {
      console.error(
        'La clave API de Gemini no está configurada en src/environments/environment.ts. Las funciones de IA no funcionarán.'
      );
    }
  }

  private getOrCreateChat(patientId: number, history: Message[]): Chat {
    if (!this.ai) {
      // This case should be handled by the public method, but as a safeguard:
      throw new Error('El servicio Gemini no está inicializado.');
    }

    if (this.chats.has(patientId)) {
      return this.chats.get(patientId)!;
    }

    const chat = this.ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction:
          'Eres un asistente clínico servicial y empático. Te comunicas de forma clara y concisa, proporcionando información relacionada con las consultas de los pacientes. No eres un médico y siempre debes aconsejar a los pacientes que consulten a un profesional de la salud para obtener consejo médico.',
      },
      // The API expects a specific format for history
      history: history.map((msg) => ({
        role: msg.sender === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }],
      })),
    });

    this.chats.set(patientId, chat);
    return chat;
  }

  async generateResponse(
    patientId: number,
    history: Message[],
    newMessage: string
  ): Promise<string> {
    if (!this.isInitialized) {
      return 'Error: El servicio de IA no está configurado. Por favor, añade una clave de API de Gemini en el archivo de entorno.';
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
